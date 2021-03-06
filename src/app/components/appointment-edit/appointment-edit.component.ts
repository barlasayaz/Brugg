import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { UserdataService } from '../../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api';
import { DatePipe } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-appointment-edit',
  templateUrl: './appointment-edit.component.html',
  styleUrls: ['./appointment-edit.component.scss'],
})
export class AppointmentEditComponent implements OnInit {

  public modalTitle: string;
  public listCustomer: any[] = [];
  public idCustomer: number = 0;
  public idAppointment: number = 0;
  public itsNew: boolean = false;
  public activAppointment: any = {
    active: 1,
    appointment_type: '0',
    idCustomer: this.idCustomer,
    idUser: 0,
    notes: '',
    appointment_date: new Date().toISOString(),
    id: 0,
    start_time: this.apiService.appointmentStartTime,
    end_time: this.apiService.appointmentEndTime,
    reminder: 0
  };

  public lang: string = localStorage.getItem('lang');
  public redirect: number = 0;
  public customer: any = {};
  public customerDisabled: boolean = false;
  public maxDate: string;
  public appointmentTypeDisabled: boolean = false;
  public employeeList: any = [];
  public contactPersonList: any = [];
  public addDate: number = 1;
  public contactPersonDisabled: boolean = true;
  public Date_1: Date = null;
  public Date_2: Date = null;
  public Date_3: Date = null;
  public Date_4: Date = null;
  public Date_5: Date = null;
  public Date_6: Date = null;
  public Date_7: Date = null;
  public Date_8: Date = null;
  public Date_9: Date = null;
  public minTime: string = this.apiService.appointmentMinTime;
  public maxTime: string = this.apiService.appointmentMaxTime;
  public reminder = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0};

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public userdata: UserdataService,
    public viewCtrl: ModalController,
    public apiService: ApiService,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController) {

  }

  ngOnInit() {
    this.maxDate = this.apiService.maxDate;

    // this.employeesList();
    // this.loadCustomer();

    if (this.navParams.get('appointment')) {
      this.activAppointment = this.navParams.get('appointment');
      this.idAppointment = this.activAppointment.id;
      this.idCustomer = this.activAppointment.idCustomer;
      // if (this.activAppointment.idUser == null) {
      //   this.activAppointment.idUser = this.userdata.id;
      // } else {
      //   this.activAppointment.idUser = parseInt(this.activAppointment.idUser);
      // }
      if (this.activAppointment.appointment_date == null) { this.activAppointment.appointment_date = new Date().toISOString(); }
      if (this.activAppointment.start_time == null) { this.activAppointment.start_time = this.apiService.appointmentStartTime; }
      if (this.activAppointment.end_time == null) { this.activAppointment.end_time = this.apiService.appointmentEndTime; }
      if (this.activAppointment.reminder) { this.reminder[1] = this.activAppointment.reminder; }
    }

    if (this.navParams.get('redirect')) {
      this.redirect = this.navParams.get('redirect');
      if (this.redirect == 3) {
        this.idCustomer = this.navParams.get('idCustomer');
        this.customerDisabled = true;
      }
      if (this.redirect == 4) {
        this.idCustomer = this.navParams.get('idCustomer');
        this.activAppointment.appointment_type = this.navParams.get('appointmentType');
        this.customerDisabled = true;
        this.appointmentTypeDisabled = true;
      }
    }
    if (this.idAppointment > 0) {
      this.itsNew = false;
      this.modalTitle = this.translate.instant('Termin bearbeiten');
    } else {
      this.idAppointment = 0;
      this.itsNew = true;
      this.modalTitle = this.translate.instant('Neuer Termin');
    }

    if (this.idCustomer != 0) { this.contactPersonDisabled = false; }

    const getEmployeesList = this.employeesList();
    const getPersonList = this.loadCustomer();
    Promise.all([
      getEmployeesList,
      getPersonList
    ]).then((resultX) => {
      this.employeeList = resultX[0];
      this.contactPersonList = resultX[1];

      // if (this.navParams.get('appointment')) {
        if (this.activAppointment.idUser == 0) {
          this.activAppointment.idUser = this.userdata.id;
        } else {
          this.activAppointment.idUser = parseInt(this.activAppointment.idUser);
        }
      // }

      // For ion-select id must be integer. Data id and ngModel value id...
      this.activAppointment.idContactPerson = parseInt(this.activAppointment.idContactPerson);

    });

    console.log('AppointmentEditComponent: ', this.activAppointment, this.userdata.licensee);
  }

  loadAppointment() {
    this.apiService.pvs4_get_appointment(this.idAppointment).then((result: any) => {
      this.activAppointment = result.obj;

      if (result.obj.date && result.obj.date != null && new Date(result.obj.date) >= new Date(1970, 0, 1)) {
        this.activAppointment.appointment_date = new Date(result.obj.date).toISOString();
      }
      console.log('loadAppointment: ', this.activAppointment);
    });
  }

  open_customer() {
    this.navCtrl.navigateForward(['/customer-details', this.idCustomer]);
    this.dismiss();
  }

  employeesList() {
    return new Promise((resolve) => {
      this.apiService.pvs4_get_colleagues_list(this.userdata.role, this.userdata.role_set, this.userdata.licensee)
      .then((result: any) => {
        console.log('pvs4_get_colleagues_list result:', result);
        const employees = [];
        let k = result['obj'];
        result['amount'] = parseInt(result['amount']);
        if (result['amount'] > 0) {
          for (var i = 0, len = k.length; i < len; i++) {
            let item = k[i];
            item.id = parseInt(item.id);
            employees.push(item);
          }
        }
        resolve(employees);
      });
    });
  }

  loadCustomer() {
    return new Promise((resolve) => {
      this.apiService.pvs4_get_customer_list(0, '').then((result: any) => {
        this.listCustomer = [];
        this.data_tree(result.list);
        /*
        if(this.listCustomer.filter(x=> x.id == this.idCustomer).length>=1){
          this.customer = this.listCustomer.filter(x=> x.id == this.idCustomer)[0];
        }
        */
        this.customer = null;
        if (this.idCustomer > 0) { 
          for (let i = 0; i < this.listCustomer.length; i++) {
            if (this.listCustomer[i].id == this.idCustomer) {
              this.customer = this.listCustomer[i];
              console.log('customer: ', this.customer);
            }
          }

          this.contactPersonList = [];
          this.apiService.pvs4_get_contact_person(this.idCustomer).then((resultX: any) => {
            console.log('contactPersonsList resultX', resultX.list);
            const personList = [];
            for (var i = 0, len = resultX.list.length; i < len; i++) {
              var item = resultX.list[i].data;
              try {
                item.addresses = JSON.parse(item.addresses);
              } catch {
                 console.error('JSON.parse err', item.addresses) ;
              }
              item.id = parseInt(item.id);
              personList.push(item);
            }
            console.log('CONTACT', personList);
            resolve(personList);
          });
        } else {
          console.log('NO CONTACT');
          const personList = [];
          resolve(personList);
        }
      });
    });
  }

  contactPersonsList(idCustomer) {
    console.log('contactPersonsList :', idCustomer);
    this.contactPersonList = [];
    this.apiService.pvs4_get_contact_person(idCustomer).then((result: any) => {
      console.log('contactPersonsList result', result.list);
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

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  appointmentEdit() {
    if (this.activAppointment.idUser == '') {
      this.mandatoryMsg();
      return;
    }
    if (this.activAppointment.appointment_type == '') {
      this.mandatoryMsg();
      return;
    }
    if (this.customer == null) {
      this.mandatoryMsg();
      return;
    }
    if (this.activAppointment.idContactPerson == '') {
      this.mandatoryMsg();
      return;
    }
    if (this.activAppointment.appointment_date == '') {
      this.mandatoryMsg();
      return;
    }
    if (this.activAppointment.start_time == '') {
      this.mandatoryMsg();
      return;
    }
    if (this.activAppointment.end_time == '') {
      this.mandatoryMsg();
      return;
    }
    if (this.activAppointment.notes == '') {
      this.mandatoryMsg();
      return;
    }

    if (this.activAppointment.appointment_date) {
      this.activAppointment.reminder = this.reminder[1];
      this.appointmentSave();
    }
    if (this.Date_2 != null) {
      this.activAppointment.reminder = this.reminder[2];
      this.activAppointment.appointment_date = this.Date_2;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_3 != null) {
      this.activAppointment.reminder = this.reminder[3];
      this.activAppointment.appointment_date = this.Date_3;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_4 != null) {
      this.activAppointment.reminder = this.reminder[4];
      this.activAppointment.appointment_date = this.Date_4;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_5 != null) {
      this.activAppointment.reminder = this.reminder[5];
      this.activAppointment.appointment_date = this.Date_5;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_6 != null) {
      this.activAppointment.reminder = this.reminder[6];
      this.activAppointment.appointment_date = this.Date_6;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_7 != null) {
      this.activAppointment.reminder = this.reminder[7];
      this.activAppointment.appointment_date = this.Date_7;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_8 != null) {
      this.activAppointment.reminder = this.reminder[8];
      this.activAppointment.appointment_date = this.Date_8;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_9 != null) {
      this.activAppointment.reminder = this.reminder[9];
      this.activAppointment.appointment_date = this.Date_9;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
  }

  appointmentSave() {
    console.log('appointmentEdit()', this.activAppointment);

    let obj = {
      active: 1,
      appointment_type: 0,
      idCustomer: this.customer.id,
      idContactPerson: 0,
      idUser: 0,
      licensee: this.userdata.licensee,
      notes: '',
      appointment_date: '',
      id: 0,
      start_time: '',
      end_time: '',
      reminder: 0
    };

    if (this.activAppointment['licensee']) { obj.licensee = this.activAppointment['licensee']; }
    if (this.activAppointment['active']) { obj.active = this.activAppointment['active']; }
    if (this.activAppointment['appointment_type']) { obj.appointment_type = this.activAppointment['appointment_type']; }
    if (this.activAppointment['idUser']) { obj.idUser = this.activAppointment['idUser']; }
    if (this.activAppointment['idContactPerson']) { obj.idContactPerson = this.activAppointment['idContactPerson']; }
    if (this.activAppointment['notes']) { obj.notes = this.activAppointment['notes']; }
    let pipe = new DatePipe('en-US');
    if (this.activAppointment['appointment_date']) { obj.appointment_date = pipe.transform(this.activAppointment['appointment_date'], 'yyyy-MM-dd HH:mm:ss'); }
    if (this.activAppointment['start_time']) { obj.start_time = this.activAppointment['start_time']; }
    if (this.activAppointment['end_time']) { obj.end_time = this.activAppointment['end_time']; }
    if (this.activAppointment['reminder']) { obj.reminder = this.activAppointment['reminder']; }

    console.log('obj :', obj);
    if (!this.itsNew) {
      obj.id = this.activAppointment['id'];
      this.idAppointment = this.activAppointment['id'];
    } else {
      this.activAppointment.active = 1;
    }

    if (obj.appointment_type == 2) {
      obj.idCustomer = 0;
      obj.idContactPerson = 0;
      obj.start_time = this.apiService.appointmentStartTime;
      obj.end_time = this.apiService.appointmentEndTime;
    }

    console.log('appointmentEdit obj :', obj, this.activAppointment.appointment_date);
    this.apiService.pvs4_set_appointment(obj).then((result: any) => {
      console.log('result: ', result);
      this.viewCtrl.dismiss(true);
    });
  }

  appointmentDeactivate() {
    console.log('delete');
    this.showConfirmAlert(this.activAppointment);
  }

  data_tree(nodes: TreeNode[]): any {
    for (let i = 0; i < nodes.length; i++) {
      let obj = nodes[i].data;
      obj['listText'] = obj['company'];
      if (obj['zip_code'].length) { obj['listText'] += ', ' + obj['zip_code']; }
      if (obj['place'].length) { obj['listText'] += ' ' + obj['place']; }
      if (obj['customer_number'].length) { obj['listText'] += ', #' + obj['customer_number']; }
      this.listCustomer.push(obj);
      if (nodes[i].children && nodes[i].children.length > 0) {
        this.data_tree(nodes[i].children);
      }
    }
  }

  showConfirmAlert(activAppointment) {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Achtung'),
      message: this.translate.instant('Möchten Sie diesen Termin wirklich deaktivieren?'),
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
            activAppointment.active = 0;
            let pipe = new DatePipe('en-US');
            if (this.activAppointment['appointment_date']) { 
              this.activAppointment['appointment_date'] = pipe.transform(this.activAppointment['appointment_date'], 'yyyy-MM-dd HH:mm:ss');
            }
            this.apiService.pvs4_set_appointment(activAppointment).then((result: any) => {
              console.log('result: ', result);
              this.viewCtrl.dismiss(true);
            });
          }
        }
      ]
    }).then(x => x.present());
  }

  customerChange(event) {
    console.log('customerChange:', event.value);
    let idCstmr: any;
    idCstmr = parseInt(event.value.id);
    if (idCstmr != 0) { this.contactPersonDisabled = false; }
    this.contactPersonsList(idCstmr);
    this.activAppointment.idContactPerson = '';
  }

  appointmentTypeChange() {
    this.activAppointment.idContactPerson = 0;
  }

  plusDate() {
    this.Date_1 = new Date(this.activAppointment.appointment_date);
    if (this.addDate == 1) {
      this.Date_2 = new Date(this.Date_1);
      this.Date_2.setDate(this.Date_1.getDate() + 1);
      this.activAppointment.appointment_date2 = new Date(this.Date_2).toISOString();
      this.activAppointment.start_time2 = this.activAppointment.start_time;
      this.activAppointment.end_time2 = this.activAppointment.end_time;
    }
    if (this.addDate == 2) {
      this.Date_3 = new Date(this.Date_2);
      this.Date_3.setDate(this.Date_2.getDate() + 1);
      this.activAppointment.appointment_date3 = new Date(this.Date_3).toISOString();
      this.activAppointment.start_time3 = this.activAppointment.start_time;
      this.activAppointment.end_time3 = this.activAppointment.end_time;
    }
    if (this.addDate == 3) {
      this.Date_4 = new Date(this.Date_3);
      this.Date_4.setDate(this.Date_3.getDate() + 1);
      this.activAppointment.appointment_date4 = new Date(this.Date_4).toISOString();
      this.activAppointment.start_time4 = this.activAppointment.start_time;
      this.activAppointment.end_time4 = this.activAppointment.end_time;
    }
    if (this.addDate == 4) {
      this.Date_5 = new Date(this.Date_4);
      this.Date_5.setDate(this.Date_4.getDate() + 1);
      this.activAppointment.appointment_date5 = new Date(this.Date_5).toISOString();
      this.activAppointment.start_time5 = this.activAppointment.start_time;
      this.activAppointment.end_time5 = this.activAppointment.end_time;
    }
    if (this.addDate == 5) {
      this.Date_6 = new Date(this.Date_5);
      this.Date_6.setDate(this.Date_5.getDate() + 1);
      this.activAppointment.appointment_date6 = new Date(this.Date_6).toISOString();
      this.activAppointment.start_time6 = this.activAppointment.start_time;
      this.activAppointment.end_time6 = this.activAppointment.end_time;
    }
    if (this.addDate == 6) {
      this.Date_7 = new Date(this.Date_6);
      this.Date_7.setDate(this.Date_6.getDate() + 1);
      this.activAppointment.appointment_date7 = new Date(this.Date_7).toISOString();
      this.activAppointment.start_time7 = this.activAppointment.start_time;
      this.activAppointment.end_time7 = this.activAppointment.end_time;
    }
    if (this.addDate == 7) {
      this.Date_8 = new Date(this.Date_7);
      this.Date_8.setDate(this.Date_7.getDate() + 1);
      this.activAppointment.appointment_date8 = new Date(this.Date_8).toISOString();
      this.activAppointment.start_time8 = this.activAppointment.start_time;
      this.activAppointment.end_time8 = this.activAppointment.end_time;
    }
    if (this.addDate == 8) {
      this.Date_9 = new Date(this.Date_8);
      this.Date_9.setDate(this.Date_8.getDate() + 1);
      this.activAppointment.appointment_date9 = new Date(this.Date_9).toISOString();
      this.activAppointment.start_time9 = this.activAppointment.start_time;
      this.activAppointment.end_time9 = this.activAppointment.end_time;
    }
    this.addDate++;
  }

  minusDate() {
    this.addDate--;
  }

  setReminder(num: number) {
    if (this.reminder[num] == 0) {
      this.reminder[num] = 1;
    } else {
      this.reminder[num] = 0;
    }
  }

  getReminderClass(num: number) {
    if (this.reminder[num] == 1) {
      return 'btn-yellow';
    } else {
      return 'btn-grey';
    }
  }

  mandatoryMsg() {
    const toast = this.toastCtrl.create({
      message: this.translate.instant('Bitte füllen Sie alle Pflichtfelder aus.'),
      cssClass: 'toast-mandatory',
      duration: 3000,
      position: 'top'
    }).then(x => x.present());
  }

}
