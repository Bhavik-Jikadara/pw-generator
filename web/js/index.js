document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const modeToggle = document.getElementById('mode-toggle');
    const modeIcon = document.getElementById('mode-icon');
    const body = document.body;

    // Set default to dark mode
    body.classList.add('dark-mode');
    modeIcon.classList.replace('fa-moon', 'fa-sun');

    // Apply user's previous dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode === 'enabled') {
        // Keep dark mode if previously enabled
        body.classList.add('dark-mode');
        modeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        // Remove dark mode if previously disabled
        body.classList.remove('dark-mode');
        modeIcon.classList.replace('fa-sun', 'fa-moon');
    }

    // Toggle navigation menu visibility
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Toggle dark mode
    modeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        modeIcon.classList.toggle('fa-moon', !isDarkMode);
        modeIcon.classList.toggle('fa-sun', isDarkMode);

        // Save dark mode preference
        localStorage.setItem('dark-mode', isDarkMode ? 'enabled' : 'disabled');
    });
});
