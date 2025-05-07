// Get references to DOM elements
const pokedex = document.getElementById('pokedex');
const searchInput = document.getElementById('search');
const typeFilter = document.getElementById('typeFilter');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('pageInfo');
const pokemonModal = document.getElementById('pokemonModal');
const modalDetails = document.getElementById('modalDetails');

// Initialize variables for Pokémon data and pagination
let allPokemon = [];
let currentPage = 1;
const perPage = 50;  // Number of Pokémon displayed per page

// Create and style a loading message
const loadingDiv = document.createElement('div');
loadingDiv.textContent = "Loading Pokémon...";
loadingDiv.style.textAlign = 'center';
loadingDiv.style.fontSize = '1.2rem';
loadingDiv.style.padding = '2rem';

// Fetch list of Pokémon from the API
async function fetchPokemonList() {
  pokedex.innerHTML = '';  // Clear the pokedex
  pokedex.appendChild(loadingDiv);  // Display loading message

  // Fetch the Pokémon data from the API
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=2000`);
  const data = await res.json();

  // Fetch detailed data for each Pokémon
  allPokemon = await Promise.all(data.results.map(p => fetch(p.url).then(r => r.json())));

  pokedex.removeChild(loadingDiv);  // Remove the loading message
  populateTypeFilter();  // Populate the type filter dropdown
  displayPage();  // Display the first page of Pokémon
}

// Populate the type filter dropdown with available Pokémon types
function populateTypeFilter() {
  const types = new Set();
  allPokemon.forEach(p => p.types.forEach(t => types.add(t.type.name)));

  // Sort types alphabetically and create an option element for each type
  [...types].sort().forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = capitalize(t);  // Capitalize the type name
    typeFilter.appendChild(opt);
  });
}

// Display the Pokémon data for the current page
function displayPage() {
  window.scrollTo({ top: 0, behavior: 'smooth' });  // Scroll to the top of the page

  const searchText = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;

  // Filter Pokémon based on search text and selected type
  const filtered = allPokemon.filter(p => {
    const nameMatch = p.name.includes(searchText);
    const typeMatch = !selectedType || p.types.some(t => t.type.name === selectedType);
    return nameMatch && typeMatch;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * perPage;
  const pageData = filtered.slice(start, start + perPage);

  pokedex.innerHTML = '';  // Clear the current pokedex display
  pageData.forEach(displayPokemon);  // Display Pokémon for the current page

  // Update page information (e.g., current page and total pages)
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Display a single Pokémon on the page
function displayPokemon(pokemon) {
  const mainType = pokemon.types[0].type.name;

  const div = document.createElement('div');
  div.classList.add('pokemon', mainType);

  div.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h2>${capitalize(pokemon.name)}</h2>
  `;
  div.addEventListener('click', () => openModal(pokemon));  // Open modal on click
  pokedex.appendChild(div);
}

// Open the modal to display detailed Pokémon information
function openModal(pokemon) {
  modalDetails.innerHTML = `
    <button id="closeModal" class="close-btn">✖</button>
    <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <h2>${capitalize(pokemon.name)}</h2>
    <div class="types">
      ${pokemon.types.map(t => `<span class="type-badge ${t.type.name}">${t.type.name}</span>`).join('')}
    </div>
    <div class="stats">
      ${pokemon.stats.map(s => `<p><strong>${capitalize(s.stat.name)}:</strong> ${s.base_stat}</p>`).join('')}
    </div>
  `;
  pokemonModal.classList.add('show');  // Show the modal

  // Attach close button functionality
  document.getElementById('closeModal').addEventListener('click', () => {
    pokemonModal.classList.remove('show');  // Hide the modal
  });
}

// Close modal when clicking outside the modal content
pokemonModal.addEventListener('click', (e) => {
  if (e.target === pokemonModal) {
    pokemonModal.classList.remove('show');  // Hide the modal
  }
});

// Event listeners for input and filter changes
searchInput.addEventListener('input', () => {
  currentPage = 1;  // Reset to first page
  displayPage();
});

typeFilter.addEventListener('change', () => {
  currentPage = 1;  // Reset to first page
  displayPage();
});

// Event listeners for pagination buttons
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;  // Go to the previous page
    displayPage();
  }
});

nextBtn.addEventListener('click', () => {
  currentPage++;  // Go to the next page
  displayPage();
});

// Helper function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Fetch the Pokémon list when the page loads
fetchPokemonList();
