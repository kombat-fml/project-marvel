'use strict';

const jsonUrl = './dbHeroes.json';

class MarvelData {
  constructor() {
    this.currentData = [];
    this.fullData = [];
    this.genderOptions = new Set();
    this.citizenshipOptions = new Set();
    this.statusOptions = new Set();
    this.moviesOptions = new Set();
    this.speciesOptions = new Set();
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
  }
  processingData() {
    this.fullData.forEach((item) => {
      if (item.gender) this.genderOptions.add(item.gender.toLowerCase());
      if (item.citizenship) this.citizenshipOptions.add(item.citizenship.toLowerCase());
      this.statusOptions.add(item.status);
      if (item.species) this.speciesOptions.add(item.species);
      if (item.movies) item.movies.map(item => this.moviesOptions.add(item));

    })
    console.log(this.genderOptions);
    console.log(this.citizenshipOptions);
    console.log(this.statusOptions);
    console.log(this.speciesOptions);
    console.log(this.moviesOptions);
  }
  addOptions(data, selector) {
  }
  renderCard(obj) {
    console.log(obj);
  }
}

let marvelData = new MarvelData();
marvelData.request();