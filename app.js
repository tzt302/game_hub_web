document.querySelector('#year').textContent = new Date().getFullYear();

const cards = [...document.querySelectorAll('.game-card')];
const filterButtons = [...document.querySelectorAll('.filter-button')];
const searchInput = document.querySelector('#gameSearch');
const emptyState = document.querySelector('#emptyState');
const liveCards = [...document.querySelectorAll('.game-live')];
const sideStack = document.querySelector('#sideStack');
const previewPanel = document.querySelector('#gamePreview');
const previewImage = document.querySelector('#previewImage');
const previewCategory = document.querySelector('#previewCategory');
const previewTitle = document.querySelector('#previewTitle');
const previewDescription = document.querySelector('#previewDescription');
const previewFeatures = document.querySelector('#previewFeatures');
const previewPlay = document.querySelector('#previewPlay');
const previewClose = document.querySelector('#previewClose');
const touchLayout = window.matchMedia('(hover: none), (max-width: 820px)');
let activeFilter = 'all';
let activePreviewCard = null;
let closeTimer = null;

function selectedLanguage() {
  return window.TZT_I18N?.getLocale?.() || localStorage.getItem('tzt-game-language') || 'en';
}

function gameUrl(card) {
  const url = new URL(card.dataset.gameHref || card.getAttribute('href'), window.location.href);
  card.dataset.gameHref = `${url.pathname}${url.hash}`;
  url.searchParams.set('lang', selectedLanguage());
  return url.href;
}

function updateGameLinks() {
  liveCards.forEach((card) => { card.href = gameUrl(card); });
}

function openGame(event, card) {
  event.preventDefault();
  const url = gameUrl(card);
  if (card.dataset.gameId === 'poker') {
    const popup = window.open('about:blank', '_blank');
    if (!popup) { window.open(url, '_blank'); return; }
    popup.document.open();
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TZT GAME</title><script defer src="${new URL('games/shared/game-i18n.js', window.location.href).href}" data-game="poker"><\/script></head><body><script>location.replace(${JSON.stringify(url)})<\/script></body></html>`);
    popup.document.close();
    return;
  }
  window.open(url, '_blank', 'noopener');
}

function cancelPreviewClose() {
  window.clearTimeout(closeTimer);
}

function showPreview(card) {
  cancelPreviewClose();
  activePreviewCard?.classList.remove('is-previewed');
  activePreviewCard = card;
  card.classList.remove('is-previewed');
  void card.offsetWidth;
  card.classList.add('is-previewed');

  previewImage.src = card.querySelector('img').src;
  previewImage.alt = card.querySelector('img').alt;
  previewCategory.textContent = card.dataset.previewCategory;
  previewTitle.textContent = card.querySelector('h3').textContent;
  previewDescription.textContent = card.dataset.previewDescription;
  previewFeatures.replaceChildren(...card.dataset.previewFeatures.split('|').map((feature) => {
    const span = document.createElement('span');
    span.textContent = feature;
    return span;
  }));
  previewPlay.href = gameUrl(card);
  previewPanel.setAttribute('aria-hidden', 'false');
  sideStack.classList.add('preview-open');
  document.body.classList.add('preview-visible');
}

function hidePreview() {
  cancelPreviewClose();
  activePreviewCard?.classList.remove('is-previewed');
  activePreviewCard = null;
  previewPanel.setAttribute('aria-hidden', 'true');
  sideStack.classList.remove('preview-open');
  document.body.classList.remove('preview-visible');
}

function schedulePreviewClose() {
  if (touchLayout.matches) return;
  cancelPreviewClose();
  closeTimer = window.setTimeout(hidePreview, 140);
}

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
  if (activePreviewCard?.hidden) hidePreview();
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    updateCatalog();
  });
});

searchInput.addEventListener('input', updateCatalog);

liveCards.forEach((card) => {
  card.addEventListener('mouseenter', () => {
    if (!touchLayout.matches) showPreview(card);
  });
  card.addEventListener('mouseleave', schedulePreviewClose);
  card.addEventListener('focus', () => {
    if (!touchLayout.matches) showPreview(card);
  });
  card.addEventListener('blur', schedulePreviewClose);
  card.addEventListener('click', (event) => {
    if (!touchLayout.matches) { openGame(event, card); return; }
    if (card.classList.contains('is-previewed')) { openGame(event, card); return; }
    event.preventDefault();
    showPreview(card);
  });
});

previewPlay.addEventListener('click', (event) => {
  if (activePreviewCard) openGame(event, activePreviewCard);
});

previewPanel.addEventListener('mouseenter', cancelPreviewClose);
previewPanel.addEventListener('mouseleave', schedulePreviewClose);
previewPanel.addEventListener('focusin', cancelPreviewClose);
previewPanel.addEventListener('focusout', schedulePreviewClose);
previewClose.addEventListener('click', hidePreview);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') hidePreview();
});

window.addEventListener('tzt-language-change', () => {
  updateGameLinks();
  updateCatalog();
  if (activePreviewCard) showPreview(activePreviewCard);
});

updateGameLinks();
