(function (jQuery){
    "use strict";
    
    // Like System Implementation
    class LikeSystem {
        constructor() {
            this.likesData = this.loadLikesData();
            this.currentUserId = this.getCurrentUserId();
            this.init();
        }
        
        // Generate or retrieve a unique user ID
        getCurrentUserId() {
            let userId = localStorage.getItem('nerflix_user_id');
            if (!userId) {
                userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('nerflix_user_id', userId);
            }
            return userId;
        }
        
        // Load likes data from localStorage
        loadLikesData() {
            const data = localStorage.getItem('nerflix_likes_data');
            return data ? JSON.parse(data) : {};
        }
        
        // Save likes data to localStorage
        saveLikesData() {
            localStorage.setItem('nerflix_likes_data', JSON.stringify(this.likesData));
        }
        
        // Get like count for a specific item
        getLikeCount(itemId) {
            if (!this.likesData[itemId]) {
                return 0;
            }
            return Object.keys(this.likesData[itemId]).length;
        }
        
        // Check if current user has liked an item
        hasUserLiked(itemId) {
            if (!this.likesData[itemId]) {
                return false;
            }
            return this.likesData[itemId][this.currentUserId] === true;
        }
        
        // Toggle like for an item
        toggleLike(itemId) {
            if (!this.likesData[itemId]) {
                this.likesData[itemId] = {};
            }
            
            const wasLiked = this.hasUserLiked(itemId);
            
            if (wasLiked) {
                // Unlike
                delete this.likesData[itemId][this.currentUserId];
                this.showNotification('Removed from favorites', 'info');
            } else {
                // Like
                this.likesData[itemId][this.currentUserId] = true;
                this.showNotification('Added to favorites!', 'success');
            }
            
            this.saveLikesData();
            this.updateItemUI(itemId);
        }
        
        // Show notification to user (minimal styling)
        showNotification(message, type = 'info') {
            // Remove existing notifications
            const existingNotifications = document.querySelectorAll('.like-notification');
            existingNotifications.forEach(notification => notification.remove());
            
            const notification = document.createElement('div');
            notification.className = 'like-notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #e50914;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                font-family: Arial, sans-serif;
                font-size: 14px;
            `;
            
            document.body.appendChild(notification);
            
            // Show notification
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Hide notification after 3 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
        
        // Update the UI for a specific item (invisible to user)
        updateItemUI(itemId) {
            const item = document.querySelector(`[data-item-id="${itemId}"]`);
            if (!item) return;
            
            const likeCount = this.getLikeCount(itemId);
            const isLiked = this.hasUserLiked(itemId);
            
            // Update count box if it exists
            const countBoxes = item.querySelectorAll('.count-box');
            countBoxes.forEach(box => {
                const newText = likeCount > 0 ? likeCount + '+' : '0+';
                if (box.textContent !== newText) {
                    box.textContent = newText;
                }
            });
            
            // Store liked state in data attribute (invisible to user)
            if (isLiked) {
                item.setAttribute('data-liked', 'true');
            } else {
                item.removeAttribute('data-liked');
            }
        }
        
        // Update all items in the UI
        updateAllItemsUI() {
            const allItems = document.querySelectorAll('[data-item-id]');
            allItems.forEach(item => {
                const itemId = item.getAttribute('data-item-id');
                this.updateItemUI(itemId);
            });
        }
        
        // Automatically add data-item-id to all items (invisible to user)
        setupAllItems() {
            const allSlideItems = document.querySelectorAll('.slide-item');
            let itemCounter = 1;
            
            allSlideItems.forEach(item => {
                // Generate unique item ID if not already present
                if (!item.hasAttribute('data-item-id')) {
                    const titleElement = item.querySelector('.iq-title a');
                    let title = titleElement ? titleElement.textContent.trim() : `item-${itemCounter}`;
                    title = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    const itemId = `${title}-${itemCounter}`;
                    item.setAttribute('data-item-id', itemId);
                }
                
                itemCounter++;
            });
        }
        
        // Initialize the like system
        init() {
            this.setupAllItems();
            this.setupEventListeners();
            this.updateAllItemsUI();
            this.handleDynamicContent();
            
            // Log initialization
            console.log('Like System initialized successfully (invisible mode)');
            console.log('Current user ID:', this.currentUserId);
            console.log('Total items with likes:', Object.keys(this.likesData).length);
        }
        
        // Setup event listeners for like buttons (using original heart icons)
        setupEventListeners() {
            document.addEventListener('click', (e) => {
                // Check if clicked on a heart icon
                if (e.target.classList.contains('fa-heart')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const heartElement = e.target;
                    const itemContainer = heartElement.closest('[data-item-id]');
                    
                    if (itemContainer) {
                        const itemId = itemContainer.getAttribute('data-item-id');
                        this.toggleLike(itemId);
                    }
                }
            });
        }
        
        // Handle dynamic content loading
        handleDynamicContent() {
            const observer = new MutationObserver((mutations) => {
                let shouldRefresh = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.classList && node.classList.contains('slide-item')) {
                                    shouldRefresh = true;
                                } else if (node.querySelector && node.querySelector('.slide-item')) {
                                    shouldRefresh = true;
                                }
                            }
                        });
                    }
                });
                
                if (shouldRefresh) {
                    setTimeout(() => {
                        this.refreshAllItems();
                    }, 100);
                }
            });
            
            // Start observing
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // Method to refresh all items
        refreshAllItems() {
            this.setupAllItems();
            this.updateAllItemsUI();
        }
        
        // Export likes data
        exportLikesData() {
            const dataStr = JSON.stringify(this.likesData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'nerflix-likes-backup.json';
            link.click();
            
            URL.revokeObjectURL(url);
            this.showNotification('Likes data exported successfully!', 'success');
        }
        
        // Get statistics about likes
        getLikesStats() {
            const totalItems = Object.keys(this.likesData).length;
            const totalLikes = Object.values(this.likesData).reduce((sum, item) => sum + Object.keys(item).length, 0);
            const userLikes = Object.values(this.likesData).filter(item => this.currentUserId in item).length;
            
            return {
                totalItems,
                totalLikes,
                userLikes,
                averageLikes: totalItems > 0 ? (totalLikes / totalItems).toFixed(1) : 0
            };
        }
        
        // Show likes statistics
        showLikesStats() {
            const stats = this.getLikesStats();
            const message = `Total items: ${stats.totalItems} | Total likes: ${stats.totalLikes} | Your likes: ${stats.userLikes}`;
            this.showNotification(message, 'info');
        }
        
        // Clear all likes data
        clearAllLikes() {
            if (confirm('Are you sure you want to clear all likes data? This action cannot be undone.')) {
                this.likesData = {};
                this.saveLikesData();
                this.updateAllItemsUI();
                this.showNotification('All likes data cleared', 'info');
            }
        }
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + L to show stats
                if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                    e.preventDefault();
                    this.showLikesStats();
                }
                
                // Ctrl/Cmd + E to export data
                if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                    e.preventDefault();
                    this.exportLikesData();
                }
            });
        }
        
        // Initialize with keyboard shortcuts
        init() {
            this.setupAllItems();
            this.setupEventListeners();
            this.updateAllItemsUI();
            this.handleDynamicContent();
            this.setupKeyboardShortcuts();
            
            // Log initialization
            console.log('Like System initialized successfully (invisible mode)');
            console.log('Current user ID:', this.currentUserId);
            console.log('Total items with likes:', Object.keys(this.likesData).length);
        }
    }
    
    // Initialize the like system
    const likeSystem = new LikeSystem();
    
    // Make like system globally accessible
    window.likeSystem = likeSystem;
    
    jQuery(document).ready(function(){
        function activaTav(pill){
            jQuery(pill).addClass('active show');
        }

        // sticky header anmation and height 
        function headerHeight(){
            var height = jQuery("#main-header").height();
            jQuery('.iq-height').css('height',height + 'px');
        }

        jQuery(function(){
            var header = jQuery("#main-header"),
            yOffset = 0,
            triggerPoint = 80;
            headerHeight();
            jQuery(window).resize(headerHeight);
            jQuery(window).in('scroll', function() {
                yOffset = jQuery(window).scrollTop();

                if(yOffset >= triggerPoint){
                    header.addClass("menu-sticky animated slideDown");
                } else {
                    header.removeClass("menu-sticky animated slideDown");
                }
            });
        });

        // header menu dropdown 
        jQuery('[data-toggle=more-toggle]').on('click', function () {
            jQuery(this).next().toggleClass('show');
        });

        jQuery(document).on('click', function(e){
            let myTargetElement = e.target;
            let selector, mainElement;
            if(jQuery(myTargetElement).hasClass('search-toggle') || jQuery(myTargetElement).parent().hasClass('search-toggle') || jQuery(myTargetElement).parent().parent().hasClass('search-toggle') ){
                if(jQuery(myTargetElement).hasClass('search-toggle')) {
                    selector = jQuery(myTargetElement).parent();
                    mainElement = jQuery(myTargetElement);
                } else if (jQuery(myTargetElement).parent().hasClass('search-toggle')){
                    selector = jQuery(myTargetElement).parent().parent();
                    mainElement = jQuery(myTargetElement).parent();
                }else if (jQuery(myTargetElement).parent().parent().hasClass('search-toggle')){
                    selector = jQuery(myTargetElement).parent().parent().parent();
                    mainElement = jQuery(myTargetElement).parent().parent();
                }
                if(!mainElement.hasClass('active') && jQuery('.navbar-list li').find('.active')){
                    jQuery('.navbar-right li').removeClass('.iq-show');
                    jQuery('.navbar-right li .search-toggle').removeClass('active');
                }

                selector.toggleClass('iq-show');
                mainElement.toggleClass('active');
                e.preventDefault();
            } else if (jQuery(myTargetElement).is('search-input')){} else {
                jQuery('.navbar-right li').removeClass('.iq-show');
                jQuery('.navbar-right li .search-toggle').removeClass('active');
            }
        });
        jQuery(document).on('click', function(event){
            var $trigger = jQuery(".main-header .navbar");
            if($trigger !== event.target && !$trigger.has(event.target).length){
                jQuery(".main-header .navbar-collapse").collapse('hide');
                jQuery('body').removeClass('nav-open');
            }
        });
        jQuery('.c-toggler').on("click", function(){
            jQuery('body').addClass('nav-open');
        });


        $('#home-slider').slick({
            autoplay : false,
            speed : 800,
            lazyload : 'progressive',
            arrows : true,
            dots : false,
            prevArrow : '<div class="slick-nav prev-arrow"><i class="fa fa-chevron-right"></i></div>',
            nextArrow : '<div class="slick-nav next-arrow"><i class="fa fa-chevron-left"></i></div>',
            responsive : [
                {
                    breakpoint : 992,
                    settings : {
                        dots : true,
                        arrows : false,
                    }
                }
            ]
        }).slickAnimation();
        $(".slick-nav").on("click touch", function (e){
            e.preventDefault();

            var arrow = $(this);

            if(!arrow.hasClass('animate')){
                arrow.addClass('animate');
                setTimeout(() => {
                    arrow.removeClass('animate');
                }, 1600);
            }
        });

        jQuery('.favorites-slider').slick({
            dots:false,
            arrow : true,
            infinite : true,
            speed : 300,
            autoplay : false,
            slidesToShow : 4,
            slidesToScroll :1,
            nextArrow: '<a href="#" class="slick-arrow slick-next"><i class="fa fa-chevron-right"></i></a>',
            prevArrow: '<a href="#" class="slick-arrow slick-prev"><i class="fa fa-chevron-left"></i></a>',
            responsive : [
                {
                    breakpoint:1200,
                    settings : {
                        slidesToShow : 3,
                        slidesToScroll : 1,
                        infinite : true,
                        dots : true
                    }
                },
                {
                    breakpoint:768,
                    settings : {
                        slidesToShow : 2,
                        slidesToScroll : 1
                    }
                },
                {
                    breakpoint:480,
                    settings : {
                        slidesToShow : 1,
                        slidesToScroll : 1
                    }
                },
            ]
        });

        jQuery('#top-ten-slider').slick({
            slidesToScroll : 1,
            slidesToShow : 1,
            arrows : false,
            fade : true,
            asNavFor : '#top-ten-slider-nav',
            responsive : [
                {
                    breakpoint : 992,
                    settings : {
                        asNavFor : false,
                        arrows : true ,
                        nextArrow : '<button class="NextArrow"><i class="fa fa-angle-right"></i></button>',
                        prevArrow : '<button class="PrevArrow"><i class="fa fa-angle-left"></i></button>',
                    }
                }
            ]
        });
        jQuery('#top-ten-slider-nav').slick({
            slidesToShow : 3,
            slidesToScroll : 1,
            asNavFor : '#top-ten-slider',
            dots: false,
            arrows : true,
            infinite : true,
            vertical : true,
            verticalSwiping : true,
            centerMode :false,
            nextArrow : '<button class="NextArrow"><i class="fa fa-angle-down"></i></button>',
            prevArrow : '<button class="PrevArrow"><i class="fa fa-angle-up"></i></button>',
            focusOnSelect : true,
            responsive : [
                {
                    breakpoint : 1200,
                    settings : {
                        slidesToShow : 2,
                    }
                },
                {
                    breakpoint : 600,
                    settings : {
                        asNavFor : false,
                    }
                },
            ]
        });
        

        jQuery("#trending-slider").slick({
            slidesToShow : 1,
            slidesToScroll : 1,
            arrows : false,
            fade : true,
            draggable : false,
            asNavFor : "#trending-slider-nav",
        });

        jQuery("#trending-slider-nav").slick({
            slidesToShow : 5,
            slidesToScroll : 1,
            asNavFor : "#trending-slider",
            dots : false ,
            arrows : true ,
            nextArrow: '<a href="#" class="slick-arrow slick-next"><i class="fa fa-chevron-right"></i></a>',
            prevArrow: '<a href="#" class="slick-arrow slick-prev"><i class="fa fa-chevron-left"></i></a>',
            infinite : true,
            centerMode : true,
            centerPadding : 0,
            focusOnSelect : true,
            responsive : [
                {
                    breakpoint : 1024,
                    settings : {
                        slidesToShow : 2,
                        slidesToScroll : 1,
                    }
                },
                {
                    breakpoint : 600,
                    settings : {
                        slidesToShow : 1,
                        slidesToScroll : 1,
                    }
                }
            ]
        });

        jQuery('.episodes-slider1').owlCarousel({
            loop : true,
            margin : 20,
            nav: true,
            navText : ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i> "],
            dots : false,
            responsive : {
                0:{
                    items : 1
                },
                600: {
                    items : 1
                },
                1000 : {
                    items : 4
                }
            }
        });


        jQuery('.trending-content').each(function(){
            var highestBox = 0;
            jQuery('.tab-pane', this).each(function(){
                if(jQuery(this).height() > highestBox){
                    highestBox = jQuery(this).height();
                }
            });
            jQuery('.tab-pane', this).height(highestBox);
        });

                if(jQuery('select').hasClass('season-select')){
            jQuery('select').select2({
                theme : 'bootstrap4',
                allowClear : false,
                width : 'resolve'
            });
        }
        
        // Heart functionality for like/unlike
        jQuery(document).on('click', '.fa-heart, .heart-icon', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            let heartIcon, heartElement, countBox;
            
            // Check if this is the new heart icon structure
            if (jQuery(this).hasClass('fa-heart') && jQuery(this).closest('.heart-icon').length) {
                // New structure: .heart-icon
                heartIcon = jQuery(this).closest('.heart-icon');
                heartElement = jQuery(this);
                let currentCount = 20; // Default count for notification badge
                
                if (heartIcon.hasClass('liked')) {
                    // Unlike - return to default state
                    heartIcon.removeClass('liked');
                    currentCount = Math.max(0, currentCount - 1);
                } else {
                    // Like - change to liked state
                    heartIcon.addClass('liked');
                    currentCount += 1;
                }
                
                // Update notification badge
                const notificationBadge = heartIcon.find('.notification-badge');
                if (notificationBadge.length) {
                    notificationBadge.text(currentCount + '+');
                }
            } else if (jQuery(this).hasClass('fa-heart')) {
                // Old structure: .fa-heart with count-box
                heartElement = jQuery(this);
                countBox = heartElement.closest('li').find('.count-box');
                
                if (countBox.length) {
                    let currentCount = parseInt(countBox.text().replace('+', ''));
                    
                                    if (heartElement.hasClass('liked')) {
                    // Unlike - return to default state
                    heartElement.removeClass('liked');
                    heartElement.closest('span').removeClass('liked');
                    currentCount = Math.max(0, currentCount - 1);
                } else {
                    // Like - change to liked state
                    heartElement.addClass('liked');
                    heartElement.closest('span').addClass('liked');
                    currentCount += 1;
                }
                    
                    // Update count box with animation
                    countBox.text(currentCount + '+').addClass('updated');
                    setTimeout(() => {
                        countBox.removeClass('updated');
                    }, 500);
                }
            }
        });
        
    });

    // Video Gallery Functionality
    var currentVideoId = 'dQw4w9WgXcQ';
    
    // Video data structure with sidebar information
    const videoData = {
        // Main Slider Videos
        'tmeOjFno6Do': {
            title: 'Avengers: Age of Ultron',
            rating: 7.3,
            stars: 4,
            genres: ['Action', 'Adventure', 'Sci-Fi'],
            tags: ['Superhero', 'Marvel', 'Comic Book'],
            description: 'When Tony Stark and Bruce Banner try to jump-start a dormant peacekeeping program called Ultron, things go horribly wrong and it\'s up to Earth\'s mightiest heroes to stop the villainous Ultron from enacting his terrible plan.',
            age: '12+',
            duration: '2h 21min',
            year: '2015'
        },
        'FLzfXQSPBOg': {
            title: 'Frozen',
            rating: 7.4,
            stars: 4,
            genres: ['Animation', 'Adventure', 'Comedy'],
            tags: ['Disney', 'Musical', 'Family'],
            description: 'When the newly crowned Queen Elsa accidentally uses her power to turn things into ice to curse her home in infinite winter, her sister Anna teams up with a mountain man, his playful reindeer, and a snowman to change the weather condition.',
            age: '13+',
            duration: '1h 42min',
            year: '2013'
        },
        'k10ETZ41q5o': {
            title: 'The Conjuring',
            rating: 7.5,
            stars: 4,
            genres: ['Horror', 'Mystery', 'Thriller'],
            tags: ['Supernatural', 'Haunted House', 'True Story'],
            description: 'Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.',
            age: '16+',
            duration: '1h 52min',
            year: '2013'
        },
        '02-XkOLVnIU': {
            title: 'Mulan',
            rating: 7.0,
            stars: 3,
            genres: ['Action', 'Adventure', 'Drama'],
            tags: ['Disney', 'Live Action', 'Warrior'],
            description: 'A young Chinese maiden disguises herself as a male warrior in order to save her father.',
            age: '10+',
            duration: '2h 0min',
            year: '2020'
        },
        '8jLOx1hD3_o': {
            title: 'Laxmii',
            rating: 6.5,
            stars: 5,
            genres: ['Comedy', 'Horror', 'Drama'],
            tags: ['Bollywood', 'Supernatural', 'Comedy'],
            description: 'A man gets possessed by a ghost and starts behaving like a woman.',
            age: '18+',
            duration: '2h 21min',
            year: '2020'
        },
        'W4DlMggBPvc': {
            title: 'Captain America: The First Avenger',
            rating: 6.9,
            stars: 4,
            genres: ['Action', 'Adventure', 'Sci-Fi'],
            tags: ['Marvel', 'Superhero', 'World War II'],
            description: 'Steve Rogers, a rejected military soldier, transforms into Captain America after taking a dose of a "Super-Soldier serum".',
            age: '12+',
            duration: '2h 4min',
            year: '2011'
        },
        'sDYVdxFZq8Y': {
            title: 'Life of Pi',
            rating: 7.9,
            stars: 4,
            genres: ['Adventure', 'Drama', 'Fantasy'],
            tags: ['Survival', 'Ocean', 'Philosophy'],
            description: 'A young man who survives a disaster at sea is hurtled into an epic journey of adventure and discovery.',
            age: '11+',
            duration: '2h 7min',
            year: '2012'
        },
        'q78_0TElYME': {
            title: 'Mission Mangal',
            rating: 6.8,
            stars: 3,
            genres: ['Drama', 'Sci-Fi', 'Thriller'],
            tags: ['Space', 'India', 'ISRO'],
            description: 'Based on true events of the Indian Space Research Organisation (ISRO) successfully launching the Mars Orbiter Mission.',
            age: '12+',
            duration: '2h 10min',
            year: '2019'
        },
        'acEoQpJq0qg': {
            title: 'Insidious: The Last Key',
            rating: 6.2,
            stars: 3,
            genres: ['Horror', 'Mystery', 'Thriller'],
            tags: ['Supernatural', 'Haunting', 'Sequel'],
            description: 'Paranormal investigator Elise Rainier faces her most fearsome and personal haunting yet.',
            age: '16+',
            duration: '1h 43min',
            year: '2018'
        },
        'yQ5U8suTUw0': {
            title: 'War',
            rating: 7.1,
            stars: 4,
            genres: ['Action', 'Thriller', 'Drama'],
            tags: ['Bollywood', 'Spy', 'Revenge'],
            description: 'An Indian soldier is assigned to eliminate his mentor who has gone rogue.',
            age: '12+',
            duration: '2h 34min',
            year: '2019'
        },
        '4qf9Uyn2acE': {
            title: 'Five Feet Apart',
            rating: 7.2,
            stars: 4,
            genres: ['Drama', 'Romance'],
            tags: ['Teen', 'Illness', 'Love Story'],
            description: 'A pair of teenagers with cystic fibrosis meet in a hospital and fall in love, though their disease means they must maintain a safe distance between them.',
            age: '18+',
            duration: '1h 56min',
            year: '2019'
        },
        'tsxemFXSQXQ': {
            title: 'Chhichhore',
            rating: 8.0,
            stars: 4,
            genres: ['Comedy', 'Drama'],
            tags: ['College Life', 'Friendship', 'Nostalgia'],
            description: 'A tragic incident forces Anirudh, a middle-aged man, to take a trip down memory lane and reminisce his college days along with his friends.',
            age: '10+',
            duration: '2h 23min',
            year: '2019'
        },
        'Lt-U_t2pUHI': {
            title: 'Doctor Strange',
            rating: 7.5,
            stars: 4,
            genres: ['Action', 'Adventure', 'Fantasy'],
            tags: ['Marvel', 'Magic', 'Superhero'],
            description: 'While on a journey of physical and spiritual healing, a brilliant neurosurgeon is drawn into the world of the mystic arts.',
            age: '12+',
            duration: '1h 55min',
            year: '2016'
        },
        'VyHV0BtdCW4': {
            title: 'Harry Potter and the Sorcerer\'s Stone',
            rating: 7.6,
            stars: 4,
            genres: ['Adventure', 'Family', 'Fantasy'],
            tags: ['Magic', 'Wizard', 'School'],
            description: 'An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.',
            age: '10+',
            duration: '2h 32min',
            year: '2001'
        },
        'CDrieqs-S54': {
            title: 'The Queen\'s Gambit',
            rating: 8.6,
            stars: 5,
            genres: ['Drama', 'Sport'],
            tags: ['Chess', 'Genius', 'Addiction'],
            description: 'Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA.',
            age: '18+',
            duration: '6h 47min',
            year: '2020'
        },
        'b9EkMc79ZSU': {
            title: 'Stranger Things',
            rating: 8.7,
            stars: 5,
            genres: ['Drama', 'Fantasy', 'Horror'],
            tags: ['Supernatural', 'Kids', '80s'],
            description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
            age: '16+',
            duration: '3 Seasons',
            year: '2016'
        },
        'i1eJMig5Ik4': {
            title: 'BoJack Horseman',
            rating: 8.8,
            stars: 5,
            genres: ['Animation', 'Comedy', 'Drama'],
            tags: ['Adult Animation', 'Depression', 'Hollywood'],
            description: 'BoJack Horseman was the star of the hit television show "Horsin\' Around" in the \'80s and \'90s, but now he\'s washed up.',
            age: '15+',
            duration: '6 Seasons',
            year: '2014'
        },
        'oVzVdvLeICg': {
            title: 'Peaky Blinders',
            rating: 8.8,
            stars: 5,
            genres: ['Crime', 'Drama'],
            tags: ['Gangster', 'Historical', 'British'],
            description: 'A notorious gang in 1919 Birmingham, England, is led by the fierce Tommy Shelby, a crime boss set on moving up in the world no matter the cost.',
            age: '20+',
            duration: '5 Seasons',
            year: '2013'
        },
        'L_jWHffIx5E': {
            title: 'NBA Basketball Highlights',
            rating: 8.5,
            stars: 4,
            genres: ['Sports', 'Basketball'],
            tags: ['NBA', 'Highlights', 'Basketball'],
            description: 'Best moments and highlights from NBA basketball games featuring top players and teams.',
            age: 'All Ages',
            duration: 'Various',
            year: '2024'
        },
        '4fVCKy69zUY': {
            title: 'PGA Golf Championship',
            rating: 8.2,
            stars: 4,
            genres: ['Sports', 'Golf'],
            tags: ['PGA', 'Golf', 'Championship'],
            description: 'Highlights from the PGA Golf Championship featuring top golfers and amazing shots.',
            age: 'All Ages',
            duration: 'Various',
            year: '2024'
        },
        '5PSNL1qE6VY': {
            title: 'Avatar',
            rating: 7.8,
            stars: 4,
            genres: ['Action', 'Adventure', 'Fantasy'],
            tags: ['Sci-Fi', '3D', 'James Cameron'],
            description: 'A paraplegic marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
            age: '12+',
            duration: '2h 42min',
            year: '2009'
        },
        'JWtnJjn6ngQ': {
            title: 'The Crown',
            rating: 8.7,
            stars: 5,
            genres: ['Drama', 'History'],
            tags: ['Royal Family', 'British', 'Netflix'],
            description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the twentieth century.',
            age: '16+',
            duration: '4 Seasons',
            year: '2016'
        },
        'WBb3fojjx-0': {
            title: 'The Big Bang Theory',
            rating: 8.1,
            stars: 4,
            genres: ['Comedy', 'Romance'],
            tags: ['Sitcom', 'Scientists', 'Friendship'],
            description: 'A woman who moves into an apartment across the hall from two brilliant but socially awkward physicists shows them how little they know about life outside of the laboratory.',
            age: '12+',
            duration: '12 Seasons',
            year: '2007'
        },
        'Ua0HdsbsDsA': {
            title: 'Narcos',
            rating: 8.8,
            stars: 5,
            genres: ['Crime', 'Drama', 'Thriller'],
            tags: ['Drug Cartel', 'Colombia', 'True Story'],
            description: 'A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar, as well as the many other drug kingpins who plagued the country through the years.',
            age: '18+',
            duration: '3 Seasons',
            year: '2015'
        },
        'IEEbUfhFFM0': {
            title: 'Friends',
            rating: 8.9,
            stars: 5,
            genres: ['Comedy', 'Romance'],
            tags: ['Sitcom', 'Friendship', 'Classic'],
            description: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.',
            age: '12+',
            duration: '10 Seasons',
            year: '1994'
        },
        'ej3ioOneQ48': {
            title: 'The Martian',
            rating: 8.0,
            stars: 4,
            genres: ['Adventure', 'Drama', 'Sci-Fi'],
            tags: ['Space', 'Survival', 'Mars'],
            description: 'An astronaut becomes stranded on Mars after his team assume him dead, and must rely on his ingenuity to find a way to signal to Earth that he is alive.',
            age: '12+',
            duration: '2h 24min',
            year: '2015'
        },
        'n9tzhmJ5hFE': {
            title: 'Unhinged',
            rating: 6.1,
            stars: 3,
            genres: ['Action', 'Thriller'],
            tags: ['Road Rage', 'Thriller', 'Russell Crowe'],
            description: 'After a confrontation with an unstable man at an intersection, a woman becomes the target of his rage.',
            age: '16+',
            duration: '1h 30min',
            year: '2020'
        },
        'm4NC26Dk4dE': {
            title: 'Kingsman: The Secret Service',
            rating: 7.7,
            stars: 4,
            genres: ['Action', 'Adventure', 'Comedy'],
            tags: ['Spy', 'British', 'Comedy'],
            description: 'A spy organization recruits an unrefined, but promising street kid into the agency\'s ultra-competitive training program, just as a global threat emerges from a twisted tech genius.',
            age: '16+',
            duration: '2h 9min',
            year: '2014'
        },
        '36mnx8hNvEE': {
            title: 'Casino Royale',
            rating: 8.0,
            stars: 4,
            genres: ['Action', 'Adventure', 'Thriller'],
            tags: ['James Bond', 'Spy', 'Daniel Craig'],
            description: 'After earning 00 status and a licence to kill, secret agent James Bond sets out on his first mission as 007. Bond must defeat a private banker to terrorists in a high stakes game of poker at Casino Royale.',
            age: '12+',
            duration: '2h 24min',
            year: '2006'
        },
        'Ohws8y572KE': {
            title: 'Mission: Impossible',
            rating: 7.1,
            stars: 4,
            genres: ['Action', 'Adventure', 'Thriller',],
            tags: ['Tom Cruise', 'Spy', 'Action'],
            description: 'An American agent, under false suspicion of disloyalty, must discover and expose the real spy without the help of his organization.',
            age: '12+',
            duration: '1h 50min',
            year: '1996'
        },
        '': {
            title: 'Mirzapur',
            rating: 8.4,
            stars: 4,
            genres: ['Action', 'Crime', 'Drama'],
            tags: ['Amazon Prime', 'Indian Series', 'Gangster'],
            description: 'A shocking incident at a wedding procession ignites a series of events entangling the lives of two families in the lawless city of Mirzapur.',
            age: '18+',
            duration: '2 Seasons',
            year: '2018'
        },
        // Search functionality movies
        'Ohws8y572KE': {
            title: 'Mission: Impossible',
            rating: 7.1,
            stars: 4,
            genres: ['Action', 'Adventure', 'Thriller'],
            tags: ['Tom Cruise', 'Action', 'Spy', 'Thriller', 'Mission'],
            description: 'An American agent, under false suspicion of disloyalty, must discover and expose the real spy without the help of his organization.',
            age: '12+',
            duration: '1h 50min',
            year: '1996'
        },
        '02-XkOLVnIU': {
            title: 'Mulan',
            rating: 7.0,
            stars: 3,
            genres: ['Action', 'Adventure', 'Drama'],
            tags: ['Disney', 'Live Action', 'Warrior'],
            description: 'A young Chinese maiden disguises herself as a male warrior in order to save her father.',
            age: '10+',
            duration: '2h 0min',
            year: '2020'
        },
        '8jLOx1hD3_o': {
            title: 'Laxmii',
            rating: 6.5,
            stars: 5,
            genres: ['Comedy', 'Horror', 'Drama'],
            tags: ['Bollywood', 'Supernatural', 'Comedy'],
            description: 'A man gets possessed by a ghost and starts behaving like a woman.',
            age: '18+',
            duration: '2h 21min',
            year: '2020'
        },
        'W4DlMggBPvc': {
            title: 'Captain America: The First Avenger',
            rating: 6.9,
            stars: 4,
            genres: ['Action', 'Adventure', 'Sci-Fi'],
            tags: ['Marvel', 'Superhero', 'World War II'],
            description: 'Steve Rogers, a rejected military soldier, transforms into Captain America after taking a dose of a "Super-Soldier serum".',
            age: '12+',
            duration: '2h 4min',
            year: '2011'
        },
        'sDYVdxFZq8Y': {
            title: 'Life of Pi',
            rating: 7.9,
            stars: 4,
            genres: ['Adventure', 'Drama', 'Fantasy'],
            tags: ['Survival', 'Ocean', 'Philosophy'],
            description: 'A young man who survives a disaster at sea is hurtled into an epic journey of adventure and discovery.',
            age: '11+',
            duration: '2h 7min',
            year: '2012'
        },
        'q78_0TElYME': {
            title: 'Mission Mangal',
            rating: 6.8,
            stars: 3,
            genres: ['Drama', 'Sci-Fi', 'Thriller'],
            tags: ['Space', 'India', 'ISRO'],
            description: 'Based on true events of the Indian Space Research Organisation (ISRO) successfully launching the Mars Orbiter Mission.',
            age: '12+',
            duration: '2h 10min',
            year: '2019'
        },
        '4qf9Uyn2acE': {
            title: 'Five Feet Apart',
            rating: 7.2,
            stars: 4,
            genres: ['Drama', 'Romance'],
            tags: ['Teen', 'Illness', 'Love Story'],
            description: 'A pair of teenagers with cystic fibrosis meet in a hospital and fall in love, though their disease means they must maintain a safe distance between them.',
            age: '18+',
            duration: '1h 56min',
            year: '2019'
        },
        'tsxemFXSQXQ': {
            title: 'Chhichhore',
            rating: 8.0,
            stars: 4,
            genres: ['Comedy', 'Drama'],
            tags: ['College Life', 'Friendship', 'Nostalgia'],
            description: 'A tragic incident forces Anirudh, a middle-aged man, to take a trip down memory lane and reminisce his college days along with his friends.',
            age: '10+',
            duration: '2h 23min',
            year: '2019'
        },
        'Lt-U_t2pUHI': {
            title: 'Doctor Strange',
            rating: 7.5,
            stars: 4,
            genres: ['Action', 'Adventure', 'Fantasy'],
            tags: ['Marvel', 'Magic', 'Superhero'],
            description: 'While on a journey of physical and spiritual healing, a brilliant neurosurgeon is drawn into the world of the mystic arts.',
            age: '12+',
            duration: '1h 55min',
            year: '2016'
        },
        'VyHV0BtdCW4': {
            title: 'Harry Potter and the Sorcerer\'s Stone',
            rating: 7.6,
            stars: 4,
            genres: ['Adventure', 'Family', 'Fantasy'],
            tags: ['Magic', 'Wizard', 'School'],
            description: 'An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.',
            age: '10+',
            duration: '2h 32min',
            year: '2001'
        }
    };
    
    // Default video data for unknown videos
    const defaultVideoData = {
        title: 'Movie Title',
        rating: 7.0,
        stars: 3,
        genres: ['Action', 'Adventure'],
        tags: ['Action', 'Adventure'],
        description: 'Movie description goes here.',
        age: '12+',
        duration: '2h 0min',
        year: '2024'
    };
    
    // Function to create embedded video player
    function createVideoPlayer(videoId) {
        const videoContainer = document.getElementById('youtube-player');
        if (videoContainer && videoId) {
            try {
                // Clear existing content
                videoContainer.innerHTML = '';
                
                // Create iframe for YouTube video with autoplay
                const iframe = document.createElement('iframe');
                iframe.id = 'embedded-video';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.style.borderRadius = '10px';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&showinfo=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`;
                
                // Append iframe
                videoContainer.appendChild(iframe);
                
                // Store current video ID
                currentVideoId = videoId;
                
                console.log('Video player created successfully for:', videoId);
            } catch (error) {
                console.error('Error creating video player:', error);
                // Fallback: show error message
                videoContainer.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">Error loading video. Please try again.</p>';
            }
        } else {
            console.error('Video container not found or invalid video ID');
        }
    }
    
    // Function to load video by ID
    function loadVideoById(videoId) {
        if (videoId && videoId !== currentVideoId) {
            createVideoPlayer(videoId);
        }
    }
    
    // Function to stop video
    function stopVideo() {
        const iframe = document.getElementById('embedded-video');
        if (iframe) {
            // For iframes, we need to reload with a different video or clear the src
            // This will effectively stop the current video
            iframe.src = '';
        }
    }
    
    // Function to update sidebar content
    function updateSidebarContent(videoId) {
        const data = videoData[videoId] || defaultVideoData;
        
        // Update title
        const titleElement = document.getElementById('video-title');
        if (titleElement) {
            titleElement.textContent = data.title;
        }
        
        // Update rating section
        const ratingSection = document.querySelector('.rating-section .rating');
        if (ratingSection) {
            // Clear existing stars
            const existingStars = ratingSection.querySelectorAll('.fa-star, .fa-star-half');
            existingStars.forEach(star => star.remove());
            
            // Add new stars based on rating
            const fullStars = Math.floor(data.stars);
            const hasHalfStar = data.stars % 1 !== 0;
            
            for (let i = 0; i < fullStars; i++) {
                const star = document.createElement('i');
                star.className = 'fa fa-star text-primary';
                ratingSection.insertBefore(star, ratingSection.querySelector('.ml-2'));
            }
            
            if (hasHalfStar) {
                const halfStar = document.createElement('i');
                halfStar.className = 'fa fa-star-half text-primary';
                ratingSection.insertBefore(halfStar, ratingSection.querySelector('.ml-2'));
            }
            
            // Update rating text
            const ratingText = ratingSection.querySelector('.ml-2');
            if (ratingText) {
                ratingText.textContent = data.rating + '/10';
            }
        }
        
        // Update movie details
        const movieDetails = document.querySelector('.movie-details');
        if (movieDetails) {
            const ageBadge = movieDetails.querySelector('.badge');
            const duration = movieDetails.querySelector('.duration');
            const year = movieDetails.querySelector('.year');
            
            if (ageBadge) ageBadge.textContent = data.age;
            if (duration) duration.textContent = data.duration;
            if (year) year.textContent = data.year;
        }
        
        // Update genres
        const genresList = document.querySelector('.genres-list');
        if (genresList) {
            genresList.innerHTML = '';
            data.genres.forEach(genre => {
                const genreTag = document.createElement('span');
                genreTag.className = 'genre-tag';
                genreTag.textContent = genre;
                genresList.appendChild(genreTag);
            });
        }
        
        // Update tags
        const tagsList = document.querySelector('.tags-list');
        if (tagsList) {
            tagsList.innerHTML = '';
            data.tags.forEach(tag => {
                const tagItem = document.createElement('span');
                tagItem.className = 'tag-item';
                tagItem.textContent = tag;
                tagsList.appendChild(tagItem);
            });
        }
        
        // Update description
        const description = document.querySelector('.video-description');
        if (description) {
            description.textContent = data.description;
        }
    }
    
    // Function to update sidebar content
    function updateSidebarContent(videoId) {
        const data = videoData[videoId] || defaultVideoData;
        
        // Update title
        const titleElement = document.getElementById('video-title');
        if (titleElement) {
            titleElement.textContent = data.title;
        }
        
        // Update rating section
        const ratingSection = document.querySelector('.rating-section .rating');
        if (ratingSection) {
            // Clear existing stars
            const existingStars = ratingSection.querySelectorAll('.fa-star, .fa-star-half');
            existingStars.forEach(star => star.remove());
            
            // Add new stars based on rating
            const fullStars = Math.floor(data.stars);
            const hasHalfStar = data.stars % 1 !== 0;
            
            for (let i = 0; i < fullStars; i++) {
                const star = document.createElement('i');
                star.className = 'fa fa-star text-primary';
                ratingSection.insertBefore(star, ratingSection.querySelector('.ml-2'));
            }
            
            if (hasHalfStar) {
                const halfStar = document.createElement('i');
                halfStar.className = 'fa fa-star-half text-primary';
                ratingSection.insertBefore(halfStar, ratingSection.querySelector('.ml-2'));
            }
            
            // Update rating text
            const ratingText = ratingSection.querySelector('.ml-2');
            if (ratingText) {
                ratingText.textContent = data.rating + '/10';
            }
        }
        
        // Update movie details
        const movieDetails = document.querySelector('.movie-details');
        if (movieDetails) {
            const ageBadge = movieDetails.querySelector('.badge');
            const duration = movieDetails.querySelector('.duration');
            const year = movieDetails.querySelector('.year');
            
            if (ageBadge) ageBadge.textContent = data.age;
            if (duration) duration.textContent = data.duration;
            if (year) year.textContent = data.year;
        }
        
        // Update genres
        const genresList = document.querySelector('.genres-list');
        if (genresList) {
            genresList.innerHTML = '';
            data.genres.forEach(genre => {
                const genreTag = document.createElement('span');
                genreTag.className = 'genre-tag';
                genreTag.textContent = genre;
                genresList.appendChild(genreTag);
            });
        }
        
        // Update tags
        const tagsList = document.querySelector('.tags-list');
        if (tagsList) {
            tagsList.innerHTML = '';
            data.tags.forEach(tag => {
                const tagItem = document.createElement('span');
                tagItem.className = 'tag-item';
                tagItem.textContent = tag;
                tagsList.appendChild(tagItem);
            });
        }
        
        // Update description
        const description = document.querySelector('.video-description');
        if (description) {
            description.textContent = data.description;
        }
    }
    
    // Video Gallery Event Handlers
    jQuery(document).ready(function() {
        const videoGallery = jQuery('#video-gallery-overlay');
        const closeBtn = jQuery('#close-video-gallery');
        const playNowButtons = jQuery('.btn-hover.iq-button, .play-now-btn');
        
        // Initialize video player with default video and update sidebar
        createVideoPlayer(currentVideoId);
        updateSidebarContent(currentVideoId);
        
                 // Close video gallery
         function closeVideoGallery() {
             videoGallery.removeClass('active');
             jQuery('body').css('overflow', 'auto').removeClass('video-gallery-active');
             
             // Stop video
             stopVideo();
         }
         
         // Make closeVideoGallery function globally accessible
         window.closeVideoGallery = closeVideoGallery;
        
        // Event listeners for Play Now buttons
        playNowButtons.on('click', function(e) {
            e.preventDefault();
            
            const videoId = jQuery(this).attr('data-video-id') || 'dQw4w9WgXcQ';
            const title = jQuery(this).attr('data-title') || 'Movie Title';
            
            openVideoGallery(videoId, title);
        });
        
        // Close button event listener
        closeBtn.on('click', closeVideoGallery);
        
        // Removed escape key and overlay click functionality
        // Only the Back Home button can close the video gallery
        
        // Watch Full Movie button
        jQuery('.btn-watch-full').on('click', function() {
            alert('Watch Full Movie functionality would be implemented here');
        });
        
        // Download button
        jQuery('.btn-download').on('click', function() {
            alert('Download functionality would be implemented here');
        });
        
        // Initialize sliders for video gallery sections
        function initializeVideoGallerySliders() {
            
            if (videoGallery.find('.favorites-slider').length) {
                videoGallery.find('.favorites-slider').slick({
                    dots: false,
                    arrow: true,
                    infinite: true,
                    speed: 300,
                    autoplay: false,
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    nextArrow: '<a href="#" class="slick-arrow slick-next"><i class="fa fa-chevron-right"></i></a>',
                    prevArrow: '<a href="#" class="slick-arrow slick-prev"><i class="fa fa-chevron-left"></i></a>',
                    responsive: [
                        {
                            breakpoint: 1200,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                                infinite: true,
                                dots: true
                            }
                        },
                        {
                            breakpoint: 768,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 1
                            }
                        },
                        {
                            breakpoint: 480,
                            settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1
                            }
                        }
                    ]
                });
            }
            
            // Initialize all upcoming sliders in the video gallery
            videoGallery.find('.upcoming-slider').each(function() {
                jQuery(this).slick({
                    dots: false,
                    arrow: true,
                    infinite: true,
                    speed: 300,
                    autoplay: false,
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    nextArrow: '<a href="#" class="slick-arrow slick-next"><i class="fa fa-chevron-right"></i></a>',
                    prevArrow: '<a href="#" class="slick-arrow slick-prev"><i class="fa fa-chevron-left"></i></a>',
                    responsive: [
                        {
                            breakpoint: 1200,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                                infinite: true,
                                dots: true
                            }
                        },
                        {
                            breakpoint: 768,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 1
                            }
                        },
                        {
                            breakpoint: 480,
                            settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1
                            }
                        }
                    ]
                });
            });
            
            // Force all elements to be visible
            videoGallery.find('.slide-item, .block-images, .block-description, .block-social-info').css({
                'display': 'block',
                'opacity': '1',
                'visibility': 'visible'
            });
            
        }
        
        // Initialize sliders when video gallery opens
        function openVideoGallery(videoId, title) {
            console.log('Opening video gallery with:', videoId, title);
            
            // Show overlay first
            videoGallery.addClass('active');
            jQuery('body').css('overflow', 'hidden').addClass('video-gallery-active');
            
            // Update sidebar content with video-specific data
            updateSidebarContent(videoId);
            
            // Initialize sliders after a short delay
            setTimeout(function() {
                initializeVideoGallerySliders();
            }, 200);
            
            // Load video immediately
            loadVideoById(videoId);
            
            // Scroll to top of video gallery content
            setTimeout(function() {
                const videoGalleryContent = videoGallery.find('.video-gallery-content');
                const videoGalleryContainer = videoGallery.find('.video-gallery-container');
                
                if (videoGalleryContent.length) {
                    videoGalleryContent.scrollTop(0);
                }
                
                // Also scroll the main container to ensure video is visible
                if (videoGalleryContainer.length) {
                    videoGalleryContainer.scrollTop(0);
                }
                
                // Scroll the entire overlay to top
                videoGallery.scrollTop(0);
            }, 300);
        }
        
        // Make openVideoGallery function globally accessible
        window.openVideoGallery = openVideoGallery;
    });
})(jQuery);