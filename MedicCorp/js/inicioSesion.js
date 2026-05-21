// Evento para el formulario de inicio de sesión
const formularioLogin = document.getElementById('loginForm');

formularioLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const loginData = new FormData(formularioLogin);
    const data = Object.fromEntries(loginData);

    //console.log('Form data to be sent:', data);

    fetch('http://localhost:5000/iniciarSesion', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ 
            usuario: data.usuario,
            contrasena: data.contrasena
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            console.log('User login successful');
            console.log(data.rol);
            
            if(data.rol == 'paciente'){
                window.location.href = "../paciente/agendarCita.html";
            }
            else{
                window.location.href = "../medico/agendarCita.html";
            }
        }else{
            console.log('User login unsuccessful');
        }
    });
    
});
