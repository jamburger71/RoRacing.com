// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {
    // Get the container and add click listeners to all buttons
    const container = document.getElementById('myBtnContainer');
    if (container) {
        container.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn')) {
                const filter = e.target.textContent.trim();
                handleFilter(filter);
            }
        });
    }

    // Handle URL changes
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            handleFilter(hash);
        }
    });

    // Check initial URL
    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
        handleFilter(initialHash);
    }
});

function handleFilter(filter) {
    // Log for debugging
    console.log('Filtering by:', filter);

    // Get all buttons and items
    const buttons = document.getElementsByClassName('btn');
    const items = document.getElementById('youtube-list').children;

    // Update buttons
    for (let btn of buttons) {
        if (btn.textContent.trim().toLowerCase() === filter.toLowerCase()) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }

    // Update URL
    history.pushState(null, '', `#${filter.toLowerCase()}`);

    // Filter items
    for (let item of items) {
        const tags = item.getAttribute('data-tags');
        if (!tags) continue;

        if (filter.toLowerCase() === 'most recent' || 
            tags.toLowerCase().includes(filter.toLowerCase())) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    }
}