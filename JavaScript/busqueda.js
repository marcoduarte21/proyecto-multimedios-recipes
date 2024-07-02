document.addEventListener('DOMContentLoaded', function() {
    let searchLabel = document.getElementById('resultSearch')
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    if (query) {
        // Hacer la solicitud fetch con la API correspondiente (como se hace en tu función BuscarParaVistaPrevia)
        const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Manejar los datos de respuesta
                searchLabel.textContent = `Resultados para "${query}" (${data.meals.length} recetas)`
                console.log('Resultado de búsqueda:', data);
                renderizarResultados(data.meals);
            })
            .catch(error => {
                console.error('Hubo un problema con la solicitud fetch:', error);
            });
    }
});

function renderizarResultados(resultados) {
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = ''; // Limpiar resultados anteriores

    resultados.forEach(receta => {
        const recetaDiv = document.createElement('div');
        const containerImg = document.createElement('div');
        const description = document.createElement('div')
        const img = document.createElement('img');
        description.classList.add('description')

        recetaDiv.classList.add('recetaBusqueda');
        containerImg.classList.add('containerImg')
        img.classList.add('imageRecipe');

        
        const nombre = document.createElement('h2');
        img.src = receta.strMealThumb
        nombre.textContent = receta.strMeal;

        recetaDiv.appendChild(containerImg)
        containerImg.appendChild(img);

        recetaDiv.appendChild(description)

        description.appendChild(nombre);
        irAlosDetallesDeReceta(recetaDiv, receta)

        resultadosDiv.appendChild(recetaDiv);
    });
}

function irAlosDetallesDeReceta(boton, element){
boton.addEventListener("click", function(){
document.location.href =  `details.html?id=${element.idMeal}`;
})
};