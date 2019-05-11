import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';
import { Subscription } from 'rxjs/Subscription';
import { ImprintPage } from '../login/imprint/imprint.page';
import { NfcScanComponent } from '../components/nfc-scan/nfc-scan.component';
import { QrBarcodeComponent } from '../components/qr-barcode/qr-barcode.component';
import { ReboxNewPage } from '../rebox-new/rebox-new.page';

@Component({
  selector: 'app-startscreen-new',
  templateUrl: './startscreen-new.page.html',
  styleUrls: ['./startscreen-new.page.scss'],
})
export class StartscreenNewPage {
  public idKunde: any;
  subscription: Subscription = new Subscription
  ndeflistener: any
  tagId: string = "??"
  readingTag: boolean = false;
  timeout: any;
  public mobilePlatform: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public userdata: UserdataService,
    public translate: TranslateService,
    public modalCtrl: ModalController,
    //private alertCtrl: AlertController,
    public nfc: NFC,
    public ndef: Ndef,
    public platform: Platform
  ) {

    this.idKunde = this.navParams.get("idKunde");
    console.log(this.translate.defaultLang);

    platform.ready().then(() => {
      if (this.platform.is('ios') ||
          this.platform.is('android') ||
          this.platform.is('ipad') ||
          this.platform.is('iphone') ||
          this.platform.is('mobile') ||
          this.platform.is('phablet') ||
          this.platform.is('tablet'))
      {
        this.mobilePlatform = true;
      }
      else {
        console.log("platform : other");
      }
    });
  }
  async nfc_scan() {
    const modal =
    await this.modalCtrl.create({
      component: NfcScanComponent,
      componentProps: {
        readOnly: true
      }
    });
    modal.present(); 
  
  } 
 async qr_barcode()
  {
    const modal =
    await this.modalCtrl.create({
      component: QrBarcodeComponent,
      componentProps: {
        readOnly: true
      }
    });
    modal.present();  
  } 
 async reboxNew(userid) {
    const modal =
    await this.modalCtrl.create({
      component: ReboxNewPage,
      componentProps: {
      }
    });
    modal.present();  
  }

  //IMPRESSUM
  async imprintModal() {
    const modal =
    await this.modalCtrl.create({
      component: ImprintPage,
      componentProps: {
      }
    });
    modal.present();  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StartscreenNewPage');
  }

  logout() {
    this.userdata.delStorage();
    this.navCtrl.navigateForward("/login");
  }

  go(action) {
    console.log(action);
    switch (action) {
      case "DashboardNewPage":
        this.navCtrl.navigateForward("/dashboard-new");
        break;
      case "CustomerTable":
        this.navCtrl.navigateForward("/customer-table");
        break;
      case "StartscreenNewPage":
        this.navCtrl.navigateForward("/startscreen-new");
        break;
      case "MyDataPage":
        this.navCtrl.navigateForward("/my-data");
        break;
      case "AppointmentplanPage":
        this.navCtrl.navigateForward("/appointment-plan");
        break;
    }

  }

}

