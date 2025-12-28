(function (jQuery){
    "use strict";
    
    const LOADER_COLOR_CYCLE_MS = 5000;
    const GA_MEASUREMENT_ID = 'G-TJ8LYC7Z2N';

    // Google Analytics 4 instrumentation (shared across all pages)
    function initGoogleAnalytics() {
        if (!document.head || window.GA_INITIALIZED) {
            return;
        }

        window.GA_INITIALIZED = true;
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function() {
            window.dataLayer.push(arguments);
        };

        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
        document.head.appendChild(gaScript);

        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID);
    }

    initGoogleAnalytics();
    
    function showLoaderOverlay() {
        const loader = document.getElementById('page-loader');
        if (!loader) {
            return null;
        }
        loader.style.display = 'flex';
        loader.classList.remove('hidden');
        document.body.classList.add('loading');
        return loader;
    }
    
    function hideLoaderOverlay(loader) {
        if (!loader) {
            return;
        }
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
        setTimeout(function() {
            if (loader.classList.contains('hidden')) {
                loader.style.display = 'none';
            }
        }, 400);
    }
    
    function playLoaderCycle() {
        const loader = showLoaderOverlay();
        if (!loader) {
            return Promise.resolve();
        }
        
        return new Promise(function(resolve) {
            setTimeout(function() {
                hideLoaderOverlay(loader);
                resolve();
            }, LOADER_COLOR_CYCLE_MS);
        });
    }
    
    function runAfterLoaderCycle(callback) {
        return playLoaderCycle().then(function() {
            if (typeof callback === 'function') {
                return callback();
            }
        });
    }
    
    window.runLoaderSequence = runAfterLoaderCycle;
    
    // ============================================
    // Smooth Loading and Page Transitions
    // ============================================
    
    // Page Loader Handler
    function initPageLoader() {
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) {
            // Ensure loading class is on body (may already be there from HTML)
            if (!document.body.classList.contains('loading')) {
                document.body.classList.add('loading');
            }

            // Hide loader when page is fully loaded and show header/content
            window.addEventListener('load', function() {
                // Remove loading class to show header and content
                document.body.classList.remove('loading');
                
                // Hide the page loader
                if (pageLoader) {
                    pageLoader.classList.add('hidden');
                    setTimeout(function() {
                        if (pageLoader.classList.contains('hidden')) {
                            pageLoader.style.display = 'none';
                        }
                    }, 500);
                }
            });
        }
    }
    
    // Smooth Page Transitions with AJAX loading
    function initPageTransitions() {
        let isLoadingPage = false;
        
        // Handle all internal links
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href]');
            if (!link) return;
            
            const href = link.getAttribute('href');
            // Only handle internal links (same domain)
            if (href && !href.startsWith('#') && !href.startsWith('javascript:') && 
                !href.startsWith('mailto:') && !href.startsWith('tel:') &&
                (href.startsWith('/') || href.includes(window.location.hostname) || 
                 !href.includes('http'))) {
                
                // Don't prevent default for video gallery links
                if (link.classList.contains('iq-button') || link.closest('.video-gallery-overlay')) {
                    return;
                }
                
                e.preventDefault();
                
                // Prevent multiple simultaneous loads
                if (isLoadingPage) return;
                
                // Show loader and load page content
                loadPageContent(href);
            }
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', function(e) {
            if (e.state && e.state.url) {
                loadPageContent(e.state.url, false);
            }
        });
        
        // AJAX function to load only main content
        async function loadPageContent(url, updateHistory = true) {
            if (isLoadingPage) return;
            isLoadingPage = true;
            
            try {
                // Show loader
                document.body.classList.add('page-transitioning');
                const loader = showLoaderOverlay();
                
                // Resolve relative URLs to absolute
                const absoluteUrl = new URL(url, window.location.origin).href;
                
                // Fetch the new page
                const response = await fetch(absoluteUrl);
                if (!response.ok) {
                    throw new Error('Failed to load page');
                }
                
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract main content from the new page
                const newMainContent = doc.querySelector('.main-content');
                const currentMainContent = document.querySelector('.main-content');
                
                if (newMainContent && currentMainContent) {
                    // Wait for loader cycle to complete (5 seconds)
                    await playLoaderCycle();
                    
                    // Replace main content
                    currentMainContent.innerHTML = newMainContent.innerHTML;
                    
                    // Update active menu items
                    updateActiveMenuItems(url);
                    
                    // Reinitialize scripts that need to run on new content
                    reinitializePageScripts();
                    
                    // Update URL without reload
                    if (updateHistory) {
                        window.history.pushState({ url: absoluteUrl }, '', url);
                    }
                    
                    // Scroll to top smoothly
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    // Fallback to full page load if structure is different
                    window.location.href = url;
                    return;
                }
            } catch (error) {
                console.error('Error loading page:', error);
                // Fallback to full page load on error
                window.location.href = url;
            } finally {
                isLoadingPage = false;
                document.body.classList.remove('page-transitioning');
            }
        }
        
        // Update active menu items based on current URL
        function updateActiveMenuItems(url) {
            const menuItems = document.querySelectorAll('.mf-menu-item, .menu-item a');
            menuItems.forEach(function(item) {
                const itemHref = item.getAttribute('href');
                if (itemHref && (itemHref === url || itemHref === url.split('/').pop())) {
                    item.classList.add('active');
                    if (item.parentElement) {
                        item.parentElement.classList.add('active');
                    }
                } else {
                    item.classList.remove('active');
                    if (item.parentElement) {
                        item.parentElement.classList.remove('active');
                    }
                }
            });
        }
        
        // Reinitialize scripts that need to run on dynamically loaded content
        function reinitializePageScripts() {
            // Reinitialize carousels/sliders if they exist
            if (typeof jQuery !== 'undefined') {
                // Reinitialize slick sliders
                jQuery('.slick-slider').each(function() {
                    if (jQuery(this).hasClass('slick-initialized')) {
                        jQuery(this).slick('unslick');
                    }
                });
                
                // Reinitialize owl carousels
                if (typeof jQuery.fn.owlCarousel !== 'undefined') {
                    jQuery('.owl-carousel').each(function() {
                        if (jQuery(this).hasClass('owl-loaded')) {
                            jQuery(this).trigger('destroy.owl.carousel');
                        }
                    });
                }
                
                // Reinitialize slick animation
                if (typeof jQuery.fn.slickAnimation !== 'undefined') {
                    jQuery('[data-animation-in]').slickAnimation();
                }
            }
            
            // Reinitialize dynamic content loader if it exists
            if (window.dynamicLoader && typeof window.dynamicLoader.setupEventListeners === 'function') {
                window.dynamicLoader.setupEventListeners();
            }
        }
    }

    // MovieFlix-style mobile sidebar menu (triggered by existing navbar hamburger)
    function initMobileSidebarMenu() {
        const sidebar = document.getElementById('mfSidebar');
        const menuToggle = document.querySelector('.navbar-toggler.c-toggler');
        if (!sidebar || !menuToggle) {
            return;
        }

        const menuItems = sidebar.querySelectorAll('.mf-menu-item');
        const galleryMenuTriggers = document.querySelectorAll('.video-gallery-menu-trigger');

        menuToggle.addEventListener('click', function (e) {
            if (window.innerWidth <= 991) {
                e.preventDefault();
                e.stopPropagation();
                sidebar.classList.toggle('open');
                document.body.classList.toggle('mf-sidebar-open', sidebar.classList.contains('open'));
            }
        });

        // Allow video gallery menu icon to behave exactly like the main header menu icon
        if (galleryMenuTriggers && galleryMenuTriggers.length) {
            Array.prototype.forEach.call(galleryMenuTriggers, function (trigger) {
                trigger.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Toggle the same sidebar state used by the main header menu
                    const isOpen = sidebar.classList.contains('open');
                    sidebar.classList.toggle('open', !isOpen);
                    document.body.classList.toggle('mf-sidebar-open', !isOpen);
                });
            });
        }

        if (menuItems && menuItems.length) {
            Array.prototype.forEach.call(menuItems, function (item) {
                item.addEventListener('click', function (e) {
                    if (this.getAttribute('href') === '#') {
                        e.preventDefault();
                    }
                    Array.prototype.forEach.call(menuItems, function (el) {
                        el.classList.remove('active');
                    });
                    this.classList.add('active');
                    sidebar.classList.remove('open');
                    document.body.classList.remove('mf-sidebar-open');
                });
            });
        }

        document.addEventListener('click', function (e) {
            if (window.innerWidth > 991) return;
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
                document.body.classList.remove('mf-sidebar-open');
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initPageLoader();
            initPageTransitions();
            initMobileSidebarMenu();
        });
    } else {
        initPageLoader();
        initPageTransitions();
        initMobileSidebarMenu();
    }
    
    // ============================================
    // Like System Implementation
    // ============================================
    class LikeSystem {
        constructor() {
            this.storageKey = 'nerflix_likes_data';
            this.userIdKey = 'nerflix_user_id';
            this.currentUserId = this.getCurrentUserId(); // Get user ID first
            this.likesData = this.loadLikesData(); // Then load likes data
            this.init();
        }
        
        // Generate or retrieve a unique user ID (stored in localStorage)
        getCurrentUserId() {
            try {
                let userId = localStorage.getItem(this.userIdKey);
                if (!userId) {
                    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem(this.userIdKey, userId);
                }
                return userId;
            } catch (error) {
                console.warn('Failed to get user ID from localStorage', error);
                return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
        }
        
        // Load likes data from localStorage
        loadLikesData() {
            const likesData = {};
            try {
                const storedData = localStorage.getItem(this.storageKey);
                if (storedData) {
                    const parsed = JSON.parse(storedData);
                    // Merge stored data
                    Object.keys(parsed).forEach(itemId => {
                        if (parsed[itemId] && typeof parsed[itemId] === 'object') {
                            likesData[itemId] = parsed[itemId];
                        }
                    });
                }
            } catch (error) {
                console.warn('Failed to load likes from localStorage', error);
            }
            return likesData;
        }
        
        // Save likes data to localStorage
        saveLikesData() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.likesData));
            } catch (error) {
                console.warn('Failed to save likes to localStorage', error);
            }
        }
        
        // Get like count for a specific item (total likes from all users)
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
                // Unlike - remove user's like
                delete this.likesData[itemId][this.currentUserId];
                // Clean up empty items
                if (Object.keys(this.likesData[itemId]).length === 0) {
                    delete this.likesData[itemId];
                }
                this.showNotification('Removed from favorites', 'info');
            } else {
                // Like - add user's like
                this.likesData[itemId][this.currentUserId] = true;
                this.showNotification('Added to favorites!', 'success');
            }
            
            this.saveLikesData();
            this.updateItemUI(itemId);
            // Update all instances of this item on the page
            this.updateAllItemInstances(itemId);
        }
        
        // Update all instances of an item on the page (for items that appear multiple times)
        updateAllItemInstances(itemId) {
            const allItems = document.querySelectorAll(`[data-item-id="${itemId}"]`);
            allItems.forEach(item => {
                this.updateItemUI(itemId, item);
            });
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
        
        // Update the UI for a specific item with visual heart icon styling
        updateItemUI(itemId, itemElement = null) {
            const item = itemElement || document.querySelector(`[data-item-id="${itemId}"]`);
            if (!item) return;
            
            const likeCount = this.getLikeCount(itemId);
            const isLiked = this.hasUserLiked(itemId);
            
            // Find and update heart icons with count boxes and styling
            const heartIcons = item.querySelectorAll('.fa-heart');
            heartIcons.forEach(heartIcon => {
                const heartSpan = heartIcon.closest('span');
                const heartListItem = heartIcon.closest('li');
                
                // Find or create count box next to heart icon
                if (heartListItem) {
                    let countBox = heartListItem.querySelector('.count-box');
                    
                    // Create count box if it doesn't exist
                    if (!countBox) {
                        countBox = document.createElement('span');
                        countBox.className = 'count-box';
                        countBox.style.cssText = 'margin-left: 5px; color: #fff; font-size: 12px; display: inline-block;';
                        
                        // Insert after the heart icon span
                        if (heartSpan && heartSpan.parentNode) {
                            heartSpan.parentNode.insertBefore(countBox, heartSpan.nextSibling);
                        } else if (heartListItem) {
                            heartListItem.appendChild(countBox);
                        }
                    }
                    
                    // Update count box with current like count (always visible to all users)
                    const newText = likeCount > 0 ? likeCount + '+' : '0+';
                    if (countBox.textContent !== newText) {
                        countBox.textContent = newText;
                        countBox.style.display = 'inline-block';
                        countBox.classList.add('updated');
                        setTimeout(() => {
                            countBox.classList.remove('updated');
                        }, 500);
                    }
                }
                
                // Update heart icon visual state
                if (isLiked) {
                    // Apply liked styling
                    heartIcon.classList.add('liked');
                    if (heartSpan) {
                        heartSpan.classList.add('liked');
                        heartSpan.style.cssText = `
                            background: #e50914 !important;
                            border-radius: 50% !important;
                            padding: 8px !important;
                            display: inline-block !important;
                            transition: all 0.3s ease !important;
                        `;
                    }
                    heartIcon.style.cssText = `
                        color: white !important;
                        transform: scale(1.2) !important;
                        transition: all 0.3s ease !important;
                    `;
                } else {
                    // Remove liked styling
                    heartIcon.classList.remove('liked');
                    if (heartSpan) {
                        heartSpan.classList.remove('liked');
                        heartSpan.style.cssText = '';
                    }
                    heartIcon.style.cssText = '';
                }
            });
            
            // Also update any standalone count boxes (for backward compatibility)
            const standaloneCountBoxes = item.querySelectorAll('.count-box');
            standaloneCountBoxes.forEach(box => {
                const newText = likeCount > 0 ? likeCount + '+' : '0+';
                if (box.textContent !== newText) {
                    box.textContent = newText;
                    box.style.display = 'inline-block';
                    box.classList.add('updated');
                    setTimeout(() => {
                        box.classList.remove('updated');
                    }, 500);
                }
            });
            
            // Store liked state in data attribute
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
            
            // Ensure visual state is applied on page load
            setTimeout(() => {
                this.applyPersistentLikes();
            }, 100);
            
            // Log initialization
            console.log('Like System initialized successfully with persistent likes');
            console.log('Current user ID:', this.currentUserId);
            console.log('Total items with likes:', Object.keys(this.likesData).length);
        }
        
        // Apply persistent likes visual state on page load
        applyPersistentLikes() {
            const allItems = document.querySelectorAll('[data-item-id]');
            allItems.forEach(item => {
                const itemId = item.getAttribute('data-item-id');
                if (itemId && this.hasUserLiked(itemId)) {
                    this.updateItemUI(itemId);
                }
            });
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
                        
                        // Add visual feedback animation
                        this.addHeartAnimation(heartElement);
                    }
                }
            });
        }
        
        // Add visual animation when heart is clicked
        addHeartAnimation(heartElement) {
            const heartSpan = heartElement.closest('span');
            
            // Add pulse animation
            if (heartSpan) {
                heartSpan.style.animation = 'heartBeat 0.6s ease-in-out';
                setTimeout(() => {
                    heartSpan.style.animation = '';
                }, 600);
            }
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
                // Clear all like cookies
                try {
                    const cookies = document.cookie.split(';');
                    
                    cookies.forEach(cookie => {
                        cookie = cookie.trim();
                        const equalIndex = cookie.indexOf('=');
                        if (equalIndex === -1) return;
                        
                        const cookieName = decodeURIComponent(cookie.substring(0, equalIndex));
                        
                        if (cookieName.startsWith(this.cookiePrefix)) {
                            this.setCookie(cookieName, '', -1);
                        }
                    });
                } catch (error) {
                    console.warn('Failed to clear like cookies', error);
                }
                
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
    
    class WatchlistManager {
        constructor() {
            this.storageKey = 'nerflix_watchlist_items';
            this.favoritesStorageKey = 'nerflix_favorites_items';
            this.cookiePrefix = 'nerflix_watchlist_';
            // Keep items effectively forever unless the user removes them
            this.cookieLifetimeDays = 3650; // ~10 years
            this.expiryDurationMs = this.cookieLifetimeDays * 24 * 60 * 60 * 1000;
            this.watchlist = this.loadWatchlist();
            this.favorites = this.loadFavorites();
            this.sliderOptions = {
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
            };
            this.pendingMutationUpdate = null;
            this.init();
        }
        
        init() {
            const onReady = () => {
                this.prepareAllItems();
                this.setupPageControls();
                this.renderWatchlistPage();
                this.renderFavoritesPage();
                this.markExistingItems();
            };
            
            this.setupPlusButtonListener();
            this.observeDynamicContent();
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', onReady);
            } else {
                onReady();
            }
        }
        
        loadWatchlist() {
            try {
                const data = localStorage.getItem(this.storageKey);
                if (!data) return [];
                const parsed = JSON.parse(data);
                if (!Array.isArray(parsed)) return [];
                
                const now = Date.now();
                const validItems = [];
                const expiredIds = [];
                
                parsed.forEach(item => {
                    if (!item || !item.itemId) return;
                    
                    const normalized = {
                        ...item,
                        addedAt: item.addedAt || now,
                        expiresAt: item.expiresAt || ((item.addedAt || now) + this.expiryDurationMs)
                    };
                    
                    const hasCookie = this.hasItemCookie(normalized.itemId);
                    const isExpired = normalized.expiresAt <= now;
                    
                    if (isExpired) {
                        expiredIds.push(normalized.itemId);
                        return;
                    }
                    
                    validItems.push(normalized);
                    
                    if (!hasCookie) {
                        this.setItemCookie(normalized.itemId);
                    }
                });
                
                if (expiredIds.length) {
                    expiredIds.forEach(id => this.deleteItemCookie(id));
                }
                
                validItems.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
                
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(validItems));
                } catch (_) {}
                
                return validItems;
            } catch (err) {
                console.warn('Unable to load watch list, resetting...', err);
                return [];
            }
        }

        loadFavorites() {
            try {
                const data = localStorage.getItem(this.favoritesStorageKey);
                if (!data) return [];
                const parsed = JSON.parse(data);
                if (!Array.isArray(parsed)) return [];

                const now = Date.now();
                const validItems = [];
                
                parsed.forEach(item => {
                    if (!item || !item.itemId) return;
                    const addedAt = item.addedAt || now;
                    const expiresAt = item.expiresAt || (addedAt + this.expiryDurationMs);
                    
                    // Skip anything older than the configured lifespan
                    if (expiresAt <= now) {
                        return;
                    }

                    const normalized = {
                        ...item,
                        addedAt,
                        expiresAt
                    };
                    validItems.push(normalized);
                });

                validItems.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
                try {
                    localStorage.setItem(this.favoritesStorageKey, JSON.stringify(validItems));
                } catch (_) {}
                return validItems;
            } catch (err) {
                console.warn('Unable to load favorites, resetting...', err);
                return [];
            }
        }
        
        prepareAllItems() {
            const items = document.querySelectorAll('.slide-item');
            items.forEach(item => {
                const itemId = this.ensureItemId(item);
                this.cacheItemSnapshot(item, itemId);
            });
        }
        
        saveWatchlist() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.watchlist));
            } catch (err) {
                console.warn('Failed to save watch list', err);
            }
        }

        saveFavorites() {
            try {
                localStorage.setItem(this.favoritesStorageKey, JSON.stringify(this.favorites));
            } catch (err) {
                console.warn('Failed to save favorites', err);
            }
        }
        
        setupPageControls() {
            const clearButton = document.getElementById('watchlist-clear-all');
            if (clearButton) {
                clearButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!this.watchlist.length) {
                        this.showNotification('Your watch list is already empty.', 'info');
                        return;
                    }
                        const previousItems = [...this.watchlist];
                        this.watchlist = [];
                        this.saveWatchlist();
                        previousItems.forEach(item => this.deleteItemCookie(item.itemId));
                        this.renderWatchlistPage();
                        this.markExistingItems();
                        this.showNotification('Watch list cleared.', 'info');
                });
            }

            const favoritesClearButton = document.getElementById('favorites-clear-all');
            if (favoritesClearButton) {
                favoritesClearButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!this.favorites.length) {
                        this.showNotification('Your favorites list is already empty.', 'info');
                        return;
                    }
                    this.favorites = [];
                    this.saveFavorites();
                    this.renderFavoritesPage();
                    this.showNotification('Favorites cleared.', 'info');
                });
            }
        }
        
        setupPlusButtonListener() {
            document.addEventListener('click', (e) => {
                const plusIcon = e.target.closest('.fa-plus');
                const heartIcon = e.target.closest('.fa-heart');
                if (!plusIcon && !heartIcon) return;
                
                const slideItem = (plusIcon || heartIcon).closest('[data-item-id]') || (plusIcon || heartIcon).closest('.slide-item');
                if (!slideItem) return;
                
                e.preventDefault();
                e.stopPropagation();
                if (typeof e.stopImmediatePropagation === 'function') {
                    e.stopImmediatePropagation();
                }
                
                const itemId = this.ensureItemId(slideItem);
                this.cacheItemSnapshot(slideItem, itemId);
                const isPlus = !!plusIcon;

                if (isPlus) {
                    const existingIndex = this.watchlist.findIndex(item => item.itemId === itemId);
                    if (existingIndex !== -1) {
                        const removedItem = this.watchlist.splice(existingIndex, 1)[0];
                        this.saveWatchlist();
                        this.deleteItemCookie(itemId);
                        this.markExistingItems();
                        this.renderWatchlistPage();
                        const title = removedItem && removedItem.title ? removedItem.title : 'Title';
                        this.showNotification(`${title} removed from watch list.`, 'info');
                        return;
                    }
                } else {
                    const existingFavIndex = this.favorites.findIndex(item => item.itemId === itemId);
                    if (existingFavIndex !== -1) {
                        const removedFav = this.favorites.splice(existingFavIndex, 1)[0];
                        this.saveFavorites();
                        this.renderFavoritesPage();
                        
                        // Also remove from likes system when removing from favorites
                        if (window.likeSystem && typeof window.likeSystem.toggleLike === 'function') {
                            const wasLiked = window.likeSystem.hasUserLiked(itemId);
                            if (wasLiked) {
                                window.likeSystem.toggleLike(itemId);
                            } else {
                                // Just update the UI to show current count
                                window.likeSystem.updateItemUI(itemId);
                                window.likeSystem.updateAllItemInstances(itemId);
                            }
                        }
                        
                        const title = removedFav && removedFav.title ? removedFav.title : 'Title';
                        this.showNotification(`${title} removed from favorites.`, 'info');
                        return;
                    }
                }

                const itemData = this.extractItemData(slideItem, itemId);
                if (!itemData) return;

                if (isPlus) {
                    this.watchlist.push(itemData);
                    this.watchlist.sort((a, b) => a.addedAt - b.addedAt);
                    this.saveWatchlist();
                    this.setItemCookie(itemId);
                    this.markExistingItems();
                    this.renderWatchlistPage();
                    this.showNotification(`${itemData.title} added to watch list!`, 'success');
                } else {
                    this.favorites.push(itemData);
                    this.favorites.sort((a, b) => a.addedAt - b.addedAt);
                    this.saveFavorites();
                    this.renderFavoritesPage();
                    
                    // Also add to likes system when adding to favorites - this increments the like counter
                    if (window.likeSystem && typeof window.likeSystem.toggleLike === 'function') {
                        const isLiked = window.likeSystem.hasUserLiked(itemId);
                        if (!isLiked) {
                            window.likeSystem.toggleLike(itemId);
                        } else {
                            // Just update the UI to show current count
                            window.likeSystem.updateItemUI(itemId);
                            window.likeSystem.updateAllItemInstances(itemId);
                        }
                    }
                    
                    this.showNotification(`${itemData.title} added to favorites!`, 'success');
                }
            }, true);
        }
        
        ensureItemId(slideItem) {
            if (!slideItem) return 'watch-item';

            // If already set, reuse it to keep persistence stable
            const existing = slideItem.getAttribute('data-item-id');
            if (existing) return existing;

            // Build a stable, deterministic ID based on visible data
            const titleElement = slideItem.querySelector('.iq-title a, .iq-title');
            const sectionEl = slideItem.closest('section');
            const imageEl = slideItem.querySelector('.img-box img');

            const title = titleElement ? titleElement.textContent.trim().toLowerCase() : '';
            const section = sectionEl ? (sectionEl.querySelector('.main-title') ? sectionEl.querySelector('.main-title').textContent.trim().toLowerCase() : '') : '';
            const imageSrc = imageEl ? imageEl.getAttribute('src') || '' : '';

            const slugify = (str) => {
                return (str || '')
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            };

            const titleSlug = slugify(title);
            const sectionSlug = slugify(section);
            const imageSlug = slugify(imageSrc.split('/').pop() || '');

            let parts = [titleSlug, sectionSlug, imageSlug].filter(Boolean);
            if (!parts.length) {
                parts = ['item'];
            }

            const itemId = parts.join('-');
            slideItem.setAttribute('data-item-id', itemId);
            return itemId;
        }
        
        extractItemData(slideItem, itemId) {
            if (!slideItem) return null;
            const payload = this.getCachedPayload(slideItem, itemId);
            if (!payload) return null;
            const finalId = itemId || payload.itemId || this.ensureItemId(slideItem);
            const addedAt = Date.now();
            return {
                ...payload,
                itemId: finalId,
                addedAt,
                expiresAt: addedAt + this.expiryDurationMs
            };
        }
        
        observeDynamicContent() {
            try {
                const observer = new MutationObserver((mutations) => {
                    let didProcess = false;
                    
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (this.handlePotentialSlideNode(node)) {
                                didProcess = true;
                            }
                        });
                    });
                    
                    if (didProcess) {
                        if (this.pendingMutationUpdate) {
                            clearTimeout(this.pendingMutationUpdate);
                        }
                        this.pendingMutationUpdate = setTimeout(() => {
                            this.markExistingItems();
                        }, 120);
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            } catch (err) {
                console.warn('Watch list mutation observer failed', err);
            }
        }
        
        getCachedPayload(slideItem, itemId) {
            if (!slideItem) return null;
            const raw = slideItem.getAttribute('data-watchlist-payload');
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (itemId && !parsed.itemId) {
                        parsed.itemId = itemId;
                    }
                    return parsed;
                } catch (error) {
                    slideItem.removeAttribute('data-watchlist-payload');
                }
            }
            return this.cacheItemSnapshot(slideItem, itemId);
        }
        
        cacheItemSnapshot(slideItem, itemId) {
            const payload = this.buildItemPayload(slideItem, itemId);
            if (!payload) return null;
            try {
                slideItem.setAttribute('data-watchlist-payload', JSON.stringify(payload));
            } catch (error) {
                // ignore storage issues for attribute serialization
            }
            return payload;
        }
        
        buildItemPayload(slideItem, itemId) {
            if (!slideItem) return null;
            try {
                const titleElement = slideItem.querySelector('.iq-title a, .iq-title');
                const title = titleElement ? titleElement.textContent.trim() : 'Untitled';
                
                const imgElement = slideItem.querySelector('.img-box img');
                let image = imgElement ? (imgElement.getAttribute('data-watchlist-src') || imgElement.getAttribute('src')) : '';
                if (image && window.location && window.location.origin && image.startsWith(window.location.origin)) {
                    image = image.replace(window.location.origin + '/', '');
                }
                
                const badgeElement = slideItem.querySelector('.movie-time .badge');
                const badge = badgeElement ? badgeElement.textContent.trim() : '';
                
                let duration = '';
                const durationElement = slideItem.querySelector('.movie-time span.text-white');
                if (durationElement) {
                    duration = durationElement.textContent.trim();
                } else {
                    const spans = Array.from(slideItem.querySelectorAll('.movie-time span')).filter(span => !span.classList.contains('sequel-tag') && !span.classList.contains('badge'));
                    duration = spans.length ? spans[0].textContent.trim() : '';
                }
                
                const tagElement = slideItem.querySelector('.movie-time .sequel-tag');
                const tag = tagElement ? tagElement.textContent.trim() : '';
                
                // Try data-video-link first, then fallback to data-video-id
                const videoButton = slideItem.querySelector('.iq-button[data-video-link], .iq-button[data-video-id]');
                const videoLink = videoButton ? (videoButton.getAttribute('data-video-link') || videoButton.getAttribute('data-video-id')) : '';
                const videoId = videoLink; // Keep for backward compatibility
                const videoTitle = videoButton ? (videoButton.getAttribute('data-title') || title) : title;
                
                // Optional custom links if provided on the slide item
                const customWatchUrl = slideItem.getAttribute('data-watch-url') || '';
                const customDownloadUrl = slideItem.getAttribute('data-download-url') || '';
                // Get video link - if it's not a full URL, convert it
                const derivedWatchUrl = videoLink ? (videoLink.startsWith('http://') || videoLink.startsWith('https://') ? videoLink : (typeof getVideoLink === 'function' ? getVideoLink(videoLink) : `https://videopress.com/embed/${videoLink}`)) : '';
                
                const descriptionEl = slideItem.querySelector('.block-description p');
                const description = descriptionEl ? descriptionEl.textContent.trim() : '';
                
                let sourceSection = '';
                const sectionEl = slideItem.closest('section');
                if (sectionEl) {
                    const sectionTitle = sectionEl.querySelector('.main-title');
                    if (sectionTitle) {
                        sourceSection = sectionTitle.textContent.trim();
                    }
                }
                
                return {
                    itemId: itemId || slideItem.getAttribute('data-item-id') || '',
                    title,
                    image,
                    badge,
                    duration,
                    tag,
                    videoId,
                    videoTitle,
                    description,
                    sourceSection,
                    watchUrl: customWatchUrl || derivedWatchUrl,
                    downloadUrl: customDownloadUrl
                };
            } catch (error) {
                console.warn('Failed to build watch list payload', error);
                return null;
            }
        }
        
        handlePotentialSlideNode(node) {
            if (!node || node.nodeType !== Node.ELEMENT_NODE) {
                return false;
            }
            
            let processed = false;
            
            if (node.classList && node.classList.contains('slide-item')) {
                const nodeId = this.ensureItemId(node);
                this.cacheItemSnapshot(node, nodeId);
                processed = true;
            }
            
            if (node.querySelectorAll) {
                const nested = node.querySelectorAll('.slide-item');
                if (nested.length) {
                    nested.forEach(slide => {
                        const id = this.ensureItemId(slide);
                        this.cacheItemSnapshot(slide, id);
                    });
                    processed = true;
                }
            }
            
            return processed;
        }
        
        markExistingItems() {
            const savedIds = new Set(this.watchlist.map(item => item.itemId));
            const favoriteIds = new Set(this.favorites.map(item => item.itemId));
            const items = document.querySelectorAll('[data-item-id]');
            items.forEach(item => {
                const itemId = item.getAttribute('data-item-id');
                const plusIcon = item.querySelector('.fa-plus');
                const heartIcon = item.querySelector('.fa-heart');
                if (plusIcon) {
                    const plusWrapper = plusIcon.closest('span');
                    if (savedIds.has(itemId)) {
                        plusIcon.classList.add('in-watchlist');
                        if (plusWrapper) {
                            plusWrapper.classList.add('watchlist-added');
                            plusWrapper.setAttribute('title', 'Remove from Watch List');
                        }
                    } else {
                        plusIcon.classList.remove('in-watchlist');
                        if (plusWrapper) {
                            plusWrapper.classList.remove('watchlist-added');
                            plusWrapper.removeAttribute('title');
                        }
                    }
                }
                if (heartIcon) {
                    const heartWrapper = heartIcon.closest('span');
                    if (favoriteIds.has(itemId)) {
                        heartIcon.classList.add('in-favorites');
                        if (heartWrapper) {
                            heartWrapper.classList.add('favorites-added');
                            heartWrapper.setAttribute('title', 'Remove from Favorites');
                        }
                    } else {
                        heartIcon.classList.remove('in-favorites');
                        if (heartWrapper) {
                            heartWrapper.classList.remove('favorites-added');
                            heartWrapper.removeAttribute('title');
                        }
                    }
                }
            });
        }
        
        renderWatchlistPage() {
            const latestList = document.getElementById('watchlist-latest-list');
            const allList = document.getElementById('watchlist-all-list');
            if (!latestList && !allList) return;
            
            const sortedItems = [...this.watchlist].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
            const activeItems = [];
            const expiredIds = [];
            const now = Date.now();
            
            sortedItems.forEach(item => {
                if (this.isItemActive(item, now)) {
                    activeItems.push(item);
                } else {
                    expiredIds.push(item.itemId);
                }
            });
            
            if (expiredIds.length) {
                this.watchlist = this.watchlist.filter(item => !expiredIds.includes(item.itemId));
                expiredIds.forEach(id => this.deleteItemCookie(id));
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(this.watchlist));
                } catch (_) {}
            }
            
            if (latestList) {
                this.resetSlider(latestList);
                const latestItems = activeItems.slice(-10).reverse();
                latestItems.forEach(item => {
                    latestList.appendChild(this.createWatchlistSlide(item));
                });
                const latestEmptyState = document.querySelector('.watchlist-empty[data-section="latest"]');
                this.toggleEmptyState(latestEmptyState, latestItems.length === 0, latestList);
                this.updateCount('watchlist-latest-count', latestItems.length);
                this.activateSlider(latestList);
            }
            
            if (allList) {
                this.resetSlider(allList);
                activeItems.forEach(item => {
                    allList.appendChild(this.createWatchlistSlide(item));
                });
                const allEmptyState = document.querySelector('.watchlist-empty[data-section="all"]');
                this.toggleEmptyState(allEmptyState, activeItems.length === 0, allList);
                this.updateCount('watchlist-all-count', activeItems.length);
                this.activateSlider(allList);
            }
            
            this.prepareAllItems();
            this.markExistingItems();
        }

        renderFavoritesPage() {
            const latestList = document.getElementById('favorites-latest-list');
            const allList = document.getElementById('favorites-all-list');
            if (!latestList && !allList) return;

            const sortedItems = [...this.favorites].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
            const activeItems = [...sortedItems];

            if (latestList) {
                this.resetSlider(latestList);
                const latestItems = activeItems.slice(-10).reverse();
                latestItems.forEach(item => {
                    latestList.appendChild(this.createWatchlistSlide(item));
                });
                const latestEmptyState = document.querySelector('.watchlist-empty[data-section="favorites-latest"]');
                this.toggleEmptyState(latestEmptyState, latestItems.length === 0, latestList);
                this.updateCount('favorites-latest-count', latestItems.length);
                this.activateSlider(latestList);
            }

            if (allList) {
                this.resetSlider(allList);
                activeItems.forEach(item => {
                    allList.appendChild(this.createWatchlistSlide(item));
                });
                const allEmptyState = document.querySelector('.watchlist-empty[data-section="favorites-all"]');
                this.toggleEmptyState(allEmptyState, activeItems.length === 0, allList);
                this.updateCount('favorites-all-count', activeItems.length);
                this.activateSlider(allList);
            }

            this.prepareAllItems();
            this.markExistingItems();
        }
        
        resetSlider(listElement) {
            if (!listElement) return;
            if (typeof jQuery !== 'undefined') {
                const $slider = jQuery(listElement);
                if ($slider.hasClass('slick-initialized')) {
                    try {
                        $slider.slick('unslick');
                    } catch (_) {}
                }
            }
            listElement.innerHTML = '';
        }
        
        activateSlider(listElement) {
            if (!listElement) return;
            if (typeof jQuery === 'undefined') return;
            const $slider = jQuery(listElement);
            if (!$slider.length) return;
            if (!$slider.children('.slide-item').length) return;
            
            try {
                $slider.slick(this.sliderOptions);
            } catch (err) {
                console.warn('Failed to initialize watch list slider', err);
            }
        }
        
        toggleEmptyState(messageElement, isEmpty, listElement) {
            if (messageElement) {
                messageElement.style.display = isEmpty ? 'block' : 'none';
            }
            if (listElement) {
                const container = listElement.closest('.favorite-contens');
                if (container) {
                    container.style.display = isEmpty ? 'none' : 'block';
                }
            }
        }
        
        updateCount(elementId, count) {
            if (!elementId) return;
            const element = document.getElementById(elementId);
            if (!element) return;
            if (!count) {
                element.textContent = '';
                element.style.display = 'none';
                return;
            }
            const label = count === 1 ? 'title' : 'titles';
            element.textContent = `${count} ${label}`;
            element.style.display = 'block';
        }
        
        isItemActive(item, now = Date.now()) {
            if (!item || !item.itemId) return false;
            let expiresAt = item.expiresAt;
            if (!expiresAt) {
                expiresAt = (item.addedAt || now) + this.expiryDurationMs;
                item.expiresAt = expiresAt;
            }
            if (expiresAt <= now) {
                return false;
            }
            if (!this.hasItemCookie(item.itemId)) {
                this.setItemCookie(item.itemId);
            }
            return true;
        }
        
        createWatchlistSlide(item) {
            const li = document.createElement('li');
            li.className = 'slide-item';
            li.setAttribute('data-item-id', item.itemId);
            li.setAttribute('data-added-at', item.addedAt || Date.now());
            
            const imageSrc = item.image && item.image.trim() ? item.image : 'images/favorite/f1.jpg';
            const safeTitle = this.escapeHtml(item.title || 'Saved Title');
            const badgeMarkup = item.badge ? `<div class="badge badge-secondary p-1 mr-2">${this.escapeHtml(item.badge)}</div>` : '';
            const durationMarkup = item.duration ? `<span class="text-white">${this.escapeHtml(item.duration)}</span>` : '';
            const tagMarkup = item.tag ? `<span class="sequel-tag">${this.escapeHtml(item.tag)}</span>` : '';
            const sourceMarkup = item.sourceSection ? `<p class="watchlist-source text-white-50 mb-2">Saved from ${this.escapeHtml(item.sourceSection)}</p>` : '';
            const descriptionMarkup = item.description ? `<p class="watchlist-description text-white-50 mb-0">${this.escapeHtml(item.description)}</p>` : '';
            const watchHref = item.watchUrl && String(item.watchUrl).trim();
            const downloadHref = item.downloadUrl && String(item.downloadUrl).trim();
            // Watch Full Movie button removed
            const downloadMarkup = downloadHref ? `
                <div class="hover-buttons mt-2">
                    <a class="btn btn-outline btn-download" href="${this.escapeAttribute(downloadHref)}" download>
                        <i class="fa fa-download mr-1"></i>
                        Download
                    </a>
                </div>
            ` : '';
            
            li.innerHTML = `
                <div class="block-images position-relative">
                    <div class="img-box">
                        <img src="${this.escapeAttribute(imageSrc)}" class="img-fluid" alt="${this.escapeAttribute(safeTitle)}" />
                    </div>
                    <div class="block-description">
                        <h6 class="iq-title">
                            <a href="#"> ${safeTitle} </a>
                        </h6>
                        <div class="movie-time d-flex align-items-center my-2">
                            ${badgeMarkup}
                            ${durationMarkup}
                            ${tagMarkup}
                        </div>
                        ${sourceMarkup}
                        ${descriptionMarkup}
                        ${playMarkup}
                        ${downloadMarkup}
                    </div>
                    <div class="block-social-info">
                        <ul class="list-inline p-0 m-0 music-play-lists">
                            <li class="share">
                                <span><i class="fa fa-share-alt"></i></span>
                                <div class="share-box">
                                    <div class="d-flex align-items-center">
                                        <a href="#" class="share-ico"><i class="fa fa-facebook"></i></a>
                                        <a href="#" class="share-ico"><i class="fa fa-youtube"></i></a>
                                        <a href="#" class="share-ico"><i class="fa fa-instagram"></i></a>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <span><i class="fa fa-heart"></i></span>
                                <span class="count-box">0+</span>
                            </li>
                            <li>
                                <span><i class="fa fa-plus"></i></span>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
            
            const payload = {
                itemId: item.itemId,
                title: item.title,
                image: imageSrc,
                badge: item.badge,
                duration: item.duration,
                tag: item.tag,
                videoId: item.videoId,
                videoTitle: item.videoTitle,
                description: item.description,
                sourceSection: item.sourceSection,
                expiresAt: item.expiresAt
            };
            try {
                li.setAttribute('data-watchlist-payload', JSON.stringify(payload));
            } catch (_) {
                // ignore attribute serialization issues
            }
            
            return li;
        }
        
        escapeHtml(value) {
            if (value == null) return '';
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
        
        escapeAttribute(value) {
            if (value == null) return '';
            return String(value).replace(/"/g, '&quot;');
        }
        
        showNotification(message, type = 'info') {
            try {
                if (window.likeSystem && typeof window.likeSystem.showNotification === 'function') {
                    window.likeSystem.showNotification(message, type);
                    return;
                }
            } catch (_) {}
            
            // Fallback basic alert
            console.log(`[Watchlist] ${message}`);
        }
        
        setItemCookie(itemId) {
            if (!itemId) return;
            this.setCookie(this.cookiePrefix + itemId, '1', this.cookieLifetimeDays);
        }
        
        deleteItemCookie(itemId) {
            if (!itemId) return;
            this.setCookie(this.cookiePrefix + itemId, '', -1);
        }
        
        hasItemCookie(itemId) {
            if (!itemId) return false;
            return this.getCookie(this.cookiePrefix + itemId) === '1';
        }
        
        setCookie(name, value, days) {
            try {
                const expires = days ? new Date(Date.now() + days * 86400000).toUTCString() : 'Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
            } catch (error) {
                console.warn('Failed to set watch list cookie', error);
            }
        }
        
        getCookie(name) {
            try {
                const decodedCookie = decodeURIComponent(document.cookie || '');
                const target = `${encodeURIComponent(name)}=`;
                const parts = decodedCookie.split(';');
                for (let part of parts) {
                    part = part.trim();
                    if (part.startsWith(target)) {
                        return part.substring(target.length);
                    }
                }
            } catch (error) {
                console.warn('Failed to read watch list cookie', error);
            }
            return null;
        }
    }
    
    const watchlistManager = new WatchlistManager();
    window.watchlistManager = watchlistManager;
    
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
            jQuery(window).on('scroll', function() {
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
            autoplay : true,
            autoplaySpeed : 10000, // Slide automatically every 10 seconds
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
                    items : 2
                },
                600: {
                    items : 2
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
        
        // Ensure season switching works with both native selects and Select2
        // Only react to season changes for the currently playing series
        function isSelectForCurrentSeries(selectEl){
            try {
                const selectScope = selectEl.closest('.slide-item') || selectEl.closest('.trending-info');
                const selectBtn = selectScope ? selectScope.querySelector('.iq-button[data-video-id]') : null;
                const selectVideoId = selectBtn ? selectBtn.getAttribute('data-video-id') : null;
                const currentBtn = document.querySelector('.slide-item.current-movie .iq-button[data-video-id]');
                const currentId = currentBtn ? currentBtn.getAttribute('data-video-id') : null;
                return !!(selectVideoId && currentId && selectVideoId === currentId);
            } catch(_) { return false; }
        }

        jQuery(document).on('change', '.season-select', function(){
            if (!isSelectForCurrentSeries(this)) return;
            if (typeof window.switchSeasonEpisodes === 'function') {
                window.switchSeasonEpisodes(this);
            }
            if (typeof window.renderEpisodesBelowPlayerFromSelect === 'function') {
                window.renderEpisodesBelowPlayerFromSelect(this);
            }
        });
        jQuery(document).on('select2:select', '.season-select', function(){
            if (!isSelectForCurrentSeries(this)) return;
            if (typeof window.switchSeasonEpisodes === 'function') {
                window.switchSeasonEpisodes(this);
            }
            if (typeof window.renderEpisodesBelowPlayerFromSelect === 'function') {
                window.renderEpisodesBelowPlayerFromSelect(this);
            }
        });
        // Also handle when dropdown closes without firing select (reselect same value)
        jQuery(document).on('select2:close', '.season-select', function(){
            if (!isSelectForCurrentSeries(this)) return;
            if (typeof window.switchSeasonEpisodes === 'function') {
                window.switchSeasonEpisodes(this);
            }
            if (typeof window.renderEpisodesBelowPlayerFromSelect === 'function') {
                window.renderEpisodesBelowPlayerFromSelect(this);
            }
        });
        
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
    // Default video link - using a real VideoPress embed URL
    var currentVideoId = 'https://videopress.com/embed/kUJmAcSf';
    // Track last series scope (the DOM block for the series the user interacted with)
    window.__lastSeriesScope = null;
    
    // Video data structure with sidebar information
    const videoData = {
        // Main Slider Videos
        // 
        // To add Watch Full Movie and Download links for each movie, add these properties:
        //   watchFullLink: 'https://your-link.com/watch/movie-name',
        //   downloadLink: 'https://your-link.com/download/movie-name'
        //   videoLink: 'https://videopress.com/embed/GUID' (REQUIRED for video playback - Jetpack VideoPress embed URL)
        //
        'kUJmAcSf': {
            image: 'images/trending/02.jpg',
            title: 'Pick Up',
            rating: 7.3,
            stars: 4,
            genres: ['Action', 'Adventure', 'Sci-Fi'],
            interpreter: ['Rocky'],
            tags: ['Superhero', 'Marvel', 'Comic Book'],
            description: 'When Tony Stark and Bruce Banner try to jump-start a dormant peacekeeping program called Ultron, things go horribly wrong and it\'s up to Earth\'s mightiest heroes to stop the villainous Ultron from enacting his terrible plan.',
            age: '12+',
            duration: '2h 21min',
            year: '2015',
            videoLink: 'https://videopress.com/embed/kUJmAcSf',
            downloadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'FLzfXQSPBOg': {
            image: 'images/trending/03.jpg',
            title: '1917',
            rating: 7.4,
            stars: 4,
            genres: ['Animation', 'Adventure', 'Comedy'],
            interpreter: ['Rocky'],
            tags: ['Disney', 'Musical', 'Family'],
            description: 'When the newly crowned Queen Elsa accidentally uses her power to turn things into ice to curse her home in infinite winter, her sister Anna teams up with a mountain man, his playful reindeer, and a snowman to change the weather condition.',
            age: '13+',
            duration: '1h 42min',
            year: '2013',
            videoLink: 'https://videopress.com/embed/FLzfXQSPBOg',
            downloadLink: 'https://cdn.example.com/download/frozen.mp4'
        },
        'k10ETZ41q5o': {
            image: 'images/trending/04.jpg',
            title: 'Work It',
            rating: 7.5,
            stars: 4.5,
            genres: ['Horror', 'Mystery', 'Thriller'],
            interpreter: ['Rocky'],
            tags: ['Supernatural', 'Haunted House', 'True Story'],
            description: 'Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.',
            age: '16+',
            duration: '1h 52min',
            year: '2013',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://cdn.example.com/download/the-conjuring.mp4'
        },
        '02-XkOLVnIU': {
            image: 'images/popular/u2.jpg',
            title: 'afterburn',
            rating: 7.0,
            stars: 4.5,
            genres: ['Action', 'Adventure', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['Disney', 'Live Action', 'Warrior'],
            description: 'A young Chinese maiden disguises herself as a male warrior in order to save her father.',
            age: '10+',
            duration: '2h 0min',
            year: '2020',
            videoLink: 'https://videopress.com/embed/02-XkOLVnIU',
            downloadLink: 'https://cdn.example.com/download/mulan-2020.mp4'
        },
        '8jLOx1hD3_o': {
            image: 'images/popular/u3.jpg',
            title: 'Death Race',
            rating: 6.5,
            stars: 4.5,
            genres: ['Comedy', 'Horror', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['Bollywood', 'Supernatural', 'Comedy'],
            description: 'A man gets possessed by a ghost and starts behaving like a woman.',
            age: '18+',
            duration: '2h 21min',
            year: '2020',
            videoLink: 'https://videopress.com/embed/8jLOx1hD3_o',
            downloadLink: 'https://cdn.example.com/download/laxmii.mp4'
        },
        'W4DlMggBPvc': {
            image: 'images/popular/u4.jpg',
            title: 'Homefront',
            rating: 6.9,
            stars: 4,
            genres: ['Action', 'Adventure', 'Sci-Fi'],
            interpreter: ['Rocky'],
            tags: ['Marvel', 'Superhero', 'World War II'],
            description: 'Steve Rogers, a rejected military soldier, transforms into Captain America after taking a dose of a "Super-Soldier serum".',
            age: '12+',
            duration: '2h 4min',
            year: '2011',
            videoLink: 'https://videopress.com/embed/W4DlMggBPvc',
            downloadLink: 'https://cdn.example.com/download/captain-america-the-first-avenger.mp4'
        },
        'sDYVdxFZq8Y': {
            image: 'images/popular/u5.jpg',
            title: 'Mayhem',
            rating: 7.9,
            stars: 4,
            genres: ['Adventure', 'Drama', 'Fantasy'],
            interpreter: ['Rocky'],
            tags: ['Survival', 'Ocean', 'Philosophy'],
            description: 'A young man who survives a disaster at sea is hurtled into an epic journey of adventure and discovery.',
            age: '11+',
            duration: '2h 7min',
            year: '2012',
            videoLink: 'https://videopress.com/embed/sDYVdxFZq8Y',
            downloadLink: 'https://cdn.example.com/download/life-of-pi.mp4'
        },
        'q78_0TElYME': {
            image: 'images/trending/01.jpg',
            title: 'Shadow Force',
            rating: 6.8,
            stars: 3,
            genres: ['Drama', 'Sci-Fi', 'Thriller'],
            interpreter: ['Rocky'],
            tags: ['Space', 'India', 'ISRO'],
            description: 'Based on true events of the Indian Space Research Organisation (ISRO) successfully launching the Mars Orbiter Mission.',
            age: '12+',
            duration: '2h 10min',
            year: '2019',
            videoLink: 'https://videopress.com/embed/q78_0TElYME',
            downloadLink: 'https://cdn.example.com/download/mission-mangal.mp4'
        },
        'acEoQpJq0qg': {
            image: 'images/trending/05.jpg',
            title: 'Hunting jessica',
            rating: 6.2,
            stars: 3,
            genres: ['Horror', 'Mystery', 'Thriller'],
            interpreter: ['Rocky'],
            tags: ['Supernatural', 'Haunting', 'Sequel'],
            description: 'Paranormal investigator Elise Rainier faces her most fearsome and personal haunting yet.',
            age: '16+',
            duration: '1h 43min',
            year: '2018',
            videoLink: 'https://videopress.com/embed/acEoQpJq0qg',
            downloadLink: 'https://cdn.example.com/download/insidious-the-last-key.mp4'
        },
        'yQ5U8suTUw0': {
            image: 'images/trending/06.jpg',
            title: 'Frankenstein',
            rating: 7.1,
            stars: 4,
            genres: ['Action', 'Thriller', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['Bollywood', 'Spy', 'Revenge'],
            description: 'An Indian soldier is assigned to eliminate his mentor who has gone rogue.',
            age: '12+',
            duration: '2h 34min',
            year: '2019',
            videoLink: 'https://videopress.com/embed/yQ5U8suTUw0',
            downloadLink: 'https://cdn.example.com/download/war-2019.mp4'
        },
        '4qf9Uyn2acE': {
            image: 'images/slider/slider1.jpg',
            title: 'Texas Chain',
            rating: 7.2,
            stars: 4,
            genres: ['Drama', 'Romance'],
            interpreter: ['Rocky'],
            tags: ['Teen', 'Illness', 'Love Story'],
            description: 'A pair of teenagers with cystic fibrosis meet in a hospital and fall in love, though their disease means they must maintain a safe distance between them.',
            age: '18+',
            duration: '1h 56min',
            year: '2019',
            videoLink: 'https://videopress.com/embed/4qf9Uyn2acE',
            downloadLink: 'https://cdn.example.com/download/five-feet-apart.mp4'
        },
        'tsxemFXSQXQ': {
            image: 'images/slider/slider2.jpg',
            title: 'Woman in the yard',
            rating: 8.0,
            stars: 4,
            genres: ['Comedy', 'Drama'],
            interpreter: ['gaheza'],
            tags: ['College Life', 'Friendship', 'Nostalgia'],
            description: 'A tragic incident forces Anirudh, a middle-aged man, to take a trip down memory lane and reminisce his college days along with his friends.',
            age: '10+',
            duration: '2h 23min',
            year: '2019',
            videoLink: 'https://videopress.com/embed/tsxemFXSQXQ',
            downloadLink: 'https://cdn.example.com/download/chhichhore.mp4'
        },
        'Lt-U_t2pUHI': {
            image: 'images/slider/slider3.jpg',
            title: 'Hunting jessica brok',
            rating: 7.5,
            stars: 4,
            genres: ['Action', 'Adventure', 'Fantasy'],
            interpreter: ['gaheza'],
            tags: ['Marvel', 'Magic', 'Superhero'],
            description: 'While on a journey of physical and spiritual healing, a brilliant neurosurgeon is drawn into the world of the mystic arts.',
            age: '12+',
            duration: '1h 55min',
            year: '2016',
            videoLink: 'https://videopress.com/embed/Lt-U_t2pUHI',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'VyHV0BtdCW4': {
            image: 'images/top-10/01.jpg',
            title: 'Next',
            rating: 7.6,
            stars: 4,
            genres: ['Adventure', 'Family', 'Fantasy'],
            interpreter: ['gaheza'],
            tags: ['Magic', 'Wizard', 'School'],
            description: 'An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.',
            age: '10+',
            duration: '2h 32min',
            year: '2001',
            videoLink: 'https://videopress.com/embed/VyHV0BtdCW4',
            downloadLink: 'https://cdn.example.com/download/harry-potter-and-the-sorcerers-stone.mp4'
        },
        'CDrieqs-S54': {
            image: 'images/top-10/02.jpg',
            title: 'Lou',
            rating: 8.6,
            stars: 5,
            genres: ['Drama', 'Sport'],
            interpreter: ['gaheza'],
            tags: ['Chess', 'Genius', 'Addiction'],
            description: 'Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA.',
            age: '18+',
            duration: '6h 47min',
            year: '2020',
            videoLink: 'https://videopress.com/embed/CDrieqs-S54',
            downloadLink: 'https://cdn.example.com/download/the-queens-gambit.mp4'
        },
        'b9EkMc79ZSU': {
            image: 'images/top-10/03.jpg',
            title: 'F1: The movie',
            rating: 8.7,
            stars: 4.5,
            genres: ['Drama', 'Fantasy', 'Horror'],
            interpreter: ['Gaheza'],
            tags: ['Supernatural', 'Kids', '80s'],
            description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
            age: '16+',
            duration: '3 Seasons',
            year: '2016',
            videoLink: 'https://videopress.com/embed/b9EkMc79ZSU',
            downloadLink: 'https://cdn.example.com/download/stranger-things.mp4'
        },
        'i1eJMig5Ik4': {
            image: 'images/top-10/04.jpg',
            title: 'Play dirty',
            rating: 8.8,
            stars: 5,
            genres: ['Animation', 'Comedy', 'Drama'],
            interpreter: ['Gaheza'],
            tags: ['Adult Animation', 'Depression', 'Hollywood'],
            description: 'BoJack Horseman was the star of the hit television show "Horsin\' Around" in the \'80s and \'90s, but now he\'s washed up.',
            age: '15+',
            duration: '6 Seasons',
            year: '2014',
            videoLink: 'https://videopress.com/embed/i1eJMig5Ik4',
            downloadLink: 'https://cdn.example.com/download/bojack-horseman.mp4'
        },
        'oVzVdvLeICg': {
            image: 'images/top-10/05.jpg',
            title: 'Ice road: Vegence',
            rating: 8.8,
            stars: 5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Gaheza'],
            tags: ['Gangster', 'Historical', 'British'],
            description: 'A notorious gang in 1919 Birmingham, England, is led by the fierce Tommy Shelby, a crime boss set on moving up in the world no matter the cost.',
            age: '20+',
            duration: '5 Seasons',
            year: '2013',
            videoLink: 'https://videopress.com/embed/oVzVdvLeICg',
            downloadLink: 'https://cdn.example.com/download/peaky-blinders.mp4'
        },
        'L_jWHffIx5E': {
            image: 'images/top-10/06.jpg',
            title: 'Carpenter son',
            rating: 8.5,
            stars: 4,
            genres: ['Sports', 'Basketball'],
            tags: ['NBA', 'Highlights', 'Basketball'],
            description: 'Best moments and highlights from NBA basketball games featuring top players and teams.',
            age: 'All Ages',
            duration: 'Various',
            year: '2024',
            videoLink: 'https://videopress.com/embed/L_jWHffIx5E',
            downloadLink: 'https://cdn.example.com/download/nba-basketball-highlights.mp4'
        },
        '4fVCKy69zUY': {
            image: 'images/footer/01.jpg',
            title: 'PGA Golf Championship',
            rating: 8.2,
            stars: 4,
            genres: ['Sports', 'Golf'],
            tags: ['PGA', 'Golf', 'Championship'],
            description: 'Highlights from the PGA Golf Championship featuring top golfers and amazing shots.',
            age: 'All Ages',
            duration: 'Various',
            year: '2024',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        '5PSNL1qE6VY': {
            image: 'images/parallax/avatar.jpg',
            title: 'Avatar',
            rating: 7.8,
            stars: 4,
            genres: ['Action', 'Adventure', 'Fantasy'],
            tags: ['Sci-Fi', '3D', 'James Cameron'],
            description: 'A paraplegic marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
            age: '12+',
            duration: '2h 42min',
            year: '2009',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://cdn.example.com/download/avatar-2009.mp4'
        },
        'JWtnJjn6ngQ': {
            image: 'images/footer/02.jpg',
            title: 'The Crown',
            rating: 8.7,
            stars: 5,
            genres: ['Drama', 'History'],
            tags: ['Royal Family', 'British', 'Netflix'],
            description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the twentieth century.',
            age: '16+',
            duration: '4 Seasons',
            year: '2016',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://cdn.example.com/download/the-crown.mp4'
        },
        'WBb3fojjx-0': {
            image: 'images/episodes/bbt1.jpg',
            title: 'The Big Bang Theory',
            rating: 8.1,
            stars: 4,
            genres: ['Comedy', 'Romance'],
            tags: ['Sitcom', 'Scientists', 'Friendship'],
            description: 'A woman who moves into an apartment across the hall from two brilliant but socially awkward physicists shows them how little they know about life outside of the laboratory.',
            age: '12+',
            duration: '12 Seasons',
            year: '2007',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://cdn.example.com/download/the-big-bang-theory.mp4'
        },
        'Ua0HdsbsDsA': {
            image: 'images/trending/01.jpg',
            title: 'Narcos',
            rating: 8.8,
            stars: 5,
            genres: ['Crime', 'Drama', 'Thriller'],
            tags: ['Drug Cartel', 'Colombia', 'True Story'],
            description: 'A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar, as well as the many other drug kingpins who plagued the country through the years.',
            age: '18+',
            duration: '3 Seasons',
            year: '2015',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://cdn.example.com/download/narcos.mp4'
        },
        'IEEbUfhFFM0': {
            image: 'images/favorite/f1.jpg',
            title: 'Friends',
            rating: 8.9,
            stars: 5,
            genres: ['Comedy', 'Romance'],
            tags: ['Sitcom', 'Friendship', 'Classic'],
            description: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.',
            age: '12+',
            duration: '10 Seasons',
            year: '1994',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
        },
        'ej3ioOneQ48': {
            image: 'images/episodes/m1.jpg',
            title: 'The Martian',
            rating: 8.0,
            stars: 4,
            genres: ['Adventure', 'Drama', 'Sci-Fi'],
            tags: ['Space', 'Survival', 'Mars'],
            description: 'An astronaut becomes stranded on Mars after his team assume him dead, and must rely on his ingenuity to find a way to signal to Earth that he is alive.',
            age: '12+',
            duration: '2h 24min',
            year: '2015',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://cdn.example.com/download/the-martian.mp4'
        },
        'n9tzhmJ5hFE': {
            image: 'images/trending/02.jpg',
            title: 'Unhinged',
            rating: 6.1,
            stars: 3,
            genres: ['Action', 'Thriller'],
            tags: ['Road Rage', 'Thriller', 'Russell Crowe'],
            description: 'After a confrontation with an unstable man at an intersection, a woman becomes the target of his rage.',
            age: '16+',
            duration: '1h 30min',
            year: '2020',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://cdn.example.com/download/unhinged.mp4'
        },
        'm4NC26Dk4dE': {
            image: 'images/trending/03.jpg',
            title: 'Kingsman: The Secret Service',
            rating: 7.7,
            stars: 4,
            genres: ['Action', 'Adventure', 'Comedy'],
            tags: ['Spy', 'British', 'Comedy'],
            description: 'A spy organization recruits an unrefined, but promising street kid into the agency\'s ultra-competitive training program, just as a global threat emerges from a twisted tech genius.',
            age: '16+',
            duration: '2h 9min',
            year: '2014',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://example.com/download/kingsman'
        },
        '36mnx8hNvEE': {
            image: 'images/trending/04.jpg',
            title: 'Casino Royale',
            rating: 8.0,
            stars: 4.5,
            genres: ['Action', 'Adventure', 'Thriller'],
            tags: ['James Bond', 'Spy', 'Daniel Craig'],
            description: 'After earning 00 status and a licence to kill, secret agent James Bond sets out on his first mission as 007. Bond must defeat a private banker to terrorists in a high stakes game of poker at Casino Royale.',
            age: '12+',
            duration: '2h 24min',
            year: '2006',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://example.com/download/casino-royale'
        },
        'Ohws8y572KE': {
            image: 'images/popular/u1.jpg',
            title: 'Mission: Impossible',
            rating: 7.1,
            stars: 4,
            genres: ['Action', 'Adventure', 'Thriller',],
            tags: ['Tom Cruise', 'Spy', 'Action'],
            description: 'An American agent, under false suspicion of disloyalty, must discover and expose the real spy without the help of his organization.',
            age: '12+',
            duration: '1h 50min',
            year: '1996',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        '8jLOx1hD3_': {
            image: 'images/episodes/m5.jpg',
            title: 'Mirzapur',
            rating: 8.4,
            stars: 4,
            genres: ['Action', 'Crime', 'Drama'],
            tags: ['Amazon Prime', 'Indian Series', 'Gangster'],
            description: 'A shocking incident at a wedding procession ignites a series of events entangling the lives of two families in the lawless city of Mirzapur.',
            age: '18+',
            duration: '2 Seasons',
            year: '2018',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://example.com/download/mirzapur'
        },
        'IEEbUfhFFM0': {
            image: 'images/favorite/f2.jpg',
            title: 'Friends',
            rating: 8.9,
            stars: 5,
            genres: ['Comedy', 'Romance'],
            tags: ['Sitcom', 'Friendship', 'Classic'],
            description: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.',
            age: '12+',
            duration: '10 Seasons',
            year: '1994',
            videoLink: 'https://videopress.com/embed/k10ETZ41q5o',
            downloadLink: 'https://example.com/download/friends'
        }
    };

    // Also expose videoData on the window so other modules (like search) can always see it
    if (typeof window !== 'undefined') {
        window.videoData = videoData;
    }

    // Helper function to find video data by video link
    function findVideoDataByLink(videoLink) {
        if (!videoLink) return null;
        
        // First, try to find by videoLink property
        for (const [key, data] of Object.entries(videoData)) {
            if (data && data.videoLink === videoLink) {
                return { key, data };
            }
        }
        
        // If not found, try to extract ID from link and look up by key
        // This handles backward compatibility
        const idMatch = videoLink.match(/([a-zA-Z0-9_-]{11})/);
        if (idMatch && videoData[idMatch[1]]) {
            return { key: idMatch[1], data: videoData[idMatch[1]] };
        }
        
        return null;
    }
    
    // Helper function to get video link from ID or link
    function getVideoLink(identifier) {
        if (!identifier) return null;
        
        // If it's already a full URL, return it
        if (identifier.startsWith('http://') || identifier.startsWith('https://')) {
            return identifier;
        }
        
        // Otherwise, treat it as an ID and look up in videoData
        const data = videoData[identifier];
        if (data && data.videoLink) {
            return data.videoLink;
        }
        
        // Fallback: construct VideoPress URL from ID
        return `https://videopress.com/embed/${identifier}`;
    }
    
    // Add per-movie watch/download links
    (function ensureVideoLinks() {
        Object.entries(videoData).forEach(([videoId, movie]) => {
            if (!movie) return;

            // Ensure videoLink exists - use real VideoPress embed URL
            // Using a real VideoPress video GUID for all videos
            if (!movie.videoLink) {
                movie.videoLink = 'https://videopress.com/embed/kUJmAcSf';
            }
        });
    })();

    // Default video data for unknown videos
    const defaultVideoData = {
        title: 'Movie Title',
        rating: 7.0,
        stars: 3,
        genres: ['Action', 'Adventure'],
        interpreter: ['English', 'Spanish'],
        tags: ['Action', 'Adventure'],
        description: 'Movie description goes here.',
        age: '12+',
        duration: '2h 0min',
        year: '2024',
        watchFullLink: null, // Add your watch full movie link here
        downloadLink: null   // Add your download link here
    };


    function sanitizeFilename(value) {
        if (!value) return 'nerflix_video';
        return value
            .toString()
            .trim()
            .replace(/[^a-z0-9]+/gi, '_')
            .replace(/^_+|_+$/g, '')
            .toLowerCase() || 'nerflix_video';
    }

    function displayNotification(message, type = 'info') {
        if (window.watchlistManager && typeof window.watchlistManager.showNotification === 'function') {
            window.watchlistManager.showNotification(message, type);
            return;
        }
        if (window.likeSystem && typeof window.likeSystem.showNotification === 'function') {
            window.likeSystem.showNotification(message, type);
            return;
        }
        console.log(`[Notification] ${type}: ${message}`);
    }

    function requestFullscreenOnElement(element) {
        if (!element) return;
        if (element.requestFullscreen) {
            element.requestFullscreen();
            return;
        }
        if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
            return;
        }
        if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
            return;
        }
        if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    function exitFullscreenFromDocument() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            return;
        }
        if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen();
            return;
        }
        if (document.mozFullScreenElement) {
            document.mozCancelFullScreen();
            return;
        }
        if (document.msFullscreenElement) {
            document.msExitFullscreen();
        }
    }

    function getVideoPlayerContainer() {
        return document.querySelector('.video-player-container');
    }

    // Helper to update the Jetpack VideoPress iframe in the video gallery
    function setGalleryVideoByLink(videoLink) {
        if (!videoLink) return;

        const iframe = document.getElementById('video-iframe');
        if (!iframe) {
            console.error('Video iframe (#video-iframe) not found');
            return;
        }

        // Use the video link directly for Jetpack VideoPress
        // If the link is not already an embed URL, convert it to embed format
        let embedUrl = videoLink;
        if (videoLink.includes('videopress.com/v/')) {
            // Convert videopress.com/v/guid to videopress.com/embed/guid
            embedUrl = videoLink.replace('/v/', '/embed/');
        } else if (!videoLink.includes('/embed/')) {
            // If it's a regular VideoPress URL, try to extract and convert
            const match = videoLink.match(/videopress\.com\/v\/([a-zA-Z0-9]+)/);
            if (match) {
                embedUrl = `https://videopress.com/embed/${match[1]}`;
            }
        }
        
        // Add autoplay parameter if not present
        if (!embedUrl.includes('autoplay')) {
            embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        
        iframe.src = embedUrl;

        // Store current video link
        currentVideoId = videoLink;
        
        // Update favorite and watchlist buttons
        setTimeout(function() {
            if (typeof updateFavoriteWatchlistButtons === 'function') {
                updateFavoriteWatchlistButtons();
            }
        }, 100);
    }
    
    // Keep old function name for backward compatibility, but it now expects video links
    function setGalleryVideoById(videoLink) {
        setGalleryVideoByLink(videoLink);
    }

    // Function to stop video
    function stopVideo() {
        const iframe = document.getElementById('video-iframe');
        if (iframe) {
            iframe.src = '';
        }
    }

    // Function to update sidebar content (accepts video ID or video link)
    function updateSidebarContent(videoIdOrLink) {
        let data = defaultVideoData;
        
        // Try to find video data by link first
        if (videoIdOrLink) {
            const found = findVideoDataByLink(videoIdOrLink);
            if (found) {
                data = found.data;
            } else if (videoData[videoIdOrLink]) {
                // Fallback: try direct lookup by ID
                data = videoData[videoIdOrLink];
            }
        }
        
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
        
        // Update interpreter (using tags structure, positioned below title)
        // Find the interpreter section which is the first tags-section after the title
        const interpreterSection = document.querySelector('.tags-section');
        if (interpreterSection) {
            const sectionLabel = interpreterSection.querySelector('.meta-label');
            // Check if this is the interpreter section (first tags-section after title)
            if (sectionLabel && sectionLabel.textContent.trim() === 'Interpreter:') {
                interpreterSection.classList.add('interpreter-section');
                const interpreterList = interpreterSection.querySelector('.tags-list');
                if (interpreterList) {
                    interpreterList.innerHTML = '';
                    if (data.interpreter && Array.isArray(data.interpreter)) {
                        data.interpreter.forEach(interpreter => {
                            const interpreterTag = document.createElement('span');
                            interpreterTag.className = 'tag-item';
                            interpreterTag.textContent = interpreter;
                            interpreterList.appendChild(interpreterTag);
                        });
                    }
                }
            }
        }
        
        // Update tags (the tags-section with "Tags:" label)
        const tagsSections = document.querySelectorAll('.tags-section');
        let tagsList = null;
        for (let i = 0; i < tagsSections.length; i++) {
            const sectionLabel = tagsSections[i].querySelector('.meta-label');
            if (sectionLabel && sectionLabel.textContent.trim() === 'Tags:') {
                tagsList = tagsSections[i].querySelector('.tags-list');
                break;
            }
        }
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
        
        // Update favorite and watchlist buttons
        if (typeof updateFavoriteWatchlistButtons === 'function') {
            setTimeout(function() {
                updateFavoriteWatchlistButtons();
            }, 100);
        }
    }
    
    // Video Gallery Event Handlers
    jQuery(document).ready(function() {
        const videoGallery = jQuery('#video-gallery-overlay');
        const closeBtn = jQuery('#close-video-gallery');
        // Select all play buttons: play now buttons, play icon buttons, and any iq-button with video data
        const playNowButtons = jQuery('.btn-hover.iq-button, .play-now-btn, .iq-button[data-video-link], .iq-button[data-video-id]');
        
        // Initialize video player with default video and update sidebar
        setGalleryVideoByLink(currentVideoId);
        updateSidebarContent(currentVideoId);
        
        // Initialize favorite and watchlist buttons after a delay
        setTimeout(function() {
            if (typeof updateFavoriteWatchlistButtons === 'function') {
                updateFavoriteWatchlistButtons();
            }
        }, 500);
        
                 // Close video gallery
         function closeVideoGallery() {
             videoGallery.removeClass('active');
             jQuery('body').css('overflow', 'auto').removeClass('video-gallery-active');
             
             // Stop video
             stopVideo();
             
             // Reset to default section
             showDefaultSection();
         }
         
         // Make closeVideoGallery function globally accessible
         window.closeVideoGallery = closeVideoGallery;
        
        // Event listeners for Play Now buttons and play icon buttons
        // These should always open the video gallery with their own video and sidebar
        playNowButtons.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get the video link from the button (prefer data-video-link, fallback to data-video-id for backward compatibility)
            const videoLink = jQuery(this).attr('data-video-link') || jQuery(this).attr('data-video-id') || '';
            const title = jQuery(this).attr('data-title') || 'Movie Title';
            
            if (!videoLink) {
                console.warn('No video link found for play button');
                return;
            }
            
            // If we got a video link, use it; otherwise try to get video link from videoData
            let finalVideoLink = videoLink;
            if (!finalVideoLink.startsWith('http://') && !finalVideoLink.startsWith('https://')) {
                // Treat as ID and get video link from videoData
                finalVideoLink = getVideoLink(videoLink);
                if (!finalVideoLink) {
                    // Fallback: construct videopress embed URL
                    finalVideoLink = `https://videopress.com/embed/${videoLink}`;
                }
            }
            
            // Remember the series scope where this click happened
            const scope = jQuery(this).closest('.trending-info, .slide-item, .block-images, .e-item').get(0);
            if (scope) {
                window.__lastSeriesScope = scope;
            }
            
            // Always open video gallery with the video link (for sidebar data and playback)
            // This ensures each video opens with its own sidebar content
            if (typeof openVideoGallery === 'function') {
                openVideoGallery(finalVideoLink, title);
            } else {
                console.error('openVideoGallery function not found');
            }
        });
        
        // Additional catch-all handler for any .iq-button clicks (play icon buttons)
        // These should always open the video gallery with their own video and sidebar
        jQuery(document).on('click', '.iq-button[data-video-link], .iq-button[data-video-id]', function(e) {
            // Skip if already handled by playNowButtons handler
            if (jQuery(this).hasClass('btn-hover') || jQuery(this).hasClass('play-now-btn')) {
                return;
            }
            
            // Skip if this is inside video gallery default section (handled separately)
            if (jQuery(this).closest('.video-gallery-default-section').length) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            const videoLink = jQuery(this).attr('data-video-link') || jQuery(this).attr('data-video-id') || '';
            const title = jQuery(this).attr('data-title') || 'Movie Title';
            
            if (!videoLink) {
                return;
            }
            
            let finalVideoLink = videoLink;
            if (!finalVideoLink.startsWith('http://') && !finalVideoLink.startsWith('https://')) {
                finalVideoLink = getVideoLink(videoLink);
                if (!finalVideoLink) {
                    // Fallback: construct videopress embed URL
                    finalVideoLink = `https://videopress.com/embed/${videoLink}`;
                }
            }
            
            // Remember the series scope where this click happened
            const scope = jQuery(this).closest('.trending-info, .slide-item, .block-images, .e-item').get(0);
            if (scope) {
                window.__lastSeriesScope = scope;
            }
            
            // Always open video gallery with the video link (for sidebar data and playback)
            if (typeof openVideoGallery === 'function') {
                openVideoGallery(finalVideoLink, title);
            }
        });
        
        let activeShareCopyPopup = null;

        function hideShareCopyPopup() {
            if (activeShareCopyPopup) {
                activeShareCopyPopup.removeClass('show');
                setTimeout(() => {
                    activeShareCopyPopup.remove();
                    activeShareCopyPopup = null;
                }, 200);
            }
        }

        function getVideoDataForShare($trigger) {
            // Try data-video-link first, then fallback to data-video-id for backward compatibility
            const directDataElement = $trigger.closest('[data-video-link], [data-video-id]');
            let videoLink = directDataElement.attr('data-video-link');
            let videoId = directDataElement.attr('data-video-id');
            let title = directDataElement.attr('data-title');

            if (!videoLink && !videoId) {
                const block = $trigger.closest('.block-images, .e-item, .slide-item, .shows-img');
                const buttonWithData = block.find('[data-video-link], [data-video-id]').first();
                if (buttonWithData.length) {
                    videoLink = buttonWithData.attr('data-video-link');
                    videoId = buttonWithData.attr('data-video-id');
                    title = title || buttonWithData.attr('data-title');
                }
            }

            if (!title) {
                const heading = $trigger.closest('.block-images, .e-item').find('.iq-title, .slider-heading, h4, h5, h6').first();
                if (heading.length) {
                    title = heading.text().trim();
                }
            }

            // Use video link if available, otherwise use video ID
            const finalVideoLink = videoLink || (videoId ? getVideoLink(videoId) : null) || window.currentVideoId || null;

            return {
                videoId: finalVideoLink, // Store as videoLink for consistency
                videoLink: finalVideoLink,
                title: title || 'Movie'
            };
        }

        function copyTextToClipboard(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text);
            }
            return new Promise((resolve, reject) => {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textarea);
                    if (successful) {
                        resolve();
                    } else {
                        reject(new Error('Copy command unsuccessful'));
                    }
                } catch (err) {
                    document.body.removeChild(textarea);
                    reject(err);
                }
            });
        }

        function showShareCopyPopup({ title, link, platform }) {
            hideShareCopyPopup();

            const popup = jQuery(`
                <div class="share-copy-popup">
                    <div class="share-copy-content">
                        <p class="share-copy-label">Copy ${platform} link</p>
                        <p class="share-copy-title">${title}</p>
                        <div class="share-copy-link" title="${link}">${link}</div>
                        <div class="share-copy-actions">
                            <button type="button" class="share-copy-btn">Copy link</button>
                        </div>
                        <p class="share-copy-status">Tap the button to copy this link.</p>
                    </div>
                </div>
            `);

            jQuery('body').append(popup);

            requestAnimationFrame(() => {
                popup.addClass('show');
            });

            activeShareCopyPopup = popup;

            const statusEl = popup.find('.share-copy-status');
            const linkEl = popup.find('.share-copy-link');
            const buttonEl = popup.find('.share-copy-btn');

            const copyAndReport = (manual = false) => {
                statusEl.text('Copying link...');
                copyTextToClipboard(link)
                    .then(() => {
                        statusEl.text('Link copied to clipboard');
                        if (manual) {
                            setTimeout(() => {
                                hideShareCopyPopup();
                            }, 200);
                        }
                    })
                    .catch(() => {
                        statusEl.text('Unable to copy automatically. Tap the link or button to copy manually.');
                    });
            };

            linkEl.on('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                copyAndReport(true);
            });

            buttonEl.on('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                copyAndReport(true);
            });

            copyAndReport();
        }

        jQuery(document).on('click', function(event) {
            if (activeShareCopyPopup && !jQuery(event.target).closest('.share-copy-content').length) {
                hideShareCopyPopup();
            }
        });

        // Event listeners for notification bell items
        // These should always open the video gallery with their own video and sidebar
        jQuery(document).on('click', '.notification-item', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Try data-video-link first, then fallback to data-video-id
            const videoLink = jQuery(this).attr('data-video-link') || jQuery(this).attr('data-video-id');
            const title = jQuery(this).attr('data-title') || 'Movie Title';
            
            if (!videoLink) {
                return;
            }
            
            // Close notification dropdown if open
            const dropdown = jQuery(this).closest('.iq-sub-dropdown');
            dropdown.removeClass('show');
            
            const listItem = jQuery(this).closest('li');
            if (listItem.length) {
                listItem.removeClass('iq-show');
                listItem.find('.search-toggle').removeClass('active');
            }
            
            // Get video link if we have an ID
            let finalVideoLink = videoLink;
            if (!finalVideoLink.startsWith('http://') && !finalVideoLink.startsWith('https://')) {
                finalVideoLink = getVideoLink(videoLink);
                if (!finalVideoLink) {
                    // Fallback: construct videopress embed URL
                    finalVideoLink = `https://videopress.com/embed/${videoLink}`;
                }
            }
            
            // Remember the series scope where this click happened
            const scope = jQuery(this).closest('.trending-info, .slide-item, .block-images, .e-item').get(0);
            if (scope) {
                window.__lastSeriesScope = scope;
            }
            
            // Always open video gallery with the video link (for sidebar data and playback)
            if (typeof openVideoGallery === 'function') {
                openVideoGallery(finalVideoLink, title);
            }
        });

        jQuery(document).on('click', '.share-ico', function(e) {
            const icon = jQuery(this).find('i');
            if (!icon.length) {
                return;
            }

            const isFacebook = icon.hasClass('fa-facebook');
            const isYoutube = icon.hasClass('fa-youtube');
            const isInstagram = icon.hasClass('fa-instagram');

            if (!isFacebook && !isYoutube && !isInstagram) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            const videoData = getVideoDataForShare(jQuery(this));
            if (!videoData.videoLink && !videoData.videoId) {
                showShareCopyPopup({
                    title: videoData.title,
                    link: 'Link unavailable',
                    platform: isFacebook ? 'Facebook' : (isYoutube ? 'YouTube' : 'Instagram')
                });
                return;
            }

            // Use video link if available, otherwise use current page URL
            let shareLink = videoData.videoLink || videoData.videoId || window.location.href;
            
            // For Facebook, use current page URL for better sharing
            if (isFacebook) {
                shareLink = window.location.href;
            }

            showShareCopyPopup({
                title: videoData.title,
                link: shareLink,
                platform: isFacebook ? 'Facebook' : (isYoutube ? 'YouTube' : 'Instagram')
            });
        });

        jQuery(document).on('click', '.video-open.playbtn', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const trigger = jQuery(this);
            // Try data-video-link first, then fallback to data-video-id
            let videoLink = trigger.attr('data-video-link') || trigger.attr('data-video-id');
            let title = trigger.attr('data-title');

            if (!videoLink) {
                const slideScope = trigger.closest('.slide');
                const fallbackButton = slideScope.find('.iq-button[data-video-link], .iq-button[data-video-id]').first();
                if (fallbackButton.length) {
                    videoLink = fallbackButton.attr('data-video-link') || fallbackButton.attr('data-video-id');
                    title = title || fallbackButton.attr('data-title');
                }
            }

            if (videoLink) {
                // Get video link if we have an ID
                let finalVideoLink = videoLink;
                if (!finalVideoLink.startsWith('http://') && !finalVideoLink.startsWith('https://')) {
                    finalVideoLink = getVideoLink(videoLink);
                }
                
                if (typeof openVideoGallery === 'function') {
                    openVideoGallery(finalVideoLink, title || 'Trailer');
                }
            }
        });
        
        // Event listeners for buttons inside video gallery (delegated event)
        // This handles clicks on play buttons within the video gallery default sections
        // When clicked, it should open the video gallery as if it's a new opening
        jQuery(document).on('click', '.video-gallery-overlay .video-gallery-default-section .iq-button', function(e) {
            // Check if this click is from within the video gallery default section
            if (videoGallery.hasClass('active')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Get video link (prefer data-video-link, fallback to data-video-id)
                const videoLink = jQuery(this).attr('data-video-link') || jQuery(this).attr('data-video-id') || '';
                const title = jQuery(this).attr('data-title') || 'Movie Title';
                
                if (videoLink) {
                    // Get final video link
                    let finalVideoLink = videoLink;
                    if (!finalVideoLink.startsWith('http://') && !finalVideoLink.startsWith('https://')) {
                        finalVideoLink = getVideoLink(videoLink);
                    }
                    
                    // Remember the series scope where this click happened
                    const scope = jQuery(this).closest('.trending-info, .slide-item, .block-images, .e-item').get(0);
                    if (scope) {
                        window.__lastSeriesScope = scope;
                    }
                    
                    // Open video gallery as if it's a new opening - this will properly reset and show the video
                    if (typeof openVideoGallery === 'function') {
                        openVideoGallery(finalVideoLink, title);
                    }
                }
            }
        });
        
        // Close button event listener
        closeBtn.on('click', closeVideoGallery);
        
        // Removed escape key and overlay click functionality
        // Only the Back Home button can close the video gallery
        
        // Add to Favorite button
        jQuery(document).on('click', '.btn-add-favorite', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const videoId = currentVideoId || '';
            const title = jQuery('#video-title').text() || 'Movie';
            const videoGallery = jQuery('#video-gallery-overlay');
            const imgElement = videoGallery.find('.video-poster img, .video-thumbnail img').first();
            const imageSrc = imgElement.attr('src') || imgElement.attr('data-src') || '';
            
            if (!videoId) {
                displayNotification('Unable to add to favorites. Please select a movie first.', 'error');
                return;
            }
            
            // Use WatchlistManager to add to favorites
            if (window.watchlistManager) {
                const itemData = {
                    itemId: videoId,
                    title: title,
                    image: imageSrc,
                    addedAt: Date.now()
                };
                
                const existingIndex = window.watchlistManager.favorites.findIndex(item => item.itemId === videoId);
                if (existingIndex >= 0) {
                    // Remove from favorites
                    window.watchlistManager.favorites.splice(existingIndex, 1);
                    window.watchlistManager.saveFavorites();
                    jQuery(this).removeClass('active');
                    displayNotification(`${title} removed from favorites.`, 'info');
                } else {
                    // Add to favorites
                    window.watchlistManager.favorites.push(itemData);
                    window.watchlistManager.favorites.sort((a, b) => a.addedAt - b.addedAt);
                    window.watchlistManager.saveFavorites();
                    jQuery(this).addClass('active');
                    displayNotification(`${title} added to favorites!`, 'success');
                    
                    // Increment like count
                    if (window.likeSystem) {
                        const slideItem = document.querySelector(`.slide-item [data-video-id="${videoId}"], .slide-item [data-video-link="${videoId}"]`);
                        if (slideItem) {
                            const heartButton = slideItem.closest('.slide-item, .e-item, .block-images')?.querySelector('.fa-heart');
                            if (heartButton) {
                                window.likeSystem.handleLikeClick({ target: heartButton });
                            }
                        }
                    }
                }
                
                // Update favorite count badge
                updateFavoriteCountBadge();
            }
        });
        
        // Add to Watchlist button
        jQuery(document).on('click', '.btn-add-watchlist', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const videoId = currentVideoId || '';
            const title = jQuery('#video-title').text() || 'Movie';
            const videoGallery = jQuery('#video-gallery-overlay');
            const imgElement = videoGallery.find('.video-poster img, .video-thumbnail img').first();
            const imageSrc = imgElement.attr('src') || imgElement.attr('data-src') || '';
            
            if (!videoId) {
                displayNotification('Unable to add to watchlist. Please select a movie first.', 'error');
                return;
            }
            
            // Use WatchlistManager to add to watchlist
            if (window.watchlistManager) {
                const itemData = {
                    itemId: videoId,
                    title: title,
                    image: imageSrc,
                    addedAt: Date.now()
                };
                
                const existingIndex = window.watchlistManager.watchlist.findIndex(item => item.itemId === videoId);
            if (existingIndex >= 0) {
                    // Remove from watchlist
                    window.watchlistManager.watchlist.splice(existingIndex, 1);
                    window.watchlistManager.saveWatchlist();
                jQuery(this).removeClass('active');
                    displayNotification(`${title} removed from watchlist.`, 'info');
            } else {
                    // Add to watchlist
                    window.watchlistManager.watchlist.push(itemData);
                    window.watchlistManager.watchlist.sort((a, b) => a.addedAt - b.addedAt);
                    window.watchlistManager.saveWatchlist();
                jQuery(this).addClass('active');
                    displayNotification(`${title} added to watchlist!`, 'success');
                }
            }
        });
        
        // Extract video ID from URL or use as-is
        function extractVideoId(videoIdOrUrl) {
            if (!videoIdOrUrl) return '';
            if (videoIdOrUrl.includes('videopress.com')) {
                const match = videoIdOrUrl.match(/videopress\.com\/(?:embed\/|v\/)?([a-zA-Z0-9]+)/);
                if (match) {
                    return match[1];
                }
            }
            return videoIdOrUrl;
        }
        
        // Update favorite count badge
        function updateFavoriteCountBadge() {
            const favoriteBtn = jQuery('.btn-add-favorite');
            if (favoriteBtn.length && window.likeSystem) {
                let videoId = currentVideoId || '';
                if (videoId) {
                    // Extract video ID for like system
                    const extractedId = extractVideoId(videoId);
                    const likeCount = window.likeSystem.getLikeCount(extractedId) || 0;
                    const countBadge = favoriteBtn.find('.favorite-count');
                    if (countBadge.length) {
                        countBadge.text(likeCount + '+');
                    } else {
                        favoriteBtn.append(`<span class="favorite-count">${likeCount}+</span>`);
                    }
                }
            }
        }
        
        // Update button states when video changes
        function updateFavoriteWatchlistButtons() {
            const videoId = currentVideoId || '';
            if (!videoId) return;
            
            const favoriteBtn = jQuery('.btn-add-favorite');
            const watchlistBtn = jQuery('.btn-add-watchlist');
            
            if (window.watchlistManager) {
                // Check if in favorites (use full videoId for matching)
                const inFavorites = window.watchlistManager.favorites.some(item => item.itemId === videoId);
                if (inFavorites) {
                    favoriteBtn.addClass('active');
                } else {
                    favoriteBtn.removeClass('active');
                }
                
                // Check if in watchlist (use full videoId for matching)
                const inWatchlist = window.watchlistManager.watchlist.some(item => item.itemId === videoId);
                if (inWatchlist) {
                    watchlistBtn.addClass('active');
                } else {
                    watchlistBtn.removeClass('active');
                }
            }
            
            // Update favorite count
            updateFavoriteCountBadge();
        }
        
        // Make updateFavoriteWatchlistButtons globally accessible
        window.updateFavoriteWatchlistButtons = updateFavoriteWatchlistButtons;
        
        // Download button - download from videopress
        jQuery(document).on('click', '.btn-download', function(e) {
            e.preventDefault();
            let videoId = currentVideoId || '';
            if (!videoId) {
                displayNotification('Download is not available for this title yet.', 'info');
                return;
            }
            
            // Extract video ID from videopress URL if it's a full URL
            if (videoId.includes('videopress.com')) {
                const match = videoId.match(/videopress\.com\/(?:embed\/|v\/)?([a-zA-Z0-9]+)/);
                if (match) {
                    videoId = match[1];
                }
            }
            
            // Construct videopress download URL
            // Format: https://videopress.com/v/{videoId}/download
            const downloadUrl = `https://videopress.com/v/${videoId}/download`;
            
            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = '';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            displayNotification('Download started...', 'success');
        });
        
        // Initialize sliders for video gallery sections
        function initializeVideoGallerySliders() {
            
            // Initialize all default sections owl carousels (uses episodes-slider1 structure)
            videoGallery.find('.video-gallery-default-section .episodes-slider1').each(function() {
                const $slider = jQuery(this);
                if ($slider.length && typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
                    initEpisodesOwlCarousel($slider);
                }
            });
            
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
        function showVideoGalleryOverlay(videoLink, title) {
            console.log('Opening video gallery with:', videoLink, title);
            
            // Show overlay first
            videoGallery.addClass('active');
            jQuery('body').css('overflow', 'hidden').addClass('video-gallery-active');
            
            // Show default section by default
            showDefaultSection();
            
            // Update sidebar content with video-specific data
            updateSidebarContent(videoLink);
            // Render episodes under the player for THIS series (videoLink) - only if it's a series
            try {
                const findSelectForVideoLink = (vidLink) => {
                    // Prefer the last clicked series scope
                    if (window.__lastSeriesScope) {
                        const selInScope = window.__lastSeriesScope.querySelector('.season-select');
                        if (selInScope) return selInScope;
                        // If no select, later we will fallback to episodes container in scope
                    }
                    // Find the slide item that owns this videoLink (try both data-video-link and data-video-id)
                    const btn = document.querySelector('.slide-item .iq-button[data-video-link="' + vidLink + '"], .slide-item .iq-button[data-video-id="' + vidLink + '"]');
                    if (!btn) return null;
                    const slide = btn.closest('.slide-item');
                    if (!slide) return null;
                    // The season select is typically within the same trending-info container
                    const info = slide.closest('.trending-info') || slide.parentElement;
                    if (info) {
                        const sel = info.querySelector('.season-select');
                        if (sel) return sel;
                    }
                    // Fallback: search siblings in same overlay-tab
                    const overlayTab = slide.closest('.overlay-tab');
                    if (overlayTab) {
                        const sel = overlayTab.querySelector('.season-select');
                        if (sel) return sel;
                    }
                    return null;
                };
                const seriesSelect = findSelectForVideoLink(videoLink);
                if (seriesSelect) {
                    // This is a series with episodes - show episodes and hide default section
                    showEpisodesSection();
                    if (typeof window.switchSeasonEpisodes === 'function') {
                        window.switchSeasonEpisodes(seriesSelect);
                    }
                    if (typeof window.renderEpisodesBelowPlayerFromSelect === 'function') {
                        window.renderEpisodesBelowPlayerFromSelect(seriesSelect, { scrollIntoView: true });
                    }
                } else if (typeof window.renderEpisodesBelowPlayerFromAny === 'function') {
                    // Check if there are episodes available
                    let scopeEl = window.__lastSeriesScope || null;
                    if (!scopeEl) {
                        const scopeBtn = document.querySelector('.slide-item .iq-button[data-video-link="' + videoLink + '"], .slide-item .iq-button[data-video-id="' + videoLink + '"]');
                        scopeEl = scopeBtn ? (scopeBtn.closest('.trending-info') || scopeBtn.closest('.overlay-tab') || scopeBtn.closest('.slide-item')) : null;
                    }
                    // Check if episodes exist in scope
                    const hasEpisodes = scopeEl && scopeEl.querySelector('.episodes-contens');
                    if (hasEpisodes) {
                        showEpisodesSection();
                        window.renderEpisodesBelowPlayerFromAny({ scrollIntoView: true, scopeEl: scopeEl });
                    }
                    // If no episodes, default section will remain visible
                }
            } catch (e) {
                console.warn('Unable to render episodes below player on open:', e);
            }
            
            // Initialize sliders after a short delay
            setTimeout(function() {
                initializeVideoGallerySliders();
            }, 200);
            
            // Load video immediately using the provided video link
            setGalleryVideoByLink(videoLink);
            
            // Update favorite and watchlist buttons after video loads
            setTimeout(function() {
                if (typeof updateFavoriteWatchlistButtons === 'function') {
                    updateFavoriteWatchlistButtons();
                }
            }, 300);
        }
        
        function openVideoGallery(videoLink, title) {
            return runAfterLoaderCycle(function() {
                showVideoGalleryOverlay(videoLink, title);
            });
        }
        
        // Make openVideoGallery function globally accessible
        window.openVideoGallery = openVideoGallery;
    });

    // Helper: ensure mount point exists below the player/sidebar to show episodes
    function ensureEpisodesMount() {
        const overlay = document.getElementById('video-gallery-overlay');
        if (!overlay) return null;
        const content = overlay.querySelector('.video-gallery-content');
        if (!content) return null;
        let mount = overlay.querySelector('#video-episodes-gallery');
        if (!mount) {
            mount = document.createElement('div');
            mount.id = 'video-episodes-gallery';
            mount.className = 'video-episodes-gallery mt-4';
            mount.style.display = 'none';
            // Insert after the default section
            const defaultSection = overlay.querySelector('#video-gallery-default-section');
            if (defaultSection && defaultSection.parentNode) {
                defaultSection.parentNode.insertBefore(mount, defaultSection.nextSibling);
            } else {
                // Fallback: Insert after the top row (player + sidebar)
                const row = content.querySelector('.row');
                if (row && row.parentNode) {
                    row.parentNode.insertBefore(mount, row.nextSibling);
                } else {
                    content.appendChild(mount);
                }
            }
        }
        return mount;
    }
    
    // Helper: Show default section and hide episodes
    function showDefaultSection() {
        const defaultSections = document.querySelectorAll('.video-gallery-default-section');
        const episodesSection = document.getElementById('video-episodes-gallery');
        defaultSections.forEach(function(section) {
            section.style.display = 'block';
        });
        if (episodesSection) {
            episodesSection.style.display = 'none';
            episodesSection.innerHTML = ''; // Clear episodes content
        }
    }
    
    // Helper: Hide default section and show episodes
    function showEpisodesSection() {
        const defaultSections = document.querySelectorAll('.video-gallery-default-section');
        const episodesSection = document.getElementById('video-episodes-gallery');
        defaultSections.forEach(function(section) {
            section.style.display = 'none';
        });
        if (episodesSection) {
            episodesSection.style.display = 'block';
        }
    }
    
    // Make functions globally accessible
    window.showDefaultSection = showDefaultSection;
    window.showEpisodesSection = showEpisodesSection;

    // Initialize Owl Carousel on a given element with standard episodes settings
    function initEpisodesOwlCarousel($container) {
        if (typeof jQuery === 'undefined' || !jQuery.fn.owlCarousel) return;
        // If already initialized, destroy first
        if ($container.data('owl.carousel')) {
            try {
                $container.trigger('destroy.owl.carousel');
            } catch (e) {}
            // unwrap structure left by owl
            $container.find('.owl-stage-outer').children().unwrap();
            $container.removeClass('owl-center owl-loaded owl-text-select-on');
        }
        // Initialize
        $container.owlCarousel({
            loop : true,
            margin : 20,
            nav: true,
            navText : ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i> "],
            dots : false,
            autoplay: false,
            autoplayTimeout: 0,
            responsive : {
                0:{ items : 2 },
                600:{ items : 2 },
                1000:{ items : 4 }
            }
        });
    }

    // Render episodes from a given select's related episodes container under the player
    function renderEpisodesBelowPlayerFromSelect(selectEl, options) {
        try {
            const mount = ensureEpisodesMount();
            if (!mount || !selectEl) return;

            // Hide default section and show episodes section
            showEpisodesSection();

            // Locate the related episodes container (mirrors logic in switchSeasonEpisodes)
            let episodesContainer = null;
            const selectContainer = selectEl.closest('.iq-custom-select');
            if (selectContainer) {
                const nextEl = selectContainer.nextElementSibling;
                if (nextEl && nextEl.classList && nextEl.classList.contains('episodes-contens')) {
                    episodesContainer = nextEl;
                }
                if (!episodesContainer) {
                    const parentScope = selectContainer.parentElement;
                    if (parentScope) {
                        episodesContainer = parentScope.querySelector('.episodes-contens');
                    }
                }
            }
            if (!episodesContainer) {
                const ti = selectEl.closest('.trending-info');
                if (ti) episodesContainer = ti.querySelector('.episodes-contens');
            }
            if (!episodesContainer) {
                const ot = selectEl.closest('.overlay-tab');
                if (ot) episodesContainer = ot.querySelector('.episodes-contens');
            }
            if (!episodesContainer) return;

            const selectedSeason = (selectEl.value || '').replace('Season', '').trim();

            // Collect episode items for selected season
            let episodeItems = [];
            const seasonCarousels = episodesContainer.querySelectorAll('.episodes-slider1');
            if (seasonCarousels && seasonCarousels.length > 0) {
                // Prefer containers that declare data-season
                const matchingContainers = Array.from(seasonCarousels).filter(function(car){
                    const seasonAttr = car.getAttribute('data-season');
                    return selectedSeason ? (seasonAttr && seasonAttr === selectedSeason) : true;
                });
                const containersToUse = matchingContainers.length > 0 ? matchingContainers : Array.from(seasonCarousels);
                containersToUse.forEach(function(car){
                    car.querySelectorAll('.e-item').forEach(function(e){ episodeItems.push(e); });
                });
            }
            // If nothing gathered yet, fall back to per-item season filtering in any episodes container
            if (episodeItems.length === 0) {
                episodesContainer.querySelectorAll('.e-item').forEach(function(e){
                    const itemSeason = e.getAttribute('data-season');
                    if (!selectedSeason || !itemSeason || itemSeason === selectedSeason) {
                        episodeItems.push(e);
                    }
                });
            }

            // Build carousel container
            mount.innerHTML = '';
            const header = document.createElement('h3');
            header.className = 'text-white mb-3';
            header.textContent = 'Episodes';
            const slider = document.createElement('div');
            slider.className = 'owl-carousel owl-theme episodes-slider1 list-inline p-0 m-0';

            episodeItems.forEach(function(item){
                const clone = item.cloneNode(true);
                clone.style.display = '';
                slider.appendChild(clone);
            });

            mount.appendChild(header);
            mount.appendChild(slider);

            // Initialize Owl on the new slider
            if (typeof jQuery !== 'undefined') {
                initEpisodesOwlCarousel(jQuery(slider));
            }
            if (options && options.scrollIntoView) {
                mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (err) {
            console.warn('Failed to render episodes under player:', err);
        }
    }

    // Expose helper globally
    window.renderEpisodesBelowPlayerFromSelect = renderEpisodesBelowPlayerFromSelect;

    // Fallback: render episodes from the current-movie section or first available episodes container
    function renderEpisodesBelowPlayerFromAny(options) {
        const mount = ensureEpisodesMount();
        if (!mount) return;

        // Hide default section and show episodes section
        showEpisodesSection();

        // Try to find e-items from a provided scope, else from the current movie
        let sourceContainer = null;
        const scoped = options && options.scopeEl ? options.scopeEl : null;
        if (scoped) {
            sourceContainer = scoped.querySelector('.episodes-contens');
        }
        if (!sourceContainer) {
            const currentSlide = document.querySelector('.slide-item.current-movie');
            if (currentSlide) {
                const trendingInfo = currentSlide.closest('.trending-info') || document;
                sourceContainer = trendingInfo.querySelector('.episodes-contens');
            }
        }
        if (!sourceContainer) {
            sourceContainer = document.querySelector('.episodes-contens');
        }
        if (!sourceContainer) return;

        const items = Array.from(sourceContainer.querySelectorAll('.e-item'));
        mount.innerHTML = '';
        const header = document.createElement('h3');
        header.className = 'text-white mb-3';
        header.textContent = 'Episodes';
        const slider = document.createElement('div');
        slider.className = 'owl-carousel owl-theme episodes-slider1 list-inline p-0 m-0';
        items.forEach(function(item){
            const clone = item.cloneNode(true);
            clone.style.display = '';
            slider.appendChild(clone);
        });
        mount.appendChild(header);
        mount.appendChild(slider);
        if (typeof jQuery !== 'undefined') {
            initEpisodesOwlCarousel(jQuery(slider));
        }
        if (options && options.scrollIntoView) {
            mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    window.renderEpisodesBelowPlayerFromAny = renderEpisodesBelowPlayerFromAny;

    // Removed auto-switching series on season change to respect series context

    // Dynamic Content Loading System
    // Note: This system handles content loading, NOT likes.
    // Likes are handled separately by the LikeSystem class.
    class DynamicContentLoader {
        constructor() {
            this.currentContent = null;
            this.contentCache = new Map();
            this.isLoading = false;
            this.userPosition = null; // Track user's position
            this.init();
        }
        
        init() {
            this.setupEventListeners();
            this.setupBackHomeButton();
            console.log('Dynamic Content Loader initialized');
            console.log('🎬 Click any movie image, title, or play button to test!');
            console.log('💡 The system will load content dynamically without page refresh');
        }
        
        // Setup the Back Home button functionality
        setupBackHomeButton() {
            // Override the existing closeVideoGallery function
            if (typeof window.closeVideoGallery === 'function') {
                const originalCloseFunction = window.closeVideoGallery;
                window.closeVideoGallery = () => {
                    this.restoreUserPosition();
                    originalCloseFunction();
                };
            }
            
            // Also handle the Back Home button click
            document.addEventListener('click', (e) => {
                if (e.target.closest('.back-home-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.goBackHome();
                }
            });
        }
        
        // Save user's current position before opening video gallery
        saveUserPosition() {
            this.userPosition = {
                scrollY: window.scrollY,
                scrollX: window.scrollX,
                activeSection: this.getActiveSection(),
                timestamp: Date.now()
            };
            
            console.log('📍 User position saved:', this.userPosition);
            
            // Show a subtle visual indicator that position is saved
            this.showPositionSavedIndicator();
        }
        
        // Show a subtle indicator that position is saved
        showPositionSavedIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'position-saved-indicator';
            indicator.innerHTML = '<i class="fa fa-bookmark"></i> Position saved';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(0, 128, 0, 0.9);
                color: white;
                padding: 10px 15px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 10002;
                opacity: 0;
                transform: translateX(-20px);
                transition: all 0.3s ease;
            `;
            
            document.body.appendChild(indicator);
            
            // Animate in
            setTimeout(() => {
                indicator.style.opacity = '1';
                indicator.style.transform = 'translateX(0)';
            }, 100);
            
            // Animate out and remove
            setTimeout(() => {
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                }, 300);
            }, 2000);
        }
        
        // Get the currently active/visible section
        getActiveSection() {
            const sections = document.querySelectorAll('section[id]');
            let activeSection = null;
            let maxVisibility = 0;
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const visibility = Math.min(rect.height, window.innerHeight) - Math.max(0, rect.top) - Math.max(0, window.innerHeight - rect.bottom);
                
                if (visibility > maxVisibility && visibility > 0) {
                    maxVisibility = visibility;
                    activeSection = section.id;
                }
            });
            
            return activeSection;
        }
        
        // Restore user's position when going back
        restoreUserPosition() {
            if (!this.userPosition) {
                console.log('📍 No saved position to restore');
                return;
            }
            
            console.log('📍 Restoring user position:', this.userPosition);
            
            // Restore scroll position
            window.scrollTo({
                top: this.userPosition.scrollY,
                left: this.userPosition.scrollX,
                behavior: 'smooth'
            });
            
            // Highlight the section they were viewing
            if (this.userPosition.activeSection) {
                this.highlightSection(this.userPosition.activeSection);
            }
            
            // Clear the saved position
            this.userPosition = null;
        }
        
        // Highlight the section the user was viewing
        highlightSection(sectionId) {
            // Remove previous highlights
            document.querySelectorAll('section[id]').forEach(section => {
                section.classList.remove('user-return-highlight');
            });
            
            // Add highlight to the section they were viewing
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('user-return-highlight');
                
                // Remove highlight after animation
                setTimeout(() => {
                    targetSection.classList.remove('user-return-highlight');
                }, 2000);
            }
        }
        
        // Go back home with position restoration
        goBackHome() {
            console.log('🏠 Going back home...');
            
            this.restoreUserPosition();
            
            // Close video gallery if it's open
            if (typeof window.closeVideoGallery === 'function') {
                window.closeVideoGallery();
            }
        }
        
        setupEventListeners() {
            document.addEventListener('click', (e) => {
                // Ignore clicks originating from share icons so they only show the copy popup
                if (e.target.closest('.share-ico')) {
                    return;
                }

                // Don't handle heart icon clicks - let the like system handle those
                if (e.target.classList.contains('fa-heart') || e.target.closest('.fa-heart')) {
                    return;
                }
                
                // Handle play button clicks
                if (e.target.closest('.iq-button')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const button = e.target.closest('.iq-button');
                    const videoId = button.getAttribute('data-video-id');
                    const title = button.getAttribute('data-title');
                    // Remember the series scope where this click happened
                    const slideForScope = button.closest('.trending-info, .slide-item');
                    if (slideForScope) {
                        window.__lastSeriesScope = slideForScope;
                    }
                    
                    if (videoId && title) {
                        this.loadContent(videoId, title);
                    }
                }
                
                // Handle clicks on movie images and titles
                if (e.target.closest('.block-images') || e.target.closest('.iq-title a')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const item = e.target.closest('.block-images') || e.target.closest('.iq-title a');
                    const slideItem = item.closest('.slide-item');
                    
                    if (slideItem) {
                        const playButton = slideItem.querySelector('.iq-button');
                        if (playButton) {
                            const videoId = playButton.getAttribute('data-video-id');
                            const title = playButton.getAttribute('data-title');
                            // Remember scope
                            const scope = slideItem.closest('.trending-info, .slide-item') || slideItem;
                            if (scope) {
                                window.__lastSeriesScope = scope;
                            }
                            
                            if (videoId && title) {
                                this.loadContent(videoId, title);
                            }
                        }
                    }
                }
            });
        }
        
        async loadContent(videoId, title) {
            if (this.isLoading) return;
            
            // Save user's current position before opening video gallery
            this.saveUserPosition();
            
            // Find the movie button to get its data attributes
            const movieButton = document.querySelector(`.iq-button[data-video-id="${videoId}"]`);
            const watchFullLink = movieButton ? movieButton.getAttribute('data-watch-full-link') : null;
            const downloadLink = movieButton ? movieButton.getAttribute('data-download-link') : null;
            
            this.isLoading = true;
            
            try {
                const contentData = await this.generateContentData(videoId, title);
                // Add the links to content data
                contentData.watchFullLink = watchFullLink;
                contentData.downloadLink = downloadLink;
                this.displayContent(contentData);
                this.updateURL(videoId, title);
            } catch (error) {
                console.error('Error loading content:', error);
            } finally {
                this.isLoading = false;
            }
        }
        
        async generateContentData(videoId, title) {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            return {
                videoId: videoId,
                title: title,
                rating: (Math.random() * 2 + 7).toFixed(1),
                year: Math.floor(Math.random() * 10) + 2015,
                duration: `${Math.floor(Math.random() * 2) + 1}h ${Math.floor(Math.random() * 30) + 15}min`,
                ageRating: ['10+', '12+', '16+', '18+'][Math.floor(Math.random() * 4)],
                genres: ['Action', 'Adventure', 'Drama'].sort(() => Math.random() - 0.5),
                description: `Experience the epic adventure of ${title}, a masterpiece that will keep you on the edge of your seat.`
            };
        }
        
        displayContent(contentData) {
            this.currentContent = contentData;
            
            // Highlight the current movie
            this.highlightCurrentMovie(contentData.videoId);
            
            this.updateVideoGallery(contentData);
            
            if (typeof openVideoGallery === 'function') {
                openVideoGallery(contentData.videoId, contentData.title);
            }
        }
        
        // Highlight the currently loaded movie
        highlightCurrentMovie(videoId) {
            // Remove previous highlights
            document.querySelectorAll('.slide-item').forEach(item => {
                item.classList.remove('current-movie');
            });
            
            // Find and highlight the current movie
            document.querySelectorAll('.slide-item').forEach(item => {
                const playButton = item.querySelector('.iq-button');
                if (playButton && playButton.getAttribute('data-video-id') === videoId) {
                    item.classList.add('current-movie');
                }
            });
        }
        
        updateVideoGallery(contentData) {
            const titleElement = document.getElementById('video-title');
            if (titleElement) titleElement.textContent = contentData.title;
            
            const description = document.querySelector('.video-description');
            if (description) description.textContent = contentData.description;
            
            // Update favorite and watchlist buttons
            if (typeof updateFavoriteWatchlistButtons === 'function') {
                updateFavoriteWatchlistButtons();
            }
        }
        
        updateURL(videoId, title) {
            const url = new URL(window.location);
            url.searchParams.set('video', videoId);
            url.searchParams.set('title', encodeURIComponent(title));
            window.history.pushState({ videoId, title }, title, url);
        }
        
    }
    
    // Initialize dynamic loader
    const dynamicLoader = new DynamicContentLoader();
    window.dynamicLoader = dynamicLoader;
})(jQuery);
 // Complete Chat Widget with Toggle and Email Functionality
document.addEventListener('DOMContentLoaded', function() {
    // ========== CHAT TOGGLE FUNCTIONALITY ==========
    const chatBody = document.querySelector('.chat-body');
    const chatFooter = document.querySelector('.chat-footer');
    const chatIcon = document.getElementById('chatIcon') || document.querySelector('.chat-icon');
    const chatHeader = document.querySelector('.chat-header');
    const chatBox = document.getElementById('chatBox') || document.querySelector('.chat-box');
    const closeBtn = document.getElementById('closeBtn');
    
    // Hide chat initially
    if (chatBody) chatBody.style.display = 'none';
    if (chatFooter) chatFooter.style.display = 'none';
    
    // Ensure chat box starts hidden (don't add 'active' class initially)
    // The CSS will handle the visibility through the 'active' class
    
    // Toggle chat visibility
    function toggleChat() {
        const isHidden = !chatBody || chatBody.style.display === 'none' || getComputedStyle(chatBody).display === 'none';
        if (isHidden) {
            openChat();
        } else {
            closeChat();
        }
    }
    
    function openChat() {
        // Add 'active' class to chat box to make it visible (CSS requires this)
        if (chatBox) {
            chatBox.classList.add('active');
        }
        
        // Show chat body
        if (chatBody) {
            chatBody.style.display = 'flex';
        }
        
        // Show chat footer
        if (chatFooter) {
            chatFooter.style.display = 'flex';
        }
        
        // Focus input
        setTimeout(() => {
            const messageInput = document.getElementById('messageInput');
            if (messageInput) messageInput.focus();
        }, 300);
        
        // Check if user has email stored
        const storedEmail = localStorage.getItem('chat_user_email');
        if (storedEmail) {
            userEmail = storedEmail;
            emailAsked = true;
            // Load user's previous messages
            loadUserMessages(storedEmail);
        } else {
            // Clear chat body and show welcome messages
            if (chatBody) {
                chatBody.innerHTML = ''; // Clear default HTML messages
            }
            
            // Add welcome messages - email request FIRST
            if (chatBody) {
                setTimeout(() => {
                    addMessage("Hello! How can we help you today?", "admin", false);
                }, 400);
                setTimeout(() => {
                    addMessage("Please provide your email address so we can reply to you.", "admin", false);
                }, 800);
            }
        }
    }
    
    function closeChat() {
        // Remove 'active' class to hide chat box
        if (chatBox) {
            chatBox.classList.remove('active');
        }
        
        if (chatBody) {
            chatBody.style.display = 'none';
        }
        if (chatFooter) {
            chatFooter.style.display = 'none';
        }
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { 
                transform: translateY(20px);
                opacity: 0;
                max-height: 0;
            }
            to { 
                transform: translateY(0);
                opacity: 1;
                max-height: 500px;
            }
        }
        
        @keyframes slideDown {
            from { 
                transform: translateY(0);
                opacity: 1;
                max-height: 500px;
            }
            to { 
                transform: translateY(20px);
                opacity: 0;
                max-height: 0;
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .chat-body {
            overflow-y: auto !important;
            overflow-x: hidden;
            transition: max-height 0.3s ease-out;
            max-height: 100%;
        }
        
        /* Tiny scrollbar for chat body */
        .chat-body::-webkit-scrollbar {
            width: 6px;
        }
        
        .chat-body::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 3px;
        }
        
        .chat-body::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 3px;
        }
        
        .chat-body::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.5);
        }
        
        .chat-footer {
            transition: opacity 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);
    
    // Add toggle functionality - use multiple methods to ensure it works
    if (chatIcon) {
        chatIcon.style.cursor = 'pointer';
        chatIcon.style.pointerEvents = 'auto';
        
        // Handle clicks on the icon and all its children
        function handleChatIconClick(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('Chat icon clicked!'); // Debug log
            toggleChat();
            return false;
        }
        
        // Add click handler with capture phase (fires first)
        chatIcon.addEventListener('click', handleChatIconClick, true);
        
        // Also add to capture phase for child elements
        const chatIconSymbol = document.getElementById('chatIconSymbol');
        const notification = document.getElementById('notification');
        if (chatIconSymbol) {
            chatIconSymbol.style.pointerEvents = 'auto';
            chatIconSymbol.addEventListener('click', handleChatIconClick, true);
        }
        if (notification) {
            notification.style.pointerEvents = 'auto';
            notification.addEventListener('click', handleChatIconClick, true);
        }
        
        // Also use jQuery if available (for compatibility)
        if (typeof jQuery !== 'undefined') {
            jQuery(chatIcon).off('click').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Chat icon clicked via jQuery!'); // Debug log
                toggleChat();
                return false;
            });
        }
    } else {
        console.error('Chat icon not found!');
    }
    
    // Close button handler
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeChat();
        });
    }
    
    if (chatHeader) {
        chatHeader.style.cursor = 'pointer';
        chatHeader.addEventListener('click', toggleChat);
    }
    
    // ========== EMAIL FUNCTIONALITY ==========
    const web3FormsKey = '3c0d553f-93ec-43d2-b299-e4399fa49dba';
    let userEmail = null;
    let emailAsked = false;
    
    // Message storage functions with 1-week expiration
    function getUserStorageKey(email) {
        return `chat_messages_${email}`;
    }
    
    function saveMessage(text, type, email) {
        if (!email) return;
        
        const storageKey = getUserStorageKey(email);
        const messages = loadMessages(email);
        
        const messageData = {
            text: text,
            type: type,
            timestamp: Date.now()
        };
        
        messages.push(messageData);
        
        // Store with expiration (1 week = 7 days = 604800000 ms)
        const storageData = {
            messages: messages,
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
        };
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(storageData));
        } catch (e) {
            console.error('Error saving message:', e);
        }
    }
    
    function loadMessages(email) {
        if (!email) return [];
        
        const storageKey = getUserStorageKey(email);
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) return [];
            
            const data = JSON.parse(stored);
            
            // Check if expired
            if (data.expiresAt && Date.now() > data.expiresAt) {
                localStorage.removeItem(storageKey);
                return [];
            }
            
            return data.messages || [];
        } catch (e) {
            console.error('Error loading messages:', e);
            return [];
        }
    }
    
    function clearExpiredMessages() {
        // Clean up expired messages for all users
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('chat_messages_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (data.expiresAt && Date.now() > data.expiresAt) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        // Invalid data, remove it
                        localStorage.removeItem(key);
                    }
                }
            });
        } catch (e) {
            console.error('Error clearing expired messages:', e);
        }
    }
    
    // Clean expired messages on load
    clearExpiredMessages();
    
    // Add message to chat
    function addMessage(text, type, saveToStorage = true) {
        const messageDiv = document.createElement('div');
        // Use 'admin' for admin messages (left side), 'user' for user messages (right side)
        const messageClass = type === 'sent' ? 'user' : 'admin';
        messageDiv.className = `message ${messageClass}`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Use the same structure as the default message
        messageDiv.innerHTML = `
            <div class="message-content">
                ${text}
            </div>
            <div class="message-time">${timeString}</div>
        `;
        
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Save to localStorage if user email exists (save both user and admin messages)
        if (saveToStorage && userEmail) {
            saveMessage(text, type, userEmail);
        }
    }
    
    // Load and display user's messages
    function loadUserMessages(email) {
        if (!email || !chatBody) return;
        
        const messages = loadMessages(email);
        
        // If there are saved messages, clear all and reload full conversation
        if (messages.length > 0) {
            // Clear all messages including welcome messages
            chatBody.innerHTML = '';
            
            // Add welcome message first
            addMessage("Hello! How can we help you today?", "admin", false);
            
            // Load and display all saved messages (both user and admin)
            messages.forEach(msgData => {
                addMessage(msgData.text, msgData.type, false); // Don't save again (already saved)
            });
        } else {
            // No saved messages, just show welcome messages
            const existingMessages = chatBody.querySelectorAll('.message');
            existingMessages.forEach(msg => msg.remove());
            
            setTimeout(() => {
                addMessage("Hello! How can we help you today?", "admin", false);
            }, 400);
            setTimeout(() => {
                addMessage("Please provide your email address so we can reply to you.", "admin", false);
            }, 800);
        }
    }
    
    // Send message via Web3Forms
    async function sendToEmail(message) {
        if (!userEmail) return false;
        
        const formData = new FormData();
        formData.append('access_key', web3FormsKey);
        formData.append('name', 'Chat User');
        formData.append('email', userEmail);
        formData.append('message', message);
        formData.append('subject', 'New Message from Chat Widget');
        formData.append('from_name', 'Chat Widget');
        formData.append('botcheck', '');
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }
    
    // Handle sending message
    async function handleSendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // If no email, require it FIRST before allowing any messages
        if (!userEmail) {
            // Check if it's a valid email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(message)) {
                userEmail = message;
                emailAsked = true;
                
                // Save email to localStorage
                try {
                    localStorage.setItem('chat_user_email', userEmail);
                } catch (e) {
                    console.error('Error saving email:', e);
                }
                
                // Don't add email as a message, just confirm
                messageInput.value = '';
                
                setTimeout(() => {
                    addMessage(`Thank you! We've received your email. Now you can send your message.`, "admin", true);
                }, 300);
            } else {
                // Invalid email
                messageInput.value = '';
                setTimeout(() => {
                    addMessage("Please enter a valid email address (e.g., name@example.com):", "admin", true);
                }, 300);
            }
            return;
        }
        
        // User has email, allow sending messages
        addMessage(message, 'sent', true); // Save user messages
        messageInput.value = '';
        
        // Show typing indicator
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
            chatBody.scrollTop = chatBody.scrollHeight;
        }
        
        // Send to email
        setTimeout(async () => {
            if (typingIndicator) typingIndicator.style.display = 'none';
            
            const success = await sendToEmail(message);
            
            if (success) {
                addMessage("Message sent! We'll respond via email soon.", "admin", true);
            } else {
                addMessage("Failed to send. Please try again.", "admin", true);
            }
        }, 1500);
    }
    
    // Add event listeners for sending
    const sendButton = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    
    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }
});


