
document.addEventListener('DOMContentLoaded', function() {

    recipesDetails();

});


function recipesDetails() {
    const valores = window.location.search;
    const urlParams = new URLSearchParams(valores);
    const id = urlParams.get('id');

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const meal = data.meals[0];
            if (!meal) {
                throw new Error('Meal not found');
            }

            document.title = meal.strMeal + ' | allrecipes';
            
            const cardRecipe = `
                    <div class="receta">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <h1>${meal.strMeal}</h1>
                    </div>
                    <div class="ingredientes">
                    <h2>Ingredientes</h2>
                        <table>
                        <tbody>
                        ${getListIngredients(ListIngredients(meal))}
                        </tbody>
                        </table>
                    </div>
                <div class="instruccions">
                    <h2>Instrucciones de la receta</h2>
                    <div class="ListOfInstructions">
                    <div class="instructions2">
                    ${ListaDeInstrucciones(meal.strInstructions)}
                    </div>
                    <div class="instructions2">
                    ${ListaDeInstrucciones2(meal.strInstructions)}
                    </div>
                    </div>
                </div>
                <div class="containerYoutube">
                <iframe width="560" height="315" src="${generarURLYoutube(meal.strYoutube)}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>`;

                document.querySelector(".containerDetails").innerHTML = cardRecipe;
            
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            document.querySelector(".containerDetails").innerHTML = '<p>Sorry, something went wrong.</p>';
        });
}

function ListaDeInstrucciones(texto){
    let arrayDeTexto = texto.split('.');
    let parrafo = '';
    let arraySize = Math.round(arrayDeTexto.length/2);
    for(let i=0; i < arraySize; i++){
        if(arrayDeTexto[i]){
        parrafo += `<p><strong>Step ${i+1}:</strong> ${arrayDeTexto[i]}.</p>`;
        }
    }

    return parrafo;
}

function ListaDeInstrucciones2(texto){
    let arrayDeTexto = texto.split('.');
    let parrafo = '';
    let arraySize = Math.round(arrayDeTexto.length/2);
    let contador = arraySize;
    for(let i=contador; i <= (arraySize*2); i++){
        if(arrayDeTexto[i]){
        parrafo += `<p><strong>Step ${i+1}:</strong> ${arrayDeTexto[i]}.</p>`;
        }
    }

    return parrafo;
}


function ListIngredients(meal){
    
    let ingredients = [];


    for(let i = 1; i <= 20; i++){
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if(ingredient){
            ingredients.push({ingredient: ingredient, measure: measure})
        }
    }

    console.log(ingredients[1].ingredient + ''+ ingredients[1].measure);

    return ingredients;
}


function getListIngredients(meal) {
    let ingredientsList = '';
    
    for (let i = 0; i < meal.length; i += 3) {
        ingredientsList += '<tr>';
        
        for (let j = 0; j < 3; j++) {
            if (i + j < meal.length) {
                ingredientsList += `
                    <td>
                        <img src="https://www.themealdb.com/images/ingredients/${meal[i + j].ingredient}-Small.png">
                        <p>${meal[i + j].measure} ${meal[i + j].ingredient}.</p>
                    </td>
                `;
            } else {
                ingredientsList += '<td></td>'; // Agrega una celda vacía si no hay suficiente ingrediente
            }
        }
        
        ingredientsList += '</tr>';
    }

    return ingredientsList;
}


function generarURLYoutube(url){

    const youtubeId = url.split('v=')[1];
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;

    return embedUrl;
}
