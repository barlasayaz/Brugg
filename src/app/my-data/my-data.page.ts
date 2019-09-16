import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UserdataService } from '../services/userdata';
import { MyDataEditPage } from './my-data-edit/my-data-edit.page';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/api';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Generated class for the MyDataPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-my-data',
  templateUrl: './my-data.page.html',
  styleUrls: ['./my-data.page.scss'],
})
export class MyDataPage {
  public lang: string;
  public colleaguesSearch: any = [];
  public colleagues: any = [];
  public colleaguesAll: any = [];
  public filterValue: string = '';
  modelChanged: Subject<any> = new Subject<any>();

  constructor(public navCtrl: NavController, 
              public apiService: ApiService,
              private translate: TranslateService,
              public userdata: UserdataService,
              public modalCtrl: ModalController) {

    this.lang = '';
    this.lang = localStorage.getItem('lang');
    console.log('constructor MyDataPage', this.userdata, this.userdata.role_set.edit_protocol_templates);
    if ((this.userdata.role == 1) || (this.userdata.role == 2)) {
      this.loadList();
    }

    this.modelChanged.pipe(
      debounceTime(700))
      .subscribe(model => {
        console.log('modelChanged:', model);
        if ((this.userdata.role == 1) || (this.userdata.role == 2)) {
          this.colleaguesSearch = JSON.parse(JSON.stringify(this.colleaguesAll));
          for (let i = this.colleaguesSearch.length - 1; i >= 0; i--) {
              let s = this.filterValue.toLowerCase();
              let a = this.colleaguesSearch[i];
              let del = true;
              if (a.first_name && a.first_name != null && a.first_name.toLowerCase().indexOf(s) >= 0) { del = false; }
              if (a.last_name && a.last_name != null && a.last_name.toLowerCase().indexOf(s) >= 0) { del = false; }
              if (a.short_code && a.short_code != null && a.short_code.toLowerCase().indexOf(s) >= 0) { del = false; }
              if (del) { this.colleaguesSearch.splice(i, 1); }
          }
          this.colleagues = this.colleaguesSearch;
        }
    });

  }

  loadList() {
    this.colleaguesAll = [];
    this.apiService.pvs4_get_colleagues_list(this.userdata.role, this.userdata.role_set , this.userdata.licensee)
    .then((result: any) => {
      console.log('pvs4_get_colleagues_list result:', result);
      let k = result['obj'];
      result['amount'] = parseInt(result['amount']);
      if (result['amount'] > 0) {
        for (var i = 0, len = k.length; i < len; i++) {
          let item = k[i];
          item.id = parseInt(item.id);
          if (item.id == this.userdata.profile) { continue; }
          // console.log("item:", item);
          this.colleagues.push(item);
          this.colleaguesAll = JSON.parse(JSON.stringify(this.colleagues));
        }
      }
      this.search_employee();
    });
  }

  delLocalAll() {
    console.log('delLocalAll()');
    this.userdata.delStorage();
    this.navCtrl.navigateForward('/Login');
  }

  mw_test_a(nr: number) {
    console.log('mw_test():', nr);
    let data = { type: nr,
                 rev: 1 };
    this.apiService.pvs4_api_post('mw_get_list.php', data).then((done: any) => { // return the result
        console.log('mw_get_list ok :', done);
    },
      err => { // return the error
        console.log('mw_get_list nok err:', err);
    });
  }
  mw_test_b(nr: number) {
    console.log('mw_test():', nr);
    let data = { type: nr,
                 action: 'f',
                 id : 49 };

    this.apiService.pvs4_api_post('mw_handle_object.php', data).then((done: any) => { // return the result
        console.log('mw_get_list ok :', done);
    },
      err => { // return the error
        console.log('mw_get_list nok err:', err);
    });
  }

  changeLanguage() {
    let x = this.lang;
    console.log('changeLanguage(): ' + x);
    if ((x == 'de') || (x == 'en') || (x == 'fr') || (x == 'it')) {
      this.translate.use(x);
      localStorage.setItem('lang', x);
    } else {
      this.translate.use('en');
      localStorage.setItem('lang', x);
    }
    localStorage.removeItem('split_filter_product');
    localStorage.removeItem('show_columns_product');
  }

  async open_mydataedit(pid: number, role: number, role_nr: number,  editType: number= 0 ) {
    let cssClassText: string;
    if (this.userdata.role_set.edit_membership == false) {
      if (this.userdata.profile != pid) { return; }
    }

    if (editType == 1) {
      role = this.userdata.role;
      cssClassText = 'my-data-modal-1-css';
    } else {
      cssClassText = 'my-data-modal-2-css';
    }
    console.log('open_mydataedit()', pid, role, role_nr, editType);
    const modal =
    await this.modalCtrl.create({
      component: MyDataEditPage,
      cssClass: cssClassText,
      componentProps: {
        pid: pid, role: role, role_nr: role_nr , editType: editType
      }
    });
    modal.onDidDismiss().then(data => {
      console.log('MyDataEditPage onDidDismiss:', data['data']);
      if (data['data']) {
        if (data['data'].update) {
          this.colleagues = [];
          this.loadList();
        }
      }
    });
    modal.present();
  }

  search_employee() {
    this.modelChanged.next(this.filterValue);
  }

}
