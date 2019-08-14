import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { UserdataService } from '../../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api';

/**
 * Generated class for the CustomerEditComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.scss'],
})
export class CustomerEditComponent implements OnInit {

  public modalTitle: string;
  public idCustomer: number = 0;
  public parentCustomer: number = 0;
  public itsNew: boolean = false;
  public activCustomer: any = {};
  public inputError: boolean = false;
  public Branches: any = [];
  public redirect: any = 0;
  public customerDisabled: boolean = false;
  public salesListe: any = [];
  public testerListe: any = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public userdata: UserdataService,
    public viewCtrl: ModalController,
    public apiService: ApiService,
    public alertCtrl: AlertController) {

  }

  ngOnInit() {
    this.idCustomer = this.navParams.get('id');
    this.redirect = this.navParams.get('redirect');
    this.parentCustomer = this.navParams.get('parent');
    this.salesTesterList();
    this.activCustomer.company = '';
    this.activCustomer.rating = 'C';
    this.activCustomer.customer_number = '';
    this.activCustomer.sales = '';
    this.activCustomer.tester = '';
    this.activCustomer.sector = '';
    if (this.idCustomer > 0) {
      this.modalTitle = this.translate.instant('Kundendaten bearbeiten');
      this.itsNew = false;
      this.loadCustomer(this.idCustomer);
    } else {
      this.modalTitle = this.translate.instant('Neuer Kunde');
      this.itsNew = true;
      this.idCustomer = 0;
    }

    // this.salesTesterList();

    this.Branches = [
      { value: 'Baukran', text: 'Baukran' },
      { value: 'Bauunternehmen', text: 'Bauunternehmen' },
      { value: 'Fahrzeugbau', text: 'Fahrzeugbau' },
      { value: 'Fassadenreiniger/Lift', text: 'Fassadenreiniger/Lift' },
      { value: 'Forstunternehmen/Landmaschinen', text: 'Forstunternehmen/Landmaschinen' },
      { value: 'Hallenkran/Industriekran', text: 'Hallenkran/Industriekran' },
      { value: 'Handelsunternehmen', text: 'Handelsunternehmen' },
      { value: 'Hochregallager', text: 'Hochregallager' },
      { value: 'Hochspannung/Niederspannung', text: 'Hochspannung/Niederspannung' },
      { value: 'Kehrichtverbrennungsanlagen', text: 'Kehrichtverbrennungsanlagen' },
      { value: 'Kranverleih', text: 'Kranverleih' },
      { value: 'Lagerlogistik', text: 'Lagerlogistik' },
      { value: 'Maschinenbau', text: 'Maschinenbau' },
      { value: 'Metallbau/Stahlbau', text: 'Metallbau/Stahlbau' },
      { value: 'Pneukran', text: 'Pneukran' },
      { value: 'Seilpark', text: 'Seilpark' },
      { value: 'Spezial-Tiefbau', text: 'Spezial-Tiefbau' },
      { value: 'Strassenbau Tiefabau', text: 'Strassenbau Tiefabau' },
      { value: 'Transport', text: 'Transport' },
      { value: 'Veranstaltungstechnik', text: 'Veranstaltungstechnik' },
      { value: 'Sonstige', text: 'Sonstige' }
    ];
    console.log('CustomerEditComponent: ', this.idCustomer);

    if (this.redirect == 3) {
      // this.customerDisabled = true;
    }
  }

  loadCustomer(id) {
    this.apiService.pvs4_get_customer(id).then((result: any) => {
      this.activCustomer = result.obj;
      if (this.activCustomer.sales == 0) { this.activCustomer.sales = ''; }
      if (this.activCustomer.tester == 0) { this.activCustomer.tester = ''; }
      console.log('loadCustomer: ', this.activCustomer);
    });
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  customerEdit() {
    console.log('customerEdit()', this.activCustomer);

    this.inputError = false;
    if (this.activCustomer.company == '') {
      this.inputError = true;
      return;
    }
    if (this.activCustomer.rating == '') {
      this.inputError = true;
      return;
    }
    if (this.activCustomer.customer_number == '') {
      this.inputError = true;
      return;
    }
    if (this.activCustomer.sales == '') {
      this.inputError = true;
      return;
    }
    if (this.activCustomer.tester == '') {
      this.inputError = true;
      return;
    }
    if (this.activCustomer.sector == '') {
      this.inputError = true;
      return;
    }

    let obj = {
      active: 1,
      company: '',
      country: '',
      customer_number: '',
      email: '',
      licensee: this.userdata.licensee,
      parent: this.parentCustomer,
      phone: '',
      place: '',
      po_box: '',
      rating: 'C',
      sector: '',
      street: '',
      website: '',
      zip_code: '',
      id: 0,
      note: '',
      sales: '',
      tester: ''
    };

    if (this.activCustomer['active']) { obj.active = this.activCustomer['active']; }
    if (this.activCustomer['company']) { obj.company = this.activCustomer['company']; }
    if (this.activCustomer['country']) { obj.country = this.activCustomer['country']; }
    if (this.activCustomer['customer_number']) { obj.customer_number = this.activCustomer['customer_number']; }
    if (this.activCustomer['email']) { obj.email = this.activCustomer['email']; }
    if (this.activCustomer['licensee']) { obj.licensee = this.activCustomer['licensee']; }
    if (this.activCustomer['parent']) { obj.parent = this.activCustomer['parent']; }
    if (this.activCustomer['phone']) { obj.phone = this.activCustomer['phone']; }
    if (this.activCustomer['place']) { obj.place = this.activCustomer['place']; }
    if (this.activCustomer['po_box']) { obj.po_box = this.activCustomer['po_box']; }
    if (this.activCustomer['rating']) { obj.rating = this.activCustomer['rating']; }
    if (this.activCustomer['sector']) { obj.sector = this.activCustomer['sector']; }
    if (this.activCustomer['street']) { obj.street = this.activCustomer['street']; }
    if (this.activCustomer['website']) { obj.website = this.activCustomer['website']; }
    if (this.activCustomer['zip_code']) { obj.zip_code = this.activCustomer['zip_code']; }
    if (this.activCustomer['note']) { obj.note = this.activCustomer['note']; }
    if (this.activCustomer['sales']) { obj.sales = this.activCustomer['sales']; }
    if (this.activCustomer['tester']) { obj.tester = this.activCustomer['tester']; }

    console.log(obj);
    if (!this.itsNew) {
      obj.id = this.activCustomer['id'];
      this.idCustomer = this.activCustomer['id'];
    } else {
      this.activCustomer.active = 1;
    }
    this.apiService.pvs4_set_customer(obj).then((result: any) => {
      console.log('result: ', result, obj);
        this.viewCtrl.dismiss(true);
    });

  }

  customerDeactivate() {
    console.log('delete');
    this.showConfirmAlert(this.activCustomer);
  }

  inputErrorMsg() {
    this.inputError = false;
  }

  showConfirmAlert(activeCustomer) {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Achtung'),
      message: this.translate.instant('Möchten Sie diesen Benutzer wirklich dauerhaft löschen?'),
      buttons: [
        {
          text: this.translate.instant('nein'),
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.translate.instant('ja'),
          handler: () => {
            activeCustomer.active = 0;
            this.apiService.pvs4_set_customer(activeCustomer).then((result: any) => {
              console.log('result: ', result);
              this.viewCtrl.dismiss(true);
            });

          }
        }
      ]
    }).then(x => x.present());
  }

  salesTesterList() {
    this.apiService.pvs4_get_colleagues_list(this.userdata.role, this.userdata.role_set, this.userdata.licensee)
      .then((result: any) => {
        console.log('pvs4_get_colleagues_list result:', result);
        let k = result['obj'];
        result['amount'] = parseInt(result['amount']);
        if (result['amount'] > 0) {
          for (var i = 0, len = k.length; i < len; i++) {
            let item = k[i];
            item.id = parseInt(item.id);
            this.salesListe.push(item);
            if (item.role_set.check_products) {
              this.testerListe.push(item);
            }
          }
        }
      });
    console.log('salesListe :', this.salesListe);
    console.log('testerListe :', this.testerListe);
  }

}
