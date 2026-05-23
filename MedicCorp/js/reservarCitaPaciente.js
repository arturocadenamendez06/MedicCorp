
// Evento para el formulario de reserva de cita
const formularioReserva = document.getElementById('ReservaFormulario');

formularioReserva.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(formularioReserva);
    const data = Object.fromEntries(formData);

    console.log('Form data to be sent:', data);
    
    fetch('http://localhost:5000/paciente/reservarCita', {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({ 
            medico: data.medico,
            diaCita: data.diaCita,
            horaCita: data.horaCita
        })
    })

    .then(response => response.json())
    .then(data => {
        if(data.success){
            alert("Cita reservada correctamente");
        }
        else{
            alert(data.message);
        }
    });
    
});
