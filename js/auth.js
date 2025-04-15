document.addEventListener('DOMContentLoaded', () => {
    // Initialize form elements
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const passwordInput = document.getElementById('signup-password');
    const confirmInput = document.getElementById('signup-confirm');
    
    // Login form handling
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();
            
            // Validate inputs
            if (!username || !password) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            // Check credentials
            const user = dataStore.users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Show loading state
                const btn = loginForm.querySelector('button');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
                btn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showAlert('Invalid username or password', 'error');
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }
        });
    }
    
    // Signup form handling
    if (signupForm) {
        // Password strength check
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strengthText = document.querySelector('.strength-text');
            
            if (password.length === 0) {
                strengthText.textContent = 'Password strength';
                strengthText.style.color = '';
            } else if (password.length < 6) {
                strengthText.textContent = 'Too short';
                strengthText.style.color = 'var(--error-color)';
            } else if (password.length < 8) {
                strengthText.textContent = 'Weak';
                strengthText.style.color = 'var(--error-color)';
            } else if (password.length < 10) {
                strengthText.textContent = 'Good';
                strengthText.style.color = '#f39c12';
            } else {
                strengthText.textContent = 'Strong';
                strengthText.style.color = 'var(--success-color)';
            }
        });
        
        // Form submission
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('signup-name').value.trim();
            const username = document.getElementById('signup-username').value.trim();
            const password = passwordInput.value.trim();
            const confirm = confirmInput.value.trim();
            
            // Validate inputs
            if (!name || !username || !password || !confirm) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirm) {
                showAlert('Passwords do not match', 'error');
                confirmInput.focus();
                return;
            }
            
            if (password.length < 6) {
                showAlert('Password must be at least 6 characters', 'error');
                passwordInput.focus();
                return;
            }
            
            // Check if username exists
            if (dataStore.users.some(u => u.username === username)) {
                showAlert('Username already exists', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                id: dataStore.users.length + 1,
                username,
                password,
                name,
                role: 'staff'
            };
            
            // Show loading state
            const btn = signupForm.querySelector('button');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            btn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                dataStore.users.push(newUser);
                dataStore.save();
                
                showAlert('Account created successfully!', 'success');
                btn.innerHTML = '<i class="fas fa-check"></i> Account Created';
                
                // Redirect to login after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }, 2000);
        });
    }
    
    // Check authentication for protected pages
    if (window.location.pathname.includes('dashboard.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'index.html';
        }
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});

// Show alert message
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert-message');
    if (existingAlert) existingAlert.remove();
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert-message ${type}`;
    alert.textContent = message;
    
    // Add to page
    document.body.appendChild(alert);
    
    // Auto remove after delay
    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}