/*--------------------FUNCIONES--------------------*/

/**
 * Función que hace una llamada a la api de cervezas que luego sera nuestro json en nuestro contenedor
 * @param {string} tipo tipo de cerveza
 * @returns {Promise} Devuelve una PROMESA en forma de array
 */
function getFetch(tipo, pagina){

    return fetch("https://api.sampleapis.com/beers/" + tipo)
    .then((result) => result.json())
    .catch((error) => {
        console.error("Error al realizar la solicitud: ", error);
        throw error;
    });

};

/**
 * Crea todos los nodos donde irá toda la información de cada carta de cerveza
 * @param {Object} objeto recibe por parametro cada objeto
 * @returns {Node} Devuelve un nodo de dom
 */
function creaCarta(objeto){

    let nodoDom = document.createElement("article");
    nodoDom.className = "contenedora__articulo"

    //creamos la imagen y la metemos en el articulo
    let img = document.createElement("img");
    img.src = objeto.image;
    nodoDom.appendChild(img);

    //Esto es porque hay imagenes que no funcionan, entonces en caso de error mostrare otra imagen
    img.onerror = () => {
        img.src = "./assets/imgs/error.png";
    };

    //creamos el div que contendra la información y lo metemos en el articulo
    let div = document.createElement("div");
    nodoDom.appendChild(div);

    //cremos todos los p con la información u lo metemos en el div
    let pNom = document.createElement("p");
    pNom.textContent = objeto.name;
    div.appendChild(pNom);

    let pPrec = document.createElement("p");
    pPrec.textContent = "$ " + objeto.price;
    div.appendChild(pPrec);

    let pAve = document.createElement("p");
    pAve.textContent = "Media: " + objeto.average;
    div.appendChild(pAve);

    let pRev = document.createElement("p");
    pRev.textContent = " Reviews: " + objeto.reviews;
    div.appendChild(pRev);

    return nodoDom;

};

/**
 * Función para limpiar la seccion cuando se hace el cambio de un tipo de cerveza a otra
 */
function limpiarSection(dom){

    dom.innerHTML = "";

};

/**
 * Función que llama a la funcion de creacarta por cada paso al recorrer el array de las cervezas, creando asi cada una de las castas para 
 * todas las cervezas
 * @param {Array} arr array de las cervezas 
 */
function creaCartas(arr){

    //limpiamos la seccion
    limpiarSection(document.querySelector("#contenedora"));

    //recorremos el array y llamamos a la funcion de crearCarta individual
    arr.forEach(elemento => {

        let nodoDom = creaCarta(elemento);
        fragmento.appendChild(nodoDom);

        //creamos el listener de cada articulo para añadir las cosas al carrito
        nodoDom.addEventListener("click", () => {

            //limpiar seccion de carrito
            limpiarSection(document.querySelector(".cervezas__carrito"));

            document.querySelector(".cervezas__mensaje").innerHTML = "Artículo añadido al carrito";
            cambiarEstilo(document.querySelector(".cervezas__mensaje"), 1);

            arrCarrito.push(elemento);

            setTimeout(() => {
                cambiarEstilo(document.querySelector(".cervezas__mensaje"), 0)
            }, 800);

        });

    });
    
    //añadir al main el fragmento con todas las cartas (articulos)
    section.appendChild(fragmento);

};

/**
 * Función que cambia el estilo del scale a un elemento DOM
 * @param {Node} elemento Elemento Dom 
 * @param {int} scale El numero de scale que quieras hacerle
 */
function cambiarEstilo(elemento ,scale){
    elemento.style.scale = scale;
    elemento.style.transition = "scale 1.5s -0.5s linear";
}

/**
 * Función que reproduce un sonido
 */
function ohYeah(){

    let sonido = new Audio("./assets/ouh_yeah.mp3");
    sonido.play();

};

/**
 * Función que dados unos parametros filtrará por los parametros introducidos los elementos del array también introducido
 * y los añadira a un array
 * @param {Array} arr array del cual filtraremos
 * @param {string} filtro parametro de cada objeto de array
 * @param {string} operando 
 * @param {Number} cant cantidad por la que filtrar
 * @returns {Array} devuelve un array con los objetos filtrados
 */
