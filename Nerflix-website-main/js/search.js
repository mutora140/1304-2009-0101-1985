// Search functionality for Nerflix website
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
            if (!e.target.closest('.search-input') && !e.target.closest('.search-results-container')) {
                this.hideAllSearchResults();
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
            movie.year.includes(searchTerm)
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
        return `
            <div class="search-result-item" data-video-id="${movie.videoId}" data-title="${this.escapeHTML(movie.title)}">
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
                            <span class="search-result-year">${movie.year}</span>
                            <span class="search-result-genre">${this.escapeHTML(movie.genres.join(', '))}</span>
                        </div>
                        <div class="search-result-rating">
                            <div class="rating-stars">
                                ${this.generateStarRating(movie.stars)}
                            </div>
                            <span class="rating-text">${movie.rating}/10</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateStarRating(stars) {
        // Convert stars to number if it's a string
        const starCount = parseFloat(stars);
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
                
                const videoId = item.dataset.videoId;
                const title = item.dataset.title || item.querySelector('.search-result-title')?.textContent || 'Movie';
                const movie = this.movieData.find(m => m.videoId === videoId);
                
                if (movie || videoId) {
                    this.handleMovieSelection(movie || { videoId: videoId, title: title });
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
        });
        
        // Debug: Log the movie selection
        console.log('Movie selected from search:', movie);
        console.log('openVideoGallery available:', typeof window.openVideoGallery);
        
        // Open video gallery exactly like Play Now button does
        // The existing video loading indicator will show automatically when video loads
        if (typeof window.openVideoGallery === 'function') {
            // Pass videoId and title, exactly like Play Now buttons do
            const videoId = movie.videoId;
            const title = movie.title || 'Movie';
            
            console.log('Calling openVideoGallery with:', videoId, title);
            
            // Use setTimeout to ensure the search results are hidden first
            setTimeout(() => {
                window.openVideoGallery(videoId, title);
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
        
        // Try to find and click a Play Now button with the same video ID
        const playNowButton = document.querySelector(`[data-video-id="${movie.videoId}"]`);
        if (playNowButton) {
            console.log('Found Play Now button, clicking it');
            playNowButton.click();
        } else {
            console.error('No Play Now button found for video ID:', movie.videoId);
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

    getMovieData() {
        // Sample movie data structured exactly like main.js with description and tags
        return [
            {
                videoId: 'Ohws8y572KE',
                title: 'Mission: Impossible',
                rating: 7.1,
                stars: 4,
                genres: ['Action', 'Adventure', 'Thriller'],
                year: '1996',
                image: 'images/popular/u1.jpg',
                description: 'An American agent, under false suspicion of disloyalty, must discover and expose the real spy without the help of his organization.',
                tags: ['Tom Cruise', 'Action', 'Spy', 'Thriller', 'Mission'],
                age: '12+',
                duration: '1h 50min'
            },
            {
                videoId: '02-XkOLVnIU',
                title: 'Mulan',
                rating: 7.0,
                stars: 3,
                genres: ['Action', 'Adventure', 'Drama'],
                year: '2020',
                image: 'images/popular/u2.jpg',
                description: 'A young Chinese maiden disguises herself as a male warrior in order to save her father.',
                tags: ['Disney', 'Live Action', 'Warrior'],
                age: '10+',
                duration: '2h 0min'
            },
            {
                videoId: '8jLOx1hD3_o',
                title: 'Laxmii',
                rating: 6.5,
                stars: 5,
                genres: ['Comedy', 'Horror', 'Drama'],
                year: '2020',
                image: 'images/popular/u3.jpg',
                description: 'A man gets possessed by a ghost and starts behaving like a woman.',
                tags: ['Bollywood', 'Supernatural', 'Comedy'],
                age: '18+',
                duration: '2h 21min'
            },
            {
                videoId: 'W4DlMggBPvc',
                title: 'Captain America: The First Avenger',
                rating: 6.9,
                stars: 4,
                genres: ['Action', 'Adventure', 'Sci-Fi'],
                year: '2011',
                image: 'images/popular/u4.jpg',
                description: 'Steve Rogers, a rejected military soldier, transforms into Captain America after taking a dose of a "Super-Soldier serum".',
                tags: ['Marvel', 'Superhero', 'World War II'],
                age: '12+',
                duration: '2h 4min'
            },
            {
                videoId: 'sDYVdxFZq8Y',
                title: 'Life of Pi',
                rating: 7.9,
                stars: 4,
                genres: ['Adventure', 'Drama', 'Fantasy'],
                year: '2012',
                image: 'images/popular/u5.jpg',
                description: 'A young man who survives a disaster at sea is hurtled into an epic journey of adventure and discovery.',
                tags: ['Survival', 'Ocean', 'Philosophy'],
                age: '11+',
                duration: '2h 7min'
            },
            {
                videoId: 'q78_0TElYME',
                title: 'Mission Mangal',
                rating: 6.8,
                stars: 3,
                genres: ['Drama', 'Sci-Fi', 'Thriller'],
                year: '2019',
                image: 'images/trending/01.jpg',
                description: 'Based on true events of the Indian Space Research Organisation (ISRO) successfully launching the Mars Orbiter Mission.',
                tags: ['Space', 'India', 'ISRO'],
                age: '12+',
                duration: '2h 10min'
            },
            {
                videoId: 'tmeOjFno6Do',
                title: 'Avengers: Age of Ultron',
                rating: 7.3,
                stars: 6,
                genres: ['Action', 'Adventure', 'Sci-Fi'],
                year: '2015',
                image: 'images/trending/02.jpg',
                description: 'When Tony Stark and Bruce Banner try to jump-start a dormant peacekeeping program called Ultron, things go horribly wrong and it\'s up to Earth\'s mightiest heroes to stop the villainous Ultron from enacting his terrible plan.',
                tags: ['Superhero', 'Marvel', 'Comic Book'],
                age: '16+',
                duration: '2h 21min'
            },
            {
                videoId: 'FLzfXQSPBOg',
                title: 'Frozen',
                rating: 7.4,
                stars: 5,
                genres: ['Animation', 'Adventure', 'Comedy'],
                year: '2013',
                image: 'images/trending/03.jpg',
                description: 'When the newly crowned Queen Elsa accidentally uses her power to turn things into ice to curse her home in infinite winter, her sister Anna teams up with a mountain man, his playful reindeer, and a snowman to change the weather condition.',
                tags: ['Disney', 'Musical', 'Family'],
                age: '13+',
                duration: '1h 42min'
            },
            {
                videoId: 'k10ETZ41q5o',
                title: 'The Conjuring',
                rating: 7.5,
                stars: 4,
                genres: ['Horror', 'Mystery', 'Thriller'],
                year: '2013',
                image: 'images/trending/04.jpg',
                description: 'Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.',
                tags: ['Supernatural', 'Haunted House', 'Based on True Story'],
                age: '16+',
                duration: '1h 52min'
            },
            {
                videoId: 'acEoQpJq0qg',
                title: 'Insidious: The Last Key',
                rating: 6.2,
                stars: 3,
                genres: ['Horror', 'Mystery', 'Thriller'],
                year: '2018',
                image: 'images/trending/05.jpg',
                description: 'Paranormal investigator Elise Rainier faces her most fearsome and personal haunting yet.',
                tags: ['Supernatural', 'Haunting', 'Sequel'],
                age: '16+',
                duration: '1h 43min'
            },
            {
                videoId: 'yQ5U8suTUw0',
                title: 'War',
                rating: 7.1,
                stars: 4,
                genres: ['Action', 'Thriller', 'Drama'],
                year: '2019',
                image: 'images/trending/06.jpg',
                description: 'An Indian soldier is assigned to eliminate his mentor who has gone rogue.',
                tags: ['Bollywood', 'Spy', 'Revenge'],
                age: '12+',
                duration: '2h 34min'
            },
            {
                videoId: '4qf9Uyn2acE',
                title: 'Five Feet Apart',
                rating: 7.2,
                stars: 4,
                genres: ['Drama', 'Romance'],
                year: '2019',
                image: 'images/slider/slider1.jpg',
                description: 'A pair of teenagers with cystic fibrosis meet in a hospital and fall in love, though their disease means they must maintain a safe distance between them.',
                tags: ['Teen', 'Illness', 'Love Story'],
                age: '18+',
                duration: '1h 56min'
            },
            {
                videoId: 'tsxemFXSQXQ',
                title: 'Chhichhore',
                rating: 8.0,
                stars: 4,
                genres: ['Comedy', 'Drama'],
                year: '2019',
                image: 'images/slider/slider2.jpg',
                description: 'A tragic incident forces Anirudh, a middle-aged man, to take a trip down memory lane and reminisce his college days along with his friends.',
                tags: ['College Life', 'Friendship', 'Nostalgia'],
                age: '10+',
                duration: '2h 23min'
            },
            {
                videoId: 'Lt-U_t2pUHI',
                title: 'Doctor Strange',
                rating: 7.5,
                stars: 4,
                genres: ['Action', 'Adventure', 'Fantasy'],
                year: '2016',
                image: 'images/slider/slider3.jpg',
                description: 'While on a journey of physical and spiritual healing, a brilliant neurosurgeon is drawn into the world of the mystic arts.',
                tags: ['Marvel', 'Magic', 'Superhero'],
                age: '12+',
                duration: '1h 55min'
            },
            {
                videoId: '5PSNL1qE6VY',
                title: 'Avatar',
                rating: 7.8,
                stars: 4,
                genres: ['Action', 'Adventure', 'Fantasy'],
                year: '2009',
                image: 'images/parallax/avatar.jpg',
                description: 'A paraplegic marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
                tags: ['Sci-Fi', '3D', 'James Cameron'],
                age: '12+',
                duration: '2h 42min'
            },
            {
                videoId: 'VyHV0BtdCW4',
                title: 'Harry Potter and the Sorcerer\'s Stone',
                rating: 7.6,
                stars: 4,
                genres: ['Adventure', 'Family', 'Fantasy'],
                year: '2001',
                image: 'images/top-10/01.jpg',
                description: 'An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.',
                tags: ['Magic', 'Wizard', 'School'],
                age: '10+',
                duration: '2h 32min'
            }
        ];
    }
}

// Initialize search when DOM is loaded and jQuery is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for jQuery to be ready
    if (typeof jQuery !== 'undefined') {
        jQuery(document).ready(function() {
            // Wait a bit for any existing search toggle functionality to initialize
            setTimeout(() => {
                new NerflixSearch();
            }, 100);
        });
    } else {
        // Fallback if jQuery is not available
        setTimeout(() => {
            new NerflixSearch();
        }, 100);
    }
}); 