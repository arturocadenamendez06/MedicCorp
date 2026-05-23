document.addEventListener('DOMContentLoaded', function (){
    fetch('http://localhost:5000/medico/getAllPacientes',{
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
});

function loadHTMLTable(data){
    const table=document.querySelector('table tbody');
    
    //console.log(data);//Imprimir resultado de la consulta MySQL

    if(data.length === 0){
        table.innerHTML="<tr><td class='no-data' colspan='6'>No Data</td></tr>";
        return;
    }
    
    let tableHtml="";

    data.forEach(function ({id_paciente, nombre_paciente, correo, telefono}){
        tableHtml += "<tr>";
        tableHtml += `<td>${id_paciente}</td>`;
        tableHtml += `<td>${nombre_paciente}</td>`;
        tableHtml += `<td>${correo}</td>`;
        tableHtml += `<td>${telefono}</td>`;
        tableHtml += `<td><a href="#"><button class="btn-historial data-id="${id_paciente}">Ver historial</button></a></td>`;
        tableHtml += `<td><button class="btn-eliminar-paciente" data-id="${id_paciente}"><img class="eliminar-paciente" data-id="${id_paciente}" src="../imagenes/basurero.png" width="30px" height="30px" align="center" alt="eliminar"></button></td>`;
        tableHtml += "</tr>";
    });
    table.innerHTML = tableHtml;
}

document.querySelector('table tbody').addEventListener('click', function(event){
    console.log(event.target); //imprimir el botón de historial o eliminar paciente clickeado
    if(event.target.className === "btn-historial"){
        //deleteRowById(event.target.dataset.id);
    }
    if(event.target.className === "eliminar-paciente"){
        deleteRowById(event.target.dataset.id);
    }
});

function deleteRowById(id){
    fetch('http://localhost:5000/medico/deletePaciente/' + id, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            //esta función se puede reemplazar después por una que busque de nuevo los datos de la BD 
            //y actualice la tabla sin recargar la página usando la fucnion loadHTMLTable
            location.reload();//recargar la página para actualizar la tabla después de eliminar una fila
        }
        else{
            alert("Hubo un error al tratar de borrar al paciente.");
        }
    });
}

