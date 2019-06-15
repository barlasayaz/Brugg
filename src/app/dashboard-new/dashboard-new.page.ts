import { Component, NgZone, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController, AlertController, Events } from '@ionic/angular';
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

export class DashboardNewPage implements OnInit {
    public nextAppointment: any = [];
    public nextAppointmentAll: any = [];
    public params: any;
    public listInspection: any = [];
    public listInspectionAll: any = [];
    public loadCancelDashboard: any = 0;
    public selectedFilter: string = "";
    public filterValueLeft: string = "";
    public filterValue: string = "";
    public filterValueApp: string = "";
    public selectedEmployee: string = "0";
    public listeEmployee: any = [];
    // public display = 0;
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
    public disponent_view = false;
    public all_customer_view = false;
    public all_dates_view = false;
    public sortCustomerType = "customer_number";
    public sortAppointmentType = "appointment_date";

    constructor(public navCtrl: NavController,
        public apiService: ApiService,
        public excelService: ExcelService,
        public userdata: UserdataService,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public zone: NgZone,
        private translate: TranslateService,
        public modalCtrl: ModalController,
        private keyboard: Keyboard,
        public events: Events) {

    }

    ngOnInit() {
        this.cols = [
            { field: 'customer_number', header: '#' },
            { field: 'company', header: this.translate.instant('Firma') },
            { field: 'zip_code', header: this.translate.instant('PLZ') },
            { field: 'place', header: this.translate.instant('Ort') },
            { field: 'days10', header: this.translate.instant('10T') },
            { field: 'days30', header: this.translate.instant('30T') },
            { field: 'days90', header: this.translate.instant('90T') }
        ];

        this.loadTable();
        //this.loadListeEmployee();
        this.events.subscribe('className', (data) => {
            this.className = data;
            console.log(this.className);
        });
    }

    all_dates() {
        this.all_dates_view = !this.all_dates_view;
        console.log("all_dates() ", this.all_dates_view);
        this.nextAppointment = [];
        this.nextAppointmentAll = [];
        if (this.all_dates_view) {
            var today = new Date();
            var date_end = new Date();
            date_end.setDate(today.getDate() + 30);
            var date_start = new Date();
            date_start.setDate(today.getDate() - 1);
            let data = {
                user: this.userdata.id,
                licensee: this.userdata.licensee,
                date_start: date_start,
                date_end: date_end
            }
            this.apiService.pvs4_api_post("get_appointment_list_ps.php", data).then((done: any) => {//return the result
                let appointments: any = done.list;
                for (let i = 0; i < appointments.length; i++) {
                    let item = appointments[i].data;
                    if (!item.company) item.company = "";
                    if (!item.place) item.place = "";
                    let obj = {
                        id: item.id, idUser: item.idUser, appointment_date: item.appointment_date, start_time: item.start_time.slice(0, 5),
                        end_time: item.end_time.slice(0, 5), company: item.company, idCustomer: item.idCustomer, idContactPerson: item.idContactPerson,
                        place: item.place, appointment_type: item.appointment_type, appointment_type_text: item.appointment_type, notes: item.notes,
                        last_name: item.last_name
                    };

                    if (item.appointment_type == 0) {
                        obj.appointment_type_text = this.translate.instant('Kundenbesuch');
                    } else if (item.appointment_type == 1) {
                        obj.appointment_type_text = this.translate.instant('Prüfung');
                    } else if (item.appointment_type == 2) {
                        obj.appointment_type_text = this.translate.instant('Urlaub');
                        obj.company = "";
                        obj.place = "";
                    }
                    this.nextAppointment.push(obj);
                };
                this.nextAppointmentAll = JSON.parse(JSON.stringify(this.nextAppointment));
                this.progress_appointment(this.nextAppointment.length, this.nextAppointmentAll.length);
                this.search_all_app();
            },
                err => { // return the error
                    console.log("err get_appointment_list_ps.php ", err);
                });
        } else {
            this.loadAppointment();
        }
    }

