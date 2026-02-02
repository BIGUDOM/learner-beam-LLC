const adminLoginForm = document.getElementById('adminLoginForm');  

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
            window.location.href= "/admin/login";
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