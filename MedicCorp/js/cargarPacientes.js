
// Evento para consultar pacientes
async function cargarPacientes() {
    try {
        const respuesta = await fetch(
            'http://localhost:5000/medico/getAllPacientes',
            {
                method: 'POST'
            }
        );

        const resultado = await respuesta.json();
        console.log(resultado);

        const listaPacientes = document.getElementById('listaPacientes');

        listaPacientes.innerHTML = '';

        resultado.data.forEach(paciente => {
            const option = document.createElement('option');

            option.value = paciente.nombre_paciente;
            option.dataset.id = paciente.id_paciente;

            listaPacientes.appendChild(option);

        });

    } catch(error) {

        console.log(error);

    }

}


// Cargar al abrir la página
cargarPacientes();