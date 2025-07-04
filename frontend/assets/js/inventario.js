// frontend/assets/js/inventario.js

document.addEventListener('DOMContentLoaded', function () {
    // No hay restricciones de rol - todos los usuarios tienen acceso completo
    
    // Definir elementos una sola vez al inicio
    const exportBtn = document.querySelector('.btn-outline-success');
    const btnNuevoProducto = document.getElementById('btnNuevoProducto');
    
    cargarFiltros();
    cargarInventario();
    document.getElementById('dropdownSucursal').addEventListener('click', mostrarDropdownSucursal);
    document.getElementById('dropdownCategoria').addEventListener('click', mostrarDropdownCategoria);
    // Exportar a CSV
    if (exportBtn) {
        exportBtn.addEventListener('click', exportarCSV);
    }
    // Abrir modal Nuevo Producto
    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener('click', function() {
            // Resetear completamente el modal para nuevo producto
            resetModalNuevoProducto();
            // Cambiar título del modal
            document.getElementById('modalNuevoProductoLabel').textContent = 'Nuevo Producto';
            // Limpiar modo edición
            const form = document.getElementById('formNuevoProducto');
            if (form) {
                form.removeAttribute('data-edit-id');
                form.reset(); // Limpiar todos los campos del formulario
            }
            // Poblar sucursales y categorías en el select del modal
            const userRole = getUserRole();
            const baseEndpoint = userRole === 'empacador' 
                ? `${API_URL}/dashboard/empacador` 
                : `${API_URL}/dashboard/admin`;
            
            Promise.all([
                fetch(`${baseEndpoint}/data`, {
                    headers: { 'Authorization': `Bearer ${getInventarioToken()}` }
                }).then(res => res.json()),
                fetch(`${API_URL}/inventario/categorias`, {
                    headers: { 'Authorization': `Bearer ${getInventarioToken()}` }
                }).then(res => res.json())
            ]).then(([data, categorias]) => {
                // Sucursales
                const selectSuc = document.getElementById('sucursalProducto');
                if (selectSuc) {
                    selectSuc.innerHTML = '<option value="">Seleccione una sucursal</option>';
                    (data.sucursales || []).forEach(suc => {
                        selectSuc.innerHTML += `<option value="${suc.id}">${suc.nombre}</option>`;
                    });
                }
                // Categorías
                const selectCat = document.getElementById('categoriaProducto');
                if (selectCat) {
                    selectCat.innerHTML = '<option value="">Seleccione una categoría</option>';
                    (categorias || []).forEach(cat => {
                        selectCat.innerHTML += `<option value="${cat.id}">${cat.nombre}</option>`;
                    });
                }
                // Limpiar campos del formulario
                form.reset();
                // Asegurar que los selects queden en vacío
                if (selectSuc) selectSuc.value = '';
                if (selectCat) selectCat.value = '';
                $('#modalNuevoProducto').modal('show');
            });
        });
    }
    // Validación y envío del formulario
    const form = document.getElementById('formNuevoProducto');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Obtener valores de los campos por ID para evitar ambigüedad
            const nombre = document.getElementById('nombreProducto').value.trim();
            const descripcion = document.getElementById('descripcionProducto').value.trim();
            const precio_compra = document.getElementById('precioCompra').value;
            const precio_venta = document.getElementById('precioVenta').value;
            // Eliminar referencia a stockMinimo (ya no existe)
            const sucursal = document.getElementById('sucursalProducto').value;
            const categoria = document.getElementById('categoriaProducto').value;
            // El stock_inicial ahora siempre será 7 (oculto)
            const stock_inicial = 7;
            let error = '';
            // Validaciones personalizadas
            const regexNombreDesc = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,\-\/()]+$/;
            const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;
            // Detectar cadenas repetidas (ej: adadadadadad)
            function esCadenaRepetida(str) {
                if (str.length < 6) return false;
                const patrones = [/^(\w{2,4})\1+$/, /^(\w)\1+$/];
                return patrones.some(pat => pat.test(str.replace(/\s/g, '')));
            }
            if (!nombre || nombre.replace(/\s/g, '') === '') error = 'El nombre es obligatorio.';
            else if (!regexNombreDesc.test(nombre) || /^\d+$/.test(nombre)) error = 'El nombre debe contener letras y ser válido para electrodomésticos.';
            else if (soloLetras.test(nombre) && esCadenaRepetida(nombre)) error = 'El nombre no puede ser una cadena repetitiva sin sentido.';
            else if (!descripcion || descripcion.replace(/\s/g, '') === '') error = 'La descripción es obligatoria.';
            else if (!regexNombreDesc.test(descripcion) || /^\d+$/.test(descripcion)) error = 'La descripción debe contener letras y ser válida para electrodomésticos.';
            else if (soloLetras.test(descripcion) && esCadenaRepetida(descripcion)) error = 'La descripción no puede ser una cadena repetitiva sin sentido.';
            else if (!precio_compra || isNaN(precio_compra) || Number(precio_compra) <= 0) error = 'Precio de compra inválido.';
            else if (!precio_venta || isNaN(precio_venta) || Number(precio_venta) <= 0) error = 'Precio de venta inválido.';
            else if (Number(precio_compra) === Number(precio_venta)) error = 'El precio de compra y venta no pueden ser iguales.';
            else if (Number(precio_venta) <= Number(precio_compra)) error = 'El precio de venta debe ser mayor al de compra.';
            // Eliminar validación de stock_minimo (ya no existe)
            else if (stock_inicial === '' || isNaN(stock_inicial) || Number(stock_inicial) < 1 || Number(stock_inicial) > 99999) error = 'Stock inicial inválido. Debe ser un número entre 1 y 99999.';
            else if (!sucursal) error = 'Debe seleccionar una sucursal.';
            else if (!categoria) error = 'Debe seleccionar una categoría.';
            if (error) {
                mostrarMensajeModal(error, 'danger');
                return;
            }
            // Detectar si es edición
            const editId = form.getAttribute('data-edit-id');
            if (editId) {
                // Editar producto
                const body = {
                    nombre,
                    descripcion,
                    precio_compra: Number(precio_compra),
                    precio_venta: Number(precio_venta),
                    id_categoria: Number(categoria)
                };
                fetch(`${API_URL}/inventario/editar/${editId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getInventarioToken()}`
                    },
                    body: JSON.stringify(body)
                })
                .then(res => {
                    if (!res.ok) throw new Error('Error al editar producto');
                    return res.json();
                })
                .then(data => {
                    $('#modalNuevoProducto').modal('hide');
                    form.reset();
                    form.removeAttribute('data-edit-id');
                    mostrarMensajeArriba('Producto editado correctamente', 'success');
                    cargarInventario();
                })
                .catch(err => {
                    mostrarMensajeModal('No se pudo editar el producto.', 'danger');
                });
                return;
            }
            // Enviar al backend
            const body = {
                nombre,
                descripcion,
                precio_compra: Number(precio_compra),
                precio_venta: Number(precio_venta),
                id_sucursal: Number(sucursal),
                id_categoria: Number(categoria),
                stock_inicial: stock_inicial
            };
            fetch(`${API_URL}/inventario/agregar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getInventarioToken()}`
                },
                body: JSON.stringify(body)
            })
            .then(res => {
                if (!res.ok) throw new Error('Error al agregar producto');
                return res.json();
            })
            .then(data => {
                $('#modalNuevoProducto').modal('hide');
                form.reset();
                mostrarMensajeArriba('Producto agregado correctamente', 'success');
                // Refrescar la página para evitar problemas de estado
                setTimeout(() => { window.location.reload(); }, 500);
            })
            .catch(err => {
                mostrarMensajeModal('No se pudo agregar el producto.', 'danger');
            });
        });
    }
    // Resetear modal cuando se cierre
    $('#modalNuevoProducto').on('hidden.bs.modal', function () {
        resetModalNuevoProducto();
    });
});

