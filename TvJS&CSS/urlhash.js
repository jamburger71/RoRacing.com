document.addEventListener("DOMContentLoaded", function () {
    function activateFilterFromHash() {
        // Get the hash from the URL and clean it
        let hash = window.location.hash.substring(1).toLowerCase(); // Remove '#' and lowercase
        
        if (!hash) {
            filterSelection('all'); // Default if no hash is present
            return;
        }

        // Standardize filter text (capitalize first letter)
        let filter = hash.charAt(0).toUpperCase() + hash.slice(1);

        // Get all buttons
        let buttons = document.querySelectorAll("#myBtnContainer .btn");

        // Remove 'active' class from all buttons
        buttons.forEach(button => button.classList.remove("active"));

        // Find the matching button
        let targetButton = Array.from(buttons).find(button => 
            button.textContent.trim().toLowerCase() === filter.toLowerCase()
        );

        // Activate button and apply filter
        if (targetButton) {
            targetButton.classList.add("active");
            filterSelection(filter);
        } else {
            filterSelection('all'); // Fallback if no match
        }
    }

    // Ensure the function runs on page load
    activateFilterFromHash();

    // Listen for URL hash changes dynamically
    window.addEventListener("hashchange", activateFilterFromHash);
});
