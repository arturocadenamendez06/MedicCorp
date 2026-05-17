// Obtén el botón
let subir = document.getElementById("botonSubir");

// Agrega el evento de scroll usando addEventListener
window.addEventListener("scroll", scrollFunction);

function scrollFunction() {
    // Usa document.documentElement.scrollTop para comprobar la posición del scroll
    if (document.documentElement.scrollTop > 20 || document.body.scrollTop > 20) {
        subir.style.display = "block";
    } else {
        subir.style.display = "none";
    }
}

// Cuando el usuario hace clic en el botón, vuelve al inicio de la página
function regresarArriba() {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazamiento suave
}

const zoomContainers = document.querySelectorAll('.zoom-container');
const zoomImages = document.querySelectorAll('.imagen-zoomable');

zoomImages.forEach((image, index) => {
    image.addEventListener('click', () => {
        zoomContainers[index].style.display = 'flex';
    });
});

const closeBtns = document.querySelectorAll('.close-btn');

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        zoomContainers.forEach(container => {
            container.style.display = 'none';
        });
    });
});