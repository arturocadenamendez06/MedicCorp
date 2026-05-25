document.addEventListener('click', async (e) => {

    if (e.target.classList.contains('eliminar-cita')) {
        const idCita = e.target.dataset.id;
        //console.log("ID de la cita:", idCita);

        fetch(`http://localhost:5000/citas/${idCita}`, {
            method: 'DELETE',
            credentials: 'include'
        })
            
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Cita eliminada');
                location.reload();
            }
            else {
                alert('No se pudo eliminar');
            }
        })

        .catch(error => {
            console.log(error);
            alert("Error del servidor");
        });
    }
});