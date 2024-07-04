/*Mantener variables para referenciar elementos sin cargarlos todo el tiempo del document*/
var searchText;   // Varoiable para almacenar el texto ingresado de busqueda
var encabezado;   // Div header que contiene el menu, logo y la seccion de busqueda.
var entrada;      // Imput de busqueda
var resultados;   // Div donde se inyectan los hijos con informacion da recetas encontradas, se muestra como resultado de busqueda previa.
var botonBorrar;  // Boton para vacear el imput de busqueda
var botonBuscar;  // Boton para para realizar la busqueda de la(s) receta(s) y desplegar la información en una nueva pagina
var botonMostrar; // Boton para Desplegar imput de busqueda (valido cuando la pantalla es de 500pixeles o menos)
var botonOcultar; // Boton para Replegar el imput de busqueda
var botonMoverD;  // Boton para mover contenido (recetas favoritas) a la derecha
var botonMoverI;  // Boton para mover contenido (recetas favoritas) a la izquierda
var favoritos;    // div conetenedor de recetas favoritas
var listaFavoritas; //Para guardar lista de recetas favoritas (aunque se recupera siempre de memoria)
var random;         // Div contenedor de las recetas random
var intervaloId1;   // intervalo de 10 segundos para mover las recetas favoritas
var scrollposicion = 0;  //Variable para mecanica de movimiento del div de recetas favoritas



document.addEventListener('DOMContentLoaded', function() {

    searchText = ''; 
    encabezado = document.getElementById("Encabezado");
    entrada = document.getElementById("EntradaDeBusqueda");
    resultados = document.getElementById("Resultados"); 
    botonBuscar = document.getElementById("BuscarId");
    botonBorrar = document.getElementById("BorrarId");
    botonMostrar = document.getElementById("AbrirId");
    botonOcultar = document.getElementById("CerrarId");
    botonMoverD = document.getElementById("BotonMoverD");
    botonMoverI = document.getElementById("BotonMoverI");
    navFavoritos = document.getElementById("NavFavoritos");
    favoritos = document.getElementById("Favoritos");
    random = document.getElementById("Random");
    
    localStorage.removeItem('listaFavoritasJSON');
    
    /*Para hacer una accion cada ves que se ingresa una letra en el input de busqueda*/
    entrada.addEventListener('input', function(event) {
    laRecetaABuscar = event.target.value;

    /*Cuando hay texto se muestra el boton de borrar campo*/
    if(laRecetaABuscar.length > 0){
        BuscarParaVistaPrevia(laRecetaABuscar);
        MostrarBotonBorrar();
    }
    else{
        OcultarBotonBorrar(); 
        vacearRender();
    }
  });

  /*Muestra el div de busqueda cuando el input gana el foco*/
  entrada.addEventListener('focus', function() {
    MostrarResultados();
  });  

  // Esconder el div de resultados, de busqueda previa cuando el input pierde el foco.
  document.addEventListener('click', function() {
    const elementoActivo = document.activeElement;
    //Si el elemento activo no es un botón del los resultados de busqueda previa, oculta resultados de busqueda previa
    if (!elementoActivo.id.includes("BotonP") && !elementoActivo.id.includes("EntradaDeBusqueda")) {
        OcultarResultados();
    }
  });

  botonMoverD.addEventListener('click', function() {
    favoritos.scrollLeft += 400;
  });

  botonMoverI.addEventListener('click', function() {
    favoritos.scrollLeft -= 400;
  });

  /*realizar busqueda*/
  botonBuscar.addEventListener('click', BusqueParaNuevaPagina);

  /*limpiar campo de busqueda*/
  botonBorrar.addEventListener('click', BorrarCampo);   
  
  /*abrir entrada de busqueda*/
  botonMostrar.addEventListener('click', MostrarImputBusqueda);   
  
  /*cerrar entrada de busqueda*/
  botonOcultar.addEventListener('click', OcultarImputBusqueda);
    
  // Llama a la función cuando cambia el tamaño de la ventana
  window.addEventListener('resize', editarHeader);

  verficarListaEnMemoria()
  renderizarFavoritas();

  cargarRecetasRandom();

  intervaloId1 = setInterval(scrollSuaveDiv, 12000); //cada 10 segundos
});

