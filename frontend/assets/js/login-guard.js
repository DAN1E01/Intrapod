document.addEventListener('DOMContentLoaded',function(){
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    if (token && rol){
        //Redirige segun el rol
        if (rol === 'administrador') {
            window.location.href = '../pages/dashboard_admin/index.html';
        } else if (rol === 'empacador'){
            window.location.href = '../pages/dashboard_empacador/index.html';
        }
    }
    // Icono para mostrar/ocultar contraseña
    const toggle = document.getElementById('togglePassword');
    if (toggle) {
        toggle.addEventListener('click', function () {
            const passwordInput = document.getElementById('password');
            const icon = document.getElementById('icon-eye');
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });
    }
});