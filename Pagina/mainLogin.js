/*--------------------FUNCIONES--------------------*/

/**
 * Función para coger los usuarios de un json
 * @returns devuelve una promesa de los usuarios
 */
function getFetchUsuarios(){

    return fetch('http://localhost:3000/Usuarios')
    .then((result) => result.json())
    .catch((error) => {
        console.error("Error al realizar la solicitud: ", error);
        throw error;
    });

};

/**
 * Función que crea un número random de 6 digitos
 * @returns {string} Devuelve un número de 6 digitos en cadena
 */
function numeroRandom(){

    let numero = "";
    for(let i = 0; i<6; i++){
        let num = Math.floor(Math.random() * 10);
        numero += num;
    }
    return numero;

}

/**
 * Función que recibe usuario y contraseña y devuelve una PROMESA en forma de true o false segun este o no el usuario y la contraseña en 
 * el json de usuarios
 * @param {string} usu 
 * @param {string} cont 
 * @returns {Promise} Devuelve una promesa booleana
 */
function valida(usu, cont){

    /*el getfetchB devuelve una promesa por eso hay que tratarla como tal con .then 
    y al hacer el return de esta, la funcion validaB tambien devuelve una promesa por lo que habra que tratarla como tal cuando se llame*/
    return getFetchUsuarios()
    .then((datos) => {
        let ok = false;
        console.log(datos);
        for(let i = 0; i < datos.length; i++){
            const elemento = datos[i];
            if (usu == elemento.login && cont == elemento.password){
                ok = true;
                break; //si lo encuentra que no siga buscando
            }
        }
        return ok;
    })
    
}

/**
 * Función que llama a la función de numeroRnadom para recibir un numero random y crea dos elementos p donde pondremos el código
 * proporcionado por la función del random y lo mostraremos en pantalla
 */
function creaSeguridad(){

    let rand = numeroRandom();

    let article = document.querySelector(".contenedora__codigo");

    let divSeg = document.querySelector(".contenedora__divSeguridad");
    divSeg.style.display = "block"

    let p = document.createElement("p");
    p.textContent = "Código: ";
    p.className  = "contenedora__codigo__info";
    article.appendChild(p);

    let pCod = document.createElement("p");
    pCod.textContent = rand;
    pCod.className  = "contenedora__codigo__cod";
    article.appendChild(pCod);

}

/**
 * Función para registrar un usuario en el json de usuarios mediante el método post
 * @param {Object} obj usuario a registrar
 */
function registrarUsuario(obj){

    fetch('http://localhost:3000/Usuarios', {
        method: "POST",
        body: JSON.stringify(obj),
        headers: { "Content-type": "application/json; charset=UTF-8" },
    }) 
    .then(res => res.json())
    .then(datosJson => console.log(datosJson))
    .catch(error => console.error(error));

}

/**
 * Función que verifica que no exista ningún usuario con el nombre introducido en el json de usuarios
 * @param {string} usu nombre de usuario introducido
 * @returns {Promise} Devuelve una PROMESA booleana true si si existe y false si no existe
 */
function existe(usu){

    /*el getfetchB devuelve una promesa por eso hay que tratarla como tal con .then 
    y al hacer el return de esta, la funcion validaB tambien devuelve una promesa por lo que habra que tratarla como tal cuando se llame*/
    return getFetchUsuarios()
    .then((usuarios) => {
        let ok = false;
        console.log(usuarios);
        for(let i = 0; i < datos.length; i++){
            const usuario = usuarios[i];
            if (usu == usuario.login){
                ok = true;
                break; //si lo encuentra que no siga buscando
            }
        }
        return ok;
    })
    
}

/*--------------------FIN FUNCIONES--------------------*/

/*--------------------EVENTOS--------------------*/
//Evento click para el boton de entrar
document.querySelector("#entrar").addEventListener("click", () => {

    let nombre = document.forms.formulario.nombre.value;
    let contrasena = document.forms.formulario.cont.value;

    valida(nombre, contrasena)
    .then((valido) => {
        if (valido){
            creaSeguridad();
        }else{
            alert("Usuario o contraseña incorrecto")
        }
    });

});

//evenco click para botón de registrarse
document.querySelector("#registrarse").addEventListener("click", () => {

    let nombre = document.forms.formulario.nombre.value;
    let contrasena = document.forms.formulario.cont.value;

    existe(nombre)
    .then((valido) => {
        if (valido){
            alert("El usuario ya existe");
        }else{
            let nuevoUsuario = {
                login: nombre,
                password: contrasena
            }
            registrarUsuario(nuevoUsuario);
            alert("Usuario registrado con exito");
        }
    });

});

//evento click para boton de redirigir a la pagina de cervezas
document.querySelector("#redirigir").addEventListener("click", () => {

    let codSegIntr = document.forms.contenedora__divSeguridad__form.seguridad.value;
    let codSeg = document.querySelector(".contenedora__codigo__cod").innerText;

    if (codSegIntr == codSeg){
        location.href = "./Pagina/cervezas.html"
    }else{
        alert("Los códigos no coinciden")
    }

});

/*--------------------FIN EVENTOS--------------------*/