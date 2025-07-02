document.addEventListener('DOMContentLoaded', function(){
    const authToken = localStorage.getItem('token');
    const userRole = localStorage.getItem('rol');
    const currentPath = window.location.pathname;
    
    console.log('[AUTH-GUARD] Token:', authToken ? 'Presente' : 'Ausente');
    console.log('[AUTH-GUARD] Rol:', userRole);
    console.log('[AUTH-GUARD] Path:', currentPath);

    // Si no hay token o rol, redirigir al login
    if(!authToken || !userRole){
        console.log('[AUTH-GUARD] Sin autenticación, redirigiendo al login');
        return redirectToLogin();
    }

    // Verificar acceso específico por rol y dashboard
    if(currentPath.includes('dashboard_admin') && userRole !== 'administrador'){
        console.log('[AUTH-GUARD] Empacador intentando acceder a admin, redirigiendo a dashboard empacador');
        return redirectToCorrectDashboard('empacador');
    }
    
    if(currentPath.includes('dashboard_empacador') && userRole !== 'empacador'){
        console.log('[AUTH-GUARD] Admin intentando acceder a empacador, redirigiendo a dashboard admin');
        return redirectToCorrectDashboard('administrador');
    }

    console.log('[AUTH-GUARD] Acceso autorizado');

    function redirectToLogin(){
        localStorage.clear();
        // Redirección silenciosa e inmediata
        window.location.replace(getLoginPath());
    }

    function redirectToCorrectDashboard(roleToRedirect){
        // Redirección silenciosa e inmediata al dashboard correcto
        window.location.replace(getDashboardPath(roleToRedirect));
    }

    function getLoginPath(){
        const pathName = window.location.pathname;
        
        if(pathName.includes('dashboard_admin') || pathName.includes('dashboard_empacador')){
            // Desde cualquier dashboard, volver al login principal
            if(pathName.includes('/pages/')){
                return '../../../login.html';
            } else {
                return '../login.html';
            }
        }
        
        // Fallback
        return '/polleria/frontend/pages/login.html';
    }

    function getDashboardPath(roleToRedirect){
        const pathName = window.location.pathname;
        
        if(roleToRedirect === 'administrador'){
            if (pathName.includes('/pages/dashboard_empacador/pages/')) {
                return '../../../dashboard_admin/index.html';
            } else if (pathName.includes('/pages/dashboard_empacador/')) {
                return '../dashboard_admin/index.html';
            } else {
                return '/polleria/frontend/pages/dashboard_admin/index.html';
            }
        } else if(roleToRedirect === 'empacador'){
            if (pathName.includes('/pages/dashboard_admin/pages/')) {
                return '../../../dashboard_empacador/index.html';
            } else if (pathName.includes('/pages/dashboard_admin/')) {
                return '../dashboard_empacador/index.html';
            } else {
                return '/polleria/frontend/pages/dashboard_empacador/index.html';
            }
        }
        
        // Fallback al login si el rol no es reconocido
        return getLoginPath();
    }

});