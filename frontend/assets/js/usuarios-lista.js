const API_URL = "http://localhost:8000"; // Cambia esto si tu backend usa otro puerto o dominio

// Script para cargar y mostrar usuarios en la tabla

document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById('search-user');
  const tbody = document.querySelector('table.tabla-usuarios tbody');

  function renderUsuariosTabla(usuarios) {
    if (!tbody) return;
    tbody.innerHTML = '';
    usuarios.forEach(usuario => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${usuario.nombre}</td>
        <td>${usuario.username}</td>
        <td>${usuario.correo}</td>
        <td>${usuario.rol}</td>
        <td>${usuario.sucursal || '-'}</td>
        <td>
          <button class="btn btn-warning btn-sm mr-1 btn-editar-usuario" data-id="${usuario.id}">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function cargarUsuarios() {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/dashboard/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        usuariosExistentes = data.usuarios || [];
        renderUsuariosTabla(usuariosExistentes);
      });
  }

  if (inputBuscar) {
    inputBuscar.value = '';
    inputBuscar.setAttribute('autocomplete', 'off');
    inputBuscar.addEventListener('input', function() {
      const texto = this.value.trim().toLowerCase();
      let filtrados = usuariosExistentes;
      if (texto) {
        filtrados = usuariosExistentes.filter(u =>
          (u.nombre && u.nombre.toLowerCase().includes(texto)) ||
          (u.username && u.username.toLowerCase().includes(texto)) ||
          (u.correo && u.correo.toLowerCase().includes(texto)) ||
          (u.rol && u.rol.toLowerCase().includes(texto)) ||
          (u.sucursal && u.sucursal.toLowerCase().includes(texto))
        );
      }
      renderUsuariosTabla(filtrados);
    });
  }

  cargarUsuarios();
});

// Variables globales para usuarios existentes
let usuariosExistentes = [];

// Cargar roles y sucursales para el formulario
function cargarRolesYSucursales() {
  const token = localStorage.getItem("token");
  // Cargar roles
  fetch(`${API_URL}/dashboard/admin/data`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      const selectRol = document.getElementById("rol");
      selectRol.innerHTML = "";
      ["administrador", "empacador", "despachador", "proveedor"].forEach((rol) => {
        const opt = document.createElement("option");
        opt.value = rol;
        opt.textContent = rol.charAt(0).toUpperCase() + rol.slice(1);
        selectRol.appendChild(opt);
      });
      // Sucursales
      const selectSucursal = document.getElementById("sucursal");
      selectSucursal.innerHTML = "<option value=''>Sin sucursal</option>";
      (data.sucursales || []).forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.nombre;
        selectSucursal.appendChild(opt);
      });
    });
}

//Modal añadir usuario
const btnAbrirModal = document.getElementById("btn-abrir-modal-usuario");
if (btnAbrirModal) {
  btnAbrirModal.addEventListener("click", function () {
    document.getElementById("form-usuario").reset();
    document.getElementById("usuario-error").style.display = "none";
    cargarRolesYSucursales();
    $("#modal-usuario").modal("show");
  });
}

// Validar si username o correo ya existen
function usuarioYaExiste(username, correo) {
  return usuariosExistentes.some(
    (u) => u.username.toLowerCase() === username.toLowerCase() || u.correo.toLowerCase() === correo.toLowerCase()
  );
}

// Validar username sin espacios
function usernameValido(username) {
  return /^[^\s]+$/.test(username);
}

