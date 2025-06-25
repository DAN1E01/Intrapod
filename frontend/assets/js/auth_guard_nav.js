document.addEventListener('DOMContentLoaded', function(){
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const path = window.location.pathname;

    if(path.includes('dashboard_admin') && rol !== 'administrador'){
        return showDenied();
    }
    if(path.includes('dashboard_empacador') && rol !== 'empacador'){
        return showDenied();
    }

    if(!token || !rol){
        return showDenied();
    }

    function showDenied(){
        localStorage.clear();
        window.location.href = '../samples/error-404.html';
    }

})