document.addEventListener('DOMContentLoaded', function (){
    fetch('http://localhost:5000/medico/getCitasOrdenadas',{
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => loadHTMLcalendario(data['data']));
});

function loadHTMLcalendario(data){
    if(data.length === 0){
        return;
    }

    const contenidoCalendario=document.getElementById("contenido-calendario");
    
    const contenedorLunes = document.getElementById("contenedor-lunes");
    const contenedorMartes = document.getElementById("contenedor-martes");
    const contenedorMiercoles = document.getElementById("contenedor-miercoles");
    const contenedorJueves = document.getElementById("contenedor-jueves");
    const contenedorViernes = document.getElementById("contenedor-viernes");

    data.forEach(function ({id_cita, id_paciente, id_medico, dia, hora, estado_cita, nombre_paciente}){
        
        if(dia === 'lunes'){
            contenedorLunes.innerHTML += crearHTMLparaDiaDelCalendario(nombre_paciente, hora);
        }
        if(dia === 'martes'){
            contenedorMartes.innerHTML += crearHTMLparaDiaDelCalendario(nombre_paciente, hora);
        }
        if(dia === 'miercoles'){
            contenedorMiercoles.innerHTML += crearHTMLparaDiaDelCalendario(nombre_paciente, hora);
        }
        if(dia === 'jueves'){
            contenedorJueves.innerHTML += crearHTMLparaDiaDelCalendario(nombre_paciente, hora);
        }
        if(dia === 'viernes'){
            contenedorViernes.innerHTML += crearHTMLparaDiaDelCalendario(nombre_paciente, hora);
        }
    });

    function crearHTMLparaDiaDelCalendario(nombrePaciente, horaCita){
        let htmlCalendario = "";

        htmlCalendario += `<div class="componente-consulta">`;
        htmlCalendario += `<div class="nombre-paciente"><p>${nombrePaciente}</p></div>`;
        htmlCalendario += `<div class="fecha-cita"><p>${horaCita}</p></div>`;
        htmlCalendario += `</div>`;

        return htmlCalendario;
    }


}


