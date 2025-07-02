// JS para CRUD de ventas con carrito
const API_URL = 'http://localhost:8000';
let carrito = [];
let editVentaId = null;
let usuariosMap = {};
let sucursalesMap = {};
let ventaAEliminarId = null;
let stockProductos = {};

// Función para decodificar JWT
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

// Función para obtener el rol del usuario
function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const decoded = parseJwt(token);
  return decoded ? decoded.rol : null;
}

// Función para obtener el token
function getToken() {
  return localStorage.getItem('token');
}

document.addEventListener('DOMContentLoaded', function () {
  // Inicializar eventos de botones primero
  document.getElementById('btnNuevaVenta').onclick = function() {
    abrirModalVenta();
  };
  document.getElementById('btnAgregarProducto').onclick = function() {
    agregarProductoAlCarrito();
  };
  document.getElementById('formVenta').onsubmit = function(e) {
    e.preventDefault();
    guardarVenta();
  };
  
  // Buscador de ventas por producto, usuario o sucursal
  const searchInput = document.getElementById('search-venta-producto');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const filtro = this.value.trim().toLowerCase();
      const filas = document.querySelectorAll('#ventas-productos-tbody tr');
      filas.forEach(tr => {
        // Buscar en todas las celdas relevantes (producto, usuario, sucursal)
        const texto = tr.textContent.toLowerCase();
        if (texto.includes(filtro)) {
          tr.style.display = '';
        } else {
          tr.style.display = 'none';
        }
      });
    });
  }

  // Cargar datos iniciales
  cargarDatosIniciales();
});

function cargarDatosIniciales() {
  const userRole = getUserRole();
  const baseEndpoint = userRole === 'empacador' 
    ? `${API_URL}/dashboard/empacador` 
    : `${API_URL}/dashboard/admin`;
  
  console.log('Cargando datos iniciales para rol:', userRole);
  console.log('Endpoint base:', baseEndpoint);
  
  Promise.all([
    fetch(`${baseEndpoint}/users`, { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.json();
    }),
    fetch(`${baseEndpoint}/data`, { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.json();
    })
  ]).then(([usuariosData, sucursalesData]) => {
    console.log('Datos usuarios recibidos:', usuariosData);
    console.log('Datos sucursales recibidos:', sucursalesData);
    
    // Crear mapas para la tabla
    usuariosMap = {};
    (usuariosData.usuarios || []).forEach(u => { 
      usuariosMap[u.id] = u.nombre; 
      console.log(`Usuario mapeado: ${u.id} -> ${u.nombre}`);
    });
    
    sucursalesMap = {};
    (sucursalesData.sucursales || []).forEach(s => { 
      sucursalesMap[s.id] = s.nombre; 
      console.log(`Sucursal mapeada: ${s.id} -> ${s.nombre}`);
    });
    
    console.log('usuariosMap final:', usuariosMap);
    console.log('sucursalesMap final:', sucursalesMap);
    
    // Llenar los selects del modal
    llenarSelectsModal(usuariosData, sucursalesData);
    
    // Cargar productos
    cargarProductos();
    
    // Cargar ventas después de tener todos los mapas
    cargarVentas();
    
  }).catch(error => {
    console.error('Error cargando datos iniciales:', error);
    alert('Error cargando datos iniciales: ' + error.message);
  });
}

function llenarSelectsModal(usuariosData, sucursalesData) {
  // Llenar select de usuarios
  const selectUsuarios = document.getElementById('ventaUsuario');
  if (selectUsuarios) {
    selectUsuarios.innerHTML = '<option value="">Seleccione usuario</option>';
    (usuariosData.usuarios || []).forEach(u => {
      selectUsuarios.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
      console.log(`Usuario agregado al select: ${u.id} -> ${u.nombre}`);
    });
  }
    
  // Llenar select de sucursales
  const selectSucursales = document.getElementById('ventaSucursal');
  if (selectSucursales) {
    selectSucursales.innerHTML = '<option value="">Seleccione sucursal</option>';
    (sucursalesData.sucursales || []).forEach(s => {
      selectSucursales.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
      console.log(`Sucursal agregada al select: ${s.id} -> ${s.nombre}`);
    });
  }
}