// Season selection functionality - More robust approach
function initializeSeasonSelectors() {
  console.log('Initializing season selectors...');
  
  // Wait a bit to ensure DOM is fully loaded
  setTimeout(function() {
    const seasonSelects = document.querySelectorAll('.season-select');
    console.log('Found season selects:', seasonSelects.length);
    
    seasonSelects.forEach(function(select, index) {
      console.log('Processing select', index);
      
      // Keep current selection (do not force Season 1)
      
      // Find the episodes container for this specific select
      let episodesContainer = null;
      
      // Try multiple methods to find the episodes container
      const selectParent = select.closest('.iq-custom-select');
      if (selectParent) {
        episodesContainer = selectParent.nextElementSibling;
        if (episodesContainer && !episodesContainer.classList.contains('episodes-contens')) {
          episodesContainer = selectParent.parentElement.querySelector('.episodes-contens');
        }
      }
      
      if (!episodesContainer) {
        episodesContainer = select.closest('.trending-info').querySelector('.episodes-contens');
      }
      
      console.log('Episodes container found:', episodesContainer);
      
      if (!episodesContainer) {
        console.error('Could not find episodes container for select', index);
        return;
      }
      
      // Function to switch seasons
      function switchSeason(seasonNumber) {
        console.log('Switching to season:', seasonNumber);
        
        // Find all season containers (the owl-carousel divs)
        const allSeasonContainers = episodesContainer.querySelectorAll('.episodes-slider1');
        console.log('Found season containers:', allSeasonContainers.length);
        
        // Check if there are multiple season containers (one per season)
        if (allSeasonContainers.length > 1) {
          // First, destroy carousels on all containers to avoid stale state
          allSeasonContainers.forEach(function(container){
            if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
              const $c = jQuery(container);
              if ($c.data('owl.carousel')) {
                $c.trigger('destroy.owl.carousel');
                $c.removeClass('owl-loaded owl-center owl-text-select-on');
                $c.find('.owl-stage-outer').children().unwrap();
              }
            }
          });

          // Show the selected season container, hide others
          allSeasonContainers.forEach(function(seasonContainer) {
            const containerSeason = seasonContainer.getAttribute('data-season');
            
            if (containerSeason === seasonNumber) {
              seasonContainer.style.display = 'block';
              console.log('Showing season container:', containerSeason);
              // Ensure its items are visible
              seasonContainer.querySelectorAll('.e-item').forEach(function(item){
                item.style.display = 'block';
              });
            } else {
              seasonContainer.style.display = 'none';
              console.log('Hiding season container:', containerSeason);
            }
          });

          // Ensure the episodes container wrapper is visible
          if (episodesContainer && episodesContainer.style) {
            episodesContainer.style.display = 'block';
            episodesContainer.style.visibility = 'visible';
          }
        } else {
          // Single container with all seasons - filter by e-item data-season
          const allEpisodeItems = episodesContainer.querySelectorAll('.e-item');
          console.log('Found episode items:', allEpisodeItems.length);
          
          allEpisodeItems.forEach(function(episodeItem) {
            const episodeSeason = episodeItem.getAttribute('data-season');
            
            if (episodeSeason === seasonNumber) {
              episodeItem.style.display = 'block';
              console.log('Showing episode for season:', seasonNumber, 'episode season:', episodeSeason);
            } else {
              episodeItem.style.display = 'none';
              console.log('Hiding episode for season:', episodeSeason);
            }
          });
          
          // Re-create carousel with only visible items to avoid empty slides and enable cycling
          if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
            const $owl = jQuery(episodesContainer).find('.episodes-slider1');
            if ($owl.length) {
              const visibleCount = jQuery(episodesContainer).find('.e-item').filter(function(){
                return this.style.display !== 'none';
              }).length;
              if ($owl.data('owl.carousel')) {
                $owl.trigger('destroy.owl.carousel');
                $owl.removeClass('owl-loaded owl-center owl-text-select-on');
                $owl.find('.owl-stage-outer').children().unwrap();
              }
              const itemsToShow = Math.min(visibleCount || 1, 4);
              $owl.owlCarousel({
                loop: visibleCount > 1,
                margin: 20,
                nav: true,
                navText : ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i> "],
                dots: false,
                responsive : {
                  0:{ items: 2 },
                  600:{ items: 2 },
                  1000:{ items: itemsToShow }
                }
              });
            }
          }
        }
        
        // Reinitialize the carousel/slider after filtering
        if (allSeasonContainers.length <= 1) {
          // For single container shows handled above
        } else {
          // For multiple container shows, refresh the visible carousel based on its items
          allSeasonContainers.forEach(function(container) {
            if (container.style.display !== 'none' && typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
              const $container = jQuery(container);
              const visibleCount = $container.find('.e-item').length;
              const itemsToShow = Math.min(visibleCount || 1, 4);
              $container.owlCarousel({
                loop: visibleCount > 1,
                margin: 20,
                nav: true,
                navText : ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i> "],
                dots: false,
                responsive : {
                  0:{ items: 2 },
                  600:{ items: 2 },
                  1000:{ items: itemsToShow }
                }
              });
            }
          });
        }
      }
      
      // Add event listener
      select.addEventListener('change', function() {
        const selectedSeason = this.value;
        const seasonNumber = selectedSeason.replace('Season', '');
        switchSeason(seasonNumber);
      });
      
      // Initialize with current selected season (default to 1 if empty)
      const initialSelected = (select.value || 'Season1').replace('Season', '');
      switchSeason(initialSelected);
      
    });
  }, 100);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSeasonSelectors);
} else {
  initializeSeasonSelectors();
}

