(function (jQuery){
    "use strict";
    
    const LOADER_COLOR_CYCLE_MS = 5600;
    
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
            // While loading, keep body non-scrollable and fully covered
            document.body.classList.add('loading');

            // Hide loader when page is fully loaded
            window.addEventListener('load', function() {
                playLoaderCycle();
            });
        }
    }
    
    // Smooth Page Transitions
    function initPageTransitions() {
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
                
                // Add transition class
                document.body.classList.add('page-transitioning');
                
                // Navigate after short delay
                runAfterLoaderCycle(function() {
                    window.location.href = href;
                });
            }
        });
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
            
            // Update count box if it exists
            const countBoxes = item.querySelectorAll('.count-box');
            countBoxes.forEach(box => {
                const newText = likeCount > 0 ? likeCount + '+' : '0+';
                if (box.textContent !== newText) {
                    box.textContent = newText;
                }
            });
            
            // Find and update heart icon visual state
            const heartIcons = item.querySelectorAll('.fa-heart');
            heartIcons.forEach(heartIcon => {
                const heartSpan = heartIcon.closest('span');
                
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
            this.cookiePrefix = 'nerflix_watchlist_';
            this.cookieLifetimeDays = 7;
            this.expiryDurationMs = this.cookieLifetimeDays * 24 * 60 * 60 * 1000;
            this.watchlist = this.loadWatchlist();
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
        }
        
        setupPlusButtonListener() {
            document.addEventListener('click', (e) => {
                const plusIcon = e.target.closest('.fa-plus');
                if (!plusIcon) return;
                
                const slideItem = plusIcon.closest('[data-item-id]');
                if (!slideItem) return;
                
                e.preventDefault();
                e.stopPropagation();
                if (typeof e.stopImmediatePropagation === 'function') {
                    e.stopImmediatePropagation();
                }
                
                const itemId = this.ensureItemId(slideItem);
                this.cacheItemSnapshot(slideItem, itemId);
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
                
                const itemData = this.extractItemData(slideItem, itemId);
                if (!itemData) return;
                
                this.watchlist.push(itemData);
                this.watchlist.sort((a, b) => a.addedAt - b.addedAt);
                this.saveWatchlist();
                this.setItemCookie(itemId);
                this.markExistingItems();
                this.renderWatchlistPage();
                this.showNotification(`${itemData.title} added to watch list!`, 'success');
            }, true);
        }
        
        ensureItemId(slideItem) {
            if (!slideItem) return 'watch-' + Date.now();
            let itemId = slideItem.getAttribute('data-item-id');
            if (itemId) return itemId;
            
            const titleElement = slideItem.querySelector('.iq-title a, .iq-title');
            let base = titleElement ? titleElement.textContent.trim().toLowerCase() : 'item';
            base = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            if (!base) base = 'item';
            itemId = `${base}-${Date.now()}`;
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
                
                const videoButton = slideItem.querySelector('.iq-button[data-video-id]');
                const videoId = videoButton ? videoButton.getAttribute('data-video-id') : '';
                const videoTitle = videoButton ? (videoButton.getAttribute('data-title') || title) : title;
                
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
                    sourceSection
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
            const items = document.querySelectorAll('[data-item-id]');
            items.forEach(item => {
                const itemId = item.getAttribute('data-item-id');
                const plusIcon = item.querySelector('.fa-plus');
                if (!plusIcon) return;
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
            const playMarkup = item.videoId ? `
                <div class="hover-buttons">
                    <span class="btn btn-hover iq-button" data-video-id="${this.escapeAttribute(item.videoId)}" data-title="${this.escapeAttribute(item.videoTitle || item.title)}">
                        <i class="fa fa-play mr-1"></i>
                        Play Now
                    </span>
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
                    </div>
                    <div class="block-social-info">
                        <ul class="list-inline p-0 m-0 music-play-lists">
                            <li class="share">
                                <span><i class="fa fa-share-alt"></i></span>
                                <div class="share-box">
                                    <div class="d-flex align-items-center">
                                        <a href="#" class="share-ico"><i class="fa fa-share-alt"></i></a>
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
    var currentVideoId = 'dQw4w9WgXcQ';
    // Track last series scope (the DOM block for the series the user interacted with)
    window.__lastSeriesScope = null;
    
    // Video data structure with sidebar information
    const videoData = {
        // Main Slider Videos
        // 
        // To add Watch Full Movie and Download links for each movie, add these properties:
        //   watchFullLink: 'https://your-link.com/watch/movie-name',
        //   downloadLink: 'https://your-link.com/download/movie-name'
        //
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
            stars: 4.5,
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
            year: '2012',
            vimeoAsset: {
            vimeoId: '76979871',
            downloadUrl: 'https://player.vimeo.com/external/76979871.sd.mp4?s=d229c52d5c0f8dc4c48c3a3f2de24c8a6548297b&profile_id=164'
            }
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
            year: '2014',
            watchFullLink: 'https://example.com/watch/kingsman',
            downloadLink: 'https://example.com/download/kingsman'
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
            year: '2006',
            watchFullLink: 'https://example.com/watch/casino-royale',
            downloadLink: 'https://example.com/download/casino-royale'
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
        '8jLOx1hD3_o': {
            title: 'Mirzapur',
            rating: 8.4,
            stars: 4,
            genres: ['Action', 'Crime', 'Drama'],
            tags: ['Amazon Prime', 'Indian Series', 'Gangster'],
            description: 'A shocking incident at a wedding procession ignites a series of events entangling the lives of two families in the lawless city of Mirzapur.',
            age: '18+',
            duration: '2 Seasons',
            year: '2018',
            watchFullLink: 'https://example.com/watch/mirzapur',
            downloadLink: 'https://example.com/download/mirzapur'
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
            year: '1994',
            watchFullLink: 'https://example.com/watch/friends',
            downloadLink: 'https://example.com/download/friends'
        },
        // Search functionality movies

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
        year: '2024',
        watchFullLink: null, // Add your watch full movie link here
        downloadLink: null   // Add your download link here
    };

    const defaultVimeoAsset = {
        vimeoId: '76979871',
        downloadUrl: 'https://player.vimeo.com/external/76979871.sd.mp4?s=d229c52d5c0f8dc4c48c3a3f2de24c8a6548297b&profile_id=164'
    };

    const vimeoLibrary = {
        // Map specific YouTube IDs to Vimeo assets in the future if needed
    };

    // Ensure each title can stream/download via Vimeo even without a custom asset
    Object.keys(videoData).forEach((videoId) => {
        const video = videoData[videoId];
        if (video && !video.vimeoAsset) {
            video.vimeoAsset = {
                vimeoId: defaultVimeoAsset.vimeoId,
                downloadUrl: defaultVimeoAsset.downloadUrl
            };
        }
    });

    let isVimeoPlayerActive = false;
    let isVimeoFullscreenActive = false;
    let currentVimeoId = null;

    function getVimeoAsset(videoId) {
        const videoEntry = videoData[videoId];
        if (videoEntry && videoEntry.vimeoAsset) {
            return videoEntry.vimeoAsset;
        }
        if (vimeoLibrary[videoId]) {
            return vimeoLibrary[videoId];
        }
        return defaultVimeoAsset;
    }

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
        if (isVimeoPlayerActive) {
            deactivateVimeoPlayer();
        }
        if (videoId && videoId !== currentVideoId) {
            createVideoPlayer(videoId);
        }
    }
    
    // Function to stop video
    function stopVideo() {
        deactivateVimeoPlayer();
        const iframe = document.getElementById('embedded-video');
        if (iframe) {
            iframe.src = '';
        }
    }

    function deactivateVimeoPlayer() {
        const iframe = document.getElementById('embedded-vimeo');
        if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
        isVimeoPlayerActive = false;
        isVimeoFullscreenActive = false;
        currentVimeoId = null;
    }

    function createVimeoPlayer(vimeoId) {
        const videoContainer = document.getElementById('youtube-player');
        if (!videoContainer || !vimeoId) {
            displayNotification('Unable to play the selected video.', 'info');
            return;
        }
        videoContainer.innerHTML = '';

        const iframe = document.createElement('iframe');
        iframe.id = 'embedded-vimeo';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '10px';
        iframe.allow = 'autoplay; fullscreen; picture-in-picture; accelerometer';
        iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=0&controls=1&title=0&byline=0&portrait=0`;

        videoContainer.appendChild(iframe);
        isVimeoPlayerActive = true;
        currentVimeoId = vimeoId;
    }

    function enterVimeoFullscreenMode(asset) {
        if (!asset || !asset.vimeoId) {
            displayNotification('Full movie stream is not available right now.', 'info');
            return;
        }
        const playerContainer = getVideoPlayerContainer();
        if (!playerContainer) return;
        const shouldReload = !isVimeoPlayerActive || currentVimeoId !== asset.vimeoId;
        if (shouldReload) {
            stopVideo();
            createVimeoPlayer(asset.vimeoId);
        }
        isVimeoFullscreenActive = true;
        requestFullscreenOnElement(playerContainer);
    }

    function exitVimeoFullscreenMode() {
        if (!isVimeoFullscreenActive) return;
        isVimeoFullscreenActive = false;
        exitFullscreenFromDocument();
    }

    function handleFullscreenChange() {
        const hasFullscreenElement =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement;
        if (!hasFullscreenElement && isVimeoFullscreenActive) {
            exitVimeoFullscreenMode();
        }
    }

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(function(eventName) {
        document.addEventListener(eventName, handleFullscreenChange);
    });

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
    
    // Helper function to update action buttons with movie-specific links
    function updateActionButtonsFromVideoId(videoId) {
        let watchFullLink = null;
        let downloadLink = null;
        
        // First, try to get links from videoData structure
        if (typeof videoData !== 'undefined' && videoData[videoId]) {
            const movieData = videoData[videoId];
            watchFullLink = movieData.watchFullLink || null;
            downloadLink = movieData.downloadLink || null;
        }
        
        // If not found in videoData, try to get from HTML data attributes as fallback
        if (!watchFullLink || !downloadLink) {
            const movieButton = document.querySelector(`.iq-button[data-video-id="${videoId}"]`);
            if (movieButton) {
                watchFullLink = watchFullLink || movieButton.getAttribute('data-watch-full-link');
                downloadLink = downloadLink || movieButton.getAttribute('data-download-link');
            }
        }
        
        const watchFullBtn = document.querySelector('.btn-watch-full');
        const downloadBtn = document.querySelector('.btn-download');
        
        if (watchFullBtn) {
            if (watchFullLink) {
                watchFullBtn.setAttribute('data-movie-link', watchFullLink);
                watchFullBtn.style.display = '';
            } else {
                watchFullBtn.removeAttribute('data-movie-link');
                // Keep button visible for fallback functionality
            }
        }
        
        if (downloadBtn) {
            if (downloadLink) {
                downloadBtn.setAttribute('data-movie-link', downloadLink);
                downloadBtn.style.display = '';
            } else {
                downloadBtn.removeAttribute('data-movie-link');
                // Keep button visible for fallback functionality
            }
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
        
        // Update action buttons with movie-specific links
        updateActionButtonsFromVideoId(videoId);
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
             
             // Reset to default section
             showDefaultSection();
         }
         
         // Make closeVideoGallery function globally accessible
         window.closeVideoGallery = closeVideoGallery;
        
        // Event listeners for Play Now buttons
        playNowButtons.on('click', function(e) {
            e.preventDefault();
            
            const videoId = jQuery(this).attr('data-video-id') || 'dQw4w9WgXcQ';
            const title = jQuery(this).attr('data-title') || 'Movie Title';
            // Remember the series scope where this click happened
            const scope = jQuery(this).closest('.trending-info, .slide-item').get(0);
            if (scope) {
                window.__lastSeriesScope = scope;
            }
            
            openVideoGallery(videoId, title);
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
            const directDataElement = $trigger.closest('[data-video-id]');
            let videoId = directDataElement.attr('data-video-id');
            let title = directDataElement.attr('data-title');

            if (!videoId) {
                const block = $trigger.closest('.block-images, .e-item, .slide-item, .shows-img');
                const buttonWithData = block.find('[data-video-id]').first();
                if (buttonWithData.length) {
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

            return {
                videoId: videoId || window.currentVideoId || null,
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
        jQuery(document).on('click', '.notification-item', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const videoId = jQuery(this).attr('data-video-id');
            const title = jQuery(this).attr('data-title') || 'Movie Title';
            
            if (videoId) {
                // Close notification dropdown if open
                const dropdown = jQuery(this).closest('.iq-sub-dropdown');
                dropdown.removeClass('show');
                
                const listItem = jQuery(this).closest('li');
                if (listItem.length) {
                    listItem.removeClass('iq-show');
                    listItem.find('.search-toggle').removeClass('active');
                }
                
                // Open video gallery
                if (typeof openVideoGallery === 'function') {
                    openVideoGallery(videoId, title);
                }
            }
        });

        jQuery(document).on('click', '.share-ico', function(e) {
            const icon = jQuery(this).find('i');
            if (!icon.length) {
                return;
            }

            const isYoutube = icon.hasClass('fa-youtube');
            const isInstagram = icon.hasClass('fa-instagram');

            if (!isYoutube && !isInstagram) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            const videoData = getVideoDataForShare(jQuery(this));
            if (!videoData.videoId) {
                showShareCopyPopup({
                    title: videoData.title,
                    link: 'Link unavailable',
                    platform: isYoutube ? 'YouTube' : 'Instagram'
                });
                return;
            }

            const shareLink = `https://www.youtube.com/watch?v=${videoData.videoId}`;
            showShareCopyPopup({
                title: videoData.title,
                link: shareLink,
                platform: isYoutube ? 'YouTube' : 'Instagram'
            });
        });

        jQuery(document).on('click', '.video-open.playbtn', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const trigger = jQuery(this);
            let videoId = trigger.attr('data-video-id');
            let title = trigger.attr('data-title');

            if (!videoId) {
                const slideScope = trigger.closest('.slide');
                const fallbackButton = slideScope.find('.iq-button[data-video-id]').first();
                if (fallbackButton.length) {
                    videoId = fallbackButton.attr('data-video-id');
                    title = title || fallbackButton.attr('data-title');
                }
            }

            if (videoId && typeof openVideoGallery === 'function') {
                openVideoGallery(videoId, title || 'Trailer');
            }
        });
        
        // Event listeners for buttons inside video gallery (delegated event)
        // This handles clicks on play buttons within the video gallery default sections
        jQuery(document).on('click', '.video-gallery-overlay .iq-button', function(e) {
            // Check if this click is from within the video gallery
            if (videoGallery.hasClass('active')) {
                e.preventDefault();
                e.stopPropagation();
                
                const videoId = jQuery(this).attr('data-video-id');
                const title = jQuery(this).attr('data-title') || 'Movie Title';
                
                if (videoId) {
                    // Keep default sections visible (only hide for series with episodes)
                    showDefaultSection();
                    
                    // Load the video
                    loadVideoById(videoId);
                    updateSidebarContent(videoId);
                    
                    // Check if this is a series with episodes
                    const btn = this;
                    const eItem = jQuery(btn).closest('.e-item');
                    // Check if there's a series select nearby (indicating it's a series)
                    const hasSeriesContext = eItem.length && (
                        eItem.closest('.trending-info').find('.season-select').length > 0 ||
                        document.querySelector('.trending-info .season-select')
                    );
                    
                    // Only show episodes if it's actually a series
                    if (!hasSeriesContext) {
                        // For regular movies, keep default sections visible
                        showDefaultSection();
                    }
                    
                    // Enhanced smooth scroll to video player - scroll to top of overlay first
                    setTimeout(function() {
                        const videoPlayer = videoGallery.find('.video-player-container');
                        const playerRow = videoGallery.find('.row').first();
                        
                        if (videoPlayer.length && playerRow.length) {
                            // First, scroll overlay to top smoothly
                            videoGallery.animate({
                                scrollTop: 0
                            }, 400, 'swing', function() {
                                // Then ensure the player is visible with a slight delay for smoothness
                                setTimeout(function() {
                                    const playerElement = playerRow[0];
                                    if (playerElement) {
                                        // Use scrollIntoView with smooth behavior
                                        playerElement.scrollIntoView({ 
                                            behavior: 'smooth', 
                                            block: 'start',
                                            inline: 'nearest'
                                        });
                                    }
                                }, 100);
                            });
                        } else {
                            // Fallback: scroll to top
                            videoGallery.animate({
                                scrollTop: 0
                            }, 400, 'swing');
                        }
                    }, 100);
                }
            }
        });
        
        // Close button event listener
        closeBtn.on('click', closeVideoGallery);
        
        // Removed escape key and overlay click functionality
        // Only the Back Home button can close the video gallery
        
        // Watch Full Movie button - uses dynamic link from data-movie-link attribute
        jQuery(document).on('click', '.btn-watch-full', function() {
            const watchFullLink = jQuery(this).attr('data-movie-link');
            if (watchFullLink) {
                // Open the custom watch full movie link
                window.open(watchFullLink, '_blank');
            } else {
                // Fallback to old Vimeo behavior if no link is provided
                const asset = getVimeoAsset(currentVideoId);
                if (asset && asset.vimeoId) {
                    enterVimeoFullscreenMode(asset);
                } else {
                    displayNotification('Watch Full Movie link is not available for this title yet.', 'info');
                }
            }
        });
        
        // Download button - uses dynamic link from data-movie-link attribute
        jQuery(document).on('click', '.btn-download', function() {
            const downloadLink = jQuery(this).attr('data-movie-link');
            if (downloadLink) {
                // Open the custom download link
                window.open(downloadLink, '_blank');
            } else {
                // Fallback to old Vimeo behavior if no link is provided
                const asset = getVimeoAsset(currentVideoId);
                if (!asset || !asset.vimeoId) {
                    displayNotification('Download is not available for this title yet.', 'info');
                    return;
                }
                // Open Vimeo download page in a new tab
                const vimeoDownloadUrl = `https://vimeo.com/${asset.vimeoId}/download`;
                window.open(vimeoDownloadUrl, '_blank');
            }
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
        function showVideoGalleryOverlay(videoId, title) {
            console.log('Opening video gallery with:', videoId, title);
            
            // Show overlay first
            videoGallery.addClass('active');
            videoGallery.scrollTop(0);
            jQuery('body').css('overflow', 'hidden').addClass('video-gallery-active');
            
            // Show default section by default
            showDefaultSection();
            
            // Update sidebar content with video-specific data
            updateSidebarContent(videoId);
            // Render episodes under the player for THIS series (videoId) - only if it's a series
            try {
                const findSelectForVideoId = (vid) => {
                    // Prefer the last clicked series scope
                    if (window.__lastSeriesScope) {
                        const selInScope = window.__lastSeriesScope.querySelector('.season-select');
                        if (selInScope) return selInScope;
                        // If no select, later we will fallback to episodes container in scope
                    }
                    // Find the slide item that owns this videoId
                    const btn = document.querySelector('.slide-item .iq-button[data-video-id="' + vid + '"]');
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
                const seriesSelect = findSelectForVideoId(videoId);
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
                        const scopeBtn = document.querySelector('.slide-item .iq-button[data-video-id="' + videoId + '"]');
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
            
            // Load video immediately
            loadVideoById(videoId);
            
            // Enhanced smooth scroll to video player when gallery opens
            setTimeout(function() {
                const videoPlayer = videoGallery.find('.video-player-container');
                const playerRow = videoGallery.find('.row').first();
                
                if (videoPlayer.length && playerRow.length) {
                    // First, ensure body/html are at top
                    jQuery('html, body').animate({
                        scrollTop: 0
                    }, 0);
                    
                    // Then smoothly scroll overlay to top
                    videoGallery.animate({
                        scrollTop: 0
                    }, 500, 'swing', function() {
                        // After scrolling to top, ensure player is visible
                        setTimeout(function() {
                            const playerElement = playerRow[0];
                            if (playerElement) {
                                // Use scrollIntoView with smooth behavior for precise positioning
                                playerElement.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    block: 'start',
                                    inline: 'nearest'
                                });
                            }
                        }, 150);
                    });
                } else {
                    // Fallback: scroll to top smoothly
                    videoGallery.animate({
                        scrollTop: 0
                    }, 500, 'swing');
                }
            }, 200);
        }
        
        function openVideoGallery(videoId, title) {
            return runAfterLoaderCycle(function() {
                showVideoGalleryOverlay(videoId, title);
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
            responsive : {
                0:{ items : 1 },
                600:{ items : 1 },
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
            
            // Update Watch Full Movie and Download buttons with movie-specific links
            if (typeof updateActionButtonsFromVideoId === 'function') {
                updateActionButtonsFromVideoId(contentData.videoId);
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
const chatIcon = document.getElementById('chatIcon');
const chatIconSymbol = document.getElementById('chatIconSymbol');
const chatBox = document.getElementById('chatBox');
const closeBtn = document.getElementById('closeBtn');
const chatBody = document.getElementById('chatBody');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const notification = document.getElementById('notification');
const typingIndicator = document.getElementById('typingIndicator');

let isChatOpen = false;

function toggleChat() {
  isChatOpen = !isChatOpen;
  if (isChatOpen) {
    chatBox.classList.add('active');
    chatIcon.classList.add('send-mode');
    chatIconSymbol.className = 'fa fa-paper-plane';
    notification.style.display = 'none';
    messageInput.focus();
  } else {
    chatBox.classList.remove('active');
    chatIcon.classList.remove('send-mode');
    chatIconSymbol.className = 'fa fa-paper-plane';
  }
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (message === '') return;

  addMessage(message, 'user');
  messageInput.value = '';
  typingIndicator.classList.add('active');

  try {
    const formData = new FormData();
    formData.append('access_key', '3c0d553f-93ec-43d2-b299-e4399fa49dba');
    formData.append('subject', 'New message from chat widget');
    formData.append('message', message);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    typingIndicator.classList.remove('active');

    if (result.success) {
      addMessage("✅ Your message has been sent successfully! We'll reply to your email soon.", 'admin');
    } else {
      addMessage("❌ Failed to send. Please try again later.", 'admin');
    }
  } catch (error) {
    typingIndicator.classList.remove('active');
    addMessage("⚠️ Network error! Please check your connection.", 'admin');
  }
}

function addMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);

  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');
  messageContent.textContent = text;

  const messageTime = document.createElement('div');
  messageTime.classList.add('message-time');
  const now = new Date();
  messageTime.textContent = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

  messageDiv.appendChild(messageContent);
  messageDiv.appendChild(messageTime);
  chatBody.appendChild(messageDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

chatIcon.addEventListener('click', () => {
  if (isChatOpen) sendMessage();
  else toggleChat();
});

closeBtn.addEventListener('click', toggleChat);
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

setTimeout(() => {
  addMessage("We're here to help! Ask us anything.", 'admin');
  notification.style.display = 'flex';
}, 3000);


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
                  0:{ items: 1 },
                  600:{ items: 1 },
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
                  0:{ items: 1 },
                  600:{ items: 1 },
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
            0:{ items: 1 },
            600:{ items: 1 },
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
            0:{ items: 1 },
            600:{ items: 1 },
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