function cargarProductos() {
  fetch(`${API_URL}/inventario/listar`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      const select = document.getElementById('ventaProducto');
      if (select) {
        select.innerHTML = '<option value="">Seleccione producto</option>';
        stockProductos = {};
        (data.inventario || []).forEach(p => {
          select.innerHTML += `<option value="${p.id}" data-precio="${p.precio_venta}">${p.producto}</option>`;
          stockProductos[p.id] = p.stock;
        });
        
        // Evento para autocompletar precio unitario y mostrar stock
        select.onchange = function() {
          const selected = select.options[select.selectedIndex];
          const precio = selected.getAttribute('data-precio');
          
          // Llenar precio para ambos roles
          document.getElementById('ventaPrecio').value = precio ? Number(precio).toFixed(2) : '';
          
          // Mostrar stock disponible para ambos roles
          const id = select.value;
          const stock = stockProductos[id] !== undefined ? stockProductos[id] : '';
          document.getElementById('stockDisponible').textContent = stock !== '' ? `Stock disponible: ${stock}` : '';
        };
      }
    })
    .catch(error => {
      console.error('Error cargando productos:', error);
    });
}

function getBadgeClass(estado) {
  switch ((estado||'').toLowerCase()) {
    case 'entregado': return 'success';
    case 'cancelado': return 'danger';
    case 'pendiente': return 'info';
    case '': return 'secondary';
    default: return 'dark'; // Para estados desconocidos
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function cargarVentas() {
  // Asegurar que los mapas estén cargados antes de procesar las ventas
  if (Object.keys(usuariosMap).length === 0 || Object.keys(sucursalesMap).length === 0) {
    console.log('Mapas no están cargados aún, saltando carga de ventas');
    return;
  }
  
  fetch(`${API_URL}/ventas/listar`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    .then(res => res.json())
    .then(ventas => {
      console.log('Ventas recibidas:', ventas);
      const tbody = document.getElementById('ventas-productos-tbody');
      tbody.innerHTML = '';
      
      ventas.forEach((v, idx) => {
        // Debug solo para la primera venta
        if (idx === 0) debugVenta(v);
        
        console.log('Procesando venta:', v);
        console.log('ID Usuario:', v.id_usuario, 'Nombre:', usuariosMap[v.id_usuario]);
        console.log('ID Sucursal:', v.id_sucursal, 'Nombre:', sucursalesMap[v.id_sucursal]);
      
      const usuarioNombre = usuariosMap[v.id_usuario] || `Usuario ${v.id_usuario}`;
      const sucursalNombre = sucursalesMap[v.id_sucursal] || `Sucursal ${v.id_sucursal}`;
      let estado = (typeof v.estado === 'string' ? v.estado : '').trim();
      let estadoBadge = estado ? capitalize(estado) : 'Sin estado';
      const tr = document.createElement('tr');
      
      // Mostrar información completa con total monetario para ambos roles
      console.log('Total monetario:', v.total);
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${usuarioNombre}</td>
        <td>${sucursalNombre}</td>
        <td>${v.fecha ? v.fecha.split('T')[0] : ''}</td>
        <td>$${Number(v.total || 0).toFixed(2)}</td>
        <td><span class="badge badge-${getBadgeClass(estado)}" style="font-size:1em;">${estadoBadge}</span></td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarVenta(${v.id})"><i class="mdi mdi-pencil"></i></button>
          <button class="btn btn-danger btn-sm" onclick="eliminarVenta(${v.id})"><i class="mdi mdi-delete"></i></button>
        </td>
      `;
      tr.addEventListener('click', function(e) {
        if (e.target.closest('button')) return;
        const select = document.getElementById('editarEstadoVenta');
        select.disabled = false;
        // Solo selecciona si el estado es uno de los válidos
        let estadoValue = (typeof v.estado === 'string' ? v.estado : '').toLowerCase().trim();
        if (["pendiente","entregado","cancelado"].includes(estadoValue)) {
          select.value = estadoValue;
        } else {
          select.value = '';
        }
        select.setAttribute('data-venta-id', v.id);
        document.getElementById('ventaSeleccionadaInfo').textContent = `Venta #${v.id} - Estado actual: ${estadoBadge}`;
      });
      tbody.appendChild(tr);
    });
    // Limpiar selector si no hay selección
    const select = document.getElementById('editarEstadoVenta');
    select.value = '';
    select.disabled = true;
    select.removeAttribute('data-venta-id');
    document.getElementById('ventaSeleccionadaInfo').textContent = '';
    })
    .catch(error => {
      console.error('Error cargando ventas:', error);
    });
}

function abrirModalVenta(venta = null) {
  carrito = [];
  editVentaId = null;
  document.getElementById('formVenta').reset();
  document.getElementById('tablaCarrito').querySelector('tbody').innerHTML = '';
  document.getElementById('ventaTotal').textContent = '0.00';
  document.getElementById('modalVentaLabel').textContent = venta ? 'Editar Venta' : 'Registrar Venta';
  
  // No hay restricciones de campos para ningún rol - todos ven todo
  // Headers completos para todos los roles
  const carritoHeaders = document.querySelector('#tablaCarrito thead tr');
  if (carritoHeaders) {
    carritoHeaders.innerHTML = `
      <th>Producto</th>
      <th>Cantidad</th>
      <th>Precio unitario</th>
      <th>Subtotal</th>
      <th>Acción</th>
    `;
  }
  
  if (venta) {
    editVentaId = venta.id;
    document.getElementById('ventaUsuario').value = venta.id_usuario;
    document.getElementById('ventaSucursal').value = venta.id_sucursal;
    // Cargar detalles
    fetch(`${API_URL}/ventas/detalle/${venta.id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
      .then(res => res.json())
      .then(detalles => {
        detalles.forEach(d => {
          carrito.push({
            id_producto: d.id_producto,
            nombre: d.id_producto, // Puedes mapear nombre real si lo necesitas
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario
          });
        });
        renderCarrito();
      });
  }
  $('#modalVenta').modal('show');
}

function agregarProductoAlCarrito() {
  const select = document.getElementById('ventaProducto');
  const id_producto = Number(select.value);
  const nombre = select.options[select.selectedIndex].text;
  const precio_venta = Number(select.options[select.selectedIndex].getAttribute('data-precio'));
  const cantidad = Number(document.getElementById('ventaCantidad').value);
  
  // Usar precio del input para todos los roles
  const precio_unitario = Number(document.getElementById('ventaPrecio').value);
  
  // Validaciones básicas
  if (!id_producto) {
    mostrarMensajeModalVenta('Seleccione un producto válido', 'danger');
    return;
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    mostrarMensajeModalVenta('La cantidad debe ser un número entero positivo', 'danger');
    return;
  }
  
  // Validar stock disponible
  const stock = stockProductos[id_producto];
  if (stock !== undefined && cantidad > stock) {
    mostrarMensajeModalVenta(`No hay suficiente stock. Stock disponible: ${stock}`, 'danger');
    return;
  }
  
  // Validaciones de precio para todos los roles
  if (!precio_unitario || isNaN(precio_unitario) || precio_unitario < precio_venta) {
    mostrarMensajeModalVenta('El precio unitario no puede ser menor al precio de venta del producto', 'danger');
    return;
  }
  if (precio_unitario === 0) {
    mostrarMensajeModalVenta('El precio unitario no puede ser 0', 'danger');
    return;
  }
  // No permitir precios muy bajos (por ejemplo, no menos del 80% del precio de venta)
  if (precio_unitario < precio_venta * 0.8) {
    mostrarMensajeModalVenta('El precio unitario no puede ser menor al 80% del precio de venta', 'danger');
    return;
  }
  
  // Si ya existe, suma cantidad
  const idx = carrito.findIndex(p => p.id_producto === id_producto);
  if (idx >= 0) {
    carrito[idx].cantidad += cantidad;
    carrito[idx].precio_unitario = precio_unitario; // Actualiza precio si lo cambió
  } else {
    carrito.push({ id_producto, nombre, cantidad, precio_unitario });
  }
  
  renderCarrito();
  
  // Limpiar formulario
  document.getElementById('ventaProducto').value = '';
  document.getElementById('ventaCantidad').value = 1;
  document.getElementById('ventaPrecio').value = '';
  document.getElementById('stockDisponible').textContent = '';
}

function renderCarrito() {
  const tbody = document.getElementById('tablaCarrito').querySelector('tbody');
  tbody.innerHTML = '';
  let total = 0;
  
  carrito.forEach((item, idx) => {
    const subtotal = item.cantidad * item.precio_unitario;
    total += subtotal;
    const tr = document.createElement('tr');
    
    // Mostrar información completa para todos los roles
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>$${Number(item.precio_unitario).toFixed(2)}</td>
      <td>$${subtotal.toFixed(2)}</td>
      <td><button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${idx})"><i class="mdi mdi-delete"></i></button></td>
    `;
    
    tbody.appendChild(tr);
  });
  
  // Mostrar total para todos los roles
  document.getElementById('ventaTotal').textContent = total.toFixed(2);
}

function eliminarDelCarrito(idx) {
  carrito.splice(idx, 1);
  renderCarrito();
}

function guardarVenta() {
  const id_usuario = Number(document.getElementById('ventaUsuario').value);
  const id_sucursal = Number(document.getElementById('ventaSucursal').value);
  if (!id_usuario || !id_sucursal || carrito.length === 0) {
    mostrarMensajeModalVenta('Complete todos los campos y agregue al menos un producto', 'danger');
    return;
  }
  const detalles = carrito.map(p => ({
    id_producto: p.id_producto,
    cantidad: p.cantidad,
    precio_unitario: p.precio_unitario
  }));
  const body = {
    id_usuario,
    id_sucursal,
    detalles
  };
  const url = editVentaId ? `${API_URL}/ventas/editar/${editVentaId}` : `${API_URL}/ventas/crear`;
  const method = editVentaId ? 'PUT' : 'POST';
  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(body)
  })
    .then(async res => {
      if (!res.ok) {
        let msg = 'No se pudo guardar la venta';
        try {
          const data = await res.json();
          if (data && data.detail) msg = data.detail;
        } catch {}
        throw new Error(msg);
      }
      return res.json();
    })
    .then((ventaGuardada) => {
      if (!ventaGuardada || !ventaGuardada.id || !ventaGuardada.total || ventaGuardada.total <= 0) {
        mostrarMensajeModalVenta('La venta no se registró correctamente. Verifique los datos.', 'danger');
        return;
      }
      $('#modalVenta').modal('hide');
      cargarVentas();
    })
    .catch((err) => mostrarMensajeModalVenta(err.message, 'danger'));
}

