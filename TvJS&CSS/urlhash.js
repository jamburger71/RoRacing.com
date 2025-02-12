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
                    iframe.src = iframe.dataset.src;
                }
                observer.unobserve(iframe);
            }
        });
    }, { threshold: 0.1 });
}

// Function to convert YouTube URLs to embeds
function convertYouTubeList() {
    return new Promise((resolve) => {
        const listContainer = document.getElementById('youtube-list');
        if (!listContainer) {
            console.error('YouTube list container not found!');
            resolve();
            return;
        }

        setupObserver();
        const listItems = listContainer.querySelectorAll('li');
        let processedItems = 0;

        if (listItems.length === 0) {
            resolve();
            return;
        }

        listItems.forEach(item => {
            if (item.querySelector('iframe')) {
                processedItems++;
                if (processedItems === listItems.length) resolve();
                return;
            }

            const url = item.textContent.trim();
            const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = youtubeRegex.exec(url);

            if (match) {
                const videoId = match[1];
                const iframe = document.createElement('iframe');
                iframe.dataset.src = `https://www.youtube.com/embed/${videoId}`;
                iframe.width = '560';
                iframe.height = '315';
                iframe.frameBorder = '0';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;

                item.textContent = '';
                item.appendChild(iframe);
                globalObserver.observe(iframe);
            } else {
                console.warn('Invalid YouTube URL:', url);
            }

            processedItems++;
            if (processedItems === listItems.length) resolve();
        });
    });
}

// Function to handle filtering with animations
function filterSelection(tag, skipAnimation = false) {
    if (isAnimating) return; // Prevent new animations while current one is ongoing
    
    const list = document.getElementById('youtube-list');
    if (!list) {
        console.error('YouTube list container not found!');
        return;
    }

    if (skipAnimation) {
        // Immediate filtering without animation for initial load
        const items = list.getElementsByTagName('li');
        Array.from(items).forEach(item => {
            const tags = item.getAttribute('data-tags')?.split(',') || [];
            const shouldShow = tag.toLowerCase() === 'all' ||
                tags.map(t => t.toLowerCase()).includes(tag.toLowerCase());
            
            item.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                const iframe = item.querySelector('iframe');
                if (iframe && !iframe.src && iframe.dataset.src) {
                    globalObserver.observe(iframe);
                }
            }
        });
    } else {
        isAnimating = true;
        const listItems = list.querySelectorAll('li');

        // First, apply the fade-out animation to all items
        listItems.forEach((item) => {
            item.classList.remove("fade-in");
            item.classList.add("fade-out");
            setTimeout(() => {
                item.style.display = "none";
            }, 300);
        });

        // After a short delay, filter and apply fade-in to the relevant items
        setTimeout(() => {
            listItems.forEach((item) => {
                const tags = item.getAttribute('data-tags')?.split(',') || [];
                const shouldShow = tag.toLowerCase() === 'all' ||
                    tags.map(t => t.toLowerCase()).includes(tag.toLowerCase());

                if (shouldShow) {
                    item.style.display = "";
                    item.classList.remove("fade-out");
                    item.classList.add("fade-in");
                    
                    const iframe = item.querySelector('iframe');
                    if (iframe && !iframe.src && iframe.dataset.src) {
                        globalObserver.observe(iframe);
                    }
                }
            });

            isAnimating = false;
        }, 350);
    }

    // Update active button state
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim().toLowerCase() === (tag === 'all' ? 'most recent' : tag).toLowerCase()) {
            btn.classList.add('active');
        }
    });

    // Update URL only if hash has changed
    const currentHash = window.location.hash.slice(1).toLowerCase();
    const newHash = tag.toLowerCase();
    if (currentHash !== newHash) {
        history.pushState(null, '', `#${newHash}`);
    }
}

// Initialize everything
async function init() {
    try {
        await convertYouTubeList();
        
        // Get the hash after conversion is complete
        const hash = window.location.hash.slice(1).toLowerCase() || 'all';
        // Use skipAnimation=true for initial load
        filterSelection(hash, true);

        const buttons = document.querySelectorAll('#myBtnContainer .btn');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const tag = this.textContent.trim();
                filterSelection(tag === 'Most Recent' ? 'all' : tag, false);
            });
        });
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Remove the initial filterSelection("All") call since it's handled in init

// Wait for full page load
window.addEventListener('load', init);

// Handle hash changes
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.slice(1).toLowerCase() || 'all';
    filterSelection(hash, false);
});

// Run init immediately if the page is already loaded
if (document.readyState === 'complete') {
    init();
}