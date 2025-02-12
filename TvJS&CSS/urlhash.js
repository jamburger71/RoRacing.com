document.addEventListener("DOMContentLoaded", function () {
    function activateFilterFromHash() {
        // Get the hash from the URL (without the #) and normalize it
        let hash = window.location.hash.substring(1).toLowerCase();

        // Ensure proper case for matching filterSelection function
        let filter = hash.charAt(0).toUpperCase() + hash.slice(1);

        // Get all buttons
        let buttons = document.querySelectorAll("#myBtnContainer .btn");

        // Remove 'active' class from all buttons
        buttons.forEach(button => button.classList.remove("active"));

        // Find and activate the corresponding button
        let targetButton = Array.from(buttons).find(button => 
            button.textContent.trim().toLowerCase() === filter.toLowerCase()
        );

        if (targetButton) {
            targetButton.classList.add("active");
            filterSelection(filter);
        } else {
            // Default to 'all' if no match is found
            filterSelection('all');
        }
    }

    // Run on page load
    activateFilterFromHash();

    // Listen for hash changes
    window.addEventListener("hashchange", activateFilterFromHash);
});
