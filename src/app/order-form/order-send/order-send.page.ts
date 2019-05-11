import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata';
import { ApiService } from '../../services/api';
import { ofroot } from '../order-form-root';

/**
 * Generated class for the OrderSendPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-order-send',
  templateUrl: './order-send.page.html',
  styleUrls: ['./order-send.page.scss'],
})
export class OrderSendPage {
  public Ziel_DropDown: any = "0";
  public Empfaenger: any;
  public LA_Ansp: any;
  public LA_Firma: any;
  public LA_Email: any;
  public LA_Name: any;
  public LA_Abteilung: any;
  public LA_Str: any;
  public LA_PLZ_ORT: any;
  public aktiverKunde: any = [];
  public RE_Ansp: any;
  public bestDatum: any;
  public bestTermin: any;
  public aktiverAnsprechpartnerListe: any = [];
  public LA_DropDown: any;
  public RE_Kundennummer: any;
  public RE_Firma: any;
  public RE_Email: any;
  public RE_Str: any;
  public RE_PLZ_ORT: any;
  public Notiz: any;
  public beibehaltenID: any;
  public Betreff: any;
  public params: any;
  public maxDate: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public viewCtrl: ModalController,
              public userdata: UserdataService,
              public translate: TranslateService,
              public apiService: ApiService,
              public alertCtrl: AlertController,
              public rs: ofroot) {

                this.maxDate = this.apiService.maxDate; 
                //this.translate.use(this.translate.defaultLang);
                this.aktiverKunde = this.navParams.get("aktiverKunde");
                this.bestDatum = new Date().toISOString();
                this.bestTermin = new Date();
                this.bestTermin.setDate(this.bestTermin.getDate() + 7);
                this.bestTermin = this.bestTermin.toISOString();
                this.LA_DropDown = "0";    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderSendPage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  changeAim() {
    if (this.Ziel_DropDown == 1) {
      this.Empfaenger = 'info.lifting@brugg.com';
      if (this.userdata.Type < 20) {
        if (this.userdata.id == 105) this.Empfaenger = 'vente.lifting@brugg.com';
        if (this.userdata.id == 51970) this.Empfaenger = 'vente.lifting@brugg.com';
        if (this.userdata.id == 51995) this.Empfaenger = 'vente.lifting@brugg.com';
      } else {
        if (this.aktiverKunde.Verantwortlicher_idAusendienster == 105) this.Empfaenger = 'vente.lifting@brugg.com';
        if (this.aktiverKunde.Verantwortlicher_idAusendienster == 51970) this.Empfaenger = 'vente.lifting@brugg.com';
        if (this.aktiverKunde.Verantwortlicher_idAusendienster == 51995) this.Empfaenger = 'vente.lifting@brugg.com';
        if (this.aktiverKunde.Verantwortlicher_idPruefer == 105) this.Empfaenger = 'vente.lifting@brugg.com';
        if (this.aktiverKunde.Verantwortlicher_idPruefer == 51970) this.Empfaenger = 'vente.lifting@brugg.com';
        if (this.aktiverKunde.Verantwortlicher_idPruefer == 51995) this.Empfaenger = 'vente.lifting@brugg.com';
      }
    }
    if (this.Ziel_DropDown == 2) {
      this.Empfaenger = this.RE_Ansp;
      this.LA_Ansp = 0;
      this.LA_Firma = "";
      this.LA_Email = "";
      this.LA_Name = "";
      this.LA_Abteilung = "";
      this.LA_Str = "";
      this.LA_PLZ_ORT = "";
    }
  }

  send() {
    console.log("send()");
    var ui = {
      Begrenzt:this.userdata.Begrenzt,
      eMail	: this.userdata.eMail,
      Extras: this.userdata.Extras,
      id:this.userdata.id,
      Name:this.userdata.Name,
      OpcUa	: this.userdata.OpcUa,
      Prueferservice	:this.userdata.Prueferservice,
      token	: this.userdata.token,
      Type	:this.userdata.Type,
      Vorname : this.userdata.Vorname
    };

    this.params = {
      bestellungen: this.rs.bestellungen,
      offerten: this.rs.offerten,
      pruefungen: this.rs.pruefungen,
      latitude: this.rs.latitude,
      longitude: this.rs.longitude,
      UserInfo: ui,
      Ziel_DropDown: this.Ziel_DropDown,
      LA_DropDown: this.LA_DropDown,
      RE_Ansp: this.RE_Ansp,
      RE_Kundennummer: this.RE_Kundennummer,
      RE_Firma: this.RE_Firma,
      RE_Email: this.RE_Email,
      RE_Str: this.RE_Str,
      RE_PLZ_ORT: this.RE_PLZ_ORT,
      LA_Ansp: this.LA_Ansp,
      LA_Firma: this.LA_Firma,
      LA_Email: this.LA_Email,
      LA_Name: this.LA_Name,
      LA_Abteilung: this.LA_Abteilung,
      LA_Str: this.LA_Str,
      LA_PLZ_ORT: this.LA_PLZ_ORT,
      Empfaenger: this.Empfaenger,
      Notiz: this.Notiz,
      bestDatum: this.bestDatum,
      bestTermin: this.bestTermin,
      beibehaltenID: this.beibehaltenID,
      Betreff: this.Betreff
    };
    console.log(this.params);
    
    console.log(JSON.stringify(this.params));
    this.apiService.pvs4_set_orders_send(this.params).then((result: any) => {
      console.log("pvs4_set_orders_send :", result);
      if (result != null) {
        if (result["status"] == 1) {
          //OK
          this.rs.anz_wahrenkorb = 0;
          this.rs.offerten = new Array();
          this.rs.bestellungen = new Array();
          this.rs.pruefungen = new Array();
          this.rs.bestellungenIndex = 0;
          let alert = this.alertCtrl.create({ header: "Lucky day", 
                                              message: this.translate.instant("Die Nachricht wurde erfolgreich versendet.") }).then(x=> x.present());
          this.viewCtrl.dismiss();
        } else {
          //NOK
          console.log('set_orders_send.php NOK:', result);
          let alert = this.alertCtrl.create({ header: "Lucky day",  
                                              message: this.translate.instant("Die Nachricht konnte nicht versandt werden!") }).then(x=> x.present());
          this.viewCtrl.dismiss();
        }
      } else {
        //NOK
        console.log('set_orders_send.php NOK:', result);
        let alert = this.alertCtrl.create({ header: "Lucky day", message: this.translate.instant("Die Nachricht konnte nicht versandt werden!") }).then(x=> x.present());
        this.viewCtrl.dismiss();
      }
    });    
  }

}



