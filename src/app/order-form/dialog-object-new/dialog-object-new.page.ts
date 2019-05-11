/* import { Component, Injectable } from '@angular/core'; --DP-- */
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController ,Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ofroot } from '../order-form-root';

/**
 * Generated class for the DialogObjectNewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-dialog-object-new',
  templateUrl: './dialog-object-new.page.html',
  styleUrls: ['./dialog-object-new.page.scss'],
})
export class DialogObjectNewPage {
  public ArtikelNr: any ="";
  public Beschreibung: any ="";
  public Menge: any = 1;
  public pfelder: any = 0;
  public objektNeuWas: any = 0;
  public Index: any = 0;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public translate : TranslateService,
              public viewCtrl: ModalController,
              public events:Events,
              public rs: ofroot) {
                //this.translate.use(this.translate.defaultLang);
    if (this.navParams.get("value")!=null) {
        this.objektNeuWas = this.navParams.get("objektNeuWas");
             this.ArtikelNr=   this.navParams.get("value")["id"];
             this.Beschreibung= this.navParams.get("value")["text"];
             this.Menge=this.navParams.get("value")["anz"];
             this.Index=this.navParams.get("value")["index"];
    } else {
        this.pfelder = this.navParams.get("pfelder");
        this.Menge = this.navParams.get("menge");
        this.objektNeuWas = this.navParams.get("objektNeuWas");
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DialogObjectNewPage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
    }

  objectNew(){
  console.log("neue :"+this.pfelder);
    if(this.pfelder==0){         
        console.log(this.objektNeuWas);
        if(this.objektNeuWas==1){
          this.rs.bestellungen.push({id:this.ArtikelNr, text:this.Beschreibung, index:this.rs.bestellungenIndex, anz:this.Menge});
          this.rs.bestellungenIndex++;
          console.log(this.rs.bestellungen);
        }
        if(this.objektNeuWas==2){
          this.rs.offerten.push({id:this.ArtikelNr, text:this.Beschreibung, index:this.rs.bestellungenIndex, anz:this.Menge});
          this.rs.bestellungenIndex++;
          console.log(this.rs.bestellungen);
        }
        if(this.objektNeuWas==3){
          this.rs.pruefungen.push({id:this.ArtikelNr, text:this.Beschreibung, index:this.rs.bestellungenIndex, anz:this.Menge});
          this.rs.bestellungenIndex++;
          console.log(this.rs.bestellungen);
        }
        this.rs.anz_wahrenkorb=1;
        this.dismiss();
    }
    this.rs.anz_wahrenkorb = this.rs.bestellungen.length + this.rs.offerten.length + this.rs.pruefungen.length ;
    this.events.publish("anz_wahrenkorb", this.rs.anz_wahrenkorb);

  }
 
  objectEdit(){
    console.log("edit :"+this.pfelder);
      if(this.pfelder==0){
          if(this.objektNeuWas==11){
              for(let i=0; i< this.rs.bestellungen.length; i++){
                  if(this.rs.bestellungen[i].index== this.Index ){
                    this.rs.bestellungen[i].id = this.ArtikelNr;
                    this.rs.bestellungen[i].text = this.Beschreibung;
                    this.rs.bestellungen[i].anz = this.Menge;
                  }
              } 
          }
          if(this.objektNeuWas==12){
              for(let i=0; i< this.rs.offerten.length; i++){
                  if(this.rs.offerten[i].index== this.Index ){
                    this.rs.offerten[i].id = this.ArtikelNr;
                    this.rs.offerten[i].text = this.Beschreibung;
                    this.rs.offerten[i].anz = this.Menge;
                  }
              } 
          }
          this.dismiss();
      }
      this.rs.anz_wahrenkorb = this.rs.bestellungen.length + this.rs.offerten.length + this.rs.pruefungen.length ;
  }    

  dialogObjectNewTest() {
      if(this.ArtikelNr=="") {
        this.pfelder = 1;
        return
    }
    if(this.Beschreibung=="") {
        this.pfelder = 1;
        return
    }
    var x = parseInt(this.Menge);
    if(isNaN(x)) {
        this.pfelder = 1;
        return
    }
    this.pfelder = 0; 
  }

}

