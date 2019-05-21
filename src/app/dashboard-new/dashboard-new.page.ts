import { Component } from '@angular/core';
import { NavController, LoadingController,ModalController, AlertController, Events } from '@ionic/angular';
import { ApiService } from '../services/api';
import { UserdataService } from '../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ExcelService } from '../services/excel';
import { AppointmentEditComponent } from '../components/appointment-edit/appointment-edit.component';
import { Keyboard } from '@ionic-native/keyboard/ngx';



@Component({
    selector: 'app-dashboard-new',
    templateUrl: './dashboard-new.page.html',
    styleUrls: ['./dashboard-new.page.scss'],
})

export class DashboardNewPage {
    public nextAppointment: any = [];
    public nextAppointmentAll: any = [];
    public params: any;
    public listInspection: any = [];
    public listInspectionAll: any = [];
    public loadCancelDashboard: any = 0;
    public customerListe: any = [];
    public customerListeDisplayed: any = [];
    public customerListeFilters: any = [];
    public selectedFilter: string = "";
    public filterValueLeft: string = "";
    public filterValue: string = "";
    public filterValueApp: string = "";
    public selectedEmployee: string = "0";
    public listeEmployee: any = [];
    public className: string = "showdashfirst";
    public selectedMitarbeiter: any;
    public progressBarAppointment: any = 0;
    public progressBarInspection: any = 0;
    public rowRecordsAppointment: number = 0;
    public totalRecordsAppointment: number = 0;
    public rowRecordsInspection: number = 0;
    public totalRecordsInspection: number = 0;
    public selectedColumns: any[];
    public cols: any[] = [];
    private loader: HTMLIonLoadingElement;

    constructor(public navCtrl: NavController,
        public apiService: ApiService,
        public excelService: ExcelService,
        public userdata: UserdataService,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        private translate: TranslateService,
        public modalCtrl: ModalController,
        private keyboard: Keyboard,
        public events: Events) {

        this.cols = [
            { field: 'customer_number', header: this.translate.instant('#') },
            { field: 'company', header: this.translate.instant('Firma') },
            { field: 'zip_code', header: this.translate.instant('PLZ') },
            { field: 'place', header: this.translate.instant('Ort') },
        ];
        this.selectedColumns = this.cols;

        this.loadTable();
        //this.loadListeEmployee();
        this.events.subscribe('className', (data) => {
            this.className = data;
            console.log(this.className);
        });
    }

