import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { ApiService } from '../services/api';
import { File } from '@ionic-native/file/ngx';

/**
 * Generated class for the ProductCopyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-product-copy',
  templateUrl: './product-copy.page.html',
  styleUrls: ['./product-copy.page.scss'],
})
export class ProductCopyPage implements OnInit {
  public lang: string = localStorage.getItem('lang');
  public idCustomer: any;
  public activCustomer: any = {};
  public activProduct: any = {};
  public productList: any[] = [];
  public listCustomer: any[] = [];
  public targetCustomer: any = {};
  public url: any;
  public params: any = [];
  public file_link: any;
  public attachmentsFileCount: any = 0;
  public idProduct: any;

  constructor(public navCtrl: NavController, 
              public viewCtrl: ModalController,
              public translate: TranslateService,
              public userdata: UserdataService,
              public apiService: ApiService,
              public alertCtrl: AlertController,
              private navParams: NavParams,
              public file: File) {

  }

   ngOnInit() {
      this.url = this.apiService.pvsApiURL;
      this.idProduct = this.navParams.get('idProduct');
      this.idCustomer = this.navParams.get('idCustomer');

      console.log('ProductCopyPage :');
      this.loadCustomer();
      this.loadProduct();
   }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  loadCustomer() {
    this.apiService.pvs4_get_customer(this.idCustomer).then((result: any) => {
      this.activCustomer = result.obj;
      console.log('loadCustomer: ' , this.activCustomer);
    });
  }

  loadProduct() {
    this.apiService.pvs4_get_product(this.idProduct).then((result: any) => {
      this.activProduct = result.obj;
      console.log('loadProduct: ' , this.activProduct);

      let title = JSON.parse(this.activProduct.title);
      try {
        title = JSON.parse(this.activProduct.title);
      } catch {
        console.log('loadProduct title JSON.parse:', this.activProduct.title);
        title = JSON.parse(this.activProduct.title);
      }

      this.activProduct.title = title[this.lang];
    });
  }

  productCopyAlert() {
    if (this.targetCustomer) {
      let alert = this.alertCtrl.create({
        header: this.translate.instant('Bestätigen sie das copy produkt'),
        message: this.translate.instant('Möchten sie dieses produkt wirklich kopieren?'),
        buttons: [
          {
            text: this.translate.instant('dismiss'),
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: this.translate.instant('okay'),
            handler: () => {
              this.productCopy();
            }
          }
        ]
      }).then(x => x.present());
    }
  }

  productCopy() {
      this.apiService.pvs4_get_product(this.idProduct).then((resultProduct: any) => {
        let newObj = {
            id:               0,
            title:            resultProduct.obj.title,
            customer:         this.idCustomer,
            id_number:        '',
            parent:           0,
            active:           resultProduct.obj.active,
            check_interval:   resultProduct.obj.check_interval,
            last_protocol:    resultProduct.obj.last_protocol,
            articel_no:       resultProduct.obj.articel_no,
            items:            resultProduct.obj.items,
            images:           resultProduct.obj.images,
            nfc_tag_id:       resultProduct.obj.nfc_tag_id,
            qr_code:          resultProduct.obj.qr_code,
            pvs3_id:          resultProduct.obj.pvs3_id,
            author:           resultProduct.obj.author
          };

          console.log('obj :', newObj);
          this.apiService.pvs4_set_product(newObj).then((result: any) => {
            console.log('migration product result: ', result);

            let newImgPath: string = '';
            if (resultProduct.obj.images) {
              if (resultProduct.obj.images.indexOf('img/') != -1) {
                newImgPath = resultProduct.obj.images;
              }
              if (resultProduct.obj.images.indexOf('mobileimages/') != -1) {
                newImgPath = 'mobileimages/productimage_' + result.id + '.jpg';
                this.copyFile('mobileimages/productimage_' + this.idProduct + '.jpg', 'mobileimages/productimage_' + result.id + '.jpg');
              }
            } else {
              newImgPath = '';
            }

            this.apiService.pvs4_get_file(this.idProduct, 'product').then((result2) => {
              console.log('dateiliste :', result2);
              this.attachmentsFileCount = result2['files'].length;
              console.log('attachmentsFileCount :', this.attachmentsFileCount);
              if (this.attachmentsFileCount > 0) {
                this.copyFile('product_' + this.idProduct, 'product_' + result.id);
              }
          });

            newObj.id = result.id;
            newObj.images = newImgPath;
            console.log('obj :', newObj);
            this.apiService.pvs4_set_product(newObj).then((result: any) => {
              console.log('images product result: ', result);
              this.dismiss();
            });
          });
      });
  }

  copyFile(sourceFile: any, targetFile: any) {
    console.log('copyFile sourceFile-targetFile', sourceFile, ' - ', targetFile);
    this.params = { 'sourceFile': sourceFile,
                    'targetFile': targetFile
                  };
    this.apiService.pvs4_copy_file(this.params).then((result) => {
      console.log('result :', result);
    });
  }

}