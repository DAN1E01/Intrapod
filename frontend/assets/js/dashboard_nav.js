document.addEventListener('DOMContentLoaded', function(){
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/dashboard/admin/data',{
        headers: {
            'Authorization': `Bearer ${token}`
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

    // Obtener y mostrar usuarios en la tabla de Últimas Actividades
    let usuariosData = [];
    fetch('http://localhost:8000/dashboard/admin/users',{
        headers: {
            'Authorization': `Bearer ${token}`
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

    const logoutBtn = document.getElementById('cerrar_sesion');
    if (logoutBtn){
        logoutBtn.addEventListener('click',function(e){
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../../../../pages/login.html';
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
    const tokenUser = parseJwt(token);
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
});