    sortCustomerNum(type: string) {
        console.log('sortCustomer', type);
        this.sortCustomerType = type;
        this.zone.run(() => {
            this.listInspection.sort((a, b) => {
                let c = b[type] - a[type];
                //console.log('b[type] -  a[type] , c', b[type], a[type] , c);
                return c;
            });
        });
    }
    sortCustomerStr(type: string) {
        console.log('sortCustomer', type);
        this.sortCustomerType = type;
        this.zone.run(() => {
            this.listInspection.sort((a, b) => {
                let c = a[type].localeCompare(b[type]);
                //console.log('b[type] -  a[type] , c', b[type], a[type] , c);
                return c;
            });
        });
    }
    sortAppointment(type: string) {
        console.log('sortAppointment', type);
        this.sortAppointmentType = type;
        this.zone.run(() => {
            this.nextAppointment.sort((a, b) => {
                let c = a[type].localeCompare(b[type]);
                return c;
            });
        });
    }

    all_customer() {
        this.all_customer_view = !this.all_customer_view;
        this.get_customer_list_app();
    }
    show_disponent() {
        this.disponent_view = !this.disponent_view;
        if (this.disponent_view) {
            this.sortCustomerNum('days10');
        } else {
            this.sortCustomerStr('customer_number');
        }
    }

    downloadXLS() {
        let data: any = [];
        for (var i = 0, len = this.listInspection.length; i < len; i++) {
            let obj = this.listInspection[i];
            if (!obj.company) obj.company = "";
            if (!obj.place) obj.place = "";
            obj.company = obj.company.replace(/(\\r\\n|\\n|\\r)/gm, " ");
            obj.place = obj.place.replace(/(\\r\\n|\\n|\\r)/gm, " ");
            let json: any = {};
            for (var j = 0; j < this.cols.length; j++) {
                if (obj[this.cols[j].field]) {
                    json[this.cols[j].header] = obj[this.cols[j].field];
                } else {
                    json[this.cols[j].header] = "";
                }
            }
            console.log(">>json :", json);
            data.push(json);
        }
        this.excelService.exportAsExcelFile(data, 'upcoming_inspections.xlsx');
        this.selectedMitarbeiter = 0;
    }

