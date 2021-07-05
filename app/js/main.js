'use strict';

const jsonUrl = './dbHeroes.json';

class MarvelData {
  constructor() {
    // текущие данные
    this.currentData = [];
    // полные данные
    this.fullData = [];
    // установленные фильтры
    this.filters = {
      name: 'all',
      gender: 'all',
      citizenship: 'all',
      species: 'all',
      status: 'all',
      movies: 'all',
    }
    // **** возможный функционал для сортировки по фильтрам
    this.orders = {
      name: 'none',
      gender: 'none',
      citizenship: 'none',
      species: 'none',
      status: 'none',
      movies: 'none',
    }
    // коллекции уникальных значений полей для заполнения фильтров
    this.selects = {
      name: new Set(),
      gender: new Set(),
      citizenship: new Set(),
      status: new Set(),
      movies: new Set(),
      species: new Set(),
    }
    // коллекции значений фильтров после применения фильтров
    this.currentSelects = {
      name: new Set(),
      gender: new Set(),
      citizenship: new Set(),
      status: new Set(),
      movies: new Set(),
      species: new Set(),
    }
    this.imageDataArray = [];
    this.canvasCount = 25;
  }
  // обнуляем установленные фильтры
  wipeFilters() {
    for (let key in this.filters) {
      this.filters[key] = 'all';
    }
  }

  wipeData() {
    this.currentData = this.fullData;
  }

  request() {
    fetch(jsonUrl)
      .then(response => response.json())
      .then(result => this.start(result));
  }

  start(data) {
    this.fullData = data;
    this.wipeData();
    this.renderCards();
    this.processingData(this.currentData, this.selects);
    this.wipeAndFillCurrentSelects();
    this.fillSelects(this.currentSelects);
    this.addlisteners();
  }

  // отрисовываем карточки
  renderCards() {
    document.querySelector('.cards-wrapper').textContent = '';
    this.currentData.forEach((item) => this.renderCard(item))
  }

  // заполняем коллекцию значений фильтров
  processingData(data, dataSelects) {
    data.forEach((item) => {
      dataSelects.name.add(item.name);
      if (item.gender) dataSelects.gender.add(item.gender.toLowerCase());
      if (item.citizenship) dataSelects.citizenship.add(item.citizenship.toLowerCase());
      dataSelects.status.add(item.status);
      if (item.species) dataSelects.species.add(item.species);
      if (item.movies) item.movies.map(item => dataSelects.movies.add(item));
    })
  }
  // вызов очистки и заполнения текущей коллекции
  wipeAndFillCurrentSelects() {
    for (let key in this.selects) {
      this.wipeCurrentSelectCollection(key);
    }
  }
  // очищает и заполняет текущую коллекцию исходной
  wipeCurrentSelectCollection(collection) {
    this.currentSelects[collection].clear();
    const arr = Array.from(this.selects[collection]);
    this.currentSelects[collection] = new Set(arr);
  }

  //  вызов заполнения неустановленных фильтров
  fillSelects(selects) {
    for (let key in this.filters) {
      if (this.filters[key] === 'all') {
        this.addInputs(selects[key], key);
      }
    }
  }

  // заполнение фильтров
  addInputs(data, id) {
    const block = document.querySelector(`#${id}`),
      input = document.createElement('input'),
      label = document.createElement('label');

    input.classList.add('select-input');
    input.setAttribute('type', 'radio');
    input.setAttribute('name', id);
    label.classList.add('select-label');
    data.forEach(item => {
      const cloneInput = input.cloneNode(),
        cloneLabel = label.cloneNode();
      cloneInput.value = item;
      cloneLabel.textContent = item;
      cloneInput.setAttribute('id', `${id}_${item}`);
      cloneLabel.setAttribute('for', `${id}_${item}`);
      block.appendChild(cloneInput);
      block.appendChild(cloneLabel);
    })
  }

  // заполняем селект опциями
  addOptions(data, selector) {
    const block = document.querySelector(selector),
      option = document.createElement('option');

    data.forEach(item => {
      const clone = option.cloneNode();
      clone.value = item;
      clone.textContent = item;
      block.appendChild(clone);
    })
  }

  // отрисовываем карточку
  renderCard(obj) {
    const wrapper = document.querySelector('.cards-wrapper');
    const card = document.createElement('div');
    let htmlString;
    card.className = "card";
    wrapper.appendChild(card);
    htmlString = `<img src="images/${obj.photo}" alt="${obj.name}">
      <h3>${obj.name}</h3><ul class="card-info">`;
    if (obj.realName) htmlString += `<li><b>Name:</b> ${obj.realName}</li>`;
    htmlString += `<li><b>Gender:</b> ${obj.gender}</li>`;
    if (obj.species) htmlString += `<li><b>Race:</b> ${obj.species}</li>`;
    if (obj.citizenship) htmlString += `<li><b>Citizenship:</b> ${obj.citizenship}</li>`;
    if (obj.birthDay) htmlString += `<li><b>Born:</b> ${obj.birthDay}</li>`;
    htmlString += `<li><b>Status:</b> ${obj.status} `;
    if (obj.deathDay) htmlString += `(${obj.deathDay})`;
    htmlString += '</li>';
    htmlString += `<li><b>${obj.gender === 'male' ? 'Actor' : 'Actress'}:</b> ${obj.actors}</li>`;
    if (obj.movies) {
      htmlString += `<li><b>Movies:</b></li> <li><ul class='movies-list'>`;
      obj.movies.forEach(item => {
        htmlString += `<li>${item}</li>`
      })
      htmlString += `</ul></li>`;
    }
    htmlString += '</ul>';

    card.insertAdjacentHTML('beforeend', htmlString);
  }
  addlisteners() {
    const selects = document.querySelector('.selects'),
      resetBtn = document.getElementById('reset');
    selects.addEventListener('click', this.clickInSelects);
    selects.addEventListener('change', this.changeFilters.bind(this));
    resetBtn.addEventListener('click', () => {
      resetBtn.disabled = true;
      this.reset();
      setTimeout(() => {
        resetBtn.disabled = false;
      }, 2000);
    });
    document.querySelector('body').addEventListener('click', this.bodyToSelects);
  }

