import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

/*
  Generated class for the SystemProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

@Injectable({
  providedIn: 'root',
})

export class SystemService {
  public platform: number;
  public opcuaServerUri: string;
  public opcuaServerPfad: string;
  public customerId: number;
  public customerText: string;
  public shrinkMenu: boolean;
  public filterText: string;
  private products: any[] = [];

  // public opcuaServerUri:string  = "opc.tcp://192.168.178.124:49320/Kepware.KEPServerEX.V6";
  // public opcuaServerPfad:string = "Hebemittel.SPS";

  constructor(public http: HttpClient, public plt: Platform) {
    console.log('Hello SystemProvider Provider');

    this.platform = 0;
    this.opcuaServerUri = 'opc.tcp://172.16.9.150:4840';
    this.opcuaServerPfad = 'Application.VARVISU';
    this.customerId = 0;
    this.shrinkMenu = false;
    this.filterText = '';

    if (this.plt.is('ios')) {
      console.log('I\'m an iOS device!');
      this.platform = 2;
    }
    if (this.plt.is('android')) {
      console.log('I\'m an Android device!');
      this.platform = 1;
    }

  }

  setCustomerId(id: number) {
    this.customerId = id;
  }

  getCustomerId(): number {
    return this.customerId ;
  }

  setFilterText(filterText: string) {
    this.filterText = filterText;
  }

  getFilterText(): string {
    return this.filterText ;
  }

  addProduct(id: number, quantity: string, pvsid: string, articleno: string, designation: string) {
    let x = '';
    for (let i = 0, len = this.products.length; i < len; i++) {
      if (this.products[i].id == 0) {
      } else {
        if (this.products[i].id == id) {
          x = 'NOT';
        }
      }
    }
    if (x == '') {
      this.products.push({
        id: id,
        quantity: quantity,
        pvsid: pvsid,
        articleno: articleno,
        designation: designation
      });
    }
  }

  getProduct() {
    return  this.products.slice();
  }

  removeProduct(index: number) {
    this.products.splice(index, 1);
  }

  resetProduct() {
    this.products = [];
  }
}
