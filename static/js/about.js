        // DOM Elements
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('#nav-menu a');
        const notification = document.querySelector('.notification');
        const countryEl = document.getElementById('country');
        const amountEl = document.getElementById('amount');
        const statNumbers = {
            years: document.getElementById('years'),
            clients: document.getElementById('clients'),
            countries: document.getElementById('countries'),
            awards: document.getElementById('awards')
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
                years: 15,
                clients: "2,000,000+",
                countries: 150,
                awards: 28
            };
            
            // Years counter
            const yearsEl = statNumbers.years;
            const yearsTarget = stats.years;
            let yearsCurrent = 0;
            const yearsInterval = setInterval(() => {
                yearsCurrent++;
                yearsEl.textContent = yearsCurrent;
                if (yearsCurrent >= yearsTarget) clearInterval(yearsInterval);
            }, 50);
            
            // Clients counter (just display)
            statNumbers.clients.textContent = stats.clients;
            
            // Countries counter
            const countriesEl = statNumbers.countries;
            const countriesTarget = stats.countries;
            let countriesCurrent = 0;
            const countriesInterval = setInterval(() => {
                countriesCurrent += 2;
                countriesEl.textContent = countriesCurrent;
                if (countriesCurrent >= countriesTarget) {
                    countriesEl.textContent = countriesTarget;
                    clearInterval(countriesInterval);
                }
            }, 30);
            
            // Awards counter
            const awardsEl = statNumbers.awards;
            const awardsTarget = stats.awards;
            let awardsCurrent = 0;
            const awardsInterval = setInterval(() => {
                awardsCurrent++;
                awardsEl.textContent = awardsCurrent;
                if (awardsCurrent >= awardsTarget) clearInterval(awardsInterval);
            }, 100);
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