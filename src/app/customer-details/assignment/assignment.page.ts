import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata';
import { ApiService } from '../../services/api';

/**
 * Generated class for the AssignmentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.page.html',
  styleUrls: ['./assignment.page.scss']
})
export class AssignmentPage {
  public idSales = 0;
  public idTester = 0;
  public activCustomer: any = {};
  public salesListe: any = [];
  public testerListe: any = [];
  public params: any;
  public inputError: boolean = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public userdata: UserdataService,
    public apiService: ApiService,
    public viewCtrl: ModalController) {

    if (this.userdata.role == 3) {
      this.userdata.licensee = 0;
    }
    this.activCustomer = this.navParams.get('activCustomer');
    if (this.activCustomer) {
      try
      {
        this.activCustomer = JSON.parse(this.activCustomer);
      }
      catch{
         console.error('JSON.parse err',this.activCustomer) ;
      }

    }
    console.log('activCustomer :', this.activCustomer);
    if (this.activCustomer.sales != 0) {
      this.idSales = this.activCustomer.sales;
    } else {
      this.idSales = 0;
    }
    if (this.activCustomer.tester != 0) {
      this.idTester = this.activCustomer.tester;
    } else {
      this.idTester = 0;
    }
    console.log('idSales - idTester :', this.idSales, this.idTester);

    this.apiService.pvs4_get_colleagues_list(this.userdata.role, this.userdata.role_set, this.userdata.licensee)
      .then((result: any) => {
        console.log('pvs4_get_colleagues_list result:', result);
        const k = result['obj'];
        result['amount'] = parseInt(result['amount']);
        if (result['amount'] > 0) {
          for (let i = 0, len = k.length; i < len; i++) {
            const item = k[i];
            item.id = parseInt(item.id);
            // console.log("item:", item);
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

  closeModal() {
    this.navCtrl.pop();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  inputErrorMsg() {
    this.inputError = false;
  }

  editAssignment() {
    try
    {
      this.activCustomer = JSON.parse(this.activCustomer);
    }
    catch{
       console.error('JSON.parse',this.activCustomer) ;
    }
    console.log('activCustomer edit :', this.activCustomer);
    console.log('idSales :', this.idSales);
    console.log('idTester :', this.idTester);
    if ((this.idSales <= 0) || (this.idTester <= 0)) { return; }

    const obj = {
      active: 1,
      company: '',
      country: '',
      customer_number: '',
      email: '',
      licensee: this.userdata.licensee,
      parent: 0,
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
      sales: 0,
      tester: 0
    };

    console.log('activCustomer.id :', this.activCustomer['id']);
    if (this.activCustomer['id']) { obj.id = this.activCustomer['id']; }
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
    obj.sales = this.idSales;
    obj.tester = this.idTester;

    console.log('editAssignment obj :', obj);

    this.apiService.pvs4_set_customer(obj).then((result: any) => {
      console.log('result: ', result, obj);
      this.dismiss();
    });

  }

}