    downloadXLS() {
        let data: any = [];
        for (var i = 0, len = this.listInspection.length; i < len; i++) {
            let obj = this.listInspection[i];
            obj.company = obj.company.replace(/(\\r\\n|\\n|\\r)/gm, " ");
            obj.place = obj.place.replace(/(\\r\\n|\\n|\\r)/gm, " ");
            let json: any = {};
            for (var j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field]) {
                    json[this.selectedColumns[j].header] = obj[this.selectedColumns[j].field];
                } else {
                    json[this.selectedColumns[j].header] = "";
                }
            }
            console.log(">>json :", json);
            data.push(json);
        }
        this.excelService.exportAsExcelFile(data, 'upcoming_inspections.xlsx');
        this.selectedMitarbeiter = 0;
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DashboardNewPage');
    }


    async loadTable() {
        console.log("loadTable()");
        if (!this.loader) {
            this.loader = await this.loadingCtrl.create({ spinner: "circles" });
        }
        this.loader.present().then(done => {
            this.get_customer_list_app();
            this.loadAppointment();
            this.hideLoader();
        }, (err) => {
            this.hideLoader();
            console.log("Error: ", err);
            let alert = this.alertCtrl.create({ header: "Problem", message: err.message }).then(x => x.present());
        });

    }
    async hideLoader() {
        if (this.loader) {
            await this.loader.dismiss();
            this.loader = null;
        }
    }
    /* loadCustomer() {
         console.log("loadCustomer()");
         this.params = { "user": this.userdata.id };
         console.log(this.params);
         this.apiService.pvs4_get_customer_list(this.userdata.id, 0).then((result: any) => {
             let customerList = result.list;
             for (let i = 0; i < customerList.length; i++) {
                 let item = customerList[i].data;
 
                 var obj = { id: item.idCustomer, customer_number: item.customer_number, company: item.company, place: item.place, zip_code: item.zip_code };
                 this.listeCustomer.push(obj);
             };
             console.log(this.listeCustomer);
             this.listeCustomerAll = JSON.parse(JSON.stringify(this.listeCustomer));
         });
     } */

    get_appointment_list_ps(days) {
        console.log("get_appointment_list_ps() : ", days);
        let dat = new Date();
        dat.setDate(dat.getDate() + days);
        let dat2 = new Date();
        let date1 = this.apiService.date2mysql(new Date(dat2.getFullYear(), 0, 1), true);
        let date2 = this.apiService.date2mysql(dat, true);
        console.log("date1 : ", date1);
        console.log("date2 : ", date2);
        //Date
        this.apiService.pvs4_get_appointment_list_ps(date1, date2).then((result: any) => {
            let appointments = result.list;
            for (let i = 0; i < appointments.length; i++) {
                let item = appointments[i].data;
                if (item.appointment_type == 1) {
                    var obj = { id: item.id, company: item.company, place: item.place, date: item.appointment_date, time: item.start_time.slice(0, 5) };
                    this.listInspection.push(obj);
                }
            };
            console.log("listInspection:", this.listInspection);
            this.listInspectionAll = JSON.parse(JSON.stringify(this.listInspection));
        });

        this.progress_inspection(this.listInspection.length, this.listInspectionAll.length);
    }

    get_customer_list_app() { //days
        this.apiService.pvs4_get_customer_list_app().then((result: any) => {
            let customers = result.list;
            for (let i = 0; i < customers.length; i++) {
                let item = customers[i].data;
                var obj = { idCustomer: item.idCustomer, company: item.company, place: item.place, customer_number: item.customer_number, zip_code: item.zip_code, appointment_type: 1 }; // date: item.appointment_date, time:item.start_time.slice(0, 5)
                this.listInspection.push(obj);
            };
            console.log("listInspection:", this.listInspection);
            this.listInspectionAll = JSON.parse(JSON.stringify(this.listInspection));

            this.progress_inspection(this.listInspection.length, this.listInspectionAll.length);
        });

    }

    loadAppointment() {
        console.log("loadAppointment");

        this.apiService.pvs4_get_appointment_list().then((result: any) => {
            let appointments: any = result.list;
            for (let i = 0; i < appointments.length; i++) {
                let item = appointments[i].data;
                let obj = {
                    id: item.id, appointment_date: item.appointment_date, start_time: item.start_time.slice(0, 5),
                    end_time: item.end_time.slice(0, 5), company: item.company, idCustomer: item.idCustomer, place: item.place,
                    appointment_type: item.appointment_type, appointment_type_text: item.appointment_type, notes: item.notes
                };

                if (item.appointment_type == 0) {
                    obj.appointment_type_text = this.translate.instant('Kundenbesuch');
                } else if (item.appointment_type == 1) {
                    obj.appointment_type_text = this.translate.instant('Prüfung');
                } else if (item.appointment_type == 2) {
                    obj.appointment_type_text = this.translate.instant('Urlaub');
                }

                this.nextAppointment.push(obj);

            };
            this.nextAppointmentAll = JSON.parse(JSON.stringify(this.nextAppointment));
            /* this.listInspection = this.nextAppointment.filter(x=>x.appointment_type == 1);
             this.listInspectionAll = JSON.parse(JSON.stringify(this.listInspection));*/

            this.progress_appointment(this.nextAppointment.length, this.nextAppointmentAll.length);
            // this.progress_inspection(this.listInspection.length, this.listInspectionAll.length);
        });
    }

    maskDate(date: any) {
        let date_js = this.apiService.mysql2date(date + ' 00:00:00');
        let Weekday = new Array("So", "Mo", "Di", "Mi", "Do", "Fr", "Sa");
        let day: any = date_js.getDate();
        if (day < 10) { day = '0' + day }
        let month: any = date_js.getMonth() + 1;
        if (month < 10) { month = '0' + month }
        let year: any = date_js.getFullYear();
        return Weekday[date_js.getDay()] + ' ' + day + '.' + month + '.' + year;
    }

    async editAppointment(appointment) {
        console.log("editAppointment() : ", appointment);
        const modal =
        await this.modalCtrl.create({
          component: AppointmentEditComponent,
          componentProps: {
            appointment: appointment, redirect: 1
          }
        });
        modal.present();
    }

    go(rowID) {
        console.log("go():", rowID);
        if (rowID) this.navCtrl.navigateForward("/customer-details/"+rowID);
    }

    getEnterKeyboardClose(event) {
        console.log('getEnterKeyboardClose():', event.keyCode);
        if (event.keyCode === 13) this.keyboard.hide();
    }

    saveFilter() {
        console.log('saveFilter()');
        localStorage.setItem("stateDashboardFilter", JSON.stringify(this.selectedFilter));
        localStorage.setItem("stateDashboardFilterValue", JSON.stringify(this.filterValue));
        // this.customerFilters();
    };

    async newPrAppointment(row) {
        console.log("newPrAppointment");
        const modal =
        await this.modalCtrl.create({
          component: AppointmentEditComponent,
          componentProps: {
            appointment: row, redirect: 1
          }
        });
        modal.present();
    }

    search_all() {
        this.listInspection = JSON.parse(JSON.stringify(this.listInspectionAll))
        for (let i = this.listInspection.length - 1; i >= 0; i--) {
            if (this.listInspection[i].company.toLowerCase().indexOf(this.filterValue.toLowerCase()) < 0 &&
                this.listInspection[i].place.toLowerCase().indexOf(this.filterValue.toLowerCase()) < 0 &&
                this.listInspection[i].customer_number.toLowerCase().indexOf(this.filterValue.toLowerCase()) < 0 &&
                this.listInspection[i].zip_code.toLowerCase().indexOf(this.filterValue.toLowerCase()) < 0) {
                this.listInspection.splice(i, 1);
            }
        }
        this.progress_inspection(this.listInspection.length, this.listInspectionAll.length);
    }


    search_all_app() {
        this.nextAppointment = JSON.parse(JSON.stringify(this.nextAppointmentAll))
        for (let i = this.nextAppointment.length - 1; i >= 0; i--) {
            if (this.nextAppointment[i].company.toLowerCase().indexOf(this.filterValueApp.toLowerCase()) < 0 && this.nextAppointment[i].appointment_type_text.toLowerCase().indexOf(this.filterValueApp.toLowerCase()) < 0)
                this.nextAppointment.splice(i, 1);
        }
        this.progress_appointment(this.nextAppointment.length, this.nextAppointmentAll.length);
    }

    progress_appointment(rowRecords, totalRecords) {
        this.rowRecordsAppointment = rowRecords;
        this.totalRecordsAppointment = totalRecords;
        if (totalRecords > 0) {
            this.progressBarAppointment = Math.round(rowRecords * 100 / totalRecords);
        } else {
            this.progressBarAppointment = 0;
        }
    }

    progress_inspection(rowRecords, totalRecords) {
        this.rowRecordsInspection = rowRecords;
        this.totalRecordsInspection = totalRecords;
        if (totalRecords > 0) {
            this.progressBarInspection = Math.round(rowRecords * 100 / totalRecords);
        } else {
            this.progressBarInspection = 0;
        }
    }

    onSelectClose() {

    }

    goStatistik() {

    }
}