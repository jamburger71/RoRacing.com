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

// Function to handle filtering
function filterSelection(tag) {
    const list = document.getElementById('youtube-list');
    if (!list) {
        console.error('YouTube list container not found!');
        return;
    }

    const items = list.getElementsByTagName('li');
    const buttons = document.querySelectorAll('#myBtnContainer .btn');

    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim() === tag || (tag === 'all' && btn.textContent.trim() === 'Most Recent')) {
            btn.classList.add('active');
        }
    });

    Array.from(items).forEach(item => {
        const tags = item.getAttribute('data-tags')?.split(',') || [];
        const shouldShow = tag.toLowerCase() === 'all' ||
            tags.map(t => t.toLowerCase()).includes(tag.toLowerCase());

        if (shouldShow) {
            item.style.display = '';
            const iframe = item.querySelector('iframe');
            if (iframe && !iframe.src && iframe.dataset.src) {
                globalObserver.observe(iframe);
            }
        } else {
            item.style.display = 'none';
        }
    });

    // Only update URL if it's different from current hash
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
        filterSelection(hash);

        const buttons = document.querySelectorAll('#myBtnContainer .btn');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const tag = this.textContent.trim();
                filterSelection(tag === 'Most Recent' ? 'all' : tag);
            });
        });
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Wait for full page load instead of just DOMContentLoaded
window.addEventListener('load', init);

window.addEventListener('hashchange', function() {
    const hash = window.location.hash.slice(1).toLowerCase() || 'all';
    filterSelection(hash);
});

// Run init immediately if the page is already loaded
if (document.readyState === 'complete') {
    init();
}