let sucursalSeleccionada = 'Todas';
let categoriaSeleccionada = 'Todas';
let inventarioGlobal = [];
let textoBusqueda = '';

const API_URL = 'http://localhost:8000';

// Función para obtener el token
function getInventarioToken() {
    return localStorage.getItem('token');
}

function cargarFiltros() {
    // Detectar rol y usar el endpoint apropiado
    const userRole = getUserRole();
    const baseEndpoint = userRole === 'empacador' 
        ? `${API_URL}/dashboard/empacador` 
        : `${API_URL}/dashboard/admin`;
    
    // Cargar sucursales
    fetch(`${baseEndpoint}/data`, {
        headers: {
            'Authorization': `Bearer ${getInventarioToken()}`
        }
    })
        .then(res => res.json())
        .then(data => {
            const sucursales = data.sucursales || [];
            const menu = document.querySelector('#dropdownSucursalMenu');
            menu.innerHTML = '<a class="dropdown-item" href="#" data-value="Todas">Todas las sucursales</a>';
            sucursales.forEach(suc => {
                menu.innerHTML += `<a class="dropdown-item" href="#" data-value="${suc.nombre}">${suc.nombre}</a>`;
            });
            menu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    sucursalSeleccionada = this.getAttribute('data-value');
                    document.getElementById('dropdownSucursal').textContent = sucursalSeleccionada;
                    filtrarTabla();
                });
            });
        });
    // Cargar categorías
    fetch(`${API_URL}/inventario/categorias`, {
        headers: {
            'Authorization': `Bearer ${getInventarioToken()}`
        }
    })
        .then(res => res.json())
        .then(categorias => {
            const menu = document.querySelector('#dropdownCategoriaMenu');
            menu.innerHTML = '<a class="dropdown-item" href="#" data-value="Todas">Todas las categorías</a>';
            categorias.forEach(cat => {
                menu.innerHTML += `<a class="dropdown-item" href="#" data-value="${cat.nombre}">${cat.nombre}</a>`;
            });
            menu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    categoriaSeleccionada = this.getAttribute('data-value');
                    document.getElementById('dropdownCategoria').textContent = categoriaSeleccionada;
                    filtrarTabla();
                });
            });
        });
    // Buscador
    const inputBuscar = document.getElementById('search-user');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', function() {
            textoBusqueda = this.value.toLowerCase();
            filtrarTabla();
        });
    }
}

