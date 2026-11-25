// 0. System Boot Loader Logic
const loader = document.getElementById('a4-loader');

// We use window.addEventListener('load') to ensure all images and assets are fully loaded
window.addEventListener('load', () => {
    // Enforce a minimum display time of 2.2 seconds so the boot animation plays out fully
    setTimeout(() => {
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 2200);
});

document.addEventListener('DOMContentLoaded', () => {

    // 1. Custom Cursor tracking & click feedback (Desktop)
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.addEventListener('mousedown', () => {
            cursor.classList.add('clicking');
        });

        document.addEventListener('mouseup', () => {
            cursor.classList.remove('clicking');
        });
    }

    // 1b. Navbar elevation on scroll (60fps passive listener with requestAnimationFrame)
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        let isScrolled = false;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY > 30;
                    if (scrolled !== isScrolled) {
                        isScrolled = scrolled;
                        navbar.classList.toggle('navbar-scrolled', isScrolled);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // 2. Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Account for the sticky header offset
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Intersection Observer for scroll animations with dynamic staggered delays
    const gridContainers = document.querySelectorAll('.services-flagship-grid, .services-engines-grid, .project-grid, .architecture-stack');
    gridContainers.forEach(container => {
        const items = container.querySelectorAll('.animate-on-scroll');
        items.forEach((item, index) => {
            if (!item.style.transitionDelay) {
                item.style.transitionDelay = `${(index % 4) * 0.08}s`;
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08 // Triggers when element enters viewport
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stops observing once it has animated in
            }
        });
    }, observerOptions);

    // Select all elements with the animate-on-scroll class and observe them
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.observe(el);
    });

    // 4. Form Submission & Web3Forms API + LocalStorage Logic
    const contactForm = document.getElementById('a4ContactForm');
    const successToast = document.getElementById('successToast');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevents full page reload

            // Honeypot check: spambots automatically fill hidden inputs
            const botcheck = document.getElementById('botcheck');
            if (botcheck && botcheck.checked) {
                console.warn('Bot submission blocked.');
                contactForm.reset();
                return;
            }

            // Rate-limiting throttle (10-second cooldown between transmissions)
            const now = Date.now();
            const lastSent = Number(sessionStorage.getItem('nova_last_submission') || 0);
            if (now - lastSent < 10000) {
                const waitSec = Math.ceil((10000 - (now - lastSent)) / 1000);
                alert(`Please wait ${waitSec} second(s) before sending another transmission.`);
                return;
            }

            const name = document.getElementById('userName').value.trim().slice(0, 100);
            const email = document.getElementById('userEmail').value.trim().slice(0, 120);
            const message = document.getElementById('userMessage').value.trim().slice(0, 3000);

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid work email address.');
                return;
            }

            if (!name || !email || !message) return;

            // UI feedback while sending
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Transmitting Payload...';
            }

            const formData = {
                access_key: '914edbca-5f5e-4ed4-8574-67fca47922b2',
                subject: 'New Project Inquiry | NovaOps',
                from_name: 'NovaOps Website',
                name: name,
                email: email,
                message: message
            };

            try {
                // Send email notification via Web3Forms
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.status === 200 && result.success) {
                    sessionStorage.setItem('nova_last_submission', String(Date.now()));

                    // Save sanitized copy to localStorage for the Admin Panel
                    const localEntry = {
                        name: name,
                        email: email,
                        message: message,
                        date: new Date().toLocaleString()
                    };
                    let submissions = JSON.parse(localStorage.getItem('novaSubmissions')) || [];
                    submissions.push(localEntry);
                    localStorage.setItem('novaSubmissions', JSON.stringify(submissions));

                    // Show animated success toast
                    if (successToast) {
                        successToast.style.display = 'flex';
                        successToast.classList.remove('show');
                        void successToast.offsetWidth; // Force CSS reflow to restart entrance & progress animations
                        successToast.classList.add('show');
                    }
                    contactForm.reset();
                } else {
                    alert('Submission failed: ' + (result.message || 'Please try again.'));
                }
            } catch (err) {
                console.error('Web3Forms transmission error:', err);
                alert('Connection error. Please try again or reach out directly to sk@novaops.in.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Execute Transmission';
                }
                setTimeout(() => {
                    if (successToast) {
                        successToast.classList.remove('show');
                        setTimeout(() => {
                            if (!successToast.classList.contains('show')) {
                                successToast.style.display = 'none';
                            }
                        }, 400);
                    }
                }, 4200);
            }
        });
    }

    // 5. Hero Terminal Typing Animation
    const heroTerminal = document.querySelector('.hero-terminal .terminal-body');
        if (heroTerminal) {
            const lines = heroTerminal.querySelectorAll('.code-line');
            // Hide all lines initially
            lines.forEach(line => line.style.display = 'none');

            // Wait for the main boot loader to finish before starting the terminal typing
            setTimeout(() => {
                let delay = 0;
                lines.forEach((line) => {
                    setTimeout(() => {
                        line.style.display = 'block';
                    }, delay);
                    delay += 350; // 350ms wait between each line popping up
                });
            }, 2400); // matches the loader finishing
        }

    });