window.editarVenta = function(id) {
  fetch(`${API_URL}/ventas/listar`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    .then(res => res.json())
    .then(ventas => {
      const venta = ventas.find(v => v.id === id);
      if (venta) abrirModalVenta(venta);
    });
};

// Eliminar venta con SweetAlert2
window.eliminarVenta = function(id) {
  Swal.fire({
    title: '¿Eliminar venta?',
    text: '¿Estás seguro que deseas eliminar esta venta? Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${API_URL}/ventas/eliminar/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al eliminar venta');
          Swal.fire('¡Eliminado!', 'La venta fue eliminada correctamente.', 'success');
          cargarVentas();
        })
        .catch(() => {
          Swal.fire('Error', 'No se pudo eliminar la venta', 'error');
        });
    }
  });
};

document.addEventListener('DOMContentLoaded', function () {
  // Botón de confirmación de eliminación
  const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminarVenta');
  if (btnConfirmarEliminar) {
    btnConfirmarEliminar.onclick = function() {
      if (!ventaAEliminarId) return;
      fetch(`${API_URL}/ventas/eliminar/${ventaAEliminarId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al eliminar venta');
          $('#modalConfirmarEliminarVenta').modal('hide');
          mostrarMensajeVentaTabla('¡Venta eliminada correctamente!', 'success');
          cargarVentas();
        })
        .catch(() => {
          document.getElementById('mensajeEliminarVenta').innerHTML = '<div class="alert alert-danger">No se pudo eliminar la venta</div>';
        });
    };
  }
});

function mostrarMensajeModalVenta(msg, tipo) {
  let alert = document.getElementById('alertModalVenta');
  alert.className = 'alert alert-' + tipo + ' mt-2';
  alert.textContent = msg;
  setTimeout(() => { alert.textContent = ''; alert.className = ''; }, 2500);
}

function mostrarMensajeVentaTabla(msg, tipo) {
  let alert = document.getElementById('alertTablaVenta');
  if (!alert) {
    alert = document.createElement('div');
    alert.id = 'alertTablaVenta';
    alert.className = 'alert alert-' + tipo + ' mt-2';
    alert.style.position = 'fixed';
    alert.style.top = '80px';
    alert.style.right = '30px';
    alert.style.zIndex = '9999';
    document.body.appendChild(alert);
  }
  alert.className = 'alert alert-' + tipo + ' mt-2';
  alert.textContent = msg;
  alert.style.display = 'block';
  setTimeout(() => { alert.style.display = 'none'; }, 2000);
}

document.getElementById('editarEstadoVenta').onchange = function() {
  const ventaId = this.getAttribute('data-venta-id');
  const nuevoEstado = this.value;
  if (ventaId && nuevoEstado) {
    window.cambiarEstadoVenta(ventaId, nuevoEstado);
    // Mantener el dropdown habilitado y mostrar el estado actualizado tras el cambio
    // El refresco de la tabla y el badge se hará tras la actualización
  }
};

window.cambiarEstadoVenta = function(id, nuevoEstado) {
  fetch(`${API_URL}/ventas/estado/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ estado: nuevoEstado })
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al cambiar estado');
      mostrarMensajeVentaTabla('¡Estado de la venta actualizado!', 'success');
      setTimeout(cargarVentas, 500); // Espera breve para asegurar actualización
    })
    .catch(() => mostrarMensajeVentaTabla('No se pudo cambiar el estado de la venta', 'danger'));
};

