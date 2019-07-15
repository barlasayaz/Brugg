import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private data = [];

  constructor() { }

  setData(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }
}