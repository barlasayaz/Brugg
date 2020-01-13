import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { UserdataService } from '../../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api';
import { DatePipe } from '@angular/common';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.scss']
})
export class NoteEditComponent {

  public modalTitle: string;
  public idCustomer: number = 0;
  public idNote: number = 0;
  public itsNew: boolean = false;
  public activNote: any = { user: this.userdata.id,
                            active: 1,
                            title: '',
                            contact_person: 0,
                            customer: this.idCustomer,
                            notes: '',
                            notes_date: '',
                            id: 0,
                            category: 1};
  public redirect: any = 0;
  public maxDate: string;
  public userList: any = [];
  public selectedContact: any = {};

  constructor(  public navCtrl: NavController,
                public navParams: NavParams,
                public translate: TranslateService,
                public userdata: UserdataService,
                public viewCtrl: ModalController,
                public apiService: ApiService,
                public alertCtrl: AlertController,
                private toastCtrl: ToastController) {
    this.maxDate = this.apiService.maxDate;
    this.idNote = this.navParams.get('id'); 
    this.idCustomer = this.navParams.get('idCustomer');
    this.redirect = this.navParams.get('redirect');

    this.selectedContact = '';
    this.activNote.category = '';
    if (this.idNote > 0) {
      this.itsNew = false;
      this.modalTitle = translate.instant('Bearbeiten Notiz');
      this.loadNote();
    } else {
      this.idNote = 0;
      this.itsNew = true;
      this.modalTitle = translate.instant('Neue Notiz');
      this.activNote.notes_date = new Date().toISOString();
      this.loadUserList(0);
    }
    console.log('NoteEditComponent: ' , this.idNote);
  }

  loadNote() {
    this.apiService.pvs4_get_note(this.idNote).then((result: any) => {
      this.activNote = result.obj;
      this.activNote.contact_person = parseInt(this.activNote.contact_person);
      console.log('activeNote :', this.activNote, result.obj.notes_date.replace(' ', 'T'));
      result.obj.notes_date = result.obj.notes_date.replace(' ', 'T');
      if (result.obj.notes_date && result.obj.notes_date != null && new Date(result.obj.notes_date) >= new Date(1970, 0, 1)) {
        this.activNote.notes_date = new Date(result.obj.notes_date).toISOString();
      }
      console.log('loadNote: ' , this.activNote);
      this.loadUserList(this.activNote.contact_person);
    });
  }

  loadCustomer(id) {
    this.apiService.pvs4_get_customer(id).then((result: any) => {
      this.activNote.company = result.obj.company;
    });
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  noteEdit() {
    console.log('noteEdit()');
    if (this.activNote.title == '') {
      this.mandatoryMsg();
      return;
    }
    if (this.selectedContact == null) {
      this.mandatoryMsg();
      return;
    }
    if (this.activNote.category == null) {
      this.mandatoryMsg();
      return;
    }
    if (this.activNote.category == '') {
      this.mandatoryMsg();
      return;
    }
    if (this.activNote.notes == '') {
      this.mandatoryMsg();
      return;
    }

    let obj = {
        user: 0,
        active: 1,
        title: '',
        contact_person: 0,
        customer: this.idCustomer,
        notes: '',
        notes_date: '',
        id: 0,
        category: 1
    };

    if (this.activNote['user'] == 0) { obj.user = this.userdata.id; } else { obj.user = parseInt(this.activNote['user']); }
    if (this.activNote['active']) { obj.active = parseInt(this.activNote['active']); }
    if (this.activNote['customer']) { obj.customer = parseInt(this.activNote['customer']); }
    if (this.activNote['title']) { obj.title = this.activNote['title']; }
    obj.contact_person = parseInt(this.selectedContact.id);
    if (this.activNote['notes']) { obj.notes = this.activNote['notes']; }
    if (this.activNote['category']) { obj.category = parseInt(this.activNote['category'] ); }
    let pipe = new DatePipe('en-US');
    if (this.activNote['notes_date']) { obj.notes_date = pipe.transform(this.activNote['notes_date'], 'yyyy-MM-dd HH:mm'); } 
    console.log(obj);
    if (!this.itsNew) {
      obj.id = this.activNote['id'];
      this.idNote = this.activNote['id'];
    } else {
      this.activNote.active = 1;
    }

    this.apiService.pvs4_set_note(obj).then((result: any) => {
      console.log('result - redirect: ', result, '- ', this.redirect);
      if (this.itsNew && obj.category == 1)
      {
        this.apiService.pvs4_get_appointment_list().then((result: any) => {
          console.log('create appointment ');
          let appointments: any = result.list;
          let existingAppointment = false;
          let today = pipe.transform(new Date(), 'yyyy-MM-dd');
          for (let index = 0; index < appointments.length; index++) {
            const element = appointments[index].data;
            if(element.appointment_date == today && element.appointment_type == 0 && element.idCustomer == this.idCustomer)
            {
              existingAppointment = true;
              break;
            }
          }
          if(!existingAppointment)
          {
            let appointmentObj = {
              active: 1,
              appointment_type: 0,
              idCustomer: this.idCustomer,
              idContactPerson: this.selectedContact.id,
              idUser: this.userdata.id,
              licensee: this.userdata.licensee,
              notes: obj.notes,
              appointment_date: pipe.transform(obj.notes_date, 'yyyy-MM-dd'),
              id: 0,
              start_time: pipe.transform(this.activNote['notes_date'], 'HH:mm'),
              end_time: pipe.transform(this.activNote['notes_date'], 'HH:mm')
            };
            this.apiService.pvs4_set_appointment(appointmentObj).then((result: any) => {
              console.log('create appointment ');
            });
          }
      });
      }
      if (this.redirect == 1) {
        this.viewCtrl.dismiss(true);
      }
      if (this.redirect == 2) {
        this.dismiss();
      }
    });

  }

  noteDeactivate() {
    console.log('delete');
    this.showConfirmAlert(this.activNote);
  }

  showConfirmAlert(activNote) {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Achtung'),
      message: this.translate.instant('Möchten Sie diese Notiz wirklich deaktivieren'),
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
            activNote.active = 0;
            let pipe = new DatePipe('en-US');
            if (this.activNote['notes_date']) {
              this.activNote['notes_date'] = pipe.transform(this.activNote['notes_date'], 'yyyy-MM-dd HH:mm:ss');
            }
            this.apiService.pvs4_set_note(activNote).then((result: any) => {
              console.log('result: ', result); 
              this.viewCtrl.dismiss(true);
            });
          }
        }
      ]
    }).then(x => x.present());
  }

  closeModal() {
    this.viewCtrl.dismiss(false);
  }

  loadUserList(idContactPerson: any) {
    // Point of Contact
    this.userList = [];
    this.apiService.pvs4_get_contact_person(this.idCustomer).then((result: any) => {
      console.log('loadUserList result', result.list);
      this.selectedContact = null;
      for (var i = 0, len = result.list.length; i < len; i++) {
        var item = result.list[i].data;
        item.id = parseInt(item.id);
        try
        {
          item.addresses = JSON.parse(item.addresses);
        }
        catch{
           console.error('JSON.parse err', item.addresses) ;
        }

        let contactPersonList = {id: item.id, name: item.first_name + ' ' + item.last_name};
        this.userList.push(contactPersonList);
        if (idContactPerson == item.id) {
          this.selectedContact = contactPersonList;
        }
      }
      this.loadCustomer(this.idCustomer);
    });
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
