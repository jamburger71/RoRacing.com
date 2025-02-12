// Create a global observer that we can reuse
let globalObserver;

// Function to create and setup the intersection observer
function setupObserver() {
    globalObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (!iframe.src && iframe.dataset.src) {
                    iframe.src = iframe.dataset.src; // Load the iframe only when it's in the viewport
                }
                observer.unobserve(iframe); // Stop observing once loaded
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% of the iframe is visible
}

// Function to convert YouTube URLs to embeds
function convertYouTubeList(callback) {
    const listContainer = document.getElementById('youtube-list');
    if (!listContainer) {
        console.error('YouTube list container not found!');
        return;
    }

    setupObserver(); // Set up the observer

    const listItems = listContainer.querySelectorAll('li');

    listItems.forEach(item => {
        // Skip if already converted
        if (item.querySelector('iframe')) return;

        const url = item.textContent.trim();
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = youtubeRegex.exec(url);

        if (match) {
            const videoId = match[1];

            // Create iframe
            const iframe = document.createElement('iframe');
            iframe.dataset.src = `https://www.youtube.com/embed/${videoId}`; // Use data-src to lazy load
            iframe.width = '560';
            iframe.height = '315';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;

            // Clear the text content and append the iframe
            item.textContent = '';
            item.appendChild(iframe);

            // Observe the iframe for lazy loading
            globalObserver.observe(iframe);
        } else {
            console.warn('Invalid YouTube URL:', url);
        }
    });

    // Run the callback after YouTube links are converted
    if (callback) callback();
}

// Function to handle filtering
function filterSelection(tag) {
    const list = document.getElementById('youtube-list');
    if (!list) {
        console.error('YouTube list container not found!');
        return;
    }

    const items = list.getElementsByTagName('li');
    const buttons = document.querySelectorAll('#myBtnContainer .btn');

    // Update button states
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim() === tag || (tag === 'all' && btn.textContent.trim() === 'Most Recent')) {
            btn.classList.add('active');
        }
    });

    // Filter items
    Array.from(items).forEach(item => {
        const tags = item.getAttribute('data-tags')?.split(',') || [];
        const shouldShow = tag.toLowerCase() === 'all' ||
            tags.map(t => t.toLowerCase()).includes(tag.toLowerCase());

        if (shouldShow) {
            item.style.display = ''; // Show the item
            const iframe = item.querySelector('iframe');
            if (iframe && !iframe.src && iframe.dataset.src) {
                // Re-observe the iframe if it hasn't been loaded
                globalObserver.observe(iframe);
            }
        } else {
            item.style.display = 'none'; // Hide the item
        }
    });

    // Update URL hash
    history.pushState(null, '', `#${tag.toLowerCase()}`);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function () {
    // Convert YouTube links first, then handle filtering
    convertYouTubeList(() => {
        // Handle initial URL hash (before attaching any events)
        const hash = window.location.hash.slice(1) || 'all';
        filterSelection(hash); // Trigger filtering immediately after converting iframes

        // Setup filter buttons
        const buttons = document.querySelectorAll('#myBtnContainer .btn');
        buttons.forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                const tag = this.textContent.trim();
                filterSelection(tag === 'Most Recent' ? 'all' : tag);
            });
        });
    });
});

// Handle URL hash changes
window.addEventListener('hashchange', function () {
    const hash = window.location.hash.slice(1) || 'all';
    filterSelection(hash); // Re-filter when the hash changes
});