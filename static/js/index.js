        // DOM Elements
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('#nav-menu a');
        const carouselDots = document.querySelectorAll('.carousel-dot');
        const prevSlideBtn = document.getElementById('prev-slide');
        const nextSlideBtn = document.getElementById('next-slide');
        const slides = document.querySelectorAll('.slide');
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        const faqQuestions = document.querySelectorAll('.faq-question');
        const progressFills = document.querySelectorAll('.progress-fill');
        const testimonialDots = document.querySelectorAll('.testimonial-dot');
        const notification = document.querySelector('.notification');
        const countryEl = document.getElementById('country');
        const amountEl = document.getElementById('amount');
        const statNumbers = {
            transactions: document.getElementById('transactions'),
            accounts: document.getElementById('accounts'),
            managers: document.getElementById('managers'),
            clients: document.getElementById('clients')
        };
        
        // Testimonials data
        const testimonials = [
            {
                text: "Very great work, made very huge amount of money with little or no effort at all. Special thanks to your automated trading device.",
                author: "Austin Paul",
                role: "Silver Package Trader"
            },
            {
                text: "Extremely satisfying service. Leaner Beam LLC is the best, I have already cashed out big in just two weeks.",
                author: "Martins Mcmullen",
                role: "Silver Package Trader"
            },
            {
                text: "This is the real definition of being top notch. I literally watched my account blossom into what it is today and I believe there is more to come.",
                author: "Marron Bua",
                role: "Basic Package Trader"
            },
            {
                text: "I really did not think it was possible before now to make so much profit, but here I am right now saying 'Anything is just possible with Leaner Beam LLC'",
                author: "Sunath Park",
                role: "Gold Package Trader"
            },
            {
                text: "Just when I think its good enough, its just keeps getting better. Made over 4 withdrawals and I must confess that this is the best service i've ever recieved.",
                author: "Jone Doe",
                role: "Silver Package Trader"
            },
            {
                text: "Your company is exactly what I was looking for – clear, clean, continuous, with a focus on clients. Thank you so much for your work.",
                author: "Rose Powell",
                role: "Account Manager"
            },
            {
                text: "Ive always liked good stylish programs, but never invested quite enough to have a good profit. Now, thanks to Leaner Beam LLC, we have a program we can be proud of.",
                author: "Paul Wills",
                role: "Silver Package Trader"
            }
        ];
        
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
        
        // Carousel Functionality
        let currentSlide = 0;
        const totalSlides = slides.length;
        
        function goToSlide(slideIndex) {
            slides.forEach(slide => slide.classList.remove('active'));
            carouselDots.forEach(dot => dot.classList.remove('active'));
            
            currentSlide = slideIndex;
            slides[currentSlide].classList.add('active');
            carouselDots[currentSlide].classList.add('active');
        }
        
        // Event listeners for carousel controls
        carouselDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                goToSlide(slideIndex);
            });
        });
        
        prevSlideBtn.addEventListener('click', () => {
            goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
        });
        
        nextSlideBtn.addEventListener('click', () => {
            goToSlide((currentSlide + 1) % totalSlides);
        });
        
        // Auto slide change
        setInterval(() => {
            goToSlide((currentSlide + 1) % totalSlides);
        }, 5000);
        
        // Tab Functionality
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to current button and content
                btn.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // FAQ Accordion
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const toggleIcon = question.querySelector('.faq-toggle');
                
                // Toggle current item
                question.classList.toggle('active');
                toggleIcon.classList.toggle('active');
                
                if (answer.classList.contains('show')) {
                    answer.classList.remove('show');
                    answer.style.maxHeight = null;
                } else {
                    answer.classList.add('show');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
                
                // Close other items
                faqQuestions.forEach(otherQuestion => {
                    if (otherQuestion !== question) {
                        const otherAnswer = otherQuestion.nextElementSibling;
                        const otherToggleIcon = otherQuestion.querySelector('.faq-toggle');
                        
                        otherQuestion.classList.remove('active');
                        otherToggleIcon.classList.remove('active');
                        otherAnswer.classList.remove('show');
                        otherAnswer.style.maxHeight = null;
                    }
                });
            });
        });
        
        // Progress Bars Animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    progressFills.forEach(fill => {
                        const width = fill.getAttribute('data-width');
                        fill.style.width = `${width}%`;
                    });
                }
            });
        }, { threshold: 0.5 });
        
        const progressSection = document.querySelector('.progress-container');
        if (progressSection) {
            observer.observe(progressSection);
        }
        
        // Stats Counter Animation
        function animateCounters() {
            const stats = {
                transactions: 1830,
                accounts: 489,
                managers: 88,
                clients: 4348
            };
            
            Object.keys(stats).forEach(key => {
                const element = statNumbers[key];
                const target = stats[key];
                const duration = 2000; // 2 seconds
                const start = 0;
                const increment = target / (duration / 16); // approx 60fps
                
                let current = start;
                const counter = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        element.textContent = target.toLocaleString();
                        clearInterval(counter);
                    } else {
                        element.textContent = Math.floor(current).toLocaleString();
                    }
                }, 16);
            });
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
        
        // Testimonials Carousel
        let currentTestimonial = 0;
        const testimonialTextEl = document.getElementById('testimonial-text');
        const testimonialAuthorEl = document.getElementById('testimonial-author');
        const testimonialRoleEl = document.getElementById('testimonial-role');
        
        function showTestimonial(index) {
            testimonialDots.forEach(dot => dot.classList.remove('active'));
            testimonialDots[index].classList.add('active');
            
            testimonialTextEl.textContent = `"${testimonials[index].text}"`;
            testimonialAuthorEl.textContent = testimonials[index].author;
            testimonialRoleEl.textContent = testimonials[index].role;
            
            currentTestimonial = index;
        }
        
        testimonialDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-index'));
                showTestimonial(index);
            });
        });
        
        // Auto change testimonials
        setInterval(() => {
            const nextIndex = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(nextIndex);
        }, 5000);
        
        // Notification System
        const countries = ['London', 'California', 'Germany', 'France', 'Italy', 'USA', 'Australia', 'Canada', 'Argentina', 'Saudi Arabia', 'Mexico', 'Kenya', 'India', 'Pakistan', 'United Kingdom', 'Greece', 'Netherlands', 'Switzerland', 'Belgium', 'Israel'];
        const amounts = ['$600', '$500', '$1,000', '$2,150', '$8,400', '$3,220', '$400', '$750', '$2,500', '$6,000', '$18,000', '$12,000'];
        
        function showNotification() {
            // Set random country and amount
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];
            const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
            
            countryEl.textContent = randomCountry;
            amountEl.textContent = randomAmount;
            
            // Show notification
            notification.classList.add('show');
            
            // Hide after 8 seconds
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