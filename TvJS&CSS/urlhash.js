// Store the current filter state
let currentFilter = 'all';

function filterSelection(tag) {
    // Prevent default
    event?.preventDefault();
    
    // Update current filter
    currentFilter = tag.toLowerCase();
    
    // Get all list items and buttons
    const list = document.getElementById('youtube-list').children;
    const buttons = document.getElementsByClassName('btn');
    
    // Reset button active state
    for (const btn of buttons) {
        btn.classList.remove('active');
    }
    
    // Set the active button
    const clickedButton = [...buttons].find(btn => 
        btn.textContent.trim().toLowerCase().includes(currentFilter));
    if (clickedButton) clickedButton.classList.add('active');

    // Filter videos - using display block/none instead of hidden class
    for (const item of list) {
        const tags = item.getAttribute('data-tags')?.split(',') || [];
        if (currentFilter === 'all' || tags.map(t => t.toLowerCase()).includes(currentFilter)) {
            item.style.display = 'block'; // or whatever display value you normally use
            // Also try removing any hide classes that might exist
            item.classList.remove('hidden', 'hide', 'd-none');
        } else {
            item.style.display = 'none';
            // Add hide class if you're using one
            item.classList.add('hidden');
        }
        
        // Log for debugging
        console.log(`Item ${item.id || 'unknown'}: tags=${tags}, visibility=${item.style.display}`);
    }
    
    // Update URL without triggering reload
    history.pushState(null, '', `#${currentFilter}`);
    
    // Log current state
    console.log('Current filter:', currentFilter);
    console.log('Visible items:', [...list].filter(item => item.style.display !== 'none').length);
}

// Handle URL hash changes
function handleUrlHash() {
    const hash = window.location.hash.slice(1).toLowerCase() || currentFilter;
    filterSelection(hash);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    // Remove any existing click handlers
    const buttons = document.getElementsByClassName('btn');
    for (const button of buttons) {
        button.replaceWith(button.cloneNode(true));
    }
    
    // Add new click handlers
    const newButtons = document.getElementsByClassName('btn');
    for (const button of newButtons) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tag = this.textContent.trim();
            filterSelection(tag === 'Most Recent' ? 'all' : tag);
        }, true);
    }
    
    // Handle hash changes
    window.addEventListener('hashchange', handleUrlHash);
    
    // Set initial state from URL or default to 'all'
    const initialHash = window.location.hash.slice(1).toLowerCase() || 'all';
    currentFilter = initialHash;
    filterSelection(initialHash);
    
    // Log initial state
    console.log('Initialization complete. Initial filter:', currentFilter);
});