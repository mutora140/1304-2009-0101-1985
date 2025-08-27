// Search functionality for Nerflix website
class NerflixSearch {
    constructor() {
        this.searchInputs = document.querySelectorAll('.search-input');
        this.searchResultsContainer = null;
        this.movieData = this.getMovieData();
        this.currentSearchTimeout = null;
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
    }

    handleSearch(event) {
        const query = event.target.value.trim();
        const resultsContainer = event.target.closest('.form-group').querySelector('.search-results-container');

        // Clear previous timeout
        if (this.currentSearchTimeout) {
            clearTimeout(this.currentSearchTimeout);
        }

        // Debounce search
        this.currentSearchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                const results = this.searchMovies(query);
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
            <div class="search-result-item" data-video-id="${movie.videoId}">
                <div class="search-result-content">
                    <div class="search-result-image">
                        <img src="${movie.image}" alt="${movie.title}" onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <div class="search-result-info">
                        <h6 class="search-result-title">${movie.title}</h6>
                        <div class="search-result-meta">
                            <span class="search-result-year">${movie.year}</span>
                            <span class="search-result-genre">${movie.genres.join(', ')}</span>
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
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const videoId = item.dataset.videoId;
                const movie = this.movieData.find(m => m.videoId === videoId);
                if (movie) {
                    this.handleMovieSelection(movie);
                }
            });
        });
    }

    handleMovieSelection(movie) {
        // You can customize this to navigate to movie details page
        console.log('Selected movie:', movie);
        // For now, just hide the search results
        this.hideAllSearchResults();
        
        // You could trigger the video player here
        if (window.openVideoGallery) {
            window.openVideoGallery(movie.videoId, movie.title);
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
        // Sample movie data structured exactly like main.js
        return [
            {
                videoId: 'Ohws8y572KE',
                title: 'Mission: Impossible',
                rating: 7.1,
                stars: 4,
                genres: ['Action', 'Adventure', 'Thriller'],
                year: '1996',
                image: 'images/popular/u1.jpg'
            },
            {
                videoId: '02-XkOLVnIU',
                title: 'Mulan (2020)',
                rating: 7.3,
                stars: 4,
                genres: ['Action', 'Adventure', 'Drama'],
                year: '2020',
                image: 'images/popular/u2.jpg'
            },
            {
                videoId: '8jLOx1hD3_o',
                title: 'Laxmii (2020)',
                rating: 6.8,
                stars: 3,
                genres: ['Comedy', 'Horror'],
                year: '2020',
                image: 'images/popular/u3.jpg'
            },
            {
                videoId: 'W4DlMggBPvc',
                title: 'Captain America: The First Avenger',
                rating: 6.9,
                stars: 3,
                genres: ['Action', 'Adventure', 'Sci-Fi'],
                year: '2011',
                image: 'images/popular/u4.jpg'
            },
            {
                videoId: 'sDYVdxFZq8Y',
                title: 'Life of Pi (2012)',
                rating: 7.9,
                stars: 4,
                genres: ['Adventure', 'Drama', 'Fantasy'],
                year: '2012',
                image: 'images/popular/u5.jpg'
            },
            {
                videoId: 'q78_0TElYME',
                title: 'Mission Mangal (2019)',
                rating: 6.5,
                stars: 3,
                genres: ['Drama', 'History'],
                year: '2019',
                image: 'images/trending/01.jpg'
            },
            {
                videoId: 'dQw4w9WgXcQ',
                title: 'Avengers: Age of Ultron',
                rating: 7.3,
                stars: 4,
                genres: ['Action', 'Adventure', 'Sci-Fi'],
                year: '2015',
                image: 'images/trending/02.jpg'
            },
            {
                videoId: 'frozen_main_slider',
                title: 'Frozen',
                rating: 7.4,
                stars: 4,
                genres: ['Animation', 'Adventure', 'Comedy'],
                year: '2013',
                image: 'images/trending/03.jpg'
            },
            {
                videoId: 'conjuring_main_slider',
                title: 'The Conjuring',
                rating: 7.5,
                stars: 4,
                genres: ['Horror', 'Mystery', 'Thriller'],
                year: '2013',
                image: 'images/trending/04.jpg'
            },
            {
                videoId: 'acEoQpJq0qg',
                title: 'Insidious: The Last Key',
                rating: 5.7,
                stars: 3,
                genres: ['Horror', 'Mystery', 'Thriller'],
                year: '2018',
                image: 'images/trending/05.jpg'
            },
            {
                videoId: 'yQ5U8suTUw0',
                title: 'War (2019)',
                rating: 6.8,
                stars: 3,
                genres: ['Action', 'Thriller'],
                year: '2019',
                image: 'images/trending/06.jpg'
            },
            {
                videoId: '4qf9Uyn2acE',
                title: 'Five Feet Apart (2019)',
                rating: 7.2,
                stars: 4,
                genres: ['Drama', 'Romance'],
                year: '2019',
                image: 'images/slider/slider1.jpg'
            },
            {
                videoId: 'tsxemFXSQXQ',
                title: 'Chhichhore (2019)',
                rating: 8.2,
                stars: 4,
                genres: ['Comedy', 'Drama'],
                year: '2019',
                image: 'images/slider/slider2.jpg'
            },
            {
                videoId: 'Lt-U_t2pUHI',
                title: 'Doctor Strange (2016)',
                rating: 7.5,
                stars: 4,
                genres: ['Action', 'Adventure', 'Fantasy'],
                year: '2016',
                image: 'images/slider/slider3.jpg'
            },
            {
                videoId: 'VyHV0BtdCW4',
                title: 'Harry Potter and the Sorcerer\'s Stone',
                rating: 7.6,
                stars: 4,
                genres: ['Adventure', 'Family', 'Fantasy'],
                year: '2001',
                image: 'images/popular/u1.jpg'
            }
        ];
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new NerflixSearch();
}); 