function filtro (arr, filtrar, operando, cant){
    
    let resultadoBusqueda = [];
    /**
     * hay que usar corchetes para acceder a la propiedad del objeto que sera el filtrar (precio, valoracion...)
     * porque si pongo element.filtrar, buscara una propiedad filtrar en el objeto y no la hay.
     * para poner una variable como propiedad de un objeto usamos los corchetes
     */
    arr.forEach(element => {
        switch (operando){
            case ">":
                if (element[filtrar] > cant){
                    resultadoBusqueda.push(element);
                }
            break;
                
            case "<":
                if (element[filtrar] < cant){
                    resultadoBusqueda.push(element);
                }
            break;

            case "==":
                if (element[filtrar] == cant){
                    resultadoBusqueda.push(element);
                }
            break;
        }
    });
    return resultadoBusqueda;
    
}

/**
 * Función para cambiar la estructura de los objetos del array
 * @param {Array} arr  
 * @returns {Array} devuelve el mismo array pero con la estructura modificada
 */
function modApiData(arr) {

    let arrMod = arr.map( elemento => {

        //Con el map destructuro y separo la parte de rating y del precio del resto de claves del objeto (elemento)
        const { rating, ...rest } = elemento
        
        //aqui separo average y reviews de rating
        const { average, reviews } = rating

        //aqui devuelvo la estructura del objeto que es el resto del principio (todo menos la clave de rating)
        //mas el average y las reviews
        //en definitiva he cambiado la estructura del objeto para quitar el array que habia dentro del objeto
        return { ...rest, average: +average.toFixed(3), reviews, price: +elemento.price.slice(1) }
        //a la key de average le un toFixed para redondear a 3 decimales
        //y a la key de price le quito el simbolo del dolar con el slice(1)
        //el + es un parseInt es decir lo parsea a número

    });
    return arrMod;

}

/**
 * Funcion que dado un array crea una tabla con la informacion del array
 * @param {Array} arr  
 * @returns {Node}
 */
function creaTabla (arr){

    let boton = document.createElement("button");
    boton.textContent = "Borrar carrito";
    boton.id = "borrarCarrito";
    boton.className = "borrarCarrito";
    document.querySelector(".cervezas__carrito").appendChild(boton);

    let tabla = document.createElement("table");
    let caption = document.createElement("caption");
    caption.textContent = "Carrito"
    tabla.appendChild(caption);

    //fila de información
    let filaInfo = document.createElement("tr");
    tabla.appendChild(filaInfo);
    tabla.className = "cervezas__carrito__tabla";

    //columnas de información
    let tdCant = document.createElement("th");
    tdCant.textContent = "Cantidad"
    filaInfo.appendChild(tdCant);

    let tdTit = document.createElement("th");
    tdTit.textContent = "Nombre"
    filaInfo.appendChild(tdTit);

    let tdPrec = document.createElement("th");
    tdPrec.textContent = "Precio"
    filaInfo.appendChild(tdPrec);

    arr.forEach(element => {
        let fila = document.createElement("tr");
        tabla.appendChild(fila);

        let tdCant = document.createElement("td");
        tdCant.textContent = element.cantidad;
        fila.appendChild(tdCant);

        let tdNom = document.createElement("td");
        tdNom.textContent = element.name;
        fila.appendChild(tdNom)

        let tdPric = document.createElement("td");
        tdPric.textContent = "$" + element.price;
        fila.appendChild(tdPric);
    });
    return tabla

}

/**
 * Función que recibe un array y va a crearle una propiedad nueva cada objeto con la cantidad de veces que esta el objeto en el array
 * @param {Array} carrito 
 * @returns {Array} carritoModificado devuelve el array modificado con la propiedad cantidad
 */
function contarRepetidos(carrito) {

    let carritoModificado = [];

    carrito.forEach(element => {
        //con find verificamos si esta o no el elemento en el array de carrito modificado
        const productoExistente = carritoModificado.find(cervezaMod => cervezaMod.id === element.id);

        if (productoExistente) {
            //si existe, incrementamos la propiedad cantidad que creamos abajo cuando es la primera vez que lo metemos en el array
            productoExistente.cantidad++;
        } else {
            //si no existe, desestructuramos el elemento, le añadimos la propiedad cantidad con el valor de 1 y lo añadimos al array
            carritoModificado.push({ ...element, cantidad: 1 });
        }
    });
    return carritoModificado;

}    