function BorrarCampo(){
    entrada.value = "";
    OcultarBotonBorrar();
    vacearRender();
    entrada.focus();
}
function MostrarImputBusqueda(){
    encabezado.classList.add("DesplegadoActivo");
    encabezado.classList.remove("DesplegadoNecesario");
    entrada.focus();
    MostrarBotonBorrar();
}
function OcultarImputBusqueda(){
    encabezado.classList.add("DesplegadoNecesario");
    encabezado.classList.remove("DesplegadoActivo");
    OcultarBotonBorrar();
} 
/*Para pantallas pequeñas. Permite replegar imput de busqueda en pantallas pequeñas*/
function editarHeader(){
    if (document.documentElement.clientWidth <=  500) {
        encabezado.classList.add("DesplegadoNecesario");
        OcultarBotonBorrar();
        OcultarResultados();
    }
    else{
        encabezado.classList.remove("DesplegadoNecesario", "DesplegadoActivo");
        MostrarBotonBorrar();
    }
}
function MostrarBotonBorrar(){
    if(entrada.value.length > 0){
        botonBorrar.classList.add("Display_Block"); 
    }
}
function OcultarBotonBorrar(){
    botonBorrar.classList.remove("Display_Block"); 
}
function MostrarResultados(){
    resultados.classList.add("Display_Block");
}
function OcultarResultados(){
    resultados.classList.remove("Display_Block");
}


/*----------------------------------------------------------------------------------------*/
/*--------------------vv------Para Busqueda Previa------------vv--------------------------*/

