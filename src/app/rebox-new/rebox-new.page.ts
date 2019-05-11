/* import { Component, ɵConsole } from '@angular/core'; --DP-- */
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController,AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/api';
import { UserdataService } from '../services/userdata';

/**
 * Generated class for the ReboxNewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-rebox-new',
  templateUrl: './rebox-new.page.html',
  styleUrls: ['./rebox-new.page.scss'],
})
export class ReboxNewPage {
  public params: any;
  public edit: any = [];
  public anzRebox: any = 1;
  public Empfaenger: any = "info.lifting@brugg.com";
  public Copy: any = "";
  public GPS: any = 0;
  public rebox: any = [];
  public MsgHTML: any = "";
  public latitude: any;
  public longitude: any;
  public maxDate: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public translate: TranslateService,
              public userdata: UserdataService,
              private apiService: ApiService,
              public viewCtrl: ModalController,
              public alertCtrl : AlertController) {

                this.maxDate = this.apiService.maxDate;
                //this.translate.use(this.translate.defaultLang);

                //this.editMeine();  TODO
                this.rebox.ReBoxDate = new Date().toISOString().substring(0, 10);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReboxNewPage');
  }

/*   editMeine() {   TODO
    console.log(this.userdata);
    this.params = '{"id":' + this.userdata.id + ',"tabelle":"verantwortlicher"}';

    this.apiService.postData(JSON.parse(this.params), "on_obj_in_tabelle.php").then((result) => {
      this.edit = result["obj"];
    });
  }
 */
  dismiss() {
    this.viewCtrl.dismiss();
  }

  setGPS(gpsValue) {
    this.GPS = gpsValue;
  }

  sendRebox() {
    this.showConfirmAlert();    
  }

  showConfirmAlert() {
    console.log("Rebox Alert");
    let alert = this.alertCtrl.create({
        header: '',
        message: this.translate.instant('Möchten Sie eine ReBox verbindlich bestellen?'),
        buttons: [
            {
                text: this.translate.instant('nein'),
                handler: () => {
                    console.log('nein clicked');
                }
            },
            {
                text: this.translate.instant('ja'),
                handler: () => {
                  this.send();
                }
            }
        ]
    }).then(x=> x.present());
  }

  send() {
    console.log("send()");
    localStorage.setItem("ReBox_Str", this.rebox.Str);
    localStorage.setItem("ReBox_Ort", this.rebox.Ort);

    if(!this.latitude)
      this.latitude = "";
    if(!this.longitude)
      this.longitude = "";
    this.MsgHTML = '<h2>pvs2go.com - ReBox - Abholung</h2>';
    if (this.userdata.Type < 20) {
      this.MsgHTML += '<p>Beauftragt vom Brugg-Mitarbeiter: ' + this.userdata.Name + ', ' + this.userdata.Vorname + ' (' + this.userdata.eMail + ')</p>';
      this.MsgHTML += '<p>Firma: ' + this.rebox.Firma + '</p>';
      this.MsgHTML += '<p>Notiz: ' + this.rebox.Notiz + '</p>';
    } else {
      this.MsgHTML += '<p>Beauftragt vom Kunde: ' + this.userdata.Name + ', ' + this.userdata.Vorname + ' (' + this.userdata.eMail + ')<br>';
      this.MsgHTML += 'Firma:' + this.rebox.Firma + ')</p>';
    }
    if (this.GPS == 0) {
      this.MsgHTML += '<h2>Adresse für die Abholung</h2>';
      this.MsgHTML += '<p>Strasse: ' + this.rebox.Str + '<br>';
      this.MsgHTML += 'PLZ Ort: ' + this.rebox.Ort + '<br>';
      this.MsgHTML += 'Anzahl: ' + this.rebox.anzRebox + '<br></p>';
    } else {
      this.MsgHTML += '<h2>Positionsdaten für die Abholung</h2>';
      this.MsgHTML += '<p>Position: <a href="http://www.google.com/maps/place/' + this.latitude + ',' + this.longitude + '">' + this.latitude + ',' + this.longitude + '</a><br>';
      this.MsgHTML += 'Anzahl: ' + this.rebox.anzRebox + '<br></p>';
    }
    let userInfo = {"Begrenzt": this.userdata.Begrenzt,"eMail":this.userdata.eMail,"Extras":this.userdata.Extras,"id":this.userdata.id,"Name": this.userdata.Name,"OpcUa": this.userdata.OpcUa,"Prueferservice": this.userdata.Prueferservice ,"token": this.userdata.token,"Type":this.userdata.Type,"Vorname":this.userdata.Vorname};
    this.params = {"MsgHTML":this.MsgHTML,"latitude": this.latitude,"longitude": this.longitude,"UserInfo": JSON.stringify(userInfo),"Betreff":"pvs2go.com - ReBox - Abholung","ReBoxDate":this.rebox.ReBoxDate,"Copy": this.Copy,"Empfaenger": this.Empfaenger};

    this.apiService.pvs4_set_rebox_pickup(this.params).then((result: any) => {

          if (result == 1) {
            //OK
            let alert = this.alertCtrl.create({
              header: '',
              message: this.translate.instant('Die Nachricht wurde erfolgreich versendet.'),
              buttons: [
                  {
                      text: this.translate.instant('okay'),
                      handler: () => {
                          console.log('okay clicked');
                      }
                  }
              ]
          }).then(x=> x.present());
          } else {
            //NOK
            let alert = this.alertCtrl.create({
              header: '',
              message: this.translate.instant('Die Nachricht konnte nicht versandt werden!'),
              buttons: [
                  {
                      text: this.translate.instant('okay'),
                      handler: () => {
                          console.log('okay clicked');
                      }
                  }
              ]
          }).then(x=> x.present());
           
          } 
      this.dismiss();
    });
  }
  
}
