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

  // заполняем не установленные фильтры
  fillSelects(selects) {
    for (let key in this.filters) {
      if (this.filters[key] === 'all') {
        this.addOptions(selects[key], `#${key}`);
      }
    }
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
  // очищаем селект, оставляем дефолтное значение
  clearOptions(selector) {
    const block = document.querySelector(selector);
    block.options.selectedIndex = 0;
    for (let i = block.options.length - 1; i > 0; i--) {
      block.options[i].remove();
    }
  }

  // отрисовываем карточку
  renderCard(obj) {
    const wrapper = document.querySelector('.cards-wrapper');
    const card = document.createElement('div');
    let htmlString;
    card.className = "card";
    wrapper.appendChild(card);
    htmlString = `<img src="images/${obj.photo}" alt="${obj.name}">
      <ul><li><h3>${obj.name}</h3></li>`;
    if (obj.realName) htmlString += `<li>Имя: ${obj.realName}</li>`;
    htmlString += `<li>Пол: ${obj.gender}</li>`;
    if (obj.species) htmlString += `<li>Раса: ${obj.species}</li>`;
    if (obj.citizenship) htmlString += `<li>Гражданство: ${obj.citizenship}</li>`;
    if (obj.birthDay) htmlString += `<li>Год рождения: ${obj.birthDay}</li>`;
    htmlString += `<li>Статус: ${obj.status} `;
    if (obj.deathDay) htmlString += `(${obj.deathDay})`;
    htmlString += '</li>';
    htmlString += `<li>${obj.gender === 'male' ? 'Актер' : 'Актриса'}: ${obj.actors}</li>`;
    if (obj.movies) {
      htmlString += `<li>Фильмы: <ul>`;
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
    selects.addEventListener('change', event => {
      const target = event.target;
      // установлен фильтр не по фильмам и фильтр ранее не применялся
      if (target.name !== 'movies' && this.filters[target.name] === 'all') {
        this.applyFilter(target);
        this.renderCards();
      } else if (target.name === 'movies' && this.filters[target.name] === 'all') {
        // установлен фильтр по фильмам, ранее он не применялся
        this.applyFilterMovie(target);
        this.renderCards();
      } else {
        // фильтр ранее применялся - требуется вновь применить все фильтры
        this.filters[target.name] = target.value;
        this.applyAllFilters();
      }

    });
    resetBtn.addEventListener('click', this.reset.bind(this));
  }
  // применяем новый фильтр (кроме фильмов)
  applyFilter(target) {
    this.currentData = this.currentData.filter(item => {
      if (!item[target.name]) return false;
      return item[target.name].toLowerCase() === target.value.toLowerCase()
    });
    this.filters[target.name] = target.value;
  }
  // применяем фильтр по фильмам
  applyFilterMovie(target) {
    this.currentData = this.currentData.filter(item => {
      if (!item[target.name]) return false;
      return item[target.name].includes(target.value);
    });
    this.filters.movies = target.value;
  }

  // вызов очистки всех селектов
  clearSelects() {
    for (let key in this.filters) {
      this.clearOptions(`#${key}`)
    }
  }

  // применяем все фильтры снова
  applyAllFilters() {
    this.wipeData();
    for (let key in this.filters) {
      if (this.filters[key] !== 'all') {
        if (key !== 'movies') {
          this.applyFilter(document.getElementById(key))
        } else {
          this.applyFilterMovie(document.getElementById('movies'))
        }
      }
    }
    this.renderCards();
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
}



const video = document.querySelector('.preloader-video'),
  preloader = document.querySelector('.preloader'),
  volume = document.querySelector('.preloader-unmute');

const startProgram = () => {
  let marvelData = new MarvelData();
  marvelData.request();
  preloader.style.opacity = 0;
  setTimeout(() => {
    video.muted = true;
    preloader.classList.add('hidden');
  }, 800)
}
video.addEventListener('canplaythrough', ()=>{
  video.setAttribute('autoplay', true);
  let promise = video.play();
  if (promise !== undefined) {
    promise.then(_ => {
      // Autoplay started!
    }).catch(error => {
      console.error(`Ошибка воспроизведения ${error}`)
      // Autoplay was prevented.
      // Show a "Play" button so that user can start playback.
    });
  }
});
video.addEventListener('ended', ()=>{
  startProgram();
})
preloader.addEventListener('click', event => {
  const target = event.target;
  if (target === volume) {
    video.muted = !video.muted;
    volume.classList.toggle('unmuted');
  } else {
    startProgram();
  }
})
document.querySelector('body').addEventListener('keydown', event => {
  const target = event.key;
  if (target === "Escape") {
    startProgram();
  };
})