    async loadTable() {
        console.log("loadTable()");
        let loader = await this.loadingCtrl.create({ spinner: "circles" });
        loader.present().then(done => {
            this.get_customer_list_app();
            this.loadAppointment();
            loader.dismiss();
        }, (err) => {
            loader.dismiss();
            console.log("Error: ", err);
            let alert = this.alertCtrl.create({ header: "Problem", message: err.message }).then(x => x.present());;
        });
    }

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
                    if (!item.company) item.company = "";
                    if (!item.place) item.place = "";
                    var obj = { id: item.id, idUser: item.idUser, company: item.company, idContactPerson: item.idContactPerson, place: item.place, date: item.appointment_date, time: item.start_time.slice(0, 5) };
                    this.listInspection.push(obj);
                }
            };
            console.log("listInspection:", this.listInspection);
            this.listInspectionAll = JSON.parse(JSON.stringify(this.listInspection));
        });

        this.progress_inspection(this.listInspection.length, this.listInspectionAll.length);
    }

    get_customer_list_app() {
        this.listInspection = [];
        this.listInspectionAll = [];
        this.apiService.pvs4_get_customer_list_app(this.all_customer_view).then((result: any) => {
            let customers = result.list;
            for (let i = 0; i < customers.length; i++) {
                let item = customers[i].data;
                let days10 = 0;
                let days30 = 0;
                let days90 = 0;
                try {
                    let days = JSON.parse(item.days);
                    days10 = days.days10;
                    days30 = days.days30;
                    days90 = days.days90;
                } catch (e) {
                    //nix
                }
                if (!item.company) item.company = "";
                if (!item.place) item.place = "";
                var obj = {
                    idCustomer: item.idCustomer, company: item.company, place: item.place, customer_number: item.customer_number
                    , zip_code: item.zip_code, days10: days10, days30: days30, days90: days90
                };
                this.listInspection.push(obj);
            };
            console.log("listInspection:", this.listInspection);
            this.listInspectionAll = JSON.parse(JSON.stringify(this.listInspection));
            this.progress_inspection(this.listInspection.length, this.listInspectionAll.length);
            this.search_all();
            if ((this.sortCustomerType == "days10") || (this.sortCustomerType == "days30") || (this.sortCustomerType == "days90")) {
                this.sortCustomerNum(this.sortCustomerType);
            } else {
                this.sortCustomerStr(this.sortCustomerType);
            }
        });

    }

    loadAppointment() {
        console.log("loadAppointment");

        this.apiService.pvs4_get_appointment_list().then((result: any) => {
            let appointments: any = result.list;
            for (let i = 0; i < appointments.length; i++) {
                let item = appointments[i].data;
                if (!item.company) item.company = "";
                if (!item.place) item.place = "";
                let obj = {
                    id: item.id, idUser: item.idUser, appointment_date: item.appointment_date, start_time: item.start_time.slice(0, 5),
                    end_time: item.end_time.slice(0, 5), company: item.company, idCustomer: item.idCustomer, idContactPerson: item.idContactPerson,
                    place: item.place, appointment_type: item.appointment_type, appointment_type_text: item.appointment_type, notes: item.notes
                };

                if (item.appointment_type == 0) {
                    obj.appointment_type_text = this.translate.instant('Kundenbesuch');
                } else if (item.appointment_type == 1) {
                    obj.appointment_type_text = this.translate.instant('Prüfung');
                } else if (item.appointment_type == 2) {
                    obj.appointment_type_text = this.translate.instant('Urlaub');
                    obj.company = "";
                    obj.place = "";
                }
                this.nextAppointment.push(obj);
            };
            this.nextAppointmentAll = JSON.parse(JSON.stringify(this.nextAppointment));
            this.progress_appointment(this.nextAppointment.length, this.nextAppointmentAll.length);
            this.search_all_app();
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
            }).then(x => x.present());
    }

    go(rowID) {
        console.log("go():", rowID);
        if (rowID > 0) this.navCtrl.navigateForward("/customer-details/" + rowID);
    }

    getEnterKeyboardClose(event) {
        console.log('getEnterKeyboardClose():', event.keyCode);
        if (event.keyCode == 13) this.keyboard.hide();
    }

    saveFilter() {
        console.log('saveFilter()');
        localStorage.setItem("stateDashboardFilter", JSON.stringify(this.selectedFilter));
        localStorage.setItem("stateDashboardFilterValue", JSON.stringify(this.filterValue));
        // this.customerFilters();
    };

    async newPrAppointment(row:any) {
        console.log("newPrAppointment", row); 
        if(row) { 
            await this.modalCtrl.create({
                component: AppointmentEditComponent,
                componentProps: {
                    idCustomer: row.idCustomer, appointmentType: 0, redirect: 3
                }
            }).then(x => x.present());
        }
        else
        {
            await this.modalCtrl.create({
                component: AppointmentEditComponent
            }).then(x => x.present());
        }

    }

    search_all() {
        this.listInspection = JSON.parse(JSON.stringify(this.listInspectionAll))
        for (let i = this.listInspection.length - 1; i >= 0; i--) {
            let s = this.filterValue.toLowerCase();
            let a = this.listInspection[i];
            let del = true;
            if (a.company && a.company != null && a.company.toLowerCase().indexOf(s) >= 0) del = false;
            if (a.place && a.place != null && a.place.toLowerCase().indexOf(s) >= 0) del = false;
            if (a.customer_number && a.customer_number != null && a.customer_number.toLowerCase().indexOf(s) >= 0) del = false;
            if (a.zip_code && a.zip_code != null && a.zip_code.toLowerCase().indexOf(s) >= 0) del = false;
            console.log(a, s, del, i);
            if (del) this.listInspection.splice(i, 1);
        }
        this.progress_inspection(this.listInspection.length, this.listInspectionAll.length);
    }


    search_all_app() {
        this.nextAppointment = JSON.parse(JSON.stringify(this.nextAppointmentAll))
        for (let i = this.nextAppointment.length - 1; i >= 0; i--) {
            let s = this.filterValueApp.toLowerCase();
            let a = this.nextAppointment[i];
            let del = true;
            if (a.company && a.company != null && a.company.toLowerCase().indexOf(s) >= 0) del = false;
            if (a.appointment_type_text && a.appointment_type_text != null && a.appointment_type_text.toLowerCase().indexOf(s) >= 0) del = false;
            if (this.all_dates_view) if (a.last_name.toLowerCase().indexOf(s) >= 0) del = false;
            console.log(a, s, del, i);
            if (del) this.nextAppointment.splice(i, 1);
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