/*Lama una lista de recetas que coinciden con la busqueda */
function BuscarParaVistaPrevia(laReceta) {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${laReceta}`;     // Construir la URL con la variable
    fetch(url)    // Hacer la solicitud fetch
    .then(response => {
        if (!response.ok) {throw new Error('Network response was not ok');}
        return response.json();
    })
    .then(data => {
        // Manejar los datos de respuesta
        console.log("Buscar: ", laReceta); 
        console.log("la url es: ", url);
        RenderizarEnPrevista(data.meals);
    })
    .catch(error => {
        // Manejar los errores
        console.error('There has been a problem with your fetch operation:', error);
    });
}

/*Renderiza las recetas en el contendeor de resultados de busqueda previa*/
function RenderizarEnPrevista(resultado){
    vacearRender();
    if(entrada.value.length>0){
        resultado.forEach(element => {
            /*Nombre de receta*/
            var nombre = document.createElement("h2");        
            nombre.textContent = element.strMeal;
            /*Boton de accion*/
            var boton = document.createElement("button");
            boton.id = "BotonP_" + element.idMeal;
            boton.classList.add("BotonP");
            boton.style.backgroundImage = `url('${element.strMealThumb}')`;
            boton.addEventListener("click",  function() {
                verDetalleDeReceta(this.id.split("_")[1]);
            });
            irAlosDetallesDeReceta(boton, element);
            boton.appendChild(nombre);       /*Se agrega el nombre de receta al boton*/
            resultados.appendChild(boton);   /*Se agrega boton de receta al div Resultados*/
        });
    }
}

/*Quita las recetas renderizadas en el div Resultados*/
function vacearRender(){
    resultados.innerHTML = "";
}

/*----------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------*/

function verficarListaEnMemoria(){
    //recuperar de memoria la lista de recetas
    var listaFavoritasJSON = localStorage.getItem('listaFavoritasJSON');

    // Verificar si la variable está guardada en localStorage
    if (listaFavoritasJSON === null) {
        console.log("xd3",listaFavoritasJSON);
        listaFavoritas = new Array();
    }
    else{
        console.log(" xd2 ", listaFavoritasJSON);
        listaFavoritas =  JSON.parse(listaFavoritasJSON);
    }
}

/*Funcion para guardar en memoria la nueva receta*/
function agregarAFavoritas(id){
    
    //Creando receta para guardar en memoria
    var nombreF = document.getElementById("NombreReceta_"+id).textContent;
    var estrellasF = document.getElementById("ValoracionReceta_"+id).dataset.estrellas;
    var imagenUrl = document.getElementById("BotonReceta_"+id).dataset.imagenUrl;         //img.dataset.imagenUrl = imagenUrl;
    var nuevaFavorita = {
        strMeal: nombreF,
        strStars: estrellasF,
        strMealThumb: imagenUrl,
        idMeal: id
    }

    // //==========Lista a Modo de prueba=========
    // listaFavoritas = [
    //     {
    //         strMeal: "Objeto 1",
    //         strMealThumb: "/Imagenes/Espagueti.jpg",
    //         strStars: "5",
    //         idMeal: "a"
    //     }
    // ];
    // //==========Lista a Modo de prueba=========

    if(listaFavoritas.length>0){
        console.log("tamaño ", listaFavoritas.length);
        var existe; existe = false;
        var removida; removida = false;
        var agregada; agregada = false;

        //For para remplazar la receta
        for(i=0; i < listaFavoritas.length; i++) {
            console.log("i", i);
            console.log("nueva receta ", nuevaFavorita);
            console.log("lista inicial ", listaFavoritas);
            console.log("nueva receta stars", nuevaFavorita.strStars);


            //Comprobar si la receta a agregar existe
            if(listaFavoritas[i].idMeal == nuevaFavorita.idMeal){
                existe=true; 
                console.log("ids iguales");
                //Comprobar si tienen nueva valoracion. (se remueve la receta valorada anteriormente en la lista) 
                console.log(nuevaFavorita.strStars);
                console.log(listaFavoritas[i].strStars);
                if(nuevaFavorita.strStars !== listaFavoritas[i].strStars){
                    console.log("valoraciones diferentes es removido");
                    //Se remueve para volver a agregarse.
                    listaFavoritas.splice(i,1); //Remueve el elemento en este indice i.
                    removida=true;
                    //Si solo estaba la misma receta sin más rectas, al eleminarse el areglo queda vacio.
                    //Se agrega nuevamente con push 
                    if(listaFavoritas.length==0){
                        console.log("reincerta el array vacio");
                        listaFavoritas.push(nuevaFavorita);
                        agregada=true;
                    }//else hay elementos aun en la lista, se sigue al siguiente for para insertar correctamente. 
                }//else ids iguales y valoracion igual no se hace nada
            }//else ids diferentes no se hace nada
        }

        //Si la receta no estaba >> se agrega.   O   Si estaba, se removio y no se agregó. >> se agrega.   
        if(existe==false||(existe==true&&removida==true&&agregada==false)){
            for(i=0; i < listaFavoritas.length; i++) {
                console.log("for2 i:", i);
                //Si se llega a la ultima receta de la lista y la nueva receta tiene menos estrellas o igual cantidad se agrega por defecto al final.
                if(i == listaFavoritas.length-1 &&  parseInt(nuevaFavorita.strStars) <= parseInt(listaFavoritas[i].strStars)){
                    listaFavoritas.push(nuevaFavorita); 
                    break;
                }
                else{
                    //Si la valoracion de la nueva receta es mayor que la valoracion de la receta en este indice (se inserta en este indice) 
                    //Se desplazan las demas recetas a la derecha sin afectar la que estaba en este indice.
                    if(parseInt(nuevaFavorita.strStars) > parseInt(listaFavoritas[i].strStars)){
                        listaFavoritas.splice(i, 0, nuevaFavorita);  
                        break;
                    }//else la nueva receta no tiene una valoracion mayor, continua moviendose.
                }
            };
        }
    }
    else{
        listaFavoritas.push(nuevaFavorita);
    }

    // Guardar la cadena JSON nuevamente en el almacenamiento local
    // Convertir el arreglo a una cadena JSON
    listaFavoritasJSON = JSON.stringify(listaFavoritas);
    localStorage.setItem('listaFavoritasJSON', listaFavoritasJSON);   
    
    //Actualizar vista de recetas favoritas
    renderizarFavoritas(); 
}


/*Funcion para renderizar las recetas favoritas*/
function renderizarFavoritas(){
    console.log("renderizar recetas favoritas");
    vacearRenderFavoritas();
    if(listaFavoritas.length > 0){
    for(i=0; i < listaFavoritas.length; i++) {
        element = listaFavoritas[i];

        var boton = document.createElement("button");
        boton.classList.add("BotonF");
        boton.id = "BotonF_" + element.idMeal;
        boton.addEventListener("click",  function() {
            verDetalleDeReceta(this.id.split("_")[1]);
        });

        var imagenUrl = `url('${element.strMealThumb}')`;
        var img = document.createElement("div");
        img.classList.add("FavoritaImg");
        img.style.backgroundImage = imagenUrl;
        
        var nombre = document.createElement("h3");
        nombre.classList.add("FavoritaNombre");
        nombre.textContent = element.strMeal;

        var nstrellas = document.createElement("h3");
        nstrellas.classList.add("FavoritaNS");
        nstrellas.textContent = element.strStars;

        var estrellaimg = document.createElement("div");
        switch (element.strStars) {
            case "1":  
                estrellaimg.className = "imagenStar star1";
                break;
            
            case "2": 
                estrellaimg.className = "imagenStar star2";
                break;

            case "3": 
                estrellaimg.className = "imagenStar star3";
                break;
            
            case "4": 
                estrellaimg.className = "imagenStar star4";
                break;
            
            case "5": 
                estrellaimg.className = "imagenStar star5";
                break;
        
            default:
                break;
        }

        irAlosDetallesDeReceta(boton, element);

        nstrellas.appendChild(estrellaimg);
        boton.appendChild(img);
        boton.appendChild(nombre);
        boton.appendChild(nstrellas);
        favoritos.appendChild(boton);
    }
        }else{

        const texto = document.createElement('p');
        texto.textContent = 'Todavía no tiene recetas favoritas'
        texto.classList.add('claseTexto');
        favoritos.appendChild(texto);
    }
    };  

function vacearRenderFavoritas(){
    favoritos.innerHTML="";
}


/*----------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------*/


function cargarRecetasRandom(){
    console.log("Recetas Random");

    laReceta="a";
    //Como las recetas aleatorias es necesario pago, se toma una serie de recetas que coinciden con la letra a en el nombre.
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${laReceta}`;     // Construir la URL con la variable
    fetch(url)    // Hacer la solicitud fetch
    .then(response => {
        if (!response.ok) {throw new Error('Network response was not ok');}
        return response.json();
    })
    .then(data => {
        // Manejar los datos de respuesta
        console.log("la url es: ", url);
        RenderizarRecetasRandom(data.meals);
    })
    .catch(error => {
        // Manejar los errores
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function RenderizarRecetasRandom(listaRecetasR){
    console.log("renderizar recetas random");
    vacearRenderRandom();


    listaRecetasR.forEach(element => {

        var recetaRandom = document.createElement("div");
        recetaRandom.classList.add("RecetaRandom");

        var imagenUrl = `url('${element.strMealThumb}')`;
        var botonR = document.createElement("button");
        botonR.classList.add("RecetaBoton");
        botonR.id = "BotonReceta_"+element.idMeal;
        botonR.style.backgroundImage = imagenUrl;
        botonR.dataset.imagenUrl = element.strMealThumb;
        botonR.addEventListener("click",  function() {
            verDetalleDeReceta(this.id.split("_")[1]);
        });

        var nombreR = document.createElement("h3");
        nombreR.classList.add("RecetaNombre");
        nombreR.id = "NombreReceta_"+ element.idMeal;
        nombreR.textContent = element.strMeal;

        var valoracionR = document.createElement("div");
        valoracionR.classList.add("RecetaValoracion");
        valoracionR.id = "ValoracionReceta_"+element.idMeal;
        valoracionR.dataset.estrellas = "0";
        
        //Boton de Estrella 1
        var botonS1 = document.createElement("button");
        botonS1.classList.add("star");
        botonS1.id = "star1_"+element.idMeal;
        botonS1.addEventListener("click",  function() {
            document.getElementById("ValoracionReceta_"+this.id.split("_")[1]).dataset.estrellas = "1";
            console.log("1 estrella");
            agregarAFavoritas(element.idMeal);
        });
        botonS1.addEventListener("mouseover",  function() {
            agregarColorEstrellas("s1", this);
        });
        botonS1.addEventListener("mouseleave",  function() {
            removerColorEstrellas("s1", this, this.parentNode.dataset.estrellas);
        });
    
        //Boton de Estrella 2
        var botonS2 = document.createElement("button");
        botonS2.classList.add("star");
        botonS2.id = "star2_"+element.idMeal;
        botonS2.addEventListener("click",  function() {
            document.getElementById("ValoracionReceta_"+this.id.split("_")[1]).dataset.estrellas = "2";
            console.log("2 estrellas");
            agregarAFavoritas(element.idMeal);
        });
        botonS2.addEventListener("mouseover",  function() {
            agregarColorEstrellas("s2", this);
        });
        botonS2.addEventListener("mouseleave",  function() {
            removerColorEstrellas("s2", this, this.parentNode.dataset.estrellas);
        });
         
        //Boton de Estrella 3
        var botonS3 = document.createElement("button");
        botonS3.classList.add("star");
        botonS3.id = "star3_"+element.idMeal;
        botonS3.addEventListener("click",  function() {
            document.getElementById("ValoracionReceta_"+this.id.split("_")[1]).dataset.estrellas = "3";
            console.log("3 estrellas");
            agregarAFavoritas(element.idMeal);
        });
        botonS3.addEventListener("mouseover",  function() {
            agregarColorEstrellas("s3", this);
        });
        botonS3.addEventListener("mouseleave",  function() {
            removerColorEstrellas("s3", this, this.parentNode.dataset.estrellas);
        });

        //Boton de Estrella 4
        var botonS4 = document.createElement("button");
        botonS4.classList.add("star");
        botonS4.id = "star4_"+element.idMeal;
        botonS4.addEventListener("click",  function() {
            document.getElementById("ValoracionReceta_"+this.id.split("_")[1]).dataset.estrellas = "4";
            console.log("4 estrellas");
            agregarAFavoritas(element.idMeal);
        });
        botonS4.addEventListener("mouseover",  function() {
            agregarColorEstrellas("s4", this);
        });
        botonS4.addEventListener("mouseleave",  function() {
            removerColorEstrellas("s4", this, this.parentNode.dataset.estrellas);
        });

        var botonS5 = document.createElement("button");
        botonS5.classList.add("star");
        botonS5.id = "star5_"+element.idMeal;
        botonS5.addEventListener("click",  function() {
            document.getElementById("ValoracionReceta_"+this.id.split("_")[1]).dataset.estrellas = "5"; 
            console.log("5 estrellas");
            agregarAFavoritas(element.idMeal);
        });
        botonS5.addEventListener("mouseover",  function() {
            agregarColorEstrellas("s5", this);
        });
        botonS5.addEventListener("mouseleave",  function() {
            removerColorEstrellas("s5", this, this.parentNode.dataset.estrellas);
        });

    
        //======================

        irAlosDetallesDeReceta(botonR, element);

        valoracionR.appendChild(botonS1);
        valoracionR.appendChild(botonS2);
        valoracionR.appendChild(botonS3);
        valoracionR.appendChild(botonS4);
        valoracionR.appendChild(botonS5);
        recetaRandom.appendChild(botonR);
        recetaRandom.appendChild(valoracionR);
        recetaRandom.appendChild(nombreR);
        random.appendChild(recetaRandom);
        
    });  

}

function agregarColorEstrellas(estrella, elemento){

    var star1 = document.getElementById("star1_"+elemento.id.split("_")[1]);  star1.className = 'star';
    var star2 = document.getElementById("star2_"+elemento.id.split("_")[1]);  star2.className = 'star';
    var star3 = document.getElementById("star3_"+elemento.id.split("_")[1]);  star3.className = 'star';
    var star4 = document.getElementById("star4_"+elemento.id.split("_")[1]);  star4.className = 'star';
    var star5 = document.getElementById("star5_"+elemento.id.split("_")[1]);  star5.className = 'star';

    if(estrella=="s1"){
        star1.className = "star star1";     
    }
    if(estrella=="s2"){
        star1.className = "star star2";
        star2.className = "star star2";
    }
    if(estrella=="s3"){
        star1.className = "star star3";
        star2.className = "star star3";
        star3.className = "star star3";
    }
    if(estrella=="s4"){
        star1.className = "star star4";
        star2.className = "star star4";
        star3.className = "star star4";
        star4.className = "star star4";
    }
    if(estrella=="s5"){
        star1.className = "star star5";
        star2.className = "star star5";
        star3.className = "star star5";
        star4.className = "star star5";
        star5.className = "star star5";
    }  
}

//Se encarga de despintar las estrellas cuando se quita el mouse de encima de las estrellas
//Solo deja pintadas que concuerdan con el valor guardado en el elemento div con dataset.estrellas
function removerColorEstrellas(estrella, elemento, numEstrellas){
    
    var star1 = document.getElementById("star1_"+elemento.id.split("_")[1]);  star1.className = 'star';
    var star2 = document.getElementById("star2_"+elemento.id.split("_")[1]);  star2.className = 'star';
    var star3 = document.getElementById("star3_"+elemento.id.split("_")[1]);  star3.className = 'star';
    var star4 = document.getElementById("star4_"+elemento.id.split("_")[1]);  star4.className = 'star';
    var star5 = document.getElementById("star5_"+elemento.id.split("_")[1]);  star5.className = 'star';

    if(numEstrellas=="1"){
        star1.className = "star star1";     
    }
    if(numEstrellas=="2"){
        star1.className = "star star2";
        star2.className = "star star2";
    }
    if(numEstrellas=="3"){
        star1.className = "star star3";
        star2.className = "star star3";
        star3.className = "star star3";
    }
    if(numEstrellas=="4"){
        star1.className = "star star4";
        star2.className = "star star4";
        star3.className = "star star4";
        star4.className = "star star4";
    }
    if(numEstrellas=="5"){
        star1.className = "star star5";
        star2.className = "star star5";
        star3.className = "star star5";
        star4.className = "star star5";
        star5.className = "star star5";
    }  
}

function vacearRenderRandom(){
    random.innerHTML="";
}


// Función para realizar el movimiento del scroll lateralmente dentro de un div
function scrollSuaveDiv() {
    if(scrollposicion>favoritos.offsetWidth){
        console.log("xd1");
        scrollposicion = 0;
        favoritos.scrollLeft = 0;
    }
    else{
        scrollposicion += 500;         
        favoritos.scrollLeft += 500;            
    }
}

//Funcion que recibe el id de la recta presionada para cargar la pagina con el detalle de la receta.
function verDetalleDeReceta(id){
    console.log("Se ha solicitado ver el detalle de la receta: ", id);
    OcultarResultados()
}

/*Busca las recetas y llama al metodo para cagar la pagina con los resultados de busqueda*/
function BusqueParaNuevaPagina() {
    laReceta = entrada.value;
    //CargarPaginaDeBusqueda(Buscar(laReceta));
}

// Funcion para redigir a la pagina de detalles cuando se presiona una receta
function irAlosDetallesDeReceta(boton, element){
    boton.addEventListener("click", function(){
        document.location.href =  `details.html?id=${element.idMeal}`;
    })
};


//////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {
    entrada.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            BusqueParaNuevaPagina();
        }
    });
    botonBuscar.addEventListener('click', BusqueParaNuevaPagina);
});