// Removed secondary delayed init to avoid re-running and overwriting selection

// Simple inline function as backup
function switchSeasonEpisodes(selectElement) {
  console.log('switchSeasonEpisodes called with:', selectElement.value);
  
  const selectedSeason = selectElement.value;
  
  // Find the episodes container (robust lookup across layouts)
  let episodesContainer = null;
  const selectContainer = selectElement.closest('.iq-custom-select');
  if (selectContainer) {
    // Sibling first
    const nextEl = selectContainer.nextElementSibling;
    if (nextEl && nextEl.classList && nextEl.classList.contains('episodes-contens')) {
      episodesContainer = nextEl;
    }
    // Fallback: parent scope
    if (!episodesContainer) {
      const parentScope = selectContainer.parentElement;
      if (parentScope) {
        episodesContainer = parentScope.querySelector('.episodes-contens');
      }
    }
  }
  // Fallbacks through ancestors
  if (!episodesContainer) {
    const ti = selectElement.closest('.trending-info');
    if (ti) episodesContainer = ti.querySelector('.episodes-contens');
  }
  if (!episodesContainer) {
    const ot = selectElement.closest('.overlay-tab');
    if (ot) episodesContainer = ot.querySelector('.episodes-contens');
  }
  
  console.log('Selected season:', selectedSeason);
  console.log('Episodes container:', episodesContainer);
  
  if (!episodesContainer) {
    console.error('Episodes container not found');
    return;
  }
  
  // Find all season containers (the owl-carousel divs)
  const allSeasonContainers = episodesContainer.querySelectorAll('.episodes-slider1');
  console.log('Found season containers:', allSeasonContainers.length);
  
  const seasonNumber = selectedSeason.replace('Season', '');
  
  // Check if there are multiple season containers (one per season)
  if (allSeasonContainers.length > 1) {
    // Destroy any existing carousels to avoid stale state
    if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
      allSeasonContainers.forEach(function(container){
        const $c = jQuery(container);
        if ($c.data('owl.carousel')) {
          $c.trigger('destroy.owl.carousel');
          $c.removeClass('owl-loaded owl-center owl-text-select-on');
          $c.find('.owl-stage-outer').children().unwrap();
        }
      });
    }
    // Show the selected season container, hide others
    allSeasonContainers.forEach(function(seasonContainer) {
      const containerSeason = seasonContainer.getAttribute('data-season');
      
      if (containerSeason === seasonNumber) {
        seasonContainer.style.display = 'block';
        console.log('Showing season container:', containerSeason);
        // Ensure its items are visible
        seasonContainer.querySelectorAll('.e-item').forEach(function(item){
          item.style.display = 'block';
        });
      } else {
        seasonContainer.style.display = 'none';
        console.log('Hiding season container:', containerSeason);
      }
    });
  } else {
    // Single container with all seasons - filter by e-item data-season
    const allEpisodeItems = episodesContainer.querySelectorAll('.e-item');
    console.log('Found episode items:', allEpisodeItems.length);
    
    allEpisodeItems.forEach(function(episodeItem) {
      const episodeSeason = episodeItem.getAttribute('data-season');
      
      if (episodeSeason === seasonNumber) {
        episodeItem.style.display = 'block';
        console.log('Showing episode for season:', seasonNumber, 'episode season:', episodeSeason);
      } else {
        episodeItem.style.display = 'none';
        console.log('Hiding episode for season:', episodeSeason);
      }
    });
    
    // Re-create carousel with only visible items to avoid empty slides and enable cycling
    if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
      const $owl = jQuery(episodesContainer).find('.episodes-slider1');
      if ($owl.length) {
        const visibleCount = jQuery(episodesContainer).find('.e-item').filter(function(){
          return this.style.display !== 'none';
        }).length;
        if ($owl.data('owl.carousel')) {
          $owl.trigger('destroy.owl.carousel');
          $owl.removeClass('owl-loaded owl-center owl-text-select-on');
          $owl.find('.owl-stage-outer').children().unwrap();
        }
        const itemsToShow = Math.min(visibleCount || 1, 4);
        $owl.owlCarousel({
          loop: visibleCount > 1,
          margin: 20,
          nav: true,
          navText : ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i> "],
          dots: false,
          responsive : {
            0:{ items: 2 },
            600:{ items: 2 },
            1000:{ items: itemsToShow }
          }
        });
      }
    }
  }
  
  // Reinitialize the carousel/slider to update display for multiple container shows
  if (allSeasonContainers.length > 1) {
    // For multiple container shows, init only the visible one
    allSeasonContainers.forEach(function(container) {
      if (container.style.display !== 'none' && typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
        const $container = jQuery(container);
        const visibleCount = $container.find('.e-item').length;
        const itemsToShow = Math.min(visibleCount || 1, 4);
        $container.owlCarousel({
          loop: visibleCount > 1,
          margin: 20,
          nav: true,
          navText : ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i> "],
          dots: false,
          responsive : {
            0:{ items: 2 },
            600:{ items: 2 },
            1000:{ items: itemsToShow }
          }
        });
      }
    });
  }

  // Make sure the wrapper is visible
  if (episodesContainer && episodesContainer.style) {
    episodesContainer.style.display = 'block';
    episodesContainer.style.visibility = 'visible';
  }
}

