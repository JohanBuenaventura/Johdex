const pokedex = document.getElementById('pokedex');
const searchInput = document.getElementById('search');
const typeFilter = document.getElementById('typeFilter');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('pageInfo');
const pokemonModal = document.getElementById('pokemonModal');
const modalDetails = document.getElementById('modalDetails');

let allPokemon = [];
let currentPage = 1;
const perPage = 50;

const loadingDiv = document.createElement('div');
loadingDiv.textContent = "Loading Pokémon...";
loadingDiv.style.textAlign = 'center';
loadingDiv.style.fontSize = '1.2rem';
loadingDiv.style.padding = '2rem';

async function fetchPokemonList() {
  pokedex.innerHTML = '';
  pokedex.appendChild(loadingDiv);

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=2000`);
  const data = await res.json();

  allPokemon = await Promise.all(data.results.map(p => fetch(p.url).then(r => r.json())));

  pokedex.removeChild(loadingDiv);
  populateTypeFilter();
  displayPage();
}

function populateTypeFilter() {
  const types = new Set();
  allPokemon.forEach(p => p.types.forEach(t => types.add(t.type.name)));

  [...types].sort().forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = capitalize(t);
    typeFilter.appendChild(opt);
  });
}

function displayPage() {
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const searchText = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;

  const filtered = allPokemon.filter(p => {
    const nameMatch = p.name.includes(searchText);
    const typeMatch = !selectedType || p.types.some(t => t.type.name === selectedType);
    return nameMatch && typeMatch;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * perPage;
  const pageData = filtered.slice(start, start + perPage);

  pokedex.innerHTML = '';
  pageData.forEach(displayPokemon);

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

function displayPokemon(pokemon) {
  const mainType = pokemon.types[0].type.name;

  const div = document.createElement('div');
  div.classList.add('pokemon', mainType);

  div.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h2>${capitalize(pokemon.name)}</h2>
  `;
  div.addEventListener('click', () => openModal(pokemon));
  pokedex.appendChild(div);
}

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
  pokemonModal.classList.add('show');

  // Attach close button functionality
  document.getElementById('closeModal').addEventListener('click', () => {
    pokemonModal.classList.remove('show');
  });
}

// Close modal when clicking outside the modal content
pokemonModal.addEventListener('click', (e) => {
  if (e.target === pokemonModal) {
    pokemonModal.classList.remove('show');
  }
});

searchInput.addEventListener('input', () => {
  currentPage = 1;
  displayPage();
});

typeFilter.addEventListener('change', () => {
  currentPage = 1;
  displayPage();
});

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayPage();
  }
});

nextBtn.addEventListener('click', () => {
  currentPage++;
  displayPage();
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

fetchPokemonList();
