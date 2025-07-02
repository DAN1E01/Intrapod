/**
 * Global Navigation Guard - Protección global contra acceso directo por URL
 * Este script debe cargarse en todas las páginas del dashboard para prevenir acceso no autorizado
 */

(function() {
    'use strict';
    
    // Ejecutar verificación inmediatamente al cargar el script
    checkAccessPermissions();
    
    // También verificar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAccessPermissions);
    }
    
    // Verificar permisos cada vez que la página gana foco (previene navegación entre pestañas)
    window.addEventListener('focus', checkAccessPermissions);
    
    function checkAccessPermissions() {
        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');
        const currentPath = window.location.pathname;
        
        console.log('[GLOBAL-GUARD] Verificando permisos...');
        console.log('[GLOBAL-GUARD] Path:', currentPath);
        console.log('[GLOBAL-GUARD] Rol:', rol);
        
        // Verificaciones básicas de autenticación
        if (!token || !rol) {
            console.log('[GLOBAL-GUARD] Sin autenticación válida');
            return handleUnauthorized();
        }
        
        try {
            // Verificar si el token es válido (básico)
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const isExpired = tokenData.exp < (Date.now() / 1000);
            
            if (isExpired) {
                console.log('[GLOBAL-GUARD] Token expirado');
                return handleUnauthorized();
            }
            
        } catch (error) {
            console.log('[GLOBAL-GUARD] Token inválido:', error);
            return handleUnauthorized();
        }
        
        // Verificaciones específicas por área y rol
        const violations = [];
        
        // Área de administración
        if (currentPath.includes('dashboard_admin')) {
            if (rol !== 'administrador') {
                violations.push({
                    type: 'role_mismatch',
                    expected: 'administrador',
                    actual: rol,
                    area: 'admin'
                });
            }
        }
        
        // Área de empacadores
        if (currentPath.includes('dashboard_empacador')) {
            if (rol !== 'empacador') {
                violations.push({
                    type: 'role_mismatch',
                    expected: 'empacador',
                    actual: rol,
                    area: 'empacador'
                });
            }
        }
        
        // Páginas específicas solo para administradores
        const adminOnlyPaths = [
            '/gestionar_usuarios/',
            '/usuarios.html'
        ];
        
        for (let adminPath of adminOnlyPaths) {
            if (currentPath.includes(adminPath) && rol !== 'administrador') {
                violations.push({
                    type: 'admin_only_page',
                    path: adminPath,
                    actual: rol
                });
            }
        }
        
        // Si hay violaciones, manejarlas
        if (violations.length > 0) {
            console.log('[GLOBAL-GUARD] Violaciones detectadas:', violations);
            return handleAccessViolation(violations[0]);
        }
        
        console.log('[GLOBAL-GUARD] Acceso autorizado');
    }
    
    function handleUnauthorized() {
        localStorage.clear();
        // Redirección silenciosa e inmediata
        redirectToLogin();
    }
    
    function handleAccessViolation(violation) {
        let redirectTarget = '';
        
        if (violation.type === 'role_mismatch') {
            if (violation.area === 'admin' && violation.actual === 'empacador') {
                redirectTarget = 'empacador';
            } else if (violation.area === 'empacador' && violation.actual === 'administrador') {
                redirectTarget = 'administrador';
            }
        } else if (violation.type === 'admin_only_page') {
            redirectTarget = violation.actual;
        }
        
        // Redirección silenciosa e inmediata
        redirectToCorrectDashboard(redirectTarget);
    }
    
    function redirectToLogin() {
        // Calcular ruta relativa al login desde la ubicación actual
        const currentPath = window.location.pathname;
        let loginPath = '';
        
        if (currentPath.includes('/pages/dashboard_admin/') || currentPath.includes('/pages/dashboard_empacador/')) {
            if (currentPath.includes('/pages/dashboard_admin/pages/') || currentPath.includes('/pages/dashboard_empacador/pages/')) {
                // Desde una subpágina de dashboard
                loginPath = '../../../login.html';
            } else {
                // Desde el dashboard principal
                loginPath = '../login.html';
            }
        } else {
            // Ruta absoluta como fallback
            loginPath = '/polleria/frontend/pages/login.html';
        }
        
        // Redirección silenciosa e inmediata
        window.location.replace(loginPath);
    }
    
    function redirectToCorrectDashboard(userRole) {
        const currentPath = window.location.pathname;
        let dashboardPath = '';
        
        if (userRole === 'administrador') {
            if (currentPath.includes('/pages/dashboard_empacador/pages/')) {
                // Desde subpágina de empacador a dashboard admin
                dashboardPath = '../../../dashboard_admin/index.html';
            } else if (currentPath.includes('/pages/dashboard_empacador/')) {
                // Desde dashboard empacador a dashboard admin
                dashboardPath = '../dashboard_admin/index.html';
            } else {
                // Ruta absoluta como fallback
                dashboardPath = '/polleria/frontend/pages/dashboard_admin/index.html';
            }
        } else if (userRole === 'empacador') {
            if (currentPath.includes('/pages/dashboard_admin/pages/')) {
                // Desde subpágina de admin a dashboard empacador
                dashboardPath = '../../../dashboard_empacador/index.html';
            } else if (currentPath.includes('/pages/dashboard_admin/')) {
                // Desde dashboard admin a dashboard empacador
                dashboardPath = '../dashboard_empacador/index.html';
            } else {
                // Ruta absoluta como fallback
                dashboardPath = '/polleria/frontend/pages/dashboard_empacador/index.html';
            }
        } else {
            // Si el rol no es reconocido, ir al login
            return redirectToLogin();
        }
        
        // Redirección silenciosa e inmediata
        window.location.replace(dashboardPath);
    }
    
    // Prevenir navegación hacia atrás después de logout
    window.addEventListener('beforeunload', function() {
        if (!localStorage.getItem('token')) {
            history.pushState(null, null, location.href);
        }
    });
    
    // Prevenir acceso a través del botón atrás del navegador
    window.addEventListener('popstate', function() {
        if (!localStorage.getItem('token')) {
            history.pushState(null, null, location.href);
        }
    });
    
})();
