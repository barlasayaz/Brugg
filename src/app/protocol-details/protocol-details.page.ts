import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, Platform, LoadingController, ModalController } from '@ionic/angular';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { DatePipe } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PdfExportService } from '../services/pdf-export';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { ActivatedRoute } from '@angular/router';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
/**
 * Generated class for the ProtocolDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-protocol-details',
  templateUrl: './protocol-details.page.html',
  styleUrls: ['./protocol-details.page.scss'],
})
export class ProtocolDetailsPage implements OnInit {
  public idProtocol: number = 0;
  public activProtocol: any = {};
  public idCustomer: number = 0;
  public lang: string = localStorage.getItem('lang');
  public company: string = '';
  public activProduct: any = {};
  public listProduct: any[] = [];
  public uploadedFiles: any[] = [];
  public params: any = [];
  public dateien: any = [];
  public link: any;
  public url: any;
  public mobilePlatform: boolean;
  public mouseoverButton1: boolean;
  public mouseoverButton2: boolean;
  public index: number = -1;
  public imageURI: any;
  public file_link: any;
  public nocache: any;
  public customer_number: any;

  constructor(public navCtrl: NavController,
    public route: ActivatedRoute,
    public userdata: UserdataService,
    public apiService: ApiService,
    public translate: TranslateService,
    public alertCtrl: AlertController,
    public datePipe: DatePipe,
    public pdf: PdfExportService,
    public platform: Platform,
    public modalCtrl: ModalController,
    public camera: Camera,
    public loadingCtrl: LoadingController,
    public transfer: FileTransfer) {

  }

  ngOnInit() {
    this.platform.ready().then(() => {
      if (this.platform.is('ios') ||
        this.platform.is('android') ||
        this.platform.is('ipad') ||
        this.platform.is('iphone') ||
        this.platform.is('mobile') ||
        this.platform.is('phablet') ||
        this.platform.is('tablet')) {
        this.mobilePlatform = true;
        this.mouseoverButton1 = true;
        this.mouseoverButton2 = true;
        console.log('platform mobile:', this.platform.platforms());
      } else {
        console.log('platform not mobile:', this.platform.platforms());
        this.mobilePlatform = false;
        this.mouseoverButton1 = false;
        this.mouseoverButton2 = false;
      }
    });

    this.url = this.apiService.pvsApiURL;
    this.route.queryParams.subscribe(params => {
      this.idCustomer = params['idCustomer'];
      this.customer_number = params['customer_number'];
      this.idProtocol = params['idProtocol'];
      //this.company = params["company"];
    });

    console.log('idProtocol :', this.idProtocol);
    this.loadProtocol(this.idProtocol);
    this.dateiListe();
  }

  loadProtocol(id: any) {
    this.apiService.pvs4_get_protocol(id).then((result: any) => {
      this.activProtocol = result.obj;
      this.activProtocol.items = JSON.parse(this.activProtocol.items);
      let productList = JSON.parse(this.activProtocol.product);
      productList.forEach(element => {
        console.log('product list :', element);
        this.loadProduct(element.id);
      });
      if (this.activProtocol.result == 0) { this.activProtocol.resultText = this.translate.instant('betriebsbereit'); }
      if (this.activProtocol.result == 1) { this.activProtocol.resultText = this.translate.instant('reparieren'); }
      if (this.activProtocol.result == 3) { this.activProtocol.resultText = this.translate.instant('unauffindbar'); }
      if (this.activProtocol.result == 4) { this.activProtocol.resultText = this.translate.instant('ausmustern'); }
      console.log('loadProtocol :', this.activProtocol);
      console.log('loadProduct : ', this.listProduct);
    });
  }

  loadProduct(id: any) {
    this.apiService.pvs4_get_product(id).then((result: any) => {
      this.activProduct = result.obj;
      console.log('activProduct :', this.activProduct);
      let title = JSON.parse(this.activProduct.title);
      this.activProduct.title = title[this.lang];
      this.activProduct.items = JSON.parse(this.activProduct.items);
      this.activProduct.idCustomer = this.idCustomer;
      this.activProduct.customer_number = this.customer_number;
      let i: any = 0;
      this.activProduct.items.forEach(event => {
        if (event.type == 5) {
          this.activProduct.items[i].value = this.datePipe.transform(event.value, 'dd.MM.yyyy');
        }
        i++;
      });
      this.listProduct.push(this.activProduct);

      /*         var str: string = this.activProduct.images;
              if(str) {
                this.activProduct.images = (str.indexOf('assets/')) ? 'assets/' + this.activProduct.images : this.activProduct.images;
              }
              console.log("images :", this.activProduct.images);  */
    });
  }

  protocolDeactivate() {
    console.log('delete');
    this.showConfirmAlert(this.activProtocol);
  }

  showConfirmAlert(activProtocol) {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Deaktivierung des Protokolls bestätigen'),
      message: this.translate.instant('Möchten Sie dieses Protokoll wirklich deaktivieren'),
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
            activProtocol.active = 0;
            let obj = JSON.parse(JSON.stringify(this.activProtocol));
            obj['items'] = JSON.stringify(this.activProtocol['items']);
            obj['title'] = JSON.stringify(this.activProtocol['title']);
            let pipe = new DatePipe('en-US');
            if (obj.protocol_date) { obj.protocol_date = pipe.transform(this.activProtocol['protocol_date'], 'yyyy-MM-dd HH:mm:ss'); }
            this.apiService.pvs4_set_protocol(obj).then((result: any) => {
              console.log('result: ', result);
              this.navCtrl.navigateBack('/protocol-list/' + this.idCustomer);
            });
          }
        }
      ]
    }).then(x => x.present());
  }

  printPdf() {
    let pageDesc: string = this.translate.instant('Seite');
    var src = 'assets/imgs/banner_' + this.userdata.licensee + '.jpg';
    let pipe = new DatePipe('en-US');
    let protocolList = [];
    let columns = ['title', 'value'];
    let protocol = this.activProtocol;
    let protocolItems = this.activProtocol.items;
    let product = this.listProduct;

    // Protocol
    var bodyProtocol = [];
    let prtclTitle = [
                      {
                        text: this.translate.instant('Protokoll Details'),
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
    bodyProtocol.push(prtclTitle);

    protocolList.push({ 'title': this.translate.instant('Protokoll Nummer'), 'value': protocol.protocol_number});
    protocolList.push({ 'title': this.translate.instant('Datum'), 'value': pipe.transform(protocol.protocol_date, 'dd.MM.yyyy')});
    protocolList.push({ 'title': this.translate.instant('Prüfergebnis'), 'value': protocol.resultText});
    protocolList.push({ 'title': this.translate.instant('nächste Prüfung'), 'value': pipe.transform(protocol.protocol_date_next, 'dd.MM.yyyy')});
    protocolList.push({ 'title': this.translate.instant('Autor'), 'value': protocol.author});

    protocolItems.forEach(elementItems => {
      if (elementItems.title[this.lang] != '' && elementItems.value != undefined) {
        protocolList.push({ 'title': elementItems.title[this.lang], 'value': elementItems.value });
      } else {
        protocolList.push({ 'title': elementItems.title[this.lang], 'value': ' ' });
      }
    });

    protocolList.forEach(function (row) {
      var dataRow = [];

      columns.forEach(function (column) {
        dataRow.push(row[column].toString());
      })

      bodyProtocol.push(dataRow);
    });
  
    let prtclBody = bodyProtocol;
    console.log('protocol body :', prtclBody);
    
    // Product
    var bodyProduct = [];
    var prdctTitle = [
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

    product.forEach(element => {
      console.log('product element :', this.translate.instant('Titel'), element.title);

      if (element.title != undefined) {
        bodyProduct.push([{ text: this.translate.instant('Titel'), color: '#000000', fillColor: '#8bd8f9' },
                          { text: element.title, color: '#000000', fillColor: '#8bd8f9' }]);
      } else {
        bodyProduct.push([{ text: this.translate.instant('Titel'), color: '#000000', fillColor: '#8bd8f9' },
                          { text: '', color: '#000000', fillColor: '#8bd8f9' }]);
      }
      if (element.idCustomer != undefined) {
        bodyProduct.push([{ text: this.translate.instant('Kunde') + ' ' + 'DB-ID' }, { text: element.idCustomer }]);
      } else {
        bodyProduct.push([{ text: this.translate.instant('Kunde') + ' ' + 'DB-ID'}, { text: '' }]);
      }
      if (element.customer_number != undefined) {
        bodyProduct.push([{ text: this.translate.instant('Kundennummer') }, { text: element.customer_number }]);
      } else {
        bodyProduct.push([{ text: this.translate.instant('Kundennummer') }, { text: '' }]);
      }
      if (element.id_number != undefined) {
        bodyProduct.push([{ text: '#' }, { text: element.id_number }]);
      } else {
        bodyProduct.push([{ text: '#' }, { text: '' }]);
      }
      if (element.articel_no != undefined) {
        bodyProduct.push([{ text: this.translate.instant('Articel No') }, { text: element.articel_no }]);
      } else {
        bodyProduct.push([{ text: this.translate.instant('Articel No') }, { text: '' }]);
      }
      if (element.author != undefined) {
        bodyProduct.push([{ text: this.translate.instant('Autor') }, { text: element.author }]);
      } else {
        bodyProduct.push([{ text: this.translate.instant('Autor') }, { text: '' }]);
      }
      if (element.check_interval != undefined) {
        bodyProduct.push([{ text: this.translate.instant('Intervall Prüfen') }, { text: element.check_interval }]);
      } else {
        bodyProduct.push([{ text: this.translate.instant('Intervall Prüfen') }, { text: '' }]);
      }

      // product oprtions
      element.items.forEach(elementItems => {
        console.log('product oprtions :', elementItems.title, '- ', elementItems.title[this.lang], ' - ', elementItems.value);
        if (elementItems.title[this.lang] != '' && elementItems.value != undefined) {
          bodyProduct.push([{ text: elementItems.title[this.lang]}, {text: elementItems.value }]);
        } else {
          bodyProduct.push([{ text: elementItems.title[this.lang]}, {text: '' }]);
        }
      });

    });

    let prdctBody = bodyProduct;  

    console.log('product body :', prdctBody);

    this.pdf.toDataURL(src, resDataURL => {
      var docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [20, 140, 20, 20],
        header: {
          columns: [
            {
              'image': resDataURL, 'width': 800, margin: 20
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
                  body: prtclBody
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
                  widths: ['auto', '*'],
                  body: prdctBody
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
      
      this.pdf.createPdf(docDefinition, 'download', this.translate.instant('Protokoll Details'.replace(/\s/g, '')) + '.pdf');

    });  
  }

  onBeforeUpload(event) {
    event.formData.append('dir', 'protocol_' + this.activProtocol.id);
    event.formData.append('token', window.localStorage['access_token']);
    console.log('onBeforeUpload event :', event);
  }

  onUpload(event) {
    console.log('setFile event :', event);
    for (let file of event.files) {
      console.log('file', file);
      this.uploadedFiles.push(file);
    }

    this.dateiListe();

  }

  delFile(datei) {
    let alert = this.alertCtrl.create({
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
            this.params = { 'id': this.idProtocol, 'type': 'protocol', 'dateiname': datei };
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
    this.apiService.pvs4_get_file(this.idProtocol, 'protocol').then((result) => {
      console.log('dateiliste', result);
      this.dateien = result['files'];
      this.link = result['link'];
      this.file_link = result['file_link'];
    });
  }

  mouseover(buttonNumber) {
    if (buttonNumber == 1) { 
      this.mouseoverButton1 = true;
    } else if (buttonNumber == 2) {
      this.mouseoverButton2 = true;
         }
  }

  mouseout(buttonNumber) {
    if (this.mobilePlatform == false) {
      if (buttonNumber == 1) { 
        this.mouseoverButton1 = false;
      } else if (buttonNumber == 2) {
        this.mouseoverButton2 = false;
           }
    }
  }

  getCamera() {
    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.imageURI = '';
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      //this.activProtocol.images = 'data:image/jpeg;base64,' + imageData;
      this.imageURI = imageData;
      this.uploadFile();
    }, (err) => {
      console.log(err);
    });
  }

  async uploadFile() {
    let loader = await this.loadingCtrl.create({
      message: 'Uploading...'
    });
    loader.present();
    const fileTransfer: FileTransferObject = this.transfer.create();

    let imageName = this.imageURI.substr(this.imageURI.indexOf('/cache/') + 7);
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: 'protocol_' + imageName,
      chunkedMode: false,
      mimeType: 'image/jpeg',
      httpMethod: 'POST',
      params: {
        'dir': 'protocol_' + this.idProtocol,
        'token': window.localStorage['access_token']
      }
    }

    console.log('imageURI :', this.imageURI);
    console.log('upload :', this.url + 'upload.php');

    fileTransfer.upload(this.imageURI, this.url + 'upload.php', options)
      .then((data) => {
        console.log('Uploaded Successfully :', data);
        this.dateiListe();
        loader.dismiss();
      }, (err) => {
        console.log('Uploaded Error :', err);
        this.activProtocol.images = '';
        loader.dismiss();
      });      
  }  

}

