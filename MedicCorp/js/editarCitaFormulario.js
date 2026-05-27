// Evento para editar la fecha y hora de la cita

const formularioEditar = document.getElementById('EditarFormulario');

formularioEditar.addEventListener('submit', async (e) => {
    e.preventDefault();

    //console.log("Id de la cita en la URL", idCita);

    const formData = new FormData(formularioEditar);
    const data = Object.fromEntries(formData);

    //console.log('Form data to be sent:', data, " Id de la cita en la URL:", idCita);
    
    fetch(`http://localhost:5000/citas/${idCita}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        method: 'PATCH',
        body: JSON.stringify({
            diaCita: data.diaCita,
            horaCita: data.horaCita
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            alert("Cita editada exitosamente");
            window.location.href = `verCitas.html`
        }
        else{
            alert(data.message);
        }
    });
    
});