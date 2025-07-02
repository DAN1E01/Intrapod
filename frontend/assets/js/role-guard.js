/**
 * Role Guard - Protección específica para páginas de dashboard
 * Este guard se ejecuta en páginas específicas dentro de los dashboards
 */

document.addEventListener('DOMContentLoaded', function(){
    const roleToken = localStorage.getItem('token');
    const userRole = localStorage.getItem('rol');
    const currentPath = window.location.pathname;
    
    console.log('[ROLE-GUARD] Verificando acceso...');
    console.log('[ROLE-GUARD] Token:', roleToken ? 'Presente' : 'Ausente');
    console.log('[ROLE-GUARD] Rol:', userRole);
    console.log('[ROLE-GUARD] Path:', currentPath);

    // Si no hay token o rol, redirigir al login inmediatamente
    if(!roleToken || !userRole){
        console.log('[ROLE-GUARD] Sin autenticación válida');
        return redirectToLogin();
    }

    // Verificar acceso específico según la ruta y el rol
    const isAdminArea = currentPath.includes('dashboard_admin');
    const isEmpacadorArea = currentPath.includes('dashboard_empacador');
    
    if(isAdminArea && userRole !== 'administrador'){
        console.log('[ROLE-GUARD] Empacador intentando acceder a área de admin');
        return blockAccess('empacador', 'Esta es un área exclusiva para administradores.');
    }
    
    if(isEmpacadorArea && userRole !== 'empacador'){
        console.log('[ROLE-GUARD] Admin intentando acceder a área de empacador');
        return blockAccess('administrador', 'Esta es un área específica para empacadores.');
    }

    // Verificaciones adicionales para páginas específicas
    checkSpecificPageAccess();
    
    console.log('[ROLE-GUARD] Acceso autorizado para:', rol);

    function checkSpecificPageAccess(){
        // Páginas que solo pueden ver administradores
        const adminOnlyPages = ['/usuarios/', '/reportes/'];
        
        // Si es empacador y está intentando acceder a páginas de solo admin
        if(userRole === 'empacador'){
            for(let adminPage of adminOnlyPages){
                if(currentPath.includes(adminPage) && currentPath.includes('dashboard_admin')){
                    console.log('[ROLE-GUARD] Empacador intentando acceder a página restringida:', adminPage);
                    return blockAccess('empacador', 'No tienes permisos para acceder a esta página.');
                }
            }
        }
    }

    function blockAccess(userRole, message){
        // Redirección silenciosa e inmediata
        redirectToCorrectDashboard(userRole);
    }

    function redirectToLogin(){
        localStorage.clear();
        // Redirección silenciosa e inmediata
        window.location.replace(getLoginPath());
    }

    function redirectToCorrectDashboard(userRole){
        const dashboardPath = getDashboardPath(userRole);
        console.log('[ROLE-GUARD] Redirigiendo a:', dashboardPath);
        
        // Redirección silenciosa e inmediata
        window.location.replace(dashboardPath);
    }

    function getLoginPath(){
        // Calcular ruta relativa al login desde cualquier ubicación
        const pathSegments = window.location.pathname.split('/');
        const currentPath = window.location.pathname;
        
        if(currentPath.includes('/pages/dashboard_')){
            if(currentPath.includes('/pages/dashboard_admin/pages/') || currentPath.includes('/pages/dashboard_empacador/pages/')){
                return '../../../login.html';
            } else {
                return '../login.html';
            }
        }
        
        return '/polleria/frontend/pages/login.html';
    }

    function getDashboardPath(userRole){
        const currentPath = window.location.pathname;
        
        if(userRole === 'administrador'){
            if (currentPath.includes('/pages/dashboard_empacador/pages/')) {
                return '../../../dashboard_admin/index.html';
            } else if (currentPath.includes('/pages/dashboard_empacador/')) {
                return '../dashboard_admin/index.html';
            } else {
                return '/polleria/frontend/pages/dashboard_admin/index.html';
            }
        } else if(userRole === 'empacador'){
            if (currentPath.includes('/pages/dashboard_admin/pages/')) {
                return '../../../dashboard_empacador/index.html';
            } else if (currentPath.includes('/pages/dashboard_admin/')) {
                return '../dashboard_empacador/index.html';
            } else {
                return '/polleria/frontend/pages/dashboard_empacador/index.html';
            }
        }
        
        // Si el rol no es reconocido, ir al login
        return getLoginPath();
    }

});

// Función para verificar permisos desde JavaScript (uso opcional en el código)
function hasPermission(requiredRole) {
    const currentRole = localStorage.getItem('rol');
    return currentRole === requiredRole;
}

// Función para verificar si el usuario actual es admin
function isAdmin() {
    return hasPermission('administrador');
}

// Función para verificar si el usuario actual es empacador
function isEmpacador() {
    return hasPermission('empacador');
}
