document.addEventListener("DOMContentLoaded", function () {
    function filterSelection(tag) {
        const list = document.getElementById('youtube-list').children;
        const buttons = document.getElementsByClassName('btn');
        
        // Reset button active state
        for (const btn of buttons) {
            btn.classList.remove('active');
        }
        
        // Set the active button
        const clickedButton = [...buttons].find(btn => btn.textContent.includes(tag));
        if (clickedButton) clickedButton.classList.add('active');

        // Filter videos
        for (const item of list) {
            const tags = item.getAttribute('data-tags').split(',');
            if (tag === 'all' || tags.includes(tag)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        }
    }

    function applyFilterFromURL() {
        const hash = window.location.hash.substring(1); // Remove the '#' from the hash
        if (hash) {
            filterSelection(hash);
        } else {
            filterSelection('all'); // Default filter
        }
    }

    // Listen for hash changes
    window.addEventListener("hashchange", applyFilterFromURL);

    // Apply filter on page load
    applyFilterFromURL();
});