// Manejar submit del formulario
const formUsuario = document.getElementById("form-usuario");
if (formUsuario) {
  formUsuario.addEventListener("submit", function (e) {
    e.preventDefault();
    const editId = this.getAttribute('data-edit-id');
    const nombre = formUsuario.nombre.value.trim();
    const username = formUsuario.username.value.trim();
    const correo = formUsuario.correo.value.trim();
    const contraseña = formUsuario.contraseña.value;
    const rol = formUsuario.rol.value;
    const sucursal = formUsuario.sucursal.value;
    const errorDiv = document.getElementById("usuario-error");
    errorDiv.style.display = "none";
    // Validaciones
    if (!nombre || !username || !correo || !rol || !sucursal) {
      errorDiv.textContent = "Todos los campos obligatorios deben estar completos, incluyendo la sucursal.";
      errorDiv.style.display = "block";
      return;
    }
    if (!usernameValido(username)) {
      errorDiv.textContent = "El username no puede contener espacios.";
      errorDiv.style.display = "block";
      return;
    }
    if (!editId && usuarioYaExiste(username, correo)) {
      errorDiv.textContent = "El username o correo ya está registrado.";
      errorDiv.style.display = "block";
      return;
    }
    if (editId) {
      const token = localStorage.getItem("token");
      fetch(`${API_URL}/usuarios/editar/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          username,
          correo,
          contraseña: contraseña || undefined, // Solo si se cambia
          rol,
          id_sucursal: parseInt(sucursal),
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("No se pudo actualizar el usuario");
          return res.json();
        })
        .then(() => {
          $("#modal-usuario").modal("hide");
          Swal.fire('¡Actualizado!', 'Usuario editado correctamente.', 'success');
          cargarUsuarios();
          formUsuario.removeAttribute('data-edit-id');
          document.getElementById('modalUsuarioLabel').textContent = 'Añadir Usuario';
        })
        .catch(() => {
          Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
        });
    } else {
      // Enviar al backend
      const token = localStorage.getItem("token");
      fetch(`${API_URL}/dashboard/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          username,
          correo,
          contraseña,
          rol,
          id_sucursal: parseInt(sucursal),
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("No se pudo crear el usuario");
          return res.json();
        })
        .then(() => {
          $("#modal-usuario").modal("hide");
          cargarUsuarios();
        })
        .catch(() => {
          errorDiv.textContent = "No se pudo crear el usuario.";
          errorDiv.style.display = "block";
        });
    }
  });
}

// Delegación de eventos para editar usuario
const tbodyUsuarios = document.querySelector('table.tabla-usuarios tbody');
if (tbodyUsuarios) {
  tbodyUsuarios.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-editar-usuario');
    if (btn) {
      abrirModalEditarUsuario(btn.dataset.id);
    }
  });
}

function renderUsuariosTabla(usuarios) {
  const tbody = document.querySelector('table.tabla-usuarios tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  usuarios.forEach(usuario => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario.nombre}</td>
      <td>${usuario.username}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.rol}</td>
      <td>${usuario.sucursal || '-'}</td>
      <td>
        <button class="btn btn-warning btn-sm mr-1 btn-editar-usuario" data-id="${usuario.id}">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  // Ya no se asignan eventos aquí
}

function cargarUsuarios() {
  const token = localStorage.getItem("token");
  fetch(`${API_URL}/dashboard/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      usuariosExistentes = data.usuarios || [];
      renderUsuariosTabla(usuariosExistentes);
    });
}

function eliminarUsuario(id) {
  confirmarEliminarUsuario(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/usuarios/eliminar/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo eliminar el usuario");
        cargarUsuarios();
        Swal.fire('Eliminado', 'Usuario eliminado exitosamente', 'success');
      })
      .catch(() => Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error'));
  });
}
function confirmarEliminarUsuario(callback){
  Swal.fire({
    title: '¿Estás seguro de eliminar el usuario?',
    text: '¿Esta accion no se podra revertir!?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Si , eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed){
      callback();
    }
  });
}

// --- EDICIÓN DE USUARIO ---
function abrirModalEditarUsuario(id) {
  const usuario = usuariosExistentes.find(u => u.id == id);
  if (!usuario) return;
  cargarRolesYSucursales();
  setTimeout(() => {  
    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('username').value = usuario.username;
    document.getElementById('correo').value = usuario.correo;
    document.getElementById('contraseña').value = '';
    document.getElementById('rol').value = usuario.rol;
    document.getElementById('sucursal').value = usuario.sucursal || '';
    document.getElementById('form-usuario').setAttribute('data-edit-id', id);
    document.getElementById('modalUsuarioLabel').textContent = 'Editar Usuario';
    $("#modal-usuario").modal("show");
  }, 200);
}

// Limpiar modal al cerrar
$('#modal-usuario').on('hidden.bs.modal', function () {
  formUsuario.reset();
  formUsuario.removeAttribute('data-edit-id');
  document.getElementById('modalUsuarioLabel').textContent = 'Añadir Usuario';
  document.getElementById('usuario-error').style.display = 'none';
});
