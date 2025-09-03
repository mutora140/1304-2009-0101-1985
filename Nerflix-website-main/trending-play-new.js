/**
 * Trending Section Play Icons Handler
 * Makes episode play icons work exactly like "Play Now" buttons
 * Now with Season Selection Functionality
 */

(function (jQuery) {
    "use strict";

    // Trending Play System
    class TrendingPlaySystem {
        constructor() {
            this.episodeData = this.getEpisodeData();
            this.currentSeasons = {}; // Track current season for each series
            this.init();
        }

        // Comprehensive episode data with seasons, real titles, descriptions, images, and trailers
        getEpisodeData() {
            return {
                // The Crown - Season 1
                'crown-s1-ep1': { 
                    videoId: 'JWtnJjn6ngQ', 
                    title: 'Wolferton Splash', 
                    series: 'The Crown',
                    season: 1,
                    episode: 1,
                    description: 'A young Princess Elizabeth marries Prince Philip and becomes Queen after her father\'s death.',
                    image: 'images/episodes/ce1.jpg'
                },
                'crown-s1-ep2': { 
                    videoId: 'JWtnJjn6ngQ', 
                    title: 'Hyde Park Corner', 
                    series: 'The Crown',
                    season: 1,
                    episode: 2,
                    description: 'The Queen struggles with her new role while dealing with family tensions and political pressures.',
                    image: 'images/episodes/ce2.jpg'
                },
                'crown-s1-ep3': { 
                    videoId: 'JWtnJjn6ngQ', 
                    title: 'Windsor', 
                    series: 'The Crown',
                    season: 1,
                    episode: 3,
                    description: 'The Queen faces her first major crisis with the Great Smog of London.',
                    image: 'images/episodes/ce3.jpg'
                },
                'crown-s1-ep4': { 
                    videoId: 'JWtnJjn6ngQ', 
                    title: 'Act of God', 
                    series: 'The Crown',
                    season: 1,
                    episode: 4,
                    description: 'Churchill and the Queen clash over the handling of a national disaster.',
                    image: 'images/episodes/ce4.jpg'
                },
                'crown-s1-ep5': { 
                    videoId: 'JWtnJjn6ngQ', 
                    title: 'Smoke and Mirrors', 
                    series: 'The Crown',
                    season: 1,
                    episode: 5,
                    description: 'The Queen\'s coronation is planned while she deals with personal and political challenges.',
                    image: 'images/episodes/ce5.jpg'
                },

                // The Crown - Season 2
                'crown-s2-ep1': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Misadventure', 
                    series: 'The Crown',
                    season: 2,
                    episode: 1,
                    description: 'The Queen faces new challenges in her second year of reign.',
                    image: 'images/episodes/ce1.jpg'
                },
                'crown-s2-ep2': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'A Company of Men', 
                    series: 'The Crown',
                    season: 2,
                    episode: 2,
                    description: 'Prince Philip\'s past and relationships come under scrutiny.',
                    image: 'images/episodes/ce2.jpg'
                },
                'crown-s2-ep3': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Lisbon', 
                    series: 'The Crown',
                    season: 2,
                    episode: 3,
                    description: 'The Queen travels to Portugal and faces international diplomacy challenges.',
                    image: 'images/episodes/ce3.jpg'
                },
                'crown-s2-ep4': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Beryl', 
                    series: 'The Crown',
                    season: 2,
                    episode: 4,
                    description: 'A look into the Queen\'s relationship with her sister Princess Margaret.',
                    image: 'images/episodes/ce4.jpg'
                },
                'crown-s2-ep5': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Marionettes', 
                    series: 'The Crown',
                    season: 2,
                    episode: 5,
                    description: 'The Queen deals with the Suez Crisis and its political implications.',
                    image: 'images/episodes/ce5.jpg'
                },

                // The Crown - Season 3
                'crown-s3-ep1': { 
                    videoId: 'fJ9rUzIMcZQ', 
                    title: 'Olding', 
                    series: 'The Crown',
                    season: 3,
                    episode: 1,
                    description: 'A new era begins as the Queen enters middle age and faces new challenges.',
                    image: 'images/episodes/ce1.jpg'
                },
                'crown-s3-ep2': { 
                    videoId: 'fJ9rUzIMcZQ', 
                    title: 'Margaretology', 
                    series: 'The Crown',
                    season: 3,
                    episode: 2,
                    description: 'Princess Margaret\'s diplomatic mission to America takes center stage.',
                    image: 'images/episodes/ce2.jpg'
                },
                'crown-s3-ep3': { 
                    videoId: 'fJ9rUzIMcZQ', 
                    title: 'Aberfan', 
                    series: 'The Crown',
                    season: 3,
                    episode: 3,
                    description: 'The Queen faces criticism for her response to the Aberfan disaster.',
                    image: 'images/episodes/ce3.jpg'
                },
                'crown-s3-ep4': { 
                    videoId: 'fJ9rUzIMcZQ', 
                    title: 'Bubbikins', 
                    series: 'The Crown',
                    season: 3,
                    episode: 4,
                    description: 'Prince Philip\'s mother comes to live at Buckingham Palace.',
                    image: 'images/episodes/ce4.jpg'
                },
                'crown-s3-ep5': { 
                    videoId: 'fJ9rUzIMcZQ', 
                    title: 'Coup', 
                    series: 'The Crown',
                    season: 3,
                    episode: 5,
                    description: 'The Queen faces a potential coup attempt against Harold Wilson\'s government.',
                    image: 'images/episodes/ce5.jpg'
                },

                // Big Bang Theory - Season 1
                'bbt-s1-ep1': { 
                    videoId: 'WBb3fojjx-0', 
                    title: 'Pilot', 
                    series: 'The Big Bang Theory',
                    season: 1,
                    episode: 1,
                    description: 'Sheldon and Leonard meet their new neighbor Penny, a beautiful aspiring actress.',
                    image: 'images/episodes/bbt1.jpg'
                },
                'bbt-s1-ep2': { 
                    videoId: 'WBb3fojjx-0', 
                    title: 'The Big Bran Hypothesis', 
                    series: 'The Big Bang Theory',
                    season: 1,
                    episode: 2,
                    description: 'Penny asks the guys to help her move furniture, leading to Sheldon\'s obsessive behavior.',
                    image: 'images/episodes/bbt2.jpg'
                },
                'bbt-s1-ep3': { 
                    videoId: 'WBb3fojjx-0', 
                    title: 'The Fuzzy Boots Corollary', 
                    series: 'The Big Bang Theory',
                    season: 1,
                    episode: 3,
                    description: 'Leonard tries to ask Penny out while Sheldon deals with his need for routine.',
                    image: 'images/episodes/bbt3.jpg'
                },
                'bbt-s1-ep4': { 
                    videoId: 'WBb3fojjx-0', 
                    title: 'The Luminous Fish Effect', 
                    series: 'The Big Bang Theory',
                    season: 1,
                    episode: 4,
                    description: 'Sheldon gets fired and tries to find new ways to occupy his time.',
                    image: 'images/episodes/bbt4.jpg'
                },
                'bbt-s1-ep5': { 
                    videoId: 'WBb3fojjx-0', 
                    title: 'The Hamburger Postulate', 
                    series: 'The Big Bang Theory',
                    season: 1,
                    episode: 5,
                    description: 'Leonard and Sheldon compete for Penny\'s attention when she needs help with her TV.',
                    image: 'images/episodes/bbt5.jpg'
                },

                // Big Bang Theory - Season 2
                'bbt-s2-ep1': { 
                    videoId: '9bZkp7q19f0', 
                    title: 'The Bad Fish Paradigm', 
                    series: 'The Big Bang Theory',
                    season: 2,
                    episode: 1,
                    description: 'Leonard and Penny go on their first date while Sheldon deals with change.',
                    image: 'images/episodes/bbt1.jpg'
                },
                'bbt-s2-ep2': { 
                    videoId: '9bZkp7q19f0', 
                    title: 'The Codpiece Topology', 
                    series: 'The Big Bang Theory',
                    season: 2,
                    episode: 2,
                    description: 'The guys attend a Renaissance fair where Sheldon becomes obsessed with accuracy.',
                    image: 'images/episodes/bbt2.jpg'
                },
                'bbt-s2-ep3': { 
                    videoId: '9bZkp7q19f0', 
                    title: 'The Barbarian Sublimation', 
                    series: 'The Big Bang Theory',
                    season: 2,
                    episode: 3,
                    description: 'Sheldon tries to channel his anger through video games.',
                    image: 'images/episodes/bbt3.jpg'
                },
                'bbt-s2-ep4': { 
                    videoId: '9bZkp7q19f0', 
                    title: 'The Griffin Equivalency', 
                    series: 'The Big Bang Theory',
                    season: 2,
                    episode: 4,
                    description: 'Leonard gets interviewed for a magazine, making Sheldon jealous.',
                    image: 'images/episodes/bbt4.jpg'
                },
                'bbt-s2-ep5': { 
                    videoId: '9bZkp7q19f0', 
                    title: 'The Euclid Alternative', 
                    series: 'The Big Bang Theory',
                    season: 2,
                    episode: 5,
                    description: 'Sheldon learns to drive after Leonard refuses to be his chauffeur.',
                    image: 'images/episodes/bbt5.jpg'
                },

                // Peaky Blinders - Season 1
                'pb-s1-ep1': { 
                    videoId: 'oVzVdvLeICg', 
                    title: 'Episode 1', 
                    series: 'Peaky Blinders',
                    season: 1,
                    episode: 1,
                    description: 'Thomas Shelby returns from World War I to find his family\'s criminal empire in Birmingham.',
                    image: 'images/episodes/pb1.jpg'
                },
                'pb-s1-ep2': { 
                    videoId: 'oVzVdvLeICg', 
                    title: 'Episode 2', 
                    series: 'Peaky Blinders',
                    season: 1,
                    episode: 2,
                    description: 'Tommy plans to expand the business while dealing with Inspector Campbell.',
                    image: 'images/episodes/pb2.jpg'
                },
                'pb-s1-ep3': { 
                    videoId: 'oVzVdvLeICg', 
                    title: 'Episode 3', 
                    series: 'Peaky Blinders',
                    season: 1,
                    episode: 3,
                    description: 'The Peaky Blinders face new threats as they expand their operations.',
                    image: 'images/episodes/pb3.jpg'
                },
                'pb-s1-ep4': { 
                    videoId: 'oVzVdvLeICg', 
                    title: 'Episode 4', 
                    series: 'Peaky Blinders',
                    season: 1,
                    episode: 4,
                    description: 'Tommy\'s relationship with Grace becomes complicated as tensions rise.',
                    image: 'images/episodes/pb4.jpg'
                },
                'pb-s1-ep5': { 
                    videoId: 'oVzVdvLeICg', 
                    title: 'Episode 5', 
                    series: 'Peaky Blinders',
                    season: 1,
                    episode: 5,
                    description: 'The season finale brings major confrontations and revelations.',
                    image: 'images/episodes/pb5.jpg'
                },

                // Peaky Blinders - Season 2
                'pb-s2-ep1': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Episode 1', 
                    series: 'Peaky Blinders',
                    season: 2,
                    episode: 1,
                    description: 'Tommy expands the business to London while facing new enemies.',
                    image: 'images/episodes/pb1.jpg'
                },
                'pb-s2-ep2': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Episode 2', 
                    series: 'Peaky Blinders',
                    season: 2,
                    episode: 2,
                    description: 'The Shelby family faces new challenges in their London expansion.',
                    image: 'images/episodes/pb2.jpg'
                },
                'pb-s2-ep3': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Episode 3', 
                    series: 'Peaky Blinders',
                    season: 2,
                    episode: 3,
                    description: 'Tommy deals with betrayal and new alliances in London.',
                    image: 'images/episodes/pb3.jpg'
                },
                'pb-s2-ep4': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Episode 4', 
                    series: 'Peaky Blinders',
                    season: 2,
                    episode: 4,
                    description: 'The stakes get higher as Tommy faces his most dangerous enemy yet.',
                    image: 'images/episodes/pb4.jpg'
                },
                'pb-s2-ep5': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Episode 5', 
                    series: 'Peaky Blinders',
                    season: 2,
                    episode: 5,
                    description: 'The season reaches its climax with major confrontations.',
                    image: 'images/episodes/pb5.jpg'
                },

                // Narcos - Season 1
                'narcos-s1-ep1': { 
                    videoId: 'Ua0HdsbsDsA', 
                    title: 'Descenso', 
                    series: 'Narcos',
                    season: 1,
                    episode: 1,
                    description: 'DEA agent Steve Murphy arrives in Colombia to fight the drug war.',
                    image: 'images/episodes/narcos1.jpg'
                },
                'narcos-s1-ep2': { 
                    videoId: 'Ua0HdsbsDsA', 
                    title: 'The Sword of Simón Bolívar', 
                    series: 'Narcos',
                    season: 1,
                    episode: 2,
                    description: 'Pablo Escobar\'s rise to power and the beginning of his drug empire.',
                    image: 'images/episodes/narcos2.jpg'
                },
                'narcos-s1-ep3': { 
                    videoId: 'Ua0HdsbsDsA', 
                    title: 'The Men of Always', 
                    series: 'Narcos',
                    season: 1,
                    episode: 3,
                    description: 'Escobar faces opposition from rival cartels and the government.',
                    image: 'images/episodes/narcos3.jpg'
                },
                'narcos-s1-ep4': { 
                    videoId: 'Ua0HdsbsDsA', 
                    title: 'The Palace in Flames', 
                    series: 'Narcos',
                    season: 1,
                    episode: 4,
                    description: 'Escobar\'s violence escalates as he fights to maintain his empire.',
                    image: 'images/episodes/narcos4.jpg'
                },
                'narcos-s1-ep5': { 
                    videoId: 'Ua0HdsbsDsA', 
                    title: 'There Will Be a Future', 
                    series: 'Narcos',
                    season: 1,
                    episode: 5,
                    description: 'The hunt for Escobar intensifies as the DEA closes in.',
                    image: 'images/episodes/narcos5.jpg'
                },

                // Narcos - Season 2
                'narcos-s2-ep1': { 
                    videoId: 'fJ9rUzIMcZQ', 
                    title: 'Free at Last', 
                    series: 'Narcos',
                    season: 2,
                    episode: 1,
                    description: 'Escobar escapes from prison and the manhunt begins.',
                    image: 'images/episodes/narcos1.jpg'
                },
                'narcos-s2-ep2': { 
                    videoId: 'fJ9rUzIMcZQ', 
                    title: 'Cambalache', 
                    series: 'Narcos',
                    season: 2,
                    episode: 2,
                    description: 'Escobar tries to negotiate his surrender while on the run.',
                    image: 'images/episodes/narcos2.jpg'
                },
                'narcos-s2-ep3': { 
                    videoId: 'fJ9rUzIMcZQ', 
                    title: 'Our Man in Madrid', 
                    series: 'Narcos',
                    season: 2,
                    episode: 3,
                    description: 'The DEA tracks Escobar\'s movements and plans their next move.',
                    image: 'images/episodes/narcos3.jpg'
                },
                'narcos-s2-ep4': { 
                    videoId: 'fJ9rUzIMcZQ', 
                    title: 'The Good, the Bad, and the Dead', 
                    series: 'Narcos',
                    season: 2,
                    episode: 4,
                    description: 'Escobar\'s family becomes a target as the pressure mounts.',
                    image: 'images/episodes/narcos4.jpg'
                },
                'narcos-s2-ep5': { 
                    videoId: 'fJ9rUzIMcZQ', 
                    title: 'The Enemies of My Enemy', 
                    series: 'Narcos',
                    season: 2,
                    episode: 5,
                    description: 'The final confrontation with Escobar approaches.',
                    image: 'images/episodes/narcos5.jpg'
                },

                // Friends - Season 1
                'friends-s1-ep1': { 
                    videoId: 'IEEbUfhFFM0', 
                    title: 'The One Where Monica Gets a Roommate', 
                    series: 'Friends',
                    season: 1,
                    episode: 1,
                    description: 'Rachel runs away from her wedding and moves in with Monica.',
                    image: 'images/episodes/friends1.jpg'
                },
                'friends-s1-ep2': { 
                    videoId: 'IEEbUfhFFM0', 
                    title: 'The One with the Sonogram at the End', 
                    series: 'Friends',
                    season: 1,
                    episode: 2,
                    description: 'Ross finds out his ex-wife is pregnant with his child.',
                    image: 'images/episodes/friends2.jpg'
                },
                'friends-s1-ep3': { 
                    videoId: 'IEEbUfhFFM0', 
                    title: 'The One with the Thumb', 
                    series: 'Friends',
                    season: 1,
                    episode: 3,
                    description: 'Phoebe gets $7,000 from a bank error and Chandler quits smoking.',
                    image: 'images/episodes/friends3.jpg'
                },
                'friends-s1-ep4': { 
                    videoId: 'IEEbUfhFFM0', 
                    title: 'The One with George Stephanopoulos', 
                    series: 'Friends',
                    season: 1,
                    episode: 4,
                    description: 'The friends watch the news and Monica dates a doctor.',
                    image: 'images/episodes/friends4.jpg'
                },
                'friends-s1-ep5': { 
                    videoId: 'IEEbUfhFFM0', 
                    title: 'The One with the East German Laundry Detergent', 
                    series: 'Friends',
                    season: 1,
                    episode: 5,
                    description: 'Ross and Rachel do laundry together while Joey auditions for a play.',
                    image: 'images/episodes/friends5.jpg'
                },

                // Friends - Season 2
                'friends-s2-ep1': { 
                    videoId: '9bZkp7q19f0', 
                    title: 'The One with Ross\'s New Girlfriend', 
                    series: 'Friends',
                    season: 2,
                    episode: 1,
                    description: 'Ross starts dating Julie while Rachel realizes her feelings for him.',
                    image: 'images/episodes/friends1.jpg'
                },
                'friends-s2-ep2': { 
                    videoId: '9bZkp7q19f0', 
                    title: 'The One with the Breast Milk', 
                    series: 'Friends',
                    season: 2,
                    episode: 2,
                    description: 'Ross and Julie\'s relationship continues while the others deal with various issues.',
                    image: 'images/episodes/friends2.jpg'
                },
                'friends-s2-ep3': { 
                    videoId: '9bZkp7q19f0', 
                    title: 'The One Where Heckles Dies', 
                    series: 'Friends',
                    season: 2,
                    episode: 3,
                    description: 'The building\'s super dies and leaves his belongings to Chandler.',
                    image: 'images/episodes/friends3.jpg'
                },
                'friends-s2-ep4': { 
                    videoId: '9bZkp7q19f0', 
                    title: 'The One with Phoebe\'s Husband', 
                    series: 'Friends',
                    season: 2,
                    episode: 4,
                    description: 'Phoebe reveals she\'s still married to a gay ice dancer.',
                    image: 'images/episodes/friends4.jpg'
                },
                'friends-s2-ep5': { 
                    videoId: '9bZkp7q19f0', 
                    title: 'The One with Five Steaks and an Eggplant', 
                    series: 'Friends',
                    season: 2,
                    episode: 5,
                    description: 'Money issues create tension between the friends.',
                    image: 'images/episodes/friends5.jpg'
                },

                // Mirzapur - Season 1
                'mirzapur-s1-ep1': { 
                    videoId: '8jLOx1hD3_o', 
                    title: 'Episode 1', 
                    series: 'Mirzapur',
                    season: 1,
                    episode: 1,
                    description: 'Guddu and Bablu get involved in the criminal underworld of Mirzapur.',
                    image: 'images/episodes/mirzapur1.jpg'
                },
                'mirzapur-s1-ep2': { 
                    videoId: '8jLOx1hD3_o', 
                    title: 'Episode 2', 
                    series: 'Mirzapur',
                    season: 1,
                    episode: 2,
                    description: 'The brothers work for Kaleen Bhaiya while dealing with family issues.',
                    image: 'images/episodes/mirzapur2.jpg'
                },
                'mirzapur-s1-ep3': { 
                    videoId: '8jLOx1hD3_o', 
                    title: 'Episode 3', 
                    series: 'Mirzapur',
                    season: 1,
                    episode: 3,
                    description: 'Tensions rise as the brothers become more involved in the business.',
                    image: 'images/episodes/mirzapur3.jpg'
                },
                'mirzapur-s1-ep4': { 
                    videoId: '8jLOx1hD3_o', 
                    title: 'Episode 4', 
                    series: 'Mirzapur',
                    season: 1,
                    episode: 4,
                    description: 'The power struggle intensifies in Mirzapur\'s criminal world.',
                    image: 'images/episodes/mirzapur4.jpg'
                },
                'mirzapur-s1-ep5': { 
                    videoId: '8jLOx1hD3_o', 
                    title: 'Episode 5', 
                    series: 'Mirzapur',
                    season: 1,
                    episode: 5,
                    description: 'The season reaches its climax with major confrontations.',
                    image: 'images/episodes/mirzapur5.jpg'
                },

                // Mirzapur - Season 2
                'mirzapur-s2-ep1': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Episode 1', 
                    series: 'Mirzapur',
                    season: 2,
                    episode: 1,
                    description: 'Guddu seeks revenge while new players enter the Mirzapur power game.',
                    image: 'images/episodes/mirzapur1.jpg'
                },
                'mirzapur-s2-ep2': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Episode 2', 
                    series: 'Mirzapur',
                    season: 2,
                    episode: 2,
                    description: 'The battle for control of Mirzapur continues with new alliances.',
                    image: 'images/episodes/mirzapur2.jpg'
                },
                'mirzapur-s2-ep3': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Episode 3', 
                    series: 'Mirzapur',
                    season: 2,
                    episode: 3,
                    description: 'Guddu and his allies plan their next move against Kaleen Bhaiya.',
                    image: 'images/episodes/mirzapur3.jpg'
                },
                'mirzapur-s2-ep4': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Episode 4', 
                    series: 'Mirzapur',
                    season: 2,
                    episode: 4,
                    description: 'The war for Mirzapur reaches new heights of violence.',
                    image: 'images/episodes/mirzapur4.jpg'
                },
                'mirzapur-s2-ep5': { 
                    videoId: 'dQw4w9WgXcQ', 
                    title: 'Episode 5', 
                    series: 'Mirzapur',
                    season: 2,
                    episode: 5,
                    description: 'The season finale brings major revelations and confrontations.',
                    image: 'images/episodes/mirzapur5.jpg'
                }
            };
        }

        // Initialize the trending play system
        init() {
            this.setupEpisodePlayButtons();
            this.setupEventListeners();
            this.setupSeasonSelectors();
            console.log('Trending Play System initialized successfully');
        }

        // Setup episode play buttons with data attributes
        setupEpisodePlayButtons() {
            const episodePlayButtons = document.querySelectorAll('.episode-play a');
            let episodeCounter = 1;

            episodePlayButtons.forEach((button, index) => {
                // Find the series context
                const seriesContext = this.getSeriesContext(button);
                const currentSeason = this.currentSeasons[seriesContext] || 1;
                const episodeKey = this.generateEpisodeKey(seriesContext, episodeCounter, currentSeason);
                
                // Add data attributes
                if (this.episodeData[episodeKey]) {
                    button.setAttribute('data-video-id', this.episodeData[episodeKey].videoId);
                    button.setAttribute('data-title', this.episodeData[episodeKey].title);
                    button.setAttribute('data-series', this.episodeData[episodeKey].series);
                    button.setAttribute('data-season', this.episodeData[episodeKey].season);
                    button.setAttribute('data-episode', this.episodeData[episodeKey].episode);
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

        // Generate episode key based on series, season, and episode number
        generateEpisodeKey(series, episodeNumber, season = 1) {
            const seriesMap = {
                'crown': 'crown',
                'bbt': 'bbt',
                'pb': 'pb',
                'narcos': 'narcos',
                'friends': 'friends',
                'mirzapur': 'mirzapur'
            };
            
            const seriesKey = seriesMap[series] || 'crown';
            return `${seriesKey}-s${season}-ep${episodeNumber}`;
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

        // Setup season selectors
        setupSeasonSelectors() {
            const seasonSelectors = document.querySelectorAll('.season-select');
            
            seasonSelectors.forEach(selector => {
                // Initialize current season to 1 for each series
                const seriesContext = this.getSeriesContextFromSelector(selector);
                this.currentSeasons[seriesContext] = 1;
                
                // Add event listener for season changes
                selector.addEventListener('change', (e) => {
                    const selectedSeason = parseInt(e.target.value.replace('Season', ''));
                    const seriesContext = this.getSeriesContextFromSelector(selector);
                    
                    this.currentSeasons[seriesContext] = selectedSeason;
                    this.updateEpisodesForSeason(seriesContext, selectedSeason);
                    
                    console.log(`Switched to Season ${selectedSeason} for ${seriesContext}`);
                });
            });
        }

        // Get series context from season selector
        getSeriesContextFromSelector(selector) {
            const trendingBlock = selector.closest('.overlay-tab');
            if (!trendingBlock) return 'crown';
            
            const seriesTitle = trendingBlock.querySelector('.trending-text');
            if (!seriesTitle) return 'crown';
            
            const title = seriesTitle.textContent.toLowerCase().trim();
            
            if (title.includes('crown')) return 'crown';
            if (title.includes('big bang')) return 'bbt';
            if (title.includes('peaky')) return 'pb';
            if (title.includes('narcos')) return 'narcos';
            if (title.includes('friends')) return 'friends';
            if (title.includes('mirzapur')) return 'mirzapur';
            
            return 'crown'; // default
        }

        // Update episodes for selected season
        updateEpisodesForSeason(seriesContext, season) {
            const trendingBlock = document.querySelector(`[data-series="${seriesContext}"]`) || 
                                this.findTrendingBlockBySeries(seriesContext);
            
            if (!trendingBlock) return;
            
            const episodeItems = trendingBlock.querySelectorAll('.e-item');
            
            episodeItems.forEach((item, index) => {
                const episodeNumber = index + 1;
                const episodeKey = `${seriesContext}-s${season}-ep${episodeNumber}`;
                const episodeData = this.episodeData[episodeKey];
                
                if (episodeData) {
                    // Update episode title
                    const titleLink = item.querySelector('.episodes-description a');
                    if (titleLink) {
                        titleLink.textContent = episodeData.title;
                    }
                    
                    // Update episode description
                    const description = item.querySelector('.episodes-description p');
                    if (description) {
                        description.textContent = episodeData.description;
                    }
                    
                    // Update episode image
                    const image = item.querySelector('.block-image img');
                    if (image) {
                        image.src = episodeData.image;
                        image.alt = episodeData.title;
                    }
                    
                    // Update play button data attributes
                    const playButton = item.querySelector('.episode-play a');
                    if (playButton) {
                        playButton.setAttribute('data-video-id', episodeData.videoId);
                        playButton.setAttribute('data-title', episodeData.title);
                        playButton.setAttribute('data-series', episodeData.series);
                        playButton.setAttribute('data-season', episodeData.season);
                        playButton.setAttribute('data-episode', episodeData.episode);
                    }
                }
            });
        }

        // Find trending block by series context
        findTrendingBlockBySeries(seriesContext) {
            const trendingBlocks = document.querySelectorAll('.overlay-tab');
            
            for (let block of trendingBlocks) {
                const seriesTitle = block.querySelector('.trending-text');
                if (seriesTitle) {
                    const title = seriesTitle.textContent.toLowerCase().trim();
                    
                    if (seriesContext === 'crown' && title.includes('crown')) return block;
                    if (seriesContext === 'bbt' && title.includes('big bang')) return block;
                    if (seriesContext === 'pb' && title.includes('peaky')) return block;
                    if (seriesContext === 'narcos' && title.includes('narcos')) return block;
                    if (seriesContext === 'friends' && title.includes('friends')) return block;
                    if (seriesContext === 'mirzapur' && title.includes('mirzapur')) return block;
                }
            }
            
            return null;
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
        
        console.log('🎬 Trending Play System with Season Selection loaded successfully!');
        console.log('💡 Click any episode play icon in the trending section to test!');
        console.log('📺 Use season selectors to switch between different seasons!');
        console.log('⌨️ Press Ctrl+T to see episode statistics');
    });

})(jQuery);