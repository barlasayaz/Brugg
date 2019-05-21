import { Component,ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { UserdataService } from '../services/userdata';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AppointmentEditComponent } from '../components/appointment-edit/appointment-edit.component';
import { CalendarComponent } from 'ng-fullcalendar';
/**
 * Generated class for the TerminplanPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'app-appointment-plan',
    templateUrl: './appointment-plan.page.html',
    styleUrls: ['./appointment-plan.page.scss'],
})
export class AppointmentPlanPage {
    public events: any[] = [];
    @ViewChild('fullcalendar') fullcalendar: CalendarComponent;
    public calendarOptions: any;
    constructor(public navCtrl: NavController,
        public apiService: ApiService,
        public userdata: UserdataService,
        public modalCtrl: ModalController,
        private translate: TranslateService
        //private datePipe: DatePipe
    ) {
        this.calendarOptions = {
            editable: true,
            eventLimit: false,
            timeFormat: "H:mm",
            slotLabelFormat: "H:mm",
            weekHeader: "KW",
            dateFormat: "dd.mm.yy",
            businessHours: {
                dow: [1, 2, 3, 4, 5], // Monday - Thursday
                start: '7:00', // a start time (10am in this example)
                end: '18:00', // an end time (6pm in this example)
            },
            minTime: '6:00:00',
            header: {
                left: 'prev,next,today',
                center: 'title,',
                right: 'month,agendaWeek,agendaDay,listMonth'
            },
            events: []
        };
        let lang = localStorage.getItem('lang');
        console.log(lang);
        if (lang == 'fr') {
            this.calendarOptions.monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
            this.calendarOptions.monthNamesShort = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
            this.calendarOptions.dayNames = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
            this.calendarOptions.dayNamesShort = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
            this.calendarOptions.dayNamesMin = ["D", "L", "M", "M", "J", "V", "S"];
            this.calendarOptions.buttonText = {
                year: "Année",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                list: "Mon planning",
                today: "Aujourd'hui"
            };
        }
        if (lang == 'de') {
            this.calendarOptions.monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
            this.calendarOptions.monthNamesShort = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
            this.calendarOptions.dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
            this.calendarOptions.dayNamesShort = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
            this.calendarOptions.dayNamesMin = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
            this.calendarOptions.buttonText = {
                month: "Monat",
                week: "Woche",
                day: "Tag",
                list: "Terminübersicht",
                today: "Heute"
            };
        }
        if (lang == 'it') {
            this.calendarOptions.monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
            this.calendarOptions.monthNamesShort = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
            this.calendarOptions.dayNames = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
            this.calendarOptions.dayNamesShort = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
            this.calendarOptions.dayNamesMin = ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"];
            this.calendarOptions.buttonText = {
                month: "Mese",
                week: "Settimana",
                day: "Giorno",
                list: "Agenda",
                today: "Oggi"
            };
        }
        var today = new Date();
        var newdate = new Date();
        newdate.setDate(today.getDate() + 30);
        var newdate2 = new Date();
        newdate2.setDate(today.getDate() - 30);
        console.log(newdate + ' - ' + newdate2);

        this.eventsFunc(newdate2, newdate);

    }

    eventsFunc(start, end) {

        this.apiService.pvs4_get_appointment_list_ps(start, end).then((result: any) => {
            this.events = [];
            let liste = [];
            for (let i = 0; i < result.list.length; i++) {
                let obj = result.list[i].data;
                liste.push(obj);
            }

            for (let k = 0; k < liste.length; k++) {
                let z1 = new Date(liste[k].appointment_date + ' ' + liste[k].start_time);
                let z2 = new Date(liste[k].appointment_date + ' ' + liste[k].end_time);

                if (z1.getHours() < 7) {
                    z1.setHours(7);
                    z1.setMinutes(0);
                }
                if (z1.getHours() > 19) {
                    z1.setHours(18);
                    z1.setMinutes(30);
                }
                if (z2.getHours() < 7) {
                    z2.setHours(7);
                    z2.setMinutes(30);
                }
                if (z2.getHours() > 19) {
                    z2.setHours(19);
                    z2.setMinutes(0);
                }

                let title = liste[k].company;
                if (liste[k].appointment_type == 2) title = liste[k].company + ' (' + this.translate.instant('Urlaub') + ')';
                let t = { id: liste[k].id, title: title, start: z1, end: z2, allDay: false, textColor: "white" };
                t.id = parseInt(t.id);

                this.events.push(t);
            }
            console.log("events: ", this.events);
        });
    }
    loadEvents(model: any) {
        console.log("loadEvents(): ", model);
        let event_start = model.view.start.format("YYYY-MM-DD");
        let event_end = model.view.end.format("YYYY-MM-DD");
        console.log("event_start: ", event_start);
        console.log("event_end: ", event_end);
        this.eventsFunc(event_start, event_end);
    }
    handleEventClick(model: any) {
        console.log(model.event);
         this.apiService.pvs4_get_appointment(model.event.id).then(async (result: any) => {
            const modal: HTMLIonModalElement =
            await this.modalCtrl.create({
              component: AppointmentEditComponent,
              componentProps: {
                appointment: result.obj,
                redirect: 2
              }
            });

          modal.present();

        });
    }

    updateEvent(model: any) {
        console.log(model.event);
        let event_date = model.event.start.format("YYYY-MM-DD");
        let start_time = model.event.start.format('HH:mm');
        let end_time = model.event.end.format('HH:mm');
        this.apiService.pvs4_get_appointment(model.event.id).then((result: any) => {
            console.log(result);
            if (result && result.obj) {
                result.obj.appointment_date = event_date;
                result.obj.start_time = start_time;
                result.obj.end_time = end_time;
                this.apiService.pvs4_set_appointment(result.obj);
            }
        });
    }

    async newPrAppointment() {
        console.log("newPrAppointment");
        const modal: HTMLIonModalElement =
        await this.modalCtrl.create({
          component: AppointmentEditComponent,
          componentProps: {
            redirect: 2
          }
        });

      modal.present();
    }

}


