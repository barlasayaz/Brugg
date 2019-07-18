import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata';
import { ApiService } from '../../services/api';

/**
 * Generated class for the ContactPersonAddressPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-contact-person-address',
  templateUrl: './contact-person-address.page.html',
  styleUrls: ['./contact-person-address.page.scss'],
})
export class ContactPersonAddressPage {
  public idCustomer: any;
  public contactPerson: any = [];
  public kundendaten: any = 'person';
  public contactPersonEditOderNeu = 1; // 0>bearbeiten 1>neu
  public contactPersonList: any = [];
  public params: any;
  public pfelder: any = 0;
  public inputError: boolean = false;
  public email_felder: any = 0;
  public pw_felder: any = 0;
  public contactPersonAddresses: any = [];
  public contactPersonAddress: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public userdata: UserdataService,
    public apiService: ApiService,
    public viewCtrl: ModalController) {

    this.idCustomer = this.navParams.get('idCustomer');
    this.contactPerson = this.navParams.get('contactPerson');
    this.contactPersonAddresses = [];
    this.contactPersonAddresses = this.navParams.get('contactPersonAddresses');
    this.contactPersonAddress = 'Rechnungsadresse';
    console.log('contactPersonAddresses :', this.contactPerson, this.contactPersonAddresses);

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  updateData() {
    this.pfelder = 0;
    this.email_felder = 0;
    this.pw_felder = 1;
    this.inputError = false;
    console.log('updateData contactPersonAddresses :', this.contactPersonAddresses, this.contactPersonAddresses.length);
    if (this.contactPersonAddresses.length > 0) {
      for (var i = 0, len = this.contactPersonAddresses.length; i < len; i++) {
        if (this.contactPersonAddresses[i].address_type != undefined) {
          this.pw_felder = 0;
        } else {
            this.pw_felder = 1;
            this.pfelder = 1;
            this.inputError = true;
            return;
        }
        if (this.contactPersonAddresses[i].street) {
            this.pw_felder = 0;
        } else {
            this.pw_felder = 1;
            this.pfelder = 1;
            this.inputError = true;
            return;
        }
        if (this.contactPersonAddresses[i].zip_code) {
            this.pw_felder = 0;
        } else {
            this.pw_felder = 1;
            this.pfelder = 1;
            this.inputError = true;
            return;
        }
        if (this.contactPersonAddresses[i].email) {
            this.pw_felder = 0;
            if (this.validateEmail(this.contactPersonAddresses[i].email) == false) {
                this.inputError = true;
                this.email_felder = 1;
                return;
            }
        }
      }
    }
    if (this.pw_felder == 0) {
      let obj = {id: 0,
                email: '',
                first_name: '',
                last_name: '',
                customer: this.idCustomer,
                addresses: '[{"address_type":"Rechnungsadresse","street":"", "zip_code":"", "department":"", "email":"", "phone":"", "mobile":""}]',
                department: '',
                active: 1
      };

      if (this.contactPerson[0].id) { obj.id = this.contactPerson[0].id; }
      if (this.contactPerson[0].email) { obj.email = this.contactPerson[0].email; }
      if (this.contactPerson[0].first_name) { obj.first_name = this.contactPerson[0].first_name; }
      if (this.contactPerson[0].last_name) { obj.last_name = this.contactPerson[0].last_name; }
      if (this.contactPerson[0].customer) { obj.customer = this.contactPerson[0].customer; } 
      if (this.contactPerson[0].addresses) { obj.addresses = JSON.stringify(this.contactPersonAddresses); }
      if (this.contactPerson[0].department) { obj.department = this.contactPerson[0].department; }
      if (this.contactPerson[0].active) { obj.active = 1; }

      console.log('updateData obj :', obj);

      this.apiService.pvs4_set_contact_person(obj).then((result: any) => {
        console.log('result: ', result);
        this.dismiss();
        this.navCtrl.navigateRoot(['customer-details', this.idCustomer ]);
      });
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

  inputErrorMsg() {
    this.inputError = false;
  }

  remAddress(indAdr) {
    this.contactPersonAddresses.splice(indAdr, 1); 
    if (this.contactPersonAddresses.length == 0) {
      this.contactPersonAddresses.push({
        address_type: 'Rechnungsadresse',
        street: '',
        zip_code: '',
        department: '',
        email: '',
        phone: '',
        mobile: ''
      }); 
    }
  }

  addAddress() {
    this.contactPersonAddresses.push({
      address_type: 'Rechnungsadresse',
      street: '',
      zip_code: '',
      department: '',
      email: '',
      phone: '',
      mobile: ''
    }); 
    console.log('addAddress :', this.contactPersonAddresses);
  }

}