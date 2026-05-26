
//Conseguir la id de la cita antes de la carga
const params = new URLSearchParams(window.location.search);
const idCita = params.get('id');

//console.log(idCita);

async function cargarCita() {
    try {
        const respuesta = await fetch(`http://localhost:5000/citas/${idCita}`, {
            method: 'GET',
            credentials: 'include'
        })

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            console.log(errorData.error);
            return;
        }

        const data = await respuesta.json();

        const cita = data[0];
        //alert(cita.dia);
        //alert(cita.hora);

        document.getElementById('diaCita').value = cita.dia;
        document.getElementById('horaCita').value = cita.hora;

    } catch(error) {
        console.log('Error cargando la cita:', error);
    }

}

cargarCita();