        // DOM Elements
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('#nav-menu a');
        const notification = document.querySelector('.notification');
        const countryEl = document.getElementById('country');
        const amountEl = document.getElementById('amount');
        const registerForm = document.getElementById('registerForm');
        const submitBtn = document.getElementById('submitBtn');
        const successMessage = document.getElementById('successMessage');
        const togglePassword = document.getElementById('togglePassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        const passwordField = document.getElementById('password');
        const confirmPasswordField = document.getElementById('confirmPassword');
        const statNumbers = {
            traders: document.getElementById('traders'),
            countries: document.getElementById('countries'),
            success: document.getElementById('success'),
            support: document.getElementById('support')
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
        
        // Password Toggle
        togglePassword.addEventListener('click', () => {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
        
        toggleConfirmPassword.addEventListener('click', () => {
            const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordField.setAttribute('type', type);
            toggleConfirmPassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
        
        // Form Validation
        function validateForm() {
            let isValid = true;
            
            // First Name
            const firstName = document.getElementById('firstName').value.trim();
            if (firstName === '') {
                showError('firstName', 'Please enter your first name');
                isValid = false;
            } else {
                hideError('firstName');
            }
            
            // Last Name
            const lastName = document.getElementById('lastName').value.trim();
            if (lastName === '') {
                showError('lastName', 'Please enter your last name');
                isValid = false;
            } else {
                hideError('lastName');
            }
            
            // Email
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            } else {
                hideError('email');
            }
            
            // Phone
            const phone = document.getElementById('phone').value.trim();
            const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
            if (!phoneRegex.test(phone)) {
                showError('phone', 'Please enter a valid phone number');
                isValid = false;
            } else {
                hideError('phone');
            }
            
            // Country
            const country = document.getElementById('country').value;
            if (!country) {
                showError('country', 'Please select your country');
                isValid = false;
            } else {
                hideError('country');
            }
            
            // Currency
            const currency = document.getElementById('currency').value;
            if (!currency) {
                showError('currency', 'Please select a currency');
                isValid = false;
            } else {
                hideError('currency');
            }
            
            // Password
            const password = document.getElementById('password').value;
            if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
                showError('password', 'Password must be at least 8 characters with letters and numbers');
                isValid = false;
            } else {
                hideError('password');
            }
            
            // Confirm Password
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (confirmPassword !== password) {
                showError('confirmPassword', 'Passwords do not match');
                isValid = false;
            } else {
                hideError('confirmPassword');
            }
            
            // Terms
            const terms = document.getElementById('terms').checked;
            if (!terms) {
                showError('terms', 'You must agree to the terms and conditions');
                isValid = false;
            } else {
                hideError('terms');
            }
            
            return isValid;
        }
        
        function showError(fieldId, message) {
            const errorElement = document.getElementById(`${fieldId}Error`);
            const fieldGroup = document.getElementById(fieldId).closest('.form-group');
            if (errorElement) errorElement.textContent = message;
            if (fieldGroup) fieldGroup.classList.add('error');
        }
        
        function hideError(fieldId) {
            const fieldGroup = document.getElementById(fieldId).closest('.form-group');
            if (fieldGroup) fieldGroup.classList.remove('error');
        }

const verifyDiv = document.getElementById("verify");
const userDiv = document.getElementById("user");
const code = String(Math.floor(100000 + Math.random()*900000));
// Form Submission
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const data = {
        email:  document.getElementById('email').value.trim(), 
        password: document.getElementById('password').value, 
        first_name: document.getElementById('firstName').value.trim(),
        last_name: document.getElementById('lastName').value.trim(), 
        phone: document.getElementById('phone').value.trim(), 
        country: document.getElementById('countryy').value.trim(), 
        currency: document.getElementById('currency').value.trim(), 
        verification_code: code
    };

    setLoading(submitBtn, "Creating account...");

    try {
        const response = await fetch("/verify-register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        let result;
        try {
            result = await response.json();
        } catch (parseError) {
            const raw = await response.text();
            console.error("Failed to parse JSON:", parseError);
            console.error("RAW RESPONSE:", raw);
            showErrorModal("Server error occurred. Please try again later.");
            clearLoading(submitBtn);
            return;
        }

        console.log("USER FORM RESPONSE →", result);
        clearLoading(submitBtn);

        if (result.status === "success") {
            userDiv.style.display = "none";
            verifyDiv.style.display = "block";
        } else {
            showErrorModal(result.message || "Registration failed");
        }

    } catch (err) {
        clearLoading(submitBtn);
        console.error("USER FORM ERROR →", err);
        showErrorModal("Server error. Please check your network and try again.");
    }
});


const verifyForm = document.getElementById("VerifyForm");

verifyForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const verifyBtn = document.getElementById("verifyButton");
    const enteredCode = document.getElementById("verification_code_input").value;

    if (!enteredCode) { 
        showErrorModal("Enter the code you received.");
        return;
    }

    setLoading(verifyBtn, "Verifying...");

    const data = {
        email: document.getElementById('email').value,
        entered_code: enteredCode,
        verification_code: code
    };

    try {
        const response = await fetch("/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        // --- Always read raw text first ---
        const raw = await response.text();
        let result;

        try {
            result = JSON.parse(raw);
        } catch (parseError) {
            console.error("Failed to parse JSON from server:", parseError);
            console.error("RAW RESPONSE:", raw);
            showErrorModal("Server error occurred. Please try again later.");
            clearLoading(verifyBtn);
            return;
        }

        console.log("VERIFY FORM RESPONSE →", result);
        clearLoading(verifyBtn);

        if (result.status === "success") {
            showSuccessModal(result.message || "Registered Successfully", "/login");
        } else {
            showErrorModal(result.message || "Verification failed");
        }

    } catch (err) {
        clearLoading(verifyBtn);
        console.error("VERIFY FORM ERROR →", err);
        showErrorModal("Server error. Please check your network and try again.");
    }
});
     
        // Real-time validation
        document.getElementById('firstName').addEventListener('blur', () => {
            if (document.getElementById('firstName').value.trim() === '') {
                showError('firstName', 'Please enter your first name');
            } else {
                hideError('firstName');
            }
        });
        
        document.getElementById('lastName').addEventListener('blur', () => {
            if (document.getElementById('lastName').value.trim() === '') {
                showError('lastName', 'Please enter your last name');
            } else {
                hideError('lastName');
            }
        });
        
        document.getElementById('email').addEventListener('blur', () => {
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                showError('email', 'Please enter a valid email address');
            } else {
                hideError('email');
            }
        });
        
        document.getElementById('phone').addEventListener('blur', () => {
            const phone = document.getElementById('phone').value.trim();
            const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
            if (phone && !phoneRegex.test(phone)) {
                showError('phone', 'Please enter a valid phone number');
            } else {
                hideError('phone');
            }
        });
        
        document.getElementById('password').addEventListener('blur', () => {
            const password = document.getElementById('password').value;
            if (password && (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))) {
                showError('password', 'Password must be at least 8 characters with letters and numbers');
            } else {
                hideError('password');
            }
        });
        
        document.getElementById('confirmPassword').addEventListener('blur', () => {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (confirmPassword && confirmPassword !== password) {
                showError('confirmPassword', 'Passwords do not match');
            } else {
                hideError('confirmPassword');
            }
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
                traders: 200000,
                countries: 150,
                success: 98,
                support: 150
            };
            
            // Traders counter
            const tradersEl = statNumbers.traders;
            let tradersCurrent = 0;
            const tradersInterval = setInterval(() => {
                tradersCurrent += 1000;
                tradersEl.textContent = tradersCurrent.toLocaleString();
                if (tradersCurrent >= stats.traders) {
                    tradersEl.textContent = stats.traders.toLocaleString();
                    clearInterval(tradersInterval);
                }
            }, 20);
            
            // Countries counter
            statNumbers.countries.textContent = stats.countries;
            
            // Success rate counter
            const successEl = statNumbers.success;
            let successCurrent = 0;
            const successInterval = setInterval(() => {
                successCurrent++;
                successEl.textContent = successCurrent + '%';
                if (successCurrent >= stats.success) {
                    successEl.textContent = stats.success + '%';
                    clearInterval(successInterval);
                }
            }, 25);
            
            // Support agents counter
            statNumbers.support.textContent = stats.support;
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


function showOnly(div) {
    const allDivs = document.querySelectorAll('.register-section');
    allDivs.forEach(d => d.style.display = "none");
    div.style.display = "block";
}

// ------------- Modal popup for success -------------
function showSuccessModal(message, redirectUrl = null, delay = 0) {
    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    // Modal
    const modal = document.createElement("div");
    modal.className = "modal-card";

    modal.innerHTML = `
        <div class="modal-icon">
            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>

        <h2>Success</h2>
        <p>${message}</p>

        <button class="modal-btn">Continue</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => overlay.classList.add("show"));

    const closeModal = () => {
        overlay.classList.remove("show");
        setTimeout(() => overlay.remove(), 250);
    };

    // Button click
    modal.querySelector(".modal-btn").onclick = () => {
        closeModal();
        if (redirectUrl) window.location.href = redirectUrl;
    };

    // Click outside to close
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };

    // Escape key
    document.addEventListener("keydown", function escClose(e) {
        if (e.key === "Escape") {
            closeModal();
            document.removeEventListener("keydown", escClose);
        }
    });

    // Auto redirect
    if (redirectUrl && delay > 0) {
        setTimeout(() => {
            closeModal();
            window.location.href = redirectUrl;
        }, delay);
    }
}

function showErrorModal(message) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const modal = document.createElement("div");
    modal.className = "modal-card error";

    modal.innerHTML = `
        <div class="modal-icon error-icon">
            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M15 9l-6 6M9 9l6 6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"/>
            </svg>
        </div>

        <h2>Error</h2>
        <p>${message}</p>

        <button class="modal-btn error-btn">Close</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add("show"));

    const close = () => {
        overlay.classList.remove("show");
        setTimeout(() => overlay.remove(), 250);
    };

    modal.querySelector(".error-btn").onclick = close;

    overlay.onclick = (e) => {
        if (e.target === overlay) close();
    };

    document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") {
            close();
            document.removeEventListener("keydown", esc);
        }
    });
}

// -------------------------
// Loading Spinner Helpers
// -------------------------

function setLoading(button, text = "Loading...") {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;

    // Add spinner HTML (simple rolling dots)
    button.innerHTML = `
        <span class="spinner"></span> ${text}
    `;
}

function clearLoading(button) {
    button.innerHTML = button.dataset.originalText || "Submit";
    button.disabled = false;
}




