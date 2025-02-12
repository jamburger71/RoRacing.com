// Create a global observer that we can reuse
let globalObserver;

// Function to create and setup the intersection observer
function setupObserver() {
    globalObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (!iframe.src && iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                }
                observer.unobserve(iframe);
            }
        });
    }, { threshold: 0.1 });
}

// Function to convert YouTube URLs to embeds
function convertYouTubeList() {
    const listContainer = document.getElementById('youtube-list');
    if (!listContainer) return;

    setupObserver();
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
            iframe.dataset.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.width = '560';
            iframe.height = '315';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;

            // Clear and append
            item.textContent = '';
            item.appendChild(iframe);
            
            // Observe the iframe
            globalObserver.observe(iframe);
        }
    });
}

// Function to handle filtering
function filterSelection(tag) {
    const list = document.getElementById('youtube-list');
    const items = list.getElementsByTagName('li');
    const buttons = document.getElementsByClassName('btn');
    
    // Update button states
    for (const btn of buttons) {
        btn.classList.remove('active');
    }
    
    const clickedButton = [...buttons].find(btn => 
        btn.textContent.trim().toLowerCase().includes(tag.toLowerCase()));
    if (clickedButton) clickedButton.classList.add('active');

    // Filter items
    Array.from(items).forEach(item => {
        const tags = item.getAttribute('data-tags')?.split(',') || [];
        const shouldShow = tag.toLowerCase() === 'all' || 
                          tags.map(t => t.toLowerCase()).includes(tag.toLowerCase());
        
        if (shouldShow) {
            item.style.display = '';
            const iframe = item.querySelector('iframe');
            if (iframe && !iframe.src && iframe.dataset.src) {
                // Re-observe the iframe if it hasn't been loaded
                globalObserver.observe(iframe);
            }
        } else {
            item.style.display = 'none';
        }
    });

    // Update URL
    history.pushState(null, '', `#${tag.toLowerCase()}`);
    
    // Force a recheck of visible iframes
    setTimeout(() => {
        const visibleIframes = list.querySelectorAll('li[style=""] iframe:not([src])');
        visibleIframes.forEach(iframe => {
            if (iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
            }
        });
    }, 100);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    // First convert YouTube links
    convertYouTubeList();

    // Handle initial URL hash (before attaching any events)
    const hash = window.location.hash.slice(1) || 'all';
    filterSelection(hash);  // Trigger filtering immediately

    // Setup filter buttons
    const buttons = document.getElementsByClassName('btn');
    for (const button of buttons) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tag = this.textContent.trim();
            filterSelection(tag === 'Most Recent' ? 'all' : tag);
        });
    }
});

// Handle URL hash changes
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.slice(1) || 'all';
    setTimeout(() => filterSelection(hash), 50);  // Add a small delay to ensure everything is ready
});
