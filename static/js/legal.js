        // DOM Elements
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('#nav-menu a');
        const notification = document.querySelector('.notification');
        const countryEl = document.getElementById('country');
        const amountEl = document.getElementById('amount');
        const tocLinks = document.querySelectorAll('.toc a');
        const sectionJump = document.getElementById('sectionJump');
        const statNumbers = {
            regulated: document.getElementById('regulated'),
            audits: document.getElementById('audits'),
            secure: document.getElementById('secure'),
            compliance: document.getElementById('compliance')
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
        
        // TOC Link Active State
        const sections = document.querySelectorAll('.legal-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    tocLinks.forEach(link => link.classList.remove('active'));
                    
                    // Add active class to current section link
                    const id = entry.target.getAttribute('id');
                    document.querySelector(`.toc a[href="#${id}"]`).classList.add('active');
                }
            });
        }, { threshold: 0.3 });
        
        sections.forEach(section => {
            observer.observe(section);
        });
        
        // Mobile Section Jump
        sectionJump.addEventListener('change', function() {
            if (this.value) {
                document.querySelector(this.value).scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                this.value = '';
            }
        });
        
        // Smooth scrolling for TOC links
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                    
                    // Update active state
                    tocLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
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
                regulated: 4,
                audits: 12,
                secure: 15,
                compliance: 25
            };
            
            // Regulated counter
            statNumbers.regulated.textContent = stats.regulated;
            
            // Audits counter
            const auditsEl = statNumbers.audits;
            let auditsCurrent = 0;
            const auditsInterval = setInterval(() => {
                auditsCurrent += 2;
                auditsEl.textContent = auditsCurrent;
                if (auditsCurrent >= stats.audits) {
                    auditsEl.textContent = stats.audits;
                    clearInterval(auditsInterval);
                }
            }, 100);
            
            // Secure counter
            const secureEl = statNumbers.secure;
            let secureCurrent = 0;
            const secureInterval = setInterval(() => {
                secureCurrent++;
                secureEl.textContent = secureCurrent;
                if (secureCurrent >= stats.secure) {
                    clearInterval(secureInterval);
                }
            }, 200);
            
            // Compliance counter
            const complianceEl = statNumbers.compliance;
            let complianceCurrent = 0;
            const complianceInterval = setInterval(() => {
                complianceCurrent++;
                complianceEl.textContent = complianceCurrent;
                if (complianceCurrent >= stats.compliance) {
                    clearInterval(complianceInterval);
                }
            }, 80);
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