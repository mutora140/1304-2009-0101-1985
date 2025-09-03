/**
 * Trending Section Play Icons Handler
 * Makes episode play icons work exactly like "Play Now" buttons
 */

(function (jQuery) {
    "use strict";

    // Trending Play System
    class TrendingPlaySystem {
        constructor() {
            this.episodeData = this.getEpisodeData();
            this.init();
        }

        // Episode data mapping for trending shows
        getEpisodeData() {
            return {
                // The Crown episodes
                'crown-ep1': { videoId: 'JWtnJjn6ngQ', title: 'The Crown - Episode 1', series: 'The Crown' },
                'crown-ep2': { videoId: 'JWtnJjn6ngQ', title: 'The Crown - Episode 2', series: 'The Crown' },
                'crown-ep3': { videoId: 'JWtnJjn6ngQ', title: 'The Crown - Episode 3', series: 'The Crown' },
                'crown-ep4': { videoId: 'JWtnJjn6ngQ', title: 'The Crown - Episode 4', series: 'The Crown' },
                'crown-ep5': { videoId: 'JWtnJjn6ngQ', title: 'The Crown - Episode 5', series: 'The Crown' },

                // Big Bang Theory episodes
                'bbt-ep1': { videoId: 'WBb3fojjx-0', title: 'The Big Bang Theory - Episode 1', series: 'The Big Bang Theory' },
                'bbt-ep2': { videoId: 'WBb3fojjx-0', title: 'The Big Bang Theory - Episode 2', series: 'The Big Bang Theory' },
                'bbt-ep3': { videoId: 'WBb3fojjx-0', title: 'The Big Bang Theory - Episode 3', series: 'The Big Bang Theory' },
                'bbt-ep4': { videoId: 'WBb3fojjx-0', title: 'The Big Bang Theory - Episode 4', series: 'The Big Bang Theory' },
                'bbt-ep5': { videoId: 'WBb3fojjx-0', title: 'The Big Bang Theory - Episode 5', series: 'The Big Bang Theory' },

                // Peaky Blinders episodes
                'pb-ep1': { videoId: 'oVzVdvLeICg', title: 'Peaky Blinders - Episode 1', series: 'Peaky Blinders' },
                'pb-ep2': { videoId: 'oVzVdvLeICg', title: 'Peaky Blinders - Episode 2', series: 'Peaky Blinders' },
                'pb-ep3': { videoId: 'oVzVdvLeICg', title: 'Peaky Blinders - Episode 3', series: 'Peaky Blinders' },
                'pb-ep4': { videoId: 'oVzVdvLeICg', title: 'Peaky Blinders - Episode 4', series: 'Peaky Blinders' },
                'pb-ep5': { videoId: 'oVzVdvLeICg', title: 'Peaky Blinders - Episode 5', series: 'Peaky Blinders' },

                // Narcos episodes
                'narcos-ep1': { videoId: 'Ua0HdsbsDsA', title: 'Narcos - Episode 1', series: 'Narcos' },
                'narcos-ep2': { videoId: 'Ua0HdsbsDsA', title: 'Narcos - Episode 2', series: 'Narcos' },
                'narcos-ep3': { videoId: 'Ua0HdsbsDsA', title: 'Narcos - Episode 3', series: 'Narcos' },
                'narcos-ep4': { videoId: 'Ua0HdsbsDsA', title: 'Narcos - Episode 4', series: 'Narcos' },
                'narcos-ep5': { videoId: 'Ua0HdsbsDsA', title: 'Narcos - Episode 5', series: 'Narcos' },

                // Friends episodes
                'friends-ep1': { videoId: 'IEEbUfhFFM0', title: 'Friends - Episode 1', series: 'Friends' },
                'friends-ep2': { videoId: 'IEEbUfhFFM0', title: 'Friends - Episode 2', series: 'Friends' },
                'friends-ep3': { videoId: 'IEEbUfhFFM0', title: 'Friends - Episode 3', series: 'Friends' },
                'friends-ep4': { videoId: 'IEEbUfhFFM0', title: 'Friends - Episode 4', series: 'Friends' },
                'friends-ep5': { videoId: 'IEEbUfhFFM0', title: 'Friends - Episode 5', series: 'Friends' },

                // Mirzapur episodes
                'mirzapur-ep1': { videoId: '8jLOx1hD3_o', title: 'Mirzapur - Episode 1', series: 'Mirzapur' },
                'mirzapur-ep2': { videoId: '8jLOx1hD3_o', title: 'Mirzapur - Episode 2', series: 'Mirzapur' },
                'mirzapur-ep3': { videoId: '8jLOx1hD3_o', title: 'Mirzapur - Episode 3', series: 'Mirzapur' },
                'mirzapur-ep4': { videoId: '8jLOx1hD3_o', title: 'Mirzapur - Episode 4', series: 'Mirzapur' },
                'mirzapur-ep5': { videoId: '8jLOx1hD3_o', title: 'Mirzapur - Episode 5', series: 'Mirzapur' }
            };
        }

        // Initialize the trending play system
        init() {
            this.setupEpisodePlayButtons();
            this.setupEventListeners();
            console.log('Trending Play System initialized successfully');
        }

        // Setup episode play buttons with data attributes
        setupEpisodePlayButtons() {
            const episodePlayButtons = document.querySelectorAll('.episode-play a');
            let episodeCounter = 1;

            episodePlayButtons.forEach((button, index) => {
                // Find the series context
                const seriesContext = this.getSeriesContext(button);
                const episodeKey = this.generateEpisodeKey(seriesContext, episodeCounter);
                
                // Add data attributes
                if (this.episodeData[episodeKey]) {
                    button.setAttribute('data-video-id', this.episodeData[episodeKey].videoId);
                    button.setAttribute('data-title', this.episodeData[episodeKey].title);
                    button.setAttribute('data-series', this.episodeData[episodeKey].series);
                    button.classList.add('trending-play-btn');
                }

                // Reset counter for each series (every 5 episodes)
                if ((index + 1) % 5 === 0) {
                    episodeCounter = 1;
                } else {
                    episodeCounter++;
                }
            });
        }

        // Get series context from the button's position in the DOM
        getSeriesContext(button) {
            const trendingBlock = button.closest('.tranding-block');
            if (!trendingBlock) return 'crown';

            const backgroundImage = trendingBlock.style.backgroundImage;
            
            if (backgroundImage.includes('01.jpg')) return 'crown';
            if (backgroundImage.includes('02.jpg')) return 'bbt';
            if (backgroundImage.includes('03.jpg')) return 'pb';
            if (backgroundImage.includes('04.jpg')) return 'narcos';
            if (backgroundImage.includes('05.jpg')) return 'friends';
            if (backgroundImage.includes('06.jpg')) return 'mirzapur';
            
            return 'crown'; // default
        }

        // Generate episode key based on series and episode number
        generateEpisodeKey(series, episodeNumber) {
            const seriesMap = {
                'crown': 'crown',
                'bbt': 'bbt',
                'pb': 'pb',
                'narcos': 'narcos',
                'friends': 'friends',
                'mirzapur': 'mirzapur'
            };
            
            const seriesKey = seriesMap[series] || 'crown';
            return `${seriesKey}-ep${episodeNumber}`;
        }

        // Setup event listeners for episode play buttons
        setupEventListeners() {
            document.addEventListener('click', (e) => {
                // Check if clicked on a trending play button
                if (e.target.closest('.trending-play-btn') || 
                    (e.target.closest('.episode-play a') && e.target.closest('.episode-play a').classList.contains('trending-play-btn'))) {
                    
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const button = e.target.closest('.episode-play a');
                    const videoId = button.getAttribute('data-video-id');
                    const title = button.getAttribute('data-title');
                    const series = button.getAttribute('data-series');
                    
                    if (videoId && title) {
                        this.playEpisode(videoId, title, series, button);
                    }
                }
            });
        }

        // Play episode using the same system as "Play Now" buttons
        playEpisode(videoId, title, series, button) {
            console.log(`Playing episode: ${title} (${series})`);
            
            // Add loading state to the button
            this.addLoadingState(button);
            
            // Show notification
            this.showPlayNotification(title, series);
            
            // Use the existing video gallery system
            if (typeof window.openVideoGallery === 'function') {
                // Small delay to show loading state
                setTimeout(() => {
                    window.openVideoGallery(videoId, title);
                    this.removeLoadingState(button);
                }, 300);
            } else {
                // Fallback if video gallery is not available
                console.warn('Video gallery system not available');
                this.removeLoadingState(button);
            }
        }

        // Add loading state to episode play button
        addLoadingState(button) {
            const playIcon = button.querySelector('i.fa-play');
            if (playIcon) {
                playIcon.classList.remove('fa-play');
                playIcon.classList.add('fa-spinner', 'fa-spin');
                button.style.pointerEvents = 'none';
                button.style.opacity = '0.7';
            }
        }

        // Remove loading state from episode play button
        removeLoadingState(button) {
            const playIcon = button.querySelector('i.fa-spinner');
            if (playIcon) {
                playIcon.classList.remove('fa-spinner', 'fa-spin');
                playIcon.classList.add('fa-play');
                button.style.pointerEvents = 'auto';
                button.style.opacity = '1';
            }
        }

        // Show play notification
        showPlayNotification(title, series) {
            // Remove existing notifications
            const existingNotifications = document.querySelectorAll('.trending-play-notification');
            existingNotifications.forEach(notification => notification.remove());
            
            const notification = document.createElement('div');
            notification.className = 'trending-play-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fa fa-play-circle"></i>
                    <div class="notification-text">
                        <strong>${series}</strong><br>
                        <span>${title}</span>
                    </div>
                </div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #e50914, #f40612);
                color: white;
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(229, 9, 20, 0.4);
                z-index: 10001;
                transform: translateX(100%);
                transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                font-family: 'Roboto', sans-serif;
                font-size: 14px;
                max-width: 300px;
                backdrop-filter: blur(10px);
            `;
            
            // Style the notification content
            const style = document.createElement('style');
            style.textContent = `
                .trending-play-notification .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .trending-play-notification .fa-play-circle {
                    font-size: 24px;
                    color: white;
                }
                .trending-play-notification .notification-text {
                    line-height: 1.4;
                }
                .trending-play-notification .notification-text strong {
                    font-weight: 600;
                    font-size: 15px;
                }
                .trending-play-notification .notification-text span {
                    font-size: 13px;
                    opacity: 0.9;
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(notification);
            
            // Show notification with bounce animation
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Hide notification after 4 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                    if (style.parentNode) {
                        style.parentNode.removeChild(style);
                    }
                }, 400);
            }, 4000);
        }

        // Handle dynamic content (for sliders and tabs)
        handleDynamicContent() {
            const observer = new MutationObserver((mutations) => {
                let shouldRefresh = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.classList && node.classList.contains('episode-play')) {
                                    shouldRefresh = true;
                                } else if (node.querySelector && node.querySelector('.episode-play')) {
                                    shouldRefresh = true;
                                }
                            }
                        });
                    }
                });
                
                if (shouldRefresh) {
                    setTimeout(() => {
                        this.setupEpisodePlayButtons();
                    }, 100);
                }
            });
            
            // Start observing
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Get episode statistics
        getEpisodeStats() {
            const totalEpisodes = Object.keys(this.episodeData).length;
            const seriesCount = new Set(Object.values(this.episodeData).map(ep => ep.series)).size;
            
            return {
                totalEpisodes,
                seriesCount,
                series: [...new Set(Object.values(this.episodeData).map(ep => ep.series))]
            };
        }

        // Show episode statistics
        showEpisodeStats() {
            const stats = this.getEpisodeStats();
            const message = `Total Episodes: ${stats.totalEpisodes} | Series: ${stats.seriesCount} | ${stats.series.join(', ')}`;
            this.showPlayNotification('Episode Statistics', message);
        }
    }

    // Initialize when DOM is ready
    jQuery(document).ready(function() {
        // Initialize trending play system
        const trendingPlaySystem = new TrendingPlaySystem();
        
        // Make it globally accessible
        window.trendingPlaySystem = trendingPlaySystem;
        
        // Setup keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + T to show episode stats
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                trendingPlaySystem.showEpisodeStats();
            }
        });
        
        console.log('🎬 Trending Play System loaded successfully!');
        console.log('💡 Click any episode play icon in the trending section to test!');
        console.log('⌨️ Press Ctrl+T to see episode statistics');
    });

})(jQuery);