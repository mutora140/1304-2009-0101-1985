
/* =====================================================
   SAFE SLICK INITIALIZER (ADDED - NO CODE REMOVED)
   Prevents double initialization on dynamic navigation
===================================================== */
function safeInitSlick(selector, options) {
    if (typeof window.jQuery === 'undefined') return;
    var $el = window.jQuery(selector);
    if (!$el || !$el.length) return;
    if (typeof $el.slick !== 'function') return;
    if ($el.hasClass('slick-initialized')) {
        try { $el.slick('unslick'); } catch (e) {}
    }
    $el.slick(options);
}
/* ===================================================== */

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
    
    // Page Loader Handler - Enhanced to hide all content until fully loaded
    function initPageLoader() {
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) {
            // Ensure loading class is on body (may already be there from HTML)
            if (!document.body.classList.contains('loading')) {
                document.body.classList.add('loading');
            }

            // Track all resources that need to load
            let resourcesLoaded = 0;
            let totalResources = 0;
            let allResourcesReady = false;

            // Wait for all resources to load (images, scripts, iframes, etc.)
            const images = document.querySelectorAll('img:not([loading="lazy"])');
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            const iframes = document.querySelectorAll('iframe:not([loading="lazy"])');
            const scripts = document.querySelectorAll('script[src]');
            
            // Count critical resources (non-lazy images and iframes)
            totalResources = images.length + iframes.length;
            
            // For lazy-loaded images, we don't wait for them
            // But we still add loading="lazy" to optimize

            function checkAllLoaded() {
                // Check if all critical resources are loaded
                if (totalResources === 0 || resourcesLoaded === totalResources) {
                    // Also wait for DOMContentLoaded and window load
                    if (document.readyState === 'complete') {
                        allResourcesReady = true;
                        showAllContent();
                    } else {
                        // Wait for window load event
                        window.addEventListener('load', function() {
                            setTimeout(function() {
                                allResourcesReady = true;
                                showAllContent();
                            }, 100);
                        });
                    }
                }
            }

            function showAllContent() {
                if (!allResourcesReady) return;
                
                // Small delay to ensure everything is rendered
                setTimeout(function() {
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
                }, 150);
            }

            // Track image loading (only critical images, not lazy ones)
            if (images.length > 0) {
                images.forEach(function(img) {
                    if (img.complete) {
                        resourcesLoaded++;
                    } else {
                        img.addEventListener('load', function() {
                            resourcesLoaded++;
                            checkAllLoaded();
                        });
                        img.addEventListener('error', function() {
                            resourcesLoaded++;
                            checkAllLoaded();
                        });
                    }
                });
            }

            // Track iframe loading (only critical iframes)
            if (iframes.length > 0) {
                iframes.forEach(function(iframe) {
                    if (iframe.complete || iframe.contentDocument?.readyState === 'complete') {
                        resourcesLoaded++;
                    } else {
                        iframe.addEventListener('load', function() {
                            resourcesLoaded++;
                            checkAllLoaded();
                        });
                        iframe.addEventListener('error', function() {
                            resourcesLoaded++;
                            checkAllLoaded();
                        });
                    }
                });
            }

            // Initial check
            checkAllLoaded();

            // Fallback: Hide loader when page is fully loaded (max 5 seconds)
            const maxWaitTime = setTimeout(function() {
                if (document.body.classList.contains('loading')) {
                    allResourcesReady = true;
                    showAllContent();
                }
            }, 5000);

            // Clear timeout when content is shown
            window.addEventListener('load', function() {
                clearTimeout(maxWaitTime);
            });
            
            // Force hide loader after page is fully interactive (safety measure)
            if (document.readyState === 'complete') {
                setTimeout(function() {
                    if (document.body.classList.contains('loading')) {
                        document.body.classList.remove('loading');
                        if (pageLoader) {
                            pageLoader.classList.add('hidden');
                            pageLoader.style.display = 'none';
                        }
                    }
                }, 1000);
            } else {
                window.addEventListener('load', function() {
                    setTimeout(function() {
                        if (document.body.classList.contains('loading')) {
                            document.body.classList.remove('loading');
                            if (pageLoader) {
                                pageLoader.classList.add('hidden');
                                pageLoader.style.display = 'none';
                            }
                        }
                    }, 1000);
                });
            }
        }
    }
    
    // Smooth Page Transitions with AJAX loading
    function initPageTransitions() {
        let isLoadingPage = false;
        
        // Handle all internal links
/* =====================================================
   DISABLED: Dynamic Page Loading (AJAX Navigation)
   Reason:
   - Breaks CSS when returning Home
   - Breaks Slick sliders
   - Causes layout destruction
   Status:
   - Code KEPT (not deleted)
   - Normal browser navigation restored
   ===================================================== */

/*
document.addEventListener("click", function (e) {
  const link = e.target.closest("a");
  if (!link || !link.href) return;

  if (link.href.startsWith(location.origin)) {
    e.preventDefault();
    loadPage(link.href);
  }
});
*/

        
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
        // This count is visible to ALL users and shows the total number of users who liked this item
        getLikeCount(itemId) {
            if (!this.likesData[itemId]) {
                return 0;
            }
            // Return the total number of unique users who liked this item
            // This count is shared and visible to all users
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
        // When a user likes/unlikes, the count box updates to show the total number of users who liked
        // This count is visible to ALL users viewing the page
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
                // This increases the total count visible to all users
                this.likesData[itemId][this.currentUserId] = true;
                this.showNotification('Added to favorites!', 'success');
            }
            
            // Save the updated likes data (persists across page loads)
            this.saveLikesData();
            
            // Update UI to show the new total count (visible to all users)
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
                z-index: 100000;
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
                        countBox.style.cssText = 'margin-left: 5px; color: #fff; font-size: 12px; display: inline-block; font-weight: 500;';
                        
                        // Insert after the heart icon span
                        if (heartSpan && heartSpan.parentNode) {
                            heartSpan.parentNode.insertBefore(countBox, heartSpan.nextSibling);
                        } else if (heartListItem) {
                            heartListItem.appendChild(countBox);
                        }
                    }
                    
                    // Always update count box with current like count (visible to all users)
                    // This shows the total number of users who liked this item
                    const newText = likeCount > 0 ? likeCount + '+' : '0+';
                    countBox.textContent = newText;
                    countBox.style.display = 'inline-block';
                    countBox.style.visibility = 'visible';
                    countBox.style.opacity = '1';
                    
                    // Add visual feedback when count changes
                    if (countBox.textContent !== newText || countBox.classList.contains('updated')) {
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
            // Ensure ALL count boxes show the total like count (visible to all users)
            const standaloneCountBoxes = item.querySelectorAll('.count-box');
            standaloneCountBoxes.forEach(box => {
                const newText = likeCount > 0 ? likeCount + '+' : '0+';
                box.textContent = newText;
                box.style.display = 'inline-block';
                box.style.visibility = 'visible';
                box.style.opacity = '1';
                
                // Add visual feedback
                box.classList.add('updated');
                setTimeout(() => {
                    box.classList.remove('updated');
                }, 500);
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
            
            // Also update items that have heart icons but might not have data-item-id yet
            // This ensures count boxes are visible for all items
            const allHeartIcons = document.querySelectorAll('.fa-heart');
            allHeartIcons.forEach(heartIcon => {
                const itemContainer = heartIcon.closest('[data-item-id]') || heartIcon.closest('.slide-item');
                if (itemContainer) {
                    let itemId = itemContainer.getAttribute('data-item-id');
                    if (!itemId) {
                        // Try to generate item ID if not present
                        const titleElement = itemContainer.querySelector('.iq-title a');
                        if (titleElement) {
                            let title = titleElement.textContent.trim();
                            title = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                            itemId = title;
                            itemContainer.setAttribute('data-item-id', itemId);
                        }
                    }
                    if (itemId) {
                        this.updateItemUI(itemId, itemContainer);
                    }
                }
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
            // Update ALL items to show their like counts (visible to all users)
            const allItems = document.querySelectorAll('[data-item-id]');
            allItems.forEach(item => {
                const itemId = item.getAttribute('data-item-id');
                if (itemId) {
                    // Always update UI to show count box with total likes
                    this.updateItemUI(itemId);
                }
            });
            
            // Also ensure all heart icons have count boxes, even if item doesn't have data-item-id
            const allHeartIcons = document.querySelectorAll('.fa-heart');
            allHeartIcons.forEach(heartIcon => {
                const itemContainer = heartIcon.closest('[data-item-id]') || heartIcon.closest('.slide-item');
                if (itemContainer) {
                    let itemId = itemContainer.getAttribute('data-item-id');
                    if (!itemId) {
                        // Generate item ID from title if not present
                        const titleElement = itemContainer.querySelector('.iq-title a');
                        if (titleElement) {
                            let title = titleElement.textContent.trim();
                            title = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                            itemId = title;
                            itemContainer.setAttribute('data-item-id', itemId);
                        }
                    }
                    if (itemId) {
                        // Update UI to ensure count box is visible with total likes
                        this.updateItemUI(itemId, itemContainer);
                    } else {
                        // Even without item ID, ensure count box exists and is visible
                        const heartListItem = heartIcon.closest('li');
                        if (heartListItem) {
                            let countBox = heartListItem.querySelector('.count-box');
                            if (!countBox) {
                                countBox = document.createElement('span');
                                countBox.className = 'count-box';
                                countBox.style.cssText = 'margin-left: 5px; color: #fff; font-size: 12px; display: inline-block; font-weight: 500;';
                                const heartSpan = heartIcon.closest('span');
                                if (heartSpan && heartSpan.parentNode) {
                                    heartSpan.parentNode.insertBefore(countBox, heartSpan.nextSibling);
                                } else {
                                    heartListItem.appendChild(countBox);
                                }
                            }
                            countBox.textContent = '0+';
                            countBox.style.display = 'inline-block';
                            countBox.style.visibility = 'visible';
                            countBox.style.opacity = '1';
                        }
                    }
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
            // Ensure count boxes are visible for all items
            this.applyPersistentLikes();
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
                            slidesToShow: 2,
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
            
            // Setup individual favorite delete buttons (removed - no delete buttons)
            this.setupFavoriteDeleteButtons();
            
            // Setup Play Now buttons
            this.setupPlayNowButtons();
        }
        
        setupFavoriteDeleteButtons() {
            // Removed - no delete buttons in favorites anymore
        }
        
        setupPlayNowButtons() {
            // Handle Play Now button clicks in favorites and watchlist
            document.addEventListener('click', (e) => {
                // Check for both button classes
                const playButton = e.target.closest('.btn-play-now-favorites') || e.target.closest('.btn-play-now');
                if (!playButton) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                // Get video ID or link from button
                let videoId = playButton.getAttribute('data-video-id');
                const videoTitle = playButton.getAttribute('data-video-title') || 'Movie';
                
                // If no videoId, try to get from parent slide item's data
                if (!videoId) {
                    const slideItem = playButton.closest('.slide-item');
                    if (slideItem) {
                        const itemId = slideItem.getAttribute('data-item-id');
                        // Try to get videoId from stored payload
                        try {
                            const payloadStr = slideItem.getAttribute('data-watchlist-payload');
                            if (payloadStr) {
                                const payload = JSON.parse(payloadStr);
                                videoId = payload.videoId || payload.itemId;
                            }
                        } catch (err) {
                            // If parsing fails, use itemId
                            videoId = itemId;
                        }
                    }
                }
                
                if (videoId) {
                    // Use navigateToWatchPage if available (shows loading overlay and navigates)
                    // This works the same way as other play buttons on the site
                    if (typeof window.navigateToWatchPage === 'function') {
                        window.navigateToWatchPage(videoId, videoTitle);
                    } else {
                        // Fallback: show loading overlay and navigate directly
                        if (typeof window.showPageLoadOverlay === 'function') {
                            window.showPageLoadOverlay();
                        }
                        window.location.href = `/watch/?id=${encodeURIComponent(videoId)}`;
                    }
                } else {
                    console.warn('No video ID found for Play Now button');
                }
            });
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
                        
                        // Also unlike when removing from favorites
                        if (window.likeSystem && typeof window.likeSystem.toggleLike === 'function') {
                            const wasLiked = window.likeSystem.hasUserLiked(itemId);
                            if (wasLiked) {
                                // Unlike it
                                window.likeSystem.toggleLike(itemId);
                            } else {
                                // Just update the UI to show current count
                                window.likeSystem.updateItemUI(itemId);
                                window.likeSystem.updateAllItemInstances(itemId);
                            }
                        }
                        
                        const title = removedFav && removedFav.title ? removedFav.title : 'Title';
                        this.showNotification(`${title} removed from favorites and unliked.`, 'info');
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
                    latestList.appendChild(this.createWatchlistSlide(item, true));
                });
                const latestEmptyState = document.querySelector('.watchlist-empty[data-section="favorites-latest"]');
                this.toggleEmptyState(latestEmptyState, latestItems.length === 0, latestList);
                this.updateCount('favorites-latest-count', latestItems.length);
                this.activateSlider(latestList);
            }

            if (allList) {
                this.resetSlider(allList);
                activeItems.forEach(item => {
                    allList.appendChild(this.createWatchlistSlide(item, true));
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
        
        createWatchlistSlide(item, isFavorite = false) {
            const li = document.createElement('li');
            li.className = 'slide-item';
            li.setAttribute('data-item-id', item.itemId);
            li.setAttribute('data-added-at', item.addedAt || Date.now());
            
            const imageSrc = item.image && item.image.trim() ? item.image : 'images/favorite/f1.jpg';
            const safeTitle = this.escapeHtml(item.title || 'Saved Title');
            const badgeMarkup = item.badge ? `<div class="badge badge-secondary p-1 mr-2">${this.escapeHtml(item.badge)}</div>` : '';
            const durationMarkup = item.duration ? `<span class="text-white">${this.escapeHtml(item.duration)}</span>` : '';
            const tagMarkup = item.tag ? `<span class="sequel-tag">${this.escapeHtml(item.tag)}</span>` : '';
            // Remove sourceSection text - user requested removal
            const sourceMarkup = ''; // Removed - not needed
            const descriptionMarkup = item.description ? `<p class="watchlist-description text-white-50 mb-0">${this.escapeHtml(item.description)}</p>` : '';
            const watchHref = item.watchUrl && String(item.watchUrl).trim();
            const downloadHref = item.downloadUrl && String(item.downloadUrl).trim();
            const videoId = item.videoId || item.itemId;
            const videoTitle = item.videoTitle || item.title || 'Movie';
            
            // Play Now button - styled like other pages (red background, small width)
            const playMarkup = videoId ? `
                <div class="hover-buttons mt-2">
                    <button class="btn btn-play-now-favorites" data-video-id="${this.escapeAttribute(videoId)}" data-video-title="${this.escapeAttribute(videoTitle)}">
                        <i class="fa fa-play mr-1"></i>
                        Play Now
                    </button>
                </div>
            ` : '';
            
            const downloadMarkup = downloadHref ? `
                <div class="hover-buttons mt-2">
                    <a class="btn btn-outline btn-download" href="${this.escapeAttribute(downloadHref)}" download>
                        <i class="fa fa-download mr-1"></i>
                        Download
                    </a>
                </div>
            ` : '';
            
            // Remove delete button for favorites (user requested to remove close button on hover)
            const deleteButtonMarkup = ''; // Removed - no close button in favorites
            
            li.innerHTML = `
                <div class="block-images position-relative">
                    ${deleteButtonMarkup}
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

        // Enhanced search and notification toggle functionality
        // Use capture phase to handle before other handlers
        jQuery(document).on('click', function(e){
            // IMPORTANT: Prevent default early for dropdown toggles to avoid navigation
            const target = e.target;
            const closestToggle = jQuery(target).closest('.search-toggle, .iq-sub-dropdown, .notification-item').length > 0;
            const closestDropdown = jQuery(target).closest('.iq-show, .search-box, .iq-sub-dropdown').length > 0;
            
            // If clicking on toggle elements, prevent default immediately
            if (jQuery(target).hasClass('search-toggle') || 
                jQuery(target).closest('.search-toggle').length > 0 ||
                jQuery(target).closest('li').find('.search-box, .iq-sub-dropdown').length > 0) {
                
                // Check if it's actually a link that would navigate
                const link = jQuery(target).closest('a');
                if (link.length && (link.attr('href') === '#' || link.attr('href') === 'javascript:void(0);' || link.attr('href') === '')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
            
            let myTargetElement = e.target;
            let clickedInsideSearch = false;
            let clickedInsideNotification = false;
            
            // Check if click is inside search box or results
            if (jQuery(myTargetElement).closest('.search-box, .search-input, .search-results-container, .form-group').length) {
                clickedInsideSearch = true;
            }
            
            // Check if click is inside notification dropdown (but not on notification items that should navigate)
            if (jQuery(myTargetElement).closest('.iq-sub-dropdown').length && !jQuery(myTargetElement).closest('.notification-item').length) {
                clickedInsideNotification = true;
            }
            
            // Handle search toggle clicks
            if(jQuery(myTargetElement).hasClass('search-toggle') || 
               jQuery(myTargetElement).parent().hasClass('search-toggle') || 
               jQuery(myTargetElement).parent().parent().hasClass('search-toggle') ||
               jQuery(myTargetElement).closest('.search-toggle').length){
                
                let toggleElement = jQuery(myTargetElement);
                if (toggleElement.hasClass('search-toggle')) {
                    toggleElement = toggleElement;
                } else {
                    toggleElement = jQuery(myTargetElement).closest('.search-toggle');
                }
                
                let listItem = toggleElement.closest('li');
                
                // Check if this is a search icon (has search-box) or notification bell (has iq-sub-dropdown)
                const hasSearchBox = listItem.find('.search-box').length > 0;
                const hasNotificationDropdown = listItem.find('.iq-sub-dropdown').length > 0 && !hasSearchBox;
                
                if (hasSearchBox) {
                    // This is a search toggle - prevent navigation
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close other dropdowns first
                    jQuery('.navbar-right li').not(listItem).removeClass('iq-show');
                    jQuery('.navbar-right li .search-toggle').not(toggleElement).removeClass('active');
                    
                    // Toggle this search dropdown
                    listItem.toggleClass('iq-show');
                    toggleElement.toggleClass('active');
                    
                    // Focus on search input when opened
                    if (listItem.hasClass('iq-show')) {
                        setTimeout(function() {
                            const searchInput = listItem.find('.search-input').first();
                            if (searchInput.length) {
                                searchInput.focus();
                            }
                        }, 100);
                    }
                    return false; // Stop event propagation
                } else if (hasNotificationDropdown) {
                    // This is a notification bell toggle - prevent navigation
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close other dropdowns first
                    jQuery('.navbar-right li').not(listItem).removeClass('iq-show');
                    jQuery('.navbar-right li .search-toggle').not(toggleElement).removeClass('active');
                    
                    // Toggle notification dropdown
                    listItem.toggleClass('iq-show');
                    toggleElement.toggleClass('active');
                    return false; // Stop event propagation
                }
            } 
            // Close dropdowns when clicking outside (but not if clicking inside search/notification)
            else if (!clickedInsideSearch && !clickedInsideNotification) {
                // Don't close if clicking on search input or results or notification items
                if (!jQuery(myTargetElement).closest('.search-input, .search-results-container, .iq-sub-dropdown, .notification-item, .search-box').length) {
                    jQuery('.navbar-right li').removeClass('iq-show');
                    jQuery('.navbar-right li .search-toggle').removeClass('active');
                }
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
                        slidesToShow : 2,
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
        // Note: For favorites/watchlist pages, the WatchlistManager handles heart clicks
        // This handler is for other pages
        jQuery(document).on('click', '.fa-heart, .heart-icon', function(e) {
            // Skip if this is in favorites or watchlist page (let WatchlistManager handle it)
            if (jQuery(this).closest('.favorites-slider, .watchlist-slider, #favorites-latest-list, #favorites-all-list, #watchlist-latest-list, #watchlist-all-list').length) {
                return; // Let WatchlistManager.setupPlusButtonListener handle it
            }
            
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

        // Mobile: tap on movie card shows overlay (share, like, watchlist, play) like desktop hover
        function isMobileOrTouch() {
            return window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(hover: none)').matches;
        }
        jQuery(document).on('click', 'li.slide-item', function(e) {
            if (!isMobileOrTouch()) return;
            var $slide = jQuery(this);
            var alreadyOpen = $slide.hasClass('slide-item-tapped');
            if (!alreadyOpen) {
                e.preventDefault();
                e.stopPropagation();
                jQuery('li.slide-item').removeClass('slide-item-tapped');
                $slide.addClass('slide-item-tapped');
            }
        });
        // Close overlay when tapping outside any movie card (mobile)
        jQuery(document).on('click', function(e) {
            if (!isMobileOrTouch()) return;
            if (!jQuery(e.target).closest('li.slide-item').length) {
                jQuery('li.slide-item').removeClass('slide-item-tapped');
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
        // To mark a video as an EPISODE (part of a series), add these properties:
        //   seriesId: 'unique-series-id',  // Same for all episodes in the series
        //   season: 1,                      // Season number (1, 2, 3, etc.)
        //   episodeNumber: 1,              // Episode number within the season (optional, for sorting)
        // When an episode is played, the watch page will show "Next Episodes" section instead of default sections
        //
        // Optional SEO-friendly slug (clean URL support for watch page):
        //   slug: 'pick-up-2025'
        //
        'benhur': {
            image: '/images/home/ben-hur.jpg',
            title: 'Ben-hur',
            slug: 'Ben-hur_Gaheza',
            rating: 7.9,
            actor:['Jack Huston','Pilou Asbæk'],
            stars: 4.5,
            genres: ['Action', 'History', 'Adventire'],
            interpreter: ['Gaheza'],
            tags: ['History', 'Adventure', 'Drama'],
            description: 'A falsely accused nobleman survives years of slavery to take vengeance on his best friend who betrayed him.',
            age: '12+',
            duration: 'Filme',
            year: '2016',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'king of killers': {
            image: '/images/home/king of killers.jpg',
            title: 'King of killers',
            slug: 'King of killers_Gaheza',
            rating: 8.9,
            actor:['Alain Moussi','Frank Grillo'],
            stars: 5,
            genres: ['Action','Thriller'],
            interpreter: ['Gaheza'],
            tags: ['Killers','Action'],
            description: 'Garan is a part of a group of international hitmen who are contracted to take out the most dangerous killer in the world, only to find out that they are the ones being hunted.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'army of the dead': {
            image: '/images/home/army of the dead.jpg',
            title: 'Army of the dead',
            slug: 'Army of the dead_Gaheza',
            rating: 8.9,
            actor:['Dave Bautista','Ella Purnell'],
            stars: 4,
            genres: ['Action', 'Crime', 'Horror'],
            interpreter: ['Gaheza'],
            tags: ['Horror',  'Crime'],
            description: 'A falsely accused nobleman survives years of slavery to take vengeance on his best friend who betrayed him.',
            age: '12+',
            duration: 'Filme',
            year: '2021',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'babylon ad': {
            image: '/images/home/babylon ad.jpg',
            title: 'Babylon A.D',
            slug: 'Babylon A.d_Gaheza',
            rating: 8.9,
            actor:['Vin Diesel','Melanie Thierry'],
            stars: 4.5,
            genres: ['Action', 'Sci-fi', 'Adventire'],
            interpreter: ['Gaheza'],
            tags: ['Adventure', 'Thriller', 'Action'],
            description: 'A veteran-turned-mercenary is hired to take a young woman with a secret from post-apocalyptic Eastern Europe to New York City.',
            age: '12+',
            duration: 'Filme',
            year: '2008',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'fistful vengeance': {
            image: '/images/home/fistful of vengeance.jpg',
            title: 'Fistful of vengeance',
            slug: 'Fistful-of-vengeance_Junior Git',
            rating: 8.9,
            actor:['Iko Uwais','Lewis Tan'],
            stars: 4.5,
            genres: ['Action', 'Fantasy', 'Thriller'],
            interpreter: ['Junior Git'],
            tags: ['Thriller', 'Fantasy',],
            description: 'A revenge mission becomes a fight to save the world from an ancient threat when superpowered assassin Kai tracks a killer to Bangkok.',
            age: '12+',
            duration: 'Filme',
            year: '2022',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'bloodshot': {
            image: '/images/home/bloodshot.jpg',
            title: 'Bloodshot',
            slug: 'Bloodshot_Savimbi',
            rating: 8.9,
            actor:['Vin Diesel','Eiza Gonzalez'],
            stars: 4.5,
            genres: ['Action', 'Sci-fi', 'Adventire'],
            interpreter: ['Savimbi'],
            tags: ['Action', 'Adventure'],
            description: 'After he and his wife are murdered, marine Ray Garrison is resurrected by a team of scientists. Enhanced with nanotechnology, he becomes a superhuman, biotech killing machine—Bloodshot. As Ray first trains with fellow super-soldiers, he cannot recall anything from his former life. But when his memories flood back and he remembers the man that killed both him and his wife, he breaks out of the facility to get revenge, only to discover that there is more to the conspiracy than he thought.',
            age: '12+',
            duration: 'Filme',
            year: '2020',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'bachchn pandey': {
            image: '/images/home/bachn pandey.jpg',
            title: 'Bachchn Pandey',
            slug: 'Bachchn-Pandey_Rocky',
            rating: 8.9,
            actor:['Akyshay Kumar','Kriti Sanon'],
            stars: 4.5,
            genres: ['Action', 'Comedy', 'Crime'],
            interpreter: ['Rocky'],
            tags: ['Action', 'Crime'],
            description: 'A budding director tries to research a merciless gangster for making a film on gangsterism. But her secret attempts to conduct the research fail when she gets caught for snooping.',
            age: '12+',
            duration: 'Filme',
            year: '2022',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'law abiding citzen': {
            image: '/images/home/law abiding citzen.jpg',
            title: 'Law abiding citzen',
            slug: 'Law-abiding-citzen _Rocky',
            rating: 8.9,
            actor:['Jamie Foxx','Gerard Butler'],
            stars: 4.5,
            genres: ['Crime', 'Drama', 'Thriller'],
            interpreter: ['Rocky'],
            tags: ['Thriller', 'Crime'],
            description: 'A falsely accused nobleman survives years of slavery to take vengeance on his best friend who betrayed him.',
            age: '12+',
            duration: 'Filme',
            year: '2009',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'adipurush': {
            image: '/images/home/adipurush.jpg',
            title: 'Adipurush',
            slug: 'Adipurush_Siniya',
            rating: 8.9,
            actor:['Prabhas','Saif Ali Khan'],
            stars: 4.5,
            genres: ['Action', 'Adventure', 'Fantasy'],
            interpreter: ['Siniya'],
            tags: ['Fantasy', 'Adventure'],
            description: '7000 years ago, Ayodhyas Prince Raghava and Prince Sesh along with the Mighty Vanar Warriors travels to the island of Lanka with an aim to rescue Raghava wife Janaki, who has been abducted by Lankesh, the king of Lanka.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'expendables 2': {
            image: '/images/home/expendables 2.jpg',
            title: 'Expendables 2',
            slug: 'Expendables-2_Gaheza',
            rating: 8.9,
            actor:['Sylvester Stallone','Jason Statham'],
            stars: 4.5,
            genres: ['Action', 'Thriller', 'Adventire'],
            interpreter: ['Gaheza'],
            tags: ['Action', 'Adventure'],
            description: 'Mr. Church reunites the Expendables for what should be an easy paycheck, but when one of their men is murdered on the job, their quest for revenge puts them deep in enemy territory and up against an unexpected threat.',
            age: '12+',
            duration: 'Filme',
            year: '2012',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'red': {
            image: '/images/home/red.jpg',
            title: 'RED:Retired Extremly Dangerous',
            slug: 'RED_Yanga',
            rating: 8.9,
            actor:['Bruce Willis','Morgan Freeman'],
            stars: 4.5,
            genres: ['Action', 'Crime', 'Adventire'],
            interpreter: ['Yanga'],
            tags: ['Thriller', 'Adventure'],
            description: 'After surviving an assault from a squad of hit men, retired CIA black ops agent Frank Moses reassembles his old team for an all-out war. Frank reunites with old Joe, crazy Marvin and wily Victoria to uncover a massive conspiracy that threatens their lives. Only their expert training will allow them to survive a near-impossible mission -- breaking into CIA headquarters.',
            age: '12+',
            duration: 'Filme',
            year: '2010',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'mechanic resurrection': {
            image: '/images/home/mechanic 2.jpg',
            title: 'Mechanic Resurrection',
            slug: 'Mechanic-Resurrection_Gaheza',
            rating: 8.9,
            actor:['Jason Statham','Jessica Alba'],
            stars: 4.5,
            genres: ['Action', 'Crime', 'Thriller'],
            interpreter: ['Gaheza'],
            tags: ['Action', 'Thriller'],
            description: 'Arthur Bishop thought he had put his murderous past behind him when his most formidable foe kidnaps the love of his life. Now he is forced to travel the globe to complete three impossible assassinations, and do what he does best, make them look like accidents.',
            age: '12+',
            duration: 'Filme',
            year: '2016',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'rocky handsome': {
            image: '/images/home/rocky handsome.jpg',
            title: 'Rocky Handsome',
            slug: 'Rocky-Handsome_Rocky',
            rating: 8.9,
            actor:['John Abraham','Shruti Haasan'],
            stars: 4.5,
            genres: ['Action', 'Thriller'],
            interpreter: ['Rocky'],
            tags: ['Serial Killer', 'Thriller'],
            description: 'A vengeful man embarks on a murderous rampage after the kidnapping of a 7-year-old girl.',
            age: '12+',
            duration: 'Filme',
            year: '2016',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'baaghi 1': {
            image: '/images/home/baagh 1.jpg',
            title: 'Baaghi 1',
            slug: 'Baaghi-1_Junior Git',
            rating: 8.9,
            actor:['Tiger Shroff','Shraddha Kapoor'],
            stars: 4.5,
            genres: ['Action', 'Thriller', 'Adventire'],
            interpreter: ['Junior Git'],
            tags: ['Thriller', 'Adventure', 'Romance'],
            description: 'Ronny is a rebellious man, who falls in love with Sia but circumstances separate them. Years later, Ronny learns that Sia is abducted by a martial arts champion, Raghav.',
            age: '12+',
            duration: 'Filme',
            year: '2016',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'red 2': {
            image: '/images/home/red 2.jpg',
            title: 'RED 2: Retired Extremly Dangerous ',
            slug: 'Red-2:Retired-Extremly-Dangerous-2_Yanga',
            rating: 8.9,
            actor:['Bruce Willis','John Malkovich'],
            stars: 4.5,
            genres: ['Action', 'Comedy', 'Thriller'],
            interpreter: ['Yanga'],
            tags: ['Comedy', 'Crime'],
            description: 'Retired C.I.A. agent Frank Moses reunites his unlikely team of elite operatives for a global quest to track down a missing portable nuclear device.',
            age: '12+',
            duration: 'Filme',
            year: '2013',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'xxx return': {
            image: '/images/home/xxx return.jpg',
            title: 'xXx-Return of Xander Cage',
            slug: 'xXx-Return-of-Xander-Cage_Gaheza',
            rating: 8.9,
            actor:['Vin Diesel','Don Yen'],
            stars: 4.5,
            genres: ['Action', 'Crime', 'Adventire'],
            interpreter: ['Gaheza'],
            tags: ['Action', 'Adventure'],
            description: 'Xander Cage is left for dead after an incident, though he secretly returns to action for a new, tough assignment with his handler Augustus Gibbons.',
            age: '12+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'expendables 1': {
            image: '/images/home/expendables 1.jpg',
            title: 'Expendables 1',
            slug: 'Expendables-1_Gaheza',
            rating: 8.9,
            actor:['Jet Li','Dolph Lundgren'],
            stars: 4.5,
            genres: ['Action', 'Thriller', 'Adventire'],
            interpreter: ['Gaheza'],
            tags: ['Thriller', 'Adventure'],
            description: 'Barney Ross leads a band of highly skilled mercenaries including knife enthusiast Lee Christmas, a martial arts expert Yin Yang, heavy weapons specialist Hale Caesar, demolitionist Toll Road, and a loose-cannon sniper Gunner Jensen. When the group is commissioned by the mysterious Mr. Church to assassinate the dictator of a small South American island, Barney and Lee visit the remote locale to scout out their opposition and discover the true nature of the conflict engulfing the city.',
            age: '12+',
            duration: 'Filme',
            year: '2010',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'weekend in taipei': {
            image: '/images/home/weekend in taipei.jpg',
            title: 'Weekend in taipei',
            slug: 'Weekend-in-taipei_Sankara',
            rating: 8.9,
            actor:['Luke Evans','Gwei Lun-Mei'],
            stars: 4.5,
            genres: ['Action', 'Thriller', 'Adventire'],
            interpreter: ['Sankara'],
            tags: ['History', 'Adventure', 'Drama'],
            description: 'A former DEA agent and a former undercover operative revisit their romance during a fateful weekend in Taipei, unaware of the dangerous consequences of their past.',
            age: '12+',
            duration: 'Filme',
            year: '2024',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'triple frontier': {
            image: '/images/home/triple frontier.jpg',
            title: 'Triple frontier',
            slug: 'Triple-frontier_Rocky',
            rating: 8.9,
            actor:['Ben Affleck','Oscar Isaac'],
            stars: 4.5,
            genres: ['Action', 'Thriller', 'Crime'],
            interpreter: ['Rocky'],
            tags: ['Crime', 'Adventure'],
            description: 'Struggling to make ends meet, former special ops soldiers reunite for a high-stakes heist: stealing $75 million from a South American drug lord.',
            age: '12+',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'villain return': {
            image: '/images/home/villain return.jpg',
            title: 'Ek Villain Return',
            slug: 'Ek-Villain-Return_Rocky',
            rating: 8.9,
            actor:['Jack Huston','Pilou Asbæk'],
            stars: 4.5,
            genres: ['Action', 'Crime', 'Thriller'],
            interpreter: ['Rocky'],
            tags: ['Serial Killer', 'Drama'],
            description: 'A falsely accused nobleman survives years of slavery to take vengeance on his best friend who betrayed him.',
            age: '12+',
            duration: 'Filme',
            year: '2022',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'dora and the lost city': {
            image: '/images/notify/thumb-2.jpg',
            title: 'Dora and the Lost City',
            slug: 'Dora-and-the-Lost-City_Rocky',
            rating: 7.3,
            actor:['Isabela Merced','Jeffrey Wahlberg'],
            stars: 4,
            genres: ['Family', 'Comedy', 'Adventure'],
            interpreter: ['Gaheza'],
            tags: ['Discovery', 'Comedy'],
            description: 'Dora, a girl who has spent most of her life exploring the jungle with her parents, now must navigate her most dangerous adventure yet: high school. Always the explorer, Dora quickly finds herself leading Boots (her best friend, a monkey), Diego, and a rag tag group of teens on an adventure to save her parents and solve the impossible mystery behind a lost Inca civilization.',
            age: '12+',
            duration: '2h 21min',
            year: '2019',
            r2Video: 'https://r2.example.com/movies/dora-and-the-lost-city.mp4',
            r2Download: 'https://r2.example.com/downloads/dora-and-the-lost-city.mp4',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie1.mp4',
            downluroadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        'pickup': {
            image: '/images/slider/slider1.jpg',
            title: 'Pick Up',
            slug: 'Pick-Up_Gaheza',
            rating: 7.3,
            actor:['Eddie Murphy','Pete davidson'],
            stars: 4,
            genres: ['Action', 'Comedy', 'Crime'],
            interpreter: ['Gaheza'],
            tags: ['Robbery', 'Comedy', 'Drama'],
            description: 'A routine cash pickup takes a wild turn when mismatched armored truck drivers Russell and Travis are ambushed by ruthless criminals led by savvy mastermind Zoe.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://miyagifilms.com/Chris%20Grey%20-%20ANOTHER%20LIFE%20(Official%20Lyric%20Video).mp4',
            downloadLink: 'https://cdn.example.com/download/avengers-age-of-ultron.mp4'
        },
        '1917': {
            image: '/images/slider/slider2.jpg',
            title: '1917',
            slug: '1917_Gaheza',
            rating: 7.4,
            actor:['George MackKay','Dean-Charles Chapman'],
            stars: 4,
            genres: ['War', 'History', 'Action'],
            interpreter: ['Gaheza'],
            tags: ['Drama', 'War',],
            description: 'At the height of the First World War, two young British soldiers must cross enemy territory and deliver a message that will stop a deadly attack on hundreds of soldiers.',
            age: '13+',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie2.mp4',
            downloadLink: 'https://cdn.example.com/download/frozen.mp4'
        },
        'work it': {
            image: '/images/slider/slider3.jpg',
            title: 'Work It',
            slug: 'Work-It_Dylan',
            rating: 7.5,
            actor:['Sabrina Carpenter','Liza Koshy'],
            stars: 4.5,
            genres: ['Comedy', 'Music',],
            interpreter: ['Dylan'],
            tags: ['Comedy', 'Music',],
            description: 'A brilliant but clumsy high school senior vows to get into her late fathers alma mater by transforming herself and a misfit squad into dance champions.',
            age: '16+',
            duration: 'Filme',
            year: '2020',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie3.mp4',
            downloadLink: 'https://cdn.example.com/download/the-conjuring.mp4'
        },
        'afterburn': {
            image: '/images/favorite/f1.jpg',
            title: 'afterburn',
            slug: 'Afterburn_Rocky',
            rating: 7.0,
            actor:['Dave Bautista','Olga Kurylenko'],
            stars: 4.5,
            genres: ['Sci-fi', 'Action', 'Comedy'],
            interpreter: ['Rocky'],
            tags: ['War', 'Live Action', 'Sci-fi'],
            description: 'Set against the backdrop of a postapocalyptic Earth whose Eastern Hemisphere was destroyed by a massive solar flare, leaving what life remains mutated from radiation and fallout. The story revolves around a group of treasure hunters who extract such objects as the Mona Lisa, the Rosetta Stone and the Crown Jewels while facing rival hunters, mutants and pirates.',
            age: '10+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie4.mp4',
            downloadLink: 'https://cdn.example.com/download/mulan-2020.mp4'
        },
        'death race': {
            image: '/images/favorite/f2.jpg',
            title: 'Death Race',
            slug: 'Death-Race_Gaheza',
            rating: 6.5,
            actor:['Jason Statham','Joan Allen'],
            stars: 4.5,
            genres: ['Action', 'Thriller', 'Sci-fi'],
            interpreter: ['Gaheza'],
            tags: ['Car race', 'Action',],
            description: 'Terminal Island, New York: 2020. Overcrowding in the US penal system has reached a breaking point. Prisons have been turned over to a monolithic Weyland Corporation, which sees jails full of thugs as an opportunity for televised sport. Adrenalized inmates, a global audience hungry for violence and a spectacular, enclosed arena come together to form the "Death Race", the biggest, most brutal event.',
            age: '18+',
            duration: 'Filme',
            year: '2008',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie5.mp4',
            downloadLink: 'https://cdn.example.com/download/laxmii.mp4'
        },
        'homefront': {
            image: '/images/favorite/f3.jpg',
            title: 'Homefront',
            slug: 'Homefront_Gaheza',
            rating: 6.9,
            actor:['Jason Statham','James Franco'],
            stars: 4,
            genres: ['Action', 'Thriller'],
            interpreter: ['gaheza'],
            tags: ['Action', 'Thriller',],
            description: 'Phil Broker is a former DEA agent who has gone through a crisis after his action against a biker gang went horribly wrong and it cost the life of his boss son. He is recently widowed and is left with a 9-years-old daughter, Maddy. He decides to quit the turbulent and demanding life of thrill for Maddys sake and retires to a small town. His daughter fights off a boy who was bullying her at school and this sets in motion a round of events that end in his direct confrontation with the local Meth drug lord. His past history with the biker gang also enters the arena, making matters more complex. But he has a mission in his mind to protect his daughter and he is ready to pay any cost that it demands.',
            age: '12+',
            duration: 'Filme',
            year: '2013',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/Chris%20Grey%20-%20ANOTHER%20LIFE%20(Official%20Lyric%20Video).mp4',
            videoType: 'video/mp4',
            downloadLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/Chris%20Grey%20-%20ANOTHER%20LIFE%20(Official%20Lyric%20Video).mp4'
        },
        'mayhem': {
            image: '/images/favorite/f4.jpg',
            title: 'Mayhem',
            slug: 'Mayhem_Gaheza',
            rating: 7.9,
            actor:['Nassim Lyes','Loryn Nounay'],
            stars: 4,
            genres: ['Action', 'Crime', 'Thriller'],
            interpreter: ['Gaheza'],
            tags: ['Action', 'Thriller',],
            description: 'Sam is a professional boxer about to get released from prison. While on parole, his past catches up with him and he has no choice but to flee. Five years later, he has rebuilt a simple life on an exotic island in Thailand with his wife and her daughter, but when he gets blackmailed by a dangerous local godfather, he must embark on a dangerous drug smuggling mission which results in a tragedy. Now he has only one purpose: to seek merciless vengeance.',
            age: '11+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/Chris%20Grey%20-%20ANOTHER%20LIFE%20(Official%20Lyric%20Video).mp4',
            downloadLink: 'https://cdn.example.com/download/life-of-pi.mp4'
        },
        'shadow force': {
            image: '/images/favorite/f5.jpg',
            title: 'Shadow Force',
            slug: 'shadow-force_Gaheza',
            rating: 6.8,
            actor:['Kerry Washington','Omar Sy'],
            stars: 3,
            genres: ['Action', 'Thriller'],
            interpreter: ['gaheza'],
            tags: ['Action', 'Thriller',],
            description: 'Kyrah and Isaac were once the leaders of a multinational special forces group called Shadow Force. They broke the rules by falling in love, and in order to protect their son, they go underground. With a large bounty on their heads, and the vengeful Shadow Force hot on their trail, one family fight becomes all-out war.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie8.mp4',
            downloadLink: 'https://cdn.example.com/download/mission-mangal.mp4'
        },
        'thieves highway': {
            image: '/images/favorite/f6.jpg',
            title: 'Thieves Highway',
            slug: 'Thieves-Highway_Didier',
            rating: 7.8,
            actor:['Aaron Eckhart','Devon Sawa'],
            stars: 4,
            genres: ['Action', 'Thriller','Crime'],
            interpreter: ['Didier'],
            tags: ['Action', 'Thriller','Drama'],
            description: 'After discovering a plot to haul stolen cattle in the middle of nowhere, a desperate and isolated lawman becomes the only thing standing between a group of dangerous rustlers and a clear run to the border.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie9.mp4',
            downloadLink: 'https://cdn.example.com/download/mission-mangal.mp4'
        },
        'the amazing spiderman': {
            image: '/images/favorite/f7.jpg',
            title: 'The Amazing Spiderman',
            slug: 'The-Amazing-spiderman_Siniya',
            rating: 8,
            actor:['Andrew Garfield','Emma Stone'],
            stars: 4.,
            genres: ['Action', 'Sci-fi','Adventure'],
            interpreter: ['Siniya'],
            tags: ['Action', 'Spiderman','Fantasy'],
            description: 'Peter Parker is an outcast high schooler abandoned by his parents as a boy, leaving him to be raised by his Uncle Ben and Aunt May. Like most teenagers, Peter is trying to figure out who he is and how he got to be the person he is today. As Peter discovers a mysterious briefcase that belonged to his father, he begins a quest to understand his parents disappearance – leading him directly to Oscorp and the lab of Dr. Curt Connors, his father former partner. As Spider-Man is set on a collision course with Connors alter ego, The Lizard, Peter will make life-altering choices to use his powers and shape his destiny to become a hero.',
            age: '12+',
            duration: 'Filme',
            year: '2012',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie10.mp4',
            downloadLink: 'https://cdn.example.com/download/mission-mangal.mp4'
        },
        'teen wolf': {
            image: '/images/favorite/f8.jpg',
            title: 'Teen Wolf: The Movie',
            slug: 'Teen-Wolf:The-Movie_Dylan',
            rating: 7.8,
            actor:['Tyler Posey','Crystal Reed'],
            stars: 4.5,
            genres: ['Fantasy', 'Sci-fi','Adventure'],
            interpreter: ['Dylan'],
            tags: ['Adventure', 'Teen Wolf','Fantasy'],
            description: 'The wolves are howling once again, as a terrifying ancient evil emerges in Beacon Hills. Scott McCall, no longer a teenager yet still an Alpha, must gather new allies and reunite trusted friends to fight back against this powerful and deadly enemy.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie11.mp4',
            downloadLink: 'https://cdn.example.com/download/mission-mangal.mp4'
        },
        'tarot': {
            image: '/images/favorite/f9.jpg',
            title: 'Tarot',
            slug: 'Tarot_Didier',
            rating: 8.7,
            actor:['Harriet Slater','Adain Bradley'],
            stars: 5,
            genres: ['Horror', 'Magic','Adventure'],
            interpreter: ['Didier'],
            tags: ['Adventure', 'Horror','Fantasy'],
            description: 'When a group of friends recklessly violate the sacred rule of Tarot readings, they unknowingly unleash an unspeakable evil trapped within the cursed cards. One by one, they come face to face with fate and end up in a race against death.',
            age: '12+',
            duration: 'Filme',
            year: '2024',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie12.mp4',
            downloadLink: 'https://cdn.example.com/download/mission-mangal.mp4'
        },
        'spiderman 3': {
            image: '/images/favorite/f10.jpg',
            title: 'Spiderman 3',
            slug: 'Spiderman-3_Siniya',
            rating: 8,
            actor:['Tobey Maguire','Kirsten Dunst'],
            stars: 5,
            genres: ['Sci-fi','Adventure'],
            interpreter: ['Siniya'],
            tags: ['Adventure', 'Superpower','Spiderman'],
            description: 'The seemingly invincible Spider-Man goes up against an all-new crop of villains—including the shape-shifting Sandman. While Spider-Man’s superpowers are altered by an alien organism, his alter ego, Peter Parker, deals with nemesis Eddie Brock and also gets caught up in a love triangle.',
            age: '12+',
            duration: 'Filme',
            year: '2007',
            videoLink: 'https://videopress.com/embed/q78_0TElYME',
            downloadLink: 'https://cdn.example.com/download/mission-mangal.mp4'
        },
        'light out': {
            image: '/images/favorite/f11.jpg',
            title: 'Light Out',
            slug: 'Lights-out_Siniya',
            rating: 7.4,
            actor:['Frank Grillo','Mekhi Phifer'],
            stars: 4,
            genres: ['War','Crime'],
            interpreter: ['Siniya'],
            tags: ['War', 'Crime',],
            description: 'A drifting ex-soldier turns underground fighter with the help of a just-released ex-con, pitting him against corrupt cops and hired killers now gunning for him and all those he cares about.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie14.mp4',
            downloadLink: 'https://cdn.example.com/download/mission-mangal.mp4'
        },
        'ruthless': {
            image: '/images/favorite/f12.jpg',
            title: 'Ruthless',
            slug: 'Ruthless_Didier',
            rating: 8.4,
            actor:['Dermot Mulroney','Jeff Fahey'],
            stars: 4.5,
            genres: ['Action','Crime'],
            interpreter: ['Didier'],
            tags: ['Drama', 'Crime',],
            description: 'A high school coach, whose teenage daughter was murdered, takes matters into his own hands by going after the men who kidnap his students for their sex trafficking operation.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie15.mp4',
            downloadLink: 'https://cdn.example.com/download/mission-mangal.mp4'
        },
        'possession of honnor': {
            image: '/images/popular/u1.jpg',
            title: 'Possession of Hannah',
            slug: 'Possession-of-Hannah_Gaheza',
            rating: 6.2,
            actor:['Shay Mitchell','Kirby Johnson'],
            stars: 3,
            genres: ['Action', 'Thriller'],
            interpreter: ['Gaheza'],
            tags: ['Action', 'Thriller',],
            description: 'When a cop who is just out of rehab takes the graveyard shift in a city hospital morgue, she faces a series of bizarre, violent events caused by an evil entity in one of the corpses.',
            age: '16+',
            duration: 'Filme',
            year: '2018',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie16.mp4',
            downloadLink: 'https://cdn.example.com/download/insidious-the-last-key.mp4'
        },
        'frankenstein': {
            image: '/images/popular/u2.jpg',
            title: 'Frankenstein',
            slug: 'Frankenstein_Savimbi',
            rating: 7.1,
            actor:['Aaron Eckhart','Yvonne Strahovski'],
            stars: 4,
            genres: ['Drama', 'fantasy', 'Horror'],
            interpreter: ['Savimbi'],
            tags: ['fantasy', 'Horror',],
            description: 'Dr. Victor Frankenstein, a brilliant but egotistical scientist, brings a creature to life in a monstrous experiment that ultimately leads to the undoing of both the creator and his tragic creation.',
            age: '12+',
            duration: 'Filme',
            year: '2014',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie17.mp4',
            downloadLink: 'https://cdn.example.com/download/war-2019.mp4'
        },
        'texas chain': {
            image: '/images/popular/u3.jpg',
            title: 'Texas Chain',
            slug: 'Texas-Chain_Sankara',
            rating: 7.2,
            actor:['alexandra Daddario','Dan yeager'],
            stars: 4,
            genres: ['Horror',],
            interpreter: ['Sankara'],
            tags: ['Horror',],
            description: 'Five friends head out to rural Texas to visit the grave of a grandfather. On the way, they stumble across what appears to be a deserted house, only to discover something sinister within. Something armed with a chainsaw.',
            age: '18+',
            duration: 'Filme',
            year: '2022',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie18.mp4',
            downloadLink: 'https://cdn.example.com/download/five-feet-apart.mp4'
        },
        'woman in the yard': {
            image: '/images/popular/u4.jpg',
            title: 'Woman in the yard',
            slug: 'Woman-in-the-Yard_Gaheza',
            rating: 8.0,
            actor:['Danielle Deadwyler','Okwui Okpokwasili'],
            stars: 4,
            genres: ['Horror', 'Thriller'],
            interpreter: ['Gaheza'],
            tags: ['Thriller', 'Horror'],
            description: 'In the aftermath of her husband death, widow Ramona struggle to raise her two kids is hindered by the arrival of a mysterious woman with supernatural abilities.',
            age: '10+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie19.mp4',
            downloadLink: 'https://cdn.example.com/download/chhichhore.mp4'
        },
        'hunting jessica': {
            image: '/images/popular/u5.jpg',
            title: 'Hunting jessica brok',
            slug: 'Hunting-Jessica-Brok_Gaheza',
            rating: 7.5,
            actor:['Danica Jones','Clyde Berning'],
            stars: 4,
            genres: ['Action', 'Thriller',],
            interpreter: ['Gaheza'],
            tags: ['Thriller', 'Action',],
            description: 'Long before she was a single mother in a sleepy South African town, Jessica Brok was a highly skilled, coldblooded, special ops assassin. She thought she’d left that life behind. She thought her last ill-fated mission was her last. She thought wrong.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie20.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'boyka undisputed 4': {
            image: '/images/junior/01.jpg',
            title: 'Boyka Undisputed IV',
            slug: 'Boyka-Undisputed-IV_Junior-Git',
            rating: 8.5,
            actor:['Scott Adkins','Teodora Duhovnikova'],
            stars: 5,
            genres: ['Action', 'Kick-Boxing','Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Kick-Boxing', 'Action','Boyka'],
            description: 'In the fourth installment of the fighting franchise, Boyka is shooting for the big leagues when an accidental death in the ring makes him question everything he stands for. When he finds out the wife of the man he accidentally killed is in trouble, Boyka offers to fight in a series of impossible battles to free her from a life of servitude.',
            age: '12+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie21.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'europe raiders': {
            image: '/images/junior/02.jpg',
            title: 'Europe Raiders',
            slug: 'Europe-Raiders_Junior-Git',
            rating: 7.5,
            actor:['Tony Leung Chiu-wai','Kris Wu',],
            stars: 4,
            genres: ['Action','Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Robbery', 'Action','Spy'],
            description: 'Mr. Lin and Ms. Lin are the number one and number two in the field. They are neither friends nor enemies, but they ultimately join hands along with trusty assistant Le Qi as they track down an infamous thief who has stolen the Heavenly Emperor Hand. Unbeknownst to them, they become the common target in a manhunt by the European triads, the CIA and many other agencies.',
            age: '12+',
            duration: 'Filme',
            year: '2018',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie22.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'mercy': {
            image: '/images/junior/03.jpg',
            title: 'Mercy',
            slug: 'Mercy_Junior-Git',
            rating: 8,
            actor:['Leah Gibson','jonathan Rhys Meyers'],
            stars: 4.5,
            genres: ['Action','Crime','Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Revenge', 'Action','Crime'],
            description: 'An ex-military doctor finds herself in a deadly battle for survival when the Irish mafia seize control of the hospital at which she works. When her son is taken hostage, she is forced to rely upon her battle-hardened past and lethal skills after realizing there’s no one left to save the day but her.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://videopress.com/embed/Lt-U_t2pUHI',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        '2:22': {
            image: '/images/junior/04.jpg',
            title: '2:22',
            slug: '2:22_Junior-Git',
            rating: 8.7,
            actor:['Michiel Huisman','Teresa Palmer'],
            stars: 5,
            genres: ['Action','Crime'],
            interpreter: ['Junior Giti'],
            tags: [, 'Action','Crime'],
            description: 'Two planes almost collide after a blinding flash of light paralyzes air traffic controller Dylan Branson for a few seconds. Suspended from his job, Dylan starts to notice an ominous pattern of sounds and events that repeats itself in exactly the same manner every day, ending precisely at 2:22 p.m. Also drawn into a complex relationship with a woman, Dylan must figure out a way to break the power of the past and take control of time itself.',
            age: '12+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie23.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'ziam': {
            image: '/images/junior/05.jpg',
            title: 'Ziam',
            slug: 'Ziam_Junior-Git',
            rating: 8,
            actor:['Prin Suparat','Nuttanicha Dungwattana'],
            stars: 5,
            genres: ['Action','Horror','Thriller'],
            interpreter: ['Junior Giti'],
            tags: ['Action', 'Zombie','Fantasy'],
            description: 'In a fight for survival against a horrifying army of zombies, a former Muay Thai fighter must use skill, speed and grit to save his girlfriend.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie24.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        '6 underground': {
            image: '/images/junior/06.jpg',
            title: '6 Underground',
            slug: '6-Uderground_Junior-Git',
            rating: 8.8,
            actor:['Ryan Reynolds','Mélanie Laurent'],
            stars: 5,
            genres: ['Action','Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Action', 'Crime','Spy'],
            description: 'After faking his death, a tech billionaire recruits a team of international operatives for a bold and bloody mission to take down a brutal dictator.',
            age: '12+',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie25.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        '7 days in entebbe': {
            image: '/images/junior/07.jpg',
            title: '7 Days in Entebbe',
            slug: '7-Days-in-Entebbe_Junior-Git',
            rating: 7.8,
            actor:['Rosamund Pike','Daniel Bruhl'],
            stars: 4,
            genres: ['Action','Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Action', 'Crime',],
            description: 'In 1976, four hijackers take over an Air France airplane en route from Tel Aviv to Paris and force it to land in Entebbe, Uganda. With 248 passengers on board, one of the most daring rescue missions ever is set in motion.',
            age: '12+',
            duration: 'Filme',
            year: '2018',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie26.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'paskal': {
            image: '/images/junior/08.jpg',
            title: 'Paskal',
            slug: 'Paskal_Junior-Git',
            rating: 8,
            actor:['Adrian Teh','Hairul Azreen'],
            stars: 4.5,
            genres: ['Action','Crime','War'],
            interpreter: ['Junior Giti'],
            tags: ['Action', 'Crime','Afganistan'],
            description: 'A story of true piracy based on an elite unit of the Royal Malaysian Navy mission.',
            age: '12+',
            duration: 'Filme',
            year: '2018',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie27.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'plane': {
            image: '/images/junior/09.jpg',
            title: 'Plane',
            slug: 'Plane_Junior-Git',
            rating: 8,
            actor:['Gerard Butler','Mike Colter'],
            stars: 5,
            genres: ['Action','Crime',],
            interpreter: ['Junior Giti'],
            tags: ['Action', 'Crime','Plane Crush'],
            description: 'After a heroic job of successfully landing his storm-damaged aircraft in a war zone, a fearless pilot finds himself between the agendas of multiple militias planning to take the plane and its passengers hostage.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie28.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'the witch': {
            image: '/images/junior/10.jpg',
            title: 'The Witch',
            slug: 'The-Witch_Junior-Git',
            rating: 8,
            actor:['Anya Taylor-Joy','Ralph Ineson'],
            stars: 5,
            genres: ['Action','Crime','Sci-fi'],
            interpreter: ['Junior Giti'],
            tags: ['Action', 'Sci-fi','Korea'],
            description: 'In 1630, a farmer relocates his family to a remote plot of land on the edge of a forest where strange, unsettling things happen. With suspicion and paranoia mounting, each family member faith, loyalty and love are tested in shocking ways.',
            age: '12+',
            duration: 'Filme',
            year: '2015',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie29.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'iceman: traveller': {
            image: '/images/junior/11.jpg',
            title: 'Iceman: Traveller',
            slug: 'Iceman:Treveler_Junior-Git',
            rating: 8,
            actor:['Donnie Yen','Eva Huang Shengyi'],
            stars: 5,
            genres: ['Action','Adventure','Sci-fi'],
            interpreter: ['Junior Giti'],
            tags: ['Action', 'Sci-fi','Fantasy'],
            description: 'The imperial guard and his three traitorous childhood friends ordered to hunt him down get accidentally buried and kept frozen in time. 400 years later pass and they are defrosted continuing the battle they left behind.',
            age: '12+',
            duration: 'Filme',
            year: '2014',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie30.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'kandahar': {
            image: '/images/junior/12.jpg',
            title: 'Kandahar',
            slug: 'Kandahar_Junior-Git',
            rating: 8,
            actor:['Gerard Butler','Navid Negahban'],
            stars: 5,
            genres: ['Action','Adventure','Sci-fi'],
            interpreter: ['Junior Giti'],
            tags: ['Action', 'Sci-fi','Fantasy'],
            description: 'After his mission is exposed, an undercover CIA operative stuck deep in hostile territory in Afghanistan must fight his way out, alongside his Afghan translator, to an extraction point in Kandahar, all whilst avoiding elite enemy forces and foreign spies tasked with hunting them down.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie31.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'night of hunted': {
            image: '/images/popular/u6.jpg',
            title: 'Night of Hunted',
            slug: 'Night-of-Hunted_Didier',
            rating: 8.5,
            actor:['camille Rowe','Aleksandar Popovic'],
            stars: 4.5,
            genres: ['Horror', 'Thriller','Mystery'],
            interpreter: ['Didier'],
            tags: ['Thriller', 'Action','Crime'],
            description: 'When an unsuspecting woman stops at a remote gas station in the dead of night, she made the plaything of a sociopath sniper with a secret vendetta. To survive, she must not only dodge his bullets and fight for her life, but also figure out who wants her dead and why.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie32.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'hunting season': {
            image: '/images/popular/u7.jpg',
            title: 'Hunting Season',
            slug: 'Hunting-Season_Didier',
            rating: 8.0,
            actor:['Mel Gibson','Shelley Hennig'],
            stars: 5,
            genres: ['Action', 'Drama','Thriller'],
            interpreter: ['Didier'],
            tags: ['Thriller', 'Action','Crime'],
            description: 'When a reclusive survivalist and his daughter rescue a mysterious, wounded woman from a river, they become entangled in a deadly web of violence and revenge, forcing them to confront a brutal criminal to survive.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie33.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'hostile takeover': {
            image: '/images/popular/u8.jpg',
            title: 'Hostile Takeover',
            slug: 'Hostile-Takeover_Didier',
            rating: 8.0,
            actor:['Micheal Jai White','Aimee Stolte'],
            stars: 5,
            genres: ['Action', 'Comedy','Thriller'],
            interpreter: ['Didier'],
            tags: ['Thriller', 'Action','Crime'],
            description: 'Follows Pete, a professional hitman, as he faces a group of assassins after the boss of a crime syndicate suspects disloyalty due to his attendance at Workaholics Anonymous meetings.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie34.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'guns up': {
            image: '/images/popular/u9.jpg',
            title: 'Guns Up',
            slug: 'Guns-Up_Didiers',
            rating: 7.6,
            actor:['Kevin James','Christina Ricci'],
            stars: 4.5,
            genres: ['Action', 'Crime'],
            interpreter: ['Didier'],
            tags: ['Action','Crime'],
            description: 'When a job goes horribly wrong, an ex-cop and family man who moonlights as a mob henchman has one night to get his family out of the city.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie35.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'dunki': {
            image: '/images/popular/u10.jpg',
            title: 'Dunki',
            slug: 'Dunki_Siniya',
            rating: 7.2,
            actor:['Shan Rukh Khan','Taapsee Pannu'],
            stars: 4,
            genres: ['Drama', 'Adventure','Comedy'],
            interpreter: ['Siniya'],
            tags: ['India','Drama','Shan Rukh Khan'],
            description: 'Four friends from a sleepy little village in Punjab share a common dream: to go to England. Their problem is that they have neither the visa nor the ticket. A soldier alights from a train one day, and their lives change. He gives them a soldier promise: He will take them to the land of their dreams. What follows is a hilarious and heartwarming tale of a perilous journey through the desert and the sea, but most crucially through the hinterlands of their mind.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie36.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'alita: the battle angel': {
            image: '/images/popular/u11.jpg',
            title: 'Alita: The Battle Angel',
            slug: 'Alita:The-Battle-Angel_Sankara',
            rating: 8.7,
            actor:['Rosa Salazar','Christoph Waltz'],
            stars: 5,
            genres: ['Sci-fi', 'Adventure','Action'],
            interpreter: ['Sankara'],
            tags: ['Action','Robot','Sci-fi'],
            description: 'When Alita awakens with no memory of who she is in a future world she does not recognize, she is taken in by Ido, a compassionate doctor who realizes that somewhere in this abandoned cyborg shell is the heart and soul of a young woman with an extraordinary past.',
            age: '12+',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie37.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'aftermath': {
            image: '/images/popular/u12.jpg',
            title: 'Aftermath',
            slug: 'Aftermath_Junior-Git',
            rating: 8.0,
            actor:['Dylan Sprouse','Mason Gooding'],
            stars: 4.5,
            genres: ['War', 'Thriller','Action'],
            interpreter: ['Junior Giti'],
            tags: ['Action','War',],
            description: 'gets trapped with his teenage sister on Boston Tobin Memorial Bridge when a heavily armed group of ex-military revolutionaries take everyone hostage.',
            age: '12+',
            duration: 'Filme',
            year: '2024',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie38.mp4',
            downloadLink: 'https://cdn.example.com/download/doctor-strange.mp4'
        },
        'next': {
            image: '/images/top-10/01.jpg',
            title: 'Next',
            slug: 'Next_Gaheza',
            rating: 7.6,
            actor:['Nicolas Cage','Julianne Moore'],
            stars: 4,
            genres: ['Action', 'Sci-fi', 'Thriller'],
            interpreter: ['Gaheza'],
            tags: ['Thriller', 'Sci-fi',],
            description: 'Las Vegas showroom magician Cris Johnson has a secret which torments him: he can see a few minutes into the future. Sick of the examinations he underwent as a child and the interest of the government and medical establishment in his power, he lies low under an assumed name in Vegas, performing cheap tricks and living off small-time gambling "winnings." But when a terrorist group threatens to detonate a nuclear device in Los Angeles, government agent Callie Ferris must use all her wiles to capture Cris and convince him to help her stop the cataclysm.',
            age: '10+',
            duration: 'Filme',
            year: '2007',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie39.mp4',
            downloadLink: 'https://cdn.example.com/download/harry-potter-and-the-sorcerers-stone.mp4'
        },
        'lou': {
            image: '/images/top-10/02.jpg',
            title: 'Lou',
            slug: 'Lou_Gaheza',
            rating: 8.6,
            actor:['Allison Janney','Jurnee Smollett'],
            stars: 5,
            genres: ['Action', 'Thriller'],
            interpreter: ['Gaheza'],
            tags: ['Thriller', 'Action'],
            description: 'A young girl is kidnapped during a powerful storm. Her mother joins forces with her mysterious neighbour to set off in pursuit of the kidnapper. Their journey will test their limits and expose the dark secrets of their past.',
            age: '18+',
            duration: 'Filme',
            year: '2022',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie40.mp4',
            downloadLink: 'https://cdn.example.com/download/the-queens-gambit.mp4'
        },
        'f1: the movie': {
            image: '/images/top-10/03.jpg',
            title: 'F1: The movie',
            slug: 'F1:The-Movie_Gaheza',
            rating: 8.7,
            actor:['Brad Pitt','Damson Idris',],
            stars: 4.5,
            genres: ['Action', 'Drama',],
            interpreter: ['Gaheza'],
            tags: ['Cars', 'F1', 'Action'],
            description: 'Racing legend Sonny Hayes is coaxed out of retirement to lead a struggling Formula 1 team—and mentor a young hotshot driver—while chasing one more chance at glory.',
            age: '16+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie41.mp4',
            downloadLink: 'https://cdn.example.com/download/stranger-things.mp4'
        },
        'play dirty': {
            image: '/images/top-10/04.jpg',
            title: 'Play dirty',
            slug: 'Play-Dirty_Gaheza',
            rating: 8.8,
            actor:['Mark Wahlberg','LaKeith Stanfield'],
            stars: 5,
            genres: ['Crime'],
            interpreter: ['Gaheza'],
            tags: ['Crime',],
            description:'Expert thief Parker gets a shot at a major heist, but to pull it off he and his team must outsmart a South American dictator, the New York mob, and the world richest man.',
            age: '15+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie42.mp4',
            downloadLink: 'https://cdn.example.com/download/bojack-horseman.mp4'
        },
        'ice road': {
            image: '/images/top-10/05.jpg',
            title: 'Ice road: Vegeance',
            slug: 'Iceroad:Vengeance_Gaheza',
            rating: 8.8,
            actor:['Liam Neeson','Fan Bingbing'],
            stars: 5,
            genres: ['Action', 'Thriller'],
            interpreter: ['Gaheza'],
            tags: ['Action', 'Thriller', 'Drama'],
            description: 'Big rig ice road driver Mike McCann travels to Nepal to scatter his late brother’s ashes on Mt. Everest. While on a packed tour bus traversing the deadly 12,000 ft. terrain of the infamous Road to the Sky, McCann and his mountain guide encounter a group of mercenaries and must fight to save themselves, the busload of innocent travelers, and the local villagers’ homeland.',
            age: '20+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie43.mp4',
            downloadLink: 'https://cdn.example.com/download/peaky-blinders.mp4'
        },
        'the carpenter son': {
            image: '/images/top-10/06.jpg',
            title: 'Carpenter son',
            slug: "Carpenter's-Son_Gaheza",
            rating: 8.5,
            actor:['Nicolas Cage','Noah Jupe'],
            stars: 4,
            genres: ['Horror', 'History'],
            interpreter: ['Gaheza'],
            tags: ['Jesus', 'Christianity',],
            description: 'A remote village in Roman-era Egypt explodes into spiritual warfare when a carpenter, his wife and their child are targeted by supernatural forces.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie44.mp4',
            downloadLink: 'https://cdn.example.com/download/nba-basketball-highlights.mp4'
        },
        'monkey king': {
            image: '/images/suggested/01.jpg',
            title: 'Monkey King',
            slug: 'Monkey-King_Ryan',
            rating: 8.2,
            actor:['Jimmy O. Yang','Bowen Yang'],
            stars: 4,
            genres: ['Fantasy', 'Family'],
            interpreter: ['Ryan'],
            tags: ['Cartoon', 'Family',],
            description: 'Charismatic Monkey and his magical fighting stick team up on an epic quest during which they must go head-to-head against gods, demons, dragons and the greatest enemy of all, Monkey own ego.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie45.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'nezha': {
            image: '/images/suggested/02.jpg',
            title: 'Nezha 1',
            slug: 'Nezha_Master-P',
            rating: 8.2,
            actor:['Lu Yanting','Joseph'],
            stars: 4.5,
            genres: ['Animation', 'Cartoon'],
            interpreter: ['Master p'],
            tags: ['Cartoon', 'Family',],
            description: 'A young boy is born as the reincarnation of a demonic power, into a society that hates and fears him. Destined by prophecy to bring destruction to the world, Nezha must choose between good and evil to see if he can change his fate.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie46.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'bigfoot family': {
            image: '/images/suggested/03.jpg',
            title: 'BigFoot Family',
            slug: 'Bigfoot-Family_Master-P',
            rating: 8.7,
            actor:['Jules Medcraft','David Lodge'],
            stars: 5,
            genres: ['Animation', 'Adventure'],
            interpreter: ['Master p'],
            tags: ['Adventure', 'Family',],
            description: 'Bigfoot, Adam father, wants to use his fame for a good cause. Protecting a large wildlife reserve in Alaska sounds like the perfect opportunity! When Bigfoot mysteriously disappears without a trace, Adam and his animal friends will brave anything to find him again and save the nature reserve.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2021',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie47.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'peter rabbit 1': {
            image: '/images/suggested/04.jpg',
            title: 'Peter Rabbit 1',
            slug: 'Peter-Rabbit_Gaheza',
            rating: 9,
            actor:['Danny Price','Roger May'],
            stars: 5.0,
            genres: ['Animation', 'Kids'],
            interpreter: ['Gaheza'],
            tags: ['Animation', 'Family',],
            description: 'Peter Rabbit feud with Mr. McGregor escalates to greater heights than ever before as they rival for the affections of the warm-hearted animal lover who lives next door.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2013',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie48.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'peter rabbit 2': {
            image: '/images/suggested/05.jpg',
            title: 'Peter Rabbit 2',
            slug: 'Peter-Rabbit-2_Gaheza',
            rating: 9.2,
            actor:['James Corden','Rose Byrne'],
            stars: 4.5,
            genres: ['Family', 'Adventure'],
            interpreter: ['Gaheza'],
            tags: ['Comedy', 'Family',],
            description: 'Peter Rabbit runs away from his human family when he learns they are going to portray him in a bad light in their book. Soon, he crosses paths with an older rabbit who ropes him into a heist.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2021',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie49.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'sing': {
            image: '/images/suggested/07.jpg',
            title: 'Sing',
            slug: 'Sing_P.K',
            rating: 7.0,
            actor:['Matthew McConaughey','Reese Withherspoon'],
            stars: 4.5,
            genres: ['Animation', 'Cartoon'],
            interpreter: ['P.K'],
            tags: ['Cartoon', 'Family',],
            description: 'A koala named Buster recruits his best friend to help him drum up business for his theater by hosting a singing competition.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2016',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie50.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'hotel translyvania 3': {
            image: '/images/suggested/08.jpg',
            title: 'Hotel Translyvania 3',
            slug: 'Hotel-Translyvania-3_P.K',
            rating: 7.8,
            actor:['Adama Sandler','Andy Samberg'],
            stars: 5,
            genres: ['Animation', 'Comedy','Fantasy'],
            interpreter: ['P.K'],
            tags: ['Comedy', 'Family',],
            description: 'Dracula, Mavis, Johnny and the rest of the Drac Pack take a vacation on a luxury Monster Cruise Ship, where Dracula falls in love with the ship’s captain, Ericka, who’s secretly a descendant of Abraham Van Helsing, the notorious monster slayer.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2018',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie51.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'hotel translyvania 2': {
            image: '/images/suggested/09.jpg',
            title: 'Hotel Translyvania 2',
            slug: 'Hotel-Translyvania-2_P.K',
            rating: 8,
            actor:['Adama Sandler','Andy Samberg'],
            stars: 4.5,
            genres: ['Animation', 'Comedy','Fantasy'],
            interpreter: ['P.K'],
            tags: ['Cartoon', 'Family',],
            description: 'When the old-old-old-fashioned vampire Vlad arrives at the hotel for an impromptu family get-together, Hotel Transylvania is in for a collision of supernatural old-school and modern day cool.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2015',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie52.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'ladybug catnoir: the movie ': {
            image: '/images/suggested/10.jpg',
            title: 'Ladybug Catnoir: The Movie ',
            slug: 'Ladybug-Catnoir:The-Movie_Ryan',
            rating: 8.8,
            actor:['','',''],
            stars: 4,
            genres: ['Animation', 'Adventure','Action'],
            interpreter: ['Ryan'],
            tags: ['Animation', 'Kids',],
            description: 'After a guardian of magical jewels turns an awkward girl and a popular boy into superheroes, they can never reveal their identities — even to each other.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie53.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'pussy in boots: the last wish ': {
            image: '/images/suggested/11.jpg',
            title: 'Pussy in Boots: The Last Wish ',
            slug: 'Pussy-in-Boots:The-Last-Wish_P.K',
            rating: 8.0,
            actor:['Antonio Banderas','Salma Hayek Pinault'],
            stars: 5,
            genres: ['Animation', 'Comedy','Adventure'],
            interpreter: ['P.K'],
            tags: ['Fantasy', 'Family',],
            description: 'Puss in Boots discovers that his passion for adventure has taken its toll: He has burned through eight of his nine lives, leaving him with only one life left. Puss sets out on an epic journey to find the mythical Last Wish and restore his nine lives.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie54.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'kpop demon hunters': {
            image: '/images/suggested/12.jpg',
            title: 'Kpop Demon Hunters',
            slug: 'Kpop-Demon-Hunters_Perfect',
            rating: 8.9,
            actor:['Arden Cho','May Hong'],
            stars: 4.5,
            genres: ['Animation', 'Fantasy','Music'],
            interpreter: ['Perfect'],
            tags: ['Comedy', 'Animation',],
            description: 'When K-pop superstars Rumi, Mira and Zoey are not selling out stadiums, they are using their secret powers to protect their fans from supernatural threats.',
            age: 'All Ages',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie55.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'tyler perry duplicity':{
            image: '/images/dylan/01.jpg',
            title: 'Tyler Duplicity',
            slug: 'Tyler-Duplicity_Dylan',
            rating: 9,
            actor:['Kat Graham','Meagan Tandy'],
            stars: 4,
            genres: ['Drama', 'Thriller','Crime'],
            interpreter: ['Dylan'],
            tags: ['Drama', 'Crime',],
            description: 'High-powered attorney Marley faces her most personal case yet when she is tasked with uncovering the truth behind the murder of her best friend Fela’s husband. With the help of her boyfriend – a former cop turned private investigator – Marley’s search for what really happened leads her down a treacherous maze of deception and betrayal.',
            age: '19+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie56.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'the swordsman':{
            image: '/images/dylan/02.jpg',
            title: 'The Swordsman',
            slug: 'The-Swordsman_Dylan',
            rating: 9.6,
            actor:['Jang Hyuk','Kim Hyeon-soo'],
            stars: 4.5,
            genres: ['Drama', 'History','Action'],
            interpreter: ['Dylan'],
            tags: ['Action', 'History',],
            description: 'After being blinded in a coup against the king, Joseons greatest swordsman goes into hiding, far removed from his city anguish. But when traffickers kidnap his daughter, he has no choice but to unsheathe his sword once more.',
            age: '19+',
            duration: 'Filme',
            year: '2020',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie57.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'sonic the hedgehog':{
            image: '/images/dylan/04.jpg',
            title: 'Sonic The Hedgehog',
            slug: 'Sonic-The-Hedgehog_Dylan',
            rating: 7.6,
            actor:['Ben Schwartz','James Mardsden'],
            stars: 4,
            genres: ['Comedy', 'Adventure','Action'],
            interpreter: ['Dylan'],
            tags: ['Action', 'Adventure',],
            description: 'After settling in Green Hills, Sonic is eager to prove he has what it takes to be a true hero. His test comes when Dr. Robotnik returns, this time with a new partner, Knuckles, in search for an emerald that has the power to destroy civilizations. Sonic teams up with his own sidekick, Tails, and together they embark on a globe-trotting journey to find the emerald before it falls into the wrong hands.',
            age: '19+',
            duration: 'Filme',
            year: '2022',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie58.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'king serpent island':{
            image: '/images/dylan/05.jpg',
            title: 'King Serpent Island',
            slug: 'King-Serpent-Island_Dylan',
            rating: 7.8,
            actor:['Liu Lincheng','Shao Yun'],
            stars: 3.5,
            genres: ['Action', 'Horror','Thriller'],
            interpreter: ['Dylan'],
            tags: ['Snakes', 'Adventure'],
            description: 'This story is about Snake Kings descendants teaming up with animal protection experts to fight against a black market snake hunting gang bought by real estate developers on Snake King Island',
            age: '19+',
            duration: 'Filme',
            year: '2021',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie59.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'i am vengeance retaliation':{
            image: '/images/dylan/06.jpg',
            title: 'I Am Vengeance Retaliation',
            slug: 'I-Am-Vengeance-Retaliation_Dylan',
            rating: 8,
            actor:['Stuart Bennett','Vinnie Jones'],
            stars: 4.5,
            genres: ['Action', 'War','Crime'],
            interpreter: ['Dylan'],
            tags: ['Thriller', 'Action',],
            description: 'A former special-forces soldier is given the opportunity to bring the man who betrayed his team on their final mission in Eastern Europe several years ago - to justice.',
            age: '19+',
            duration: 'Filme',
            year: '2020',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie60.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'the covenant':{
            image: '/images/dylan/07.jpg',
            title: 'The Covenant',
            slug: 'The-Covenant_Dylan',
            rating: 8.8,
            actor:['Jake Gyllenhaal','Dar Salim'],
            stars: 4,
            genres: ['Action', 'War','Thriller'],
            interpreter: ['Dylan'],
            tags: ['Crime', 'Afganistan War','History'],
            description: 'During the war in Afghanistan, a local interpreter risks his own life to carry an injured sergeant across miles of grueling terrain.',
            age: '19+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie61.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'game of deceit':{
            image: '/images/dylan/08.jpg',
            title: 'Game of Deciet',
            slug: 'Game-of-Deceit_Dylan',
            rating: 8.2,
            actor:['Denise Boutte','Kevin Savage'],
            stars: 4.5,
            genres: ['Drama', 'Thriller'],
            interpreter: ['Dylan'],
            tags: ['Thriller','Drama'],
            description: 'When her police officer husband starts abusing her, Maya realizes she must gather ironclad evidence to take him down.',
            age: '19+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie62.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'death at funeral':{
            image: '/images/dylan/09.jpg',
            title: 'Death at Funeral',
            slug: 'Death-at-Funeral_Dylan',
            rating: 8.0,
            actor:['Quim Gutierrez','Ernesto Alterio'],
            stars: 4,
            genres: ['Drama','Comedy'],
            interpreter: ['Dylan'],
            tags: ['Thriller','Drama'],
            description: 'The members of a family come to say goodbye to the recently deceased patriarch. But what should have been a heartfelt wake turns into a crazy gathering when one of the attendees reveals the deceased best kept secret.',
            age: '19+',
            duration: 'Filme',
            year: '2010',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie63.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'case depart':{
            image: '/images/dylan/10.jpg',
            title: 'Case Depart',
            slug: 'Case-Depart_Dylan',
            rating: 7.0,
            actor:['Thomas Ngijol','Fabrice Eboue'],
            stars: 3.5,
            genres: ['Comedy'],
            interpreter: ['Dylan'],
            tags: ['Time Travel','Drama'],
            description: 'Two contempo Frenchmen of Antillean descent visit their ancestors time as well as their land in the slavery-themed French era.',
            age: '19+',
            duration: 'Filme',
            year: '2011',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie64.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'blackout':{
            image: '/images/dylan/11.jpg',
            title: 'Blackout',
            slug: 'Blackout_Dylan',
            rating: 7.9,
            actor:['Josh Duhamel','Abbie Cornish'],
            stars: 5,
            genres: ['Action','Adventure','Thriller'],
            interpreter: ['Dylan'],
            tags: ['Adventure','Action'],
            description: 'A man wakes in a hospital with no memory, and quickly finds himself on the run in a locked down hospital with the Cartel on his tail.',
            age: '19+',
            duration: 'Filme',
            year: '2022',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie65.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        'altitude':{
            image: '/images/dylan/12.jpg',
            title: 'Altitude',
            slug: 'Altitude_Dylan',
            rating: 9,
            actor:['Dolph Lundgren','Denise Richards'],
            stars: 5,
            genres: ['Action','Thriller'],
            interpreter: ['Dylan'],
            tags: ['Hijack','Action'],
            description: 'A female FBI agent is offered millions to help a thief escape from a hijacked airplane.',
            age: '19+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie66.mp4',
            downloadLink: 'https://cdn.example.com/download/pga-golf-championship.mp4'
        },
        
        'war 2': {
            image: '/images/tvthrillers/01.jpg',
            title: 'War 2',
            slug: 'War-2_Rocky',
            rating: 8.0,
            actor:['N.T.Rama Rao Jr.','Hrithik Roshan'],
            stars: 4,
            genres: ['Adventure', 'Action', 'Thriller'],
            interpreter: ['Rocky'],
            tags: ['India', 'Thriller', 'Spy'],
            description: 'Years ago Agent Kabir went rogue, became India’s greatest villain ever. As he descends further into the deepest shadows... India sends its deadliest, most lethal agent after him, Agent Vikram A Special Units Officer who is more than Kabir’s equal and a relentless Terminator driven by his own demons, determined to put a bullet into Kabir’s skull.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie68.mp4',
            downloadLink: 'https://cdn.example.com/download/the-martian.mp4'
        },
        'maharshi': {
            image: '/images/parallax/q6.jpg',
            title: 'Maharshi',
            slug: 'Maharshi_Rocky',
            rating: 8.2,
            actor:['Mahesh Babu','Pooja Hegde'],
            stars: 4,
            genres: ['Action', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['India', 'Inspiration', 'Drama'],
            description: 'Rishi Kumar is a billionaire and the CEO of Origins, someone who has always strived for the success he now owns. His friend Ravi needs help, how will he come through?',
            age: '12+',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie69.mp4',
            downloadLink: 'https://cdn.example.com/download/the-martian.mp4'
        },
        'baaghi 4': {
            image: '/images/parallax/q7.jpg',
            title: 'Baaghi 4',
            slug: 'Baaghi-4_Rocky',
            rating: 8.7,
            actor:['Tiger Shroff','Sanjay Dutt'],
            stars: 4.5,
            genres: ['Romance', 'Action', 'Thriller'],
            interpreter: ['Rocky'],
            tags: ['India', 'War', 'Drama'],
            description: 'After waking up from a coma, a grieving man sets out to uncover the truth about his missing girlfriend.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie70.mp4',
            downloadLink: 'https://cdn.example.com/download/the-martian.mp4'
        },
        'jawan': {
            image: '/images/parallax/q9.jpg',
            title: 'Jawan',
            slug: 'Jawan_Rocky',
            rating: 8.8,
            actor:['Shah Rukh Khan','Nayanthara'],
            stars: 5,
            genres: ['Thriller', 'Action'],
            interpreter: ['Rocky'],
            tags: ['Vigilante', 'Thriller', 'Drama'],
            description: 'An emotional journey of a prison warden, driven by a personal vendetta while keeping up to a promise made years ago, recruits inmates to commit outrageous crimes that shed light on corruption and injustice, in an attempt to get even with his past, and that leads him to an unexpected reunion.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie71.mp4',
            downloadLink: 'https://cdn.example.com/download/the-martian.mp4'
        },
        'coming 2 america': {
            image: '/images/top-10/07.jpg',
            title: 'Coming 2 America',
            slug: 'Coming-2-America_Rocky',
            rating: 8.7,
            actor:['Eddie Murphy','Arsenio Hall'],
            stars: 4.5,
            genres: ['Comedy'],
            interpreter: ['Rocky'],
            tags: ['Comedy', 'Drama'],
            description: 'Prince Akeem Joffer is set to become King of Zamunda when he discovers he has a son he never knew about in America – a street savvy Queens native named Lavelle. Honoring his royal father dying wish to groom this son as the crown prince, Akeem and Semmi set off to America once again.',
            age: '12+',
            duration: 'Filme',
            year: '2021',
            videoLink: 'https://miyagifilms.com/Chris%20Grey%20-%20ANOTHER%20LIFE%20(Official%20Lyric%20Video).mp4',
            downloadLink: 'https://miyagifilms.com/Chris%20Grey%20-%20ANOTHER%20LIFE%20(Official%20Lyric%20Video).mp4'
        },
        'heads of state': {
            image: '/images/top-10/08.jpg',
            title: 'Heads of State',
            slug: 'Heads-of-State_Rocky',
            rating: 8.0,
            actor:['John Cena','Idris Elba',],
            stars: 5,
            genres: ['Thriller', 'Action', 'Comedy'],
            interpreter: ['Rocky'],
            tags: ['Crime', 'Action','Betrayal'],
            description: 'The UK Prime Minister and US President have a public rivalry that risks their countries alliance. But when they become targets of a powerful enemy, they are forced to rely on each other as they go on a wild, multinational run. Allied with Noel, a brilliant MI6 agent, they must find a way to thwart a conspiracy that threatens the free world.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie72.mp4',
            downloadLink: 'https://cdn.example.com/download/the-martian.mp4'
        },
        'karate kid legends': {
            image: '/images/top-10/09.jpg',
            title: 'Karate Kid Legends',
            slug: 'Karate-Kid:Legends_Rocky',
            rating: 8.9,
            actor:['Jackie Chan','Ben wang'],
            stars: 5,
            genres: ['Karate', 'Action', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['Jackie Chan ', 'Action','Karate'],
            description: 'After a family tragedy, kung fu prodigy Li Fong is uprooted from his home in Beijing and forced to move to New York City with his mother. When a new friend needs his help, Li enters a karate competition – but his skills alone are not enough. Li kung fu teacher Mr. Han enlists original Karate Kid Daniel LaRusso for help, and Li learns a new way to fight, merging their two styles into one for the ultimate martial arts showdown.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie73.mp4',
            downloadLink: 'https://cdn.example.com/download/the-martian.mp4'
        },
        'most dengerous game': {
            image: '/images/top-10/10.jpg',
            title: 'Most Dengerous Game',
            slug: 'Most-Dengerous-Game_Rocky',
            rating: 9,
            actor:['Christopher Waltz','Liam Hemsworth'],
            stars: 5,
            genres: ['Games', 'Action', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['Games ', 'Action','Mystery'],
            description: 'Desperate to take care of his pregnant wife before a terminal illness can take his life, Dodge Maynard accepts an offer to participate in a deadly game where he soon discovers that he’s not the hunter but the prey.',
            age: '12+',
            duration: 'Filme',
            year: '2020',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie74.mp4',
            downloadLink: 'https://cdn.example.com/download/the-martian.mp4'
        },
        'dont hangup': {
            image: '/images/tvthrillers/02.jpg',
            title: "Don't hang up",
            slug: "Don't-Hang-Up_Sankara",
            rating: 6.1,
            actor:['Claire MacPartland','Brett Curtis'],
            stars: 3,
            genres: ['Horror', 'Thriller'],
            interpreter: ['Sankara'],
            tags: ['Prank', 'Thriller', 'Horror'],
            description: 'Summer travels to Tulsa, Oklahoma, for the wedding of a college friend. Her boyfriend Chris couldn’t make it, but she keeps in contact with him via FaceTime. After the wedding, Summer and her two friends Vicky and Eva head back to the AirBnB they’ve rented for the weekend, unaware that their presence in the house has unleashed the ghosts of a family who were killed there during the Tulsa race massacre in 1921. Now, they’re looking for justice...',
            age: '16+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie75.mp4',
            downloadLink: 'https://cdn.example.com/download/unhinged.mp4'
        },
        'evil dead': {
            image: '/images/sankara/01.jpg',
            title: "Evil Dead",
            slug: 'Evil-Dead-Rise_Sankara',
            rating: 9.1,
            actor:['Lily Sullivan','Alyssa Sutherland'],
            stars: 4.5,
            genres: ['Horror', 'Thriller'],
            interpreter: ['Sankara'],
            tags: ['Prank', 'Thriller', 'Horror'],
            description: 'A reunion between two estranged sisters gets cut short by the rise of flesh-possessing demons, thrusting them into a primal battle for survival as they face the most nightmarish version of family imaginable.',
            age: '16+',
            duration: 'Filme',
            year: '2013',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie76.mp4',
            downloadLink: 'https://cdn.example.com/download/unhinged.mp4'
        },
        'the brink': {
            image: '/images/sankara/02.jpg',
            title: "The Brink",
            slug: 'The-Brink_Sankara',
            rating: 8.1,
            actor:['Max Zhang','Shawn Yue'],
            stars: 4,
            genres: ['Action', 'Crime'],
            interpreter: ['Sankara'],
            tags: ['Crime', 'Action',],
            description: 'Reckless police inspector Sai Gau (Zhang Jin) is on a mission to crack down on criminal Shing (Shawn Yue) gold smuggling scheme, yet fails to arrest him. As Sai Gau continues his manhunt, he discovers Shing involvement with triad boss Blackie (Yasuaki Kurata), who hides on a casino cruise ship on the high seas. Shing has been involved in a power struggle within the smuggling ring, and is forced to kill his adopted father. He also loses his share of gold smuggling to Blackie. To get even, Shing appears on the cruise, while Sai Gau is there to hunt for him.',
            age: '16+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie77.mp4',
            downloadLink: 'https://cdn.example.com/download/unhinged.mp4'
        },
        'avengers infinity war': {
            image: '/images/sankara/03.jpg',
            title: "Avengers Infinity War",
            slug: 'Avenger-Infinity-War_Sankara',
            rating: 8.9,
            actor:['Robert Downey Jr.','Chris Hemsworth'],
            stars: 5,
            genres: ['Action', 'Adventure','Sci-fi'],
            interpreter: ['Sankara'],
            tags: ['Avenger', 'Action','Sci-fi'],
            description: 'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.',
            age: '16+',
            duration: 'Filme',
            year: '2018',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie78.mp4',
            downloadLink: 'https://cdn.example.com/download/unhinged.mp4'
        },
        'lethal seduction': {
            image: '/images/sankara/04.jpg',
            title: ":Lethal Seduction",
            slug: 'Lethal-Seduction_Sankara',
            rating: 7.9,
            actor:['Caleb Ruminer','Amanda Detmer'],
            stars: 4.5,
            genres: ['Drama', 'Sexy',],
            interpreter: ['Sankara'],
            tags: ['Drame', 'Sexy',],
            description: 'High School senior Mark Richards has never minded his overprotective widowed mother, Tanya, and is a good son to her as he prepares to go off to Princeton in the fall. However, when he comes under the sexual spell of the rapacious, manipulative older woman Carissa Barrington, he finds himself in the middle of two strong, unreasonable women--one of whom is insane...',
            age: '16+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie79.mp4',
            downloadLink: 'https://cdn.example.com/download/unhinged.mp4'
        },
        'talk to me': {
            image: '/images/sankara/05.jpg',
            title: "Talk To Me",
            slug: 'Talk-to-Me_Sankara',
            rating: 9,
            actor:['Sophie Wilde','Alexandra Jensen'],            stars: 5,
            genres: ['Drama', 'Horror',],
            interpreter: ['Sankara'],
            tags: ['Drame', 'Horror',],
            description: 'When a group of friends discover how to conjure spirits using an embalmed hand, they become hooked on the new thrill, until one of them goes too far and unleashes terrifying supernatural forces.',
            age: '16+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie80.mp4',
            downloadLink: 'https://cdn.example.com/download/unhinged.mp4'
        },
        'flash point': {
            image: '/images/sankara/06.jpg',
            title: "Flash Point",
            slug: 'Flash-Point_Sankara',
            rating: 9.2,
            actor:['Donnie Yen','Collin Chou'],
            stars: 4,
            genres: ['Action', 'Crime',],
            interpreter: ['Sankara'],
            tags: ['Crime', 'Action',],
            description: 'Detective Sergeant Ma Jun, known for dispensing his own brand of justice during arrests, teams up with an undercover cop, Wilson, to try and bring down three merciless Vietnamese brothers running a smuggling ring in the months before mainland China takeover of Hong Kong. Jun pursues the gang tirelessly, sometimes ignoring police protocols. A showdown is inevitable!',
            age: '16+',
            duration: 'Filme',
            year: '2007',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie81.mp4',
            downloadLink: 'https://cdn.example.com/download/unhinged.mp4'
        },
        'doctor strange': {
            image: '/images/tvthrillers/03.jpg',
            title: 'Doctor Strange',
            slug: 'Doctor-Stranger_Sankara',
            rating: 7.7,
            actor:['Benedict Cumberbatch','Chiwetel Ejiofor'],
            stars: 4,
            genres: ['Fantasy', 'Adventure', 'Action'],
            interpreter: ['Sankara'],
            tags: ['Sci-fi', 'Sorcery', 'Magic'],
            description: 'After his career is destroyed, a brilliant but arrogant surgeon gets a new lease on life when a sorcerer takes him under her wing and trains him to defend the world against evil.',
            age: '16+',
            duration: 'Filme',
            year: '2016',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie82.mp4',
            downloadLink: 'https://example.com/download/kingsman'
        },
        'hidden faces': {
            image: '/images/sankara/07.jpg',
            title: 'Hidden Faces',
            slug: 'Hidden-Faces_Sankara',
            rating: 8.7,
            actor:['Song Seung-heon','Cho Yeo-jeong'],
            stars: 4,
            genres: [ 'Mystery', 'Thriller'],
            interpreter: ['Sankara'],
            tags: ['Crime', 'Action'],
            description: 'Seong-jin, a conductor, and Su-yeon, a cellist, are engaged. Su-yeon disappears, leaving a video. Mi-joo replaces Su-yeon and develops a secret relationship with Seong-jin. They feel watched as their bond deepens.',
            age: '16+',
            duration: 'Filme',
            year: '2024',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie83.mp4',
            downloadLink: 'https://example.com/download/kingsman'
        },
        'safe house': {
            image: '/images/sankara/08.jpg',
            title: 'Safe House',
            slug: 'Safe-House_Sankara',
            rating: 8.0,
            actor:['Lucien Laviscount','Hannah John-Kamen'],
            stars: 4,
            genres: [ 'Thriller', 'Action'],
            interpreter: ['Sankara'],
            tags: ['Crime', 'Action','Spy'],
            description: ' Six federal agents in hiding after LA terror attack grow suspicious of each other as they realize the perpetrator could be among them.',
            age: '16+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie84.mp4',
            downloadLink: 'https://example.com/download/kingsman'
        },
        'jurassic world': {
            image: '/images/tvthrillers/04.jpg',
            title: 'Jurassic world: Rebirth',
            slug: 'Jurassic-World:Rebirth_Gaheza',
            rating: 8.0,
            actor:['Scarlet Hohansson','Mahershal Ali'],
            stars: 4.5,
            genres: ['Action', 'Adventure', 'Sci-fi'],
            interpreter: ['Gaheza'],
            tags: ['Adventure', 'Sci-fi', 'Dinosaurs'],
            description: 'Five years after the events of Jurassic World Dominion, covert operations expert Zora Bennett is contracted to lead a skilled team on a top-secret mission to secure genetic material from the world three most massive dinosaurs. When Zora operation intersects with a civilian family whose boating expedition was capsized, they all find themselves stranded on an island where they come face-to-face with a sinister, shocking discovery that been hidden from the world for decades.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie85.mp4',
            downloadLink: 'https://example.com/download/casino-royale'
        },
        'coma': {
            image: '/images/favorite/g5.jpg',
            title: 'Coma',
            slug: 'Coma_Sankara',
            rating: 8.6,
            actor:['Rinal Mukhametov','Anton Pampushhyy'],
            stars: 4.5,
            genres: ['Action', 'Adventure', 'Sci-fi'],
            interpreter: ['Sankara'],
            tags: ['Adventure', 'Sci-fi',],
            description: 'After an accident, Viktor, an architect, finds himself in a strange new world. He must learn the laws of the land while trying to navigate his way into the real world.',
            age: '12+',
            duration: 'Filme',
            year: '2020',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie86.mp4',
            downloadLink: 'https://example.com/download/casino-royale'
        },
        'wira': {
            image: '/images/favorite/g1.jpg',
            title: 'Wira',
            slug: 'Wira_Sankara',
            rating: 8.9,
            actor:['hairul Azreen','Fify Azmi',],
            stars: 5,
            genres: ['Action', 'Crime'],
            interpreter: ['Sankara'],
            tags: ['Crime', 'Action', ],
            description: 'After a long stint in the army, an ex-lieutenant returns home and enters an underground MMA match to take on a local mobster and protect his family.',
            age: '12+',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie87.mp4',
            downloadLink: 'https://example.com/download/casino-royale'
        },
        'black widow': {
            image: '/images/tvthrillers/05.jpg',
            title: 'Black Widow',
            slug: 'Black-Widow_Sankara',
            rating: 7.1,
            actor:['Scarlett Johansson','Florence Pugh'],
            stars: 4,
            genres: ['Action', 'Adventure', 'Sci-fi',],
            interpreter: ['Sankara'],
            tags: ['Black widow', 'Spy', 'Action'],
            description: 'Natasha Romanoff, also known as Black Widow, confronts the darker parts of her ledger when a dangerous conspiracy with ties to her past arises. Pursued by a force that will stop at nothing to bring her down, Natasha must deal with her history as a spy and the broken relationships left in her wake long before she became an Avenger.',
            age: '12+',
            duration: 'Filme',
            year: '2021',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie88.mp4',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'gifted': {
            image: '/images/savimbi/01.jpg',
            title: 'Gifted',
            slug: 'Gifted_Savimbi',
            rating: 7.8,
            actor:['Chris Evans','McKenna Grace'],
            stars: 4,
            genres: ['Drama', 'Thriller'],
            interpreter: ['Savimbi'],
            tags: ['Chris Evans', 'Drama'],
            description: 'Frank, a single man raising his genius niece, Mary, gets into a legal battle with his mother, Evelyn, over her custody. However, Evelyn will do anything to make Mary complete her mother project.',
            age: '12+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie89.mp4',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'damsel': {
            image: '/images/savimbi/02.jpg',
            title: 'Damsel',
            slug: 'Damsel_Savimbi',
            rating: 8,
            actor:['Millie Bobby Brown','Brooke Carter'],
            stars: 4,
            genres: ['Adventure', 'Action'],
            interpreter: ['Savimbi'],
            tags: ['Adventure', 'Action'],
            description: 'A dutiful damsel agrees to marry a handsome prince, only to find the royal family has recruited her as a sacrifice to repay an ancient debt.',
            age: '12+',
            duration: 'Filme',
            year: '2024',
            videoLink: 'https://pub-f409b420cc7b42708cfde0abe8655efd.r2.dev/movie90.mp4',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the boy who harnessed the wind': {
            image: '/images/savimbi/03.jpg',
            title: 'The boy who harnessed the wind',
            slug: 'The-Boy-Who-Harnesses-The-Wind_Savimbi',
            rating: 8.9,
            actor:['Maxwell Simba','Chiwetel Ejiofor'],
            stars: 4.5,
            genres: ['Drama', 'Biography','Thriller'],
            interpreter: ['Savimbi'],
            tags: ['Drama', 'Biography','Thriller'],
            description: 'Against all the odds, a thirteen-year-old boy in Malawi invents an unconventional way to save his family and village from famine.',
            age: '12+',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'ashfall': {
            image: '/images/savimbi/04.jpg',
            title: 'Ashfall',
            slug: 'Ashfall_Savimbi',
            rating: 9,
            actor:['Lee Byung-hun','Ha Jung-Woo'],
            stars: 5,
            genres: ['Action', 'Fantasy','Crime'],
            interpreter: ['Savimbi'],
            tags: ['Action', 'Fantasy','Crime'],
            description: 'Ashfall, also known as: Mount Paektu, is a 2019 South Korean disaster film directed by Lee Hae-jun and Kim Byung-seo, starring Lee Byung-hun, Ha Jung-woo, Ma Dong-seok, Jeon Hye-jin and Bae Suzy. The film was released in December 2019 in South Korea.',
            age: '12+',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'kingdom of the planet of apes': {
            image: '/images/savimbi/05.jpg',
            title: 'Kingdom of The Planet of Apes',
            slug: 'Kingdom-of-The-Planet-of-Apes_Savimbi',
            rating: 8.7,
            actor:['Owen Teague','Kevin Durant'],
            stars: 4.5,
            genres: ['Action', 'Fantasy','Adventure'],
            interpreter: ['Savimbi'],
            tags: ['Action', 'Fantasy','Adventure'],
            description: 'Many years after the reign of Caesar, a young ape goes on a journey that will lead him to question everything he been taught about the past and make choices that will define a future for apes and humans alike.',
            age: '12+',
            duration: 'Filme',
            year: '2024',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'ghost': {
            image: '/images/savimbi/06.jpg',
            title: 'Ghost',
            slug: 'Ghost_Savimbi',
            rating: 8.9,
            actor:['Demi Moore','Whoopi Goldberg'],
            stars: 5,
            genres: ['Drama','Thriller'],
            interpreter: ['Savimbi'],
            tags: ['Drama', 'Thriller'],
            description: 'Sam and Molly love each other, but their romance is short-lived when Sam is killed by a thug. Unable to tell Molly that her life is in danger, Sam spirit takes a psychics help in order to save her.',
            age: '12+',
            duration: 'Filme',
            year: '1990',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        '24 hours to live': {
            image: '/images/savimbi/07.jpg',
            title: '24 Hours to Live',
            slug: '24-Hours-to-Live_Savimbi',
            rating: 9,
            actor:['Ethan Hawke','Xu Qing'],
            stars: 5,
            genres: ['Action','Crime'],
            interpreter: ['Savimbi'],
            tags: ['Action', 'Crime'],
            description: 'An assassin seeks redemption after being given a second chance at life.',
            age: '12+',
            duration: 'Filme',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'trash': {
            image: '/images/savimbi/08.jpg',
            title: 'Trash',
            slug: 'Trash_Savimbi',
            rating: 9.8,
            actor:['Rickson Tevez','Eduardo Luis'],
            stars: 4.5,
            genres: ['Drama','Thriller','Crime'],
            interpreter: ['Savimbi'],
            tags: ['Drama', 'Crime','Thriller'],
            description: 'The lives of Rafael and Gardo, two young waste pickers, are about to change when they find',
            age: '12+',
            duration: 'Filme',
            year: '2014',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'dracula untold': {
            image: '/images/savimbi/09.jpg',
            title: 'Dracula Untold',
            slug: 'Dracula-Untold_Savimbi',
            rating: 9.2,
            actor:['Luke Evans','Sarah Gadon'],
            stars: 4.5,
            genres: ['Fantasy','Action','Horror'],
            interpreter: ['Savimbi'],
            tags: ['Adventure', 'Action','Drama'],
            description: 'As his kingdom is being threatened by the Turks, young prince Vlad Tepes must become a monster feared by his own people in order to obtain the power needed to protect his own family, and the families of his kingdom.',
            age: '12+',
            duration: 'Filme',
            year: '2014',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'emperor': {
            image: '/images/savimbi/10.jpg',
            title: 'Emperor',
            slug: 'Emperor_Savimbi',
            rating: 8.2,
            actor:['Dayo Okeniyi','Bruce Dern'],
            stars: 4,
            genres: ['History','War','Drama'],
            interpreter: ['Savimbi'],
            tags: ['Action','Drama'],
            description: 'Fighting his way north to free himself and his family, outlaw slave Shields "Emperor" Green joins forces with abolitionist John Brown for a daring raid in Harpers Ferry, W.Va., in 1859.',
            age: '12+',
            duration: 'Filme',
            year: '2020',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'kings daughter': {
            image: '/images/savimbi/11.jpg',
            title: 'Kings Daughter',
            slug: "King's-Daughter",
            rating: 9.2,
            actor:['Pierce Brosnan','Kaya Scodelario'],
            stars: 4,
            genres: ['Fantasy','Drama','Adventure'],
            interpreter: ['Savimbi'],
            tags: ['Fantasy', 'Adventure','Drama'],
            description: 'Hoping to achieve immortality, King Louis XIV (Pierce Brosnan) captures a mermaid and steals her life force, but a discovery by his illegitimate daughter threatens to ruin the kings plans.',
            age: '12+',
            duration: 'Filme',
            year: '2022',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'limitless': {
            image: '/images/savimbi/12.jpg',
            title: 'Limitless',
            slug: 'Limitless_Savimbi',
            rating: 9.7,
            actor:['Bradley Cooper','Robert De Niro'],
            stars: 5,
            genres: ['Thriller','Mystery','Sci-fi'],
            interpreter: ['Savimbi'],
            tags: ['Sci-fi','Thriller'],
            description: 'Eddie, an aspiring writer, tries a new drug that allows him to make the most of his cognitive abilities. A business tycoon, along with a few assassins, takes notice of his genius and trouble follows.',
            age: '12+',
            duration: 'Filme',
            year: '2011',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'no one lives': {
            image: '/images/tvthrillers/06.jpg',
            title: 'No One Lives ',
            slug: 'No-One-Live_Sankara',
            rating: 7.8,
            actor:['Luke Evans','Adelaide Clemens'],
            stars: 4.5,
            genres: ['Action', 'Horror', 'Mystery',],
            interpreter: ['Sankara'],
            tags: ['Torture', 'Horror', 'Action'],
            description: 'A gang of ruthless highway killers kidnap a wealthy couple traveling cross country only to shockingly discover that things are not what they seem.',
            age: '12+',
            duration: 'Filme',
            year: '2013',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'thor 1': {
            image: '/images/tvthrillers/07.jpg',
            title: 'Thor 1 ',
            slug: 'Thor-1_Siniya',
            rating: 8,
            actor:['Chris Hemsworth','Natalie Portman'],
            stars: 5,
            genres: ['Action', 'Fantasy', 'Adventure',],
            interpreter: ['Siniya'],
            tags: ['Sci-fi', 'Action'],
            description: 'Thor is exiled by his father, Odin, the King of Asgard, to the Earth to live among mortals. When he lands on Earth, his trusted weapon Mjolnir is discovered and captured by S.H.I.E.L.D.',
            age: '12+',
            duration: 'Filme',
            year: '2011',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'last man down': {
            image: '/images/tvthrillers/08.jpg',
            title: 'Last Man Down ',
            slug: 'Last-Man-Down_Gaheza',
            rating: 8.5,
            actor:['Daniel Stisen','Olga Kent'],
            stars: 5,
            genres: ['Action', 'Thriller','Mystery'],
            interpreter: ['Gaheza'],
            tags: ['Mystery', 'Action'],
            description: 'As a deadly pandemic decimates the planet, a former special-forces soldier must protect a wounded woman from a crazed commander who killed his wife years earlier.',
            age: '12+',
            duration: 'Filme',
            year: '2021',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the diplomat': {
            image: '/images/tvthrillers/09.jpg',
            title: 'The Diplamat',
            slug: 'The-Diplomat_Siniya',
            rating: 8.8,
            actor:['John Abraham','Sadia Khateeb'],
            stars: 3.5,
            genres: ['Thriller','Drama'],
            interpreter: ['Siniya'],
            tags: ['Thriller', 'Drama'],
            description: 'An Indian diplomat who tries to repatriate an Indian girl from Pakistan, where she was presumably forced and deceived into marrying against her will.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'sister death': {
            image: '/images/tvthrillers/10.jpg',
            title: 'Sister Death',
            slug: 'Sister-Death_Sankara',
            rating: 7.8,
            actor:['Aria Bedmar','Maru Valdivielso'],
            stars: 4.5,
            genres: ['Horror','Mystery'],
            interpreter: ['Sankara'],
            tags: ['Horror', 'Nun'],
            description: 'A novice with supernatural powers arrives at a former convent, now a school for girls. The strange events and disturbing situations that torment her will lead her to unravel the skein of secrets that surround the convent and haunt its inhabitants.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shangi-chi: legend of ten rings': {
            image: '/images/tvthrillers/11.jpg',
            title: 'Shang-chi: Legend of Ten Rings',
            slug: 'Shang-Chi_Rocky',
            rating: 8,
            actor:['Simu Liu','Tony Leung Chiu-wai'],
            stars: 5,
            genres: ['Fantasy','Action', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Adventure', 'Action'],
            description: 'Martial-arts master Shang-Chi confronts the past he thought he left behind when he drawn into the web of the mysterious Ten Rings organization..',
            age: '12+',
            duration: 'Filme',
            year: '2021',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'secret superstar': {
            image: '/images/tvthrillers/12.jpg',
            title: 'Secret Superstar',
            slug: 'Secret-Superstar_Rocky',
            rating: 9,
            actor:['Zaira Wasim','Aamir Khan'],
            stars: 5,
            genres: ['Drama','Music',],
            interpreter: ['Rocky'],
            tags: ['Drama', 'Songs'],
            description: 'Insia, an ambitious young girl, dreams of becoming a singer but faces opposition from her father. Undeterred, she strives to follow her passion by anonymously posting her songs on the Internet.',
            age: '12+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'men of honor': {
            image: '/images/top-10/11.jpg',
            title: 'Men of Honor',
            slug: 'Men-of-Honor_Rocky',
            rating: 7.9,
            actor:['Robert De Niro','Cuba Gooding Jr.'],
            stars: 4.5,
            genres: ['History', 'Drama', 'War',],
            interpreter: ['Rocky'],
            tags: ['True Story', 'War', 'Honor'],
            description: 'Carl Brashear is an ambitious sharecropper who joins the U.S. Navy to become the world first black master diver. But as he works through diving training, the racist Master Chief sets out to make Carls journey as difficult as possible.',
            age: '12+',
            duration: 'Filme',
            year: '2000',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'nobody': {
            image: '/images/top-10/12.jpg',
            title: 'Nobody',
            slug: 'Nobody_Rocky',
            rating: 9,
            actor:['Bob Odenkirk','Aleksey',],
            stars: 5,
            genres: ['Thriller','Action',],
            interpreter: ['Rocky'],
            tags: ['Action','Crime'],
            description: 'Hutch Mansell finds his life changed when a few thieves break into his house. While trying to punish the thieves, he ends up earning the wrath of a crime lord, Yulian, after he attacks his brother.',
            age: '12+',
            duration: 'Filme',
            year: '2021',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'nobody 2': {
            image: '/images/top-10/13.jpg',
            title: 'Nobody 2',
            slug: 'Nobody-2_Rocky',
            rating: 9.2,
            actor:['Bob Odenkirk','Aleksey',],
            stars: 5,
            genres: ['War', 'Crime', 'Action',],
            interpreter: ['Rocky'],
            tags: ['Action', 'Spy', 'Crime'],
            description: 'Suburban dad Hutch Mansell, a former lethal assassin, is pulled back into his violent past after thwarting a home invasion, setting off a chain of events that unravels secrets about his wife Becca past and his own..',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'anna': {
            image: '/images/tvthrillers/13.jpg',
            title: 'Anna',
            slug: 'Anna_Sankara',
            rating: 8.2,
            actor:['Sasha Luss','Luke Evans'],
            stars: 4.5,
            genres: ['Adventure', 'Thriller', 'Action',],
            interpreter: ['Sankara'],
            tags: ['Action', 'Spy', 'Crime'],
            description: 'Anna Poliatova is a Russian beauty who works for the KGB while constantly looking for a way out. She soon seizes an opportunity when the CIA ask her to become a double agent.',
            age: '12+',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'lucy': {
            image: '/images/tvthrillers/14.jpg',
            title: 'Lucy',
            slug: 'Lucy_Sankara',
            rating: 8.8,
            actor:['Scarlett Johnsson','Morgan Freeman'],
            stars: 5,
            genres: ['Adventure', 'Sci-fi', 'Action',],
            interpreter: ['Sankara'],
            tags: ['Action', 'Sci-fi', 'Crime'],
            description: 'It was supposed to be a simple job. All Lucy had to do was deliver a mysterious briefcase to Mr. Jang.',
            age: '12+',
            duration: 'Filme',
            year: '2014',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'brick': {
            image: '/images/tvthrillers/15.jpg',
            title: 'Brick',
            slug: 'Brick_Sankara',
            rating: 8.9,
            actor:['Matthias Schweighofer','Ruby O. Fee'],
            stars: 4.5,
            genres: ['Thriller', 'Sci-fi',],
            interpreter: ['Sankara'],
            tags: ['Action', 'Sci-fi',],
            description: 'A couple whose apartment building is suddenly surrounded by a mysterious brick wall must work with their neighbors to find a way out.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'a-x-l': {
            image: '/images/tvthrillers/16.jpg',
            title: 'A-X-L',
            slug: 'A-X-L_Sankara',
            actor:['Alex Neustaedter','Becky G'],
            rating: 9,
            stars: 4.5,
            genres: ['Sci-fi', 'Action',],
            interpreter: ['Sankara'],
            tags: ['Bike Riders', 'Robot','Race'],
            description: 'A.X.L. is a top-secret, robotic dog who develops a special friendship with Miles and will go to any length to protect his new companion.',
            age: '12+',
            duration: 'Filme',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'our last mens in phillipines': {
            image: '/images/top-10/14.jpg',
            title: 'Our Last Mens in Phillipines',
            slug: 'Our-Last-Man-in-Phillipines_Rocky',
            rating: 9.2,
            actor:['Luis Tosar','Javier Gutierrez'],
            stars: 5,
            genres: ['War', 'Dram', 'History',],
            interpreter: ['Rocky'],
            tags: ['History', 'Spain'],
            description: 'In 1898, Spain sends a military squad to the town of Baler, the Philippines, to protect one of the last colonies of the Spanish Empire, to prevent rebellious natives from recovering their ancient territories.',
            age: '12+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the equalizer': {
            image: '/images/latest/01.jpg',
            title: 'The Equalizer',
            slug: 'The-Equalizer_Rocky',
            rating: 9.0,
            actor:['Denzel Washington','Marton csokas'],
            stars: 5,
            genres: ['Crime', 'Action',],
            interpreter: ['Rocky'],
            tags: ['Action', 'Thriller', 'Crime'],
            description: 'With his violent past behind him, McCall decides to lead a quiet life. However, when he sees a young girl, Teri, being controlled by violent gangsters, he once again takes up the fight for justice.',
            age: '12+',
            duration: 'Filme',
            year: '2014',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the equalizer 3': {
            image: '/images/latest/03.jpg',
            title: 'The Equalizer 3',
            slug: 'The-Equalizer-3_Rocky',
            rating: 9.0,
            actor:['Denzel Washington','dakot Fanning'],
            stars: 5,
            genres: ['Crime', 'Action','Thriller'],
            interpreter: ['Rocky'],
            tags: ['Action','Crime'],
            description: 'Since giving up his life as a government assassin, Robert McCall finds solace in serving justice on behalf of the oppressed. Now living in Southern Italy, he soon discovers his new friends are under the control of local crime bosses. As events turn deadly, McCall becomes their protector by taking on the mafia.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'road house': {
            image: '/images/latest/05.jpg',
            title: 'Road House',
            slug: 'Road-House_Rocky',
            rating: 8.0,
            actor:['Jake Gyllenhaal','Billy Magnussen'],
            stars: 4.5,
            genres: ['Thriller','Action',],
            interpreter: ['Rocky'],
            tags: ['Action', 'Boxing', 'Crime'],
            description: 'Ex-UFC fighter Dalton takes a job as a bouncer at a Florida Keys roadhouse, only to discover that this paradise is not all it seems.',
            age: '12+',
            duration: 'Filme',
            year: '2024',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'little man': {
            image: '/images/latest/04.jpg',
            title: 'Little Man',
            slug: 'Little-Man_Yanga',
            rating: 8.9,
            actor:['Marlon Wayans','Shawn Wayans'],
            stars: 5,
            genres: ['Comedy', 'Crime',],
            interpreter: ['Yanga'],
            tags: ['Drama', 'Crime'],
            description: 'After leaving the prison, the dwarf criminal Calvin Sims joins to his moron brother Percy to steal an expensive huge diamond in a jewelry for the mobster Walken. They are chased by the police, and Calvin hides the stone in the purse of the executive Vanessa Edwards, whose husband Darryl Edwards wants to have a baby. Percy convinces Calvin to dress like a baby and be left in front of the Edwards house to get inside the house and retrieve the diamond. Darryl and Vanessa keep Calvin for the weekend and decide to adopt him, while Walken threatens Darryl to get the stone back.',
            age: '12+',
            duration: 'Filme',
            year: '2006',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'baby day out': {
            image: '/images/latest/04.jpg',
            title: 'Baby Day Out',
            slug: 'Baby-Day-Out_Yanga',
            rating: 6.9,
            actor:['Joe Mantegna','Lara Flynn Boyle'],
            stars: 3,
            genres: ['Comedy','Adventure', 'Crime',],
            interpreter: ['Yanga'],
            tags: ['Drama', 'Family','Thriller'],
            description: 'After three kidnappers lose the baby they have kidnapped, both the cops and kidnappers go looking for the baby.',
            age: '12+',
            duration: 'Filme',
            year: '1994',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'gods must be crazy': {
            image: '/images/latest/06.jpg',
            title: 'Gods Must Be Crazy',
            slug: 'Gods-Must-Be-Crazy_Yanga',
            rating: 6.9,
            actor:['Marius Weyers','Sandra Prinsloo'],            stars: 3.5,
            genres: ['Action', 'Comedy',],
            interpreter: ['Yanga'],
            tags: ['Drama','Thriller'],
            description: 'A Coca-Cola bottle dropped from an airplane raises havoc among a normally peaceful tribe of African bushmen who believe it to be a utensil of the gods.',
            age: '12+',
            duration: 'Filme',
            year: '1980',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'godzilla x kong': {
            image: '/images/latest/08.jpg',
            title: 'Godzilla x Kong',
            slug: 'Godzilla-x-Kong_Siniya',
            rating: 8.9,
            actor:['Rebecca Hall','Brian Tyree Henry'],
            stars: 5,
            genres: ['Adventure','Sci-fi', 'Action'],
            interpreter: ['Siniya'],
            tags: ['Fantasy','Adventure'],
            description: 'Godzilla and the almighty Kong face a colossal threat hidden deep within the planet, challenging their very existence and the survival of the human race.',
            age: '12+',
            duration: 'Filme',
            year: '2024',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'godzilla: king of monsters': {
            image: '/images/pk/01.jpg',
            title: 'Godzilla: King of Monsters',
            slug: 'Godzilla:King-of-Monsters_Siniya',
            rating: 9.8,
            actor:['Millie Bobby Brown','Vera Farminga'],
            stars: 5,
            genres: ['Adventure','Sci-fi', 'Fantasy'],
            interpreter: ['Siniya'],
            tags: ['Fantasy','Adventure'],
            description: 'A legendary monster named King Ghidorah awakens Rodan, as well as other titans, to destroy the world. To defeat them, the crypto-zoological organisation Monarch must rely on the almighty Godzilla.',
            age: '12+',
            duration: 'Filme',
            year: '2019',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        '97 minutes': {
            image: '/images/dylan/13.jpg',
            title: '97 Minutes',
            slug: '97-Minutes_Dylan',
            rating: 8,
            actor:['Jonathan Rhys Meyers','Alec Baldwin'],
            stars: 5,
            genres: ['Action','Thriller', 'Fantasy'],
            interpreter: ['Dylan'],
            tags: ['Fantasy','Action'],
            description: 'A hijacked 767 will crash in just 97 minutes when its fuel runs out. Against the strong will of NSA Deputy Toyin, NSA Director Hawkins prepares to have the plane shot down before it does any catastrophic damage on the ground, leaving the fate of the innocent passengers in the hands of Alex, an undercover Interpol agent who has been embedded in the terrorist cell.',
            age: '12+',
            duration: 'Filme',
            year: '2023',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'falcon rising': {
            image: '/images/pk/02.jpg',
            title: 'Falcon Rising',
            slug: 'Falcon-Rising_P.K',
            rating: 8,
            actor:['Micheal Jai White','Neal McDonough'],
            stars: 4.5,
            genres: ['Action','War', 'Adventure'],
            interpreter: ['P.K'],
            tags: ['Action','Thriller'],
            description: 'Chapman is an ex-marine in Brazil slums, battling the yakuza outfit who attacked his sister and left her for dead.',
            age: '12+',
            duration: 'Filme',
            year: '2014',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'batman vs superman: dawn of justice': {
            image: '/images/pk/03.jpg',
            title: 'Batman vs Superman: Dawn of Justice',
            slug: 'Batman-vs-Superman_P.K',
            rating: 9,
            actor:['Henry Cavill','Ben Affleck'],
            stars: 5,
            genres: ['Action','Adventure', 'Sci-fi'],
            interpreter: ['P.K'],
            tags: ['Sci-fi','Superhero'],
            description: 'Bruce Wayne, a billionaire, believes that Superman is a threat to humanity after his battle in Metropolis. Thus, he decides to adopt his mantle of Batman and defeat him once and for all.',
            age: '12+',
            duration: 'Filme',
            year: '2016',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the dark tower': {
            image: '/images/pk/04.jpg',
            title: 'The Dark Tower',
            slug: 'The-Dark-Tower_P.K',
            rating: 8,
            actor:['Idris Elba','Mattew McConaughey'],
            stars: 5,
            genres: ['Action','Adventure', 'Fantasy'],
            interpreter: ['P.K'],
            tags: ['Adventure','Fantasy'],
            description: 'A boy haunted by visions of a dark tower from a parallel reality teams up with the tower disillusioned guardian to stop an evil warlock known as the Man in Black who plans to use the boy to destroy the tower and open the gates of Hell.',
            age: '12+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'act of vengeance': {
            image: '/images/pk/05.jpg',
            title: 'Act of Vengeance',
            slug: 'Act-of-Vengeance_P.K',
            rating: 8.7,
            actor:['Antonio Banderas','Karl Urban'],
            stars: 5,
            genres: ['Action','Crime', 'War'],
            interpreter: ['P.K'],
            tags: ['Crime','Action'],
            description: 'Frank Valera, a lawyer, trains to fight and takes a vow of silence until the time he finds out who was behind the murder of his family so he can avenge their deaths.',
            age: '12+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'fifty shades of grey': {
            image: '/images/pk/06.jpg',
            title: 'Fifty Shades of Grey',
            slug: 'Fifty-Shades-of-Grey_P.K',
            rating: 8.1,
            actor:['Dakota johnson','Jamie Dornan'],
            stars: 4,
            genres: ['Drama','Sex', 'Romantic'],
            interpreter: ['P.K'],
            tags: ['Romance','Sexy'],
            description: 'Literature student Anastasia Steele life changes forever when she meets handsome, yet tormented, billionaire Christian Grey.',
            age: '12+',
            duration: 'Filme',
            year: '2015',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the last airbender': {
            image: '/images/pk/07.jpg',
            title: 'The Last Airbender',
            slug: 'The-Last-Airbender_P.K',
            rating: 7.1,
            actor:['Gordon Cormier','Kiaweniio'],
            stars: 4.5,
            genres: ['Adventure','Action', 'Fantasy'],
            interpreter: ['P.K'],
            tags: ['Action','Adventure'],
            description: 'Aang, a young successor to a long line of Avatars, must master all four elements and stop the Fire Nation from enslaving the Water Tribes and the Earth Kingdom.',
            age: '12+',
            duration: 'Filme',
            year: '2010',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the maze runner': {
            image: '/images/pk/09.jpg',
            title: 'The Maze Runner',
            slug: 'The-Maze-Runner_P.K',
            rating: 7.9,
            actor:['Dylan OBrien','Kaya Scodelario'],
            stars: 5,
            genres: ['Adventure','Action', 'Fantasy'],
            interpreter: ['P.K'],
            tags: ['Action','Adventure'],
            description: 'Thomas is deposited in a community of boys after his memory is erased, soon learning they are all trapped in a maze that will require him to join forces with fellow "runners" for a shot at escape.',
            age: '12+',
            duration: 'Filme',
            year: '2014',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'aquaman': {
            image: '/images/pk/10.jpg',
            title: 'Aquaman',
            slug: 'Aquaman_P.K',
            actor:['Jason Momoa','Amber Heard',],
            rating: 9,
            stars: 4.5,
            genres: ['Adventure','Action', 'Sci-fi'],
            interpreter: ['P.K'],
            tags: ['Action','Adventure','Sci-fi'],
            description: 'Half-human, half-Atlantean Arthur Curry must take his rightful place as the king of Atlantis and prevent a large-scale conflict from breaking out between the underwater kingdom and the surface world.',
            age: '12+',
            duration: 'Filme',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the old guard 2': {
            image: '/images/favorite/g2.jpg',
            title: 'The Old Guard 2',
            slug: 'The-Old-Guard-2_Rocky',
            rating: 9.2,
            actor:['Charlie Theron','Kiki Layne'],
            stars: 4.5,
            genres: ['Adventure','Action', 'Sci-fi'],
            interpreter: ['Rocky'],
            tags: ['Action','Adventure','Sci-fi'],
            description: 'Andy leads immortal warriors against a powerful enemy threatening their group. They grapple with the resurfacing of a long-lost immortal, complicating their mission to safeguard humanity.',
            age: '12+',
            duration: 'Filme',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'wonder woman': {
            image: '/images/pk/11.jpg',
            title: 'Wonder Woman',
            slug: 'Wonder-Man_P.K',
            rating: 9.4,
            actor:['Gal Gadot','Chris Pine'],
            stars: 4.5,
            genres: ['Adventure','Action', 'Sci-fi'],
            interpreter: ['P.K'],
            tags: ['Action','Adventure','Sci-fi'],
            description: 'Princess Diana of an all-female Amazonian race rescues US pilot Steve. Upon learning of a war, she ventures into the world of men to stop Ares, the god of war, from destroying mankind.',
            age: '12+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the bfg': {
            image: '/images/pk/12.jpg',
            title: 'The BFG',
            slug: 'The-BFG_P.K',
            rating: 9.2,
            actor:['Mark Rylance','Ruby Barnhill'],
            stars: 4,
            genres: ['Adventure','Fantasy', 'Family'],
            interpreter: ['P.K'],
            tags: ['Adventure','Sci-fi'],
            description: 'A young girl, Sophie, befriends a giant, who is an outcast because, unlike others of his kind, he refuses to hurt humans. However, things change after the other giants decide to hunt down Sophie.',
            age: '12+',
            duration: 'Filme',
            year: '2016',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'operation dumbo drop': {
            image: '/images/favorite/g3.jpg',
            title: 'Operation Dumbo Drop',
            slug: 'Operation-Dumbo-Drop_Rocky',
            rating: 7.2,
            actor:['Danny Glover','RAy Liotta'],
            stars: 4,
            genres: ['Family', 'Action','Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action','War'],
            description: 'To keep the loyalty of a village during the Vietnam war, a U.S. Army officer and his unit struggle to deliver it a live elephant.',
            age: '12+',
            duration: 'Filme',
            year: '1995',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'chips': {
            image: '/images/favorite/g4.jpg',
            title: 'Chips',
            slug: 'Chips_Rocky',
            rating: 8.2,
            actor:['Micheal Pena','Dax Shepard'],
            stars: 4,
            genres: ['Comedy', 'Action','Drama'],
            interpreter: ['Rocky'],
            tags: ['Action','Drama'],
            description: 'An inexperienced rookie is teamed up with a hardened pro at the California Highway Patrol in Los Angeles; the newbie officer soon learns his partner is really an undercover Fed investigating a heist which may involve some crooked cops.',
            age: '12+',
            duration: 'Filme',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'Pirates of the caribbean': {
            image: '/images/pk/08.jpg',
            title: 'Pirates of The Carrribean',
            slug: 'Pirates-of-the-Caribean_P.K',
            rating: 9.0,
            actor:['Johnny Depp','Geoffrey Rush'],
            stars: 4.5,
            genres: ['Adventure','Fantasy', 'Sci-fi'],
            interpreter: ['P.K'],
            tags: ['Adventure','Sci-fi'],
            description: 'Blacksmith Will Turner teams up with eccentric pirate "Captain" Jack Sparrow to save Elizabeth Swann, the governor daughter and his love, from Jack former pirate allies, who are now undead.',
            age: '12+',
            duration: 'Filme',
            year: '2003',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep1': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 1',
            slug: "Bon-Appetit-Your-Majesty-Ep-1_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep2': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 2',
            slug: "Bon-Appetit-Your-Majesty-Ep-2_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep3': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 3',
            slug: "Bon-Appetit-Your-Majesty-Ep-3_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep4': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 4',
            slug: "Bon-Appetit-Your-Majesty-Ep-5_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep5': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 5',
            slug: "Bon-Appetit-Your-Majesty-Ep-5_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep6': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 6',
            slug: "Bon-Appetit-Your-Majesty-Ep-6_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep7': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 7',
            slug: "Bon-Appetit-Your-Majesty-Ep-7_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep8': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 8',
            slug: "Bon-Appetit-Your-Majesty-Ep-8_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep9': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 9',
            slug: "Bon-Appetit-Your-Majesty-Ep-9_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep10': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 10',
            slug: "Bon-Appetit-Your-Majesty-Ep-10_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bon appetit ep11': {
            image: '/images/episodes/bbt1.jpg',
            title: 'Bon Appetit Your Majesty Ep 11',
            slug: "Bon-Appetit-Your-Majesty-Ep-11_Rocky",
            rating: 7.1,
            actor:['Lee Chea-min','Kang Hanna'],
            stars: 4.5,
            genres: ['Drama', 'Sci-fi', 'Fantasy',],
            interpreter: ['Rocky'],
            tags: ['korea', 'Joseon', 'Drama'],
            description: 'After time traveling to the Joseon era, a talented chef meets a tyrant king. Her modern dishes captivate his palate, but royal challenges await her.',
            age: '12+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'messiah ep1': {
            image: '/images/episodes/pb1.jpg',
            title: 'Messiah Ep 1',
            slug: "Messiah-Ep-1_Rocky",
            rating: 7.6,
            actor:['Mehdi Dehbi','Michelle Monaghan',],
            stars: 4.5,
            genres: ['Drama'],
            interpreter: ['Rocky'],
            tags: ['Messiah', 'CIA','Drama'],
            description: 'A wary CIA officer investigates a charismatic man who sparks a spiritual movement and stirs political unrest. Who exactly is he? And what does he want?',
            age: '12+',
            duration: 'Episode',
            year: '2020',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'messiah ep2': {
            image: '/images/episodes/pb1.jpg',
            title: 'Messiah Ep 2',
            slug: "Messiah-Ep-2_Rocky",
            rating: 7.6,
            actor:['Mehdi Dehbi','Michelle Monaghan'],
            stars: 4.5,
            genres: ['Drama'],
            interpreter: ['Rocky'],
            tags: ['Messiah', 'CIA','Drama'],
            description: 'A wary CIA officer investigates a charismatic man who sparks a spiritual movement and stirs political unrest. Who exactly is he? And what does he want?',
            age: '12+',
            duration: 'Episode',
            year: '2020',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'messiah ep3': {
            image: '/images/episodes/pb1.jpg',
            title: 'Messiah Ep 3',
            slug: "Messiah-Ep-3_Rocky",
            rating: 7.6,
            actor:['Mehdi Dehbi','Michelle Monaghan'],
            stars: 4.5,
            genres: ['Drama'],
            interpreter: ['Rocky'],
            tags: ['Messiah', 'CIA','Drama'],
            description: 'A wary CIA officer investigates a charismatic man who sparks a spiritual movement and stirs political unrest. Who exactly is he? And what does he want?',
            age: '12+',
            duration: 'Episode',
            year: '2020',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'messiah ep4': {
            image: '/images/episodes/pb1.jpg',
            title: 'Messiah Ep 4',
            slug: "Messiah-Ep-4_Rocky",
            rating: 7.6,
            actor:['Mehdi Dehbi','Michelle Monaghan'],
            stars: 4.5,
            genres: ['Drama'],
            interpreter: ['Rocky'],
            tags: ['Messiah', 'CIA','Drama'],
            description: 'A wary CIA officer investigates a charismatic man who sparks a spiritual movement and stirs political unrest. Who exactly is he? And what does he want?',
            age: '12+',
            duration: 'Episode',
            year: '2020',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'messiah ep5': {
            image: '/images/episodes/pb1.jpg',
            title: 'Messiah Ep 5',
            slug: "Messiah-Ep-5_Rocky",
            rating: 7.6,
            actor:['Mehdi Dehbi','Michelle Monaghan'],
            stars: 4.5,
            genres: ['Drama'],
            interpreter: ['Rocky'],
            tags: ['Messiah', 'CIA','Drama'],
            description: 'A wary CIA officer investigates a charismatic man who sparks a spiritual movement and stirs political unrest. Who exactly is he? And what does he want?',
            age: '12+',
            duration: 'Episode',
            year: '2020',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'messiah ep6': {
            image: '/images/episodes/pb1.jpg',
            title: 'Messiah Ep 6',
            slug: "Messiah-Ep-6_Rocky",
            rating: 7.6,
            actor:['Mehdi Dehbi','Michelle Monaghan'],
            stars: 4.5,
            genres: ['Drama'],
            interpreter: ['Rocky'],
            tags: ['Messiah', 'CIA','Drama'],
            description: 'A wary CIA officer investigates a charismatic man who sparks a spiritual movement and stirs political unrest. Who exactly is he? And what does he want?',
            age: '12+',
            duration: 'Episode',
            year: '2020',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'messiah ep7': {
            image: '/images/episodes/pb1.jpg',
            title: 'Messiah Ep 7',
            slug: "Messiah-Ep-7_Rocky",
            rating: 7.6,
            actor:['Mehdi Dehbi','Michelle Monaghan'],
            stars: 4.5,
            genres: ['Drama'],
            interpreter: ['Rocky'],
            tags: ['Messiah', 'CIA','Drama'],
            description: 'A wary CIA officer investigates a charismatic man who sparks a spiritual movement and stirs political unrest. Who exactly is he? And what does he want?',
            age: '12+',
            duration: 'Episode',
            year: '2020',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'messiah ep8': {
            image: '/images/episodes/pb1.jpg',
            title: 'Messiah Ep 8',
            slug: "Messiah-Ep-8_Rocky",
            rating: 7.6,
            actor:['Mehdi Dehbi','Michelle Monaghan'],
            stars: 4.5,
            genres: ['Drama'],
            interpreter: ['Rocky'],
            tags: ['Messiah', 'CIA','Drama'],
            description: 'A wary CIA officer investigates a charismatic man who sparks a spiritual movement and stirs political unrest. Who exactly is he? And what does he want?',
            age: '12+',
            duration: 'Episode',
            year: '2020',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },

        'shooter s1 ep1': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 1',
            slug:"Shooter-S1-Ep-1_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep2': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 2',
            slug:"Shooter-S1-Ep-2_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep3': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 3',
            slug:"Shooter-S1-Ep-3_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep4': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 4',
            slug:"Shooter-S1-Ep-4_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep5': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 5',
            slug:"Shooter-S1-Ep-5_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep6': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 6',
            slug: "Shooter-S1-Ep-6_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep7': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 7',
            slug:"Shooter-S1-Ep-7_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep8': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 8',
            slug:"Shooter-S1-Ep-8_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep9': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 9',
            slug:"Shooter-S1-Ep-9_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep10': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 10',
            slug:"Shooter-S1-Ep-10_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep11': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 11',
            slug:"Shooter-S1-Ep-11_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep12': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 12',
            slug:"Shooter-S1-Ep-12_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep13': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 13',
            slug:"Shooter-S1-Ep-13_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep14': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 14',
            slug:"Shooter-S1-Ep-14_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep15': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 15',
            slug:"Shooter-S1-Ep-15_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 ep16': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 16',
            slug:"Shooter-S1-Ep-16_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s1 e17': {
            image: '/images/episodes/fe2.jpg',
            title: 'Shooter S1 Ep 17',
            slug:"Shooter-S1-Ep-17_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s2 ep1': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S2 Ep 1',
            slug:"Shooter-S2-Ep-1_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s2 ep2': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S2 Ep 2',
            slug:"Shooter-S2-Ep-2_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s2 ep3': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S2 Ep 3',
            slug:"Shooter-S2-Ep-3_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s2 ep3b': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S2 Ep 3b',
            slug:"Shooter-S2-Ep-3b_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s2 ep4': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S2 Ep 4',
            slug:"Shooter-S2-Ep-4_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s2 ep5': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S2 Ep 5',
            slug:"Shooter-S2-Ep-5_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s2 ep6': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S2 Ep 6',
            slug:"Shooter-S2-Ep-6_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s2 ep7': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S2 Ep 7',
            slug:"Shooter-S2-Ep-7_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s2 ep8': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S2 Ep 8',
            slug:"Shooter-S2-Ep-8_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s2 ep8b': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S2 Ep 8b',
            slug:"Shooter-S2-Ep-8b_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep1': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 1',
            slug:"Shooter-S3-Ep-1_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep2': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 2',
            slug:"Shooter-S3-Ep-2_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep3': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 3',
            slug:"Shooter-S3-Ep-3_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep3b': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 3b',
            slug:"Shooter-S3-Ep-3b_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep3c': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 3c',
            slug:"Shooter-S3-Ep-3c_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep4': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 4',
            slug:"Shooter-S3-Ep-4_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep5': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 5',
            slug:"Shooter-S3-Ep-5_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep6': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 6',
            slug:"Shooter-S3-Ep-6_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep7': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 7',
            slug:"Shooter-S3-Ep-7_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep8': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 8',
            slug:"Shooter-S3-Ep-8_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep8b': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 8b',
            slug:"Shooter-S3-Ep-8b_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep9': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 9',
            slug:"Shooter-S3-Ep-9_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep10': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 10',
            slug:"Shooter-S3-Ep-10_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep11': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 11',
            slug:"Shooter-S3-Ep-11_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep12': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 12',
            slug:"Shooter-S3-Ep-12_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'shooter s3 ep13': {
            image: '/images/episodes/fe3.jpg',
            title: 'Shooter S3 Ep 13',
            slug:"Shooter-S3-Ep-13_Rocky",
            rating: 7.9,
            actor:['Ryan Phillippe','Shantel VanSanten'],
            stars: 5,
            genres: ['Action', 'War & Politics', 'Adventure'],
            interpreter: ['Rocky'],
            tags: ['Action', 'War','Drama'],
            description: ' Bob Lee Swagger is an expert marksman living in exile who is coaxed back into action after learning of a plot to kill the president.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the long road home s1 ep 1': {
            image: '/images/episodes/tlr.jpg',
            title: 'The Long Road Home S1 Ep 1',
            slug:"The Long Road Home-S1-Ep-1_Junior-Git",
            rating: 7.2,
            actor:['E.J Bonilla','Micheal Kelly'],
            stars: 4.5,
            genres: ['War', 'Politics', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['War','Drama'],
            description: ' Relive a heroic fight for survival during the Iraq War, when the 1st Cavalry Division from Fort Hood was ferociously ambushed on April 4, 2004, in Sadr City, Baghdad — a day that came to be known in military annals as “Black Sunday”.',
            age: '10+',
            duration: 'Episode',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4',
            seriesId: 'the long road home',
            seriesTitle: 'The Long Road Home',
            season: '1',
            episodeNumber: 1
        },
        'the long road home s1 ep 2': {
            image: '/images/episodes/tlr.jpg',
            title: 'The Long Road Home S1 Ep 2',
            slug:"The Long Road Home-S1-Ep-2_Junior-Git",
            rating: 7.2,
            actor:['E.J Bonilla','Micheal Kelly'],
            stars: 4.5,
            genres: ['War', 'Politics', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['War','Drama'],
            description: ' Relive a heroic fight for survival during the Iraq War, when the 1st Cavalry Division from Fort Hood was ferociously ambushed on April 4, 2004, in Sadr City, Baghdad — a day that came to be known in military annals as “Black Sunday”.',
            age: '10+',
            duration: 'Episode',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4',
            seriesId: 'the long road home',
            seriesTitle: 'The Long Road Home',
            season: '1',
            episodeNumber: 2
        },
        'the long road home s1 ep 3': {
            image: '/images/episodes/tlr.jpg',
            title: 'The Long Road Home S1 Ep 3',
            slug:"The Long Road Home-S1-Ep-3_Junior-Git",
            rating: 7.2,
            actor:['E.J Bonilla','Micheal Kelly'],
            stars: 4.5,
            genres: ['War', 'Politics', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['War','Drama'],
            description: ' Relive a heroic fight for survival during the Iraq War, when the 1st Cavalry Division from Fort Hood was ferociously ambushed on April 4, 2004, in Sadr City, Baghdad — a day that came to be known in military annals as “Black Sunday”.',
            age: '10+',
            duration: 'Episode',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4',
            seriesId: 'the long road home',
            seriesTitle: 'The Long Road Home',
            season: '1',
            episodeNumber: 3
        },
        'the long road home s1 ep 4': {
            image: '/images/episodes/tlr.jpg',
            title: 'The Long Road Home S1 Ep 4',
            slug:"The Long Road Home-S1-Ep-4_Junior-Git",
            rating: 7.2,
            actor:['E.J Bonilla','Micheal Kelly'],
            stars: 4.5,
            genres: ['War', 'Politics', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['War','Drama'],
            description: ' Relive a heroic fight for survival during the Iraq War, when the 1st Cavalry Division from Fort Hood was ferociously ambushed on April 4, 2004, in Sadr City, Baghdad — a day that came to be known in military annals as “Black Sunday”.',
            age: '10+',
            duration: 'Episode',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4',
            seriesId: 'the long road home',
            seriesTitle: 'The Long Road Home',
            season: '1',
            episodeNumber: 4
        },
        'the long road home s1 ep 5': {
            image: '/images/episodes/tlr.jpg',
            title: 'The Long Road Home S1 Ep 5',
            slug:"The Long Road Home-S1-Ep-5_Junior-Git",
            rating: 7.2,
            actor:['E.J Bonilla','Micheal Kelly'],
            stars: 4.5,
            genres: ['War', 'Politics', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['War','Drama'],
            description: ' Relive a heroic fight for survival during the Iraq War, when the 1st Cavalry Division from Fort Hood was ferociously ambushed on April 4, 2004, in Sadr City, Baghdad — a day that came to be known in military annals as “Black Sunday”.',
            age: '10+',
            duration: 'Episode',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the long road home s1 ep 6': {
            image: '/images/episodes/tlr.jpg',
            title: 'The Long Road Home S1 Ep 6',
            slug:"The Long Road Home-S1-Ep-6_Junior-Git",
            rating: 7.2,
            actor:['E.J Bonilla','Micheal Kelly'],
            stars: 4.5,
            genres: ['War', 'Politics', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['War','Drama'],
            description: ' Relive a heroic fight for survival during the Iraq War, when the 1st Cavalry Division from Fort Hood was ferociously ambushed on April 4, 2004, in Sadr City, Baghdad — a day that came to be known in military annals as “Black Sunday”.',
            age: '10+',
            duration: 'Episode',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the long road home s1 ep 7': {
            image: '/images/episodes/tlr.jpg',
            title: 'The Long Road Home S1 Ep 7',
            slug:"The Long Road Home-S1-Ep-7_Junior-Git",
            rating: 7.2,
            actor:['E.J Bonilla','Micheal Kelly'],
            stars: 4.5,
            genres: ['War', 'Politics', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['War','Drama'],
            description: ' Relive a heroic fight for survival during the Iraq War, when the 1st Cavalry Division from Fort Hood was ferociously ambushed on April 4, 2004, in Sadr City, Baghdad — a day that came to be known in military annals as “Black Sunday”.',
            age: '10+',
            duration: 'Episode',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the long road home s1 ep 8': {
            image: '/images/episodes/tlr.jpg',
            title: 'The Long Road Home S1 Ep 8',
            slug:"The Long Road Home-S1-Ep-8_Junior-Git",
            rating: 7.2,
            actor:['E.J Bonilla','Micheal Kelly'],
            stars: 4.5,
            genres: ['War', 'Politics', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['War','Drama'],
            description: ' Relive a heroic fight for survival during the Iraq War, when the 1st Cavalry Division from Fort Hood was ferociously ambushed on April 4, 2004, in Sadr City, Baghdad — a day that came to be known in military annals as “Black Sunday”.',
            age: '10+',
            duration: 'Episode',
            year: '2017',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the manipulated s1 ep 1': {
            image: '/images/episodes/m1.jpg',
            title: 'The Manipulated S1 Ep 1',
            slug:"The Manipulated-S1-Ep-1_Junior-Git",
            rating: 7.4,
            actor:['Ji Chang-Wook','Doh kyuk-Soo'],
            stars: 4.5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korea','Drama'],
            description: 'Mild-mannered Tae-jung is wrongfully imprisoned for a heinous crime. He soon discovers that a mysterious figure named Yo-han orchestrated his downfall. Fueled by vengeance, Tae-jung sets out to make Yo-han pay.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the manipulated s1 ep 2': {
            image: '/images/episodes/m1.jpg',
            title: 'The Manipulated S1 Ep 2',
            slug:"The Manipulated-S1-Ep-2_Junior-Git",
            rating: 7.4,
            actor:['Ji Chang-Wook','Doh kyuk-Soo'],
            stars: 4.5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korea','Drama'],
            description: 'Mild-mannered Tae-jung is wrongfully imprisoned for a heinous crime. He soon discovers that a mysterious figure named Yo-han orchestrated his downfall. Fueled by vengeance, Tae-jung sets out to make Yo-han pay.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the manipulated s1 ep 3': {
            image: '/images/episodes/m1.jpg',
            title: 'The Manipulated S1 Ep 3',
            slug:"The Manipulated-S1-Ep-3_Junior-Git",
            rating: 7.4,
            actor:['Ji Chang-Wook','Doh kyuk-Soo'],
            stars: 4.5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korea','Drama'],
            description: 'Mild-mannered Tae-jung is wrongfully imprisoned for a heinous crime. He soon discovers that a mysterious figure named Yo-han orchestrated his downfall. Fueled by vengeance, Tae-jung sets out to make Yo-han pay.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the manipulated s1 ep 4': {
            image: '/images/episodes/m1.jpg',
            title: 'The Manipulated S1 Ep 4',
            slug:"The Manipulated-S1-Ep-4_Junior-Git",
            rating: 7.4,
            actor:['Ji Chang-Wook','Doh kyuk-Soo'],
            stars: 4.5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korea','Drama'],
            description: 'Mild-mannered Tae-jung is wrongfully imprisoned for a heinous crime. He soon discovers that a mysterious figure named Yo-han orchestrated his downfall. Fueled by vengeance, Tae-jung sets out to make Yo-han pay.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the manipulated s1 ep 5': {
            image: '/images/episodes/m1.jpg',
            title: 'The Manipulated S1 Ep 5',
            slug:"The Manipulated-S1-Ep-5_Junior-Git",
            rating: 7.4,
            actor:['Ji Chang-Wook','Doh kyuk-Soo'],
            stars: 4.5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korea','Drama'],
            description: 'Mild-mannered Tae-jung is wrongfully imprisoned for a heinous crime. He soon discovers that a mysterious figure named Yo-han orchestrated his downfall. Fueled by vengeance, Tae-jung sets out to make Yo-han pay.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the manipulated s1 ep 6': {
            image: '/images/episodes/m1.jpg',
            title: 'The Manipulated S1 Ep 6',
            slug:"The Manipulated-S1-Ep-6_Junior-Git",
            rating: 7.4,
            actor:['Ji Chang-Wook','Doh kyuk-Soo'],
            stars: 4.5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korea','Drama'],
            description: 'Mild-mannered Tae-jung is wrongfully imprisoned for a heinous crime. He soon discovers that a mysterious figure named Yo-han orchestrated his downfall. Fueled by vengeance, Tae-jung sets out to make Yo-han pay.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the manipulated s1 ep 7': {
            image: '/images/episodes/m1.jpg',
            title: 'The Manipulated S1 Ep 7',
            slug:"The Manipulated-S1-Ep-7_Junior-Git",
            rating: 7.4,
            actor:['Ji Chang-Wook','Doh kyuk-Soo'],
            stars: 4.5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korea','Drama'],
            description: 'Mild-mannered Tae-jung is wrongfully imprisoned for a heinous crime. He soon discovers that a mysterious figure named Yo-han orchestrated his downfall. Fueled by vengeance, Tae-jung sets out to make Yo-han pay.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bad influencer s1 ep1': {
            image: '/images/episodes/bad.jpg',
            title: 'Bad Influencer S1 Ep 1',
            slug:"Bad-Influencer-S1-Ep-1_Rocky",
            rating: 7.9,
            actor:['Jo-Anne Reyneke','Cindy Mahlangu'],
            stars: 5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['South africa','Drama', 'Social media'],
            description: 'A single mother — and luxury bag counterfeiter — finds herself teaming up with a self-obsessed influencer to sell her bags and scrape her way out of debt.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bad influencer s1 ep2': {
            image: '/images/episodes/bad.jpg',
            title: 'Bad Influencer S1 Ep 2',
            slug:"Bad-Influencer-S1-Ep-2_Rocky",
            rating: 7.9,
            actor:['Jo-Anne Reyneke','Cindy Mahlangu'],
            stars: 5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['South africa','Drama', 'Social media'],
            description: 'A single mother — and luxury bag counterfeiter — finds herself teaming up with a self-obsessed influencer to sell her bags and scrape her way out of debt.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bad influencer s1 ep3': {
            image: '/images/episodes/bad.jpg',
            title: 'Bad Influencer S1 Ep 3',
            slug:"Bad-Influencer-S1-Ep-3_Rocky",
            rating: 7.9,
            actor:['Jo-Anne Reyneke','Cindy Mahlangu'],
            stars: 5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['South africa','Drama', 'Social media'],
            description: 'A single mother — and luxury bag counterfeiter — finds herself teaming up with a self-obsessed influencer to sell her bags and scrape her way out of debt.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bad influencer s1 ep4': {
            image: '/images/episodes/bad.jpg',
            title: 'Bad Influencer S1 Ep 4',
            slug:"Bad-Influencer-S1-Ep-4_Rocky",
            rating: 7.9,
            actor:['Jo-Anne Reyneke','Cindy Mahlangu'],
            stars: 5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['South africa','Drama', 'Social media'],
            description: 'A single mother — and luxury bag counterfeiter — finds herself teaming up with a self-obsessed influencer to sell her bags and scrape her way out of debt.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bad influencer s1 ep5': {
            image: '/images/episodes/bad.jpg',
            title: 'Bad Influencer S1 Ep 5',
            slug:"Bad-Influencer-S1-Ep-5_Rocky",
            rating: 7.9,
            actor:['Jo-Anne Reyneke','Cindy Mahlangu'],
            stars: 5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['South africa','Drama', 'Social media'],
            description: 'A single mother — and luxury bag counterfeiter — finds herself teaming up with a self-obsessed influencer to sell her bags and scrape her way out of debt.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bad influencer s1 ep6': {
            image: '/images/episodes/bad.jpg',
            title: 'Bad Influencer S1 Ep 6',
            slug:"The Manipulated-S1-Ep-6_Junior-Git",
            rating: 7.9,
            actor:['Jo-Anne Reyneke','Cindy Mahlangu'],
            stars: 5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['South africa','Drama', 'Social media'],
            description: 'A single mother — and luxury bag counterfeiter — finds herself teaming up with a self-obsessed influencer to sell her bags and scrape her way out of debt.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'bad influencer s1 ep7': {
            image: '/images/episodes/bad.jpg',
            title: 'Bad Influencer S1 Ep 7',
            slug:"Bad-Influencer-S1-Ep-7_Rocky",
            rating: 7.9,
            actor:['Jo-Anne Reyneke','Cindy Mahlangu'],
            stars: 5,
            genres: ['Crime', 'Drama'],
            interpreter: ['Rocky'],
            tags: ['South africa','Drama', 'Social media'],
            description: 'A single mother — and luxury bag counterfeiter — finds herself teaming up with a self-obsessed influencer to sell her bags and scrape her way out of debt.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'tempest s1 ep1': {
            image: '/images/episodes/temp.jpg',
            title: 'Tempest S1 Ep 1',
            slug:"Tempest-S1-Ep-1_Junior-Git",
            rating: 7.6,
            actor:['Gianna Jun','Gang Dong-Won'],
            stars: 4.5,
            genres: ['Mystery', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korean','Drama', 'Mystery'],
            description: 'Seo Munju, a highly accomplished diplomat and former ambassador to the United Nations, and Sanho, an international special agent shrouded in a veil of secrets, race to uncover the truth behind an attack that threatens the future stability of the Korean peninsula.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'tempest s1 ep2': {
            image: '/images/episodes/temp.jpg',
            title: 'Tempest S1 Ep 2',
            slug: "Tempest-S1-Ep-2_Junior-Git",
            rating: 7.6,
            actor:['Gianna Jun','Gang Dong-Won'],
            stars: 4.5,
            genres: ['Mystery', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korean','Drama', 'Mystery'],
            description: 'Seo Munju, a highly accomplished diplomat and former ambassador to the United Nations, and Sanho, an international special agent shrouded in a veil of secrets, race to uncover the truth behind an attack that threatens the future stability of the Korean peninsula.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'tempest s1 ep3': {
            image: '/images/episodes/temp.jpg',
            title: 'Tempest S1 Ep 3',
            slug: "Tempest-S1-Ep-3_Junior-Git",
            rating: 7.6,
            actor:['Gianna Jun','Gang Dong-Won'],
            stars: 4.5,
            genres: ['Mystery', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korean','Drama', 'Mystery'],
            description: 'Seo Munju, a highly accomplished diplomat and former ambassador to the United Nations, and Sanho, an international special agent shrouded in a veil of secrets, race to uncover the truth behind an attack that threatens the future stability of the Korean peninsula.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'tempest s1 ep4': {
            image: '/images/episodes/temp.jpg',
            title: 'Tempest S1 Ep 4',
            slug: "Tempest-S1-Ep-4_Junior-Git",
            rating: 7.6,
            actor:['Gianna Jun','Gang Dong-Won'],
            stars: 4.5,
            genres: ['Mystery', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korean','Drama', 'Mystery'],
            description: 'Seo Munju, a highly accomplished diplomat and former ambassador to the United Nations, and Sanho, an international special agent shrouded in a veil of secrets, race to uncover the truth behind an attack that threatens the future stability of the Korean peninsula.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'tempest s1 ep5': {
            image: '/images/episodes/temp.jpg',
            title: 'Tempest S1 Ep 5',
            slug: "Tempest-S1-Ep-5_Junior-Git",
            rating: 7.6,
            actor:['Gianna Jun','Gang Dong-Won'],
            stars: 4.5,
            genres: ['Mystery', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korean','Drama', 'Mystery'],
            description: 'Seo Munju, a highly accomplished diplomat and former ambassador to the United Nations, and Sanho, an international special agent shrouded in a veil of secrets, race to uncover the truth behind an attack that threatens the future stability of the Korean peninsula.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'tempest s1 ep6': {
            image: '/images/episodes/temp.jpg',
            title: 'Tempest S1 Ep 6',
            slug: "Tempest-S1-Ep-6_Junior-Git",
            rating: 7.6,
            actor:['Gianna Jun','Gang Dong-Won'],
            stars: 4.5,
            genres: ['Mystery', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korean','Drama', 'Mystery'],
            description: 'Seo Munju, a highly accomplished diplomat and former ambassador to the United Nations, and Sanho, an international special agent shrouded in a veil of secrets, race to uncover the truth behind an attack that threatens the future stability of the Korean peninsula.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'tempest s1 ep7': {
            image: '/images/episodes/temp.jpg',
            title: 'Tempest S1 Ep 7',
            slug: "Tempest-S1-Ep-7_Junior-Git",
            rating: 7.6,
            actor:['Gianna Jun','Gang Dong-Won'],
            stars: 4.5,
            genres: ['Mystery', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korean','Drama', 'Mystery'],
            description: 'Seo Munju, a highly accomplished diplomat and former ambassador to the United Nations, and Sanho, an international special agent shrouded in a veil of secrets, race to uncover the truth behind an attack that threatens the future stability of the Korean peninsula.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'tempest s1 ep8': {
            image: '/images/episodes/temp.jpg',
            title: 'Tempest S1 Ep 8',
            slug: "Tempest-S1-Ep-8_Junior-Git",
            rating: 7.6,
            actor:['Gianna Jun','Gang Dong-Won'],
            stars: 4.5,
            genres: ['Mystery', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korean','Drama', 'Mystery'],
            description: 'Seo Munju, a highly accomplished diplomat and former ambassador to the United Nations, and Sanho, an international special agent shrouded in a veil of secrets, race to uncover the truth behind an attack that threatens the future stability of the Korean peninsula.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'tempest s1 ep9': {
            image: '/images/episodes/temp.jpg',
            title: 'Tempest S1 Ep 9',
            slug: "Tempest-S1-Ep-9_Junior-Git",
            rating: 7.6,
            actor:['Gianna Jun','Gang Dong-Won'],
            stars: 4.5,
            genres: ['Mystery', 'Drama'],
            interpreter: ['Junior Giti'],
            tags: ['Korean','Drama', 'Mystery'],
            description: 'Seo Munju, a highly accomplished diplomat and former ambassador to the United Nations, and Sanho, an international special agent shrouded in a veil of secrets, race to uncover the truth behind an attack that threatens the future stability of the Korean peninsula.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },

        'the copenhagen test s1 ep1': {
            image: '/images/episodes/copen.jpg',
            title: 'The Copenhagen Test S1 Ep 1',
            slug: "The-Copenhagen-Test-S1-Ep-1_Didier",
            rating: 8.1,
            actor:['Simu Liu','Melissa Barrera'],
            stars: 5,
            genres: ['Action', 'Adventure', 'Sci-fi'],
            interpreter: ['Didier'],
            tags: ['Fantasy','Action', 'Mystery'],
            description:' When an analyst discovers his eyes and ears have been hacked, he drawn into a controlled world designed by his agency to draw out their enemies.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the copenhagen test s1 ep2': {
            image: '/images/episodes/copen.jpg',
            title: 'The Copenhagen Test S1 Ep 2',
            slug: "The-Copenhagen-Test-S1-Ep-2_Didier",
            rating: 8.1,
            actor:['Simu Liu','Melissa Barrera'],
            stars: 5,
            genres: ['Action', 'Adventure', 'Sci-fi'],
            interpreter: ['Didier'],
            tags: ['Fantasy','Action', 'Mystery'],
            description:' When an analyst discovers his eyes and ears have been hacked, he drawn into a controlled world designed by his agency to draw out their enemies.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the copenhagen test s1 ep3': {
            image: '/images/episodes/copen.jpg',
            title: 'The Copenhagen Test S1 Ep 3',
            slug: "The-Copenhagen-Test-S1-Ep-3_Didier",
            rating: 8.1,
            actor:['Simu Liu','Melissa Barrera'],
            stars: 5,
            genres: ['Action', 'Adventure', 'Sci-fi'],
            interpreter: ['Didier'],
            tags: ['Fantasy','Action', 'Mystery'],
            description:' When an analyst discovers his eyes and ears have been hacked, he drawn into a controlled world designed by his agency to draw out their enemies.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the copenhagen test s1 ep4': {
            image: '/images/episodes/copen.jpg',
            title: 'The Copenhagen Test S1 Ep 4',
            slug: "The-Copenhagen-Test-S1-Ep-4_Didier",
            rating: 8.1,
            actor:['Simu Liu','Melissa Barrera'],
            stars: 5,
            genres: ['Action', 'Adventure', 'Sci-fi'],
            interpreter: ['Didier'],
            tags: ['Fantasy','Action', 'Mystery'],
            description:' When an analyst discovers his eyes and ears have been hacked, he drawn into a controlled world designed by his agency to draw out their enemies.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the copenhagen test s1 ep5': {
            image: '/images/episodes/copen.jpg',
            title: 'The Copenhagen Test S1 Ep 5',
            slug: "The-Copenhagen-Test-S1-Ep-5_Didier",
            rating: 8.1,
            actor:['Simu Liu','Melissa Barrera'],
            stars: 5,
            genres: ['Action', 'Adventure', 'Sci-fi'],
            interpreter: ['Didier'],
            tags: ['Fantasy','Action', 'Mystery'],
            description:' When an analyst discovers his eyes and ears have been hacked, he drawn into a controlled world designed by his agency to draw out their enemies.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the copenhagen test s1 ep6': {
            image: '/images/episodes/copen.jpg',
            title: 'The Copenhagen Test S1 Ep 6',
            slug: "The-Copenhagen-Test-S1-Ep-6_Didier",
            rating: 8.1,
            actor:['Simu Liu','Melissa Barrera'],
            stars: 5,
            genres: ['Action', 'Adventure', 'Sci-fi'],
            interpreter: ['Didier'],
            tags: ['Fantasy','Action', 'Mystery'],
            description:' When an analyst discovers his eyes and ears have been hacked, he drawn into a controlled world designed by his agency to draw out their enemies.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the copenhagen test s1 ep7': {
            image: '/images/episodes/copen.jpg',
            title: 'The Copenhagen Test S1 Ep 7',
            slug: "The-Copenhagen-Test-S1-Ep-7_Didier",
            rating: 8.1,
            actor:['Simu Liu','Melissa Barrera'],
            stars: 5,
            genres: ['Action', 'Adventure', 'Sci-fi'],
            interpreter: ['Didier'],
            tags: ['Fantasy','Action', 'Mystery'],
            description:' When an analyst discovers his eyes and ears have been hacked, he drawn into a controlled world designed by his agency to draw out their enemies.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'the copenhagen test s1 ep8': {
            image: '/images/episodes/copen.jpg',
            title: 'The Copenhagen Test S1 Ep 8',
            slug: "The-Copenhagen-Test-S1-Ep-8_Didier",
            rating: 8.1,
            actor:['Simu Liu','Melissa Barrera'],
            stars: 5,
            genres: ['Action', 'Adventure', 'Sci-fi'],
            interpreter: ['Didier'],
            tags: ['Fantasy','Action', 'Mystery'],
            description:' When an analyst discovers his eyes and ears have been hacked, he drawn into a controlled world designed by his agency to draw out their enemies.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'six s1 ep1': {
            image: '/images/episodes/six.jpg',
            title: 'Six S1 Ep 1',
            slug:"Six-S1-Ep-1_Junior-Git",
            rating: 8.0,
            actor:['Barry Sloane','Dominic Adams'],
            stars: 4.5,
            genres: ['Action', 'War', 'Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Adventure','Politics', 'Mystery'],
            description:' Action drama series inspired by the real missions of Navy SEAL Team Six.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'six s1 ep2': {
            image: '/images/episodes/six.jpg',
            title: 'Six S1 Ep 2',
            slug:"Six-S1-Ep-2_Junior-Git",
            rating: 8.0,
            actor:['Barry Sloane','Dominic Adams'],
            stars: 4.5,
            genres: ['Action', 'War', 'Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Adventure','Politics', 'Mystery'],
            description:' Action drama series inspired by the real missions of Navy SEAL Team Six.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'six s1 ep3': {
            image: '/images/episodes/six.jpg',
            title: 'Six S1 Ep 3',
            slug:"Six-S1-Ep-3_Junior-Git",
            rating: 8.0,
            actor:['Barry Sloane','Dominic Adams'],
            stars: 4.5,
            genres: ['Action', 'War', 'Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Adventure','Politics', 'Mystery'],
            description:' Action drama series inspired by the real missions of Navy SEAL Team Six.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'six s1 ep4': {
            image: '/images/episodes/six.jpg',
            title: 'Six S1 Ep 4',
            slug:"Six-S1-Ep-4_Junior-Git",
            rating: 8.0,
            actor:['Barry Sloane','Dominic Adams'],
            stars: 4.5,
            genres: ['Action', 'War', 'Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Adventure','Politics', 'Mystery'],
            description:' Action drama series inspired by the real missions of Navy SEAL Team Six.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'six s1 ep5': {
            image: '/images/episodes/six.jpg',
            title: 'Six S1 Ep 5',
            slug:"Six-S1-Ep-5_Junior-Git",
            rating: 8.0,
            actor:['Barry Sloane','Dominic Adams'],
            stars: 4.5,
            genres: ['Action', 'War', 'Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Adventure','Politics', 'Mystery'],
            description:' Action drama series inspired by the real missions of Navy SEAL Team Six.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'six s1 ep6': {
            image: '/images/episodes/six.jpg',
            title: 'Six S1 Ep 6',
            slug:"Six-S1-Ep-6_Junior-Git",
            rating: 8.0,
            actor:['Barry Sloane','Dominic Adams'],
            stars: 4.5,
            genres: ['Action', 'War', 'Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Adventure','Politics', 'Mystery'],
            description:' Action drama series inspired by the real missions of Navy SEAL Team Six.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'six s1 ep7': {
            image: '/images/episodes/six.jpg',
            title: 'Six S1 Ep 7',
            slug:"Six-S1-Ep-7_Junior-Git",
            rating: 8.0,
            actor:['Barry Sloane','Dominic Adams'],
            stars: 4.5,
            genres: ['Action', 'War', 'Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Adventure','Politics', 'Mystery'],
            description:' Action drama series inspired by the real missions of Navy SEAL Team Six.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'six s1 ep8': {
            image: '/images/episodes/six.jpg',
            title: 'Six S1 Ep 8',
            slug:"Six-S1-Ep-8_Junior-Git",
            rating: 8.0,
            actor:['Barry Sloane','Dominic Adams'],
            stars: 4.5,
            genres: ['Action', 'War', 'Crime'],
            interpreter: ['Junior Giti'],
            tags: ['Adventure','Politics', 'Mystery'],
            description:' Action drama series inspired by the real missions of Navy SEAL Team Six.',
            age: '10+',
            duration: 'Episode',
            year: '2018',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep1': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 1',
            slug:"Twelve-S1-Ep-1_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep2': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 2',
            slug:"Twelve-S1-Ep-2_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep3': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 3',
            slug:"Twelve-S1-Ep-3_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep4': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 4',
            slug:"Twelve-S1-Ep-4_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep5': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 5',
            slug:"Twelve-S1-Ep-5_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep6': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 6',
            slug:"Twelve-S1-Ep-6_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep7': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 7',
            slug:"Twelve-S1-Ep-7_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep8': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 8',
            slug:"Twelve-S1-Ep-8_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep9': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 9',
            slug:"Twelve-S1-Ep-9_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep10': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 10',
            slug:"Twelve-S1-Ep-10_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },
        'twelve s1 ep11': {
            image: '/images/episodes/twelve.jpg',
            title: 'Twelve S1 Ep 11',
            slug:"Twelve-S1-Ep-11_Perfect",
            rating: 7.0,
            actor:['Ma Dong-Seok','Park Hyung-Sik'],
            stars: 4,
            genres: ['Fantasy', 'Sci-fi', 'Adventure'],
            interpreter: ['Perfect'],
            tags: ['Adventure','Action', 'Drama'],
            description:' A group of heroes, each embodying one of the 12 zodiac signs, battles to defend the Korean Peninsula from malevolent spirits.',
            age: '10+',
            duration: 'Episode',
            year: '2025',
            videoLink: 'https://videopress.com/embed/Ohws8y572KE',
            downloadLink: 'https://cdn.example.com/download/mission-impossible-1996.mp4'
        },

    };

    // Ensure Cloudflare R2 fields exist for all videos by defaulting from existing URLs
    Object.entries(videoData).forEach(([id, data]) => {
        if (!data || typeof data !== 'object') return;

        // Keep R2 playable field only if explicitly provided; do NOT derive it from downloadLink
        if (!data.r2Video) {
            data.r2Video = data.r2 || null;
        }

        // Ensure r2Download follows the canonical downloadLink when available
        if (!data.r2Download) {
            data.r2Download = data.downloadLink || data.r2Download || null;
        }
    });

    // Helper to generate a default slug from title + year (used if explicit slug is not provided)
    function generateSlugFromTitleAndYear(key, data) {
        const baseTitle = (data && data.title) ? data.title : key;
        const year = (data && data.interpreter) ? String(data.interpreter) : '';
        const slugBase = baseTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')   // non-alphanumeric -> -
            .replace(/^-+|-+$/g, '');      // trim leading/trailing -
        return year ? `${slugBase}_${year}` : slugBase;
    }

    // Build a lookup map from slug -> videoId, extending existing movie data without replacing it
    const slugToVideoIdMap = {};
    Object.entries(videoData).forEach(([id, data]) => {
        if (!data || typeof data !== 'object') return;
        // If slug not explicitly set on data, generate one for internal use
        if (!data.slug) {
            data.slug = generateSlugFromTitleAndYear(id, data);
        }
        if (data.slug && !slugToVideoIdMap[data.slug]) {
            slugToVideoIdMap[data.slug] = id;
        }
    });

    // Also expose videoData and slug map on the window so other modules (like search) can always see it
    if (typeof window !== 'undefined') {
        window.videoData = videoData;
        window.slugToVideoIdMap = slugToVideoIdMap;
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
    
    // Helper function to extract video ID from link or ID for navigation
    // This replaces overlay logic with page navigation to /watch/?slug=VIDEO_SLUG (or ?id=VIDEO_ID as fallback)
    function getVideoIdForNavigation(identifier) {
        if (!identifier) return null;
        
        // If it's already an ID (not a URL), return it
        if (!identifier.startsWith('http://') && !identifier.startsWith('https://')) {
            return identifier;
        }
        
        // If it's a VideoPress embed URL, extract the ID
        const embedMatch = identifier.match(/embed\/([a-zA-Z0-9_-]+)/);
        if (embedMatch) {
            return embedMatch[1];
        }
        
        // Try to find by videoLink in videoData
        for (const [id, data] of Object.entries(videoData)) {
            if (data && data.videoLink === identifier) {
                return id;
            }
        }
        
        // Fallback: try to extract any ID-like string from the URL
        const idMatch = identifier.match(/([a-zA-Z0-9_-]{8,})/);
        if (idMatch && videoData[idMatch[1]]) {
            return idMatch[1];
        }
        
        return null;
    }
    
    // Function to navigate to watch page instead of opening overlay
    function navigateToWatchPage(videoLinkOrId, title) {
        // Only show loading overlay if we have a valid video ID
        const videoId = getVideoIdForNavigation(videoLinkOrId);
        
        if (videoId) {
            // Show loading overlay before navigation
            showPageLoadOverlay();
            // Prefer slug-based clean URL if available
            try {
                const data = (typeof window !== 'undefined' && window.videoData && window.videoData[videoId]) ? window.videoData[videoId] : null;
                const slug = data && data.slug ? data.slug : null;
                if (slug) {
                    window.location.href = `/watch/?slug=${encodeURIComponent(slug)}`;
                } else {
                    window.location.href = `/watch/?id=${encodeURIComponent(videoId)}`;
                }
            } catch (e) {
                window.location.href = `/watch/?id=${encodeURIComponent(videoId)}`;
            }
        } else {
            console.error('Could not extract video ID for navigation:', videoLinkOrId);
            // Fallback: try to use the identifier as-is
            const fallbackId = videoLinkOrId ? String(videoLinkOrId).replace(/https?:\/\/[^\/]+\/embed\//, '').replace(/[^a-zA-Z0-9_-]/g, '') : '';
            if (fallbackId && fallbackId.length > 0) {
                showPageLoadOverlay();
                // Prefer slug-based URL if possible
                try {
                    const data = (typeof window !== 'undefined' && window.videoData && window.videoData[fallbackId]) ? window.videoData[fallbackId] : null;
                    const slug = data && data.slug ? data.slug : null;
                    if (slug) {
                        window.location.href = `/watch/?slug=${encodeURIComponent(slug)}`;
                    } else {
                        window.location.href = `/watch/?id=${encodeURIComponent(fallbackId)}`;
                    }
                } catch (e) {
                    window.location.href = `/watch/?id=${encodeURIComponent(fallbackId)}`;
                }
            } else {
                // Hide overlay if navigation fails (no valid ID)
                console.error('No valid video ID found, not navigating');
                hidePageLoadOverlay();
            }
        }
    }
    
    // Show loading overlay for page navigation
    function showPageLoadOverlay() {
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) {
            pageLoader.style.display = 'flex';
            pageLoader.classList.remove('hidden');
            document.body.classList.add('loading');
        }
    }
    
    // Hide loading overlay (called when page is fully loaded)
    function hidePageLoadOverlay() {
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) {
            pageLoader.classList.add('hidden');
            document.body.classList.remove('loading');
            // Force hide immediately as well
            setTimeout(function() {
                pageLoader.style.display = 'none';
                document.body.classList.remove('loading');
            }, 100);
        } else {
            // If page loader element not found, just remove loading class
            document.body.classList.remove('loading');
        }
    }
    
    // Global function to force hide loader (safety mechanism)
    window.forceHideLoader = function() {
        hidePageLoadOverlay();
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) {
            pageLoader.style.display = 'none';
            pageLoader.classList.add('hidden');
        }
        document.body.classList.remove('loading');
    };
    
    // Make functions globally accessible
    window.showPageLoadOverlay = showPageLoadOverlay;
    window.hidePageLoadOverlay = hidePageLoadOverlay;
    
    // Make navigateToWatchPage globally accessible for search and other modules
    window.navigateToWatchPage = navigateToWatchPage;
    
    // REMOVED: Global navigation handler that was causing infinite loading
    // The loading overlay is now only shown explicitly in navigateToWatchPage function
    // This prevents the overlay from showing for dropdown toggles, buttons, etc.
    
    // Add per-movie watch/download links
    (function ensureVideoLinks() {
        Object.entries(videoData).forEach(([videoId, movie]) => {
            if (!movie) return;

            // Ensure videoLink exists - use real VideoPress embed URL
            // Using a real VideoPress video GUID for all videos
            if (!movie.videoLink) {
                movie.videoLink = 'https://videopress.com/embed/kUJmAcSf';
            }

            // Ensure actors data exists for watch page "Actors" section.
            // Prefer explicit movie.actors, otherwise accept common aliases.
            // If nothing is provided, keep it as an empty array.
            if (!Array.isArray(movie.actors)) {
                const alias = movie.actor || movie.cast;
                movie.actors = Array.isArray(alias) ? alias : [];
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
        actors: [],
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

    function triggerImmediateDownload(downloadUrl, filename) {
        if (!downloadUrl) return Promise.resolve(false);

        const fileName = filename || 'video.mp4';
        const clickDownloadLink = function(urlToDownload) {
            const link = document.createElement('a');
            link.href = urlToDownload;
            link.style.display = 'none';
            link.setAttribute('rel', 'noopener');
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            }, 200);
        };

        let parsedUrl = null;
        try {
            parsedUrl = new URL(downloadUrl, window.location.href);
        } catch (_) {
            return Promise.resolve(false);
        }

        if (parsedUrl.origin === window.location.origin) {
            clickDownloadLink(parsedUrl.href);
            return Promise.resolve(true);
        }

        return fetch(parsedUrl.href, { mode: 'cors', credentials: 'omit' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.blob();
            })
            .then((blob) => {
                const blobUrl = URL.createObjectURL(blob);
                clickDownloadLink(blobUrl);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
                return true;
            })
            .catch((error) => {
                console.warn('Direct download failed:', error);
                return false;
            });
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

    function inferVideoMimeType(url) {
        const cleanUrl = (url || '').split('#')[0].split('?')[0].toLowerCase();
        if (cleanUrl.endsWith('.m3u8')) return 'application/x-mpegURL';
        if (cleanUrl.endsWith('.webm')) return 'video/webm';
        if (cleanUrl.endsWith('.ogv') || cleanUrl.endsWith('.ogg')) return 'video/ogg';
        if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.m4v')) return 'video/mp4';
        return null;
    }

    function isDirectMediaUrl(url) {
        if (!url) return false;
        const lower = String(url).toLowerCase();
        if (!/^https?:\/\//.test(lower)) return false;
        if (lower.includes('videopress.com/embed/')) return false;
        if (lower.includes('youtube.com') || lower.includes('youtu.be')) return false;
        return true;
    }

    // Helper to update the video player in the watch page
    // videoInput can be either a videoId (e.g., 'pickup') or a slug
    function setGalleryVideoByLink(videoInput) {
        if (!videoInput) {
            console.warn('setGalleryVideoByLink called with empty input');
            return;
        }

        const mediaEl = document.getElementById('video-iframe');
        if (!mediaEl) {
            console.error('Video element (#video-iframe) not found');
            return;
        }

        console.log('=== setGalleryVideoByLink ===');
        console.log('Input:', videoInput);

        // Step 1: Look up the movie data
        let data = null;
        
        // Try direct lookup first (videoInput might be a videoId)
        if (videoData[videoInput]) {
            console.log('✓ Found data via direct lookup: videoData["' + videoInput + '"]');
            data = videoData[videoInput];
        } else {
            console.warn('✗ No videoData found for:', videoInput);
            return;
        }

        // Step 2: Extract the actual video URL and download URL from the data
        const videoUrl = data.videoLink || data.r2Video;
        const downloadUrl = data.downloadLink || data.r2Download;
        let normalizedVideoUrl = videoUrl || '';
        try {
            normalizedVideoUrl = encodeURI(decodeURI(normalizedVideoUrl));
        } catch (_) {
            normalizedVideoUrl = encodeURI(normalizedVideoUrl);
        }
        const mediaType = data.videoType || inferVideoMimeType(normalizedVideoUrl);

        if (!videoUrl) {
            console.error('✗ videoData has no videoLink property:', data);
            return;
        }

        console.log('Video URL from data.videoLink:', normalizedVideoUrl);
        console.log('Download URL from data.downloadLink:', downloadUrl);

        // Step 3: Set the video source
        if (mediaEl.tagName && mediaEl.tagName.toLowerCase() === 'video') {
            if (!isDirectMediaUrl(normalizedVideoUrl)) {
                console.error('Unsupported video source for HTML5 <video>:', normalizedVideoUrl);
                console.error('Expected a direct media file URL such as .mp4, .m3u8, .webm');
                return;
            }

            console.log('Setting up HTML5 video element...');

            // Ensure video is visible
            mediaEl.style.display = 'block';
            mediaEl.style.visibility = 'visible';
            
            const isSameSource = mediaEl.dataset.currentVideoUrl === normalizedVideoUrl;
            if (isSameSource) {
                console.log('Same video source already loaded; skipping source reset');
            }
            
            const preferNativePlayback = normalizedVideoUrl.includes('.r2.dev/');
            
            // Check if Video.js player exists, use its API
            if (!isSameSource && !preferNativePlayback && window.videojs && typeof window.videojs === 'function') {
                try {
                    const player = window.videojs.getPlayer(mediaEl.id) || window.videojs(mediaEl.id);
                    if (player) {
                        console.log('✓ Using Video.js player API to set source');
                        if (mediaType) {
                            player.src({ src: normalizedVideoUrl, type: mediaType });
                        } else {
                            player.src(normalizedVideoUrl);
                        }
                        console.log('✓ Video.js player source updated:', normalizedVideoUrl);
                    } else {
                        throw new Error('Could not get Video.js player instance');
                    }
                } catch (vjsError) {
                    console.warn('⚠ Video.js API failed, falling back to native HTML5:', vjsError.message);
                    // Fallback: set source element directly
                    let srcEl = mediaEl.querySelector('source');
                    if (!srcEl) {
                        srcEl = document.createElement('source');
                        mediaEl.appendChild(srcEl);
                    }
                    srcEl.src = normalizedVideoUrl;
                    if (mediaType) {
                        srcEl.type = mediaType;
                    } else {
                        srcEl.removeAttribute('type');
                    }
                    mediaEl.load();
                }
            } else if (!isSameSource) {
                console.log('✓ Setting source directly on video element');
                // Direct HTML5 approach
                let srcEl = mediaEl.querySelector('source');
                if (!srcEl) {
                    srcEl = document.createElement('source');
                    mediaEl.appendChild(srcEl);
                }
                srcEl.src = normalizedVideoUrl;
                if (mediaType) {
                    srcEl.type = mediaType;
                } else {
                    srcEl.removeAttribute('type');
                }
                mediaEl.load();
            }

            mediaEl.dataset.currentVideoUrl = normalizedVideoUrl;

            // Try to play (may be blocked by browser autoplay policy)
            const playPromise = mediaEl.play && mediaEl.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise
                    .then(() => {
                        console.log('✓ Video autoplaying successfully');
                    })
                    .catch(err => {
                        console.warn('⚠ Autoplay blocked:', err.message, '(user may need to click play button)');
                    });
            } else {
                console.log('⚠ play() did not return a promise (likely older browser)');
            }

            // Add event listeners for debugging
            mediaEl.addEventListener('error', (e) => {
                console.error('✗ Video error:', mediaEl.error?.code, mediaEl.error?.message);
            }, { once: true });

            mediaEl.addEventListener('canplay', () => {
                console.log('✓ Video ready to play');
            }, { once: true });

            mediaEl.addEventListener('loadstart', () => {
                console.log('✓ Video loadstart - fetching from server');
            }, { once: true });
        }

        // Step 4: Update download button
        try {
            const downloadBtn = document.querySelector('.video-actions .btn-download');
            if (downloadBtn && downloadUrl) {
                downloadBtn.style.display = '';
                downloadBtn.onclick = (e) => {
                    e.preventDefault();
                    const videoTitle = document.getElementById('video-title') ? document.getElementById('video-title').textContent : 'video';
                    const safeTitle = sanitizeFilename(videoTitle) + '.mp4';
                    triggerImmediateDownload(downloadUrl, safeTitle);
                };
                downloadBtn.setAttribute('data-download-href', downloadUrl);
                console.log('✓ Download button enabled');
            } else if (downloadBtn) {
                downloadBtn.style.display = 'none';
                downloadBtn.onclick = null;
                downloadBtn.removeAttribute('data-download-href');
                console.log('⚠ No downloadLink in videoData');
            }
        } catch (e) {
            console.warn('Could not update download button:', e);
        }

        // Store current video ID
        currentVideoId = videoInput;

        // Update sidebar buttons
        if (typeof updateFavoriteWatchlistButtons === 'function') {
            setTimeout(() => {
                updateFavoriteWatchlistButtons();
            }, 100);
        }

        console.log('=== End setGalleryVideoByLink ===\n');
    }
    
    // Keep old function name for backward compatibility, but it now expects video links
    function setGalleryVideoById(videoLink) {
        setGalleryVideoByLink(videoLink);
    }
    
    // Make setGalleryVideoByLink globally accessible for watch page
    window.setGalleryVideoByLink = setGalleryVideoByLink;

    // Function to stop video
    function stopVideo() {
        const mediaEl = document.getElementById('video-iframe');
        if (!mediaEl) return;

        try {
            if (mediaEl.tagName && mediaEl.tagName.toLowerCase() === 'video') {
                // Pause and remove source
                try { mediaEl.pause(); } catch (_) {}
                const srcEl = mediaEl.querySelector('source');
                if (srcEl) srcEl.src = '';
                mediaEl.load && mediaEl.load();
                // If Video.js, dispose player instance to reset
                if (typeof window.videojs === 'function') {
                    try { const p = window.videojs(mediaEl); p.pause(); } catch (_) {}
                }
            } else if (mediaEl.tagName && mediaEl.tagName.toLowerCase() === 'iframe') {
                mediaEl.src = '';
            }
        } catch (e) {}
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
        
        // Update titles
        const titleElement = document.getElementById('video-title');
        if (titleElement) {
            titleElement.textContent = data.title;
        }
        // Also update main page heading on the watch page, if present
        const pageTitleElement = document.getElementById('movie-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = data.title;
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

        // Update actors (watch page sidebar section)
        const actorsList = document.getElementById('actors-list') || document.querySelector('.actor-list');
        if (actorsList) {
            const actors = Array.isArray(data.actors) ? data.actors : (Array.isArray(data.actor) ? data.actor : (Array.isArray(data.cast) ? data.cast : []));
            actorsList.innerHTML = '';
            if (actors.length > 0) {
                actors.forEach(name => {
                    const actorTag = document.createElement('span');
                    // Same class as genres so they look identical
                    actorTag.className = 'genre-tag';
                    actorTag.textContent = name;
                    actorsList.appendChild(actorTag);
                });
            } else {
                const actorTag = document.createElement('span');
                actorTag.className = 'genre-tag';
                actorTag.textContent = 'Not specified';
                actorsList.appendChild(actorTag);
            }
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

        // Update the bottom sidebar download button instead of inserting a duplicate under the title
        try {
            const bottomBtn = document.querySelector('.video-actions .btn-download');
            const downloadHref = (data && (data.downloadLink || data.r2Download)) || null;
            if (bottomBtn) {
                if (downloadHref) {
                    bottomBtn.style.display = '';
                    bottomBtn.onclick = function(e) {
                        e.preventDefault();
                        const videoTitle = document.getElementById('video-title') ? document.getElementById('video-title').textContent : 'video';
                        const safeTitle = sanitizeFilename(videoTitle) + '.mp4';
                        triggerImmediateDownload(downloadHref, safeTitle);
                    };
                    bottomBtn.setAttribute('data-download-href', downloadHref);
                } else {
                    bottomBtn.style.display = 'none';
                    bottomBtn.onclick = null;
                    bottomBtn.removeAttribute('data-download-href');
                }
            }
        } catch (e) {}
        
        // Update favorite and watchlist buttons
        if (typeof updateFavoriteWatchlistButtons === 'function') {
            setTimeout(function() {
                updateFavoriteWatchlistButtons();
            }, 100);
        }
    }
    
    // Video Gallery Event Handlers
    jQuery(document).ready(function() {
        console.log('=== Watch Page Document Ready ===');
        console.log('videoData available?', typeof window.videoData !== 'undefined' ? 'YES' : 'NO');
        console.log('videoData entries:', window.videoData ? Object.keys(window.videoData).length : 0);
        console.log('slugToVideoIdMap available?', typeof window.slugToVideoIdMap !== 'undefined' ? 'YES' : 'NO');
        
        const videoGallery = jQuery('#video-gallery-overlay');
        const closeBtn = jQuery('#close-video-gallery');
        const playNowButtons = jQuery('.btn-hover.iq-button, .play-now-btn, .iq-button[data-video-link], .iq-button[data-video-id]');
        
        console.log('Video element exists?', document.getElementById('video-iframe') ? 'YES' : 'NO');
        
        // Read the video ID or slug from URL query parameters
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const idParam = urlParams.get('id');
            const slugParam = urlParams.get('slug');
            
            console.log('URL params - id:', idParam, '| slug:', slugParam);
            
            if (slugParam && window.slugToVideoIdMap && window.slugToVideoIdMap[slugParam]) {
                currentVideoId = window.slugToVideoIdMap[slugParam];
                console.log('✓ Mapped slug to videoId:', currentVideoId);
            } else if (idParam) {
                currentVideoId = decodeURIComponent(idParam);
                console.log('✓ Using id param as videoId:', currentVideoId);
            } else {
                console.log('⚠ No id or slug in URL, using default:', currentVideoId);
            }
        } catch (e) {
            console.error('Error reading URL params:', e);
        }
        
        console.log('Final videoId to use:', currentVideoId);
        console.log('videoData["' + currentVideoId + '"] exists?', videoData[currentVideoId] ? 'YES' : 'NO');
        if (videoData[currentVideoId]) {
            console.log('Movie title:', videoData[currentVideoId].title);
            console.log('Video link:', videoData[currentVideoId].videoLink);
        }
        
        // Initialize video player after a short delay to ensure DOM is ready
        setTimeout(function() {
            console.log('→ Calling setGalleryVideoByLink...');
            setGalleryVideoByLink(currentVideoId);
            updateSidebarContent(currentVideoId);
        }, 200);
        
        // Initialize favorite and watchlist buttons
        setTimeout(function() {
            if (typeof updateFavoriteWatchlistButtons === 'function') {
                updateFavoriteWatchlistButtons();
            }
        }, 500);
        
        console.log('=== Watch Page Initialization Complete ===\n');
        
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
        // These should always navigate to watch page using slug (including buttons in overview of seasons)
        playNowButtons.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Prefer data-video-id (actual video ID) over data-video-link
            let videoId = jQuery(this).attr('data-video-id');
            const videoLink = jQuery(this).attr('data-video-link');
            const title = jQuery(this).attr('data-title') || 'Movie Title';
            
            // If no videoId, try to extract from videoLink
            if (!videoId && videoLink) {
                if (videoLink.includes('videopress.com')) {
                    const match = videoLink.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/);
                    if (match) {
                        videoId = match[1];
                    }
                } else if (!videoLink.startsWith('http://') && !videoLink.startsWith('https://')) {
                    // Assume it's already a video ID
                    videoId = videoLink;
                }
            }
            
            // If still no videoId, try to use videoLink as-is (it might be an ID)
            if (!videoId) {
                videoId = videoLink;
            }
            
            if (!videoId) {
                console.warn('No video ID found for play button');
                return;
            }

            // If this click is for a series episode (from an episodes carousel),
            // persist the current season's episode list so the watch page can render "Next Episodes".
            try { persistEpisodeContextFromButton(this, videoId); } catch (_) {}
            // If NOT from episodes carousel (e.g. main slider), detect episode vs movie from videoData
            if (!jQuery(this).closest('.episodes-contens').length) {
                try { persistEpisodeContextIfEpisode(videoId, title, this); } catch (_) {}
            }
            
            // Remember the series scope where this click happened
            const scope = jQuery(this).closest('.trending-info, .slide-item, .block-images, .e-item').get(0);
            if (scope) {
                window.__lastSeriesScope = scope;
            }
            
            // Navigate to watch page using slug (navigateToWatchPage will look up slug from videoId)
            // The watch page will handle loading the video and sidebar data
            if (typeof window.navigateToWatchPage === 'function') {
                window.navigateToWatchPage(videoId, title);
            } else {
                window.location.href = `/watch/?id=${encodeURIComponent(videoId)}`;
            }
        });
        
        // Additional catch-all handler for any .iq-button clicks (play icon buttons)
        // These should always navigate to watch page using slug (including buttons in overview of seasons)
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
            
            // Prefer data-video-id (actual video ID) over data-video-link
            let videoId = jQuery(this).attr('data-video-id');
            const videoLink = jQuery(this).attr('data-video-link');
            const title = jQuery(this).attr('data-title') || 'Movie Title';
            
            // If no videoId, try to extract from videoLink
            if (!videoId && videoLink) {
                if (videoLink.includes('videopress.com')) {
                    const match = videoLink.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/);
                    if (match) {
                        videoId = match[1];
                    }
                } else if (!videoLink.startsWith('http://') && !videoLink.startsWith('https://')) {
                    // Assume it's already a video ID
                    videoId = videoLink;
                }
            }
            
            // If still no videoId, try to use videoLink as-is (it might be an ID)
            if (!videoId) {
                videoId = videoLink;
            }
            
            if (!videoId) {
                return;
            }

            // Persist episode context when clicking an episode item (so watch page can show next episodes)
            try { persistEpisodeContextFromButton(this, videoId); } catch (_) {}
            // If NOT from episodes carousel (e.g. main slider, slide-item), detect episode vs movie from videoData
            if (!jQuery(this).closest('.episodes-contens').length) {
                try { persistEpisodeContextIfEpisode(videoId, title, this); } catch (_) {}
            }
            
            // Remember the series scope where this click happened
            const scope = jQuery(this).closest('.trending-info, .slide-item, .block-images, .e-item').get(0);
            if (scope) {
                window.__lastSeriesScope = scope;
            }
            
            // Navigate to watch page using slug (navigateToWatchPage will look up slug from videoId)
            // The watch page will handle loading the video and sidebar data
            if (typeof window.navigateToWatchPage === 'function') {
                window.navigateToWatchPage(videoId, title);
            } else {
                window.location.href = `/watch/?id=${encodeURIComponent(videoId)}`;
            }
        });

        /**
         * Persist episode context (series title, season, episodes list) into sessionStorage.
         * The watch page reads this to show/hide default sections vs "Next Episodes".
         */
        function persistEpisodeContextFromButton(buttonEl, currentVideoId) {
            const $btn = jQuery(buttonEl);
            const $episodesContens = $btn.closest('.episodes-contens');

            // Not an episode click → clear previous episode context to avoid stale UI
            if (!$episodesContens.length) {
                try { sessionStorage.removeItem('watch_episode_context'); } catch (_) {}
                return;
            }

            const $seriesScope = $btn.closest('.trending-info, .overlay-tab, .tab-pane');

            // Series title (best-effort)
            let seriesTitle = '';
            const $bigTitle = $seriesScope.find('.trending-text.big-title').first();
            if ($bigTitle.length) seriesTitle = ($bigTitle.text() || '').trim();

            // Selected season number ("Season1" -> "1")
            let seasonNumber = '';
            const $select = $seriesScope.find('select.season-select').first();
            if ($select.length) {
                seasonNumber = String($select.val() || '').replace('Season', '').trim();
            }

            const $seasonCarousels = $episodesContens.find('.episodes-slider1');
            let $activeCarousel = $seasonCarousels;

            if ($seasonCarousels.length > 1 && seasonNumber) {
                const $match = $seasonCarousels.filter(function() {
                    return String(this.getAttribute('data-season') || '').trim() === String(seasonNumber);
                }).first();
                if ($match.length) $activeCarousel = $match;
            }

            // Collect episodes for the selected season
            const episodes = [];
            $activeCarousel.find('.e-item').each(function() {
                const $item = jQuery(this);

                // If single container has all seasons, filter by data-season
                if ($seasonCarousels.length <= 1 && seasonNumber) {
                    const itemSeason = String($item.attr('data-season') || '').trim();
                    if (itemSeason && itemSeason !== String(seasonNumber)) return;
                }

                const $play = $item.find('.iq-button[data-video-id]').first();
                const epId = $play.attr('data-video-id');
                if (!epId) return;

                // CRITICAL: Use the EXACT title from the episodes-description link (what user sees on home page)
                // This is the actual displayed title, not the data-title attribute which may be different
                const epTitle = ($item.find('.episodes-description a').first().text() || $play.attr('data-title') || '').trim();
                const epDuration = ($item.find('.episodes-description .text-primary').first().text() || '').trim();
                const epDesc = ($item.find('.episodes-description p').first().text() || '').trim();
                const epImg = ($item.find('img').first().attr('src') || $item.find('img').first().attr('data-src') || '').trim();

                episodes.push({
                    id: epId,
                    title: epTitle,
                    duration: epDuration,
                    description: epDesc,
                    image: epImg
                });
            });

            if (!seasonNumber && $activeCarousel && $activeCarousel.length) {
                seasonNumber = String($activeCarousel.attr('data-season') || '').trim();
            }

            const payload = {
                seriesTitle: seriesTitle || 'Series',
                season: seasonNumber || '',
                currentVideoId: String(currentVideoId || ''),
                episodes,
                savedAt: Date.now()
            };

            try {
                sessionStorage.setItem('watch_episode_context', JSON.stringify(payload));
            } catch (_) {}
        }

        /**
         * Extract series/season/episode info from title and videoId (for episodes without explicit metadata)
         * e.g., "Shooter S1 Ep 7" or "the long road home s1 ep 7" -> { seriesTitle, season, episodeNumber }
         */
        function extractEpisodeInfoFromTitle(videoIdOrTitle) {
            if (!videoIdOrTitle) return null;
            const str = String(videoIdOrTitle).toLowerCase().trim();
            // Match patterns like "s1 ep1", "s2 ep 7", etc.
            const episodeMatch = str.match(/s(\d+)\s+ep\s*(\d+)/i);
            if (!episodeMatch) return null;
            const season = episodeMatch[1];
            const episodeNumber = parseInt(episodeMatch[2], 10);
            return { season, episodeNumber };
        }
        
        /**
         * Try to determine if a video is an episode by examining its videoId, title, or from videoData
         * Returns { isEpisode, seriesId, season, seriesTitle, episodeNumber }
         */
        function detectIfEpisode(videoId, title, element) {
            if (!videoId) return { isEpisode: false };
            
            const vd = (typeof window !== 'undefined' && window.videoData) ? window.videoData : {};
            const currentData = vd[videoId];
            const $el = element ? jQuery(element) : null;
            const $scope = $el && $el.length ? ($el.closest('.slide-item, .notification-item').length ? $el.closest('.slide-item, .notification-item') : $el) : null;
            
            // Check if explicit metadata exists in videoData
            if (currentData && currentData.seriesId && currentData.season) {
                return {
                    isEpisode: true,
                    seriesId: currentData.seriesId,
                    season: String(currentData.season),
                    seriesTitle: currentData.seriesTitle || 'Series',
                    episodeNumber: currentData.episodeNumber || null
                };
            }
            
            // Check if element has episode data attributes
            const hasEpisodeAttrs = $scope && $scope.attr('data-is-episode') === 'true' &&
                $scope.attr('data-series-id') && $scope.attr('data-season');
            if (hasEpisodeAttrs) {
                return {
                    isEpisode: true,
                    seriesId: $scope.attr('data-series-id'),
                    season: String($scope.attr('data-season')),
                    seriesTitle: $scope.attr('data-series-title') || 'Series',
                    episodeNumber: null
                };
            }
            
            // Try to detect from title pattern (e.g., "Shooter S1 Ep 7", "The Long Road Home S1 Ep 7")
            const titleEpisodeInfo = extractEpisodeInfoFromTitle(title);
            const idEpisodeInfo = extractEpisodeInfoFromTitle(videoId);
            const episodeInfo = titleEpisodeInfo || idEpisodeInfo;
            
            if (episodeInfo) {
                // Extract series name from videoId or title
                let seriesId = videoId;
                let seriesTitle = title;
                
                // For videoId like "the long road home s1 ep 7" or "shooter s1 ep1"
                const seriesMatch = videoId.match(/^(.+?)\s+s\d+\s+ep/i);
                if (seriesMatch) {
                    seriesId = seriesMatch[1].replace(/\s+/g, ' ').toLowerCase();
                    // Format seriesTitle nicely: "the long road home" -> "The Long Road Home"
                    seriesTitle = seriesMatch[1].replace(/\b\w/g, char => char.toUpperCase());
                }
                
                return {
                    isEpisode: true,
                    seriesId: seriesId,
                    season: episodeInfo.season,
                    seriesTitle: seriesTitle,
                    episodeNumber: episodeInfo.episodeNumber || null
                };
            }
            
            return { isEpisode: false };
        }

        /**
         * Persist or clear episode context based on videoData / data attributes / title patterns
         * Use when clicking items that may be episodes (notification bell, main slider, playbtn)
         * but are NOT inside .episodes-contens. If episode: persist context. If movie: clear.
         */
        function persistEpisodeContextIfEpisode(videoId, title, element) {
            if (!videoId) return;
            
            const vd = (typeof window !== 'undefined' && window.videoData) ? window.videoData : {};
            const episodeInfo = detectIfEpisode(videoId, title, element);
            
            if (!episodeInfo.isEpisode) {
                try { sessionStorage.removeItem('watch_episode_context'); } catch (_) {}
                return;
            }
            
            // Build episodes array: find all episodes from same series and season
            const episodes = [];
            let currentIncluded = false;
            
            for (const [id, data] of Object.entries(vd)) {
                if (!data || !data.title) continue;
                
                // Check if this video is from the same series/season
                const otherEpisodeInfo = detectIfEpisode(id, data.title);
                
                // Normalize series IDs for comparison (handle both exact matches and string similarity)
                const otherSeriesId = (otherEpisodeInfo.seriesId || '').toLowerCase().trim();
                const thisSeriesId = (episodeInfo.seriesId || '').toLowerCase().trim();
                
                const sameSeriesAndSeason = 
                    otherEpisodeInfo.isEpisode &&
                    otherSeriesId === thisSeriesId &&
                    otherEpisodeInfo.season === episodeInfo.season;
                
                if (sameSeriesAndSeason) {
                    if (String(id).toLowerCase() === String(videoId).toLowerCase()) {
                        currentIncluded = true;
                    }
                    episodes.push({
                        id: id,
                        title: data.title || 'Episode',
                        duration: data.duration || '',
                        description: data.description || '',
                        image: data.image || ''
                    });
                }
            }
            
            // Ensure current episode is included
            if (!currentIncluded) {
                const currentData = vd[videoId];
                episodes.push({
                    id: videoId,
                    title: (currentData && currentData.title) || title || 'Episode',
                    duration: (currentData && currentData.duration) || '',
                    description: (currentData && currentData.description) || '',
                    image: (currentData && currentData.image) || ''
                });
            }
            
            // Sort episodes by episode number
            episodes.sort(function(a, b) {
                const dataA = vd[a.id], dataB = vd[b.id];
                const infoA = extractEpisodeInfoFromTitle(a.id);
                const infoB = extractEpisodeInfoFromTitle(b.id);
                const epA = (infoA && infoA.episodeNumber) || (dataA && dataA.episodeNumber) || 999;
                const epB = (infoB && infoB.episodeNumber) || (dataB && dataB.episodeNumber) || 999;
                return epA - epB;
            });
            
            // Persist context
            try {
                sessionStorage.setItem('watch_episode_context', JSON.stringify({
                    seriesTitle: episodeInfo.seriesTitle,
                    season: episodeInfo.season,
                    currentVideoId: String(videoId),
                    episodes: episodes,
                    savedAt: Date.now()
                }));
            } catch (_) {}
        }
        
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

            // Extract video ID from videoLink if it's a VideoPress URL
            let actualVideoId = videoId;
            if (!actualVideoId && videoLink) {
                if (videoLink.includes('videopress.com')) {
                    const match = videoLink.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/);
                    if (match) {
                        actualVideoId = match[1];
                    }
                } else if (!videoLink.startsWith('http://') && !videoLink.startsWith('https://')) {
                    // Assume it's already a video ID
                    actualVideoId = videoLink;
                }
            }

            return {
                videoId: actualVideoId || videoId || null,
                videoLink: videoLink || (videoId ? getVideoLink(videoId) : null) || null,
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
        // These should always navigate to watch page using slug
        // If the item is an episode, persist episode context so watch page hides default sections and shows next episodes
        jQuery(document).on('click', '.notification-item', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Try data-video-id first (this is the actual video ID), then fallback to data-video-link
            let videoId = jQuery(this).attr('data-video-id');
            const videoLink = jQuery(this).attr('data-video-link');
            const title = jQuery(this).attr('data-title') || 'Movie Title';
            
            // If we have videoId, use it directly for navigation (preferred for slug lookup)
            // If we only have videoLink, extract ID from it or use it as-is
            if (!videoId && videoLink) {
                // Extract video ID from VideoPress URL if it's a full URL
                if (videoLink.includes('videopress.com')) {
                    const match = videoLink.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/);
                    if (match) {
                        videoId = match[1];
                    }
                } else if (!videoLink.startsWith('http://') && !videoLink.startsWith('https://')) {
                    // Assume it's already a video ID
                    videoId = videoLink;
                }
            }
            
            if (!videoId) {
                console.warn('No video ID found for notification item');
                return;
            }
            
            // Close notification dropdown if open
            const listItem = jQuery(this).closest('li');
            if (listItem.length) {
                listItem.removeClass('iq-show');
                listItem.find('.search-toggle').removeClass('active');
            }
            
            // Detect and persist episode context (works with or without explicit metadata)
            try { persistEpisodeContextIfEpisode(videoId, title, this); } catch (_) {}
            
            // Navigate to watch page using slug (navigateToWatchPage will look up slug from videoId)
            if (typeof window.navigateToWatchPage === 'function') {
                window.navigateToWatchPage(videoId, title);
            } else {
                window.location.href = `/watch/?id=${encodeURIComponent(videoId)}`;
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
            if (!videoData.videoId) {
                showShareCopyPopup({
                    title: videoData.title,
                    link: 'Link unavailable',
                    platform: isFacebook ? 'Facebook' : (isYoutube ? 'YouTube' : 'Instagram')
                });
                return;
            }

        // Generate share link in format: miyagifilms.com/watch/?slug=video-slug (fallback to ?id=video-id)
            const baseUrl = window.location.origin || 'https://miyagifilms.com';
            const fullVideoData = (typeof window !== 'undefined' && window.videoData && window.videoData[videoData.videoId])
                ? window.videoData[videoData.videoId]
                : null;
            const slug = fullVideoData && fullVideoData.slug ? fullVideoData.slug : null;
            const shareLink = slug
                ? `${baseUrl}/watch/?slug=${encodeURIComponent(slug)}`
                : `${baseUrl}/watch/?id=${encodeURIComponent(videoData.videoId)}`;

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
            // Prefer data-video-id (actual video ID) over data-video-link for slug lookup
            let videoId = trigger.attr('data-video-id');
            let videoLink = trigger.attr('data-video-link');
            let title = trigger.attr('data-title');

            if (!videoId && !videoLink) {
                const slideScope = trigger.closest('.slide');
                const fallbackButton = slideScope.find('.iq-button[data-video-link], .iq-button[data-video-id]').first();
                if (fallbackButton.length) {
                    videoId = fallbackButton.attr('data-video-id');
                    videoLink = fallbackButton.attr('data-video-link');
                    title = title || fallbackButton.attr('data-title');
                }
            }

            // Extract videoId from videoLink if needed
            if (!videoId && videoLink) {
                if (videoLink.includes('videopress.com')) {
                    const match = videoLink.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/);
                    if (match) {
                        videoId = match[1];
                    }
                } else if (!videoLink.startsWith('http://') && !videoLink.startsWith('https://')) {
                    // Assume it's already a video ID
                    videoId = videoLink;
                }
            }

            if (videoId) {
                // If this is an episode (main slider item), persist episode context so watch page hides default sections and shows next episodes
                try { persistEpisodeContextIfEpisode(videoId, title || 'Trailer', this); } catch (_) {}
                // Navigate to watch page using slug (navigateToWatchPage will look up slug from videoId)
                if (typeof window.navigateToWatchPage === 'function') {
                    window.navigateToWatchPage(videoId, title || 'Trailer');
                } else {
                    window.location.href = `/watch/?id=${encodeURIComponent(videoId)}`;
                }
            } else if (videoLink) {
                try { persistEpisodeContextIfEpisode(videoLink, title || 'Trailer', this); } catch (_) {}
                // Fallback: use videoLink if we couldn't extract videoId
                navigateToWatchPage(videoLink, title || 'Trailer');
            }
        });
        
        // Event listeners for buttons inside video gallery (delegated event)
        // This navigates to watch page with the selected video
        jQuery(document).on('click', '.video-gallery-overlay .video-gallery-default-section .iq-button', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Prefer data-video-id (actual video ID) over data-video-link
            let videoId = jQuery(this).attr('data-video-id');
            const videoLink = jQuery(this).attr('data-video-link');
            const title = jQuery(this).attr('data-title') || 'Movie Title';
            
            // If no videoId, try to extract from videoLink
            if (!videoId && videoLink) {
                if (videoLink.includes('videopress.com')) {
                    const match = videoLink.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/);
                    if (match) {
                        videoId = match[1];
                    }
                } else if (!videoLink.startsWith('http://') && !videoLink.startsWith('https://')) {
                    // Assume it's already a video ID
                    videoId = videoLink;
                }
            }
            
            // If still no videoId, try to use videoLink as-is (it might be an ID)
            if (!videoId) {
                videoId = videoLink;
            }
            
            if (videoId) {
                // Navigate to watch page with video ID
                // The watch page will handle loading the video and sidebar data
                if (typeof window.navigateToWatchPage === 'function') {
                    window.navigateToWatchPage(videoId, title);
                } else {
                    window.location.href = `/watch/?id=${encodeURIComponent(videoId)}`;
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
            const explicitDownloadUrl = this.getAttribute('data-download-href') || '';
            if (explicitDownloadUrl) {
                const videoTitle = document.getElementById('video-title') ? document.getElementById('video-title').textContent : 'video';
                const safeTitle = sanitizeFilename(videoTitle) + '.mp4';
                triggerImmediateDownload(explicitDownloadUrl, safeTitle).then((started) => {
                    if (started) {
                        displayNotification('Download started. Check your browser downloads.', 'success');
                    } else {
                        displayNotification('Download is not available for this title yet.', 'info');
                    }
                });
                return;
            }
            let videoId = currentVideoId || '';
            if (!videoId) {
                displayNotification('Download is not available for this title yet.', 'info');
                return;
            }
            
            // Extract video ID from videopress URL if it's a full URL
            if (videoId.includes('videopress.com')) {
                const match = videoId.match(/videopress\.com\/(?:embed\/|v\/)?([a-zA-Z0-9_-]+)/);
                if (match) {
                    videoId = match[1];
                }
            }
            
            // Get video title for filename
            const videoTitle = document.getElementById('video-title') ? document.getElementById('video-title').textContent : 'video';
            const safeTitle = sanitizeFilename(videoTitle);
            
            // VideoPress direct video file URL format
            // Format: https://videos.files.wordpress.com/{videoId}/{videoId}.mp4
            const downloadUrl = `https://videos.files.wordpress.com/${videoId}/${videoId}.mp4`;
            
            displayNotification('Preparing download...', 'info');

            triggerImmediateDownload(downloadUrl, `${safeTitle}.mp4`).then((started) => {
                if (started) {
                    displayNotification('Download started. Check your browser downloads.', 'success');
                } else {
                    displayNotification('Unable to start download for this file.', 'error');
                }
            }).catch((error) => {
                console.error('Download error:', error);
                displayNotification('Unable to start download for this file.', 'error');
            });
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
                                slidesToShow: 2,
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
                                slidesToShow: 2,
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
            
            // Check if gallery is already open
            const isAlreadyOpen = videoGallery.hasClass('active');
            
            // Show overlay first (only if not already open to prevent flicker)
            if (!isAlreadyOpen) {
                videoGallery.addClass('active');
                jQuery('body').css('overflow', 'hidden').addClass('video-gallery-active');
                
                // Scroll video gallery to top when opening
                setTimeout(function() {
                    const overlayElement = document.getElementById('video-gallery-overlay');
                    if (overlayElement) {
                        overlayElement.scrollTop = 0;
                    }
                }, 100);
            } else {
                // Even if already open, scroll to top when switching videos
                setTimeout(function() {
                    const overlayElement = document.getElementById('video-gallery-overlay');
                    if (overlayElement) {
                        overlayElement.scrollTop = 0;
                    }
                }, 100);
            }
            
            // Show default section by default (only if gallery was just opened, not when switching videos)
            if (!isAlreadyOpen) {
                showDefaultSection();
            }
            
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
                z-index: 100000;
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
            
            // Navigate to watch page instead of opening overlay
            if (typeof window.navigateToWatchPage === 'function') {
                window.navigateToWatchPage(contentData.videoId, contentData.title);
            } else {
                window.location.href = `/watch/?id=${contentData.videoId}`;
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
              interpreter: Array.isArray(data.interpreter) ? data.interpreter : [],
              year: data.year ? String(data.year) : '',
              // If no explicit image is defined, fall back to a generic placeholder
              image: data.image || 'images/placeholder.jpg',
              description: data.description || '',
              tags: Array.isArray(data.tags) ? data.tags : [],
              age: data.age || '',
              duration: data.duration || '',
              // Include episode information for search results
              seriesId: data.seriesId || null,
              season: data.season || null,
              episodeNumber: data.episodeNumber || null,
              videoLink: data.videoLink || null
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

      // Add to all search input containers (including hidden ones)
      this.searchInputs.forEach(input => {
        const container = input.closest('.form-group');
        if (container) {
          container.style.position = 'relative';
          
          // Check if container already exists to avoid duplicates
          let resultsContainer = container.querySelector('.search-results-container');
          if (!resultsContainer) {
            resultsContainer = containerTemplate.cloneNode(true);
            container.appendChild(resultsContainer);
          }
        }
      });
    }

    bindEvents() {
      this.searchInputs.forEach(input => {
        // Mark as bound to avoid duplicate bindings
        input.setAttribute('data-search-bound', 'true');
        
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
      // Use faster reinitialization for better responsiveness
      document.addEventListener('click', (e) => {
        if (e.target.closest('.search-toggle')) {
          // Wait for the search box to become visible (reduced from 200ms to 50ms for faster response)
          setTimeout(() => {
            this.reinitializeSearch();
          }, 50);
        }
      });
      
      // Also use MutationObserver to detect when search boxes become visible (faster than setTimeout)
      if (typeof MutationObserver !== 'undefined') {
        const searchObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              const target = mutation.target;
              if (target.classList.contains('search-box') || target.classList.contains('iq-show')) {
                // Search box visibility changed, reinitialize
                setTimeout(() => {
                  this.reinitializeSearch();
                }, 10);
              }
            }
          });
        });
        
        // Observe all search boxes for visibility changes
        document.querySelectorAll('.search-box').forEach(box => {
          searchObserver.observe(box, { attributes: true, attributeFilter: ['class'] });
        });
        
        // Also observe parent elements that control visibility
        document.querySelectorAll('li.nav-item, .navbar-right li').forEach(item => {
          searchObserver.observe(item, { attributes: true, attributeFilter: ['class'] });
        });
      }
    }

    reinitializeSearch() {
      // Re-find search inputs in case they were dynamically shown
      const newSearchInputs = document.querySelectorAll('.search-input');
      console.log('Reinitializing search with inputs:', newSearchInputs.length);

      // Check if we have new inputs that aren't already bound
      const unboundInputs = Array.from(newSearchInputs).filter(input => {
        // Check if input already has our event listener (check for a data attribute)
        return !input.hasAttribute('data-search-bound');
      });

      // Bind events to unbound inputs only (better performance than cloning)
      unboundInputs.forEach(input => {
        // Mark as bound
        input.setAttribute('data-search-bound', 'true');
        
        // Add event listeners
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

      // Update the search inputs reference
      this.searchInputs = newSearchInputs;

      // Recreate search results containers (only if missing)
      this.createSearchResultsContainer();
      
      // Refresh movie data in case videoData was loaded after initial init
      this.movieData = this.getMovieData();
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

      // Debounce search (reduced to 15ms for 90% faster results - 90% reduction from 150ms)
      this.currentSearchTimeout = setTimeout(() => {
        if (query.length >= 2) {
          const results = this.searchMovies(query);
          console.log('Search results:', results);
          this.displaySearchResults(results, resultsContainer);
        } else {
          this.hideSearchResults(event);
        }
      }, 15);
    }

    /**
     * Check if query chars appear in text in order (allows missing letters / typos).
     * e.g. "avngrs" matches "Avengers", "incrdble" matches "Incredibles"
     */
    fuzzyMatchInOrder(query, text) {
      if (!query || !text) return false;
      const q = query.toLowerCase();
      const t = text.toLowerCase();
      let qi = 0;
      for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] === q[qi]) qi++;
      }
      return qi === q.length;
    }

    /**
     * Levenshtein-based similarity: 1 = identical, 0 = no match.
     * Used to rank fuzzy matches and allow 1–2 character typos.
     */
    similarity(a, b) {
      if (!a || !b) return 0;
      const s = a.toLowerCase();
      const t = b.toLowerCase();
      const n = s.length;
      const m = t.length;
      if (n === 0) return m === 0 ? 1 : 0;
      if (m === 0) return 0;
      let prev = Array(m + 1).fill(0);
      let curr = Array(m + 1).fill(0);
      for (let j = 0; j <= m; j++) prev[j] = j;
      for (let i = 1; i <= n; i++) {
        curr[0] = i;
        for (let j = 1; j <= m; j++) {
          const cost = s[i - 1] === t[j - 1] ? 0 : 1;
          curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
        }
        [prev, curr] = [curr, prev];
      }
      const distance = prev[m];
      const maxLen = Math.max(n, m);
      return 1 - distance / maxLen;
    }

    /**
     * Score a movie for the search term: higher = better match.
     * More lenient scoring to show top possibilities even with typos/missing letters.
     */
    searchScore(movie, searchTerm) {
      const term = searchTerm.toLowerCase();
      const title = movie.title.toLowerCase();
      
      // Exact substring match (best)
      if (title.includes(term)) {
        return 1000 + (title.length - term.length);
      }
      
      // Title starts with term
      if (title.startsWith(term)) {
        return 900;
      }
      
      // Check fuzzy in-order match (e.g., "avngrs" → "Avengers")
      const fuzzyInOrder = this.fuzzyMatchInOrder(term, title);
      if (fuzzyInOrder) {
        const sim = this.similarity(term, title);
        return 700 + (sim * 200);
      }
      
      // Check genre match with fuzzy
      const genreMatch = movie.genres && movie.genres.some(g => {
        const genre = g.toLowerCase();
        return genre.includes(term) || this.fuzzyMatchInOrder(term, genre);
      });
      if (genreMatch) {
        return 500;
      }
      
      // Check interpreter match with fuzzy
      const interpMatch = movie.interpreter && movie.interpreter.some(i => {
        const interp = i.toLowerCase();
        return interp.includes(term) || this.fuzzyMatchInOrder(term, interp);
      });
      if (interpMatch) {
        return 400;
      }
      
      // Calculate similarity score for any movie (more lenient threshold)
      const sim = this.similarity(term, title);
      
      // Show results with similarity >= 0.3 (was 0.5, now more forgiving)
      if (sim >= 0.3) {
        return 100 + (sim * 300);
      }
      
      // Also check if title words start with search term
      const titleWords = title.split(/\s+/);
      for (const word of titleWords) {
        if (word.startsWith(term)) {
          return 200 + (term.length / word.length) * 100;
        }
        // Check fuzzy match on individual words
        if (this.fuzzyMatchInOrder(term, word)) {
          return 150 + this.similarity(term, word) * 100;
        }
      }
      
      return 0;
    }

    searchMovies(query) {
      const searchTerm = query.toLowerCase().trim();
      if (!searchTerm) return [];

      // Score all movies and filter those with score > 0
      const scored = this.movieData
        .map(movie => ({ movie, score: this.searchScore(movie, searchTerm) }))
        .filter(pair => pair.score > 0)
        .sort((a, b) => b.score - a.score);

      // Return top 10 results (or all if less than 10)
      const topResults = scored.slice(0, 10);
      return topResults.map(pair => pair.movie);
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
                            <span class="search-result-year">${this.escapeHTML((movie.interpreter || []).join(', '))}</span>
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

    // Normalize a series identifier so we can match episodes together
    normalizeSeriesKey(value) {
      return (value || '')
        .toLowerCase()
        .replace(/episode/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    /**
     * Extract best-effort series/season/episode metadata from a video entry.
     * Works even if videoData entries do not have explicit seriesId/season set.
     */
    extractEpisodeMeta(videoId, data) {
      if (!videoId && !data) return null;

      const rawTitle = (data?.title || videoId || '').trim();
      const combined = `${videoId || ''} ${rawTitle}`;

      let seriesTitle = (data && data.seriesId) ? data.seriesId : rawTitle;
      let seriesKey = (data && data.seriesId) ? this.normalizeSeriesKey(data.seriesId) : null;
      let season = (data && data.season) ? data.season : null;
      let episodeNumber = (data && data.episodeNumber) ? data.episodeNumber : null;

      // Pattern: "<series> S1 Ep2" or similar
      const seasonEpMatch = combined.match(/(.+?)\s+s(\d+)\s*ep(?:isode)?\s*(\d+)/i);
      if (seasonEpMatch) {
        const base = seasonEpMatch[1].trim();
        seriesTitle = seriesTitle || base;
        seriesKey = seriesKey || this.normalizeSeriesKey(base);
        season = season || seasonEpMatch[2];
        episodeNumber = episodeNumber || parseInt(seasonEpMatch[3], 10) || null;
      }

      // Pattern: "<series> Ep2" fallback when no explicit season
      if (!seriesKey) {
        const epMatch = combined.match(/(.+?)\s+ep(?:isode)?\s*(\d+)/i);
        if (epMatch) {
          const base = epMatch[1].trim();
          seriesTitle = seriesTitle || base;
          seriesKey = seriesKey || this.normalizeSeriesKey(base);
          season = season || 1;
          episodeNumber = episodeNumber || parseInt(epMatch[2], 10) || null;
        }
      }

      if (!seriesKey) return null;

      return {
        seriesKey,
        seriesTitle: seriesTitle || seriesKey || 'Series',
        season: season || 1,
        episodeNumber: episodeNumber != null ? Number(episodeNumber) : null
      };
    }

    /**
     * Store episode context for watch page using either explicit metadata
     * or inferred series naming (so search results for episodes still work).
     */
    storeEpisodeContextFromVideoId(videoId) {
      try {
        const videoData = (typeof window !== 'undefined' && window.videoData) ? window.videoData : null;
        if (!videoData || !videoData[videoId]) {
          return false;
        }

        const currentMeta = this.extractEpisodeMeta(videoId, videoData[videoId]);
        if (!currentMeta) {
          return false;
        }

        const episodes = [];
        for (const [id, data] of Object.entries(videoData)) {
          const meta = this.extractEpisodeMeta(id, data);
          if (!meta) continue;

          if (meta.seriesKey === currentMeta.seriesKey &&
              String(meta.season || '1') === String(currentMeta.season || '1')) {
            episodes.push({
              id: id,
              title: data.title || id,
              duration: data.duration || '',
              description: data.description || '',
              image: data.image || '/images/placeholder.jpg',
              episodeNumber: meta.episodeNumber
            });
          }
        }

        if (!episodes.length) {
          return false;
        }

        episodes.sort((a, b) => {
          if (a.episodeNumber != null && b.episodeNumber != null) {
            return a.episodeNumber - b.episodeNumber;
          }
          if (a.episodeNumber != null) return -1;
          if (b.episodeNumber != null) return 1;
          return (a.title || '').localeCompare(b.title || '');
        });

        const ctx = {
          seriesTitle: currentMeta.seriesTitle,
          season: String(currentMeta.season || ''),
          currentVideoId: String(videoId),
          episodes: episodes,
          savedAt: Date.now(),
          fromSearch: true
        };

        sessionStorage.setItem('watch_episode_context', JSON.stringify(ctx));
        console.log('Stored episode context from search:', ctx);
        return true;
      } catch (error) {
        console.error('Error creating episode context from search:', error);
        return false;
      }
    }

    bindResultEvents(container) {
      const resultItems = container.querySelectorAll('.search-result-item');
      resultItems.forEach(item => {
        // Make entire item clickable
        item.style.cursor = 'pointer';

        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Prefer data-video-id (actual video ID) over data-video-link
          let videoId = item.dataset.videoId;
          const videoLink = item.dataset.videoLink;
          const title = item.dataset.title || item.querySelector('.search-result-title')?.textContent || 'Movie';

          // If no videoId but we have videoLink, try to extract ID from it
          if (!videoId && videoLink) {
            if (videoLink.includes('videopress.com')) {
              const match = videoLink.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/);
              if (match) {
                videoId = match[1];
              }
            } else {
              // Assume videoLink is the ID itself
              videoId = videoLink.replace(/https?:\/\/[^\/]+\/embed\//, '').replace(/[^a-zA-Z0-9_-]/g, '');
            }
          }

          if (videoId) {
            // Find movie by videoId in movieData
            const movie = this.movieData.find(m => m.videoId === videoId);
            if (movie) {
              this.handleMovieSelection(movie);
            } else {
              // Movie not found in data, but we have videoId, so navigate directly
              console.log('Movie not found in data, navigating directly with videoId:', videoId);
              this.closeSearchDropdowns();
              this.hideAllSearchResults();
              
              // Clear search input
              this.searchInputs.forEach(input => {
                if (input.value.trim()) {
                  input.value = '';
                }
                input.blur();
              });
              
              // Try to store episode context even when explicit series metadata is missing
              // If this is NOT an episode (returns false), clear any existing episode context
              const isEpisode = this.storeEpisodeContextFromVideoId(videoId);
              if (!isEpisode) {
                // This is a movie, not an episode - clear episode context to ensure default sections show
                try {
                  sessionStorage.removeItem('watch_episode_context');
                  console.log('Cleared episode context - this is a movie, not an episode');
                } catch (_) {}
              }
              
              // Navigate to watch page (reduced delay from 100ms to 0ms for faster navigation)
              if (typeof window.navigateToWatchPage === 'function') {
                window.navigateToWatchPage(videoId, title);
              } else {
                window.location.href = `/watch/?id=${encodeURIComponent(videoId)}`;
              }
            }
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

      // Get video ID (preferred for navigation)
      let videoId = movie.videoId;
      
      // If videoId is a full URL, extract the ID from it
      if (videoId && (videoId.startsWith('http://') || videoId.startsWith('https://'))) {
        if (videoId.includes('videopress.com')) {
          const match = videoId.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/);
          if (match) {
            videoId = match[1];
          }
        }
      }
      
      // If still no videoId, try to extract from videoLink
      if (!videoId && movie.videoLink) {
        if (movie.videoLink.includes('videopress.com')) {
          const match = movie.videoLink.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/);
          if (match) {
            videoId = match[1];
          }
        } else {
          // Assume videoLink is the ID itself
          videoId = movie.videoLink.replace(/https?:\/\/[^\/]+\/embed\//, '').replace(/[^a-zA-Z0-9_-]/g, '');
        }
      }
      
      if (!videoId) {
        console.error('No video ID found for movie:', movie);
        return;
      }
      
      const title = movie.title || 'Movie';

      console.log('Navigating to watch page with video ID:', videoId, 'title:', title);
      console.log('Movie data for episode check:', {
        hasSeriesId: !!movie.seriesId,
        seriesId: movie.seriesId,
        hasSeason: !!movie.season,
        season: movie.season,
        movie: movie
      });

      // Build and persist episode context (works even if explicit series metadata is missing)
      // If this is NOT an episode (returns false), clear any existing episode context
      const isEpisode = this.storeEpisodeContextFromVideoId(videoId);
      if (!isEpisode) {
        // This is a movie, not an episode - clear episode context to ensure default sections show
        try {
          sessionStorage.removeItem('watch_episode_context');
          console.log('Cleared episode context - this is a movie, not an episode');
        } catch (_) {}
      }

      // Navigate to watch page with video ID (reduced delay from 100ms to 0ms for faster navigation)
      if (typeof window.navigateToWatchPage === 'function') {
        window.navigateToWatchPage(videoId, title);
      } else {
        // Fallback: construct URL directly
        window.location.href = `/watch/?id=${encodeURIComponent(videoId)}`;
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

  // Initialize search when DOM is loaded and videoData is ready
  // Use a more robust initialization that works on both home and watch pages
  if (typeof document !== 'undefined') {
    let searchInstance = null;
    
    function initializeSearch() {
      // Check if videoData is available (required for search to work)
      const videoData = (typeof window !== 'undefined' && window.videoData) || (typeof videoData !== 'undefined' ? videoData : null);
      
      if (!videoData) {
        // If videoData not ready yet, wait a bit and try again (especially important for watch page)
        setTimeout(initializeSearch, 50);
        return;
      }
      
      // Only create one instance
      if (!searchInstance) {
        searchInstance = new NerflixSearch();
        
        // Also reinitialize after a short delay to catch any dynamically added search inputs
        setTimeout(() => {
          if (searchInstance && typeof searchInstance.reinitializeSearch === 'function') {
            searchInstance.reinitializeSearch();
          }
        }, 100);
      } else {
        // If instance exists, just reinitialize to catch new inputs
        if (typeof searchInstance.reinitializeSearch === 'function') {
          searchInstance.reinitializeSearch();
        }
      }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        if (typeof jQuery !== 'undefined') {
          jQuery(document).ready(function () {
            // Reduced delay for faster initialization
            setTimeout(initializeSearch, 50);
          });
        } else {
          setTimeout(initializeSearch, 50);
        }
      });
    } else {
      // DOM already loaded, initialize immediately
      if (typeof jQuery !== 'undefined') {
        jQuery(document).ready(function () {
          setTimeout(initializeSearch, 50);
        });
      } else {
        setTimeout(initializeSearch, 50);
      }
    }
    
    // Also reinitialize periodically to catch videoData when it becomes available (for watch page)
    // This ensures search works even if videoData loads after page initialization
    let retryCount = 0;
    const maxRetries = 20; // Try for up to 1 second (20 * 50ms)
    const retryInterval = setInterval(() => {
      const videoData = (typeof window !== 'undefined' && window.videoData) || (typeof videoData !== 'undefined' ? videoData : null);
      if (videoData && searchInstance) {
        // videoData is now available, ensure search is properly initialized
        if (typeof searchInstance.reinitializeSearch === 'function') {
          searchInstance.reinitializeSearch();
        }
        clearInterval(retryInterval);
      }
      retryCount++;
      if (retryCount >= maxRetries) {
        clearInterval(retryInterval);
      }
    }, 50);
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

// ============================================================================
// WATCH PAGE FUNCTIONALITY
// ============================================================================
// This section handles the standalone watch page (/watch/index.html)
// It reads video ID from URL parameters and dynamically loads video content
// ============================================================================

(function() {
    'use strict';
    
    // Check if we're on the watch page
    function isWatchPage() {
        return window.location.pathname.includes('/watch/') || 
               window.location.pathname === '/watch' ||
               document.getElementById('video-gallery-overlay') !== null && 
               document.getElementById('backButton') !== null;
    }
    
    // Wait for DOM and videoData to be available
    if (isWatchPage()) {
        // Initially hide default sections until we know what type of content it is
        document.addEventListener('DOMContentLoaded', function() {
            // Hide default sections initially
            const defaultSections = document.querySelectorAll('.video-gallery-default-section');
            defaultSections.forEach(section => {
                if (section) {
                    section.style.display = 'none';
                    section.style.visibility = 'hidden';
                }
            });
            
            // Wait a bit for main.js to load videoData (reduced from 100ms to 50ms for faster initialization)
            setTimeout(initializeWatchPage, 50);
        });
    }
    
    /**
     * Initialize the watch page
     * Reads video ID from URL and loads the video
     */
    function initializeWatchPage() {
        // Get slug or video ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const slugParam = urlParams.get('slug');
        const idParam = urlParams.get('id');
        
        // Access videoData and slug map from the global scope (loaded from main.js)
        const videoData = window.videoData;
        const slugMap = window.slugToVideoIdMap || {};
        
        if (!videoData) {
            console.error('videoData not available. Make sure main.js is loaded.');
            showWatchPageError('Video data not available. Please refresh the page.');
            return;
        }
        
        let videoId = null;
        let usedSlug = null;
        
        // Prefer slug if present
        if (slugParam) {
            if (slugMap[slugParam] && videoData[slugMap[slugParam]]) {
                videoId = slugMap[slugParam];
                usedSlug = slugParam;
            } else {
                console.error('No movie found for slug:', slugParam);
                showWatchPageError('Movie not found. Please select a valid movie.');
                return;
            }
        } else if (idParam) {
            videoId = idParam;
        }
        
        if (!videoId) {
            console.error('No slug or video ID provided in URL');
            showWatchPageError('Movie not found. Please select a valid movie.');
            return;
        }
        
        console.log('Loading video with ID:', videoId, 'slug:', usedSlug);
        
        // Find video data by ID or link
        let videoInfo = findWatchPageVideoData(videoId, videoData);
        
        // Fallback: if not in videoData, try sessionStorage episode context (for series defined only in HTML)
        if (!videoInfo) {
            const ctx = readEpisodeContextFromSession();
            if (ctx && Array.isArray(ctx.episodes)) {
                const match = ctx.episodes.find(ep => String(ep.id) === String(videoId));
                if (match) {
                    const derivedData = {
                        title: match.title || 'Episode',
                        description: match.description || '',
                        duration: match.duration || '',
                        age: '16+',
                        year: '',
                        stars: 4,
                        rating: 7.0,
                        genres: ['Drama'],
                        interpreter: ['English'],
                        tags: ['Episode'],
                        image: match.image || '/images/placeholder.jpg',
                        videoLink: `https://videopress.com/embed/${videoId}`,
                        downloadLink: null,
                        seriesId: ctx.seriesTitle || 'series',
                        season: ctx.season || '',
                        episodeNumber: match.episodeNumber || ''
                    };
                    videoInfo = { id: videoId, data: derivedData };
                }
            }
        }
        
        if (!videoInfo) {
            console.error('Video not found for ID:', videoId);
            showWatchPageError('Video not found. Please select a valid video.');
            return;
        }
        
        // Load the video
        loadWatchPageVideo(videoInfo.data, videoInfo.id, videoData, usedSlug || (videoInfo.data && videoInfo.data.slug));
    }
    
    /**
     * Find video data by ID or link
     * @param {string} identifier - Video ID or video link
     * @param {object} videoData - The videoData object
     * @returns {object|null} - Video data and ID, or null if not found
     */
    function findWatchPageVideoData(identifier, videoData) {
        if (!identifier || !videoData) return null;
        
        // If identifier is a full URL, extract ID or find by videoLink
        if (identifier.startsWith('http://') || identifier.startsWith('https://')) {
            // Try to find by videoLink property
            for (const [id, data] of Object.entries(videoData)) {
                if (data && data.videoLink === identifier) {
                    return { id: id, data: data };
                }
            }
            
            // Extract ID from VideoPress URL (e.g., https://videopress.com/embed/kUJmAcSf)
            const match = identifier.match(/embed\/([a-zA-Z0-9_-]+)/);
            if (match && videoData[match[1]]) {
                return { id: match[1], data: videoData[match[1]] };
            }
        } else {
            // Direct ID lookup
            if (videoData[identifier]) {
                return { id: identifier, data: videoData[identifier] };
            }
        }
        
        return null;
    }
    
    /**
     * Load video and update the page
     * @param {object} data - Video data object
     * @param {string} videoId - Video ID
     * @param {object} videoData - Full videoData object for recommendations
     * @param {string} [slug] - Optional slug used for this video (for canonical URL)
     */
    function loadWatchPageVideo(data, videoId, videoData, slug) {
        console.log('Loading video:', data.title);
        
        // Update video iframe using the same function as gallery overlay for consistency
        // Use requestIdleCallback for better performance if available
        const loadVideo = function() {
            if (data.videoLink) {
                // Use the existing setGalleryVideoByLink function if available
                // Pass videoId (the key) not videoLink (the URL)
                if (typeof window.setGalleryVideoByLink === 'function') {
                    window.setGalleryVideoByLink(videoId);
                } else if (typeof setGalleryVideoByLink === 'function') {
                    setGalleryVideoByLink(videoId);
                } else {
                    // Fallback: direct iframe update with VideoPress handling
                    const iframe = document.getElementById('video-iframe');
                    if (iframe) {
                        let embedUrl = data.videoLink;
                        if (data.videoLink.includes('videopress.com/v/')) {
                            embedUrl = data.videoLink.replace('/v/', '/embed/');
                        } else if (!data.videoLink.includes('/embed/') && !data.videoLink.includes('videopress.com')) {
                            const match = data.videoLink.match(/videopress\.com\/v\/([a-zA-Z0-9]+)/);
                            if (match) {
                                embedUrl = `https://videopress.com/embed/${match[1]}`;
                            } else {
                                embedUrl = `https://videopress.com/embed/${data.videoLink}`;
                            }
                        }
                        if (!embedUrl.includes('autoplay')) {
                            embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
                        }
                        // Use loading="eager" when video is selected to load immediately
                        iframe.removeAttribute('loading');
                        iframe.src = embedUrl;
                    }
                }
            }
        };
        
        // Load video asynchronously for better performance
        if (window.requestIdleCallback) {
            requestIdleCallback(loadVideo, { timeout: 1000 });
        } else {
            setTimeout(loadVideo, 0);
        }
        
        // Update titles
        const titleElement = document.getElementById('video-title');
        if (titleElement) {
            titleElement.textContent = data.title || 'Untitled';
        }
        // Also update the main watch page heading, if present
        const pageTitleElement = document.getElementById('movie-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = data.title || 'Untitled';
        }
        
        // Update document title to include movie title in a consistent format
        if (data.title) {
            document.title = `${data.title} - MiyagiFilms | Watch HD Online`;
        }

        // Update canonical URL to use slug when available (slug URLs are canonical)
        (function updateCanonicalLink() {
            const head = document.head || document.getElementsByTagName('head')[0];
            if (!head) return;

            let canonical = head.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                head.appendChild(canonical);
            }

            const origin = window.location.origin || 'https://miyagifilms.com';
            const finalSlug = slug || data.slug || null;

            if (finalSlug) {
                canonical.href = `${origin}/watch/?slug=${encodeURIComponent(finalSlug)}`;
            } else {
                // Fallback: keep id-based canonical if no slug is available
                canonical.href = `${origin}/watch/?id=${encodeURIComponent(videoId)}`;
            }
        })();
        
        // Update description
        const descElement = document.getElementById('video-description');
        if (descElement) {
            descElement.textContent = data.description || 'No description available.';
        }
        
        // Update rating
        updateWatchPageRating(data.rating, data.stars);
        
        // Update movie details (age, duration, year)
        updateWatchPageMovieDetails(data);
        
        // Update genres
        updateWatchPageGenres(data.genres);
        
        // Update tags
        updateWatchPageTags(data.tags);
        
        // Update interpreter
        updateWatchPageInterpreter(data.interpreter);

        // Update actors
        // Prefer explicit `actors`, but also accept `actor` / `cast` for backward compatibility.
        updateWatchPageActors(
            Array.isArray(data.actors) ? data.actors :
            (Array.isArray(data.actor) ? data.actor :
             (Array.isArray(data.cast) ? data.cast : []))
        );
        
        // Update download button (fallback to stream URL when no explicit download URL is set)
        updateWatchPageDownloadButton(data.downloadLink || data.r2Download || data.videoLink || data.r2Video);
        
        // Decide whether this is an EPISODE:
        // - Prefer sessionStorage context captured from `.episodes-contens` (works for all series/seasons)
        // - Also check for context from search results (fromSearch: true) - ALWAYS use if present
        // - Fallback to explicit episode metadata in videoData (seriesId/season)
        const episodeCtx = readEpisodeContextFromSession();
        console.log('Episode context check:', {
            hasContext: !!episodeCtx,
            fromSearch: episodeCtx?.fromSearch,
            episodesCount: episodeCtx?.episodes?.length,
            currentVideoId: episodeCtx?.currentVideoId,
            videoId: videoId,
            dataSeriesId: data.seriesId,
            dataSeason: data.season
        });
        
        const ctxHasCurrent = episodeCtx && Array.isArray(episodeCtx.episodes) &&
            episodeCtx.episodes.some(ep => String(ep.id) === String(videoId));
        
        // CRITICAL: If we have context from search with episodes, check if current video is actually in the episodes list
        // This ensures search results for movies don't show episodes section
        const hasSearchContext = episodeCtx && episodeCtx.fromSearch && 
            Array.isArray(episodeCtx.episodes) && episodeCtx.episodes.length > 0;
        
        // If context is from search, only use it if the current videoId is actually in the episodes list
        // This prevents movies from search results from showing episodes section
        const ctxFromSearch = hasSearchContext && 
            (String(episodeCtx.currentVideoId) === String(videoId) || 
             ctxHasCurrent || 
             episodeCtx.episodes.some(ep => String(ep.id) === String(videoId)));
        
        // Only treat as episode if:
        // 1. Current video is in the episode context list (ctxHasCurrent), OR
        // 2. Context is from search AND current video matches (ctxFromSearch), OR
        // 3. Video data has explicit seriesId and season (data.seriesId && data.season)
        // Note: hasSearchContext alone is not enough - the video must actually be in the episodes list
        const isEpisode = !!ctxHasCurrent || !!ctxFromSearch || !!(data.seriesId && data.season);
        
        console.log('Episode detection result:', {
            isEpisode: isEpisode,
            ctxHasCurrent: ctxHasCurrent,
            ctxFromSearch: ctxFromSearch,
            hasSearchContext: hasSearchContext,
            willUseContext: !!(ctxHasCurrent || ctxFromSearch || hasSearchContext)
        });
        
        if (isEpisode) {
            // CRITICAL: For episodes, hide default sections FIRST and ensure they stay hidden
            hideDefaultSections();
            hideEpisodesSection(); // Clear any previous episode content
            
            // Priority: Use context if available (from button click or search result)
            // Only use search context if the current video is actually in the episodes list
            if (ctxHasCurrent || ctxFromSearch) {
                console.log('Using episode context to show episodes section');
                // Use context from button click or search result
                showEpisodesSectionFromContext(episodeCtx, videoId);
            } else {
                console.log('Using fallback method to show episodes section');
                // Fallback: old 방식 (requires seriesId/season in videoData)
                showEpisodesSection(data, videoData, videoId);
            }
            
            // Double-check default sections are hidden after showing episodes (reduced from 100ms to 50ms)
            setTimeout(function() {
                hideDefaultSections();
            }, 50);
            setTimeout(function() {
                hideDefaultSections();
            }, 200);
            setTimeout(function() {
                hideDefaultSections();
            }, 500);
        } else {
            // CRITICAL: For movies (non-episodes), clear episode context and show defaults
            // Clear episode context from sessionStorage since this is not an episode
            try {
                sessionStorage.removeItem('watch_episode_context');
            } catch (_) {}
            
            // Hide episodes section FIRST and ensure it stays hidden
            hideEpisodesSection();
            showDefaultSections();
            loadWatchPageRecommendedVideos(videoData, videoId);
            
            // Double-check episodes section is hidden after showing default sections (reduced from 100ms to 50ms)
            setTimeout(function() {
                hideEpisodesSection();
            }, 50);
        }
        
        // Update page title with SEO format
        const movieTitle = data.title || 'Video';
        document.title = movieTitle + ' - Miyagifilms | Watch Movies & TV Shows Online | HD Streaming';
        
        // Update meta description for SEO
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = `Watch ${movieTitle} in HD on Miyagifilms. Stream movies and TV shows online for free.`;
        }
        
        // Update Open Graph tags for better social sharing
        updateOGTags(movieTitle, data.description || 'Watch HD movies and TV shows on Miyagifilms');
    }
    
    /**
     * Hide default sections (for movies)
     */
    function hideDefaultSections() {
        // Hide ALL default sections (You May Also Like, Recommended, etc.)
        const defaultSections = document.querySelectorAll('.video-gallery-default-section');
        defaultSections.forEach(section => {
            if (section) {
                // Use !important via setProperty to override any CSS
                section.style.setProperty('display', 'none', 'important');
                section.style.setProperty('visibility', 'hidden', 'important');
                section.style.setProperty('opacity', '0', 'important');
                section.style.setProperty('height', '0', 'important');
                section.style.setProperty('overflow', 'hidden', 'important');
                section.style.setProperty('margin', '0', 'important');
                section.style.setProperty('padding', '0', 'important');
                // Add a class to mark as hidden
                section.classList.add('episode-mode-hidden');
            }
        });
        
        // Also hide any carousels inside default sections
        const defaultCarousels = document.querySelectorAll('.video-gallery-default-section .episodes-slider1');
        defaultCarousels.forEach(carousel => {
            if (carousel) {
                carousel.style.setProperty('display', 'none', 'important');
            }
        });
        
        // Hide any items inside default sections
        const defaultItems = document.querySelectorAll('.video-gallery-default-section .e-item');
        defaultItems.forEach(item => {
            if (item) {
                item.style.setProperty('display', 'none', 'important');
            }
        });
    }
    
    /**
     * Show default sections (for movies)
     */
    function showDefaultSections() {
        // Stop the episode mode observer if it's running
        if (window.episodeModeObserver) {
            window.episodeModeObserver.disconnect();
            window.episodeModeObserver = null;
        }
        
        // CRITICAL: First, ensure episodes section is completely hidden
        hideEpisodesSection();
        
        // Then show ONLY default sections
        const defaultSections = document.querySelectorAll('.video-gallery-default-section');
        defaultSections.forEach(section => {
            if (section) {
                // Remove hidden class
                section.classList.remove('episode-mode-hidden');
                // Use !important via setProperty to override any CSS
                section.style.setProperty('display', 'block', 'important');
                section.style.setProperty('visibility', 'visible', 'important');
                section.style.setProperty('opacity', '1', 'important');
                section.style.setProperty('height', 'auto', 'important');
                section.style.setProperty('overflow', 'visible', 'important');
                section.style.removeProperty('margin');
                section.style.removeProperty('padding');
            }
        });
        
        // Show carousels inside default sections
        const defaultCarousels = document.querySelectorAll('.video-gallery-default-section .episodes-slider1');
        defaultCarousels.forEach(carousel => {
            if (carousel) {
                carousel.style.setProperty('display', 'block', 'important');
            }
        });
        
        // Show items inside default sections
        const defaultItems = document.querySelectorAll('.video-gallery-default-section .e-item');
        defaultItems.forEach(item => {
            if (item) {
                item.style.removeProperty('display');
            }
        });
        
        // Initialize like system for all items in default sections (so count boxes are visible globally)
        if (typeof window.likeSystem !== 'undefined' && window.likeSystem.updateAllItemsUI) {
            setTimeout(function() {
                window.likeSystem.updateAllItemsUI();
            }, 100);
        }
    }

    /**
     * Read episode context stored before navigation (from index.html series episodes carousels or search)
     */
    function readEpisodeContextFromSession() {
        try {
            const raw = sessionStorage.getItem('watch_episode_context');
            if (!raw) {
                console.log('No episode context found in sessionStorage');
                return null;
            }
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') {
                console.log('Invalid episode context format');
                return null;
            }
            if (!Array.isArray(parsed.episodes)) parsed.episodes = [];
            console.log('Read episode context from sessionStorage:', {
                seriesTitle: parsed.seriesTitle,
                season: parsed.season,
                currentVideoId: parsed.currentVideoId,
                fromSearch: parsed.fromSearch,
                episodesCount: parsed.episodes.length
            });
            return parsed;
        } catch (error) {
            console.error('Error reading episode context from sessionStorage:', error);
            return null;
        }
    }
    
    /**
     * Hide episodes section
     */
    function hideEpisodesSection() {
        const episodesSection = document.getElementById('video-episodes-gallery');
        if (episodesSection) {
            episodesSection.style.display = 'none';
            episodesSection.style.visibility = 'hidden';
            // Clear content to prevent stale data
            episodesSection.innerHTML = '';
        }
    }

    /**
     * Show episodes section using sessionStorage context (seriesTitle/season + list of episodes)
     * @param {object} ctx - stored episode context
     * @param {string} currentVideoId - current episode id
     */
    function showEpisodesSectionFromContext(ctx, currentVideoId) {
        const episodesSection = document.getElementById('video-episodes-gallery');
        if (!episodesSection || !ctx) return;

        // CRITICAL: Hide ALL default sections first (multiple times to ensure)
        hideDefaultSections();
        
        // Then show ONLY episodes section
        episodesSection.style.setProperty('display', 'block', 'important');
        episodesSection.style.setProperty('visibility', 'visible', 'important');
        episodesSection.style.setProperty('opacity', '1', 'important');
        episodesSection.style.setProperty('height', 'auto', 'important');
        
        // Force hide default sections again after short delays to ensure they stay hidden
        setTimeout(function() {
            hideDefaultSections();
        }, 50);
        setTimeout(function() {
            hideDefaultSections();
        }, 200);
        setTimeout(function() {
            hideDefaultSections();
        }, 500);
        
        // Set up a MutationObserver to keep default sections hidden
        if (!window.episodeModeObserver) {
            window.episodeModeObserver = new MutationObserver(function(mutations) {
                const defaultSections = document.querySelectorAll('.video-gallery-default-section');
                defaultSections.forEach(section => {
                    if (section && !section.classList.contains('episode-mode-hidden')) {
                        hideDefaultSections();
                    }
                });
            });
        }
        
        // Start observing if episodes section is visible
        if (episodesSection.style.display !== 'none') {
            const targetNode = document.querySelector('.video-gallery-content');
            if (targetNode && window.episodeModeObserver) {
                window.episodeModeObserver.observe(targetNode, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            }
        }

        const season = ctx.season || '1';
        const seriesTitle = ctx.seriesTitle || 'Series';
        const allEpisodes = ctx.episodes || [];
        
        console.log('showEpisodesSectionFromContext called:', {
            season: season,
            seriesTitle: seriesTitle,
            allEpisodesCount: allEpisodes.length,
            currentVideoId: currentVideoId,
            fromSearch: ctx.fromSearch
        });
        
        // Filter out the current episode from the list (show only next episodes)
        // Use lenient matching - compare both as strings and handle URL encoding
        const normalizedCurrentId = String(currentVideoId).trim();
        const episodes = allEpisodes.filter(ep => {
            const normalizedEpId = String(ep.id).trim();
            // Include episode only if IDs don't match (checking both encoded and decoded versions)
            const idsMatch = normalizedEpId === normalizedCurrentId || 
                            decodeURIComponent(normalizedEpId) === decodeURIComponent(normalizedCurrentId) ||
                            normalizedEpId === decodeURIComponent(normalizedCurrentId) ||
                            decodeURIComponent(normalizedEpId) === normalizedCurrentId;
            return !idsMatch;
        });
        
        console.log('Filtered episodes (excluding current):', episodes.length);

        // Render a carousel using the same markup style as recommendations
        episodesSection.innerHTML = '';

        const heading = document.createElement('h3');
        heading.className = 'text-white mb-3';
        heading.textContent = 'Next Episodes';
        episodesSection.appendChild(heading);

        if (!episodes.length) {
            const empty = document.createElement('p');
            empty.className = 'text-white-50';
            empty.textContent = 'No other episodes available for this season.';
            episodesSection.appendChild(empty);
            return;
        }

        const carousel = document.createElement('div');
        carousel.className = 'owl-carousel owl-theme episodes-slider1 list-inline p-0 m-0';
        if (season) carousel.setAttribute('data-season', season);

        episodes.forEach((ep, index) => {
            // Use the exact title from home page (no reformatting)
            const episodeTitle = ep.title || '';
            
            const item = document.createElement('div');
            item.className = 'e-item';
            if (season) item.setAttribute('data-season', season);
            
            item.innerHTML = `
                <div class="block-image position-relative">
                    <a href="/watch/?id=${encodeURIComponent(ep.id)}">
                        <img loading="lazy" src="${ep.image || '/images/placeholder.jpg'}" class="img-fluid" alt="${episodeTitle.replace(/"/g, '&quot;')}">
                    </a>
                    <div class="episode-play-info">
                        <div class="episode-play">
                            <a href="/watch/?id=${encodeURIComponent(ep.id)}" class="iq-button" data-video-id="${String(ep.id).replace(/"/g, '&quot;')}" data-title="${episodeTitle.replace(/"/g, '&quot;')}" tabindex="0">
                                <i class="fa fa-play"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="episodes-description text-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <a href="/watch/?id=${encodeURIComponent(ep.id)}">${episodeTitle}</a>
                        <span class="text-primary">${ep.duration || '-'}</span>
                    </div>
                    <p class="mb-0">${(ep.description || '').substring(0, 60)}${(ep.description || '').length > 60 ? '...' : ''}</p>
                </div>
            `;
            carousel.appendChild(item);
        });

        episodesSection.appendChild(carousel);

        // Initialize carousel if available
        if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
            setTimeout(function() {
                jQuery(carousel).owlCarousel({
                    loop: episodes.length > 4,
                    margin: 20,
                    nav: true,
                    navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
                    dots: false,
                    autoplay: false,
                    responsive: {
                        0: { items: 2 },
                        576: { items: 3 },
                        768: { items: 4 },
                        992: { items: 4 },
                        1200: { items: 4 }
                    }
                });
            }, 50);
        }
    }
    
    /**
     * Show episodes section and populate with episodes from the same season
     * @param {object} currentEpisodeData - Current episode data
     * @param {object} videoData - Full videoData object
     * @param {string} currentVideoId - Current video ID
     */
    function showEpisodesSection(currentEpisodeData, videoData, currentVideoId) {
        const episodesSection = document.getElementById('video-episodes-gallery');
        if (!episodesSection) return;
        
        // CRITICAL: Hide ALL default sections first (multiple times to ensure)
        hideDefaultSections();
        
        // Then show ONLY episodes section
        episodesSection.style.setProperty('display', 'block', 'important');
        episodesSection.style.setProperty('visibility', 'visible', 'important');
        episodesSection.style.setProperty('opacity', '1', 'important');
        episodesSection.style.setProperty('height', 'auto', 'important');
        
        // Force hide default sections again after short delays to ensure they stay hidden
        setTimeout(function() {
            hideDefaultSections();
        }, 50);
        setTimeout(function() {
            hideDefaultSections();
        }, 200);
        setTimeout(function() {
            hideDefaultSections();
        }, 500);
        
        // Set up a MutationObserver to keep default sections hidden
        if (!window.episodeModeObserver) {
            window.episodeModeObserver = new MutationObserver(function(mutations) {
                const defaultSections = document.querySelectorAll('.video-gallery-default-section');
                defaultSections.forEach(section => {
                    if (section && !section.classList.contains('episode-mode-hidden')) {
                        hideDefaultSections();
                    }
                });
            });
        }
        
        // Start observing if episodes section is visible
        if (episodesSection.style.display !== 'none') {
            const targetNode = document.querySelector('.video-gallery-content');
            if (targetNode && window.episodeModeObserver) {
                window.episodeModeObserver.observe(targetNode, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            }
        }
        
        // Find all episodes from the same series and season
        const seriesId = currentEpisodeData.seriesId;
        const season = currentEpisodeData.season || '1';
        const sameSeasonEpisodes = [];
        
        for (const [id, data] of Object.entries(videoData)) {
            if (data && 
                data.seriesId === seriesId && 
                data.season === season && 
                id !== currentVideoId) {
                sameSeasonEpisodes.push({ id: id, data: data });
            }
        }
        
        // Sort episodes by episode number if available
        sameSeasonEpisodes.sort((a, b) => {
            const epA = a.data.episodeNumber || 0;
            const epB = b.data.episodeNumber || 0;
            return epA - epB;
        });
        
        // Render episodes carousel
        renderWatchPageEpisodesCarousel(episodesSection, sameSeasonEpisodes, seriesId, season);
    }
    
    /**
     * Render episodes carousel for a specific season
     * @param {HTMLElement} container - Container element
     * @param {array} episodes - Array of episode objects
     * @param {string} seriesId - Series ID
     * @param {string|number} season - Season number
     */
    function renderWatchPageEpisodesCarousel(container, episodes, seriesId, season) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        if (episodes.length === 0) {
            container.innerHTML = '<p class="text-white-50">No other episodes available for this season.</p>';
            return;
        }
        
        // Create heading
        const heading = document.createElement('h3');
        heading.className = 'text-white mb-3';
        heading.textContent = 'Next Episodes';
        container.appendChild(heading);
        
        // Create carousel container
        const carousel = document.createElement('div');
        carousel.className = 'owl-carousel owl-theme episodes-slider1 list-inline p-0 m-0';
        carousel.setAttribute('data-season', season);
        
        // Render episode items
        episodes.forEach((episode, index) => {
            const item = document.createElement('div');
            item.className = 'e-item';
            item.setAttribute('data-season', season);
            item.setAttribute('data-episode', episode.data.episodeNumber || '');
            
            const videoLink = episode.data.videoLink || `https://videopress.com/embed/${episode.id}`;
            const videoId = episode.id;
            // Use the exact title from videoData (should match home page)
            const episodeTitle = episode.data.title || 'Episode';
            
            item.innerHTML = `
                <div class="block-image position-relative">
                    <a href="/watch/?id=${videoId}">
                        <img loading="lazy" src="${episode.data.image || '/images/placeholder.jpg'}" class="img-fluid" alt="${episodeTitle.replace(/"/g, '&quot;')}">
                    </a>
                    <div class="episode-play-info">
                        <div class="episode-play">
                            <a href="/watch/?id=${videoId}" class="iq-button" data-video-id="${videoId}" data-title="${episodeTitle.replace(/"/g, '&quot;')}" tabindex="0">
                                <i class="fa fa-play"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="episodes-description text-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <a href="/watch/?id=${videoId}">${episodeTitle}</a>
                        <span class="text-primary">${episode.data.duration || '-'}</span>
                    </div>
                    <p class="mb-0">${(episode.data.description || '').substring(0, 60)}${(episode.data.description || '').length > 60 ? '...' : ''}</p>
                </div>
            `;
            
            carousel.appendChild(item);
        });
        
        container.appendChild(carousel);
        
        // Initialize carousel if jQuery and Owl Carousel are available
        if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
            setTimeout(function() {
                jQuery(carousel).owlCarousel({
                    loop: episodes.length > 4,
                    margin: 20,
                    nav: true,
                    navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
                    dots: false,
                    autoplay: false,
                    responsive: {
                        0: { items: 2 },
                        576: { items: 3 },
                        768: { items: 4 },
                        992: { items: 4 },
                        1200: { items: 4 }
                    }
                });
            }, 100);
        }
    }
    
    /**
     * Update Open Graph and Twitter Card meta tags for SEO
     * @param {string} title - Page title
     * @param {string} description - Page description
     */
    function updateOGTags(title, description) {
        // Open Graph tags
        setMetaTag('property', 'og:title', title);
        setMetaTag('property', 'og:description', description);
        setMetaTag('property', 'og:type', 'video.movie');
        setMetaTag('property', 'og:url', window.location.href);
        setMetaTag('property', 'og:site_name', 'Miyagifilms');
        
        // Twitter Card tags
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:title', title);
        setMetaTag('name', 'twitter:description', description);
    }
    
    /**
     * Helper function to set or update meta tags
     * @param {string} attr - Attribute name ('property' or 'name')
     * @param {string} value - Attribute value
     * @param {string} content - Meta tag content
     */
    function setMetaTag(attr, value, content) {
        let meta = document.querySelector(`meta[${attr}="${value}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attr, value);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }
    
    /**
     * Update rating stars and text
     * @param {number} rating - Rating out of 10
     * @param {number} stars - Star rating (0-5)
     */
    function updateWatchPageRating(rating, stars) {
        const ratingElement = document.getElementById('rating-stars');
        if (!ratingElement) return;
        
        // Clear existing stars
        ratingElement.innerHTML = '';
        
        // Calculate stars
        const fullStars = Math.floor(stars || (rating ? rating / 2 : 0));
        const hasHalfStar = (stars || (rating ? rating / 2 : 0)) % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            const star = document.createElement('i');
            star.className = 'fa fa-star text-primary';
            ratingElement.appendChild(star);
        }
        
        // Add half star if needed
        if (hasHalfStar) {
            const halfStar = document.createElement('i');
            halfStar.className = 'fa fa-star-half text-primary';
            ratingElement.appendChild(halfStar);
        }
        
        // Add empty stars
        for (let i = 0; i < emptyStars; i++) {
            const star = document.createElement('i');
            star.className = 'fa fa-star';
            star.style.color = '#666';
            ratingElement.appendChild(star);
        }
        
        // Add rating text
        const ratingText = document.createElement('span');
        ratingText.className = 'ml-2';
        ratingText.textContent = (rating || 0).toFixed(1) + '/10';
        ratingElement.appendChild(ratingText);
    }
    
    /**
     * Update movie details (age, duration, year)
     * @param {object} data - Video data
     */
    function updateWatchPageMovieDetails(data) {
        const ageElement = document.getElementById('age-badge');
        if (ageElement) {
            ageElement.textContent = data.age || '-';
        }
        
        const durationElement = document.getElementById('duration-text');
        if (durationElement) {
            durationElement.textContent = data.duration || '-';
        }
        
        const yearElement = document.getElementById('year-text');
        if (yearElement) {
            yearElement.textContent = data.year || '-';
        }
    }
    
    /**
     * Update genres list
     * @param {array} genres - Array of genre strings
     */
    function updateWatchPageGenres(genres) {
        const genresElement = document.getElementById('genres-list');
        if (!genresElement) return;
        
        genresElement.innerHTML = '';
        
        if (Array.isArray(genres) && genres.length > 0) {
            genres.forEach(genre => {
                const tag = document.createElement('span');
                tag.className = 'genre-tag';
                tag.textContent = genre;
                genresElement.appendChild(tag);
            });
        } else {
            const tag = document.createElement('span');
            tag.className = 'genre-tag';
            tag.textContent = 'Not specified';
            genresElement.appendChild(tag);
        }
    }
    
    /**
     * Update tags list
     * @param {array} tags - Array of tag strings
     */
    function updateWatchPageTags(tags) {
        const tagsElement = document.getElementById('tags-list');
        if (!tagsElement) return;
        
        tagsElement.innerHTML = '';
        
        if (Array.isArray(tags) && tags.length > 0) {
            tags.forEach(tag => {
                const tagItem = document.createElement('span');
                tagItem.className = 'tag-item';
                tagItem.textContent = tag;
                tagsElement.appendChild(tagItem);
            });
        } else {
            const tagItem = document.createElement('span');
            tagItem.className = 'tag-item';
            tagItem.textContent = 'Not specified';
            tagsElement.appendChild(tagItem);
        }
    }
    
    /**
     * Update interpreter list
     * @param {array} interpreter - Array of interpreter strings
     */
    function updateWatchPageInterpreter(interpreter) {
        const interpreterElement = document.getElementById('interpreter-list');
        if (!interpreterElement) return;
        
        interpreterElement.innerHTML = '';
        
        if (Array.isArray(interpreter) && interpreter.length > 0) {
            interpreter.forEach(interp => {
                const tag = document.createElement('span');
                tag.className = 'tag-item';
                tag.textContent = interp;
                interpreterElement.appendChild(tag);
            });
        } else {
            const tag = document.createElement('span');
            tag.className = 'tag-item';
            tag.textContent = 'Not specified';
            interpreterElement.appendChild(tag);
        }
    }

    /**
     * Update actors list
     * @param {array} actors - Array of actor strings
     */
    function updateWatchPageActors(actors) {
        const actorsElement = document.getElementById('actors-list');
        if (!actorsElement) return;

        actorsElement.innerHTML = '';

        if (Array.isArray(actors) && actors.length > 0) {
            actors.forEach(name => {
                const tag = document.createElement('span');
                // Use same visual style as genres
                tag.className = 'genre-tag';
                tag.textContent = name;
                actorsElement.appendChild(tag);
            });
        } else {
            const tag = document.createElement('span');
            tag.className = 'genre-tag';
            tag.textContent = 'Not specified';
            actorsElement.appendChild(tag);
        }
    }
    
    /**
     * Update download button with link
     * @param {string} downloadLink - Download URL
     */
    function updateWatchPageDownloadButton(downloadLink) {
        const downloadBtn = document.getElementById('download-btn') || document.querySelector('.video-actions .btn-download');
        if (!downloadBtn) return;
        
        if (downloadLink) {
            downloadBtn.onclick = function(e) {
                e.preventDefault();
                const videoTitle = document.getElementById('video-title') ? document.getElementById('video-title').textContent : 'video';
                const safeTitle = sanitizeFilename(videoTitle) + '.mp4';
                triggerImmediateDownload(downloadLink, safeTitle);
            };
            downloadBtn.setAttribute('data-download-href', downloadLink);
            downloadBtn.style.display = '';
            downloadBtn.style.cursor = 'pointer';
        } else {
            downloadBtn.onclick = function(e) {
                e.preventDefault();
                alert('Download link not available for this video.');
            };
            downloadBtn.removeAttribute('data-download-href');
        }
    }
    
    /**
     * Load recommended videos carousel
     * @param {object} videoData - Full videoData object
     * @param {string} currentVideoId - Current video ID to exclude
     */
    function loadWatchPageRecommendedVideos(videoData, currentVideoId) {
        // Get all videos except current one
        const recommendedVideos = [];
        for (const [id, data] of Object.entries(videoData)) {
            if (id !== currentVideoId && data) {
                recommendedVideos.push({ id: id, data: data });
            }
        }
        
        // Shuffle and take first 10
        const shuffled = recommendedVideos.sort(() => 0.5 - Math.random());
        const topPicks = shuffled.slice(0, 10);
        
        // Render top picks
        renderWatchPageVideoCarousel('top-picks-carousel', topPicks);
        
        // Render recommended (different set)
        const recommended = shuffled.slice(10, 20);
        if (recommended.length === 0) {
            recommended.push(...topPicks.slice(0, 5));
        }
        renderWatchPageVideoCarousel('recommended-carousel', recommended);
        
        // Initialize carousels if jQuery and Owl Carousel are available
        if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
            setTimeout(function() {
                jQuery('.episodes-slider1').owlCarousel({
                    loop: true,
                    margin: 20,
                    nav: true,
                    dots: false,
                    autoplay: false,
                    responsive: {
                        0: { items: 2 },
                        576: { items: 3 },
                        768: { items: 4 },
                        992: { items: 5 },
                        1200: { items: 6 }
                    }
                });
            }, 100);
        }
    }

    // If the user clicks an episode inside the watch page "Next Episodes" section,
    // keep the same sessionStorage context so the next page load still knows it's a series.
    if (isWatchPage()) {
        document.addEventListener('click', function(e) {
            try {
                const btn = e.target.closest('#video-episodes-gallery .iq-button[data-video-id]');
                if (!btn) return;
                const nextId = btn.getAttribute('data-video-id');
                if (!nextId) return;
                
                // Get current episode context
                let ctx = readEpisodeContextFromSession();
                
                // If no context exists, try to create one from the current episodes section
                if (!ctx) {
                    const episodesSection = document.getElementById('video-episodes-gallery');
                    if (episodesSection && episodesSection.style.display !== 'none') {
                        // We're in episode mode, create context from visible episodes
                        const episodes = [];
                        episodesSection.querySelectorAll('.e-item').forEach(function(item) {
                            const playBtn = item.querySelector('.iq-button[data-video-id]');
                            if (playBtn) {
                                const epId = playBtn.getAttribute('data-video-id');
                                const epTitle = item.querySelector('.episodes-description a')?.textContent?.trim() || '';
                                const epDuration = item.querySelector('.episodes-description .text-primary')?.textContent?.trim() || '';
                                const epDesc = item.querySelector('.episodes-description p')?.textContent?.trim() || '';
                                const epImg = item.querySelector('img')?.src || '';
                                
                                if (epId) {
                                    episodes.push({
                                        id: epId,
                                        title: epTitle,
                                        duration: epDuration,
                                        description: epDesc,
                                        image: epImg
                                    });
                                }
                            }
                        });
                        
                        if (episodes.length > 0) {
                            ctx = {
                                seriesTitle: 'Series',
                                season: episodesSection.querySelector('.episodes-slider1')?.getAttribute('data-season') || '1',
                                currentVideoId: String(nextId),
                                episodes: episodes,
                                savedAt: Date.now()
                            };
                        }
                    }
                }
                
                if (ctx) {
                    // Update current video ID and maintain episode context
                    ctx.currentVideoId = String(nextId);
                    sessionStorage.setItem('watch_episode_context', JSON.stringify(ctx));
                }
            } catch (_) {}
        });
    }
    
    /**
     * Render video carousel items
     * @param {string} containerId - ID of carousel container
     * @param {array} videos - Array of video objects
     */
    function renderWatchPageVideoCarousel(containerId, videos) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        videos.forEach(video => {
            const item = document.createElement('div');
            item.className = 'e-item';
            
            const videoLink = video.data.videoLink || `https://videopress.com/embed/${video.id}`;
            const videoId = video.id;
            
            item.innerHTML = `
                <div class="block-image position-relative">
                    <a href="/watch/?id=${videoId}">
                        <img loading="lazy" src="${video.data.image || '/images/placeholder.jpg'}" class="img-fluid" alt="${video.data.title || 'Video'}">
                    </a>
                    <div class="episode-play-info">
                        <div class="episode-play">
                            <a href="/watch/?id=${videoId}" class="iq-button" data-video-id="${videoId}" data-title="${video.data.title || 'Video'}" tabindex="0">
                                <i class="fa fa-play"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="episodes-description text-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <a href="/watch/?id=${videoId}">${video.data.title || 'Video'}</a>
                        <span class="text-primary">${video.data.duration || '-'}</span>
                    </div>
                    <p class="mb-0">${(video.data.description || '').substring(0, 60)}${(video.data.description || '').length > 60 ? '...' : ''}</p>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    /**
     * Show error message on watch page
     * @param {string} message - Error message
     */
    function showWatchPageError(message) {
        const titleElement = document.getElementById('video-title');
        if (titleElement) {
            titleElement.textContent = 'Error';
        }
        
        const descElement = document.getElementById('video-description');
        if (descElement) {
            descElement.textContent = message;
            descElement.style.color = '#e50914';
        }
        
        // Show default sections and hide episodes section on error
        hideEpisodesSection();
        showDefaultSections();
    }
    
    /**
     * Go back to previous page
     * This function is called by the back button on watch page
     */
    window.goBack = function() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };
    
    // Handle play button clicks in carousels to navigate to watch page
    if (isWatchPage()) {
        document.addEventListener('click', function(e) {
            const playButton = e.target.closest('.iq-button[data-video-id]');
            if (playButton) {
                e.preventDefault();
                const videoId = playButton.getAttribute('data-video-id');
                if (videoId) {
                    window.location.href = `/watch/?id=${videoId}`;
                }
            }
        });
    }

    /**
     * Batch-based progressive section reveal (6 at a time) for subfolder pages,
     * excluding favorites, privacy policy, terms of use, watch, and watchlist.
     * This is additive-only: hides sections after the first six and reveals
     * them in batches on scroll. Existing content and layout remain unchanged.
     */
    (function initBatchSectionReveal() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const path = (window.location.pathname || '').toLowerCase();
        const segments = path.split('/').filter(Boolean);

        const excluded = ['/favorites', '/favorites/', '/privacypolicy', '/privacypolicy/', '/termsofuse', '/termsofuse/', '/watch', '/watch/', '/watchlist', '/watchlist/'];
        const isExcluded = excluded.some(p => path === p || path.startsWith(p));
        const isSubfolder = segments.length >= 1 && path !== '/';

        if (!isSubfolder || isExcluded) return;

        const styleId = 'batch-reveal-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                /* Keep elements measurable for sliders, but remove visual space */
                .batch-hidden {
                    visibility: hidden !important;
                    height: 0 !important;
                    max-height: 0 !important;
                    overflow: hidden !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    pointer-events: none !important;
                }
                #end-of-content { display: none; text-align: center; color: #9a9a9a; padding: 12px 0; font-size: 14px; }
                #batch-reveal-loader { display: none; text-align: center; color: #9a9a9a; padding: 12px 0; font-size: 14px; }
                #batch-reveal-loader .batch-spinner {
                    display: inline-block;
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(154, 154, 154, 0.35);
                    border-top-color: #9a9a9a;
                    border-radius: 50%;
                    animation: batchSpin 0.9s linear infinite;
                    vertical-align: middle;
                    margin-bottom: 6px;
                }
                @keyframes batchSpin { to { transform: rotate(360deg); } }
            `;
            document.head.appendChild(style);
        }

        // Prefer top-level content sections so we don't accidentally include nested layout sections.
        let sections = Array.from(document.querySelectorAll('main > section'));
        if (!sections.length) sections = Array.from(document.querySelectorAll('body > section'));
        if (!sections.length) sections = Array.from(document.querySelectorAll('section.s-margin, section.content-section, main section'));
        if (!sections.length) return;

        sections.forEach((section, idx) => {
            if (idx >= 6) section.classList.add('batch-hidden');
            else section.classList.remove('batch-hidden');
        });

        // Place end message BEFORE the footer (never inside footer).
        let endMessage = document.getElementById('end-of-content');
        if (!endMessage) {
            endMessage = document.createElement('p');
            endMessage.id = 'end-of-content';
            endMessage.textContent = "You’ve reached the end of this movie";
        }
        const footer = document.querySelector('footer');
        const endParent = footer?.parentNode || document.body;
        if (footer && endMessage.parentNode !== endParent) {
            endParent.insertBefore(endMessage, footer);
        } else if (!footer && !endMessage.parentNode) {
            endParent.appendChild(endMessage);
        }

        // Sentinel sits right above the end message to reliably trigger loading.
        let sentinel = document.getElementById('batch-reveal-sentinel');
        if (!sentinel) {
            sentinel = document.createElement('div');
            sentinel.id = 'batch-reveal-sentinel';
            sentinel.style.height = '1px';
            sentinel.style.width = '100%';
        }
        if (endMessage.parentNode && sentinel.parentNode !== endMessage.parentNode) {
            endMessage.parentNode.insertBefore(sentinel, endMessage);
        }

        // Small loader shown before revealing each batch.
        let batchLoader = document.getElementById('batch-reveal-loader');
        if (!batchLoader) {
            batchLoader = document.createElement('div');
            batchLoader.id = 'batch-reveal-loader';
            batchLoader.innerHTML = `<div class="batch-spinner" aria-hidden="true"></div><div>Loading more movies...</div>`;
        }
        if (endMessage.parentNode && batchLoader.parentNode !== endMessage.parentNode) {
            endMessage.parentNode.insertBefore(batchLoader, endMessage);
        }

        let isRevealing = false;
        let isBatchLoading = false;
        const revealBatch = () => {
            if (isRevealing || isBatchLoading) return;
            const hidden = sections.filter(sec => sec.classList.contains('batch-hidden'));
            if (!hidden.length) {
                endMessage.style.display = 'block';
                return;
            }
            // Show loader for 5 seconds, then reveal the next batch.
            isBatchLoading = true;
            if (batchLoader) batchLoader.style.display = 'block';
            setTimeout(() => {
                isRevealing = true;
                const hiddenNow = sections.filter(sec => sec.classList.contains('batch-hidden'));
                const toShow = hiddenNow.slice(0, 6);
                toShow.forEach(sec => sec.classList.remove('batch-hidden'));

                // Nudge carousels/layout to recalc sizes after being revealed.
                setTimeout(() => {
                    try {
                        if (window.jQuery && window.jQuery.fn && window.jQuery.fn.owlCarousel) {
                            toShow.forEach(sec => {
                                window.jQuery(sec).find('.owl-carousel').trigger('refresh.owl.carousel');
                            });
                        }
                        window.dispatchEvent(new Event('resize'));
                    } catch (e) {
                        // keep silent; this is a best-effort refresh
                    }
                }, 50);

                if (batchLoader) batchLoader.style.display = 'none';
                isRevealing = false;
                isBatchLoading = false;

                if (!sections.some(sec => sec.classList.contains('batch-hidden'))) {
                    endMessage.style.display = 'block';
                    window.removeEventListener('scroll', onScrollThrottled);
                    window.removeEventListener('resize', onScrollThrottled);
                }
            }, 5000);
        };

        // Use the real scrolling element (some pages scroll the documentElement/body differently).
        const scrollEl = document.scrollingElement || document.documentElement;

        let scrollTimer = null;
        const onScrollThrottled = () => {
            if (scrollTimer) return;
            scrollTimer = setTimeout(() => {
                scrollTimer = null;
                const scrollBottom = scrollEl.scrollTop + scrollEl.clientHeight;
                const docHeight = scrollEl.scrollHeight;
                if (scrollBottom >= docHeight - 200) {
                    revealBatch();
                }
            }, 150);
        };

        // Prefer IntersectionObserver for reliable triggering (fallback to scroll listener).
        let observer = null;
        if ('IntersectionObserver' in window && sentinel) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) revealBatch();
                });
            }, { root: null, rootMargin: '200px 0px', threshold: 0 });
            observer.observe(sentinel);
        }

        window.addEventListener('scroll', onScrollThrottled, { passive: true });
        window.addEventListener('resize', onScrollThrottled);
        // If the page is short, trigger once so the user can reach more content immediately.
        setTimeout(onScrollThrottled, 0);
    })();
})();

document.addEventListener("DOMContentLoaded", function() {
    (function() {
      function timeAgo(ts) {
        const seconds = Math.floor((Date.now() - ts) / 1000);
        if (seconds < 10) return 'just now';
        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes>1?'s':''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours>1?'s':''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days>1?'s':''} ago`;
      }
  
      function updateTimers() {
        document.querySelectorAll('.js-time').forEach(el => {
          const ts = Number(el.dataset.time);
          if (!ts) return;
          el.textContent = timeAgo(ts);
        });
      }
  
      updateTimers();
      setInterval(updateTimers, 60000);
    })();
  });
