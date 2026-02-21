// ==========================================
// Auth Page Logic (Login / Register)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect
    const user = getUser();
    const token = getToken();
    if (user && token) {
        redirectByRole(user.role);
        return;
    }

    // Tab switching
    const tabs = document.querySelectorAll('.login-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        });
    });

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Signing in...';
        try {
            const data = await api('/auth/login', { method: 'POST', body: { email, password } });
            setToken(data.token);
            setUser(data.user);
            showToast(`Welcome back, ${data.user.name}!`);
            setTimeout(() => redirectByRole(data.user.role), 500);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    });

    // Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const phone = document.getElementById('reg-phone').value;
        const role = document.getElementById('reg-role').value;
        const btn = registerForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Creating account...';
        try {
            const data = await api('/auth/register', { method: 'POST', body: { name, email, password, phone, role } });
            setToken(data.token);
            setUser(data.user);
            showToast(`Account created! Welcome, ${data.user.name}!`);
            setTimeout(() => redirectByRole(data.user.role), 500);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    });
});

function redirectByRole(role) {
    switch (role) {
        case 'admin': window.location.href = '/admin/dashboard.html'; break;
        case 'staff': window.location.href = '/staff/dashboard.html'; break;
        default: window.location.href = '/customer/menu.html';
    }
}
