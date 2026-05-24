
// Evento para consultar médicos
async function cargarMedicos() {
    try {
        const respuesta = await fetch('http://localhost:5000/obtenerMedicos');
        const medicos = await respuesta.json();

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            console.log(errorData.error);
            return;
        }


        //console.log("se consulto...");

        const select = document.getElementById('selectMedico');

        // Guardar opción seleccionada
        const medicoSeleccionado = select.value;

        // Limpiar opciones
        select.innerHTML = '';

        medicos.forEach(medico => {
            const option = document.createElement('option');

            option.value = medico.id_medico;
            option.textContent = medico.nombre_medico;

            // si el id del medico es el mismo que el seleccionado, se deja la opción seleccionada
            if(medico.id_medico == medicoSeleccionado){
                option.selected = true;
            }

            select.appendChild(option);
        })

    } catch (error) {
        console.error('Error cargando médicos:', error);
    }
}

// Cargar al abrir la página
cargarMedicos();

// Actualizar cada 5 segundos
setInterval(cargarMedicos, 5000);
