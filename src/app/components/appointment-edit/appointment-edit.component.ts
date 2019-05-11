import { Component } from '@angular/core';
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
export class AppointmentEditComponent {

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
    start_time: "08:00",
    end_time: "17:00",
  };

  public inputError: boolean = false;
  public lang: string = localStorage.getItem('lang');
  public redirect: number = 0;
  public customer: any = {};
  public customerDisabled: boolean = false;
  public maxDate: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public userdata: UserdataService,
    public viewCtrl: ModalController,
    public apiService: ApiService,
    public alertCtrl: AlertController) {

    this.maxDate = this.apiService.maxDate;

    if (this.navParams.get("appointment")) {
      this.activAppointment = this.navParams.get("appointment");
      this.idAppointment = this.activAppointment.id;
      this.idCustomer = this.activAppointment.idCustomer;
    }

    if (this.navParams.get("redirect")) {
      this.redirect = this.navParams.get("redirect");
      if (this.redirect == 3) {
        this.idCustomer = this.navParams.get("idCustomer");
        this.customerDisabled = true;
      }
    }
    if (this.idAppointment > 0) {
      this.itsNew = false;
      this.modalTitle = translate.instant('Termin bearbeiten');
    } else {
      this.idAppointment = 0;
      this.itsNew = true;
      this.modalTitle = translate.instant('Neuer Termin');
    }
    this.loadCustomer();
    console.log("AppointmentEditComponent: ", this.idAppointment);
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
    });
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  appointmentEdit() {
    console.log("appointmentEdit()");
    let obj = {
      active: 1,
      appointment_type: 0,
      idCustomer: this.customer.id,
      idUser: 0,
      notes: "",
      appointment_date: "",
      id: 0,
      start_time: "",
      end_time: ""
    };

    if (this.activAppointment["active"]) obj.active = this.activAppointment["active"];
    if (this.activAppointment["appointment_type"]) obj.appointment_type = this.activAppointment["appointment_type"];
    if (this.activAppointment["notes"]) obj.notes = this.activAppointment["notes"];
    let pipe = new DatePipe('en-US');
    if (this.activAppointment["appointment_date"]) obj.appointment_date = pipe.transform(this.activAppointment["appointment_date"], 'yyyy-MM-dd HH:mm:ss');
    if (this.activAppointment["start_time"]) obj.start_time = this.activAppointment["start_time"];
    if (this.activAppointment["end_time"]) obj.end_time = this.activAppointment["end_time"];

    console.log(obj);
    if (!this.itsNew) {
      obj.id = this.activAppointment["id"];
      this.idAppointment = this.activAppointment["id"];
    } else {
      this.activAppointment.active = 1;
    }

    if (obj.appointment_type == 2) {
      obj.start_time = "";
      obj.end_time = "";
    }


    this.apiService.pvs4_set_appointment(obj).then((result: any) => {
      console.log('result: ', result);
      if (this.redirect == 1)
        this.navCtrl.navigateRoot("/dashboard-new");
      if (this.redirect == 2)
        this.navCtrl.navigateRoot("/appointment-plan");
      if (this.redirect == 3)
        this.dismiss();
    });

  }

  appointmentDeactivate() {
    console.log("delete");
    this.showConfirmAlert(this.activAppointment);
  }


  data_tree(nodes: TreeNode[]): any {
    for (let i = 0; i < nodes.length; i++) {
      this.listCustomer.push(nodes[i].data);
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

  closeModal() {
    this.viewCtrl.dismiss(false);
  }

  customerChange(event) {
    console.log('port:', event.value);
    console.log('customer:', this.customer);
  }

}