function cargarInventario() {
    fetch(`${API_URL}/inventario/listar`, {
        headers: {
            'Authorization': `Bearer ${getInventarioToken()}`
        }
    })
        .then(response => response.json())
        .then(data => {
            inventarioGlobal = data.inventario || [];
            filtrarTabla();
        })
        .catch(error => {
            console.error('Error al cargar inventario:', error);
        });
}

function filtrarTabla() {
    const tbody = document.querySelector('table.table tbody');
    tbody.innerHTML = '';
    let datos = inventarioGlobal;
    
    if (sucursalSeleccionada !== 'Todas') {
        datos = datos.filter(item => item.sucursal === sucursalSeleccionada);
    }
    if (categoriaSeleccionada !== 'Todas') {
        datos = datos.filter(item => item.categoria === categoriaSeleccionada);
    }
    if (textoBusqueda) {
        datos = datos.filter(item =>
            item.producto.toLowerCase().includes(textoBusqueda) ||
            (item.descripcion && item.descripcion.toLowerCase().includes(textoBusqueda)) ||
            (item.sucursal && item.sucursal.toLowerCase().includes(textoBusqueda))
        );
    }
    
    datos.forEach(item => {
        const tr = document.createElement('tr');
        
        // Mostrar información completa incluyendo precios para todos los roles
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.producto}</td>
            <td class="d-none d-md-table-cell">${item.descripcion}</td>
            <td>${item.precio_compra.toFixed(2)}</td>
            <td>${item.precio_venta.toFixed(2)}</td>
            <td>${(item.stock !== undefined && item.stock !== null && !isNaN(item.stock)) ? item.stock : 0}</td>
            <td>${item.sucursal}</td>
            <td>${item.categoria}</td>
            <td style="vertical-align:middle;">
                <div class="d-flex flex-row justify-content-center align-items-center gap-1">
                    <button class="btn btn-sm btn-warning mr-1 btn-editar-producto"><i class="mdi mdi-pencil"></i> Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar-producto"><i class="mdi mdi-delete"></i> Eliminar</button>
                </div>
            </td>
        `;
        // Asignar listeners a los botones
        tr.querySelector('.btn-eliminar-producto').addEventListener('click', function() {
            Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta acción eliminará el producto y no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`${API_URL}/inventario/eliminar/${item.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${getInventarioToken()}` }
                    })
                    .then(res => {
                        if (!res.ok) throw new Error('Error al eliminar producto');
                        mostrarMensajeArriba('Producto eliminado correctamente', 'success');
                        cargarInventario();
                    })
                    .catch(err => {
                        mostrarMensajeArriba('No se pudo eliminar el producto.', 'danger');
                    });
                }
            });
        });
        tr.querySelector('.btn-editar-producto').addEventListener('click', function() {
            // Cambiar título del modal
            document.getElementById('modalNuevoProductoLabel').textContent = 'Editar Producto';
            const form = document.getElementById('formNuevoProducto');
            // Poblar sucursales y categorías antes de mostrar el modal
            const userRole = getUserRole();
            const baseEndpoint = userRole === 'empacador' 
                ? `${API_URL}/dashboard/empacador` 
                : `${API_URL}/dashboard/admin`;
            
            Promise.all([
                fetch(`${baseEndpoint}/data`, {
                    headers: { 'Authorization': `Bearer ${getInventarioToken()}` }
                }).then(res => res.json()),
                fetch(`${API_URL}/inventario/categorias`, {
                    headers: { 'Authorization': `Bearer ${getInventarioToken()}` }
                }).then(res => res.json())
            ]).then(([data, categorias]) => {
                // Sucursales
                const selectSuc = document.getElementById('sucursalProducto');
                if (selectSuc) {
                    selectSuc.innerHTML = '<option value="">Seleccione una sucursal</option>';
                    (data.sucursales || []).forEach(suc => {
                        selectSuc.innerHTML += `<option value="${suc.id}">${suc.nombre}</option>`;
                    });
                }
                // Categorías
                const selectCat = document.getElementById('categoriaProducto');
                if (selectCat) {
                    selectCat.innerHTML = '<option value="">Seleccione una categoría</option>';
                    (categorias || []).forEach(cat => {
                        selectCat.innerHTML += `<option value="${cat.id}">${cat.nombre}</option>`;
                    });
                }
                // Poblar campos
                document.getElementById('nombreProducto').value = item.producto;
                document.getElementById('descripcionProducto').value = item.descripcion;
                document.getElementById('precioCompra').value = item.precio_compra;
                document.getElementById('precioVenta').value = item.precio_venta;
                // Eliminar referencia a stockMinimo (ya no existe)
                // Seleccionar sucursal y categoría actuales
                if (selectSuc) selectSuc.value = data.sucursales.find(s => s.nombre === item.sucursal)?.id || '';
                if (selectCat) selectCat.value = categorias.find(c => c.nombre === item.categoria)?.id || '';
                // Guardar id para edición
                form.setAttribute('data-edit-id', item.id);
                $('#modalNuevoProducto').modal('show');
            });
        });
        tbody.appendChild(tr);
    });
}

// Inicializar dropdowns cuando se cargue el DOM
setTimeout(function() {
    // Forzar inicialización de dropdowns
    $('.dropdown-toggle').dropdown();
    console.log('[INVENTARIO] Dropdowns inicializados');
}, 100);

// Botón global para abrir el modal de ajustar stock

const btnAjustarStockGlobal = document.getElementById('btnAjustarStockGlobal');
if (btnAjustarStockGlobal) {
    btnAjustarStockGlobal.addEventListener('click', function() {
        const select = document.getElementById('ajustarStockIdProducto');
        if (!select) return;
        select.innerHTML = '<option value="">Seleccione un producto</option>';
        // LOG para depuración
        console.log('INVENTARIO GLOBAL AL ABRIR MODAL:', inventarioGlobal);
        if (!Array.isArray(inventarioGlobal) || inventarioGlobal.length === 0) {
            cargarInventario();
            setTimeout(() => btnAjustarStockGlobal.click(), 500);
            return;
        }
        inventarioGlobal.forEach(item => {
            select.innerHTML += `<option value="${item.id}" data-stock="${item.stock}">${item.producto} (${item.sucursal})</option>`;
        });
        const stockActual = document.getElementById('ajustarStockActual');
        const stockCantidad = document.getElementById('ajustarStockCantidad');
        const stockMotivo = document.getElementById('ajustarStockMotivo');
        if (stockActual) stockActual.textContent = '-';
        if (stockCantidad) stockCantidad.value = '';
        if (stockMotivo) stockMotivo.value = '';
        // Asignar listeners cada vez que se abre el modal
        select.onchange = function() {
            const id = this.value;
            if (!id) {
                if (stockActual) stockActual.textContent = '-';
                return;
            }
            const producto = inventarioGlobal.find(p => String(p.id) === String(id));
            if (stockActual) stockActual.textContent = (producto && producto.stock !== undefined && producto.stock !== null && !isNaN(producto.stock)) ? producto.stock : 0;
        };
        const formAjustarStock = document.getElementById('formAjustarStock');
        if (formAjustarStock) {
            formAjustarStock.onsubmit = function(e) {
                e.preventDefault();
                const id_inventario = select.value;
                const cantidad = parseInt(document.getElementById('ajustarStockCantidad')?.value, 10);
                const motivo = document.getElementById('ajustarStockMotivo')?.value.trim();
                console.log('Enviando ajuste:', { id_inventario, cantidad, motivo });
                if (!id_inventario || isNaN(cantidad) || motivo === '') {
                    mostrarMensajeArriba('Complete todos los campos para ajustar el stock.', 'danger');
                    return;
                }
                fetch(`${API_URL}/inventario/ajustar_stock`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getInventarioToken()}`
                    },
                    body: JSON.stringify({ id_inventario: Number(id_inventario), cantidad, motivo })
                })
                .then(res => {
                    if (!res.ok) throw new Error('Error al ajustar stock');
                    return res.json();
                })
                .then(data => {
                    console.log('Respuesta del backend:', data);
                    $('#modalAjustarStock').modal('hide');
                    mostrarMensajeArriba('Stock ajustado correctamente', 'success');
                    cargarInventario();
                    // Limpiar campos
                    if (stockActual) stockActual.textContent = '-';
                    if (stockCantidad) stockCantidad.value = '';
                    if (stockMotivo) stockMotivo.value = '';
                    select.selectedIndex = 0;
                })
                .catch(err => {
                    console.error('Error al ajustar stock:', err);
                    mostrarMensajeArriba('No se pudo ajustar el stock.', 'danger');
                });
            };
        }
        $('#modalAjustarStock').modal('show');
    });
}

