// Create a global observer that we can reuse
let globalObserver;
let isAnimating = false; // Flag to prevent overlapping animations

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

// Function to handle filtering with animations
function filterSelection(tag) {
    if (isAnimating) return; // Prevent new animations while the current one is ongoing
    isAnimating = true;

    const listItems = document.querySelectorAll("#youtube-list li");

    // First, apply the fade-out animation to all items
    listItems.forEach((item) => {
        item.classList.remove("fade-in"); // Ensure the fade-in class is removed
        item.classList.add("fade-out"); // Add the fade-out class to all items
        setTimeout(() => {
            item.style.display = "none"; // Hide the item after fade-out animation
        }, 300); // Duration of fade-out animation
    });

    // After a short delay, filter and apply fade-in to the relevant items
    setTimeout(() => {
        listItems.forEach((item) => {
            const shouldShow = tag.toLowerCase() === "all" || (item.dataset.tags && item.dataset.tags.toLowerCase().includes(tag.toLowerCase()));

            if (shouldShow) {
                item.style.display = ""; // Revert the display to make it visible
                item.classList.remove("fade-out"); // Remove fade-out class
                item.classList.add("fade-in"); // Apply fade-in animation
                
                // Reobserve iframe if needed
                const iframe = item.querySelector('iframe');
                if (iframe && !iframe.src && iframe.dataset.src) {
                    globalObserver.observe(iframe);
                }
            }
        });

        // Update the active button
        const buttons = document.querySelectorAll(".btn");
        buttons.forEach((button) => button.classList.remove("active"));

        const activeButton = Array.from(buttons).find((button) =>
            button.textContent.trim().toLowerCase() === (tag === "all" ? "most recent" : tag.toLowerCase())
        );

        if (activeButton) {
            activeButton.classList.add("active");
        }

        // Update URL hash without triggering hashchange event
        const newHash = `#${tag.toLowerCase()}`;
        if (window.location.hash.toLowerCase() !== newHash) {
            history.pushState(null, '', newHash);
        }

        // Reset the animation flag after animations complete
        isAnimating = false;
    }, 350); // Wait until all items have been hidden before showing the filtered items
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    // Convert YouTube links first
    convertYouTubeList(() => {
        // Set up filter buttons
        const buttons = document.querySelectorAll('#myBtnContainer .btn');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const tag = this.textContent.trim();
                filterSelection(tag === 'Most Recent' ? 'all' : tag);
            });
        });

        // Handle initial hash after everything is set up
        const initialHash = window.location.hash.slice(1).toLowerCase() || 'all';
        filterSelection(initialHash);
    });
});

// Handle URL hash changes
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.slice(1).toLowerCase() || 'all';
    filterSelection(hash);
});