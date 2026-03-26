// login.js - Admin Authentication Logic
const API_AUTH_URL = `${window.BarakaConfig?.apiBaseUrl || 'http://localhost:3000'}/auth/login`;

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button');

        submitBtn.disabled = true;
        submitBtn.innerText = 'Yuklanmoqda...';

        try {
            const response = await fetch(API_AUTH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Save token and redirect
                localStorage.setItem('admin_token', data.access_token);
                localStorage.setItem('admin_info', JSON.stringify(data.admin));
                
                showToast('Xush kelibsiz!', 'success');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                showToast(data.message || 'Kirishda xatolik', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Server bilan aloqa yo\'q', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Kirish';
        }
    });
});

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
