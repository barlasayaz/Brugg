import { NavController, NavParams, AlertController, ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { ApiService } from '../../services/api';
import { LoadingController } from '@ionic/angular';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { NavigationExtras } from '@angular/router';

/**
 * Generated class for the QrBarcodeComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */

@Component({
  selector: 'app-qr-barcode',
  templateUrl: './qr-barcode.component.html',
  styleUrls: ['./qr-barcode.component.scss']
})
export class QrBarcodeComponent implements OnInit {
  public modalTitle: string;
  public readOnly: boolean;
  public qrText: string;
  public qrCodeText: string;
  public listView: boolean;
  public pid: number;
  public cols: any[];
  public scanList: any = [];
  options: BarcodeScannerOptions;
  public url: any;
  public lang: string = localStorage.getItem('lang');

  constructor(public translate: TranslateService,
    public apiService: ApiService,
    public scanner: BarcodeScanner,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private viewCtrl: ModalController,
    public transfer: FileTransfer,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    private toastCtrl: ToastController) {
  }

  ngOnInit() {
    this.readOnly = true;
    this.qrText = '';
    this.qrCodeText = '';
    this.listView = false;
    this.url = this.apiService.pvsApiURL;
    this.modalTitle = 'QR Code';
    this.readOnly = this.navParams.get('readOnly');
    this.pid = this.navParams.get('pid');
    if (this.navParams.get('qr_code')) {
      this.qrCodeText = this.navParams.get('qr_code');
      this.qrText = this.qrCodeText;
    }
    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'title', header: this.translate.instant('Produkt') },
      { field: 'customer', header: this.translate.instant('Kunden') }
    ];
  }

  scanQr() {
    this.options = {
      prompt: this.translate.instant('QR-Code scannen')
    }
    this.scanner.scan(this.options).then((barcodeData) => {
      console.log('scanQr:', barcodeData);
      if (barcodeData.text != '') {
        this.apiService.pvs4_get_qr_product_list(barcodeData.text).then(async (result: any) => {
          if (result.list.length == 1) {
            let navigationExtras: NavigationExtras = {
              queryParams: {
                idCustomer: result.list[0].customer,
                idProduct: result.list[0].id
              }
            };
            this.navCtrl.navigateForward(['/product-details'], navigationExtras);
          } else if (result.list.length > 1) {
            let buttons: any[] = [];

            result.list.forEach(product => {
              buttons.push({
                text: JSON.parse(product.title)[this.lang] + ' - ' + product.id_number,
                handler: id => {
                  let navigationExtras: NavigationExtras = {
                    queryParams: {
                      idCustomer: product.customer,
                      idProduct: product.id
                    }
                  };
                  this.navCtrl.navigateForward(['/product-details'], navigationExtras);
                }
              });
            });
            const alert = await this.alertCtrl.create({
              header: this.translate.instant('Produktdetails'),
              buttons: buttons
            });
            await alert.present();
          } else {
            const toast = this.toastCtrl.create({
              message: this.translate.instant('Produkt unbekannt'),
              duration: 2000
            }).then(x => x.present());
          }
          // this.scanData = barcodeData;
        }, (err) => {
          console.log('Error occured : ' + err);
        });
      }
    });
  }

  scanQrToDb() {
    this.options = {
      prompt: this.translate.instant('QR-Code scannen')
    }
    this.scanner.scan(this.options).then((barcodeData) => {
      console.log(barcodeData);
      this.qrText = barcodeData.text;
      this.qrCodeText = this.qrText;
    });
  }

  encodeText() {
    this.qrCodeText = this.qrText;

    /*this.scanner.encode(this.scanner.Encode.TEXT_TYPE, this.qrText).then((encodedData) => {
 
       console.log("encodedData",encodedData);
       this.encodedData = encodedData;
       let obj = {qr_code:this.qrText, id:this.pid}
 
       this.apiService.pvs4_set_product_tag(obj).then((done: any) => {
         console.log("pvs4_set_product_tag() ok:", done);
       }).catch((err: any) => {
         console.log("pvs4_set_product_tag() ok:", err);
       });
 
     }, (err) => {
       console.log("Error occured : ", err);
     });*/
  }

  saveText() {
    let obj = { qr_code: this.qrText, id: this.pid }

    this.apiService.pvs4_set_product_tag(obj).then((done: any) => {
      console.log('pvs4_set_product_tag() ok:', done);
      const toast = this.toastCtrl.create({
        message: this.translate.instant('Speichern Sie erfolgreich'),
        duration: 2000
      }).then(x => x.present());


    }).catch((err: any) => {
      console.log('pvs4_set_product_tag() ok:', err);
      const toast = this.toastCtrl.create({
        message: 'Error',
        duration: 2000
      }).then(x => x.present());

    });

  }

  delScanList = function (del: any) {
    console.log('QR delScanList():', del);
    var newList = [];
    for (var i = 0; i < this.scanList.length; i++) {
      if (this.scanList[i].id != del.id) { newList.push(this.scanList[i]); }
    }
    this.scanList = newList;
  }

  createProtocol() {
    console.log('scanList :', this.scanList);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        idCustomer: this.scanList[0].idCustomer,
        productList: JSON.stringify(this.scanList)
      }
    };
    this.navCtrl.navigateForward(['/protocol-edit'], navigationExtras);
  }

  scanQrToList() {
    this.options = {
      prompt: this.translate.instant('QR-Code scannen')
    }
    this.scanner.scan(this.options).then((barcodeData) => {
      console.log('scanQr:', barcodeData);
      if (barcodeData.text != '') {
        this.apiService.pvs4_get_qr_product_list(barcodeData.text).then((result: any) => {
          if (result.list.length > 0) {
            result.list.forEach(product => {
              let add = true;
              for (var i = 0; i < this.scanList.length; i++) {
                if (this.scanList[i].id == product.id) { add = false; }
              }
              if (add) {
                let new_obj = {
                  id: product.id,
                  id_number: product.id_number,
                  title: JSON.parse(product.title)[this.lang],
                  customer: product.company,
                  idCustomer: product.customer
                }
                this.scanList.push(new_obj);
              }
            });
          } else {
            const toast = this.toastCtrl.create({
              message: this.translate.instant('Produkt unbekannt'),
              duration: 2000
            }).then(x => x.present());
          }
          // this.scanData = barcodeData;
        }, (err) => {
          console.log('Error occured : ' + err);
        });
      }
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