  // событие изменения фильтра
  changeFilters(event) {
    const target = event.target;
    // установлен фильтр не по фильмам и фильтр ранее не применялся
    if (target.name !== 'movies' && this.filters[target.name] === 'all') {
      this.applyFilter(target.name);
    } else if (target.name === 'movies' && this.filters[target.name] === 'all') {
      // установлен фильтр по фильмам, ранее он не применялся
      this.applyFilterMovie();
    } else {
      // фильтр ранее применялся - требуется вновь применить все фильтры
      this.filters[target.name] = target.value;
      this.applyAllFilters();
    }
    // меняем постер при смене фильтра с фильмами
    if (target.name === 'movies') this.changePoster();
    this.renderCards();
  }

  // закрытие селектов при различных кликах
  bodyToSelects(event) {
    const wrappers = document.querySelectorAll('.select-wrapper'),
      target = event.target,
      closestWrapper = target.closest('.select-wrapper');
    if (closestWrapper) {
      closestWrapper.getAttribute('data-state') === 'active' ? closestWrapper.setAttribute('data-state', '') : closestWrapper.setAttribute('data-state', 'active')
    }
    wrappers.forEach(item => {
      if (item !== target.parentNode) item.setAttribute('data-state', '')
    });
  }

  // смена заголовка в выбранном селекте
  clickInSelects(event) {
    const target = event.target;
    if (target.classList.contains('select-label')) {
      const title = target.closest('.select-wrapper').children[0];
      title.textContent = target.textContent;
    }
  }
  // применяем новый фильтр (кроме фильмов)
  applyFilter(id) {
    const selectWrapper = document.getElementById(id).closest('.select-wrapper'),
      selectTitle = selectWrapper.children[0].textContent;
    this.currentData = this.currentData.filter(item => {
      if (!item[id]) return false;
      return item[id].toLowerCase() === selectTitle.toLowerCase()
    });
    this.filters[id] = selectTitle;
  }
  // применяем фильтр по фильмам
  applyFilterMovie() {
    const selectWrapper = document.getElementById('movies').closest('.select-wrapper'),
      selectTitle = selectWrapper.children[0].textContent;
    this.currentData = this.currentData.filter(item => {
      if (!item['movies']) return false;
      return item['movies'].includes(selectTitle);
    });
    this.filters.movies = selectTitle;
  }

  // применяем все фильтры снова
  applyAllFilters() {
    this.wipeData();
    for (let key in this.filters) {
      if (this.filters[key] !== 'all') {
        if (key !== 'movies') {
          this.applyFilter(key)
        } else {
          this.applyFilterMovie()
        }
      }
    }
  }

  // вызов очистки всех селектов
  clearSelects() {
    for (let key in this.filters) {
      this.clearOptions(key)
    }
  }

  // очищаем селект, оставляем дефолтное значение
  clearOptions(id) {
    const block = document.querySelector(`#${id}`),
      parent = block.closest('.select-wrapper'),
      title = parent.querySelector('.select-title'),
      mainLabel = block.querySelectorAll('.select-label')[0];

    title.textContent = mainLabel.textContent;
    parent.setAttribute('data-state', '');
    for (let i = block.children.length - 1; i > 1; i--) {
      block.children[i].remove();
    }
  }

  // сброс всех фильтров - возвращение в исходное состояние
  reset() {
    this.wipeData();
    this.renderCards();
    this.wipeFilters();
    this.clearSelects()
    this.wipeAndFillCurrentSelects();
    this.fillSelects(this.currentSelects);
  }

  // смена фонового изображения при выборе фильма
  changePoster() {
    const block = document.querySelector('.actors'),
      movie = this.filters.movies;
    if (movie !== 'all') {
      let str = movie.replace(/[ :]*/g, '').toLowerCase();
      block.style.backgroundImage = `url(images/films-posters/${str}.jpg)`;
    } else {
      block.style.backgroundImage = "";
    }
  }
}



const video = document.querySelector('.preloader-video'),
  preloader = document.querySelector('.preloader'),
  volume = document.querySelector('.preloader-unmute');

const startFunction = () => {
  let marvelData = new MarvelData();
  marvelData.request();
  preloader.style.opacity = 0;
  setTimeout(() => {
    video.muted = true;
    preloader.classList.add('hidden');
  }, 800)
}
const once = fn => () => {
  if (!fn) return;
  const res = fn();
  fn = null;
  return res;
}
const startProgram = once(startFunction);

video.addEventListener('canplaythrough', () => {
  video.setAttribute('autoplay', true);
  let promise = video.play();
  if (promise !== undefined) {
    promise.then(_ => {
      // Autoplay started!
    }).catch(error => {
      console.error(`Ошибка воспроизведения ${error}`)
    });
  }
});

video.addEventListener('ended', () => {
  if (!preloader.classList.contains('hidden')) startProgram();
})

preloader.addEventListener('click', event => {
  const target = event.target;
  if (target === volume) {
    video.muted = !video.muted;
    volume.classList.toggle('unmuted');
  } else {
    startProgram();
  }
});
document.querySelector('body').addEventListener('keydown', event => {
  const key = event.key;
  if (key === "Escape" && !preloader.classList.contains('hidden')) {
    startProgram();
  }
});