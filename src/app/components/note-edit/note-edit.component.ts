import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { UserdataService } from '../../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.scss']
})
export class NoteEditComponent {

  public inputError: boolean = false;
  public modalTitle: string;
  public idCustomer: number = 0;
  public idNote: number = 0;
  public invalidForm = true;
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
                public alertCtrl: AlertController) {
    this.maxDate = this.apiService.maxDate;
    this.idNote = this.navParams.get('id'); 
    this.idCustomer = this.navParams.get('idCustomer');
    this.redirect = this.navParams.get('redirect');

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
      console.log('activeNote :', this.activNote);
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
    if (this.activNote.title.trim() == undefined || this.activNote.title.trim() == '') {
      this.inputError = true;
      return;
    }
    if (this.activNote.notes.trim() == undefined || this.activNote.notes.trim() == '') {
      this.inputError = true;
      return;
    }
    if (this.selectedContact.id == undefined || this.selectedContact.id == '') {
      this.inputError = true;
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
      if (this.redirect == 1) {
      this.navCtrl.navigateForward('/note-list/' + this.idCustomer);
      this.dismiss();
      }
      if (this.redirect == 2) {
        this.dismiss();
      }
    });

  }

  checkInvalidForm() {
    let t1 = this.activNote.title.trim();
    let t2 = this.activNote.notes.trim();
    let t3 = this.selectedContact.id;
    this.invalidForm = false;
    if (t1 == '') { this.invalidForm = true; }
    if (t2 == '') { this.invalidForm = true; }
    if (t3 == undefined) { this.invalidForm = true; }
  }

  noteDeactivate() {
    console.log('delete');
    this.showConfirmAlert(this.activNote);
  }

  showConfirmAlert(activNote) {
    let alert = this.alertCtrl.create({
      header: 'Confirm deactivate note',
      message: 'Are you sure you want to deactivate this note',
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
            activNote.active = 0;
            let pipe = new DatePipe('en-US');
            if (this.activNote['notes_date']) {
              this.activNote['notes_date'] = pipe.transform(this.activNote['notes_date'], 'yyyy-MM-dd HH:mm:ss');
            }
            this.apiService.pvs4_set_note(activNote).then((result: any) => {
              console.log('result: ', result); 
              this.navCtrl.navigateForward('/note-list/' + this.idCustomer);
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
      for (var i = 0, len = result.list.length; i < len; i++) {
        var item = result.list[i].data;
        item.id = parseInt(item.id);
        item.addresses = JSON.parse(item.addresses);
        let contactPersonList = {id: item.id, name: item.first_name + ' ' + item.last_name};
        this.userList.push(contactPersonList);
        if (idContactPerson == item.id) {
          this.selectedContact = contactPersonList;
        }
      }
      this.loadCustomer(this.idCustomer);
    });
  }

  userChange(event) {
    console.log('port:', event.value);
    this.checkInvalidForm()
  }

}
