'use strict';

const jsonUrl = './dbHeroes.json';

class MarvelData {
  constructor() {
    this.currentData = [];
    this.fullData = [];
    this.filters = {
      name: 'all',
      gender: 'all',
      citizenship: 'all',
      species: 'all',
      status: 'all',
      movie: 'all',
    }
    this.orders = {
      name: 'none',
      gender: 'none',
      citizenship: 'none',
      species: 'none',
      status: 'none',
      movie: 'none',
    }
    this.name = new Set();
    this.gender = new Set();
    this.citizenship = new Set();
    this.status = new Set();
    this.movies = new Set();
    this.species = new Set();
  }

  wipeFilters() {
    this.filters = {
      name: 'all',
      gender: 'all',
      citizenship: 'all',
      species: 'all',
      status: 'all',
      movie: 'all',
    }
  }

  wipeData() {
    this.currentData = this.fullData;
  }

  request() {
    fetch(jsonUrl)
      .then(response => response.json())
      .then(result => this.addData(result));
  }

  addData(data) {
    this.fullData = data;
    this.wipeData();
    this.processingData();
    this.renderCards();
    this.fillSelects();
    this.addlisteners();
  }

  renderCards() {
    document.querySelector('.cards-wrapper').textContent = '';
    this.currentData.forEach((item) => this.renderCard(item))
  }

  processingData() {
    this.currentData.forEach((item) => {
      this.name.add(item.name);
      if (item.gender) this.gender.add(item.gender.toLowerCase());
      if (item.citizenship) this.citizenship.add(item.citizenship.toLowerCase());
      this.status.add(item.status);
      if (item.species) this.species.add(item.species);
      if (item.movies) item.movies.map(item => this.movies.add(item));
      this.renderCard(item);
    })
  }

  fillSelects() {
    this.addOptions(this.name, '#name');
    this.addOptions(this.gender, '#gender');
    this.addOptions(this.citizenship, '#citizenship');
    this.addOptions(this.status, '#status');
    this.addOptions(this.species, '#species');
    this.addOptions(this.movies, '#movies');
  }
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
    const selects = document.querySelector('.selects');
    selects.addEventListener('change', event => {
      const target = event.target;
      if (target.name !== 'movies' && target.value !== this.filters[target.name]) {
        this.applyFilter(target);
      } else {
        if (target.name === 'movies' && target.value !== this.filters[target.name]) {
          this.applyFilterMovie(target)
        } else {
          // возвращаем исходные данные и применяем выбранные фильтры вновь

        }
      }
    })
  }
  applyFilter(target) {
    this.currentData = this.currentData.filter(item => {
      if (!item[target.name]) return false;
      return item[target.name].toLowerCase() === target.value.toLowerCase()
    });
    this.renderCards();
  }
  applyFilterMovie(target) {
    this.currentData = this.currentData.filter(item => {
      if (!item[target.name]) return false;
      return item[target.name].includes(target.value);
    });
    console.log(this.currentData);
    this.renderCards();
  }
}

let marvelData = new MarvelData();
marvelData.request();