// ---------- Accessibility helpers (nav labels, focusability, alt fallbacks) ----------
(function enhanceAccessibility(){
  function setCarouselControlA11y() {
    const prevButtons = document.querySelectorAll('.owl-prev');
    const nextButtons = document.querySelectorAll('.owl-next');
    prevButtons.forEach(function(btn){
      btn.setAttribute('aria-label', 'Previous slide');
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
    });
    nextButtons.forEach(function(btn){
      btn.setAttribute('aria-label', 'Next slide');
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
    });
  }

  // ============================================
  // Search functionality for Nerflix website
  // (migrated from search.js and wired to main.js videoData)
  // ============================================
  class NerflixSearch {
    constructor() {
      this.searchInputs = document.querySelectorAll('.search-input');
      this.searchResultsContainer = null;
      this.movieData = this.getMovieData();
      this.currentSearchTimeout = null;

      // Debug: Check if search inputs are found
      console.log('Search inputs found:', this.searchInputs.length);
      this.searchInputs.forEach((input, index) => {
        console.log(`Search input ${index}:`, input);
      });

      this.init();
    }

    init() {
      this.createSearchResultsContainer();
      this.bindEvents();
    }

    // Build movie list dynamically from main.js videoData
    getMovieData() {
      const movies = [];
      try {
        // Prefer global window.videoData so we never miss the latest data
        const source = (typeof window !== 'undefined' && window.videoData) || videoData;

        if (typeof source === 'object' && source !== null) {
          Object.keys(source).forEach((videoId) => {
            const data = source[videoId] || {};
            const rating = typeof data.rating === 'number' ? data.rating : 0;
            const stars =
              typeof data.stars === 'number'
                ? data.stars
                : rating
                ? Math.max(0, Math.min(5, rating / 2))
                : 0;

            movies.push({
              videoId: videoId,
              title: data.title || 'Movie',
              rating: rating,
              stars: stars,
              genres: Array.isArray(data.genres) ? data.genres : [],
              year: data.year ? String(data.year) : '',
              // If no explicit image is defined, fall back to a generic placeholder
              image: data.image || 'images/placeholder.jpg',
              description: data.description || '',
              tags: Array.isArray(data.tags) ? data.tags : [],
              age: data.age || '',
              duration: data.duration || ''
            });
          });
        }
      } catch (error) {
        console.error('Error building movie data for search:', error);
      }
      return movies;
    }

    createSearchResultsContainer() {
      // Create search results container template
      const containerTemplate = document.createElement('div');
      containerTemplate.className = 'search-results-container';

      // Add to all search input containers
      this.searchInputs.forEach(input => {
        const container = input.closest('.form-group');
        if (container) {
          container.style.position = 'relative';
          const resultsContainer = containerTemplate.cloneNode(true);
          container.appendChild(resultsContainer);
        }
      });
    }

    bindEvents() {
      this.searchInputs.forEach(input => {
        input.addEventListener('input', (e) => this.handleSearch(e));
        input.addEventListener('focus', (e) => this.showSearchResults(e));
        input.addEventListener('blur', (e) => this.hideSearchResults(e));
        input.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Prevent form submission on enter
        const form = input.closest('form');
        if (form) {
          form.addEventListener('submit', (e) => e.preventDefault());
        }
      });

      // Close search results when clicking outside
      document.addEventListener('click', (e) => {
        const clickedInsideSearchInput = e.target.closest('.search-input');
        const clickedInsideResults = e.target.closest('.search-results-container');
        const clickedInsideSearchBox = e.target.closest('.search-box');
        const clickedToggle = e.target.closest('.search-toggle');

        if (!clickedInsideSearchInput && !clickedInsideResults) {
          this.hideAllSearchResults();
        }

        if (!clickedInsideSearchBox && !clickedToggle) {
          this.closeSearchDropdowns();
        }
      });

      // Listen for search toggle clicks to reinitialize when search boxes become visible
      document.addEventListener('click', (e) => {
        if (e.target.closest('.search-toggle')) {
          // Wait for the search box to become visible
          setTimeout(() => {
            this.reinitializeSearch();
          }, 200);
        }
      });
    }

    reinitializeSearch() {
      // Re-find search inputs in case they were dynamically shown
      const newSearchInputs = document.querySelectorAll('.search-input');
      console.log('Reinitializing search with inputs:', newSearchInputs.length);

      // Remove old event listeners and add new ones
      newSearchInputs.forEach(input => {
        // Remove any existing listeners by cloning the element
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        // Add event listeners to the new input
        newInput.addEventListener('input', (e) => this.handleSearch(e));
        newInput.addEventListener('focus', (e) => this.showSearchResults(e));
        newInput.addEventListener('blur', (e) => this.hideSearchResults(e));
        newInput.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Prevent form submission on enter
        const form = newInput.closest('form');
        if (form) {
          form.addEventListener('submit', (e) => e.preventDefault());
        }
      });

      // Update the search inputs reference
      this.searchInputs = newSearchInputs;

      // Recreate search results containers
      this.createSearchResultsContainer();
    }

    handleSearch(event) {
      const query = event.target.value.trim();
      const resultsContainer = event.target.closest('.form-group').querySelector('.search-results-container');

      // Debug: Log search query
      console.log('Search query:', query);
      console.log('Results container:', resultsContainer);

      // Clear previous timeout
      if (this.currentSearchTimeout) {
        clearTimeout(this.currentSearchTimeout);
      }

      // Debounce search
      this.currentSearchTimeout = setTimeout(() => {
        if (query.length >= 2) {
          const results = this.searchMovies(query);
          console.log('Search results:', results);
          this.displaySearchResults(results, resultsContainer);
        } else {
          this.hideSearchResults(event);
        }
      }, 300);
    }

    searchMovies(query) {
      const searchTerm = query.toLowerCase();
      return this.movieData.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.genres.some(genre => genre.toLowerCase().includes(searchTerm)) ||
        (movie.year && movie.year.toString().includes(searchTerm))
      ).slice(0, 8); // Limit to 8 results
    }

    displaySearchResults(results, container) {
      if (!container) return;

      if (results.length === 0) {
        container.innerHTML = `
                <div class="search-no-results">
                    <p>No movies found</p>
                </div>
            `;
      } else {
        container.innerHTML = results.map(movie => this.createMovieResultHTML(movie)).join('');
      }

      container.style.display = 'block';
      container.classList.add('show');
      this.bindResultEvents(container);
    }

    createMovieResultHTML(movie) {
      // Get video link from movie data
      const videoLink = movie.videoLink || (movie.videoId ? (typeof getVideoLink === 'function' ? getVideoLink(movie.videoId) : `https://videopress.com/embed/${movie.videoId}`) : '');
      return `
            <div class="search-result-item" data-video-link="${videoLink}" data-video-id="${movie.videoId || ''}" data-title="${this.escapeHTML(movie.title)}">
                <div class="search-result-content">
                    <div class="search-result-image">
                        <img src="${movie.image}" alt="${this.escapeHTML(movie.title)}" 
                             onload="this.classList.add('loaded')" 
                             onerror="this.src='images/placeholder.jpg'; this.classList.add('loaded')"
                             loading="lazy">
                    </div>
                    <div class="search-result-info">
                        <h6 class="search-result-title">${this.escapeHTML(movie.title)}</h6>
                        <div class="search-result-meta">
                            <span class="search-result-year">${movie.year || ''}</span>
                            <span class="search-result-genre">${this.escapeHTML((movie.genres || []).join(', '))}</span>
                        </div>
                        <div class="search-result-rating">
                            <div class="rating-stars">
                                ${this.generateStarRating(movie.stars)}
                            </div>
                            <span class="rating-text">${movie.rating || 0}/10</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    escapeHTML(text) {
      const div = document.createElement('div');
      div.textContent = text || '';
      return div.innerHTML;
    }

    generateStarRating(stars) {
      const starCount = parseFloat(stars) || 0;
      const fullStars = Math.floor(starCount);
      const hasHalfStar = starCount % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

      let starsHTML = '';
      for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fa fa-star glowing-star"></i>';
      }
      if (hasHalfStar) {
        starsHTML += '<i class="fa fa-star-half-o glowing-star"></i>';
      }
      for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="fa fa-star-o text-muted"></i>';
      }
      return starsHTML;
    }

    bindResultEvents(container) {
      const resultItems = container.querySelectorAll('.search-result-item');
      resultItems.forEach(item => {
        // Make entire item clickable
        item.style.cursor = 'pointer';

        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Try data-video-link first, then fallback to data-video-id
          const videoLink = item.dataset.videoLink || item.dataset.videoId;
          const videoId = item.dataset.videoId; // Keep for lookup
          const title = item.dataset.title || item.querySelector('.search-result-title')?.textContent || 'Movie';

          if (videoLink || videoId) {
            // Find movie by videoId in movieData, or create a new object
            const movie = this.movieData.find(m => m.videoId === videoId) || { 
              videoId, 
              videoLink: videoLink || (videoId && typeof getVideoLink === 'function' ? getVideoLink(videoId) : `https://videopress.com/embed/${videoId}`),
              title 
            };
            this.handleMovieSelection(movie);
          }
        });
      });
    }

    handleMovieSelection(movie) {
      // Hide the search results
      this.hideAllSearchResults();

      // Clear search input
      this.searchInputs.forEach(input => {
        if (input.value.trim()) {
          input.value = '';
        }
        input.blur();
      });

      // Close any visible search boxes/toggles
      this.closeSearchDropdowns();

      // Debug: Log the movie selection
      console.log('Movie selected from search:', movie);
      console.log('openVideoGallery available:', typeof window.openVideoGallery);

      // Always open video gallery with the selected movie's video and sidebar
      if (typeof window.openVideoGallery === 'function') {
        // Use videoLink if available, otherwise get it from videoId
        let videoLink = movie.videoLink;
        if (!videoLink && movie.videoId) {
          videoLink = typeof getVideoLink === 'function' ? getVideoLink(movie.videoId) : `https://videopress.com/embed/${movie.videoId}`;
        }
        
        if (!videoLink) {
          console.error('No video link found for movie:', movie);
          return;
        }
        
        const title = movie.title || 'Movie';

        console.log('Calling openVideoGallery with:', videoLink, title);

        // Use setTimeout to ensure the search results are hidden first
        // This will open the video gallery as if it's a new opening with the selected video
        setTimeout(() => {
          window.openVideoGallery(videoLink, title);
        }, 100);
      } else {
        console.error('openVideoGallery function not found!');
        // Fallback: Try to trigger the video gallery manually
        this.triggerVideoGallery(movie);
      }
    }

    triggerVideoGallery(movie) {
      // Fallback method to trigger video gallery
      console.log('Using fallback method to open video gallery');

      // Try to find and click a Play Now button with the same video link or ID
      const videoLink = movie.videoLink || (movie.videoId && typeof getVideoLink === 'function' ? getVideoLink(movie.videoId) : null);
      let playNowButton = null;
      
      if (videoLink) {
        playNowButton = document.querySelector(`[data-video-link="${videoLink}"], [data-video-id="${videoLink}"]`);
      }
      
      if (!playNowButton && movie.videoId) {
        playNowButton = document.querySelector(`[data-video-link="${movie.videoId}"], [data-video-id="${movie.videoId}"]`);
      }
      
      if (playNowButton) {
        console.log('Found Play Now button, clicking it');
        playNowButton.click();
      } else {
        console.error('No Play Now button found for video:', movie.videoLink || movie.videoId);
      }
    }

    showSearchResults(event) {
      const container = event.target.closest('.form-group').querySelector('.search-results-container');
      if (container && event.target.value.trim().length >= 2) {
        container.style.display = 'block';
      }
    }

    hideSearchResults(event) {
      // Small delay to allow for clicking on results
      setTimeout(() => {
        const container = event.target.closest('.form-group').querySelector('.search-results-container');
        if (container) {
          container.style.display = 'none';
        }
      }, 150);
    }

    hideAllSearchResults() {
      document.querySelectorAll('.search-results-container').forEach(container => {
        container.style.display = 'none';
        container.classList.remove('show');
      });
    }

    closeSearchDropdowns() {
      // Remove open state classes from any search and notification dropdown containers
      document.querySelectorAll('.navbar-right li').forEach(listItem => {
        const hasSearchBox = listItem.querySelector('.search-box');
        const hasSubDropdown = listItem.querySelector('.iq-sub-dropdown');
        if (hasSearchBox || hasSubDropdown) {
          listItem.classList.remove('iq-show');
          const toggle = listItem.querySelector('.search-toggle');
          if (toggle) {
            toggle.classList.remove('active');
          }
        }
      });
    }

    clearSearch(input) {
      input.value = '';
      this.hideAllSearchResults();
    }

    handleKeydown(event) {
      const resultsContainer = event.target.closest('.form-group').querySelector('.search-results-container');
      if (!resultsContainer || resultsContainer.style.display === 'none') return;

      const resultItems = resultsContainer.querySelectorAll('.search-result-item');
      const currentIndex = Array.from(resultItems).findIndex(item => item.classList.contains('selected'));

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.navigateResults(resultItems, currentIndex, 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.navigateResults(resultItems, currentIndex, -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (currentIndex >= 0) {
            resultItems[currentIndex].click();
          }
          break;
        case 'Escape':
          this.hideAllSearchResults();
          break;
      }
    }

    navigateResults(resultItems, currentIndex, direction) {
      // Remove current selection
      resultItems.forEach(item => item.classList.remove('selected'));

      // Calculate new index
      let newIndex = currentIndex + direction;
      if (newIndex < 0) newIndex = resultItems.length - 1;
      if (newIndex >= resultItems.length) newIndex = 0;

      // Add selection to new item
      if (resultItems[newIndex]) {
        resultItems[newIndex].classList.add('selected');
        resultItems[newIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }

  // Initialize search when DOM is loaded and jQuery is ready
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      if (typeof jQuery !== 'undefined') {
        jQuery(document).ready(function () {
          // Wait a bit for any existing search toggle functionality to initialize
          setTimeout(function () {
            new NerflixSearch();
          }, 100);
        });
      } else {
        // Fallback if jQuery is not available
        setTimeout(function () {
          new NerflixSearch();
        }, 100);
      }
    });
  }

  function addFallbackAltText() {
    document.querySelectorAll('img').forEach(function(img){
      const currentAlt = img.getAttribute('alt');
      if (currentAlt && currentAlt.trim() !== '') return;
      let derived = null;
      const block = img.closest('.block-images') || img.closest('.block-image') || img.closest('.e-item');
      if (block) {
        const titleEl = block.querySelector('.iq-title a, .iq-title, .episodes-description a, .movie-content a');
        if (titleEl && titleEl.textContent.trim()) {
          derived = titleEl.textContent.trim();
        }
      }
      if (!derived && img.getAttribute('data-title')) derived = img.getAttribute('data-title');
      if (!derived && img.getAttribute('title')) derived = img.getAttribute('title');
      img.setAttribute('alt', derived ? (derived + ' poster') : 'Media thumbnail');
    });
  }

  function initA11y() {
    setCarouselControlA11y();
    addFallbackAltText();
  }

  if (typeof jQuery !== 'undefined' && jQuery(document)) {
    jQuery(document).on('initialized.owl.carousel refreshed.owl.carousel', '.owl-carousel', setCarouselControlA11y);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initA11y);
  } else {
    initA11y();
  }
})();

