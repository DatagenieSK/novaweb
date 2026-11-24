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

    // 1. Custom Cursor tracking (Desktop)
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
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

    // 3. Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Triggers when 10% of the element is visible
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

                const name = document.getElementById('userName').value.trim();
                const email = document.getElementById('userEmail').value.trim();
                const message = document.getElementById('userMessage').value.trim();

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
                        // Save to localStorage for the Admin Panel
                        const localEntry = {
                            name: name,
                            email: email,
                            message: message,
                            date: new Date().toLocaleString()
                        };
                        let submissions = JSON.parse(localStorage.getItem('novaSubmissions')) || [];
                        submissions.push(localEntry);
                        localStorage.setItem('novaSubmissions', JSON.stringify(submissions));

                                // Show success toast
                                if (successToast) {
                                    successToast.innerHTML = '<span style="font-size: 1.5rem;">🚀</span> Project Payload Delivered! Email dispatched to sk@novaops.in.';
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
                            }
                        }, 4000);
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