//Funcion para cargar las cervezas con el scroll infinito
function cargarCervezas (tipo){

    //evita que se hagan multiples llamadas a la api, es decir que no se hara la llamada a la api
    //hasta que no termine de cargar la anterior
    if (estaCargando) return;

    //si no es true, la iguale a true y hago la llamada
    estaCargando = true;
    document.querySelector(".cargando").style.display.block;

    //con la pagina actual que la primera vez sera la 1
    getFetch(tipo, paginaActual)
    .then((datos) => {
        const modData = modApiData(datos);
        creaCartas(modData);
    });

}

/*--------------------FIN FUNCIONES--------------------*/

/*--------------------MANEJO--------------------*/

//cogemos el main que esta dentro del body
let main = document.querySelector("main");

//creamos la sección que contendra todas las cartas de cervezas y la metemos en el main
let section = document.createElement("section");
section.id = "contenedora";
main.appendChild(section);

//creamos fragmento para mejor optimización de los recursos
let fragmento = document.createDocumentFragment();

//coger las a para añadirles los listeners
let aAle = document.querySelector("body main nav ul li:first-of-type a");
let aStouts = document.querySelector("body main nav ul li:last-of-type a");

//crear un array que contendra todos los elementos del carrito
let arrCarrito = [];

//variables para el manejo del scroll infinito la pagina actual que empieza en la primera y la bandera
let paginaActual = 1;
let estaCargando = false;

/*--------------------FIN MANEJO--------------------*/

/*--------------------EVENTOS--------------------*/

//evento para el boton de las ales
aAle.addEventListener("click", () => {

    document.querySelector(".cervezas__titulo").innerHTML = "Cervezas Ale";

    getFetch("ale")
    .then((datos) => {
        const modData = modApiData(datos);
        creaCartas(modData);
    });

    ohYeah();

});

//evento para el boton de las stouts
aStouts.addEventListener("click", () => {

    document.querySelector(".cervezas__titulo").innerHTML = "Cervezas Stouts";

    getFetch("stouts")
    .then((datos) => {
        const modData = modApiData(datos);
        creaCartas(modData);
    });;
    ohYeah();

});

//evento para el boton de filtrar
document.querySelector("#filtrar").addEventListener("click", () => {

    //limpia el mensaje de error si lo hubiese cada vez que le damos a filtrar y la seccion contenedora
    limpiarSection(document.querySelector(".cervezas__mensaje"));
    limpiarSection(document.querySelector("#contenedora"));

    let tipo = document.forms.cervezas__filtro__form.tipo.value;
    let filtraPor = document.forms.cervezas__filtro__form.select.value;
    let operador = document.forms.cervezas__filtro__form.operando.value;
    let numero = parseInt(document.forms.cervezas__filtro__form.cantidad.value);

    getFetch(tipo)
    .then((datos) => {
        const modData = modApiData(datos);
        let filtrados = filtro(modData, filtraPor, operador, numero);

        if (filtrados.length != 0){
            creaCartas(filtrados);
        }else{
            document.querySelector(".cervezas__mensaje").innerHTML = "No se encontraron cervezas con esos filtros";
        }

    })

});

//evento para el boton del carrito
document.querySelector("#carrito").addEventListener("click", () => {

    //limpiar secciones de mensaje y carrito
    limpiarSection(document.querySelector(".cervezas__mensaje"));
    limpiarSection(document.querySelector(".cervezas__carrito"));

    let section = document.querySelector(".cervezas__carrito");

    //modificar el array de carrito para que diga la cantidad de veces que un elemento esta en el carrito
    let carritoConCantidades = contarRepetidos(arrCarrito);
    let tabla = creaTabla(carritoConCantidades, carritoConCantidades.length)
    section.appendChild(tabla);

    //borrar el carrito
    document.querySelector("#borrarCarrito").addEventListener("click", () => {

    arrCarrito = [];
    section.textContent = "";

    });

});

/*--------------------FIN EVENTOS--------------------*/

/*---MAS COSAS--- QUE LUEGO HAY QUE ORGANIZAR---*/
