// DOM Elements
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const scrollTopBtn = document.getElementById('scroll-top');
const loading = document.querySelector('.loading');
const copyButtons = document.querySelectorAll('.copy-btn');

// Theme Management
const setTheme = (isDark) => {
    document.body.classList.toggle('dark-theme', isDark);
    themeIcon.classList.toggle('fa-moon', !isDark);
    themeIcon.classList.toggle('fa-sun', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

// Initialize theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme === 'dark');
}

// Event Listeners
themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-theme');
    setTheme(isDark);
});

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && 
        !e.target.closest('.nav-links') && 
        !e.target.closest('.menu-toggle')) {
        navLinks.classList.remove('active');
        menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            // Close mobile menu if open
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
            
            // Smooth scroll to target
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Debounce function to limit the rate of function execution
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

// Scroll to top functionality with debounce
const toggleScrollButton = debounce(() => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}, 100); // Adjust delay as needed

window.addEventListener('scroll', toggleScrollButton);

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Remove loading screen
window.addEventListener('load', () => {
    setTimeout(() => {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 300);
    }, 500);
});

// Fallback for long loading times
setTimeout(() => {
    if (loading.style.display !== 'none') {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 300);
    }
}, 10000); // Fallback after 10 seconds

// Add scroll animation
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.installation-grid > *, .features-grid > *, .guide-grid > *')
        .forEach(element => {
            element.classList.add('animate');
            observer.observe(element);
        });
};

// Initialize animations
document.addEventListener('DOMContentLoaded', observeElements);

// Copy to clipboard functionality with error handling
copyButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const text = button.dataset.text;
        try {
            await navigator.clipboard.writeText(text);
            const icon = button.querySelector('i');
            icon.classList.replace('fa-copy', 'fa-check');
            setTimeout(() => {
                icon.classList.replace('fa-check', 'fa-copy');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            alert('Failed to copy text. Please try again.'); // User feedback
        }
    });
});