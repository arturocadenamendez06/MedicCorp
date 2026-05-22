const logoutBtn = document.querySelector('#btn-logout');

logoutBtn.onclick = function(){
    fetch('http://localhost:5000/logout',{
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            console.log(data.message);
            window.location.href = "../inicio_sesion/inicioSesion.html";
        }else{
            console.log(data.message);
            alert(data.message);
        }
    });
}