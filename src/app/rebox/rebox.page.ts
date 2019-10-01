import { Component,OnInit } from '@angular/core';
import { NavController, ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/api';
import { UserdataService } from '../services/userdata';
import { SystemService } from '../services/system';
import { TreeNode } from 'primeng/api';

/**
 * Generated class for the ReboxPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-rebox',
  templateUrl: './rebox.page.html',
  styleUrls: ['./rebox.page.scss'],
})

export class ReboxPage implements OnInit {
  public params: any;
  public edit: any = [];
  public anzRebox: any = 1;
  public Empfaenger: any = 'info.lifting@brugg.com';
  public Copy: any = '';
  public GPS: any = 0;
  public rebox: any = [];
  public MsgHTML: any = '';
  public latitude: any;
  public longitude: any;
  public maxDate: string;
  public platform_version: number;
  public inputError: boolean = false;
  public listCustomer: any[] = [];
  public customer: any = {};
  public pickUpValue = "";
  public pickUpOptions: any[] = [
    this.translate.instant('Hol dir die volle ReBox'),
    this.translate.instant('Fordern Sie leere ReBox'),
    this.translate.instant('Senden Sie selbst eine vollständige ReBox')];

  constructor(public navCtrl: NavController, 
              public translate: TranslateService,
              public userdata: UserdataService,
              public system: SystemService,
              private apiService: ApiService,
              public viewCtrl: ModalController,
              public alertCtrl: AlertController) {
                console.log("ReBox load");
                this.platform_version = this.system.platform;
                this.maxDate = this.apiService.maxDate;
                // this.translate.use(this.translate.defaultLang);

                // this.editMeine();  TODO
                this.rebox.Firma = '';
                this.rebox.ReBoxDate = '';
                this.rebox.Str = '';
                this.rebox.Ort = '';
                this.rebox.latitude = '';
                this.rebox.Notiz = '';
                this.anzRebox = 1;
                this.rebox.ReBoxDate = new Date().toISOString().substring(0, 10);
  }

  ngOnInit()
  {
    this.loadCustomer();
  }

  loadCustomer() {
    this.apiService.pvs4_get_customer_list(0).then((result: any) => {
        this.listCustomer = [];
        this.data_tree(result.list);
        console.log("Load Customer");
    });
  }

  data_tree(nodes: TreeNode[]): any {
    for (let i = 0; i < nodes.length; i++) {
      let obj = nodes[i].data;
      this.listCustomer.push(obj);
      if (nodes[i].children && nodes[i].children.length > 0) {
        this.data_tree(nodes[i].children);
      }
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  setGPS(gpsValue) {
    this.GPS = gpsValue;
  }

  sendRebox() {
    this.showConfirmAlert();
  }

  anzReboxMinus() {
    if (this.anzRebox < 2) {
      this.anzRebox = 1;
    } else {
      this.anzRebox--;
    }
  }

  anzReboxAdd() {
    this.anzRebox++;
  }

  showConfirmAlert() {
    console.log('Rebox Alert');
   /*  this.inputError = false;
    if (this.rebox.Firma == '') {
      this.inputError = true;
      return;
    }
    if (this.rebox.ReBoxDate == '') {
      this.inputError = true;
      return;
    }
    if (this.rebox.Str == '') {
      this.inputError = true;
      return;
    }
    if (this.rebox.Ort == '') {
      this.inputError = true;
      return;
    }
    if (this.rebox.latitude == '') {
      this.inputError = true;
      return;
    }
    if (this.rebox.Notiz == '') {
      this.inputError = true;
      return;
    } */

    let alert = this.alertCtrl.create({
        header: this.translate.instant('Achtung'),
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
    }).then(x => x.present());
  }

  send() {
    console.log('send()');
    localStorage.setItem('ReBox_Str', this.rebox.Str);
    localStorage.setItem('ReBox_Ort', this.rebox.Ort);
    if(this.customer.company)
    {
      this.rebox.Firma = this.customer.company;
    }
    if (!this.latitude) {
      this.latitude = '';
    }
    if (!this.longitude) {
      this.longitude = '';
    }
    this.MsgHTML = '<h2>pvs2go.com - ReBox - Abholung</h2>';
    if (this.userdata.Type < 20) {
      this.MsgHTML += '<p>Beauftragt vom Brugg-Mitarbeiter: ' + this.userdata.Name + ', ' + this.userdata.Vorname + ' (' + this.userdata.eMail + ')</p>';
      this.MsgHTML += '<p>Firma: ' + this.rebox.Firma + '- DB-ID: '+ this.customer.id + '- #:' + this.customer.customer_number +'</p>';
      this.MsgHTML += '<p>Notiz: ' + this.rebox.Notiz + '</p>';
    } else {
      this.MsgHTML += '<p>Beauftragt vom Kunde: ' + this.userdata.Name + ', ' + this.userdata.Vorname + ' (' + this.userdata.eMail + ')<br>';
      this.MsgHTML += '<p>Firma: ' + this.rebox.Firma + '- DB-ID: '+ this.customer.id + '- #:' + this.customer.customer_number +'</p>';
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
    this.MsgHTML += 'Wahl der Abholung: ' + this.pickUpValue + '<br></p>';
    
    let userInfo = {'Begrenzt': this.userdata.Begrenzt, 'eMail': this.userdata.eMail, 'Extras': this.userdata.Extras, 'id': this.userdata.id, 'Name': this.userdata.Name, 'OpcUa': this.userdata.OpcUa, 'Prueferservice': this.userdata.Prueferservice , 'token': this.userdata.token, 'Type': this.userdata.Type, 'Vorname': this.userdata.Vorname};
    this.params = {'MsgHTML': this.MsgHTML, 'latitude': this.latitude, 'longitude': this.longitude, 'UserInfo': JSON.stringify(userInfo), 'Betreff': 'pvs2go.com - ReBox - Abholung', 'ReBoxDate': this.rebox.ReBoxDate, 'Copy': this.Copy, 'Empfaenger': this.Empfaenger};

    this.apiService.pvs4_set_rebox_pickup(this.params).then((result: any) => {

          if (result == 1) {
            // OK
            let alert = this.alertCtrl.create({
              header: this.translate.instant('information'),
              message: this.translate.instant('Die Nachricht wurde erfolgreich versendet.'),
              buttons: [
                  {
                      text: this.translate.instant('okay'),
                      handler: () => {
                          console.log('okay clicked');
                      }
                  }
              ]
          }).then(x => x.present());
          } else {
            // NOK
            let alert = this.alertCtrl.create({
              header: this.translate.instant('information'),
              message: this.translate.instant('Die Nachricht konnte nicht versandt werden!'),
              buttons: [
                  {
                      text: this.translate.instant('okay'),
                      handler: () => {
                          console.log('okay clicked');
                      }
                  }
              ]
          }).then(x => x.present());

          }
      this.dismiss();
    });
  }

  inputErrorMsg() {
    this.inputError = false;
  }

}
