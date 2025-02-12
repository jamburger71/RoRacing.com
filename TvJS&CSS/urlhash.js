// Function to handle filtering and URL updates
function filterSelection(tag) {
    // Get all items and buttons
    const list = document.getElementById('youtube-list').children;
    const buttons = document.getElementsByClassName('btn');
    
    // Update URL without reload
    window.location.hash = tag.toLowerCase();
    
    // Update buttons
    for (let btn of buttons) {
        if (btn.textContent.trim().toLowerCase() === tag.toLowerCase()) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
    
    // Filter items
    for (let item of list) {
        const tags = item.getAttribute('data-tags').split(',');
        if (tag.toLowerCase() === 'all' || tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    }
}

// Function to handle URL hash changes
function handleHash() {
    const hash = window.location.hash.slice(1) || 'all';
    filterSelection(hash);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Handle hash changes
    window.addEventListener('hashchange', handleHash);
    
    // Initial load
    handleHash();
});