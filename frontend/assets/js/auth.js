//Url del Backend
const API_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', function(){
    const loginForm = document.getElementById('loginForm');
    if (loginForm){
        loginForm.addEventListener('submit',handleLogin)
    }
});

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none', 'fadeOut');
    errorMessage.classList.add('fadeIn');
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.classList.remove('fadeIn');
    }, 600);
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.classList.remove('fadeIn');
    errorMessage.classList.add('fadeOut');
    setTimeout(() => {
        errorMessage.classList.add('d-none');
        errorMessage.style.display = 'none';
    }, 400);
}

// Validación estricta de usuario y contraseña
function validateInputs(username, password) {
    let valid = true;
    // El usuario solo puede contener letras, números, guiones bajos y debe tener entre 3 y 20 caracteres
    const userRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!userRegex.test(username)) {
        document.getElementById('username').classList.add('is-invalid');
        showError('El usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números y guión bajo.');
        valid = false;
    } else if (!password || password.length < 4) {
        document.getElementById('password').classList.add('is-invalid');
        showError('La contraseña debe tener al menos 4 caracteres.');
        valid = false;
    }
    return valid;
}

async function handleLogin(event){
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    hideError();

    if (!validateInputs(username, password)) {
        return;
    }
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({username,password})
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Error en el Inicio de Sesion");
        }
        //Guardar el token y rol en el localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', username);
        localStorage.setItem('rol', data.rol);

        //Redireccionar segun el rol
        redirectByRole(data.rol);

    } catch (error){
        showError(error.message || "Error al Contactar con el Servidor");
    }
}

//Funcion para redireccionar segun el rol
function redirectByRole(rol){
    switch (rol){
        case 'administrador':
            window.location.href = '../pages/dashboard_admin/index.html';
            break;
        case 'empacador':
            window.location.href = '../pages/dashboard_empacador/index.html';
            break;
    }
}
