

// Function to convert normal YouTube URLs into embedded videos from a list
function convertYouTubeList() {
    // Get the container element where the links are listed
    const listContainer = document.getElementById('youtube-list');

    // Ensure the container exists
    if (listContainer) {
        // Get all the list items (li elements)
        const listItems = listContainer.querySelectorAll('li');

        // Function to handle loading iframes as they come into the viewport
        const loadIframe = (iframe, observer) => {
            iframe.src = iframe.dataset.src;  // Set the iframe src to start loading the video
            observer.unobserve(iframe);  // Stop observing this iframe
        };

        // Use IntersectionObserver to trigger lazy loading of iframes
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    loadIframe(iframe, observer);  // Load the current iframe

                    // If the current iframe is fully loaded and there's more content, observe the next item
                    const nextItem = iframe.closest('li').nextElementSibling;
                    if (nextItem) {
                        const nextIframe = nextItem.querySelector('iframe');
                        if (nextIframe) {
                            observer.observe(nextIframe);  // Start observing the next iframe
                        }
                    }
                }
            });
        }, { threshold: 0.1 });  // Load when 50% of the iframe is in the viewport

        listItems.forEach(item => {
            const url = item.textContent.trim();

            // Check if the URL is a YouTube video link
            const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = youtubeRegex.exec(url);

            if (match) {
                const videoId = match[1];

                // Create an iframe element for embedding but don't load yet
                const iframe = document.createElement('iframe');
                iframe.dataset.src = `https://www.youtube.com/embed/${videoId}`;  // Store the URL in a data attribute
                iframe.width = '560';
                iframe.height = '315';
                iframe.frameBorder = '0';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;

                // Replace the text content with the iframe and start observing it
                item.textContent = '';  // Clear the text content
                item.appendChild(iframe);

                // Start observing the iframe for lazy loading
                observer.observe(iframe);
            }
        });
    }
}

// Run the function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', convertYouTubeList);
