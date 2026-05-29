// verPacientes.js
document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:5000/medico/getAllPacientes', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
});

function loadHTMLTable(data) {
    const table = document.querySelector('table tbody');
    
    //console.log(data);//Imprimir resultado de la consulta MySQL

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='6'>No Data</td></tr>";
        return;
    }
    
    let tableHtml = "";

    data.forEach(function ({id_paciente, nombre_paciente, correo, telefono}) {
        tableHtml += "<tr>";
        tableHtml += `<td>${id_paciente}</td>`;
        tableHtml += `<td>${nombre_paciente}</td>`;
        tableHtml += `<td>${correo}</td>`;
        tableHtml += `<td>${telefono}</td>`;
        tableHtml += `<td><button class="btn-historial" data-id="${id_paciente}" data-nombre="${nombre_paciente}">Ver historial</button></td>`;
        tableHtml += `<td><button class="btn-eliminar-paciente" data-id="${id_paciente}"><img class="eliminar-paciente" data-id="${id_paciente}" src="../imagenes/basurero.png" width="30px" height="30px" align="center" alt="eliminar"></button></td>`;
        tableHtml += "</tr>";
    });
    table.innerHTML = tableHtml;
}

document.querySelector('table tbody').addEventListener('click', function(event) {
    console.log(event.target); //imprimir el botón de historial o eliminar paciente clickeado
    
    // Verificar si se hizo clic en el botón de historial o en elementos dentro de él
    const historialBtn = event.target.closest('.btn-historial');
    if (historialBtn) {
        // Redirigir a historial.html con el ID del paciente en la URL (opcional, para uso futuro)
        const pacienteId = historialBtn.getAttribute('data-id');
        const pacienteNombre = historialBtn.getAttribute('data-nombre');
        window.location.href = `historial.html?id=${pacienteId}&nombre=${encodeURIComponent(pacienteNombre)}`;
        return;
    }
    
    // Verificar si se hizo clic en el botón de eliminar
    const eliminarBtn = event.target.closest('.eliminar-paciente');
    if (eliminarBtn) {
        deleteRowById(eliminarBtn.getAttribute('data-id'));
        return;
    }
});

function deleteRowById(id) {
    fetch('http://localhost:5000/medico/deletePaciente/' + id, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            //esta función se puede reemplazar después por una que busque de nuevo los datos de la BD 
            //y actualice la tabla sin recargar la página usando la fucnion loadHTMLTable
            location.reload();//recargar la página para actualizar la tabla después de eliminar una fila
        }
        else {
            alert("Hubo un error al tratar de borrar al paciente.");
        }
    });
}