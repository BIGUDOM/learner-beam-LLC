        // DOM Elements
        const loginPage = document.getElementById('loginPage');
        const dashboardPage = document.getElementById('dashboardPage');
        const adminLoginForm = document.getElementById('adminLoginForm');
        const loginError = document.getElementById('loginError');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const addFundsButtons = document.querySelectorAll('.add-funds-btn');
        const addFundsModal = document.getElementById('addFundsModal');
        const closeAddFundsModal = document.getElementById('closeAddFundsModal');
        const cancelAddFunds = document.getElementById('cancelAddFunds');
        const confirmAddFunds = document.getElementById('confirmAddFunds');
        const modalUserName = document.getElementById('modalUserName');
        const modalUserEmail = document.getElementById('modalUserEmail');
        const modalUserLocation = document.getElementById('modalUserLocation');
        const modalUserBalance = document.getElementById('modalUserBalance');
        const userSearch = document.getElementById('userSearch');
        let currentUser = null;

adminLoginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();

    if (!username || !password) {
        alert('Username and password are required');
        return;
    }

    const data = { username, password };

    setLoading(loginBtn, "Logging in...");

    try {
        const response = await fetch('/login/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Admin login response:", result);

        if (result.status === "success") {
            // clear error
            loginError.textContent = '';
            loginError.classList.remove('active');

            // either redirect or show dashboard
            // Option 1: redirect to a real dashboard route
            // window.location.href = '/admin/dashboard';

            // Option 2: show dashboard div
            loginPage.style.display = 'none';
            dashboardPage.style.display = 'block';
        } else {
            loginError.textContent = result.message || "Login failed";
            loginError.classList.add('active');
        }

    } catch (error) {
        console.error('Error logging in as admin:', error);
        alert('Something went wrong. Please try again.');
    } finally {
        clearLoading(loginBtn);
    }
});

        
        // Toggle Sidebar
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
        
        // Add Funds Modal Handlers
   addFundsButtons.forEach(button => {
    button.addEventListener('click', () => {
        const userId = button.getAttribute('data-user-id'); // <-- NEW
        const userName = button.getAttribute('data-user');
        const userEmail = button.getAttribute('data-email');
        const userLocation = button.getAttribute('data-location');
        const userBalance = parseFloat(button.getAttribute('data-balance'));

        // Set modal content
        modalUserName.textContent = userName;
        modalUserEmail.textContent = userEmail;
        modalUserLocation.textContent = userLocation;
        modalUserBalance.textContent = `$${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Store current user for adding funds
        currentUser = {
            id: userId,       // <-- NEW
            name: userName,
            email: userEmail,
            location: userLocation,
            balance: userBalance
        };

        // Show modal
        addFundsModal.classList.add('active');
    });
});

        
        // Close modal buttons
        closeAddFundsModal.addEventListener('click', () => {
            addFundsModal.classList.remove('active');
        });
        
        cancelAddFunds.addEventListener('click', () => {
            addFundsModal.classList.remove('active');
        });
        
        // Confirm add funds
confirmAddFunds.addEventListener('click', async () => {
    const amountInput = document.getElementById('addAmount');
    const reasonInput = document.getElementById('addReason');

    const amount = parseFloat(amountInput.value);
    const reason = reasonInput.value.trim() || "Admin deposit"; // default reason

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        amountInput.focus();
        return;
    }

    if (!currentUser || !currentUser.id) {
        alert("No user selected");
        return;
    }

    const payload = {
        user_id: currentUser.id,
        amount,
        reason
    };

    // Optional: show loading state on the button
    confirmAddFunds.disabled = true;
    confirmAddFunds.textContent = "Processing...";

    try {
        const response = await fetch('/admin/add_funds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert(`$${amount} added to ${currentUser.name}'s wallet successfully!`);
            addFundsModal.classList.remove('active');

            // Optional: update the balance in your UI
            const userBalanceElement = document.querySelector(`#userBalance-${currentUser.id}`);
            if (userBalanceElement) {
                const currentBalance = parseFloat(userBalanceElement.textContent.replace(/,/g, '')) || 0;
                userBalanceElement.textContent = (currentBalance + amount).toLocaleString();
            }

        } else {
            alert(result.message || "Failed to add funds.");
        }
    } catch (err) {
        console.error("Add funds error:", err);
        alert("Error adding funds. Please try again.");
    } finally {
        confirmAddFunds.disabled = false;
        confirmAddFunds.textContent = "Add Funds";
    }
});


        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === addFundsModal) {
                addFundsModal.classList.remove('active');
            }
        });
        
        // Search functionality
        userSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const userName = row.querySelector('.user-name').textContent.toLowerCase();
                const userEmail = row.querySelector('.user-email').textContent.toLowerCase();
                const userLocation = row.cells[2].textContent.toLowerCase();
                
                if (userName.includes(searchTerm) || userEmail.includes(searchTerm) || userLocation.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
        
        // Prevent sidebar from closing when clicking inside
        sidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992 && sidebar.classList.contains('active') && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });

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

