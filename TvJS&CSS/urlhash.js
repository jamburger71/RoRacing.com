// Function to handle URL hash changes and filter content
function handleUrlFilter() {
    // Get the hash from URL without the # symbol
    let hash = window.location.hash.slice(1).toLowerCase();
    
    // Map common URL parameters to button tags
    const hashToTag = {
      'recent': 'all',
      'recommended': 'Recommended',
      'exclusives': 'Execlusives',
      'promoted': 'Promoted'
    };
    
    // If hash exists and is mapped, use it; otherwise default to 'all'
    const filterTag = hashToTag[hash] || 'all';
    
    // Apply the filter
    filterSelection(filterTag);
  }
  
  // Update the filterSelection function to handle URL updates
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
    
    // Update URL hash without triggering the hashchange event
    const tagToHash = {
      'all': 'recent',
      'Recommended': 'recommended',
      'Execlusives': 'exclusives',
      'Promoted': 'promoted'
    };
    
    const newHash = tagToHash[tag] || 'recent';
    history.pushState(null, '', `#${newHash}`);
  }
  
  // Update button click handlers
  document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.getElementsByClassName('btn');
    for (const button of buttons) {
      button.onclick = function() {
        const tag = this.textContent.trim();
        filterSelection(tag === 'Most Recent' ? 'all' : tag);
      };
    }
    
    // Handle direct URL access and back/forward navigation
    window.addEventListener('hashchange', handleUrlFilter);
    
    // Handle initial page load
    handleUrlFilter();
  });