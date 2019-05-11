import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata';
import { ApiService } from '../../services/api';

/**
 * Generated class for the ContactPersonPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'app-contact-person',
    templateUrl: './contact-person.page.html',
    styleUrls: ['./contact-person.page.scss'],
})
export class ContactPersonPage {
  public idCustomer: any;
  public contactPersonEdit: any = [];
  public kundendaten: any = "person";
  public contactPersonEditOderNeu = 1; // 0>bearbeiten 1>neu   
  public contactPersonList: any = [];  
  public params: any;
  public pfelder: any = 0;
  public fehler: boolean = false;
  public email_felder: any = 0;
  public pw_felder: any = 0;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,              
              public translate: TranslateService,
              public userdata: UserdataService,
              public apiService: ApiService,
              private alertCtrl: AlertController,
              public viewCtrl: ModalController) {

        this.idCustomer = this.navParams.get("idCustomer");
        this.getPointContact();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactPersonPage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getPointContact() {
    console.log("getPointContact :", this.idCustomer);  
    this.apiService.pvs4_get_contact_person(this.idCustomer).then((result:any) => {
        console.log('getPointContact result', result.list);  
        for (var i = 0, len = result.list.length; i < len; i++) {
            var item = result.list[i].data;
            item.addresses = JSON.parse(item.addresses);
            this.contactPersonList.push(item);
        }
    });
  }

   updateData(recType) {
      this.pfelder = 0;
      this.fehler = true;
      this.email_felder = 0;
      this.pw_felder = 1;
      console.log("contactPersonEdit :", this.contactPersonEdit, this.contactPersonEdit.length);
      if (this.contactPersonEdit) {
        if (this.contactPersonEdit.last_name) {
            this.pw_felder = 0;
        }
        else {
            this.pw_felder = 1;
            this.pfelder = 1;
            return;
        }
        if (this.contactPersonEdit.first_name) {
            this.pw_felder = 0;
        }
        else {
            this.pw_felder = 1;
            this.pfelder = 1;
            return;
        }
        if (this.contactPersonEdit.email) {
            this.pw_felder = 0;
            if (this.validateEmail(this.contactPersonEdit.email) == false) {
                this.fehler = true;
                this.email_felder = 1;
                return;
            }            
        }
        else {
            this.pw_felder = 1;
            this.pfelder = 1;
            return;
        }       
      }
      if (this.pw_felder == 0) {
        let obj = {id: 0,
                    email: "",
                    first_name: "",
                    last_name: "",
                    customer: this.idCustomer,
                    addresses: '[{"address":"", "zipcode":"", "department":"", "email":"", "phone":"", "mobile":""}]',
                    department: "",
                    active: 1};

        if(recType == 0) {
            if (this.contactPersonEdit["id"]) obj.id = 0;
        }
        if(recType == 1) {
            if (this.contactPersonEdit["id"]) obj.id = this.contactPersonEdit["id"];
        }    
        if (this.contactPersonEdit["email"]) obj.email = this.contactPersonEdit["email"];
        if (this.contactPersonEdit["first_name"]) obj.first_name = this.contactPersonEdit["first_name"];
        if (this.contactPersonEdit["last_name"]) obj.last_name = this.contactPersonEdit["last_name"];
        if (this.contactPersonEdit["customer"]) obj.customer = this.idCustomer; 
        if (this.contactPersonEdit["addresses"]) obj.addresses = JSON.stringify(this.contactPersonEdit["addresses"]);
        if (this.contactPersonEdit["department"]) obj.department = this.contactPersonEdit["department"];
        if (this.contactPersonEdit["active"]) obj.active = 1;                

        console.log("updateData obj :", obj);
        
        this.apiService.pvs4_set_contact_person(obj).then((result: any) => {
            console.log('result: ', result);
            this.navCtrl.navigateBack("/customer-details/"+this.idCustomer);
        }); 
        this.contactPersonEdit = [];
        this.contactPersonEditOderNeu = 1; // 0->bearbeiten 1->neu
        this.viewCtrl.dismiss();
      } 
  }   

  validateEmail(email) {
      let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
      if (reg.test(email) == false) {
          return (false);
      } else {
          return (true);
      }
  }

  editContactPerson(contactPerson) {
    console.log("editContactPerson 1 :", contactPerson);
    localStorage.setItem("KundenAnspListe", JSON.stringify(contactPerson));  
    this.contactPersonEdit = contactPerson;
    this.contactPersonEditOderNeu = 0;
    this.kundendaten = "create";
  }

  setContactPerson(contactPerson) {
    this.viewCtrl.dismiss(contactPerson);
  }

  delContactPerson(contactPerson) {
    let alert = this.alertCtrl.create({
        header: this.translate.instant('Datensatz Löschen'),
        message: this.translate.instant('Ansprechpartner wirklich deaktivieren?'),
        buttons: [
            {
                text: this.translate.instant('Nein'),
                handler: () => {
                    console.log('Cancel clicked'); 
                }
            },
            {
                text: this.translate.instant('Ja'),
                handler: () => {
                    let obj = {id: 0,
                               email: "",
                               first_name: "",
                               last_name: "",
                               customer: "",
                               addresses: '[{"address":"", "zipcode":"", "department":"", "email":"", "phone":"", "mobile":""}]',
                               department: "",
                               active: 0};

                    if (contactPerson["id"]) obj.id = contactPerson["id"];
                    if (contactPerson["email"]) obj.email = contactPerson["email"];
                    if (contactPerson["first_name"]) obj.first_name = contactPerson["first_name"];
                    if (contactPerson["last_name"]) obj.last_name = contactPerson["last_name"];
                    if (contactPerson["customer"]) obj.customer = contactPerson["customer"];
                    if (contactPerson["addresses"]) obj.addresses = JSON.stringify(contactPerson["addresses"]);
                    if (contactPerson["department"]) obj.department = contactPerson["department"];
                    if (contactPerson["active"]) obj.active = 0;                
             
                    console.log("delContactPerson obj :", obj);
                    
                    this.apiService.pvs4_set_contact_person(obj).then((result: any) => {
                        console.log('result: ', result);
                        this.navCtrl.navigateBack("/customer-details/"+this.idCustomer);
                    }); 

                }
            }
        ]
    }).then(x=> x.present());
  }

  SP_Ansp(type, nr) {
      nr = parseInt(nr);
      let ret = '';
      if (type == 'Funktion_Nr') {
          switch (nr) {
              case 0:
                  ret = "";
                  break;
              case 1:
                  ret = "CEO";
                  break;
              case 2:
                  ret = "Produktionsleiter";
                  break;
              case 3:
                  ret = "Werkhof_Werkstattleiter";
                  break;
              case 4:
                  ret = "Entwicklung";
                  break;
              case 5:
                  ret = "Einkauf_Lager";
                  break;
              case 6:
                  ret = "Product_Manager";
                  break;
              case 7:
                  ret = "Betriebsunterhalt";
                  break;
              case 8:
                  ret = "Polier_Teamleiter";
                  break;
              case 9:
                  ret = "Mitarbeiter";
                  break;
              case 10:
                  ret = "Maschinenführer";
                  break;
              case 11:
                  ret = "Anlagenverantwortlicher";
                  break;
              case 99:
                  ret = "Sonstiges";
                  break;
          }
      }
      if (type == 'Rolle') {
          switch (nr) {
              case 0:
                  ret = "";
                  break;
              case 1:
                  ret = "Entscheider";
                  break;
              case 2:
                  ret = "Bewilliger";
                  break;
              case 3:
                  ret = "Anwender";
                  break;
              case 4:
                  ret = "Beeinflusser";
                  break;
              case 5:
                  ret = "Bewerter";
                  break;
              case 99:
                  ret = "Sonstiges";
                  break;
          }
      }
      if (type == 'Produkte') {
          switch (nr) {
              case 0:
                  ret = "";
                  break;
              case 1:
                  ret = "Hebemittel";
                  break;
              case 2:
                  ret = "Zurrmittel";
                  break;
              case 3:
                  ret = "PSA";
                  break;
              case 4:
                  ret = "Standardseile";
                  break;
              case 5:
                  ret = "Spezialseile";
                  break;
              case 6:
                  ret = "Hebemittelkontrolle";
                  break;
              case 7:
                  ret = "Schulungen";
                  break;
              case 8:
                  ret = "Ganzes Sortiment";
                  break;
              case 99:
                  ret = "Sonstiges";
                  break;
          }
      }
      if (ret == '') return '';

      return ret;
  }
   

}
