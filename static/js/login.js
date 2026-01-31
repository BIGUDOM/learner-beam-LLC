        // DOM Elements
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('#nav-menu a');
        const notification = document.querySelector('.notification');
        const countryEl = document.getElementById('country');
        const amountEl = document.getElementById('amount');
        const loginForm = document.getElementById('loginForm');
        const submitBtn = document.getElementById('submitBtn');
        const successMessage = document.getElementById('successMessage');
        const togglePassword = document.getElementById('togglePassword');
        const passwordField = document.getElementById('password_input');
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
        
        // Form Validation
        function validateForm() {
            let isValid = true;
            
            // Email
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            } else {
                hideError('email');
            }
            
            // Password
            const password = document.getElementById('password').value;
            if (password.length < 6) {
                showError('password', 'Password must be at least 6 characters');
                isValid = false;
            } else {
                hideError('password');
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
        
// Form Submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById("email_input").value;
    const password = document.getElementById("password_input").value;
    console.log("Submitting login form with:", { email, password });

    if (!email || !password) {
        showErrorModal("Please enter both email and password.");
        return;
    }

    const loginBtn = document.getElementById("submitBtn");
    setLoading(loginBtn, "Logging in...");

    const payload = { email, password };

    try {
        const response = await fetch("/loginp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const text = await response.text(); // ALWAYS safe
        let data;
        data = JSON.parse(raw);

        clearLoading(loginBtn);

        if (data.status === "success") {
            showSuccessModal("Login successful!", "/dashboard", 2000);
        } else {
            showErrorModal(data.message || "Login failed");
        }

    } catch (error) {
        clearLoading(loginBtn);
        console.error("Error:", error);
        showErrorModal("An error occurred during login");
    }
     
});

const logindiv = document.getElementById('logindiv');
const resetdiv = document.getElementById('resetdiv');
const savediv = document.getElementById('savediv');
const resetBtna = document.getElementById('resetBtna');
const resetForm = document.getElementById('resetForm');
const resetBtn = document.getElementById('resetBtn');
const saveForm = document.getElementById('saveForm');
const saveBtn = document.getElementById('saveBtn');

resetBtna.addEventListener('click', function () {
  logindiv.style.display = 'none';
  resetdiv.style.display = 'block';
});


resetForm.addEventListener("submit", async function (e) {
    e.preventDefault();





    setLoading(resetBtn, "Reseting......");

    const d_dict = {
        email: document.getElementById("reset_email_input").value
    };

    try {
        const response = await fetch("/resetpass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(d_dict)
        });

        const data = await response.json();
        console.log("Reset response:", data);

        clearLoading(resetBtn);

        if (data.status === "success") {
            resetdiv.style.display = 'none';
            savediv.style.display = 'block';
        } else {
            showErrorModal(data.message || "Reset failed");
        }

    } catch (error) {
        clearLoading(resetBtn);
        console.error("Error:", error);
        showErrorModal("An error occurred during Reset");
    }
});

saveForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const entered_code = document.getElementById("reset_code_input").value;
    const password = document.getElementById("new_password_input").value;
    const confirmpassowrd = document.getElementById("confirm_password_input").value;

    if (!entered_code || !password || !confirmpassowrd) {
        showErrorModal("All fields are required.");
        return;
    }  
    if (password !== confirmpassowrd) {
        showErrorModal("Passowrds doesn't match");
        return;
    }

    setLoading(saveBtn, "Saving Passowrd....");
    const d_dict = {
        email: document.getElementById("reset_email_input").value,
        reset_code: entered_code, 
        new_password: password,
    };

    console.log("DATA -", d_dict)

    
    try {
        const response = await fetch("/save-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(d_dict)
        });

        const data = await response.json();
        console.log("Save response:", data);

        clearLoading(saveBtn);

        if (data.status === "success") {
            showSuccessModal("Password reset successfully. You can login now", "/login",3000);
        } else {
            showErrorModal(data.message || "Save failed");
        }

    } catch (error) {
        clearLoading(saveBtn);
        console.error("Error:", error);
        showErrorModal("An error occurred during Reset");
    }



});
        
        // Real-time validation
        document.getElementById('email_input').addEventListener('blur', () => {
            const email = document.getElementById('email_input').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                showError('email_input', 'Please enter a valid email address');
            } else {
                hideError('email_input');
            }
        });
        
        document.getElementById('password_input').addEventListener('blur', () => {
            const password = document.getElementById('password_input').value;
            if (password && password.length < 6) {
                showError('password_input', 'Password must be at least 6 characters');
            } else {
                hideError('password_input');
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
        
        // Social login simulation
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const provider = this.classList.contains('google') ? 'Google' : 
                                this.classList.contains('facebook') ? 'Facebook' : 'Apple';
                alert(`Signing in with ${provider}...\n\nIn a real application, this would redirect to ${provider}'s authentication page.`);
            });
        });

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

