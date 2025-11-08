/**
 * Aaron Munro Resume - JavaScript
 * Print customisation with inline checkboxes
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initializePrintControls();
    loadPrintPreferences();
    updateFooterYear();
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
 * Keyboard shortcuts
 */
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
    }
});
