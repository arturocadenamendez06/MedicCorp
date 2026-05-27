// verCitasMedico.js - Actualizar para que las citas se muestren correctamente

document.addEventListener('DOMContentLoaded', function (){
    cargarCitas();
});

function cargarCitas() {
    fetch('http://localhost:5000/medico/getAllCitas',{
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => loadCitas(data['data']))
    .catch(error => console.error('Error cargando citas:', error));
}

function loadCitas(data){
    if(!data || data.length === 0){
        // Mostrar mensaje de no hay citas si es necesario
        const contenedorReservas = document.getElementById('contenido-citas-reservadas');
        const contenedorCitasCompletadas = document.getElementById('contenido-citas-completadas');
        if(contenedorReservas) contenedorReservas.innerHTML = '<p class="no-data">No hay citas reservadas</p>';
        if(contenedorCitasCompletadas) contenedorCitasCompletadas.innerHTML = '<p class="no-data">No hay citas completadas</p>';
        return;
    }
    else{
        loadCitasReservadasYCompletadas(data);
    }
}

function loadCitasReservadasYCompletadas(data){
    const contenedorReservas = document.getElementById('contenido-citas-reservadas');
    const contenedorCitasCompletadas = document.getElementById('contenido-citas-completadas');
    
    let citasReservadasHTML = "";
    let citasCompletadasHTML = "";

    data.forEach(function ({id_cita, id_paciente, id_medico, dia, hora, estado_cita}){
        if(estado_cita === 'reservada'){
            citasReservadasHTML += `<div class="cita-reservada-componente" data-cita-id="${id_cita}">`;
            citasReservadasHTML += `<span class="estado-cita">Reservada</span>`;
            citasReservadasHTML += `<p class="fecha-cita">${dia} ${hora}</p>`;
            citasReservadasHTML += `<button class="btn-editar-cita"><img class="editar-cita" src="../imagenes/pencil_4076.png" data-id="${id_cita}" width="30px" height="30px" align="center" alt="editar"></button>`;
            citasReservadasHTML += `<button class="btn-eliminar-cita"><img class="eliminar-cita" src="../imagenes/basurero.png" data-id="${id_cita}" width="30px" height="30px" align="center" alt="eliminar"></button>`;
            citasReservadasHTML += `<button class="btn-registrar-cita"><img class="registrar-cita" src="../imagenes/reporte.png" data-id="${id_cita}" width="30px" height="30px" align="center" alt="registrar"></button>`;
            citasReservadasHTML += "</div>";
        }
        else if(estado_cita === 'completada'){
            citasCompletadasHTML += `<div class="cita-completada-componente" data-cita-id="${id_cita}">`;
            citasCompletadasHTML += `<span class="estado-cita">Completada</span>`;
            citasCompletadasHTML += `<p class="fecha-cita">${dia} ${hora}</p>`;
            citasCompletadasHTML += "</div>";
        }
    });
    
    if(contenedorReservas) contenedorReservas.innerHTML = citasReservadasHTML || '<p class="no-data">No hay citas reservadas</p>';
    if(contenedorCitasCompletadas) contenedorCitasCompletadas.innerHTML = citasCompletadasHTML || '<p class="no-data">No hay citas completadas</p>';
}

// Delegación de eventos para los botones
document.getElementById('contenido-citas-reservadas')?.addEventListener('click', function(event){
    const target = event.target;
    const imgElement = target.tagName === 'IMG' ? target : target.querySelector('img');
    
    if(imgElement && imgElement.classList.contains('editar-cita')){
        const citaId = imgElement.dataset.id;
        console.log("Editar cita:", citaId);
        window.location.href = `editarCita.html?id=${citaId}`;
    }
    
    if(imgElement && imgElement.classList.contains('eliminar-cita')){
        const citaId = imgElement.dataset.id;
        console.log("Eliminar cita:", citaId);
        if(confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
            eliminarCita(citaId);
        }
    }
    
    if(imgElement && imgElement.classList.contains('registrar-cita')){
        const citaId = imgElement.dataset.id;
        console.log("Registrar cita:", citaId);
        window.location.href = `reportarConsulta.html?id=${citaId}`;
    }
});

// Función para eliminar cita y recargar la vista
async function eliminarCita(id_cita) {
    try {
        const response = await fetch(`http://localhost:5000/citas/${id_cita}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if(result.success) {
            mostrarMensajeTemporal('Cita eliminada exitosamente', 'success');
            cargarCitas(); // Recargar las citas
        } else {
            mostrarMensajeTemporal(result.message || 'Error al eliminar la cita', 'error');
        }
    } catch(error) {
        console.error('Error:', error);
        mostrarMensajeTemporal('Error de conexión', 'error');
    }
}

function mostrarMensajeTemporal(mensaje, tipo) {
    const container = document.createElement('div');
    container.className = `mensaje-flotante ${tipo}`;
    container.textContent = mensaje;
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 5px;
        color: white;
        background-color: ${tipo === 'success' ? '#4CAF50' : '#f44336'};
        z-index: 1000;
        animation: fadeOut 3s forwards;
    `;
    
    document.body.appendChild(container);
    
    setTimeout(() => {
        container.remove();
    }, 3000);
}