// Mobile section scroll reveal functionality
(function() {
  'use strict';
  
  function initMobileSectionReveal() {
    // Only run on mobile devices
    if (window.innerWidth > 767) {
      return;
    }
    
    // Only target sections within .main-content (home page), not video gallery
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
      return;
    }
    
    // Ensure all four main sections are visible on mobile (only in home page)
    // Handle duplicate IDs by using querySelectorAll
    const favoritesSection = mainContent.querySelector('#iq-favorites');
    const popularSection = mainContent.querySelector('#iq-upcoming-movie');
    const suggestedSections = mainContent.querySelectorAll('section[id="iq-suggested"]');
    
    if (favoritesSection) {
      favoritesSection.style.display = 'block';
      favoritesSection.style.visibility = 'visible';
      favoritesSection.style.opacity = '1';
    }
    
    if (popularSection) {
      popularSection.style.display = 'block';
      popularSection.style.visibility = 'visible';
      popularSection.style.opacity = '1';
    }
    
    // Show both Cartoons and Recommended For You sections (only in home page)
    suggestedSections.forEach(function(section) {
      section.style.display = 'block';
      section.style.visibility = 'visible';
      section.style.opacity = '1';
    });
    
    // Sections to reveal on scroll (only in home page)
    const sectionsToReveal = [
      mainContent.querySelector('#iq-topten'),
      mainContent.querySelector('#parallex'),
      mainContent.querySelector('#iq-trending')
    ].filter(function(section) {
      return section !== null;
    });
    
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      };
      
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          // Only process sections within main-content (home page)
          if (entry.isIntersecting && entry.target.closest('.main-content')) {
            entry.target.classList.add('in-view');
            // Optionally stop observing after it's been revealed
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      // Observe each section (already filtered to only main-content sections)
      sectionsToReveal.forEach(function(section) {
        if (section) {
          observer.observe(section);
        }
      });
    } else {
      // Fallback for browsers without Intersection Observer
      // Reveal sections when they're scrolled into view
      function checkScroll() {
        sectionsToReveal.forEach(function(section) {
          // Only process sections within main-content (home page)
          if (section && section.closest('.main-content') && !section.classList.contains('in-view')) {
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
            // If section is within viewport (with some margin)
            if (rect.top < windowHeight + 100 && rect.bottom > -100) {
              section.classList.add('in-view');
            }
          }
        });
      }
      
      let ticking = false;
      window.addEventListener('scroll', function() {
        if (!ticking) {
          window.requestAnimationFrame(function() {
            checkScroll();
            ticking = false;
          });
          ticking = true;
        }
      });
      
      // Check on initial load
      checkScroll();
    }
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileSectionReveal);
  } else {
    initMobileSectionReveal();
  }
  
  // Re-initialize on window resize (in case user rotates device)
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      initMobileSectionReveal();
    }, 250);
  });
})();

