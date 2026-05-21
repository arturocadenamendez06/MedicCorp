// Evento para el formulario de registro de paciente
const formularioRegistro = document.getElementById('registrationForm');

formularioRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(formularioRegistro);
    const data = Object.fromEntries(formData);

    //console.log('Form data to be sent:', data);
    
    fetch('http://localhost:5000/registrarPaciente', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ 
            nombre: data.nombre,
            edad: data.edad,
            sexo: data.sexo,
            email: data.email,
            telefono: data.telefono,
            direccion: data.direccion,
            contrasena: data.contrasena
        })
    })

    .then(response => response.json())
    .then(data => {
        if(data.success){
            console.log('User registered successfully');
        }
    });
});
