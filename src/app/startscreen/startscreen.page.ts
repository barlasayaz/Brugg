import { Component } from '@angular/core';
import { NavController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';
import { Subscription } from 'rxjs/Subscription';
import { ImprintPage } from '../login/imprint/imprint.page';
import { NfcScanComponent } from '../components/nfc-scan/nfc-scan.component';
import { QrBarcodeComponent } from '../components/qr-barcode/qr-barcode.component';
import { ReboxPage } from '../rebox/rebox.page';

@Component({
  selector: 'app-startscreen',
  templateUrl: './startscreen.page.html',
  styleUrls: ['./startscreen.page.scss'],
})
export class StartscreenPage {
  public subscription: Subscription = new Subscription;
  public ndeflistener: any;
  public tagId: string;
  public readingTag: boolean;
  public  timeout: any;
  public mobilePlatform: boolean;

  constructor(public navCtrl: NavController,
    public userdata: UserdataService,
    public translate: TranslateService,
    public modalCtrl: ModalController,
    // private alertCtrl: AlertController,
    public nfc: NFC,
    public ndef: Ndef,
    public platform: Platform
  ) {

    console.log(this.translate.defaultLang);

    this.tagId = '??';
    this.readingTag = false;
    this.mobilePlatform = false;

    console.log('platform :', this.platform);
    platform.ready().then(() => {
      if (this.platform.is('ios') ||
          this.platform.is('android') ||
          this.platform.is('ipad') ||
          this.platform.is('iphone') ||
          this.platform.is('mobile') ||
          this.platform.is('phablet') ||
          this.platform.is('tablet')) {
        this.mobilePlatform = true;
      } else {
        console.log('platform : other');
      }
    });
    console.log('platform :', this.mobilePlatform);
  }
  async nfc_scan() {
    const modal =
    await this.modalCtrl.create({
      component: NfcScanComponent,
      cssClass: 'nfcscan-modal-css',
      componentProps: {
        readOnly: true
      }
    }).then(x => x.present());
  }
 async qr_barcode() {
    const modal =
    await this.modalCtrl.create({
      component: QrBarcodeComponent,
      cssClass: 'qrcode-modal-css',
      componentProps: {
        readOnly: true
      }
    }).then(x => x.present()); ;
  } 
 async rebox(userid) {
    const modal =
    await this.modalCtrl.create({
      component: ReboxPage,
      cssClass: 'rebox-modal-css',
      componentProps: {
      }
    }).then(x => x.present());

  }

  // IMPRESSUM
  async imprintModal() {
    const modal =
    await this.modalCtrl.create({
      component: ImprintPage,
      cssClass: 'imprint-modal-css',
      componentProps: {
      }
    }).then(x => x.present());
  }

  logout() {
    this.userdata.delStorage();
    this.navCtrl.navigateForward('/login');
  }

  go(action) {
    console.log(action);
    switch (action) {
      case 'DashboardPage':
        this.navCtrl.navigateForward('/dashboard');
        break;
      case 'CustomerTable':
        this.navCtrl.navigateForward('/customer-table');
        break;
      case 'StartscreenPage':
        this.navCtrl.navigateForward('/startscreen');
        break;
      case 'MyDataPage':
        this.navCtrl.navigateForward('/my-data');
        break;
      case 'AppointmentplanPage':
        this.navCtrl.navigateForward('/appointment-plan');
        break;
    }

  }

}
