// Script de depuración para verificar autenticación
console.log('🔍 DEPURACIÓN DE AUTENTICACIÓN');

// Verificar token
const debugToken = localStorage.getItem('token');
const rol = localStorage.getItem('rol');

console.log('Token existe:', !!debugToken);
console.log('Rol almacenado:', rol);

if (debugToken) {
    try {
        const decoded = JSON.parse(atob(debugToken.split('.')[1]));
        console.log('Token decodificado:', decoded);
        console.log('Rol en token:', decoded.rol);
        console.log('Username:', decoded.sub);
        console.log('Nombre:', decoded.nombre);
    } catch (e) {
        console.error('Error decodificando token:', e);
    }
}

// Verificar ruta actual
console.log('Ruta actual:', window.location.pathname);
console.log('Es dashboard empacador:', window.location.pathname.includes('dashboard_empacador'));
console.log('Es dashboard admin:', window.location.pathname.includes('dashboard_admin'));

// Verificar elementos DOM críticos
console.log('Botón cerrar sesión existe:', !!document.getElementById('cerrar_sesion'));
console.log('Perfil dropdown existe:', !!document.getElementById('profileDropdown'));