function BusqueParaNuevaPagina() {
    const query = entrada.value;
    if (query.length > 0) {

        window.location.href = `resultados.html?query=${encodeURIComponent(query)}`;
    }
}


/////////////////////////////////////////////////

// Función para insertar resultados en la tabla
function insertarResultados(resultados) {
    const tablaResultados = document.getElementById('tablaResultados');
    
    tablaResultados.innerHTML = '';
    
    resultados.forEach(resultado => {
        const fila = document.createElement('tr');
        
        const nombreReceta = document.createElement('td');
        nombreReceta.textContent = resultado.nombre; 
        fila.appendChild(nombreReceta);
        
        const categoria = document.createElement('td');
        categoria.textContent = resultado.categoria; 
        fila.appendChild(categoria);
        
        const area = document.createElement('td');
        area.textContent = resultado.area; 
        fila.appendChild(area);
        
        const imagen = document.createElement('td');
        const imagenElemento = document.createElement('img');
        imagenElemento.src = resultado.imagen; 
        imagenElemento.alt = resultado.nombre; 
        imagen.appendChild(imagenElemento);
        fila.appendChild(imagen);
        
        tablaResultados.appendChild(fila);
    });
}

function BusqueParaNuevaPagina() {
    const query = entrada.value;
    if (query.length > 0) {
        // Redirigir a la página resultados.html pasando el parámetro de búsqueda
        window.location.href = `resultados.html?query=${encodeURIComponent(query)}`;
    }
}
