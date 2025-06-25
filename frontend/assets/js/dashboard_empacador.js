document.addEventListener('DOMContentLoaded', function(){
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/dashboard/empacador/data',{
        headers: {
            'Authorization': `Bearer ${token}`
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
        console.log(data);
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
});
