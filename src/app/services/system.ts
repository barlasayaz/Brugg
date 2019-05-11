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
  public platform:number = 0;
  public opcuaServerUri:string  = "opc.tcp://172.16.9.150:4840";
  public opcuaServerPfad:string = "Application.VARVISU";
  public currentCustomer:number = 0;

  //public opcuaServerUri:string  = "opc.tcp://192.168.178.124:49320/Kepware.KEPServerEX.V6";
  //public opcuaServerPfad:string = "Hebemittel.SPS"; 
  
  constructor(public http: HttpClient, public plt: Platform) {
    console.log('Hello SystemProvider Provider');

    if (this.plt.is('ios')) {
      console.log("I'm an iOS device!");
      this.platform = 2;
    }
    if (this.plt.is('android')) {
      console.log("I'm an Android device!");
      this.platform = 1;
    }

  }



}
