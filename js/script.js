/**
 * Aaron Munro Resume - JavaScript
 * Print customisation and interactive features
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initializePrintControls();
    initializeSmoothScroll();
    initializeExpandButtons();
    loadPrintPreferences();
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
 * Toggle print panel visibility
 */
function togglePrintPanel() {
    const printControls = document.querySelector('.print-controls');
    printControls.classList.toggle('hidden');
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
 * Show print preview (opens print dialog)
 */
function showPrintPreview() {
    window.print();
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
 * Initialize smooth scrolling for navigation links
 */
function initializeSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal links
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navHeight = document.querySelector('.main-nav').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/**
 * Initialize expand/collapse buttons for job descriptions
 */
function initializeExpandButtons() {
    const expandButtons = document.querySelectorAll('.expand-btn');
    
    expandButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleExpand(this);
        });
    });
}

/**
 * Toggle expand/collapse for job details
 */
function toggleExpand(button) {
    const jobEntry = button.closest('.job-entry');
    const jobDetails = jobEntry.querySelector('.job-details');
    
    if (jobDetails) {
        const isExpanded = jobDetails.classList.contains('expanded');
        
        if (isExpanded) {
            jobDetails.classList.remove('expanded');
            button.textContent = 'Show Details';
        } else {
            jobDetails.classList.add('expanded');
            button.textContent = 'Hide Details';
        }
    }
}

/**
 * Handle navigation highlighting on scroll
 */
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Highlight active navigation item
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const navHeight = document.querySelector('.main-nav').offsetHeight;
        
        if (scrollTop >= (sectionTop - navHeight - 100)) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
    
    lastScrollTop = scrollTop;
});

/**
 * Before print event - ensure proper formatting
 */
window.addEventListener('beforeprint', function() {
    // Expand all job details for printing
    const jobDetails = document.querySelectorAll('.job-details');
    jobDetails.forEach(detail => {
        if (!detail.classList.contains('expanded')) {
            detail.style.display = 'block';
        }
    });
});

/**
 * After print event - restore original state
 */
window.addEventListener('afterprint', function() {
    // Restore collapsed state for job details that weren't expanded
    const jobDetails = document.querySelectorAll('.job-details');
    jobDetails.forEach(detail => {
        if (!detail.classList.contains('expanded')) {
            detail.style.display = 'none';
        }
    });
});

/**
 * Handle window resize for responsive adjustments
 */
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Handle responsive adjustments if needed
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile adjustments
            const printControls = document.querySelector('.print-controls');
            if (!printControls.classList.contains('hidden')) {
                // Optionally auto-hide on mobile
            }
        }
    }, 250);
});

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
    }
    
    // Escape to close print panel
    if (e.key === 'Escape') {
        const printControls = document.querySelector('.print-controls');
        if (!printControls.classList.contains('hidden')) {
            togglePrintPanel();
        }
    }
});

/**
 * Add animation on scroll for sections
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for animation
document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});
