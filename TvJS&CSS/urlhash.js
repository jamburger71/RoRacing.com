function filterSelection(tag) {
    const list = document.getElementById('youtube-list').children;
    const buttons = document.querySelectorAll('.btn');
    
    // Update URL hash
    const newHash = tag.toLowerCase();
    history.pushState(null, '', `#${newHash}`);
    
    // Update button states
    buttons.forEach(btn => {
        if (btn.getAttribute('data-filter').toLowerCase() === tag.toLowerCase()) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Filter items
    Array.from(list).forEach(item => {
        const tags = item.getAttribute('data-tags')?.split(',') || [];
        if (tag.toLowerCase() === 'all' || tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

// Handle URL hash changes
function handleHash() {
    let hash = window.location.hash.slice(1).toLowerCase() || 'all';
    filterSelection(hash);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const filter = this.getAttribute('data-filter');
            filterSelection(filter);
        });
    });

    // Handle hash changes
    window.addEventListener('hashchange', handleHash);
    
    // Initial load - handle current URL hash
    handleHash();
});