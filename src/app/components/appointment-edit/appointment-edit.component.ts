import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { UserdataService } from '../../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api';
import { DatePipe } from '@angular/common';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-appointment-edit',
  templateUrl: './appointment-edit.component.html',
  styleUrls: ['./appointment-edit.component.scss'],
})
export class AppointmentEditComponent implements OnInit {

  public modalTitle: string;
  public listCustomer: any[] = [];
  public idCustomer: Number = 0;
  public idAppointment: number = 0;
  public itsNew: boolean = false;
  public activAppointment: any = {
    active: 1,
    appointment_type: 0,
    idCustomer: this.idCustomer,
    idUser: this.userdata.id,
    notes: "",
    appointment_date: new Date().toISOString(),
    id: 0,
    start_time: this.apiService.appointmentStartTime,
    end_time: this.apiService.appointmentEndTime
  };

  public inputError: boolean = false;
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

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public userdata: UserdataService,
    public viewCtrl: ModalController,
    public apiService: ApiService,
    public alertCtrl: AlertController) {

  }

  ngOnInit() {
    this.maxDate = this.apiService.maxDate;

    this.employeesList();
    this.loadCustomer();

    if (this.navParams.get("appointment")) {
      this.activAppointment = this.navParams.get("appointment");
      this.idAppointment = this.activAppointment.id;
      this.idCustomer = this.activAppointment.idCustomer;
      if (this.activAppointment.idUser == null) this.activAppointment.idUser = this.userdata.id;
      if (this.activAppointment.appointment_date == null) this.activAppointment.appointment_date = new Date().toISOString();
      if (this.activAppointment.start_time == null) this.activAppointment.start_time = this.apiService.appointmentStartTime;
      if (this.activAppointment.end_time == null) this.activAppointment.end_time = this.apiService.appointmentEndTime;;
    }

    if (this.navParams.get("redirect")) {
      this.redirect = this.navParams.get("redirect");
      if (this.redirect == 3) {
        this.idCustomer = this.navParams.get("idCustomer");
        this.customerDisabled = true;
      }
      if (this.redirect == 4) {
        this.idCustomer = this.navParams.get("idCustomer");
        this.activAppointment.appointment_type = this.navParams.get("appointmentType");
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

    if (this.idCustomer != 0) this.contactPersonDisabled = false;

    console.log("AppointmentEditComponent: ", this.activAppointment, this.userdata.licensee);
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

  loadCustomer() {
    this.apiService.pvs4_get_customer_list(0).then((result: any) => {
      this.listCustomer = [];
      this.data_tree(result.list);
      if (this.listCustomer.filter(x => x.id == this.idCustomer).length >= 1)
        this.customer = this.listCustomer.filter(x => x.id == this.idCustomer)[0];
      if (this.idCustomer > 0) this.contactPersonsList(this.customer.id);
    });
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  appointmentEdit() {
    if (this.activAppointment.appointment_date) {
      this.appointmentSave();
    }
    if (this.Date_2 != null) {
      this.activAppointment.appointment_date = this.Date_2;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_3 != null) {
      this.activAppointment.appointment_date = this.Date_3;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_4 != null) {
      this.activAppointment.appointment_date = this.Date_4;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_5 != null) {
      this.activAppointment.appointment_date = this.Date_5;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_6 != null) {
      this.activAppointment.appointment_date = this.Date_6;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_7 != null) {
      this.activAppointment.appointment_date = this.Date_7;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_8 != null) {
      this.activAppointment.appointment_date = this.Date_8;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
    if (this.Date_9 != null) {
      this.activAppointment.appointment_date = this.Date_9;
      this.itsNew = true;
      this.appointmentSave();
    } else {
      return;
    }
  }

  appointmentSave() {
    if (this.customer.id == undefined) {
      return;
    }

    console.log("appointmentEdit()");
    let obj = {
      active: 1,
      appointment_type: 0,
      idCustomer: this.customer.id,
      idContactPerson: 0,
      idUser: 0,
      licensee: this.userdata.licensee,
      notes: "",
      appointment_date: "",
      id: 0,
      start_time: "",
      end_time: ""
    };

    if (this.activAppointment["licensee"]) obj.licensee = this.activAppointment["licensee"];
    if (this.activAppointment["active"]) obj.active = this.activAppointment["active"];
    if (this.activAppointment["appointment_type"]) obj.appointment_type = this.activAppointment["appointment_type"];
    if (this.activAppointment["idUser"]) obj.idUser = this.activAppointment["idUser"];
    if (this.activAppointment["idContactPerson"]) obj.idContactPerson = this.activAppointment["idContactPerson"];
    if (this.activAppointment["notes"]) obj.notes = this.activAppointment["notes"];
    let pipe = new DatePipe('en-US');
    if (this.activAppointment["appointment_date"]) obj.appointment_date = pipe.transform(this.activAppointment["appointment_date"], 'yyyy-MM-dd HH:mm:ss');
    if (this.activAppointment["start_time"]) obj.start_time = this.activAppointment["start_time"];
    if (this.activAppointment["end_time"]) obj.end_time = this.activAppointment["end_time"];

    console.log("obj :", obj);
    if (!this.itsNew) {
      obj.id = this.activAppointment["id"];
      this.idAppointment = this.activAppointment["id"];
    } else {
      this.activAppointment.active = 1;
    }

    if (obj.appointment_type == 2) {
      obj.idCustomer = 0;
      obj.idContactPerson = 0;
      obj.start_time = this.apiService.appointmentStartTime;
      obj.end_time = this.apiService.appointmentEndTime;
    }

    console.log("appointmentEdit obj :", obj, this.redirect, this.activAppointment.appointment_date);
    this.apiService.pvs4_set_appointment(obj).then((result: any) => {
      console.log('result: ', result);
    });
    if (this.redirect == 1)
      this.navCtrl.navigateRoot("/dashboard-new");
    if (this.redirect == 2)
      this.navCtrl.navigateRoot("/appointment-plan");
    if (this.redirect == 3 || this.redirect == 4) {
      this.dismiss();
    }
  }

  appointmentDeactivate() {
    console.log("delete");
    this.showConfirmAlert(this.activAppointment);
  }

  data_tree(nodes: TreeNode[]): any {
    for (let i = 0; i < nodes.length; i++) {
      let obj = nodes[i].data;
      obj['listText'] = obj['company'];
      if (obj['zip_code'].length) obj['listText'] += ", " + obj['zip_code'];
      if (obj['place'].length) obj['listText'] += " " + obj['place'];
      if (obj['customer_number'].length) obj['listText'] += ", #" + obj['customer_number'];
      this.listCustomer.push(obj);
      if (nodes[i].children && nodes[i].children.length > 0) {
        this.data_tree(nodes[i].children);
      }
    }
  }

  showConfirmAlert(activAppointment) {
    let alert = this.alertCtrl.create({
      header: 'Confirm deactivate appointment',
      message: 'Are you sure you want to deactivate this appointment',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            activAppointment.active = 0;
            let pipe = new DatePipe('en-US');
            if (this.activAppointment["appointment_date"]) this.activAppointment["appointment_date"] = pipe.transform(this.activAppointment["appointment_date"], 'yyyy-MM-dd HH:mm:ss');

            this.apiService.pvs4_set_appointment(activAppointment).then((result: any) => {
              console.log('result: ', result);
              if (this.redirect == 1)
                this.navCtrl.navigateRoot("/dashboard-new");
              else
                this.navCtrl.navigateRoot("/appointment-plan");

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
    if (idCstmr != 0) this.contactPersonDisabled = false;
    this.contactPersonsList(idCstmr);
  }

  appointmentTypeChange() {
    this.activAppointment.idContactPerson = 0;
  }

  employeesList() {
    this.apiService.pvs4_get_colleagues_list(this.userdata.role, this.userdata.role_set, this.userdata.licensee)
      .then((result: any) => {
        console.log("pvs4_get_colleagues_list result:", result);
        let k = result["obj"];
        result["amount"] = parseInt(result["amount"]);
        if (result["amount"] > 0) {
          for (var i = 0, len = k.length; i < len; i++) {
            let item = k[i];
            item.id = parseInt(item.id);
            this.employeeList.push(item);
          }
        }
      });
    console.log("salesListe :", this.employeeList);
  }

  contactPersonsList(idCustomer) {
    console.log("contactPersonsList :", idCustomer);
    this.contactPersonList = [];
    this.apiService.pvs4_get_contact_person(idCustomer).then((result: any) => {
      console.log('contactPersonsList result', result.list);
      for (var i = 0, len = result.list.length; i < len; i++) {
        var item = result.list[i].data;
        item.addresses = JSON.parse(item.addresses);
        this.contactPersonList.push(item);
      }
    });
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

}
