import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api';
import { UserdataService } from '../../services/userdata';

/**
 * Generated class for the MyDataEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-my-data-edit',
  templateUrl: './my-data-edit.page.html',
  styleUrls: ['./my-data-edit.page.scss'],
})

export class MyDataEditPage {
  public inputError: boolean = false;
  public params: any;
  public pid: number;
  public edit: any = {bid: {}, role_set: []};
  public Farbe: string;
  public editType: number;
  public role: number;
  public role_nr: number;
  public role_set: any = {
    edit_customer: false,
    edit_membership: false,
    edit_rights: false,
    edit_products: false,
    check_products: false,
    edit_contact_persons: false,
    edit_product_templates: false,
    edit_protocol_templates: false,
    licensee: 5
  };
  public setRights: boolean;
  editMembership = false;
  public emailToFind: string;
  public viewNewMode: number;
  public viewNewObj: any = {first_name: '', last_name: '' };

  constructor(public navCtrl: NavController, 
              public userdata: UserdataService, 
              public navParams: NavParams, 
              public translate: TranslateService,
              private api : ApiService,
              public viewCtrl: ModalController,
              public alertCtrl: AlertController) {
    console.log('my-data-edit.ts');
    this.pid = 0;
    this.Farbe = '#000fff';
    this.editType = 0;
    this.role = 0;
    this.role_nr = 0;
    this.setRights = false;
    this.viewNewMode = 0;
    this.pid = parseInt( this.navParams.get('pid') );
    this.role = parseInt( this.navParams.get('role') );
    this.role_nr = parseInt( this.navParams.get('role_nr') );
    this.editType = parseInt( this.navParams.get('editType') );
    if (this.role == 2) {
      this.role_set.edit_customer = false;
      this.role_set.edit_membership = false;
      this.role_set.edit_rights = false;
      this.role_set.edit_products = false;
      this.role_set.check_products = false;
      this.role_set.edit_contact_persons = false;
      this.role_set.edit_product_templates = false;
      this.role_set.edit_protocol_templates = false;
      this.role_set.licensee = this.userdata.licensee;
    }
    this.editData(this.pid);
  }

  dismiss() {
    this.viewCtrl.dismiss({'update': false});
  }

  editData(pid: number) {
    console.log('editData() ', pid,  this.userdata.profile);
    this.setRights = false;
    if (pid != this.userdata.profile) {
      if (this.userdata.role_set.edit_rights) { this.setRights = true; }
      if (this.userdata.role_set.edit_membership) { this.editMembership = true; }
       
    }
    if (pid != 0) {
      this.api.pvs4_get_mydata(this.pid).then((result: any) => {
        console.log('pvs4_get_mydata: ', result['obj']);
        this.edit = result['obj'];
      });
    }
  }

  inputErrorMsg() {
    this.inputError = false;
  }

  findEmail() {
    console.log('findEmail emailToFind:', this.emailToFind);
    this.api.pvs4_get_profile(this.emailToFind, 1).then((done: any) => {
      if (done.amount == 0) {
        this.viewNewMode = 1;
      } else {
        this.viewNewMode = 2;
        this.viewNewObj  = done.obj;
        this.viewNewObj.last_name  = done.bid.last_name;
        this.viewNewObj.first_name = done.bid.first_name;
      }
    });
  }

  addUser() {
    console.log('addUser:', this.viewNewObj, this.role);
    this.api.pvs4_get_profile(this.viewNewObj.email).then((done: any) => {
      done = done.obj;

      if (this.role == 1) {
        done.system_role = JSON.parse(done.system_role );
        done.system_role[done.system_role.length]   = this.role_set;
        done.system_role = JSON.stringify(done.system_role );
      }
      if (this.role == 2) {
        done.licensee_role = JSON.parse(done.licensee_role ); 
        let x = done.licensee_role.length;
        for (let i = 0; i < x; i++) {
          if (done.licensee_role[i].licensee == this.role_set.licensee) { x = i; }
        }
        done.licensee_role[x] = this.role_set;
        done.licensee_role = JSON.stringify(done.licensee_role );
      }
      if (this.role == 3) {
        done.customer_role = JSON.parse(done.customer_role );
        done.customer_role[done.customer_role.length] = this.role_set;
        done.customer_role = JSON.stringify(done.customer_role );
      } 

      this.api.pvs4_set_profile(done).then((done: any) => {
          console.log('addUser pvs4_set_profile() ok ');
          this.viewCtrl.dismiss({'update': true});
      },
        err => { // return the error
          console.error('MyDataEditPage pvs4_set_profile() nok ', err);
      });
    },
      err => { // return the error
        console.error('MyDataEditPage pvs4_get_profile() nok ', err)
    });
  }

  updateData( ) {
    console.log('updateData this.edit:', this.edit);

    this.inputError = false;
    if (this.edit.short_code == '') {
      this.inputError = true;
      return;
    }

    this.api.pvs4_get_profile(this.edit.email).then((done: any) => {
      done = done.obj;

      if (this.role == 1) {
        done.system_role = JSON.parse(done.system_role );
        done.system_role[this.role_nr]   = this.edit.role_set;
        done.system_role = JSON.stringify(done.system_role );
      }
      if (this.role == 2) {
        done.licensee_role = JSON.parse(done.licensee_role );
        done.licensee_role[this.role_nr] = this.edit.role_set;
        done.licensee_role = JSON.stringify(done.licensee_role );
      }
      if (this.role == 3) {
        done.customer_role = JSON.parse(done.customer_role );
        done.customer_role[this.role_nr] = this.edit.role_set;
        done.customer_role = JSON.stringify(done.customer_role );
      }

      done.short_code = this.edit.short_code;
      done.colour = this.edit.colour;

      console.log('updateData pvs4_get_profile():', done);
      this.api.pvs4_set_profile(done).then((done: any) => {
          console.log('updateData pvs4_set_profile() ok ');
          this.viewCtrl.dismiss({'update': true});
      },
        err => { // return the error
          console.error('MyDataEditPage pvs4_set_profile() nok ', err);
      });
    },
      err => { // return the error
        console.error('MyDataEditPage pvs4_get_profile() nok ', err);
    });
  }

  employeeDeactivate()
  {
    let alert = this.alertCtrl.create({
        header: this.translate.instant('Achtung'),
        message: this.translate.instant('Möchten Sie diesen Benutzer wirklich deaktivieren?'),
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
              this.api.pvs4_get_profile(this.edit.email).then((done: any) => {
                done = done.obj;
                done.licensee_role = JSON.parse(done.licensee_role );
                let x = done.licensee_role.length;
                for (let i = 0; i < x; i++) {
                  if (done.licensee_role[i].licensee == this.role_set.licensee) 
                  {
                    done.licensee_role.splice(i,1);
                    done.licensee_role = JSON.stringify(done.licensee_role );
                    console.log('updateData pvs4_get_profile():', done);
                    this.api.pvs4_set_profile(done).then((done: any) => {
                        console.log('updateData pvs4_set_profile() ok ');
                        this.viewCtrl.dismiss({'update': true});
                    },
                      err => { // return the error
                        console.error('MyDataEditPage pvs4_set_profile() nok ', err);
                    });
                    break;
                  }
                }
              });
            }
          }
        ]
    }).then(x => x.present());
  }
}
