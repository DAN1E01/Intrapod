// Función para decodificar JWT
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function(){
    const empacadorToken = localStorage.getItem('token');
    
    // Usar el endpoint de empacador
    fetch('http://localhost:8000/dashboard/empacador/data',{
        headers: {
            'Authorization': `Bearer ${empacadorToken}`
        }
    })
    .then(response => {
        if (!response.ok){
            if (response.status === 401 || response.status === 403){
                localStorage.clear();
                window.location.href = '../dashboard_empacador/pages/samples/error-404.html';
            }
            throw new Error('Error en la peticion');
        }
        return response.json();
    })
    .then(data => {
        // Mostrar datos del dashboard empacador
        if(data.info_cards){
            document.getElementById('total-productos').textContent = data.info_cards.total_productos;
            document.getElementById('total-stock').textContent = data.info_cards.total_stock;
            
            // Para empacadores, mostramos las ventas de su sucursal
            const totalVentasCard = document.getElementById('total-ventas');
            if(totalVentasCard && data.info_cards.total_ventas !== undefined) {
                totalVentasCard.textContent = data.info_cards.total_ventas;
            }
            
            // Ocultamos suma de ventas (información financiera restringida)
            const sumaVentasCard = document.getElementById('suma-ventas');
            if(sumaVentasCard) {
                sumaVentasCard.textContent = 'Restringido';
                sumaVentasCard.parentElement.parentElement.style.opacity = '0.6';
            }

            // Actualizar recuadros de ejemplo (limitados para empacador)
            const revenueCard = document.getElementById('revenue-card');
            if(revenueCard) {
                revenueCard.textContent = 'Restringido';
                revenueCard.parentElement.parentElement.parentElement.style.opacity = '0.5';
            }
            
            const salesCard = document.getElementById('sales-card');
            if(salesCard) {
                salesCard.textContent = data.info_cards.total_ventas || '0';
            }
            
            const purchaseCard = document.getElementById('purchase-card');
            if(purchaseCard) {
                purchaseCard.textContent = data.info_cards.total_stock || '0';
            }
        }
        
        // Mostrar información de la sucursal si está disponible
        if(data.sucursal) {
            console.log('Sucursal del empacador:', data.sucursal.nombre);
        }
    })
    .catch(error => {
        console.error(error);
    });

    // Obtener y mostrar productos más vendidos (limitado a su sucursal)
    fetch('http://localhost:8000/dashboard/empacador/productos-mas-vendidos',{
        headers: {
            'Authorization': `Bearer ${empacadorToken}`
        }
    })
    .then(response => {
        if (!response.ok){
            throw new Error('No autorizado o error al obtener productos más vendidos');
        }
        return response.json();
    })
    .then(data => {
        renderProductosTable(data);
    })
    .catch(error => {
        console.error(error);
    });

    const logoutBtn = document.getElementById('cerrar_sesion');
    if (logoutBtn){
        logoutBtn.addEventListener('click',function(e){
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../../pages/login.html';
        });
    }

    function renderProductosTable(productos) {
        const tbody = document.getElementById('usuarios-tbody');
        if (tbody) {
            tbody.innerHTML = '';
            productos.forEach((u, idx) => {
                const tr = document.createElement('tr');
                // Para empacadores, mostrar stock actual en lugar de información financiera
                tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td>${u.producto}</td>
                    <td>${u.total_vendido}</td>
                    <td><span class="badge ${u.stock_actual > 10 ? 'badge-success' : u.stock_actual > 5 ? 'badge-warning' : 'badge-danger'}">${u.stock_actual || 'N/A'}</span></td>
                    <td>${u.sucursal}</td>
                `;
                tbody.appendChild(tr);
            });
            // Refresca el filtro de productos después de llenar la tabla
            if (window.refrescarFiltroProductos) {
                window.refrescarFiltroProductos();
            }
        }
    }

    // Mostrar nombre y rol de usuario en el perfil (navbar y sidebar)
    const tokenUser = parseJwt(empacadorToken);
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
            if (item.textContent.trim() === 'Settings') {
                item.textContent = 'Configuración';
            }
            if (item.textContent.trim() === 'Log out') {
                item.textContent = 'Cerrar Sesión';
            }
            if (item.textContent.trim() === 'Advanced settings') {
                item.textContent = 'Configuración Avanzada'; 
            }
        });
        // Traducir título
        const title = profileMenu.querySelector('h6');
        if (title) {
            title.textContent = 'Perfil';
        }
    }
});
