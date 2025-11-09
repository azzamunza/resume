/**
 * Aaron Munro Resume - JavaScript
 * Print customisation with inline checkboxes
 * Enhanced with JSON data loading, toggle switches, and column layouts
 */

// Global resume data storage
let resumeData = null;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initializePrintControls();
    loadPrintPreferences();
    updateFooterYear();
    loadYouTubePortfolio();
    loadResumeData();
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
        
        // Get the portfolio layout mode
        const portfolioSection = document.querySelector('#portfolio');
        let layoutMode = 'column'; // default
        if (portfolioSection) {
            if (portfolioSection.classList.contains('layout-full')) {
                layoutMode = 'full';
            } else if (portfolioSection.classList.contains('layout-column')) {
                layoutMode = 'column';
            }
        }
        
        // Create the portfolio list structure
        const portfolioList = document.createElement('ul');
        portfolioList.className = `portfolio-videos-list portfolio-layout-${layoutMode}`;
        
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
            
            // Create media container for both iframe and thumbnail
            const mediaContainer = document.createElement('div');
            mediaContainer.className = 'video-media-container';
            
            // Create YouTube iframe
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${video.video_id}`;
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.className = 'video-iframe';
            iframe.loading = 'lazy';
            
            // Create thumbnail for print mode
            const thumbnail = document.createElement('img');
            thumbnail.src = `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`;
            thumbnail.alt = video.title;
            thumbnail.className = 'video-thumbnail print-only';
            thumbnail.loading = 'lazy';
            
            mediaContainer.appendChild(iframe);
            mediaContainer.appendChild(thumbnail);
            
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
            
            // Assemble the list item based on layout mode
            listItem.appendChild(checkbox);
            if (layoutMode === 'full') {
                // Full width: thumbnail left (50%), info right (50%)
                listItem.appendChild(mediaContainer);
                listItem.appendChild(contentContainer);
            } else {
                // Column: stacked vertically
                listItem.appendChild(mediaContainer);
                listItem.appendChild(contentContainer);
            }
            
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

/**
 * Load resume data from JSON file
 */
async function loadResumeData() {
    try {
        const response = await fetch('resume-data.json');
        resumeData = await response.json();
        
        // Initialize sections with data
        initializeSections();
        
        // Load display preferences from localStorage
        loadDisplayPreferences();
        
    } catch (error) {
        console.error('Error loading resume data:', error);
        // Fall back to existing HTML content if JSON fails to load
    }
}

/**
 * Initialize sections with content from JSON
 */
function initializeSections() {
    if (!resumeData) return;
    
    // Render each section
    renderSection('summary', resumeData.summary);
    renderSection('qualifications', resumeData.qualifications);
    renderSection('experience', resumeData.experience);
    renderSection('projects', resumeData.projects);
    renderSection('skills', resumeData.skills);
    
    // Initialize display toggles and layout selectors
    initializeDisplayToggles();
    initializeLayoutSelectors();
    
    // Initialize section layouts from selectors
    initializeLayoutClasses();
}

/**
 * Initialize layout classes for all sections based on their selector values
 */
function initializeLayoutClasses() {
    const selectors = document.querySelectorAll('.layout-selector');
    selectors.forEach(selector => {
        const sectionId = selector.getAttribute('data-section');
        const layout = selector.value;
        setLayout(sectionId, layout);
    });
}

/**
 * Render section content based on display mode
 */
function renderSection(sectionId, data) {
    const contentElement = document.querySelector(`[data-content-section="${sectionId}"]`);
    if (!contentElement) return;
    
    const displayMode = getDisplayMode(sectionId);
    
    if (displayMode === 'summary') {
        renderSummaryMode(contentElement, sectionId, data);
    } else {
        renderBulletsMode(contentElement, sectionId, data);
    }
}

/**
 * Render content in summary mode
 */
function renderSummaryMode(contentElement, sectionId, data) {
    if (sectionId === 'summary') {
        contentElement.innerHTML = `<p class="summary-paragraph">${data.summary}</p>`;
    } else if (sectionId === 'qualifications') {
        contentElement.innerHTML = `<p class="summary-paragraph">${data.summary}</p>`;
    } else if (sectionId === 'experience') {
        contentElement.innerHTML = `<p class="summary-paragraph">${data.summary}</p>`;
    } else if (sectionId === 'projects') {
        contentElement.innerHTML = `<p class="summary-paragraph">${data.summary}</p>`;
    } else if (sectionId === 'skills') {
        contentElement.innerHTML = `<p class="summary-paragraph">${data.summary}</p>`;
    }
}

/**
 * Render content in bullets mode
 */
function renderBulletsMode(contentElement, sectionId, data) {
    if (sectionId === 'summary') {
        const bulletsList = data.bullets.map(bullet => `<li>${bullet}</li>`).join('');
        contentElement.innerHTML = `<ul class="bullets-list">${bulletsList}</ul>`;
    } else if (sectionId === 'qualifications') {
        const qualsList = data.items.map(qual => `
            <li data-print-id="${qual.id}">
                <input type="checkbox" class="print-toggle item-toggle" data-target="${qual.id}" checked aria-label="Include ${qual.title}">
                <strong>${qual.title}</strong> ${qual.description ? '– ' + qual.description : ''} ${qual.date ? '(' + qual.date + ')' : ''}
            </li>
        `).join('');
        contentElement.innerHTML = `<ul class="qualifications-list">${qualsList}</ul>`;
    } else if (sectionId === 'experience') {
        const jobsHtml = data.jobs.map(job => {
            const jobMode = getJobDisplayMode(job.id);
            const contentHtml = jobMode === 'summary' 
                ? `<p class="summary-paragraph">${job.summary}</p>`
                : `<ul class="job-duties">${job.duties.map(duty => `<li>${duty}</li>`).join('')}</ul>`;
            
            return `
                <article class="job-entry" data-print-id="${job.id}">
                    <div class="job-title-row">
                        <input type="checkbox" class="print-toggle item-toggle" data-target="${job.id}" checked aria-label="Include ${job.company}">
                        <div class="job-info">
                            <h3>${job.title}</h3>
                            <p class="job-meta">${job.company} | ${job.period}</p>
                        </div>
                        <label class="toggle-switch job-toggle">
                            <span class="toggle-text">Bullets</span>
                            <input type="checkbox" class="job-mode-toggle" data-job="${job.id}" ${jobMode === 'summary' ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-text">Summary</span>
                        </label>
                    </div>
                    ${job.note ? `<p class="note"><em>${job.note}</em></p>` : ''}
                    <div class="job-content" data-job-content="${job.id}">
                        ${contentHtml}
                    </div>
                </article>
            `;
        }).join('');
        contentElement.innerHTML = jobsHtml;
    } else if (sectionId === 'projects') {
        const projectsHtml = data.items.map(project => `
            <article class="project-entry" data-print-id="${project.id}">
                <div class="project-title-row">
                    <input type="checkbox" class="print-toggle item-toggle" data-target="${project.id}" checked aria-label="Include ${project.title}">
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p class="project-meta">${project.role}${project.period ? ' | ' + project.period : ''}</p>
                    </div>
                </div>
                <ul>
                    ${project.description.map(desc => `<li>${desc}</li>`).join('')}
                </ul>
            </article>
        `).join('');
        
        // Add notable projects section
        const notableProjects = `
            <div class="notable-projects">
                <h3>Major Infrastructure & Iconic Projects</h3>
                <div class="project-badges">
                    <span class="badge">Elizabeth Quay</span>
                    <span class="badge">Perth Underground Bus Port</span>
                    <span class="badge">Perth City Link / Yagan Square</span>
                    <span class="badge">Fremantle Ports Outer Harbour</span>
                    <span class="badge">Butler to Perth Rail Link</span>
                </div>
            </div>
        `;
        
        contentElement.innerHTML = projectsHtml + notableProjects;
    } else if (sectionId === 'skills') {
        const skillsHtml = data.categories.map(category => `
            <div class="skill-category" data-print-id="${category.id}">
                <h3><input type="checkbox" class="print-toggle item-toggle" data-target="${category.id}" checked aria-label="Include ${category.title}"> ${category.title}</h3>
                <ul class="skill-tags">
                    ${category.items.map(skill => `<li>${skill}</li>`).join('')}
                </ul>
            </div>
        `).join('');
        contentElement.innerHTML = skillsHtml;
    }
    
    // Re-initialize print controls for newly added checkboxes
    initializePrintControls();
}

/**
 * Initialize display toggle switches
 */
function initializeDisplayToggles() {
    const toggles = document.querySelectorAll('.display-toggle');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const sectionId = this.getAttribute('data-section');
            const displayMode = this.checked ? 'summary' : 'bullets';
            
            setDisplayMode(sectionId, displayMode);
            
            // Re-render the section
            const sectionData = getSectionData(sectionId);
            if (sectionData) {
                renderSection(sectionId, sectionData);
            }
            
            // Save preference
            saveDisplayPreferences();
        });
    });
}

/**
 * Initialize layout selectors
 */
function initializeLayoutSelectors() {
    const selectors = document.querySelectorAll('.layout-selector');
    
    selectors.forEach(selector => {
        selector.addEventListener('change', function() {
            const sectionId = this.getAttribute('data-section');
            const layout = this.value;
            
            setLayout(sectionId, layout);
            saveDisplayPreferences();
        });
    });
}

/**
 * Get section data from resume data
 */
function getSectionData(sectionId) {
    if (!resumeData) return null;
    return resumeData[sectionId];
}

/**
 * Get display mode for a section
 */
function getDisplayMode(sectionId) {
    const toggle = document.querySelector(`.display-toggle[data-section="${sectionId}"]`);
    return toggle && toggle.checked ? 'summary' : 'bullets';
}

/**
 * Set display mode for a section
 */
function setDisplayMode(sectionId, mode) {
    const toggle = document.querySelector(`.display-toggle[data-section="${sectionId}"]`);
    if (toggle) {
        toggle.checked = (mode === 'summary');
    }
}

/**
 * Set layout for a section
 */
function setLayout(sectionId, layout) {
    const section = document.querySelector(`[data-section="${sectionId}"]`);
    if (!section) return;
    
    // Remove existing layout classes
    section.classList.remove('layout-full', 'layout-left', 'layout-right', 'layout-column');
    
    // Add new layout class
    section.classList.add(`layout-${layout}`);
    
    // If this is the portfolio section, reload videos to apply new layout
    if (sectionId === 'portfolio') {
        loadYouTubePortfolio();
    }
}

/**
 * Save display preferences to localStorage
 */
function saveDisplayPreferences() {
    const preferences = {
        displayModes: {},
        layouts: {}
    };
    
    // Save display modes
    const toggles = document.querySelectorAll('.display-toggle');
    toggles.forEach(toggle => {
        const sectionId = toggle.getAttribute('data-section');
        preferences.displayModes[sectionId] = toggle.checked ? 'summary' : 'bullets';
    });
    
    // Save layouts
    const selectors = document.querySelectorAll('.layout-selector');
    selectors.forEach(selector => {
        const sectionId = selector.getAttribute('data-section');
        preferences.layouts[sectionId] = selector.value;
    });
    
    try {
        localStorage.setItem('resumeDisplayPreferences', JSON.stringify(preferences));
    } catch (e) {
        console.log('Unable to save display preferences to local storage');
    }
}

/**
 * Load display preferences from localStorage
 */
function loadDisplayPreferences() {
    try {
        const saved = localStorage.getItem('resumeDisplayPreferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            
            // Restore display modes
            if (preferences.displayModes) {
                Object.keys(preferences.displayModes).forEach(sectionId => {
                    const mode = preferences.displayModes[sectionId];
                    setDisplayMode(sectionId, mode);
                    
                    // Re-render section with saved mode
                    const sectionData = getSectionData(sectionId);
                    if (sectionData) {
                        renderSection(sectionId, sectionData);
                    }
                });
            }
            
            // Restore layouts
            if (preferences.layouts) {
                Object.keys(preferences.layouts).forEach(sectionId => {
                    const layout = preferences.layouts[sectionId];
                    const selector = document.querySelector(`.layout-selector[data-section="${sectionId}"]`);
                    if (selector) {
                        selector.value = layout;
                    }
                    setLayout(sectionId, layout);
                });
            }
        }
    } catch (e) {
        console.log('Unable to load display preferences from local storage');
    }
    
    // Initialize job-level toggles after loading preferences
    initializeJobToggles();
}

/**
 * Get display mode for a specific job
 */
function getJobDisplayMode(jobId) {
    try {
        const saved = localStorage.getItem('resumeDisplayPreferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            if (preferences.jobModes && preferences.jobModes[jobId]) {
                return preferences.jobModes[jobId];
            }
        }
    } catch (e) {
        console.log('Unable to get job display mode');
    }
    return 'bullets'; // Default to bullets
}

/**
 * Initialize job-level toggle switches
 */
function initializeJobToggles() {
    const jobToggles = document.querySelectorAll('.job-mode-toggle');
    
    jobToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const jobId = this.getAttribute('data-job');
            const mode = this.checked ? 'summary' : 'bullets';
            
            // Get the job data
            const experienceData = getSectionData('experience');
            if (!experienceData) return;
            
            const job = experienceData.jobs.find(j => j.id === jobId);
            if (!job) return;
            
            // Update the job content
            const contentElement = document.querySelector(`[data-job-content="${jobId}"]`);
            if (contentElement) {
                if (mode === 'summary') {
                    contentElement.innerHTML = `<p class="summary-paragraph">${job.summary}</p>`;
                } else {
                    contentElement.innerHTML = `<ul class="job-duties">${job.duties.map(duty => `<li>${duty}</li>`).join('')}</ul>`;
                }
            }
            
            // Save preference
            saveJobDisplayMode(jobId, mode);
        });
    });
}

/**
 * Save job display mode to localStorage
 */
function saveJobDisplayMode(jobId, mode) {
    try {
        const saved = localStorage.getItem('resumeDisplayPreferences');
        const preferences = saved ? JSON.parse(saved) : { displayModes: {}, layouts: {}, jobModes: {} };
        
        if (!preferences.jobModes) {
            preferences.jobModes = {};
        }
        
        preferences.jobModes[jobId] = mode;
        localStorage.setItem('resumeDisplayPreferences', JSON.stringify(preferences));
    } catch (e) {
        console.log('Unable to save job display mode');
    }
}
