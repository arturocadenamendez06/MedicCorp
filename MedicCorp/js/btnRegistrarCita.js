document.addEventListener('click', async (e) => {

    if (e.target.classList.contains('registrar-cita')) {
        const idCita = e.target.dataset.id;
        //console.log("ID de la cita:", idCita);
        
        // ir a la página de edición
        window.location.href = `reportarConsulta.html?id=${idCita}`;
    }
});