import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController, Platform, LoadingController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { QrBarcodeComponent } from '../components/qr-barcode/qr-barcode.component';
import { NfcScanComponent } from '../components/nfc-scan/nfc-scan.component';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

import { DatePipe } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PdfExportService } from '../services/pdf-export';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { NavigationExtras, ActivatedRoute } from '@angular/router';

/**
 * Generated class for the ProductDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
})
export class ProductDetailsPage implements OnInit {
  public idProduct = 0;
  public activProduct: any = {};
  private selectedProduct: string;
  public idCustomer = 0;
  public company = '';
  public lang: string = localStorage.getItem('lang');
  public uploadedFiles: any[] = [];
  public params: any = [];
  public dateien: any = [];
  public link: any;
  public url: any;
  public listProduct: any[] = [];
  public mobilePlatform = false;
  public imageURI: any;
  public file_link: any;
  public nocache: any;
  public mouseoverButton1: boolean;
  public mouseoverButton2: boolean;
  public mouseoverButton3: boolean;
  public mouseoverButton4: boolean;

  constructor(public navCtrl: NavController,
    public userdata: UserdataService,
    public apiService: ApiService,
    public translate: TranslateService,
    public alertCtrl: AlertController,
    public pdf: PdfExportService,
    public datePipe: DatePipe,
    private modalCtrl: ModalController,
    public platform: Platform,
    public camera: Camera,
    public loadingCtrl: LoadingController,
    public transfer: FileTransfer,
    private route: ActivatedRoute) {

  }
  ngOnInit() {

    this.platform.ready().then(() => {
      if ( this.platform.is('ios') ||
        this.platform.is('android') ) {
        this.mobilePlatform = true;
        this.mouseoverButton1 = true;
        this.mouseoverButton2 = true;
        this.mouseoverButton3 = true;
        this.mouseoverButton4 = true;
        console.log('platform mobile:', this.platform.platforms());
      } else {
        console.log('platform not mobile:', this.platform.platforms());
        this.mobilePlatform = false;
        this.mouseoverButton1 = false;
        this.mouseoverButton2 = false;
        this.mouseoverButton3 = false;
        this.mouseoverButton4 = false;
      }
    });

      this.url = this.apiService.pvsApiURL;
      this.route.queryParams.subscribe(params => {
        this.idProduct = params['idProduct'];
        this.idCustomer = params['idCustomer'];
        // this.company = params["company"];
        this.selectedProduct = params['productList'];

        this.activProduct.product = null;
        this.loadProduct(this.idProduct);
        this.dateiListe();
    });

      this.nocache = new Date().getTime();
  }

  loadProduct(id) {
    this.activProduct.images = '';
    this.apiService.pvs4_get_product(id).then((result: any) => {
      this.activProduct = result.obj;
      const title = JSON.parse(this.activProduct.title);
      this.activProduct.title = title[this.lang];
      this.activProduct.items = JSON.parse(this.activProduct.items);
      console.log('loadProduct', this.activProduct);

      if (this.activProduct.images == '') {
        this.activProduct.images = 'assets/imgs/product_img.jpg';
      }

      const str: string = this.activProduct.images;
      if (str != '') {
        console.log('images 1:', this.activProduct.images);
        if (str.indexOf('img/') != -1) {
          this.activProduct.images = 'assets/' + this.activProduct.images;
        }
        if (str.indexOf('mobileimages/') != -1) {
          this.activProduct.images = this.file_link + this.activProduct.images;
        }
        console.log('images 2:', this.activProduct.images);
      }

      this.listProduct.push(this.activProduct);
    });
  }

  onBeforeUpload(event) {
    event.formData.append('dir', 'product_' + this.activProduct.id);
    event.formData.append('token', window.localStorage['access_token']);
    console.log('onBeforeUpload event :', event);
  }

  onUpload(event) {
    console.log('setFile event :', event);
    for (const file of event.files) {
      console.log('file', file);
      this.uploadedFiles.push(file);
    }

    this.dateiListe();

  }

  async nfc_scan() {
    const modal =
      await this.modalCtrl.create({
        component: NfcScanComponent,
        componentProps: {
          readOnly: false, pid: this.activProduct.id
        }
      });

    modal.present();
  }
  async qr_code() {
    const obj = {};
    const modal =
      await this.modalCtrl.create({
        component: QrBarcodeComponent,
        componentProps: {
          readOnly: false, pid: this.activProduct.id, qr_code: this.activProduct.qr_code
        }
      });

    modal.present();
  }
  delFile(datei) {
    const alert = this.alertCtrl.create({
      header: '',
      message: this.translate.instant('del_file'),
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
            this.params = { 'id': this.idProduct, 'type': 'product', 'dateiname': datei };
            this.apiService.pvs4_del_file(this.params).then((result) => {
              console.log('result :', result);
              this.dateiListe();
            });
          }
        }
      ]
    }).then(x => x.present());

  }

  dateiListe() {
    this.apiService.pvs4_get_file(this.idProduct, 'product').then((result) => {
      console.log('dateiliste', result);
      this.dateien = result['files'];
      this.link = result['link'];
      this.file_link = result['file_link'];
    });
  }
  getProductUrlList(productImagePath, callback) {

    const urlList: any = [];
    urlList.push({
      link: productImagePath
    });
    urlList.push({
      link: 'assets/imgs/banner_' + this.userdata.licensee + '.jpg'
    });

    const that = this;
    function callAjax(index) {
      if (index >= urlList.length) {
        return;
      } else {

        that.pdf.toDataURL(urlList[index].link, data => {
          if (data) {
            urlList[index].dataURL = data;
          }

          if (urlList.length == index + 1) {
            callback(urlList);
          }

          callAjax(index + 1);

        });

      }
    }

    callAjax(0);
  }

  printPdf() {
    let pageDesc: string = this.translate.instant('Seite');
    let productList = [];
    const columns = ['title', 'value'];
    const product = this.listProduct;
    let productImagePath = '';
    let prdctImgTitle: any = [];
    prdctImgTitle = { text: this.translate.instant('Produktbild'), color: '#ffffff', fillColor: '#009de0', alignment: 'center' };
    let prdct_img: any = [];
    prdct_img = { text: ' ' };

    let pdrctNullTitle: any = [];
    pdrctNullTitle = { text: ' ', color: '#ffffff', fillColor: '#ffffff', border: [false, false, false, false] };

    let prdctQrCodeTitle: any = [];
    prdctQrCodeTitle = { text: this.translate.instant('QR-Code'), color: '#ffffff', fillColor: '#009de0', alignment: 'center' };

    // Product
    const bodyProduct = [];
    const prdctTitle = [
      {
        text: this.translate.instant('Produkt Details'),
        color: '#ffffff',
        fillColor: '#009de0',
        colSpan: 2,
        alignment: 'center'
      },
      {
        text: '',
        color: '#ffffff',
        fillColor: '#009de0',
        colSpan: 2,
        alignment: 'center'
      }
    ];
    bodyProduct.push(prdctTitle);

    productList = [];
    product.forEach(element => {
      console.log('product element :', this.translate.instant('Titel'), element.title);
      if (element.title != undefined) {
        productList.push({ 'title': this.translate.instant('Titel'), 'value': element.title });
      } else {
        productList.push({ 'title': this.translate.instant('Titel'), 'value': ' ' });
      }
      if (element.id != undefined) {
        productList.push({ 'title': 'DB-ID', 'value': element.id });
      } else {
        productList.push({ 'title': 'DB-ID', 'value': ' ' });
      }
      if (element.id_number != undefined) {
        productList.push({ 'title': '#', 'value': element.id_number });
      } else {
        productList.push({ 'title': '#', 'value': ' ' });
      }
      if (element.articel_no != undefined) {
        productList.push({ 'title': this.translate.instant('Articel No'), 'value': element.articel_no });
      } else {
        productList.push({ 'title': this.translate.instant('Articel No'), 'value': ' ' });
      }
      if (element.author != undefined) {
         productList.push({ "title": this.translate.instant('Autor'), "value": element.author });
      } else {
         productList.push({ "title": this.translate.instant('Autor'), "value": ' ' });
      }
      if (element.check_interval != undefined) {
        productList.push({ 'title': this.translate.instant('Intervall Prüfen'), 'value': element.check_interval });
      } else {
        productList.push({ 'title': this.translate.instant('Intervall Prüfen'), 'value': ' ' });
      }
      if (element.images != undefined) {
        productImagePath = element.images;
      } else {
        productImagePath = '';
      }
      // product options
      element.items.forEach(elementItems => {
        if (elementItems.title[this.lang] != '' && elementItems.value != undefined) {
          if (elementItems.type == 5) {
            productList.push({ 'title': elementItems.title[this.lang],
                               'value': this.datePipe.transform(elementItems.value, 'dd.MM.yyyy') });
          } else {
            productList.push({ 'title': elementItems.title[this.lang], 'value': elementItems.value });
          }
        } else {
          productList.push({ 'title': elementItems.title[this.lang], 'value': ' ' });
        }
      });

    });

    productList.forEach(function (row) {
      const dataRow = [];

      columns.forEach(function (column) {
        dataRow.push(row[column].toString());
      });

      bodyProduct.push(dataRow);
    });

    const prdctBody = bodyProduct;
    console.log('product body :', prdctBody);

    // Header Picture

    // Product Picture
    console.log('image path', productImagePath);

    this.getProductUrlList(productImagePath, dataUrlList => {
      prdct_img = { 'image': dataUrlList[0].dataURL, 'margin': 0, 'fit': [300, 180], 'alignment': 'center' };
      let prdct_qr = {};
      if (this.activProduct.qr_code && this.activProduct.qr_code != '') {
        const x = document.getElementsByClassName('qrImage')[0];
        console.log('getElementsByClassName:', x);
        const y = x.getElementsByTagName('img');
        console.log('getElementsByTagName:', y);
        const z = y[0].getAttribute('src');
        console.log('getAttribute:', z);
        prdct_qr = { 'image': z, 'margin': 0, 'fit': [200, 100], 'alignment': 'center' };
      }

      const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [20, 140, 20, 20],
        header: {
          columns: [
            {
              'image': dataUrlList[1].dataURL, 'width': 800, margin: 20
            }
          ]
        },
        content: [
          {
            columns: [
              {
                width: '50%',
                fontSize: 10,
                layout: {
                  hLineWidth: function (i, node) { return 1; },
                  vLineWidth: function (i, node) { return 1; },
                  hLineColor: function (i, node) { return '#cccccc'; },
                  vLineColor: function (i, node) { return '#cccccc'; },
                  paddingTop: function (i, node) { return 4; },
                  paddingBottom: function (i, node) { return 4; },
                },
                table: {
                  headerRows: 1,
                  widths: ['auto', '*'],
                  body: prdctBody
                }
              },
              {
                width: '50%',
                fontSize: 10,
                layout: {
                  hLineWidth: function (i, node) { return 1; },
                  vLineWidth: function (i, node) { return 1; },
                  hLineColor: function (i, node) { return '#cccccc'; },
                  vLineColor: function (i, node) { return '#cccccc'; },
                  paddingTop: function (i, node) { return 4; },
                  paddingBottom: function (i, node) { return 4; },
                },
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [prdctImgTitle],
                    [prdct_img],
                    [pdrctNullTitle],
                    [prdctQrCodeTitle],
                    [prdct_qr]
                  ]
                }
              }
            ],
            columnGap: 10
          }
        ],
        footer: function (currentPage, pageCount) {
          return { text: pageDesc + ' ' + currentPage.toString() + ' / ' + pageCount, alignment: 'center' }
        }
      };

      this.pdf.createPdf(docDefinition, 'download', this.translate.instant('Produkt Details'.replace(/\s/g, '')) + '.pdf');

    });
  }

  createProtocol() {
    if (this.userdata.role_set.edit_products == false) { return; }
    if (this.selectedProduct) {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          idCustomer: this.idCustomer,
          productList: this.selectedProduct
        }
    };
      this.navCtrl.navigateForward(['/protocol-edit'], navigationExtras);
    }
  }

  mouseover(buttonNumber) {
    if (buttonNumber == 1) {
      this.mouseoverButton1 = true;
    } else if (buttonNumber == 2) {
      this.mouseoverButton2 = true;
         } else if (buttonNumber == 3) {
      this.mouseoverButton3 = true;
         } else if (buttonNumber == 4) {
      this.mouseoverButton4 = true;
         }
  }

  mouseout(buttonNumber) {
    if (this.mobilePlatform == false) {
      if (buttonNumber == 1) {
        this.mouseoverButton1 = false;
      } else if (buttonNumber == 2) {
        this.mouseoverButton2 = false;
           } else if (buttonNumber == 3) {
        this.mouseoverButton3 = false;
           } else if (buttonNumber == 4) {
        this.mouseoverButton4 = false;
           }
    }
  }

  getCamera() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.imageURI = '';
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      // this.activProtocol.images = 'data:image/jpeg;base64,' + imageData;
      this.imageURI = imageData;
      this.uploadFile();
    }, (err) => {
      console.log(err);
    });
  }

  async uploadFile() {
    const loader = await this.loadingCtrl.create({
      message: 'Uploading...'
    });
    loader.present();
    const fileTransfer: FileTransferObject = this.transfer.create();

    const imageName = this.imageURI.substr(this.imageURI.indexOf('/cache/') + 7);
    const options: FileUploadOptions = {
      fileKey: 'file',
      fileName: 'product_' + imageName,
      chunkedMode: false,
      mimeType: 'image/jpeg',
      httpMethod: 'POST',
      params: {
        'dir': 'product_' + this.idProduct,
        'token': window.localStorage['access_token']
      }
    };

    console.log('imageURI :', this.imageURI);
    console.log('upload :', this.url + 'upload.php');

    fileTransfer.upload(this.imageURI, this.url + 'upload.php', options)
      .then((data) => {
        console.log('Uploaded Successfully :', data);
        this.dateiListe();
        loader.dismiss();
      }, (err) => {
        console.log('Uploaded Error :', err);
        this.activProduct.images = '';
        loader.dismiss();
      });
  }

}