function mostrarDropdownSucursal(e) {
    document.getElementById('dropdownSucursalMenu').classList.toggle('show');
}
function mostrarDropdownCategoria(e) {
    document.getElementById('dropdownCategoriaMenu').classList.toggle('show');
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
        document.getElementById('dropdownSucursalMenu').classList.remove('show');
        document.getElementById('dropdownCategoriaMenu').classList.remove('show');
    }
});

function exportarCSV() {
    // Filtrar los datos igual que en la tabla
    let datos = inventarioGlobal;
    if (sucursalSeleccionada !== 'Todas') {
        datos = datos.filter(item => item.sucursal === sucursalSeleccionada);
    }
    if (categoriaSeleccionada !== 'Todas') {
        datos = datos.filter(item => item.categoria === categoriaSeleccionada);
    }
    if (textoBusqueda) {
        datos = datos.filter(item =>
            item.producto.toLowerCase().includes(textoBusqueda) ||
            (item.descripcion && item.descripcion.toLowerCase().includes(textoBusqueda)) ||
            (item.sucursal && item.sucursal.toLowerCase().includes(textoBusqueda))
        );
    }
    if (!datos.length) {
        alert('No hay datos para exportar.');
        return;
    }
    // Encabezados
    const headers = ['ID', 'Producto', 'Descripción', 'P. Compra', 'P. Venta', 'Stock', 'Sucursal', 'Categoría'];
    const rows = datos.map(item => [
        item.id,
        item.producto,
        item.descripcion,
        item.precio_compra.toFixed(2),
        item.precio_venta.toFixed(2),
        item.stock,
        item.sucursal,
        item.categoria
    ]);
    let csvContent = '';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(',') + '\n';
    });
    // Descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'inventario.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Mensaje en el modal
