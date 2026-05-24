
// Evento para el formulario de reserva de cita
const formularioReserva = document.getElementById('ReservaFormulario');

formularioReserva.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(formularioReserva);
    const data = Object.fromEntries(formData);

    //console.log('Form data to be sent:', data);

    //obtener el id del paciente seleccionado
    const listaPacientes = document.getElementById('listaPacientes');
    const optionSeleccionada = [...listaPacientes.options].find(option => option.value === data.paciente);

     // validar si existe
    if (!optionSeleccionada) {

        alert('Seleccione un paciente válido');

        return;

    }

    const idPaciente = optionSeleccionada.dataset.id;

    //console.log('ID paciente:', idPaciente);
    
    fetch('http://localhost:5000/reservarCita', {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({ 
            paciente: idPaciente,
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
