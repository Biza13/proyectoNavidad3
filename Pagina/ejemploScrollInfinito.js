let currentPage = 1; // Página inicial
let isLoading = false; // Flag para saber si estamos cargando productos
let itemsPerPage = 8; // Cantidad de productos por carga

// Función para obtener productos de la API
function getFetchB(tipo, page) {
    return fetch(`https://api.sampleapis.com/beers/${tipo}?page=${page}&limit=${itemsPerPage}`)
        .then(result => result.json())
        .catch(error => {
            console.error("Error al realizar la solicitud:", error);
        });
}

// Función para cargar los productos de la API
function loadProducts(tipo) {
    if (isLoading) return; // Si estamos cargando, no hacer nada más

    isLoading = true; // Indicamos que estamos cargando
    document.querySelector(".cargando").style.display = "block"; // Mostrar mensaje de carga

    getFetchB(tipo, currentPage)
        .then(datos => {
            if (datos.length > 0) {
                // Modificar los datos si es necesario
                const modData = modApiData(datos);
                creaCartas(modData); // Crear las cartas con los datos obtenidos

                currentPage++; // Aumentar el número de página
            } else {
                console.log("No hay más productos para cargar.");
            }
        })
        .finally(() => {
            isLoading = false; // Termina la carga
            document.querySelector(".cargando").style.display = "none"; // Ocultar mensaje de carga
        });
}

// Función para detectar cuando se hace scroll
function handleScroll(tipo) {
    const scrollPosition = window.innerHeight + window.scrollY; // Distancia desde el top
    const pageHeight = document.documentElement.scrollHeight; // Altura total de la página

    // Si estamos cerca del final de la página, cargar más productos
    if (scrollPosition >= pageHeight - 100) {
        loadProducts(tipo); // Cargar productos de la API
    }
}

// Llamar la función cuando se haga scroll
window.addEventListener("scroll", () => {
    if (document.querySelector(".cervezas__titulo").innerText.includes("Cervezas Ale")) {
        handleScroll("ale"); // Para las cervezas Ale
    } else if (document.querySelector(".cervezas__titulo").innerText.includes("Cervezas Stouts")) {
        handleScroll("stouts"); // Para las cervezas Stouts
    }
});

// Función para obtener productos de la API cuando se hace clic en los botones
document.querySelector("body main nav ul li:first-of-type a").addEventListener("click", () => {
    document.querySelector(".cervezas__titulo").innerHTML = "Cervezas Ale";

    currentPage = 1; // Resetear la página
    limpiarSection(document.querySelector("#contenedora")); // Limpiar el contenedor
    loadProducts("ale"); // Cargar las cervezas Ale
    ohYeah(); // Sonido al cargar
});

document.querySelector("body main nav ul li:last-of-type a").addEventListener("click", () => {
    document.querySelector(".cervezas__titulo").innerHTML = "Cervezas Stouts";

    currentPage = 1; // Resetear la página
    limpiarSection(document.querySelector("#contenedora")); // Limpiar el contenedor
    loadProducts("stouts"); // Cargar las cervezas Stouts
    ohYeah(); // Sonido al cargar
});