function mostrarMensajeModal(msg, tipo) {
    let alert = document.getElementById('alertModalProducto');
    if (!alert) {
        alert = document.createElement('div');
        alert.id = 'alertModalProducto';
        alert.className = 'alert mt-2';
        document.querySelector('#formNuevoProducto .modal-body').appendChild(alert);
    }
    alert.className = 'alert alert-' + tipo + ' mt-2';
    alert.textContent = msg;
}
// Mensaje arriba de la tabla
function mostrarMensajeArriba(msg, tipo) {
    let alert = document.getElementById('alertArribaTabla');
    if (!alert) {
        alert = document.createElement('div');
        alert.id = 'alertArribaTabla';
        alert.className = 'alert mt-2';
        const cardBody = document.querySelector('.card-body');
        if (cardBody) cardBody.prepend(alert);
    }
    alert.className = 'alert alert-' + tipo + ' mt-2';
    alert.textContent = msg;
    setTimeout(() => { alert.remove(); }, 3000);
}

// Función para detectar rol del usuario
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const decoded = parseJwt(token);
  return decoded ? decoded.rol : null;
}

// Función para resetear completamente el modal de nuevo producto
function resetModalNuevoProducto() {
    // Cambiar título
    const modalTitle = document.getElementById('modalNuevoProductoLabel');
    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Producto';
    }
    
    // Limpiar formulario
    const form = document.getElementById('formNuevoProducto');
    if (form) {
        form.reset();
        form.removeAttribute('data-edit-id');
    }
    
    // Limpiar selects
    const selectSuc = document.getElementById('sucursalProducto');
    if (selectSuc) {
        selectSuc.innerHTML = '<option value="">Seleccione una sucursal</option>';
    }
    
    const selectCat = document.getElementById('categoriaProducto');
    if (selectCat) {
        selectCat.innerHTML = '<option value="">Seleccione una categoría</option>';
    }
    
    // Restaurar stock inicial por defecto
    const stockInput = document.getElementById('stockInicial');
    if (stockInput) {
        stockInput.value = '7';
    }
}
