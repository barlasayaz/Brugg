import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UserdataService } from '../services/userdata';
import { MyDataEditPage } from './my-data-edit/my-data-edit.page';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/api';
import { ModalController } from '@ionic/angular';


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
  public lang:string = "";
  public colleagues:any = []; 

  constructor(public navCtrl: NavController, 
              public apiService: ApiService,
              private translate: TranslateService,
              public userdata: UserdataService,
              public modalCtrl : ModalController) {
        this.lang = localStorage.getItem('lang');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyDataPage',this.userdata, this.userdata.role_set.edit_customer);
    this.loadList();
  }

  loadList(){
    this.apiService.pvs4_get_colleagues_list(this.userdata.role, this.userdata.role_set ,this.userdata.licensee)
    .then((result: any) => {
      console.log("pvs4_get_colleagues_list result:", result);
      let k = result["obj"];
      result["amount"] = parseInt(result["amount"]);
      if(result["amount"]>0){
        for (var i = 0, len = k.length; i < len; i++) {
          let item = k[i];
          item.id = parseInt(item.id);        
          if(item.id==this.userdata.profile) continue; 
          //console.log("item:", item);
          this.colleagues.push(item);
        }
      }
     
    });
  }

  delLocalAll() {
    console.log('delLocalAll()');
    this.userdata.delStorage(); 
    this.navCtrl.navigateForward("/Login");   
  }

  mw_test_a(nr:number) {
    console.log('mw_test():', nr);
    let data = {
      type: nr,
      rev: 1
    }
    this.apiService.pvs4_api_post("mw_get_list.php", data).then((done: any) => { //return the result
        console.log('mw_get_list ok :', done);
    },
      err => { // return the error
        console.log('mw_get_list nok err:', err);
    });
  }
  mw_test_b(nr:number) {
    console.log('mw_test():', nr);
    let data = {
      type: nr,
      action: 'f',
      id : 49
    }

    this.apiService.pvs4_api_post("mw_handle_object.php", data).then((done: any) => { //return the result
        console.log('mw_get_list ok :', done);
    },
      err => { // return the error
        console.log('mw_get_list nok err:', err);
    });
  }

  changeLanguage(){
    let x = this.lang;
    console.info("changeLanguage(): "+x);
    if((x=="de")||(x=="en")||(x=="fr")||(x=="it")) {
      this.translate.use(x);
      localStorage.setItem('lang', x)
    }else{
      this.translate.use("en");
      localStorage.setItem('lang', x)
    }
  }
  
  async open_mydataedit(pid:number, role:number, role_nr:number,  editType:number=0 ) { 
    if(this.userdata.role_set.edit_membership==false) {
      if(this.userdata.profile!=pid) return;
    }
    
    if(editType==1) role = this.userdata.role;
    console.log('open_mydataedit()',pid, role, role_nr, editType);
    const modal =
    await this.modalCtrl.create({
      component: MyDataEditPage,
      componentProps: {
        pid: pid, role:role, role_nr:role_nr ,editType:editType
      }
    });
    modal.onDidDismiss().then(data => {
      console.log('MyDataEditPage onDidDismiss:',data['data']);
      if(data['data']){
        if(data['data'].update){
          this.colleagues= [];
          this.loadList();
        }
      }
    }); 
    modal.present();
  }

}

