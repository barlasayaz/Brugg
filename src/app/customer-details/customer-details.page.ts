import { Component, OnInit} from '@angular/core';
import { NavController, ModalController, Platform, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { SystemService } from '../services/system';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ContactPersonPage } from './contact-person/contact-person.page';
import { ContactPersonAddressPage } from './contact-person-address/contact-person-address.page';
import { CustomerEditComponent } from '../components/customer-edit/customer-edit.component';
import { NoteEditComponent } from '../components/note-edit/note-edit.component';
import { AppointmentEditComponent } from '../components/appointment-edit/appointment-edit.component';
import { AssignmentPage } from './assignment/assignment.page';

/**
 * Generated class for the CustomerDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.page.html',
  styleUrls: ['./customer-details.page.scss'],
})

export class CustomerDetailsPage implements OnInit {
  public idCustomer: number = 0;
  public activCustomer: any = {};
  public baan1_aktiv = false;
  public baan2_aktiv = false;
  public baan1_href = '';
  public baan2_href = '';
  public mobilePlatform: boolean;
  public aktive_products: number = 0;
  public inspection_service: number = 0;
  public contactPersonList: any = [];
  public contactPerson: any = [];
  public contactPersonAddresses: any = [];
  public contactPersonAddr: any = [];
  public pageCount: any = 0;
  public pageTotalCount: any = 0;
  public contactPersonCount: any = 0;
  public employees: string = '';
  public last_visit: any;
  public last_inspection: any;
  public next_visit: any;
  public next_inspection: any;
  public isLoaded = false;
  public index = -1;
  public isExpanded = false;
  public isSetDefault = false;

  constructor(public navCtrl: NavController,
    public userdata: UserdataService,
    public apiService: ApiService,
    public translate: TranslateService,
    public system: SystemService,
    private inAppBrowser: InAppBrowser,
    public platform: Platform,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private route: ActivatedRoute) {

    }

    ngOnInit() {

      this.idCustomer = parseInt(this.route.snapshot.paramMap.get('id'));
      this.loadCustomer(this.idCustomer);
      this.getContactList();

      this.platform.ready().then(() => {
        if (this.platform.is('ios') ||
          this.platform.is('android')) {
          this.mobilePlatform = true;
          console.log('platform mobile:', this.platform.platforms());
        } else {
          console.log('platform not mobile:', this.platform.platforms());
          this.mobilePlatform = false;
        }
      });
      console.log('ngOnInit CustomerDetailsPage',  this.userdata);
      if (this.userdata.role == 3) {
        for (var i = 0, len = this.userdata.all_role_set.length; i < len; i++) {
          let c = parseInt( this.userdata.all_role_set[i].customer);
          if ( c == this.idCustomer) {
            this.userdata.all_role_set[i].check_products = parseInt(this.userdata.all_role_set[i].check_products);
            if (this.userdata.all_role_set[i].check_products >= 1) {
              this.userdata.role_set.check_products = true;
            } else {
              this.userdata.role_set.check_products = false;
            }

            this.userdata.all_role_set[i].edit_products = parseInt(this.userdata.all_role_set[i].edit_products);
            if (this.userdata.all_role_set[i].edit_products >= 1) {
              this.userdata.role_set.edit_products = true;
            } else {
              this.userdata.role_set.edit_products = false;
            }
          }
        }
      }
    }

   loadCustomer(id) {
      this.system.setCustomerId(id);
      this.apiService.pvs4_get_customer(id).then((result: any) => {
        this.activCustomer = result.obj;
        this.aktive_products = parseInt(result.aktive_products);
        this.inspection_service = parseInt(result.inspection_service);
        // Zuweisungen
        this.apiService.pvs4_get_profile(this.activCustomer.sales_email, 1).then((done: any) => {
          if (done.amount != 0) {
            this.employees = done.bid.first_name + ' ' + done.bid.last_name;
          }
          this.apiService.pvs4_get_profile(this.activCustomer.tester_email, 1).then((done: any) => {
            if (done.amount != 0) {
              this.employees += ' (' + done.bid.first_name + ' ' + done.bid.last_name + ')';
            }
          });
        });
        /*if (this.activCustomer.note && this.activCustomer.note != '') {
          let alert = this.alertCtrl.create({
            header: this.translate.instant('Notiz'),
            message: this.activCustomer.note,
            buttons: [
              {
                text: this.translate.instant('okay'),
                handler: () => {

                }
              }
            ]
          }).then(x => x.present() );

        }*/
        // Appointment Date
        try {
          if (this.activCustomer.sales_dates && this.activCustomer.sales_dates != null && this.activCustomer.sales_dates != '') {
            let sales_dates = JSON.parse( this.activCustomer.sales_dates);
            if (sales_dates.last_date) { this.last_visit = this.apiService.view2mysql(sales_dates.last_date) ; }
            if (sales_dates.next_date) { this.next_visit = this.apiService.view2mysql(sales_dates.next_date); }
          }
        } catch (e) {
          console.error('JSON.parse err', this.activCustomer.sales_dates) ;
        }

        this.apiService.pvs4_get_appointment_date(id).then((done: any) => {
          if (done.amount != 0) {
            if (done.last_visit.length) { this.last_visit = done.last_visit; }
            if (done.next_visit.length) { this.next_visit = done.next_visit; }
            this.last_inspection = done.last_inspection;
            this.next_inspection = done.next_inspection;
          }
        });
        if (this.userdata.role == 3) {
          this.userdata.licensee = this.activCustomer.licensee;
        }
        // ******************* days 10 30 90 ******************
        try {
          let days = JSON.parse( this.activCustomer.days);
          this.activCustomer.days = days;
          this.isLoaded = true;
        } catch (e) {
          this.activCustomer.days = {'days10': 0, 'days30': 0, 'days90': 0 };
          console.error('JSON.parse err days ', this.activCustomer.days) ;
        }
        // get new
        this.apiService.pvs4_api_post('job_days.php', {id: id}).then((days: any) => {
              console.log('ok job_days.php ', days);
              this.activCustomer.days = {'days10': days.days10 , 'days30': days.days30  , 'days90': days.days90  };
              this.isLoaded = true;
        },
        err => { // return the error
              console.log('error job_days.php ', err);
        });
        // **********************************
        console.log('loadCustomer', this.activCustomer);

        // get BAAN and NAV
        let nr = this.activCustomer.customer_number.trim();
        console.log('idCustomer :', this.activCustomer.customer_number);
        if (nr.length > 0) {
          if (((this.userdata.role == 1) || (this.userdata.role == 2)) && (this.userdata.licensee == 1)) {
            this.apiService.pvs4_get_baan(nr).then((baan_nav: any) => {
              console.log('baan_nav :', baan_nav);
              if (baan_nav.baan1) {
                if (baan_nav.baan1 != '') {
                  this.baan1_aktiv = true;
                  this.baan1_href = baan_nav.baan1;
                }
              }
              if (baan_nav.baan2) {
                if (baan_nav.baan2 != '') {
                  this.baan2_aktiv = true;
                  this.baan2_href = baan_nav.baan2;
                }
              }
            });
          }
        }
      });


    }

    getContactList() {
      console.log('getPointContact :', this.idCustomer);
      this.contactPersonAddresses = [];
      this.contactPersonAddr = [];
      this.pageCount = 0;
      this.pageTotalCount = 0;
      this.contactPersonCount = 0;
      this.apiService.pvs4_get_contact_person(this.idCustomer).then((result: any) => {
        console.log('getPointContact result', result.list);
        this.contactPersonCount = result.list.length;
        for (var i = 0 ; i < result.list.length; i++) {
          var item = result.list[i].data;
          try {
            item.addresses = JSON.parse(item.addresses);
          } catch {
            console.error('JSON.parse pvs4_get_contact_person addresses', item.addresses) ;
            item.addresses = [];
          }
          this.contactPersonList.push(item);
          let localContact = localStorage.getItem('ContactPerson' + this.idCustomer);
          if ((i == 0 && !localContact) || (localContact && item.id == localContact)) {
            if (item.gender == 0) {
              item.gender_text = '';
            }
            if (item.gender == 1) {
                item.gender_text = this.translate.instant('Herr');
            }
            if (item.gender == 2) {
                item.gender_text = this.translate.instant('Frau');
            }
            this.contactPerson.push(item);
            this.pageTotalCount = item.addresses.length;
            this.contactPersonAddresses.push(item.addresses[0]);
            for (var j = 0, ln = this.pageTotalCount; j < ln; j++) {
              this.contactPersonAddr.push(item.addresses[j]);
            }
            this.setDefaultContact(item);
          }
        }

      });

    }

    async contactPersonPage() {
      const modal =
        await this.modalCtrl.create({
          component: ContactPersonPage,
          cssClass: 'contactperson-modal-css',
          componentProps: {
            idCustomer: this.idCustomer
          }
        });

        modal.onDidDismiss().then((data) => {
          console.log('onDidDismiss Data :', data);
          if (data.data) {
            const contact = data['data'];
            this.contactPersonAddresses = [];
            this.contactPersonAddr = [];
            this.pageCount = 0;
            this.pageTotalCount = 0;
            this.contactPerson = [];
            this.contactPerson.push(contact);
            // localStorage.setItem('ContactPerson' + this.idCustomer, contact.id);
            this.setDefaultContact(contact);
            this.pageTotalCount = contact.addresses.length;
            for (var i = 0, len = this.pageTotalCount; i < len; i++) {
              if (i == 0) {
                this.contactPersonAddresses.push(contact.addresses[i]);
                for (var j = 0, ln = this.pageTotalCount; j < ln; j++) {
                  this.contactPersonAddr.push(contact.addresses[j]);
                }
              }
            }
          }
        });
      modal.present();
    }

    getContactAdress( k, item) {
      console.log('getContactAdress item',  this.index, this.isExpanded);
      if ( this.index == -1 ) {
        this.index = k;
        this.isExpanded = true;
      } else {
        if (this.index == k) {
          this.index = -1;
        } else {
          this.index = k;
        }
        this.isExpanded = true;
      }

      this.isSetDefault = true;

      const contact = item;
      this.contactPersonAddresses = [];
      this.contactPersonAddr = [];
      this.pageCount = 0;
      this.pageTotalCount = 0;
      this.contactPerson = [];
      this.contactPerson.push(contact);
      // localStorage.setItem('ContactPerson' + this.idCustomer, contact.id);
      this.pageTotalCount = contact.addresses.length;
      for (var i = 0, len = this.pageTotalCount; i < len; i++) {
        if (i == 0) {
          this.contactPersonAddresses.push(contact.addresses[i]);
          for (var j = 0, ln = this.pageTotalCount; j < ln; j++) {
            this.contactPersonAddr.push(contact.addresses[j]);
          }
        }
      }
    }

    setDefaultContact(item) {
      console.log('setDefaultContact item',  item);
      const contact = item;
      localStorage.setItem('ContactPerson' + this.idCustomer, contact.id);

      let delContact = -1;
      for (var i = 0, len = this.contactPersonList.length; i < len; i++) {
        if ( this.contactPersonList[i].id == contact.id) {
          delContact = i;
        }
      }

      if (delContact >= 0) {
        this.contactPersonList.splice(delContact, 1);

        const arr = [];
        arr.push(contact);
        for (var i = 0, len = this.contactPersonList.length; i < len; i++) {
          arr.push(this.contactPersonList[i]);
        }
        this.contactPersonList = arr;
      }
    }



    async addAddress() {
      let contactPersonAddrTmp = JSON.parse(JSON.stringify(this.contactPersonAddr));
      const modal =
        await this.modalCtrl.create({
          component: ContactPersonAddressPage,
          cssClass: 'contactpersonaddress-modal-css',
          componentProps: {
            'idCustomer': this.idCustomer, 'contactPerson': this.contactPerson, 'contactPersonAddresses': this.contactPersonAddr
          }
        });
        modal.onDidDismiss().then(data => {
          if (data['data']) {
            this.contactPersonAddr = [];
            for (var i = 0, len = contactPersonAddrTmp.length; i < len; i++) {
              this.contactPersonAddr.push(contactPersonAddrTmp[i]);
            }
          }
      });
      modal.present();
    }

    pageBack() {
      if (this.pageCount > 0) {
        this.pageCount--;
        this.contactPersonAddresses = [];
        if (this.contactPersonAddr) {
          this.contactPersonAddresses.push(this.contactPersonAddr[this.pageCount]);
        }
        console.log('pageBack pageCount pageTotalCount :', this.pageCount, '-', this.pageTotalCount);
      }
    }

    pageForward() {
      if (this.pageCount < this.pageTotalCount - 1) {
        this.pageCount++;
        this.contactPersonAddresses = [];
        if (this.contactPersonAddr) {
          this.contactPersonAddresses.push(this.contactPersonAddr[this.pageCount]);
        }
        console.log('pageForward pageCount pageTotalCount :', this.pageCount, '-', this.pageTotalCount, '-', this.contactPersonAddr);
      }
    }

    openBaan(x) {
      console.log('openBaan()', x, this.baan1_href, this.baan2_href);
      if (this.system.platform == 0) {
        if (x == 1) { window.open(this.baan1_href, '_blank'); }
        if (x == 2) { window.open(this.baan2_href, '_blank'); }
      } else {
        if (x == 1) {
          this.inAppBrowser.create(this.baan1_href, '_system', 'location=yes');
        }
        if (x == 2) {
          this.inAppBrowser.create(this.baan2_href, '_system', 'location=yes');
        }
      }
    }

    setProductSrv(mode: number) {
      let titel = this.translate.instant('Prüfservice');
      let msg = this.translate.instant('disable_service_produkte');
      if (mode == 1) { msg = this.translate.instant('enable_service_produkte'); }
      let alert = this.alertCtrl.create({
        header: titel,
        message: msg,
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
              this.aktive_products = 0;
              this.inspection_service = 0;
              this.apiService.pvs4_set_inspection_service(this.activCustomer.id, mode).then((result: any) => {
                this.aktive_products = parseInt(result.aktive_products);
                this.inspection_service = parseInt(result.inspection_service);
              });
            }
          }
        ]
      }).then(x => x.present());
    }

    async appointmentEdit() {
      console.log('appointmentEdit -> idCustomer :', this.idCustomer);
      const modal =
        await this.modalCtrl.create({
          component: AppointmentEditComponent,
          cssClass: 'appointmentedit-modal-css',
          componentProps: {
            idCustomer: this.idCustomer, appointmentType: '0', redirect: 3
          }
        });
        modal.onDidDismiss().then(data => {
          if (data['data']) {
            this.loadCustomer(this.activCustomer.id) ;
          }
        });
        modal.present();
    }

    async noteEdit() {
      console.log('newNotes -> idCustomer :', this.idCustomer);
      const modal =
        await this.modalCtrl.create({
          component: NoteEditComponent,
          cssClass: 'noteedit-modal-css',
          componentProps: {
            id: 0, idCustomer: this.idCustomer, redirect: 2
          }
        }).then(x => x.present());
    }

    async customerEdit() {
      console.log('customerEdit -> idCustomer :', this.idCustomer);
      const modal =
        await this.modalCtrl.create({
          component: CustomerEditComponent,
          cssClass: 'customeredit-modal-css',
          componentProps: {
            id: this.idCustomer, redirect: 3
          }
        });
        modal.onDidDismiss().then(data => {
        if (data['data']) {
          //this.activCustomer = data['data'];
        //  this.activCustomer = data;
          this.loadCustomer(this.activCustomer.id);
        }
      });
      modal.present();
    }

    async set_employees() {
      console.log('set_employees activCustomer', this.activCustomer);
      const modal =
      await this.modalCtrl.create({
        component: AssignmentPage,
        cssClass: 'assignment-modal-css',
        componentProps: {
          'activCustomer': JSON.stringify(this.activCustomer)
        }
      });
      modal.onDidDismiss().then(data => {
        if (data['data']) {
           this.loadCustomer(this.activCustomer.id);
        }
      });
      modal.present();

    }

    async newAppointment(appointmentType: any) {
      console.log('newAppointment');
      const modal =
      await this.modalCtrl.create({
        component: AppointmentEditComponent,
        cssClass: 'appointmentedit-modal-css',
        componentProps: {
          idCustomer: this.idCustomer, appointmentType: appointmentType, redirect: 4
        }
      });
      modal.onDidDismiss().then(data => {
        if (data['data']) {
            this.loadCustomer(this.activCustomer.id) ;
        }
      });
      modal.present();
    }
  }
