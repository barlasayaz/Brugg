import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController , Platform } from '@ionic/angular';
import { ApiService } from '../services/api';
import { UserdataService } from '../services/userdata';
import { TranslateService } from '@ngx-translate/core';
// import { AppointmentEditComponent } from '../components/appointment-edit/appointment-edit.component';
// import { FullCalendarComponent } from '@fullcalendar/angular';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGrigPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction'; // for dateClick
// import frLocale from '@fullcalendar/core/locales/fr'
// import itLocale from '@fullcalendar/core/locales/it'
// import deLocale from '@fullcalendar/core/locales/de'
// import { DatePipe } from '@angular/common';
// import bootstrapPlugin from '@fullcalendar/bootstrap';
// import * as moment from 'moment';

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
    lang = localStorage.getItem('lang');
    public mobilePlatform = false;
    // public events: any[] = [];
    // public allEvents: any[] = [];
    // public people: any[] = [];
    // public calendarOptions: any;
    // public mouseoverButton1: boolean;
    // public mouseoverButton2: boolean;
    // public mouseoverButton3: boolean;
    // public mouseoverButton4: boolean;
    // public mouseoverButton5: boolean;
    // public viewMode = 0;
    // public peopleFilter = 'none';
    // public typeFilter = 99;
    // calendarPlugins = [dayGridPlugin, timeGrigPlugin, interactionPlugin, bootstrapPlugin]; 
    // headers =  {
    //     left: 'prev,next today',
    //     center: 'title',
    //     right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    // };
    // businessHours = {
    //     dow: [1, 2, 3, 4, 5], 
    //     start: '05:00', // a start time
    //     end: '18:00', // an end time
    // };
    // locales = [itLocale, frLocale, deLocale];
    // @ViewChild('calendar') calendarComponent: FullCalendarComponent;

    constructor(public navCtrl: NavController,
        public apiService: ApiService,
        public userdata: UserdataService,
        public modalCtrl: ModalController,
        private translate: TranslateService,
        public platform: Platform
        // private datePipe: DatePipe
    ) {
        console.log(this.lang);
        // this.peopleFilter = this.userdata.email.toLocaleLowerCase();
      /*  const today = new Date();
        const newdate = new Date();
        newdate.setDate(today.getDate() + 30);
        const newdate2 = new Date();
        newdate2.setDate(today.getDate() - 30);
        console.log(newdate + ' - ' + newdate2);

        this.eventsFunc(newdate2, newdate); */



        platform.ready().then(() => {
            if ( this.platform.is('ios') ||
              this.platform.is('android') ) {
            //   this.mobilePlatform = true;
            //   this.mouseoverButton1 = true;
            //   this.mouseoverButton2 = true;
            //   this.mouseoverButton3 = true;
            //   this.mouseoverButton4 = true;
            //   this.mouseoverButton5 = true;
              console.log('platform mobile:', this.platform.platforms());
            } else {
              console.log('platform not mobile:', this.platform.platforms());
            //   this.mobilePlatform = false;
            //   this.mouseoverButton1 = false;
            //   this.mouseoverButton2 = false;
            //   this.mouseoverButton3 = false;
            //   this.mouseoverButton4 = false;
            //   this.mouseoverButton5 = false;
            }
          });
    }

    // mouseover(buttonNumber) {
    //     if (buttonNumber == 1) {
    //         this.mouseoverButton1 = true;
    //     } else if (buttonNumber == 2) {
    //         this.mouseoverButton2 = true;
    //     } else if (buttonNumber == 3) {
    //         this.mouseoverButton3 = true;
    //     } else if (buttonNumber == 4) {
    //         this.mouseoverButton4 = true;
    //     } else if (buttonNumber == 5) {
    //         this.mouseoverButton5 = true;
    //     }
    // }

    // mouseout(buttonNumber) {
    //     if (this.mobilePlatform == false) {
    //         if (buttonNumber == 1) {
    //             this.mouseoverButton1 = false;
    //         } else if (buttonNumber == 2) {
    //             this.mouseoverButton2 = false;
    //         } else if (buttonNumber == 3) {
    //             this.mouseoverButton3 = false;
    //         } else if (buttonNumber == 4) {
    //             this.mouseoverButton4 = false;
    //         } else if (buttonNumber == 5) {
    //             this.mouseoverButton5 = false;
    //         }
    //     }
    // }

    // changeFilter() {
    //     console.log( 'changeFilter()', this.peopleFilter, this.typeFilter, this.allEvents.length );
    //     for (let k = 0; k < this.events.length; k++) { this.events.pop(); } // clear
    //     this.events = [];
    //     for (let k = 0; k < this.allEvents.length; k++) {
    //         if (this.peopleFilter == 'none') {
    //             if (this.typeFilter == 99 ) {
    //                 this.events.push( JSON.parse(JSON.stringify( this.allEvents[k] )) );
    //             } else {
    //                 if (this.typeFilter == this.allEvents[k].type) {
    //                     this.events.push( JSON.parse(JSON.stringify( this.allEvents[k] )) );
    //                 }
    //             }
    //         } else {
    //             if (this.allEvents[k].email.toLocaleLowerCase() == this.peopleFilter.toLocaleLowerCase() ) {
    //                 if (this.typeFilter == 99 ) {
    //                     this.events.push( JSON.parse(JSON.stringify( this.allEvents[k] )) );
    //                 } else {
    //                     if (this.typeFilter == this.allEvents[k].type) {
    //                         this.events.push( JSON.parse(JSON.stringify( this.allEvents[k] )) );
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    // eventsFunc(start: any, end: any) {
    //     this.apiService.pvs4_get_appointment_list_ps(start, end).then((result: any) => {
    //         this.events = [];
    //         this.allEvents = []
    //         const liste = [];
    //         for (let i = 0; i < result.list.length; i++) {
    //             const obj = result.list[i].data;
    //             liste.push(obj);
    //         }
    //         this.people = [];
    //         for (let k = 0; k < liste.length; k++) {
    //             const p = {'first_name': liste[k].first_name,
    //                        'last_name': liste[k].last_name,
    //                        'short_code': liste[k].short_code,
    //                        'email': liste[k].email };
    //             let n = true;
    //             for (let z = 0; z < this.people.length; z++) { 
    //                 if (this.people[z].email == liste[k].email ) { n = false; }
    //             }
    //             if (n) { this.people.push(p); } // nur neue personen

    //             let z1 = moment(liste[k].appointment_date + ' ' + liste[k].start_time, 'YYYY-MM-DD HH:mm:ss').toDate();
    //             let z2 = moment(liste[k].appointment_date + ' ' + liste[k].end_time, 'YYYY-MM-DD HH:mm:ss').toDate();

    //             if (z1.getHours() < 7) {
    //                 z1.setHours(7);
    //                 z1.setMinutes(0);
    //             }
    //             if (z1.getHours() > 19) {
    //                 z1.setHours(18);
    //                 z1.setMinutes(30);
    //             }
    //             if (z2.getHours() < 7) {
    //                 z2.setHours(7);
    //                 z2.setMinutes(30);
    //             }
    //             if (z2.getHours() > 19) {
    //                 z2.setHours(19);
    //                 z2.setMinutes(0);
    //             }

    //             let title = liste[k].short_code;
    //             if (liste[k].appointment_type == 2) {
    //                 title += ' (' + this.translate.instant('Urlaub') + ')';
    //             } else {
    //                 if ( liste[k].zip_code) title += ' ' + liste[k].zip_code;
    //                 if ( liste[k].company) title += ' ' + liste[k].company;
    //             }
    //             let note = liste[k].notes;
    //             if (note.length > 33) {
    //                 note = note.substr(0, 30) + '...';
    //             }
    //             title += ' ' + note;
    //             const t = { id: liste[k].id,
    //                         email: liste[k].email,
    //                         type: liste[k].appointment_type,
    //                         title: title,
    //                         start: z1,
    //                         end: z2,
    //                         allDay: false,
    //                         textColor: '#000',
    //                         backgroundColor: liste[k].colour,
    //                         borderColor: liste[k].colour };
    //             t.id = parseInt(t.id);

    //             this.events.push( JSON.parse(JSON.stringify(t)) );
    //             this.allEvents.push( JSON.parse(JSON.stringify(t)));
    //         }

    //         let startLastYear = moment(start,'YYYY-MM-DD').subtract(1,'years').format('YYYY-MM-DD');
    //         let endLastYear = moment(end,'YYYY-MM-DD').subtract(1,'years').format('YYYY-MM-DD');
    //         this.apiService.pvs4_get_appointment_list_ps(startLastYear, endLastYear).then((result: any) => {
    //             for (let i = 0; i < result.list.length; i++) {
    //                 const obj = result.list[i].data;

    //                 let nextYear = moment(obj.appointment_date,'YYYY-MM-DD').add(1,'years').format('YYYY-MM-DD');
    //                 let nextYearDate = moment(obj.appointment_date,'YYYY-MM-DD').add(1,'years').toDate();
    //                 let nextMonth = moment(new Date()).add(1,'months').toDate();
    //                 if(nextYearDate > new Date() && nextYearDate <= nextMonth && obj.reminder == 1 && obj.idUser == this.userdata.id)
    //                 {
    //                     console.log('reminder: ',  obj);
    //                     let appointment = liste.find(function (element, index, array){ return element.idCustomer == obj.idCustomer && element.appointment_date == nextYear; });
    //                     if(!appointment )
    //                     {
    //                         let title = obj.short_code;
    //                         if (obj.appointment_type == 2) {
    //                             title += ' (' + this.translate.instant('Urlaub') + ')';
    //                         } else {
    //                             if ( obj.zip_code) title += ' ' + obj.zip_code;
    //                             if ( obj.company) title += ' ' + obj.company;
    //                         }
    //                         let note = obj.notes;
    //                         if (note.length > 33) {
    //                             note = note.substr(0, 30) + '...';
    //                         }
    //                         title += ' ' + note;

    //                         let z1 = moment(obj.appointment_date + ' ' + obj.start_time, 'YYYY-MM-DD HH:mm:ss').add(1,'years').toDate();
    //                         let z2 = moment(obj.appointment_date + ' ' + obj.end_time, 'YYYY-MM-DD HH:mm:ss').add(1,'years').toDate();

    //                         if (z1.getHours() < 7) {
    //                             z1.setHours(7);
    //                             z1.setMinutes(0);
    //                         }
    //                         if (z1.getHours() > 19) {
    //                             z1.setHours(18);
    //                             z1.setMinutes(30);
    //                         }
    //                         if (z2.getHours() < 7) {
    //                             z2.setHours(7);
    //                             z2.setMinutes(30);
    //                         }
    //                         if (z2.getHours() > 19) {
    //                             z2.setHours(19);
    //                             z2.setMinutes(0);
    //                         }
    //                         const t = { id: 0,
    //                             old_id: obj.id,
    //                             email: obj.email,
    //                             type: obj.appointment_type,
    //                             title: title,
    //                             start: z1,
    //                             end: z2,
    //                             reminder: true,
    //                             allDay: false,
    //                             textColor: '#999',
    //                             backgroundColor: "white",
    //                             borderColor: "#bbb" };

    //                         this.events.push(t);
    //                         this.allEvents.push( JSON.parse(JSON.stringify(t)));
    //                     }
    //                 }
    //             }
    //         });
    //         console.log('events: ',  this.allEvents);
    //         this.changeFilter();
    //     });
    // }
    // loadEvents(model: any) {
    //     console.log('loadEvents(): ', model);
    //     let pipe = new DatePipe('en-US');

    //     const event_start = pipe.transform(model.view.activeStart, 'yyyy-MM-dd');
    //     const event_end = pipe.transform(model.view.activeEnd, 'yyyy-MM-dd');
    //     console.log('event_start: ', event_start);
    //     console.log('event_end: ', event_end);
    //     this.eventsFunc(event_start, event_end);
    // }
    //  handleEventClick(model: any) {
    //     console.log(model.event);
    //     let id = model.event.id;
    //     if(id == "0" && model.event.extendedProps.old_id)
    //     {
    //         id = model.event.extendedProps.old_id;
    //     }

    //     this.apiService.pvs4_get_appointment(id).then(async (result: any) => {
    //             if(model.event.extendedProps.old_id)
    //             {
    //                 result.obj.id = 0;
    //                 result.obj.appointment_date = moment(result.obj.appointment_date,'YYYY-MM-DD').add(1,'years').format('YYYY-MM-DD');
    //             }

    //             const modal: HTMLIonModalElement =
    //             await this.modalCtrl.create({
    //             component: AppointmentEditComponent,
    //             cssClass: 'appointmentedit-modal-css',
    //             componentProps: {
    //                 appointment: result.obj,
    //                 redirect: 2
    //             }
    //             });
    //             modal.onDidDismiss().then((data) => {
    //                 if (data['data']) {
    //                     const today = new Date();
    //                     const newdate = new Date();
    //                     newdate.setDate(today.getDate() + 30);
    //                     const newdate2 = new Date();
    //                     newdate2.setDate(today.getDate() - 30);
    //                     console.log(newdate + ' - ' + newdate2);
    //                     this.eventsFunc(newdate2, newdate);
    //                 }
    //             });
    //         modal.present();
    //     });
    // }

    // updateEvent(model: any) {
    //     console.log(model.event);
    //     let pipe = new DatePipe('en-US');

    //     const event_date = pipe.transform(model.event.start, 'yyyy-MM-dd');
    //     const start_time = pipe.transform(model.event.start, 'HH:mm');
    //     const end_time = pipe.transform(model.event.end, 'HH:mm');

    //     this.apiService.pvs4_get_appointment(model.event.id).then((result: any) => {
    //         console.log(result);
    //         if (result && result.obj) {
    //             result.obj.appointment_date = event_date;
    //             result.obj.start_time = start_time;
    //             result.obj.end_time = end_time;
    //             this.apiService.pvs4_set_appointment(result.obj);
    //         }
    //     });
    // }

    // async newAppointment() {
    //     console.log('newAppointment');
    //     const modal: HTMLIonModalElement =
    //     await this.modalCtrl.create({
    //       component: AppointmentEditComponent,
    //       cssClass: 'appointmentedit-modal-css',
    //       componentProps: {
    //         redirect: 2
    //       }
    //     });
    //     modal.onDidDismiss().then((data) => {
    //         if (data['data']) {
    //             const today = new Date();
    //             const newdate = new Date();
    //             newdate.setDate(today.getDate() + 30);
    //             const newdate2 = new Date();
    //             newdate2.setDate(today.getDate() - 30);
    //             console.log(newdate + ' - ' + newdate2);
    //             this.eventsFunc(newdate2, newdate);
    //         }
    //     });
    //   modal.present();
    // }

    // setView(nr: number) {
    //     console.log('setView():', nr);
    //     this.viewMode = nr;
    //     if ( nr == 0 ) {
    //         this.peopleFilter = this.userdata.email.toLocaleLowerCase();
    //         this.typeFilter = 99;
    //     } else  {
    //         this.peopleFilter = 'none';
    //     }

    //     if ( nr == 1 ) { this.typeFilter = 0; }
    //     if ( nr == 2 ) { this.typeFilter = 1; }
    //     if ( nr == 3 ) { this.typeFilter = 2; }

    //     this.changeFilter();
    // }
}

