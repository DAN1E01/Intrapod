function eliminarUsuario() {
    if (!usuarioSeleccionado) return;

    // Llama al backend para eliminar el usuario
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/usuarios/eliminar/${usuarioSeleccionado.id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('No se pudo eliminar el usuario');
        // Eliminar de la lista en memoria
        const index = usuarios.findIndex(u => u.id === usuarioSeleccionado.id);
        if (index !== -1) {
            usuarios.splice(index, 1);
        }
        // Ocultar modal
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modal-confirmar'));
        modalInstance.hide();
        // Recargar tabla
        cargarUsuarios();
        // Mostrar mensaje
        mostrarAlerta('Usuario eliminado exitosamente', 'success');
        usuarioSeleccionado = null;
    })
    .catch(err => {
        mostrarAlerta('No se pudo eliminar el usuario.', 'danger');
    });
}