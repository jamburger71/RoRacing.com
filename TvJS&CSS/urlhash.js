// Store the current filter state
let currentFilter = 'all';

// Function to convert normal YouTube URLs into embedded videos with lazy loading
function convertYouTubeList() {
    const listContainer = document.getElementById('youtube-list');
    
    if (!listContainer) return;

    const listItems = listContainer.querySelectorAll('li');
    
    // Function to handle loading iframes as they come into viewport
    const loadIframe = (iframe, observer) => {
        if (!iframe.src && iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
        }
        observer.unobserve(iframe);
    };

    // Create intersection observer for lazy loading
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                loadIframe(iframe, observer);

                const nextItem = iframe.closest('li').nextElementSibling;
                if (nextItem) {
                    const nextIframe = nextItem.querySelector('iframe');
                    if (nextIframe) {
                        observer.observe(nextIframe);
                    }
                }
            }
        });
    }, { threshold: 0.1 });

    // Process each list item
    listItems.forEach(item => {
        const url = item.textContent.trim();
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = youtubeRegex.exec(url);

        if (match) {
            const videoId = match[1];
            
            // Create iframe but don't load yet
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
            
            // Start observing
            observer.observe(iframe);
        }
    });
}

// Function to handle filtering
function filterSelection(tag) {
    event?.preventDefault();
    currentFilter = tag.toLowerCase();
    
    const list = document.getElementById('youtube-list');
    const items = list.getElementsByTagName('li');
    const buttons = document.getElementsByClassName('btn');
    
    // Update button states
    for (const btn of buttons) {
        btn.classList.remove('active');
    }
    
    const clickedButton = [...buttons].find(btn => 
        btn.textContent.trim().toLowerCase().includes(currentFilter));
    if (clickedButton) clickedButton.classList.add('active');

    // Filter items
    for (const item of items) {
        const tags = item.getAttribute('data-tags')?.split(',') || [];
        if (currentFilter === 'all' || tags.map(t => t.toLowerCase()).includes(currentFilter)) {
            item.style.display = '';
            // Trigger intersection observer by scrolling slightly
            window.scrollBy(0, 1);
            window.scrollBy(0, -1);
        } else {
            item.style.display = 'none';
        }
    }
    
    // Update URL
    history.pushState(null, '', `#${currentFilter}`);
}

// Handle URL hash changes
function handleUrlHash() {
    const hash = window.location.hash.slice(1).toLowerCase() || currentFilter;
    filterSelection(hash);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    // First convert YouTube links
    convertYouTubeList();
    
    // Setup filter buttons
    const buttons = document.getElementsByClassName('btn');
    for (const button of buttons) {
        button.replaceWith(button.cloneNode(true));
    }
    
    // Add click handlers
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
    
    // Set initial state
    const initialHash = window.location.hash.slice(1).toLowerCase() || 'all';
    currentFilter = initialHash;
    filterSelection(initialHash);
});