       // --- Smooth Scrolling for Nav Links & Buttons ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        function scrollToSection(sectionId) {
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        }

        // --- Animations & Effects on Scroll ---
        document.addEventListener('DOMContentLoaded', () => {
            // Fade-in animation observer
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.fade-in').forEach(el => {
                observer.observe(el);
            });
            
            // Navbar sticky effect & scroll indicator
            const navbar = document.getElementById('navbar');
            const scrollIndicator = document.getElementById('scrollIndicator');
            const scrollHandler = () => {
                // Sticky Nav
                if (window.scrollY > 50) {
                    navbar.classList.add('nav-sticky');
                } else {
                    navbar.classList.remove('nav-sticky');
                }
                
                // Scroll Indicator
                const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrollProgress = (window.scrollY / totalHeight) * 100;
                scrollIndicator.style.transform = `scaleX(${scrollProgress / 100})`;
            };
            
            window.addEventListener('scroll', scrollHandler);
            scrollHandler(); // Initial check
        });
// (duplicate scroll/observer handlers removed)
