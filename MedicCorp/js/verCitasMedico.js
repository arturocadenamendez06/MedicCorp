document.addEventListener('DOMContentLoaded', function (){
    fetch('http://localhost:5000/medico/getAllCitas',{
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    //.then(data => console.log(data))
    .then(data => loadCitas(data['data']));
});

function loadCitas(data){
    if(data.length === 0){
        //table.innerHTML="<tr><td class='no-data' colspan='6'>No Data</td></tr>";
        return;
    }
    else{
        loadCitasReservadasYCompletadas(data);
    }
}

function loadCitasReservadasYCompletadas(data){
    const contenedorReservas=document.getElementById('contenido-citas-reservadas');
    const contenedorCitasCompletadas=document.getElementById('contenido-citas-completadas');
    //console.log(data);//Imprimir resultado de la consulta MySQL
    
    let citasReservadasHTML="";
    let citasCompletadasHTML="";

    data.forEach(function ({id_cita, id_paciente, id_medico, dia, hora, estado_cita}){
        if(estado_cita === 'reservada'){
            citasReservadasHTML += `<div class="cita-reservada-componente">`;
            citasReservadasHTML += `<span class="estado-cita">Reservada</span>`;
            citasReservadasHTML += `<p class="fecha-cita">${dia} ${hora}</p>`;
            citasReservadasHTML += `<button class="btn-editar-cita"><img class="editar-cita" src="../imagenes/pencil_4076.png" data-id="${id_cita}" width="30px" height="30px" align="center" alt="editar"></button>`;
            citasReservadasHTML += `<button class="btn-eliminar-cita"><img class="eliminar-cita" src="../imagenes/basurero.png" data-id="${id_cita}" width="30px" height="30px" align="center" alt="eliminar"></button>`;
            citasReservadasHTML += `<button class="btn-registrar-cita"><img src="../imagenes/reporte.png" data-id="${id_cita}" width="30px" height="30px" align="center" alt="registrar"></button>`;
            citasReservadasHTML += "</div>";
        }
        else if(estado_cita === 'completada'){
            citasCompletadasHTML += `<div class="cita-completada-componente">`;
            citasCompletadasHTML += `<span class="estado-cita">Completada</span>`;
            citasCompletadasHTML += `<p class="fecha-cita">${dia} ${hora}</p>`;
            citasCompletadasHTML += "</div>";
        }
    });
    
    contenedorReservas.innerHTML = citasReservadasHTML;
    contenedorCitasCompletadas.innerHTML = citasCompletadasHTML;
}

document.getElementById('contenido-citas-reservadas').addEventListener('click', function(event){
    console.log(event.target); //imprimir el botón clickeado
    if(event.target.className === "editar-cita"){
        //deleteRowById(event.target.dataset.id);
        console.log("Editar cita");
    }
    if(event.target.className === "eliminar-cita"){
        //deleteRowById(event.target.dataset.id);
        console.log("Eliminar cita");
    }
});