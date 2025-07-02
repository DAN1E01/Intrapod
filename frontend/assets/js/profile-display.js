/**
 * Profile Display - Muestra datos del usuario en el perfil desde el JWT
 * Este script funciona independientemente del backend
 */

document.addEventListener('DOMContentLoaded', function() {
    displayUserProfile();
});

function displayUserProfile() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.warn('[PROFILE] No hay token disponible');
        return;
    }
    
    try {
        // Decodificar JWT
        const userData = JSON.parse(atob(token.split('.')[1]));
        
        // Mostrar nombre de usuario en el sidebar
        const profileNameElements = document.querySelectorAll('.profile-name h5');
        profileNameElements.forEach(el => {
            if (el) {
                el.textContent = userData.nombre || userData.sub || 'Usuario';
            }
        });
        
        // Mostrar rol en el sidebar
        const profileSpanElements = document.querySelectorAll('.profile-name span');
        profileSpanElements.forEach(el => {
            if (el) {
                const rolText = userData.rol === 'administrador' ? 'Administrador' : 'Empacador';
                el.textContent = rolText;
            }
        });
        
        // Mostrar nombre en la navbar
        const navbarProfileName = document.querySelector('.navbar-profile-name');
        if (navbarProfileName) {
            navbarProfileName.textContent = userData.nombre || userData.sub || 'Usuario';
        }
        
        console.log('[PROFILE] Datos del usuario cargados:', {
            nombre: userData.nombre || userData.sub,
            rol: userData.rol
        });
        
    } catch (error) {
        console.error('[PROFILE] Error al decodificar token:', error);
    }
}
