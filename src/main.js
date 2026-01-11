import './styles.css';

const baseWidth = 412;
const baseHeight = 917;
const app = document.querySelector('#app');

const burgerIcon = `
<svg class="burger" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <rect y="2" width="23" height="4" rx="2" fill="#31312F" />
  <rect y="9" width="23" height="4" rx="2" fill="#31312F" />
  <rect y="16" width="23" height="4" rx="2" fill="#31312F" />
</svg>`;

const cards = [
  {
    rectY: 79,
    color: '#DAA420',
    title: { text: 'Приход', x: 16, y: 92, width: 94 },
    value: { text: '11', x: 350, y: 101 },
    subtitle: { text: 'Перемещение товаров между ячейками', x: 16, y: 147 }
  },
  {
    rectY: 181,
    color: '#F3A361',
    title: { text: 'Подбор', x: 16, y: 194, width: 94 },
    value: { text: '36', x: 328, y: 203 }, // 36 uses layout_L9CGWC
    subtitle: { text: 'Перемещение товаров между ячейками', x: 16, y: 249 }
  },
  {
    rectY: 283,
    color: '#FED801',
    title: { text: 'Инвентаризация', x: 16, y: 296, width: 210 },
    value: { text: '7', x: 365, y: 305 },
    subtitle: { text: 'Перемещение товаров между ячейками', x: 16, y: 351 }
  },
  {
    rectY: 385,
    color: '#BA8F8E',
    title: { text: 'Перемещение\nпо ячейкам', x: 16, y: 396, width: 179 },
    value: { text: '14', x: 337, y: 407 },
    subtitle: { text: 'Перемещение товаров между ячейками', x: 16, y: 453 }
  },
  {
    rectY: 487,
    color: '#DEB887',
    title: { text: 'Перемещение\nпо складам', x: 16, y: 498, width: 179 },
    value: { text: '28', x: 328, y: 509 },
    subtitle: { text: 'Перемещение товаров между ячейками', x: 16, y: 555 }
  },
  {
    rectY: 589,
    color: '#FEA079',
    title: { text: 'Остатки', x: 16, y: 602, width: 101 },
    value: { text: '1', x: 371, y: 611 },
    subtitle: { text: 'Перемещение товаров между ячейками', x: 16, y: 657 }
  },
  {
    rectY: 691,
    color: '#91ED91',
    title: { text: 'Упаковочный\nлист', x: 16, y: 704, width: 179 },
    value: { text: '960', x: 290, y: 713 },
    subtitle: { text: 'Перемещение товаров между ячейками', x: 16, y: 759 }
  },
  {
    rectY: 793,
    color: '#F0E78D',
    title: { text: 'Штрихкоды', x: 16, y: 806, width: 148 },
    value: { text: '6', x: 360, y: 815 },
    subtitle: { text: 'Перемещение товаров между ячейками', x: 16, y: 861 }
  }
];

function buildCard(card) {
  const el = document.createElement('div');
  el.className = 'card';
  el.style.top = `${card.rectY}px`;
  el.style.background = card.color;

  const title = document.createElement('div');
  title.className = 'card__title';
  title.style.top = `${card.title.y - card.rectY}px`;
  title.style.width = `${card.title.width}px`;
  title.textContent = card.title.text;

  const subtitle = document.createElement('div');
  subtitle.className = 'card__subtitle';
  subtitle.style.top = `${card.subtitle.y - card.rectY}px`;
  subtitle.textContent = card.subtitle.text;

  const value = document.createElement('div');
  value.className = 'card__value';
  value.style.left = `${card.value.x}px`;
  value.style.top = `${card.value.y - card.rectY}px`;
  value.textContent = card.value.text;

  el.append(title, subtitle, value);
  return el;
}

function render() {
  app.innerHTML = `
    <div class="scale-wrapper">
      <div class="device-wrapper">
        <div class="device">
          <div class="header">
            ${burgerIcon}
            <h1 class="header__title">Склад 15</h1>
          </div>
          <div class="cards"></div>
        </div>
      </div>
    </div>
  `;

  const cardsRoot = app.querySelector('.cards');
  cards.forEach((c) => cardsRoot.append(buildCard(c)));

  applyScale();
}

function applyScale() {
  const device = app.querySelector('.device');
  const wrapper = app.querySelector('.device-wrapper');
  const scaleWrapper = app.querySelector('.scale-wrapper');
  if (!device || !wrapper || !scaleWrapper) return;

  const availWidth = window.innerWidth - scaleWrapper.offsetLeft * 2;
  const availHeight = window.innerHeight - scaleWrapper.offsetTop * 2;
  const scale = Math.min(availWidth / baseWidth, availHeight / baseHeight);

  wrapper.style.width = `${baseWidth * scale}px`;
  wrapper.style.height = `${baseHeight * scale}px`;
  device.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', applyScale);

render();
