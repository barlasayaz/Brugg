import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata';
import { ApiService } from '../../services/api';
import { ToastController } from '@ionic/angular';

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
  public pw_felder: any = 0;
  public itsNew: boolean = false;
  public contactPersonAddresses: any = [];
  public contactPersonAddress: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public userdata: UserdataService,
    public apiService: ApiService,
    public viewCtrl: ModalController,
    private toastCtrl: ToastController) {

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
    this.pw_felder = 1;
    console.log('updateData contactPersonAddresses :', this.contactPersonAddresses, this.contactPersonAddresses.length);
    if (this.contactPersonAddresses.length > 0) {
      for (let i = 0, len = this.contactPersonAddresses.length; i < len; i++) {
        if (this.contactPersonAddresses[i].address_type != undefined) {
          this.pw_felder = 0;
        } else {
            this.pw_felder = 1;
            this.mandatoryMsg('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }
        if (this.contactPersonAddresses[i].street) {
            this.pw_felder = 0;
        } else {
            this.pw_felder = 1;
            this.mandatoryMsg('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }
        if (this.contactPersonAddresses[i].zip_code) {
            this.pw_felder = 0;
        } else {
            this.pw_felder = 1;
            this.mandatoryMsg('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }
        if (this.contactPersonAddresses[i].email) {
            this.pw_felder = 0;
            if (this.validateEmail(this.contactPersonAddresses[i].email) == false) {
                this.mandatoryMsg('E-Mail nicht standardkonform.');
                return;
            }
        }
      }
    }
    if (this.pw_felder == 0) {
      let obj = {id: 0,
                email: '',
                gender: '',
                first_name: '',
                last_name: '',
                customer: this.idCustomer,
                addresses: '[{"address_type":"Rechnungsadresse","street":"", "zip_code":"", "department":"", "email":"", "phone":"", "mobile":""}]',
                phone: '',
                position: '',
                department: '',
                note: '',
                active: 1
      };

      if (this.contactPerson[0].id) { obj.id = this.contactPerson[0].id; }
      if (this.contactPerson[0].email) { obj.email = this.contactPerson[0].email; }
      if (this.contactPerson[0].gender) { obj.gender = this.contactPerson[0].gender; }
      if (this.contactPerson[0].first_name) { obj.first_name = this.contactPerson[0].first_name; }
      if (this.contactPerson[0].last_name) { obj.last_name = this.contactPerson[0].last_name; }
      if (this.contactPerson[0].customer) { obj.customer = this.contactPerson[0].customer; } 
      if (this.contactPerson[0].addresses) { obj.addresses = JSON.stringify(this.contactPersonAddresses); }
      if (this.contactPerson[0].department) { obj.department = this.contactPerson[0].department; }
      if (this.contactPerson[0].phone) { obj.phone = this.contactPerson[0].phone; }
      if (this.contactPerson[0].position) { obj.position = this.contactPerson[0].position; }
      if (this.contactPerson[0].note) { obj.note = this.contactPerson[0].note; }
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

  mandatoryMsg(msg) {
    const toast = this.toastCtrl.create({
      message: this.translate.instant(msg),
      cssClass: 'toast-mandatory',
      duration: 3000,
      position: 'top'
    }).then(x => x.present());
  }

}
