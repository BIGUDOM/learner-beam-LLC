        // DOM Elements
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('#nav-menu a');
        const notification = document.querySelector('.notification');
        const countryEl = document.getElementById('country');
        const amountEl = document.getElementById('amount');
        const contactForm = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');
        const successMessage = document.getElementById('successMessage');
        const statNumbers = {
            response: document.getElementById('response'),
            support: document.getElementById('support'),
            satisfaction: document.getElementById('satisfaction'),
            countries: document.getElementById('countries')
        };
        
        // Mobile Menu Toggle
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close mobile menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
        
        // Form Submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const topic = document.getElementById('topic').value;
            const region = document.getElementById('region').value;
            const note = document.getElementById('note').value.trim();
            
            if (!name || !email || !topic || !region || !note) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Simulate form submission delay
            setTimeout(() => {
                // Reset form
                contactForm.reset();
                
                // Show success message
                successMessage.style.display = 'block';
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
                
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
            }, 1500);
        });
        
        // Notification System
        const countries = ['London', 'California', 'Germany', 'France', 'Italy', 'USA', 'Australia', 'Canada', 'Argentina', 'Saudi Arabia', 'Mexico', 'Kenya', 'India', 'Pakistan', 'United Kingdom', 'Greece', 'Netherlands', 'Switzerland', 'Belgium', 'Israel'];
        const amounts = ['$600', '$500', '$1,000', '$2,150', '$8,400', '$3,220', '$400', '$750', '$2,500', '$6,000', '$18,000', '$12,000'];
        
        function showNotification() {
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];
            const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
            
            countryEl.textContent = randomCountry;
            amountEl.textContent = randomAmount;
            
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 8000);
        }
        
        // Show first notification after 2 seconds
        setTimeout(showNotification, 2000);
        
        // Show random notifications periodically
        setInterval(() => {
            showNotification();
        }, Math.floor(Math.random() * 22000) + 8000);
        
        // Stats Counter Animation
        function animateCounters() {
            const stats = {
                response: 2,
                support: 150,
                satisfaction: 98,
                countries: 150
            };
            
            // Response time counter
            statNumbers.response.textContent = stats.response;
            
            // Support agents counter
            const supportEl = statNumbers.support;
            let supportCurrent = 0;
            const supportInterval = setInterval(() => {
                supportCurrent += 5;
                supportEl.textContent = supportCurrent;
                if (supportCurrent >= stats.support) {
                    supportEl.textContent = stats.support;
                    clearInterval(supportInterval);
                }
            }, 30);
            
            // Satisfaction rate counter
            const satisfactionEl = statNumbers.satisfaction;
            let satisfactionCurrent = 0;
            const satisfactionInterval = setInterval(() => {
                satisfactionCurrent++;
                satisfactionEl.textContent = satisfactionCurrent + '%';
                if (satisfactionCurrent >= stats.satisfaction) {
                    satisfactionEl.textContent = stats.satisfaction + '%';
                    clearInterval(satisfactionInterval);
                }
            }, 20);
            
            // Countries counter
            const countriesEl = statNumbers.countries;
            let countriesCurrent = 0;
            const countriesInterval = setInterval(() => {
                countriesCurrent += 3;
                countriesEl.textContent = countriesCurrent;
                if (countriesCurrent >= stats.countries) {
                    countriesEl.textContent = stats.countries;
                    clearInterval(countriesInterval);
                }
            }, 25);
        }
        
        // Trigger stats animation when in view
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });
        
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
        
        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if(window.scrollY > 100) {
                header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
                header.style.background = 'rgba(255, 255, 255, 0.95)';
            } else {
                header.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.08)';
                header.style.background = 'white';
            }
        });
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if(targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if(targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });