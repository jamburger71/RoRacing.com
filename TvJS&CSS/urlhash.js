// Store the current filter state
let currentFilter = 'all';

function filterSelection(tag) {
    // Prevent default filter to 'all'
    event.preventDefault();
    
    // Update current filter
    currentFilter = tag.toLowerCase();
    
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

    // Filter videos
    for (const item of list) {
        const tags = item.getAttribute('data-tags')?.split(',') || [];
        if (currentFilter === 'all' || tags.map(t => t.toLowerCase()).includes(currentFilter)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    }
    
    // Update URL without triggering reload
    history.pushState(null, '', `#${currentFilter}`);
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
});

// Prevent any automatic reversion to 'all'
window.addEventListener('load', function(e) {
    e.preventDefault();
    if (currentFilter !== 'all') {
        setTimeout(() => filterSelection(currentFilter), 100);
    }
});