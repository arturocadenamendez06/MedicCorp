// Obtener el ID de la cita de los parámetros de la URL
function obtenerIdCitaDeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Mostrar mensaje en el contenedor
function mostrarMensaje(mensaje, tipo) {
    const container = document.getElementById('mensajeContainer');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito';
    div.textContent = mensaje;
    
    // Limpiar mensajes anteriores
    container.innerHTML = '';
    container.appendChild(div);
    
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
        if (container.firstChild === div) {
            container.innerHTML = '';
        }
    }, 3000);
}

// Cargar información de la cita (opcional)
async function cargarInfoCita(idCita) {
    try {
        const response = await fetch(`http://localhost:5000/citas/${idCita}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const cita = data[0];
            const infoDiv = document.getElementById('infoCita');
            if (infoDiv) {
                infoDiv.innerHTML = `<p>Cita - ${cita.dia} ${cita.hora} | Estado: ${cita.estado_cita}</p>`;
            }
        }
    } catch (error) {
        console.error('Error cargando información de la cita:', error);
        const infoDiv = document.getElementById('infoCita');
        if (infoDiv) {
            infoDiv.innerHTML = '<p>No se pudo cargar la información de la cita</p>';
        }
    }
}

// Guardar el reporte de consulta
// reportarConsulta.js - Actualizar la función guardarReporteConsulta

// Guardar el reporte de consulta
async function guardarReporteConsulta(event) {
    event.preventDefault();
    
    // Obtener los valores del formulario
    const id_cita = document.getElementById('id_cita').value;
    const temperatura = document.getElementById('temperatura').value;
    const peso = document.getElementById('peso').value;
    const altura = document.getElementById('altura').value;
    const presion_arterial = document.getElementById('presion_art').value;
    const diagnostico = document.getElementById('diagnostico').value;
    const prescripcion = document.getElementById('prescripcion').value;
    const resultado_analisis = document.getElementById('resultado_analisis').value;
    
    // Validar que haya un ID de cita
    if (!id_cita) {
        mostrarMensaje('Error: No se encontró el ID de la cita', 'error');
        return;
    }
    
    // Mostrar indicador de carga
    const submitBtn = document.querySelector('#formReporteConsulta button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Guardando...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('http://localhost:5000/guardarReporteConsulta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                id_cita: parseInt(id_cita),
                temperatura: temperatura || null,
                peso: peso ? parseFloat(peso) : null,
                altura: altura ? parseFloat(altura) : null,
                presion_arterial: presion_arterial || null,
                diagnostico: diagnostico || null,
                prescripcion: prescripcion || null,
                resultado_analisis: resultado_analisis || null
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarMensaje(result.message || 'Reporte guardado exitosamente', 'success');
            
            // Limpiar el formulario
            document.getElementById('formReporteConsulta').reset();
            
            // Redirigir después de 1.5 segundos
            setTimeout(() => {
                window.location.href = 'verCitas.html';
            }, 1500);
        } else {
            mostrarMensaje(result.message || 'Error al guardar el reporte', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión con el servidor', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const idCita = obtenerIdCitaDeURL();
    
    if (idCita) {
        document.getElementById('id_cita').value = idCita;
        cargarInfoCita(idCita);
    } else {
        mostrarMensaje('Error: No se especificó ninguna cita', 'error');
        const infoDiv = document.getElementById('infoCita');
        if (infoDiv) {
            infoDiv.innerHTML = '<p style="color: red;">Error: No se especificó ninguna cita</p>';
        }
    }
    
    const form = document.getElementById('formReporteConsulta');
    if (form) {
        form.addEventListener('submit', guardarReporteConsulta);
    }
});