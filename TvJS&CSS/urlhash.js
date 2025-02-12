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

    history.pushState(null, '', `#${tag.toLowerCase()}`);
}

// Initialize everything
async function init() {
    await convertYouTubeList();
    
    // Add 4 second delay before filtering
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const hash = window.location.hash.slice(1) || 'all';
    filterSelection(hash);

    const buttons = document.querySelectorAll('#myBtnContainer .btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tag = this.textContent.trim();
            filterSelection(tag === 'Most Recent' ? 'all' : tag);
        });
    });
}

document.addEventListener('DOMContentLoaded', init);

window.addEventListener('hashchange', function() {
    const hash = window.location.hash.slice(1) || 'all';
    filterSelection(hash);
});