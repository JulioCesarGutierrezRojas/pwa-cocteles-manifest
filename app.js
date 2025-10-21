document.getElementById('searchButton').addEventListener('click', fetchCocktail);

async function fetchCocktail() {
    const inputElement = document.getElementById('cocktailName');
    const cocktailName = inputElement.value.trim();
    const resultDiv = document.getElementById('result');

    if (!cocktailName) {
        alert("¡No olvides escribir el nombre de un cóctel!");
        return;
    }

    // URL de la API con el nombre del cóctel
    const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${cocktailName}`;
    resultDiv.innerHTML = '<h2>Cargando...</h2>';

    try {
        const response = await fetch(url);

        // Manejamos errores HTTP 4xx/5xx
        if (!response.ok) {
            throw new Error('Respuesta del servidor no válida');
        }

        const data = await response.json();
        const cocktail = data.drinks ? data.drinks[0] : null;

        if (!cocktail) {
            resultDiv.innerHTML = `<p>No se encontró el cóctel: <strong>${cocktailName}</strong></p>`;
            return;
        }

        // Renderizamos el resultado (también sirve si el JSON es un fallback)
        resultDiv.innerHTML = `
      <h2>${cocktail.strDrink}</h2>
      <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" width="200" height="300">
      <p><strong>Categoría:</strong> ${cocktail.strCategory}</p>
      <p><strong>Instrucciones:</strong> ${cocktail.strInstructions}</p>
      <p><strong>Ingrediente 1:</strong> ${cocktail.strIngredient1}</p>
    `;
    } catch (error) {
        // Este catch solo captura errores del cliente (como fallo al parsear JSON)
        resultDiv.innerHTML = `<p style="color: red;">Error al procesar la respuesta: ${error.message}</p>`;
    }
}
