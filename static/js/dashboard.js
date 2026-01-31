        // DOM Elements
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const userMenu = document.getElementById('userMenu');
        const dropdownMenu = document.getElementById('dropdownMenu');
        const addMoneyBtn = document.getElementById('addMoneyBtn');
        const withdrawBtn = document.getElementById('withdrawBtn');
        const addMoneyModal = document.getElementById('addMoneyModal');
        const withdrawModal = document.getElementById('withdrawModal');
        const closeAddMoneyModal = document.getElementById('closeAddMoneyModal');
        const closeWithdrawModal = document.getElementById('closeWithdrawModal');
        const notification = document.querySelector('.notification');
        const amountEl = document.getElementById('amount');
        
        // Toggle Sidebar
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
        
        // Toggle User Dropdown
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
        
        // Add Money Modal
        addMoneyBtn.addEventListener('click', () => {
            addMoneyModal.style.display = 'flex';
        });
        
        closeAddMoneyModal.addEventListener('click', () => {
            addMoneyModal.style.display = 'none';
        });
        
        // Withdraw Modal
        withdrawBtn.addEventListener('click', () => {
            withdrawModal.style.display = 'flex';
        });
        
        closeWithdrawModal.addEventListener('click', () => {
            withdrawModal.style.display = 'none';
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === addMoneyModal) {
                addMoneyModal.style.display = 'none';
            }
            if (e.target === withdrawModal) {
                withdrawModal.style.display = 'none';
            }
        });
        
        // Notification System
        const amounts = ['$1,250', '$750', '$3,500', '$850', '$2,100', '$500', '$1,800', '$950'];
        
        function showNotification() {
            const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
            amountEl.textContent = randomAmount;
            
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 8000);
        }
        
        // Show first notification after 3 seconds
        setTimeout(showNotification, 3000);
        
        // Show random notifications periodically
        setInterval(() => {
            showNotification();
        }, Math.floor(Math.random() * 30000) + 15000);
        
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', function() {
                document.querySelectorAll('.payment-method').forEach(m => {
                    m.style.borderColor = '#e2e8f0';
                    m.style.borderWidth = '2px';
                });
                this.style.borderColor = '#2563eb';
                this.style.borderWidth = '3px';
            });
        });
        
        // Period buttons
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.period-btn').forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');
            });
        });

const PayBtn = document.getElementById('PayBtn');
PayBtn.addEventListener('click', () => {
    alert('Proceeding to payment gateway...');
    const amountInput = document.querySelector('#addMoneyModal input[type="number"]');
    window.location.href = '/payment/' + amountInput.value ;


});

const requestWithdraw = document.getElementById("requestWithdraw");

requestWithdraw.addEventListener("click", async () => {
    const amountInput = document.getElementById("withdrawAmount");
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        alert("Enter a valid withdrawal amount");
        return;
    }

    const btn = document.getElementById("requestWithdraw");
    btn.disabled = true;
    btn.textContent = "Processing...";

    try {
        const response = await fetch("/wallet/request_withdraw", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert(result.message);
            amountInput.value = ""; // clear input
        } else {
            alert(result.message);
        }

    } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Request Withdraw";
    }
});

