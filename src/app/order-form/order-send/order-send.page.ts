import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController,LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata';
import { ApiService } from '../../services/api';

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
export class OrderSendPage implements OnInit {
  public inputError: boolean = false;
  public Ziel_DropDown: any = '0';
  public Empfaenger: string = '';
  public idCustomer: number;
  public RE_Ansp: any = {};
  public Betreff: string = '';
  public params: any = [];
  public Copy: string = '';
  public contactPersonList: any = [];
  public contactPerson: any = [];
  public contactPersonAddresses: any = [];
  public contactPersonAddr: any = [];
  public company = '';
  public activOrderForm: any = {};
  public pdfRetVal: any;
  public email_felder: any = 0;

  constructor(public navCtrl: NavController, 
              public userdata: UserdataService,
              public translate: TranslateService,
              public apiProvider: ApiService,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController,
              public loadingCtrl: LoadingController) {
  }

  ngOnInit()
  {
    this.getContactList();
    this.Copy = this.userdata.email;
    this.Betreff = 'Brugg Drahtseil: ' +  this.company;
    console.log('activOrderForm :', this.activOrderForm);
    // console.log('order-send pdfRetVal :', this.pdfRetVal);
  }

  dismiss() {
    this.modalCtrl.dismiss(false);
  }

  changeAnsp() {
    console.log('changeReAnsp :', this.RE_Ansp);
    this.inputError = false;
    this.Empfaenger = this.RE_Ansp.email;
  }

  getContactList() {
    console.log('getContactList :', this.idCustomer);
    this.contactPersonAddresses = [];
    this.contactPersonAddr = [];
    this.apiProvider.pvs4_get_contact_person(this.idCustomer).then((result: any) => {
      console.log('getPointContact result', result.list);

      for (var i = 0, len = result.list.length; i < len; i++) {
        var item = result.list[i].data;
        try {
          item.addresses = JSON.parse(item.addresses);
        } catch {
           console.error('JSON.parse err', item.addresses) ;
        }
        this.contactPersonList.push(item);
      }
    });
  }

  changeAim() {
    if (this.Ziel_DropDown == 0) {
      this.Empfaenger = '';
    }
    if (this.Ziel_DropDown == 1) {
      this.Empfaenger = 'info.lifting@brugg.com';
    }
    if (this.Ziel_DropDown == 2) {
      this.Empfaenger = '';
      this.RE_Ansp = '';
    }
    if (this.Ziel_DropDown == 3) {
      this.Empfaenger = 'vente.lifting@brugg.com';
    }
  }

  async send() {
    console.log('send()');

    this.inputError = false;
    this.email_felder = 0;
    if (this.Betreff == '') {   // Subject
      this.inputError = true;
      return;
    }
    if (this.Empfaenger == '') {  // To
      this.inputError = true;
      return;
    }
    if (this.Copy == '') {  // Cc
      this.inputError = true;
      return;
    }
    if (this.Ziel_DropDown == 2 && this.RE_Ansp == '') {  // person contact
      this.inputError = true;
      return;
    }
    if (this.validateEmail(this.Empfaenger) == false) {  // To
      this.inputError = false;
      this.email_felder = 1;
      return;
    }
    if (this.validateEmail(this.Copy) == false) { // Cc
      this.inputError = false;
      this.email_felder = 1;
      return;
    }

    let loader = await this.loadingCtrl.create({
      message: this.translate.instant('Bitte warten')
    });

    loader.present();
    this.params = {
          Ziel_DropDown: this.Ziel_DropDown,
          RE_Ansp: this.RE_Ansp,
          Betreff: this.Betreff,
          Empfaenger: this.Empfaenger,
          Copy: this.Copy,
          pdfBase64: this.pdfRetVal,
          UserVorname: this.userdata.first_name,
          UserName: this.userdata.last_name,
          UserEmail: this.userdata.email,
          Type: this.userdata.licensee
    };

    if (this.Ziel_DropDown == 2) {
      this.params.Type = 0;
    }
    console.log('params :', this.params);

    console.log(JSON.stringify(this.params));
    this.apiProvider.pvs4_set_orders_send(this.params).then(async (result: any) => {
      console.log('pvs4_set_orders_send :', result);
      if (result != null) {
        if (result['status'] == 1) {
          // OK
          let alert = await this.alertCtrl.create({ header: this.translate.instant('information'),
              message: this.translate.instant('Die Nachricht wurde erfolgreich versendet.'),
              buttons: [
                {
                  text: this.translate.instant('okay'),
                  handler: () => {

                  }
                }
              ]
          });
          loader.dismiss();
          alert.present();
          this.modalCtrl.dismiss(true);
        } else {
          // NOK
          console.log('set_orders_send.php NOK:', result);
          let alert = await this.alertCtrl.create({ header: this.translate.instant('information'),
                                              message: this.translate.instant('Die Nachricht konnte nicht versandt werden!'),
                                              buttons: [
                                                {
                                                  text: this.translate.instant('okay'),
                                                  handler: () => {

                                                  }
                                                }
                                              ]
          });
          loader.dismiss();
          alert.present();
          this.modalCtrl.dismiss(false);
        }
      } else {
        // NOK
        console.log('set_orders_send.php NOK:', result);
        let alert = await this.alertCtrl.create({ header: this.translate.instant('information'),
                                            message: this.translate.instant('Die Nachricht konnte nicht versandt werden!'),
                                            buttons: [
                                              {
                                                text: this.translate.instant('okay'),
                                                handler: () => {

                                                }
                                              }
                                            ]
        });
        alert.present();
        this.modalCtrl.dismiss(false);
      }
    });
  }

  inputErrorMsg() {
    this.inputError = false;
    this.email_felder = 0;
  }

  validateEmail(email) {
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(email) == false) {
        return (false);
    } else {
        return (true);
    }
  }

}
