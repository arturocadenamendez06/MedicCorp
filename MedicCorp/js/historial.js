// historial.js
document.addEventListener('DOMContentLoaded', function() {
    // Obtener el ID del paciente de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const pacienteId = urlParams.get('id');
    const pacienteNombre = urlParams.get('nombre');

    if (!pacienteId) {
        console.error('No se proporcionó ID de paciente');
        mostrarError('No se encontró el paciente');
        return;
    }

    // Actualizar el título de la página
    if (pacienteNombre) {
        document.title = `Historial de ${pacienteNombre} - MedicCorp`;
    }

    // Cargar los datos del paciente
    cargarDatosPaciente(pacienteId);
    
    // Cargar las consultas del paciente
    cargarConsultasPaciente(pacienteId);
});

function cargarDatosPaciente(id) {
    fetch(`http://localhost:5000/paciente/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarPerfilPaciente(data.data);
        } else {
            mostrarError(data.message || 'Error al cargar los datos del paciente');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError('Error de conexión con el servidor');
    });
}

function cargarConsultasPaciente(id) {
    fetch(`http://localhost:5000/paciente/${id}/consultas`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarConsultas(data.data);
        } else {
            mostrarMensajeSinConsultas();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensajeSinConsultas();
    });
}

function mostrarConsultas(consultas) {
    const contenedor = document.querySelector('.contenedor-consultas-completadas');
    
    if (!contenedor) return;
    
    // Limpiar el contenedor (excepto posibles mensajes existentes)
    contenedor.innerHTML = '';
    
    if (consultas.length === 0) {
        mostrarMensajeSinConsultas(contenedor);
        return;
    }
    
    // Mostrar cada consulta
    consultas.forEach((consulta, index) => {
        const consultaHTML = crearTarjetaConsulta(consulta, index + 1);
        contenedor.appendChild(consultaHTML);
    });
}

function crearTarjetaConsulta(consulta, numero) {
    const divConsulta = document.createElement('div');
    divConsulta.className = 'contenedor-consulta';
    
    // Formatear fecha y hora
    const diaSemana = consulta.dia ? consulta.dia.charAt(0).toUpperCase() + consulta.dia.slice(1) : 'No especificado';
    const horaFormateada = consulta.hora ? consulta.hora.substring(0, 5) : 'No especificada';
    
    divConsulta.innerHTML = `
        <div class="encabezado-consulta">
            <div><h2>Consulta #${numero}</h2></div>
            <div class="fecha-cita"><p>${diaSemana} - ${horaFormateada}</p></div>    
        </div>
        <table class="tabla-consulta">
            <tr>
                <th style="width: 20%;">Temperatura corporal:</th>
                <td style="width: 30%;">${consulta.temperatura || 'No registrada'}</td>
                <th style="width: 20%;">Diagnóstico:</th>
                <td style="width: 30%;">${consulta.diagnostico || 'No registrado'}</td>
            </tr>
            <tr>
                <th>Peso:</th>
                <td>${consulta.peso ? `${consulta.peso} kg` : 'No registrado'}</td>
                <th>Resultado de análisis:</th>
                <td>${consulta.resultados_analisis || 'No registrado'}</td>
            </tr>
            <tr>
                <th>Altura:</th>
                <td>${consulta.altura ? `${consulta.altura} cm` : 'No registrada'}</td>
                <th>Prescripciones:</th>
                <td>${consulta.prescripcion || 'No registrada'}</td>
            </tr>
            <tr>
                <th>Presión arterial:</th>
                <td colspan="3">${consulta.presion_arterial || 'No registrada'}</td>
            </tr>
        </table>
    `;
    
    return divConsulta;
}

function mostrarMensajeSinConsultas(contenedor = null) {
    if (!contenedor) {
        contenedor = document.querySelector('.contenedor-consultas-completadas');
    }
    
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'sin-consultas';
    mensajeDiv.style.cssText = `
        background-color: #e9ecef;
        color: #6c757d;
        padding: 40px 20px;
        text-align: center;
        border-radius: 10px;
        margin: 20px 0;
        font-size: 1.2em;
    `;
    mensajeDiv.innerHTML = `
        <p>📋 No hay consultas registradas para este paciente</p>
        <small>Las consultas aparecerán aquí una vez que se completen las citas</small>
    `;
    
    contenedor.appendChild(mensajeDiv);
}

function mostrarPerfilPaciente(paciente) {
    // Actualizar el encabezado del perfil
    const encabezadoPerfil = document.querySelector('.encabezado-perfil h2');
    if (encabezadoPerfil) {
        encabezadoPerfil.textContent = `Perfil de ${paciente.nombre_paciente}`;
    }

    // Usar clases específicas para mayor precisión
    const nombreElement = document.querySelector('.perfil-nombre');
    if (nombreElement) nombreElement.textContent = paciente.nombre_paciente;
    
    const edadElement = document.querySelector('.perfil-edad');
    if (edadElement) edadElement.textContent = paciente.edad ? `${paciente.edad} años` : 'No especificado';
    
    // Formatear sexo
    let sexoTexto = '';
    switch(paciente.sexo) {
        case 'M': sexoTexto = 'Masculino'; break;
        case 'F': sexoTexto = 'Femenino'; break;
        case 'otro': sexoTexto = 'Otro'; break;
        default: sexoTexto = 'No especificado';
    }
    const sexoElement = document.querySelector('.perfil-sexo');
    if (sexoElement) sexoElement.textContent = sexoTexto;
    
    const emailElement = document.querySelector('.perfil-email');
    if (emailElement) emailElement.textContent = paciente.correo || 'No especificado';
    
    const telefonoElement = document.querySelector('.perfil-telefono');
    if (telefonoElement) telefonoElement.textContent = paciente.telefono || 'No especificado';
    
    const direccionElement = document.querySelector('.perfil-direccion');
    if (direccionElement) direccionElement.textContent = paciente.direccion || 'No especificado';
}

function mostrarError(mensaje) {
    // Mostrar error en el perfil
    const contenedorPerfil = document.getElementById('contenedor-perfil-paciente');
    if (contenedorPerfil) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-mensaje';
        errorDiv.style.cssText = 'background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px; text-align: center;';
        errorDiv.textContent = mensaje;
        
        // Si ya hay un mensaje de error, no duplicar
        if (!contenedorPerfil.querySelector('.error-mensaje')) {
            contenedorPerfil.appendChild(errorDiv);
        }
    }
    console.error(mensaje);
}