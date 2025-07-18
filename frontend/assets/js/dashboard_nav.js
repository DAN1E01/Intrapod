document.addEventListener('DOMContentLoaded', function(){
    const navToken = localStorage.getItem('token');
    
    // Verificación temprana de autenticación
    if (!navToken) {
        console.error('[DASHBOARD-NAV] Token no encontrado');
        localStorage.clear();
        window.location.href = getLoginPath();
        return;
    }
    
    // Función para decodificar JWT
    function parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.error('[DASHBOARD-NAV] Error al decodificar token:', e);
            return null;
        }
    }
    
    // Detectar rol del usuario
    const tokenUser = parseJwt(navToken);
    const userRole = tokenUser ? tokenUser.rol : null;
    
    // Verificación adicional de rol
    if (!userRole) {
        console.error('[DASHBOARD-NAV] Rol no encontrado en token');
        localStorage.clear();
        window.location.href = getLoginPath();
        return;
    }
    
    // Verificar coherencia entre URL y rol del usuario
    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard_admin') && userRole !== 'administrador') {
        console.error('[DASHBOARD-NAV] Empacador intentando acceder a dashboard admin');
        redirectToCorrectDashboard('empacador');
        return;
    }
    
    if (currentPath.includes('dashboard_empacador') && userRole !== 'empacador') {
        console.error('[DASHBOARD-NAV] Admin intentando acceder a dashboard empacador');
        redirectToCorrectDashboard('administrador');
        return;
    }
    
    console.log('[DASHBOARD-NAV] Usuario autorizado:', userRole);
    
    // Determinar endpoint según el rol
    const endpoint = userRole === 'empacador' 
        ? 'http://localhost:8000/dashboard/empacador/data'
        : 'http://localhost:8000/dashboard/admin/data';
    
    fetch(endpoint, {
        headers: {
            'Authorization': `Bearer ${navToken}`
        }
    })
    .then(response => {
        if (!response.ok){
            if (response.status === 401 || response.status === 403){
                localStorage.clear();
                window.location.href = '../samples/error-404.html';
            }
            throw new Error('Error en la peticion');
        }
        return response.json();
    })
    .then(data => {
        // Mostrar datos del dashboard
        if(data.info_cards){
            const totalProductos = document.getElementById('total-productos');
            if (totalProductos) totalProductos.textContent = data.info_cards.total_productos;
            const totalStock = document.getElementById('total-stock');
            if (totalStock) totalStock.textContent = data.info_cards.total_stock;
            const totalVentas = document.getElementById('total-ventas');
            if (totalVentas) totalVentas.textContent = data.info_cards.total_ventas;
            const sumaVentas = document.getElementById('suma-ventas');
            if (sumaVentas) sumaVentas.textContent = `$${data.info_cards.suma_ventas.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;

            // Actualizar recuadros de ejemplo
            const revenueCard = document.getElementById('revenue-card');
            if(revenueCard) revenueCard.textContent = `$${data.info_cards.suma_ventas.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
            const salesCard = document.getElementById('sales-card');
            if(salesCard) salesCard.textContent = data.info_cards.total_ventas;
            const purchaseCard = document.getElementById('purchase-card');
            if(purchaseCard) purchaseCard.textContent = data.info_cards.total_productos;
        }
    })
    .catch(error => {
        console.error(error);
    });

    // Obtener y mostrar usuarios en la tabla de Últimas Actividades (solo para administradores)
    let usuariosData = [];
    
    if (userRole === 'administrador') {
        fetch('http://localhost:8000/dashboard/admin/users',{
            headers: {
                'Authorization': `Bearer ${navToken}`
            }
        })
        .then(response => {
            if (!response.ok){
                throw new Error('No autorizado o error al obtener usuarios');
            }
            return response.json();
        })
        .then(data => {
            if(data.usuarios){
                usuariosData = data.usuarios; // Guardar todos los usuarios para filtrar
                renderUsuariosTable(usuariosData);
            }
        })
        .catch(error => {
            console.error(error);
        });
    } else {
        // Para empacadores, ocultar la tabla de usuarios si existe
        const usersTable = document.getElementById('usuarios-tbody');
        if (usersTable && usersTable.parentElement) {
            usersTable.parentElement.parentElement.style.display = 'none';
        }
    }

    const logoutBtn = document.getElementById('cerrar_sesion');
    if (logoutBtn){
        logoutBtn.addEventListener('click',function(e){
            e.preventDefault();
            localStorage.clear();
            
            // Redirección inteligente al login
            const path = window.location.pathname;
            if(path.includes('dashboard_empacador')) {
                window.location.href = '../../../../pages/login.html';
            } else if(path.includes('dashboard_admin')) {
                window.location.href = '../../../../pages/login.html';
            } else {
                window.location.href = '../pages/login.html';
            }
        });
    }

    function renderUsuariosTable(usuarios) {
        const tbody = document.getElementById('usuarios-tbody');
        if (tbody) {
            tbody.innerHTML = '';
            usuarios.forEach((u, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                  <td>${idx+1}</td>
                  <td>${u.nombre}</td>
                  <td>${u.username}</td>
                  <td>${u.correo}</td>
                  <td>${u.rol}</td>
                  <td>${u.sucursal || '-'}</td>
                  <td>${u.fecha_creacion}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // Filtro en tiempo real para el input de búsqueda
    const searchInput = document.getElementById('search-user');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const filtered = usuariosData.filter(u =>
                (u.nombre && u.nombre.toLowerCase().includes(value)) ||
                (u.username && u.username.toLowerCase().includes(value)) ||
                (u.correo && u.correo.toLowerCase().includes(value)) ||
                (u.rol && u.rol.toLowerCase().includes(value)) ||
                (u.sucursal && u.sucursal.toLowerCase().includes(value))
            );
            renderUsuariosTable(filtered);
        });
    }

    // Mostrar nombre y rol de usuario en el perfil (navbar y sidebar)
    if (tokenUser && tokenUser.nombre) {
        // Solo mostrar el primer nombre
        const primerNombre = tokenUser.nombre.split(' ')[0];
        // Sidebar nombre
        const sidebarName = document.querySelector('.profile-name h5');
        if (sidebarName) sidebarName.textContent = primerNombre;
        // Sidebar rol
        const sidebarRole = document.querySelector('.profile-name span');
        if (sidebarRole) sidebarRole.textContent = tokenUser.rol || '';
        // Navbar nombre
        const navbarName = document.querySelector('.navbar-profile-name');
        if (navbarName) navbarName.textContent = primerNombre;
    }
    // Traducir opciones del menú de perfil a español
    const profileMenu = document.querySelector('.dropdown-menu[aria-labelledby="profileDropdown"]');
    if (profileMenu) {
        const items = profileMenu.querySelectorAll('.preview-item-content p');
        items.forEach(item => {
            if (item.textContent.trim() === 'Settings') item.textContent = 'Configuración';
            if (item.textContent.trim() === 'Log out') item.textContent = 'Cerrar sesión';
            if (item.textContent.trim() === 'Advanced settings') item.textContent = 'Configuración avanzada';
        });
        // Traducir título
        const title = profileMenu.querySelector('h6');
        if (title) title.textContent = 'Perfil';
    }

    // Cargar y mostrar datos del usuario en el perfil
    loadUserProfileData();
    
    function loadUserProfileData() {
        const userData = parseJwt(navToken);
        
        if (userData) {
            // Mostrar nombre de usuario en el sidebar
            const profileNameElements = document.querySelectorAll('.profile-name h5');
            profileNameElements.forEach(el => {
                el.textContent = userData.nombre || userData.sub || 'Usuario';
            });
            
            // Mostrar rol en el sidebar
            const profileSpanElements = document.querySelectorAll('.profile-name span');
            profileSpanElements.forEach(el => {
                el.textContent = userData.rol === 'administrador' ? 'Administrador' : 'Empacador';
            });
            
            // Mostrar nombre en la navbar
            const navbarProfileName = document.querySelector('.navbar-profile-name');
            if (navbarProfileName) {
                navbarProfileName.textContent = userData.nombre || userData.sub || 'Usuario';
            }
        }
    }

    // Funciones auxiliares para redirección
    function getLoginPath(){
        const path = window.location.pathname;
        
        if(path.includes('dashboard_admin') || path.includes('dashboard_empacador')){
            // Desde cualquier dashboard, volver al login principal
            if(path.includes('/pages/')){
                return '../../../../pages/login.html';
            } else {
                return '../../pages/login.html';
            }
        }
        
        // Fallback
        return '/polleria/frontend/pages/login.html';
    }

    function redirectToCorrectDashboard(userRole){
        // Redirección silenciosa e inmediata al dashboard correcto
        window.location.replace(getDashboardPath(userRole));
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