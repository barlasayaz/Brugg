import { Component } from '@angular/core';
import { NavController, ModalController, NavParams, Platform, AlertController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { SystemService } from '../services/system';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ContactPersonPage } from './contact-person/contact-person.page';
import { ContactPersonAddressPage } from './contact-person-address/contact-person-address.page';
import { CustomerEditComponent } from '../components/customer-edit/customer-edit.component';
import { NoteEditComponent } from '../components/note-edit/note-edit.component';
import { AppointmentEditComponent } from '../components/appointment-edit/appointment-edit.component';


/**
 * Generated class for the CustomerDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.page.html',
  styleUrls: ['./customer-details.page.scss'],
})
export class CustomerDetailsPage {
  public idCustomer: number = 0;
  public activCustomer: any = {};
  public baan1_aktiv = false;
  public baan2_aktiv = false;
  public baan1_href = '';
  public baan2_href = '';
  public mobilePlatform: boolean;
  public mouseoverButton1: boolean;
  public mouseoverButton2: boolean;
  public mouseoverButton3: boolean;
  public mouseoverButton4: boolean;
  public aktive_products: number = 0;  
  public inspection_service: number = 0;
  public contactPersonList: any = []; 
  public contactPerson: any = []; 
  public contactPersonAddresses: any = []; 
  public contactPersonAddr: any = []; 
  public pageCount: any = 0;
  public pageTotalCount: any = 0;
  public contactPersonCount: any = 0;

  constructor(  public navCtrl: NavController, 
                public userdata:  UserdataService, 
                public apiService: ApiService,
                public translate: TranslateService,
                public navParams: NavParams,
                public system: SystemService,
                private inAppBrowser: InAppBrowser,
                public platform: Platform,
                public alertCtrl: AlertController,
                public modalCtrl : ModalController) 
  {
      this.idCustomer = this.navParams.get("idCustomer");   
      this.loadCustomer(this.idCustomer);     
      this.getPointContactList();
      
      platform.ready().then(() => {
        if (this.platform.is('ios') ||
            this.platform.is('android') )
        {
          this.mobilePlatform = true;
          this.mouseoverButton1 = true;
          this.mouseoverButton2 = true;
          this.mouseoverButton3 = true;
          this.mouseoverButton4 = true;
          console.log("platform mobile:", this.platform.platforms());
        }
        else {
          console.log("platform not mobile:", this.platform.platforms());
          this.mobilePlatform = false;
          this.mouseoverButton1 = false;
          this.mouseoverButton2 = false;
          this.mouseoverButton3 = false;
          this.mouseoverButton4 = false;
        }
      });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CustomerDetailsPage');
  }

  loadCustomer(id) {
    this.apiService.pvs4_get_customer(id).then((result:any) => {
          this.activCustomer = result.obj;  
          this.aktive_products = parseInt(result.aktive_products);
          this.inspection_service = parseInt(result.inspection_service);
          console.log('loadCustomer', this.activCustomer); 
    });

    //get BAAN and NAV
    console.log("idCustomer :", id);
    this.apiService.pvs4_get_baan(id).then((baan_nav: any) => {
      console.log("baan_nav :", baan_nav);
      if(baan_nav.baan1) {
        if(baan_nav.baan1 != "") {
          this.baan1_aktiv = true;
          this.baan1_href = baan_nav.baan1;
        }
      }
      if(baan_nav.baan2) {
        if(baan_nav.baan2 != "") {
          this.baan2_aktiv = true;
          this.baan2_href = baan_nav.baan2;
        }
      }
    });

  }

  getPointContactList() {
    console.log("getPointContact :", this.idCustomer); 
    this.contactPersonAddresses = []; 
    this.contactPersonAddr = [];
    this.pageCount = 0;
    this.pageTotalCount = 0;
    this.contactPersonCount = 0;
    this.apiService.pvs4_get_contact_person(this.idCustomer).then((result:any) => {
      console.log('getPointContact result', result.list);     
      this.contactPersonCount = result.list.length;    
      for (var i = 0, len = result.list.length; i < len; i++) {
        var item = result.list[i].data;
        item.addresses = JSON.parse(item.addresses);
        this.contactPersonList.push(item);
        if(i==0) {
          this.contactPerson.push(item);     
          this.pageTotalCount = item.addresses.length;
          this.contactPersonAddresses.push(item.addresses[i]);
          for (var j = 0, ln = this.pageTotalCount; j < ln; j++) {
            this.contactPersonAddr.push(item.addresses[j]);
          }                    
        }                        
      }

      console.log("pageBack pageCount1 pageTotalCount :", this.pageCount, '-', this.pageTotalCount, '-', this.contactPersonAddresses, '-',this.contactPersonAddr); 
    });          

  }

  async contactPersonPage() {
    const modal =
    await this.modalCtrl.create({
      component: ContactPersonPage,
      componentProps: {
        idCustomer: this.idCustomer
      }
    });

    modal.onDidDismiss().then((data) => {
        if(data) { 
          const contact = data['data'];
          this.contactPersonAddresses = []; 
          this.contactPersonAddr = [];
          this.pageCount = 0;
          this.pageTotalCount = 0;
   
            this.contactPerson = [];
            this.contactPerson.push(contact); 
            this.pageTotalCount = contact.addresses.length;
            for (var i = 0, len = this.pageTotalCount; i < len; i++) {
              if(i==0) {                
                this.contactPersonAddresses.push(contact.addresses[i]);
                for (var j = 0, ln = this.pageTotalCount; j < ln; j++) {
                  this.contactPersonAddr.push(contact.addresses[j]);
                }                    
              }                        
          }
        }  
      });
      modal.present();
  }

  async addAddress() {    
    let contactPersonAddrTmp: any = [];
    contactPersonAddrTmp = JSON.parse(JSON.stringify(this.contactPersonAddr));
    const modal =
    await this.modalCtrl.create({
      component: ContactPersonAddressPage,
      componentProps: {
        "idCustomer":this.idCustomer, "contactPerson":this.contactPerson, "contactPersonAddresses":this.contactPersonAddr
      }
    });

    modal.onDidDismiss().then(data => {
      this.contactPersonAddr = [];
      for (var i = 0, len = contactPersonAddrTmp.length; i < len; i++) {
        this.contactPersonAddr.push(contactPersonAddrTmp[i]);
      }      
    }); 
    modal.present();
  }

  pageBack() {    
    if (this.pageCount > 0) {
      this.pageCount--;
      this.contactPersonAddresses = [];
      if(this.contactPersonAddr) 
        this.contactPersonAddresses.push(this.contactPersonAddr[this.pageCount]);
      console.log("pageBack pageCount pageTotalCount :", this.pageCount, '-', this.pageTotalCount);
    }
  }

  pageForward() {    
    if (this.pageCount < this.pageTotalCount-1) {
      this.pageCount++;
      this.contactPersonAddresses = [];
      if(this.contactPersonAddr) 
        this.contactPersonAddresses.push(this.contactPersonAddr[this.pageCount]);
      console.log("pageForward pageCount pageTotalCount :", this.pageCount, '-', this.pageTotalCount, '-', this.contactPersonAddr);
    }
  }


  openBaan(x){
    console.log('openBaan()', x , this.baan1_href ,this.baan2_href );
    if(this.system.platform===0){
        if(x===1) window.open(this.baan1_href,  '_blank'); 
        if(x===2) window.open(this.baan2_href,  '_blank'); 
    }else{
        if(x===1){
          this.inAppBrowser.create(this.baan1_href,  '_system', 'location=yes');
        } 
        if(x===2){
          this.inAppBrowser.create(this.baan2_href,  '_system', 'location=yes');
        } 
    }
  }

  mouseover(buttonNumber) {
    if(buttonNumber == 1) 
      this.mouseoverButton1 = true;
    else if(buttonNumber == 2)
      this.mouseoverButton2 = true;
    else if(buttonNumber == 3)
      this.mouseoverButton3 = true;
    else if(buttonNumber == 4)
      this.mouseoverButton4 = true;
  }

  mouseout(buttonNumber) {
    if(this.mobilePlatform == false) {
      if(buttonNumber == 1) 
        this.mouseoverButton1 = false;
      else if(buttonNumber == 2)
        this.mouseoverButton2 = false;
      else if(buttonNumber == 3)
        this.mouseoverButton3 = false;
      else if(buttonNumber == 4)
        this.mouseoverButton4 = false;
    }
  }

  setProductSrv(mode:number) {
    let titel = this.translate.instant('Prüfservice');
    let msg = this.translate.instant('disable_service_produkte');
    if(mode==1) this.translate.instant('enable_service_produkte');
    let alert = this.alertCtrl.create({
      header: titel,
      message: msg,
      buttons: [
        {
          text: this.translate.instant('Nein'),
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.translate.instant('Ja'),
          handler: () => {
            this.aktive_products = 0;
            this.inspection_service = 0;
            this.apiService.pvs4_set_inspection_service(this.activCustomer.id,mode).then((result:any) => { 
              this.aktive_products = parseInt(result.aktive_products);
              this.inspection_service = parseInt(result.inspection_service);
            });            
          }
        }
      ]
    }).then(x=> x.present());
  }

  async appointmentEdit() {
    console.log("appointmentEdit -> idCustomer :", this.idCustomer);
    const modal =
    await this.modalCtrl.create({
      component: AppointmentEditComponent,
      componentProps: {
        idCustomer: this.idCustomer,  "appointment": 0, redirect: 3
      }
    });
    modal.present();
  }

  async noteEdit() {
    console.log('newNotes -> idCustomer :', this.idCustomer);
    const modal =
    await this.modalCtrl.create({
      component: NoteEditComponent,
      componentProps: {
        id: 0,  idCustomer: this.idCustomer, redirect: 2
      }
    });
    modal.present();
  }

 async customerEdit() {
    console.log("customerEdit -> idCustomer :", this.idCustomer);
    const modal =
    await this.modalCtrl.create({
      component: CustomerEditComponent,
      componentProps: {
        id: this.idCustomer, redirect: 3
      }
    });

    modal.onDidDismiss().then(data => {
      if(data['data']) { 
        this.activCustomer = data['data']; 
      }   
    }); 
    modal.present();
  }

}