// Función para asegurar que los mapas estén cargados
function asegurarMapasCargados() {
  return new Promise((resolve) => {
    console.log('Verificando mapas cargados...');
    console.log('usuariosMap:', Object.keys(usuariosMap).length, 'entradas');
    console.log('sucursalesMap:', Object.keys(sucursalesMap).length, 'entradas');
    
    if (Object.keys(usuariosMap).length > 0 && Object.keys(sucursalesMap).length > 0) {
      console.log('Mapas ya están cargados');
      resolve();
      return;
    }
    
    console.log('Recargando mapas de usuarios y sucursales...');
    const userRole = getUserRole();
    const baseEndpoint = userRole === 'empacador' 
      ? `${API_URL}/dashboard/empacador` 
      : `${API_URL}/dashboard/admin`;
    
    Promise.all([
      fetch(`${baseEndpoint}/users`, { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(res => res.json()),
      fetch(`${baseEndpoint}/data`, { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(res => res.json())
    ]).then(([usuariosData, sucursalesData]) => {
      console.log('Datos recibidos para mapas - usuarios:', usuariosData);
      console.log('Datos recibidos para mapas - sucursales:', sucursalesData);
      
      usuariosMap = {};
      (usuariosData.usuarios || []).forEach(u => { 
        usuariosMap[u.id] = u.nombre; 
        console.log(`Mapa usuario: ${u.id} -> ${u.nombre}`);
      });
      
      sucursalesMap = {};
      (sucursalesData.sucursales || []).forEach(s => { 
        sucursalesMap[s.id] = s.nombre; 
        console.log(`Mapa sucursal: ${s.id} -> ${s.nombre}`);
      });
      
      console.log('Mapas actualizados:');
      console.log('usuariosMap final:', usuariosMap);
      console.log('sucursalesMap final:', sucursalesMap);
      
      resolve();
    }).catch(error => {
      console.error('Error recargando mapas:', error);
      resolve(); // Continuar aunque haya error
    });
  });
}

// Debug: mostrar estructura completa de una venta
function debugVenta(venta) {
  console.log('=== DEBUG VENTA ===');
  console.log('Estructura completa:', venta);
  console.log('Campos disponibles:', Object.keys(venta));
  console.log('id_usuario:', venta.id_usuario, 'tipo:', typeof venta.id_usuario);
  console.log('id_sucursal:', venta.id_sucursal, 'tipo:', typeof venta.id_sucursal);
  console.log('total:', venta.total, 'tipo:', typeof venta.total);
  console.log('cantidad_productos:', venta.cantidad_productos);
  console.log('total_productos:', venta.total_productos);
  console.log('fecha:', venta.fecha);
  console.log('estado:', venta.estado);
  console.log('==================');
}
