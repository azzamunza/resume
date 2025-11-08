/**
 * Aaron Munro Resume - JavaScript
 * Print customisation with inline checkboxes
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initializePrintControls();
    loadPrintPreferences();
    updateFooterYear();
    loadYouTubePortfolio();
});

/**
 * Initialize print control toggles
 */
function initializePrintControls() {
    const checkboxes = document.querySelectorAll('.print-toggle');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.querySelector(`[data-print-id="${targetId}"]`);
            
            if (targetElement) {
                if (this.checked) {
                    targetElement.classList.remove('print-hidden');
                } else {
                    targetElement.classList.add('print-hidden');
                }
            }
            
            // Save preferences to local storage
            savePrintPreferences();
        });
    });
}

/**
 * Select all print sections
 */
function selectAll() {
    const checkboxes = document.querySelectorAll('.print-toggle');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        const targetId = checkbox.getAttribute('data-target');
        const targetElement = document.querySelector(`[data-print-id="${targetId}"]`);
        if (targetElement) {
            targetElement.classList.remove('print-hidden');
        }
    });
    savePrintPreferences();
}

/**
 * Deselect all print sections
 */
function deselectAll() {
    const checkboxes = document.querySelectorAll('.print-toggle');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const targetId = checkbox.getAttribute('data-target');
        const targetElement = document.querySelector(`[data-print-id="${targetId}"]`);
        if (targetElement) {
            targetElement.classList.add('print-hidden');
        }
    });
    savePrintPreferences();
}

/**
 * Save print preferences to local storage
 */
function savePrintPreferences() {
    const preferences = {};
    const checkboxes = document.querySelectorAll('.print-toggle');
    
    checkboxes.forEach(checkbox => {
        const targetId = checkbox.getAttribute('data-target');
        preferences[targetId] = checkbox.checked;
    });
    
    try {
        localStorage.setItem('resumePrintPreferences', JSON.stringify(preferences));
    } catch (e) {
        console.log('Unable to save preferences to local storage');
    }
}

/**
 * Load print preferences from local storage
 */
function loadPrintPreferences() {
    try {
        const saved = localStorage.getItem('resumePrintPreferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            
            Object.keys(preferences).forEach(targetId => {
                const checkbox = document.querySelector(`.print-toggle[data-target="${targetId}"]`);
                const targetElement = document.querySelector(`[data-print-id="${targetId}"]`);
                
                if (checkbox) {
                    checkbox.checked = preferences[targetId];
                    
                    if (targetElement) {
                        if (preferences[targetId]) {
                            targetElement.classList.remove('print-hidden');
                        } else {
                            targetElement.classList.add('print-hidden');
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.log('Unable to load preferences from local storage');
    }
}

/**
 * Update footer year
 */
function updateFooterYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/**
 * Before print event - ensure proper formatting
 */
window.addEventListener('beforeprint', function() {
    // Any pre-print setup can go here
});

/**
 * After print event - restore original state
 */
window.addEventListener('afterprint', function() {
    // Any post-print cleanup can go here
});

/**
 * Load YouTube videos from youtube.json
 */
async function loadYouTubePortfolio() {
    try {
        const response = await fetch('youtube.json');
        const videos = await response.json();
        
        const container = document.getElementById('portfolio-videos-container');
        if (!container) return;
        
        // Create the portfolio list structure
        const portfolioList = document.createElement('ul');
        portfolioList.className = 'portfolio-videos-list';
        
        videos.forEach((video, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'portfolio-video-item';
            listItem.setAttribute('data-print-id', `portfolio-video-${index}`);
            
            // Create checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'print-toggle item-toggle';
            checkbox.setAttribute('data-target', `portfolio-video-${index}`);
            checkbox.checked = true;
            checkbox.setAttribute('aria-label', `Include ${video.title}`);
            
            // Create thumbnail container
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.className = 'video-thumbnail-container';
            
            const thumbnail = document.createElement('img');
            thumbnail.src = `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`;
            thumbnail.alt = video.title;
            thumbnail.className = 'video-thumbnail';
            thumbnail.loading = 'lazy';
            
            const thumbnailLink = document.createElement('a');
            thumbnailLink.href = video.url;
            thumbnailLink.target = '_blank';
            thumbnailLink.rel = 'noopener';
            thumbnailLink.appendChild(thumbnail);
            
            thumbnailContainer.appendChild(thumbnailLink);
            
            // Create content container
            const contentContainer = document.createElement('div');
            contentContainer.className = 'video-content';
            
            const title = document.createElement('h4');
            const titleLink = document.createElement('a');
            titleLink.href = video.url;
            titleLink.target = '_blank';
            titleLink.rel = 'noopener';
            titleLink.textContent = video.title;
            title.appendChild(titleLink);
            
            contentContainer.appendChild(title);
            
            if (video.description) {
                const description = document.createElement('p');
                description.className = 'video-description';
                description.textContent = video.description;
                contentContainer.appendChild(description);
            }
            
            // Assemble the list item
            listItem.appendChild(checkbox);
            listItem.appendChild(thumbnailContainer);
            listItem.appendChild(contentContainer);
            
            portfolioList.appendChild(listItem);
        });
        
        container.innerHTML = '';
        container.appendChild(portfolioList);
        
        // Re-initialize print controls for the newly added checkboxes
        initializePrintControls();
        
    } catch (error) {
        console.error('Error loading YouTube portfolio:', error);
        const container = document.getElementById('portfolio-videos-container');
        if (container) {
            container.innerHTML = '<p class="error-message">Unable to load portfolio videos. Please check the console for details.</p>';
        }
    }
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
    }
});
