document.querySelector('#year').textContent = new Date().getFullYear();

const cards = [...document.querySelectorAll('.game-card')];
const filterButtons = [...document.querySelectorAll('.filter-button')];
const searchInput = document.querySelector('#gameSearch');
const emptyState = document.querySelector('#emptyState');
let activeFilter = 'all';

function updateCatalog() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  cards.forEach((card) => {
    const categories = card.dataset.category.split(' ');
    const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
    const matchesSearch = !query || card.dataset.name.toLowerCase().includes(query);
    const visible = matchesFilter && matchesSearch;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    updateCatalog();
  });
});

searchInput.addEventListener('input', updateCatalog);
