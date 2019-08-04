import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, Platform } from '@ionic/angular';
import { UserdataService } from '../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/api';
import { DialogproduktbildmodalPage } from '../components/dialogproduktbildmodal/dialogproduktbildmodal.component';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { LoadingController } from '@ionic/angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { DataService } from '../services/data.service';

/**
 * Generated class for the ProductEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.page.html',
  styleUrls: ['./product-edit.page.scss'],
})
export class ProductEditPage implements OnInit {
  public pageTitle: string;
  public idCustomer: number = 0;
  public idProduct: number = 0;
  public parentProduct: number = 0;
  public itsNew: boolean = false;
  public activProduct: any = {
          active: 1,
          id: 0,
          id_number: '',
          articel_no: '',
          check_interval: 12,
          last_protocol: '',
          items: '',
          title: '',
          images: '',
          parent: this.parentProduct,
          customer: 0,
          nfc_tag_id: '',
          qr_code: ''
  };
  public templates: any[] = [];
  public templateAll: any[] = [];
  public selectedTemplate: any[] = [];
  public selectedTmplt: any = 0;
  public selectTemplate: any = 0;
  public searchText: string = '';
  public lang: string = '';
  public options: Array<any> = [];
  public company: string = '';
  public downClick: any = 0;
  public mobilePlatform: boolean = false;
  public imageURI: any;
  public url: any;
  public imagesSave: string;
  public file_link: any;
  public nocache: any;
  public maxDate: string;
  private loader: HTMLIonLoadingElement;
  public mandatoryControl: boolean = false;
  public productListAll: any[] = [];
  public allnodes: any[] = [];
  public idnumberControl: boolean = false;
  public uploadedFiles: any[] = [];

  constructor(public navCtrl: NavController,
    public route: ActivatedRoute,
    public translate: TranslateService,
    public userdata: UserdataService,
    public apiService: ApiService,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public platform: Platform,
    public camera: Camera,
    public transfer: FileTransfer,
    public dataService: DataService,
    public loadingCtrl: LoadingController) {

  }

  ngOnInit() {
    this.url = this.apiService.pvsApiURL;
    this.maxDate = this.apiService.maxDate;

    if (this.route.snapshot.data['special']) {
      let params = this.route.snapshot.data['special'];
      this.idCustomer = params['idCustomer'];
      this.idProduct = params['id'];
      this.parentProduct = params['parent'];
    }

    this.dateiListe();

    this.platform.ready().then(() => {
      if (this.platform.is('ios') ||
        this.platform.is('android') ||
        this.platform.is('ipad') ||
        this.platform.is('iphone') ||
        this.platform.is('mobile') ||
        this.platform.is('mobileweb') ||
        this.platform.is('phablet') ||
        this.platform.is('tablet')) {
        this.mobilePlatform = true;
      } else {
        console.log('platform :', this.platform.platforms());
      }
    });

    if (!this.parentProduct) { this.parentProduct = 0; }
    if (this.idProduct > 0) {
      this.itsNew = false;
      this.pageTitle = this.translate.instant('Produkt bearbeiten');
      this.loadProduct();
    } else {
      this.idProduct = 0;
      this.itsNew = true;
      this.pageTitle = this.translate.instant('Neues Produkt');
    }
    this.lang = localStorage.getItem('lang');
    this.loadTemplate();
    this.loadProductList();

    console.log('ProductEditComponent: ', this.idProduct);
    this.nocache = new Date().getTime();
  }

  dateiListe() {
    this.apiService.pvs4_get_file(this.idProduct, 'product').then((result) => {
        console.log('dateiliste', result);
        this.file_link = result['file_link'];
    });
  }

  down_click() {
    if (this.downClick == 0) {
      this.downClick = 1;
      this.templates.sort(function (a, b) {
        if (a.title[localStorage.getItem('lang')].toLowerCase() < b.title[localStorage.getItem('lang')].toLowerCase()) { return -1; }
        if (a.title[localStorage.getItem('lang')].toLowerCase() > b.title[localStorage.getItem('lang')].toLowerCase()) { return 1; }
        return 0;
      }
      );
    } else {
      this.downClick = 0;
      this.templates.reverse();
    }
  }

  onclickTemplate(tmpId) {
    if (tmpId != this.selectedTmplt) {
      this.selectedTemplate[this.selectedTmplt] = 0;
    }
    if (this.selectedTemplate[tmpId] == 0) {
      this.selectedTemplate[tmpId] = 1;
      this.selectTemplate = 1;
    } else {
      this.selectedTemplate[tmpId] = 0;
      this.selectTemplate = 0;
    }
    this.selectedTmplt = tmpId;
  }

  loadProduct() {
    this.activProduct.images = '';
    this.apiService.pvs4_get_product(this.idProduct).then((result: any) => {
      this.activProduct = result.obj;
      this.activProduct.title = JSON.parse(result.obj.title);
      this.activProduct.items = JSON.parse(result.obj.items);
      console.log('loadProduct: ', this.activProduct, this.activProduct.items);
      this.imagesSave = this.activProduct.images;
      var str: string = this.activProduct.images;
      if (str) {
        console.log('images 1:', this.activProduct.images);
        if (str.indexOf('img/') != -1) {
          this.activProduct.images = 'assets/' + this.activProduct.images;
        }
        if (str.indexOf('mobileimages/') != -1) {
          this.activProduct.images = this.file_link + this.activProduct.images;
        }
        console.log('images 2:', this.activProduct.images);
      }
    });
  }

  loadTemplate() {
    this.templates = [];
    this.apiService.pvs4_get_product_tem(this.userdata.licensee, 1).then((result: any) => {
      result.list.forEach(element => {
        element.data.options = JSON.parse(element.data.options);
        element.data.title = JSON.parse(element.data.title);
        this.templates.push(element.data);
        this.selectedTemplate[element.data.id] = 0;
      });
      this.templateAll = JSON.parse(JSON.stringify(this.templates));
      // console.log('Template Title :', this.templates);
    });
  }

  loadProductList() {
    this.productListAll = [];
    this.apiService.pvs4_get_product_list(this.idCustomer).then((result: any) => {
      console.log('loadProductList result :', result);
      this.productListAll = JSON.parse(JSON.stringify(result.list));
      this.data_tree(this.productListAll);
      // console.log('productListAll :', this.productListAll);
    });
  }

  data_tree(nodes: any[]): any {
    for (let i = 0; i < nodes.length; i++) {
        this.allnodes.push(nodes[i].data);
        if (nodes[i].children && nodes[i].children.length > 0) {
            this.data_tree(nodes[i].children);
        }
    }
  }

  search_all() {
    this.templates = JSON.parse(JSON.stringify(this.templateAll));
    for (let i = this.templates.length - 1; i >= 0; i--) {
      if (this.templates[i].title[this.lang].toLowerCase().indexOf(this.searchText.toLowerCase()) < 0) {
        this.templates.splice(i, 1);
      }
    }
  }

  move_right() {
    this.showConfirmTemplateAlert(this.activProduct);
  }

  productEdit() {
    console.log('productEdit()');

    this.mandatoryControl = false;
    if (!this.activProduct['items']) {
      this.showOptionAlert();
      return;
    }
    if (!this.activProduct['title']) {
      this.mandatoryControl = true;
    }
    if (!this.activProduct['id_number']) {
      this.mandatoryControl = true;
    }
    this.activProduct.items.forEach(element => {
      // console.log('Mandatory Control :', element, element.mandatory, element.type, element.value);
      // Toggle
      if (element.type == 0) {
        if (element.mandatory == 'true' && !element.value) {
          this.mandatoryControl = true;
        }
      }
      // Select
      if (element.type == 1) {
        // console.log('select :', element.mandatory, element.value);
        if (element.mandatory == 'true' && element.value == null) {
          this.mandatoryControl = true;
        }
      }
      // Textarea
      if (element.type == 2) {
        // console.log('textarea :', element.mandatory, element.value);
        if (element.mandatory == 'true' &&  element.value == null) {
          this.mandatoryControl = true;
        }
      }
      // Number
      if (element.type == 3) {
        // console.log('number :', element.mandatory, element.value);
        if (element.mandatory == 'true' &&  element.value == null) {
          this.mandatoryControl = true;
        }
      }
      // Time
      if (element.type == 4) {
        // console.log('time :', element.mandatory, element.value);
        if (element.mandatory == 'true' && element.value == null) {
          this.mandatoryControl = true;
        }
      }
      // Date
      if (element.type == 5) {
        // console.log('date :', element.mandatory, element.value);
        if (element.mandatory == 'true' && element.value == null) {
          this.mandatoryControl = true;
        }
      }

    });

    if (this.mandatoryControl) {
      this.showMandatoryAlert();
      return;
    }

    this.idnumberControl = false;
    // console.log('allnodes :', this.allnodes);
    this.allnodes.forEach(element => {
      if ((this.activProduct.id_number == element.id_number) && (this.activProduct.id != element.id)) {
        this.idnumberControl = true;
      }
    });

    if (this.idnumberControl) {
      this.showConfirmIDNumberAlert();
      return;
    }

    let imgstr: string = this.imagesSave;
    console.log('productEdit imgstr :', imgstr);
    if (imgstr != null) {
      if (imgstr.indexOf('assets/') != -1) {
        this.imagesSave = imgstr.replace('assets/', '');
      }
      if (imgstr.indexOf('attachments/') != -1) {
        this.imagesSave = imgstr.replace('attachments/', '');
      }
    } else {
      this.imagesSave = '';
    }
    console.log('edit images :', this.imagesSave);

    let obj = {
      active: 1,
      id_number: '',
      articel_no: '',
      check_interval: 0,
      last_protocol: '',
      items: '',
      title: '',
      images: this.imagesSave,
      parent: this.parentProduct,
      customer: this.idCustomer,
      id: 0,
      nfc_tag_id: '',
      qr_code: ''
    };

    if (this.activProduct['active']) { obj.active = this.activProduct['active']; }
    if (this.activProduct['title']) { obj.title = JSON.stringify(this.activProduct['title']); }
    if (this.activProduct['id_number']) { obj.id_number = this.activProduct['id_number']; }
    if (this.activProduct['articel_no']) { obj.articel_no = this.activProduct['articel_no']; }
    if (this.activProduct['check_interval']) { obj.check_interval = this.activProduct['check_interval']; }
    if (this.activProduct['last_protocol']) { obj.last_protocol = this.activProduct['last_protocol']; }
    if (this.activProduct['items']) { obj.items = JSON.stringify(this.activProduct['items']); }
    if (this.activProduct['customer']) { obj.customer = this.activProduct['customer']; }
    if (this.activProduct['images']) { obj.images = this.imagesSave; }
    if (this.activProduct['nfc_tag_id']) { obj.nfc_tag_id = this.activProduct['nfc_tag_id']; }
    if (this.activProduct['qr_code']) { obj.qr_code = this.activProduct['qr_code']; }

    console.log('edit title :', this.activProduct['title']);
    if (!this.itsNew) {
      obj.id = this.activProduct['id'];
      this.idProduct = this.activProduct['id'];
      // if(this.activProduct["title"]) obj.title = this.activProduct["title"];
    } else {
      this.activProduct.active = 1;
      // if(this.activProduct["title"]) obj.title = this.activProduct["title"];
    }
    console.log('obj :', obj);

    this.apiService.pvs4_set_product(obj).then((result: any) => {
      console.log('result: ', result);
      // this.viewCtrl.dismiss(true);
      this.dismiss();
    });

    var str: string = this.imagesSave;
    console.log('str :', str);
    if (str != '') {
      if (str.indexOf('img/') != -1) {
        this.activProduct.images = 'assets/' + this.imagesSave;
      }
      if (str.indexOf('mobileimages/') != -1) {
        this.activProduct.images = this.file_link + this.imagesSave;
      }
    }

  }

  dismiss() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        refresh: new Date().getTime()
      }
    };
    this.navCtrl.navigateRoot(['/product-list', this.idCustomer], navigationExtras);
  }

  productDeactivate() {
    console.log('delete');
    this.showConfirmAlert(this.activProduct);
  }

  templateDeactivate() {
    console.log('delete template');
    this.showConfirmDeleteTemplate();
  }

  keyDown(event: any) {
    // const pattern = /^(\d*\,)?\d+$/;
    let regex = new RegExp(/[0-9]/g);
    let inputChar = String.fromCharCode(event.keyCode);
    if (event.keyCode == 37 ||
        event.keyCode == 39 ||
        event.keyCode == 8 ||
        event.keyCode == 46 ||
        event.keyCode == 188 ||
        event.keyCode == 110 ||
        (event.keyCode >= 96 && event.keyCode <= 105)) {  // Left / Up / Right / Down Arrow, Backspace, Delete keys
      return;
    }

    if (!inputChar.match(regex)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  async getImage() {
    const modal =
      await this.modalCtrl.create({
        component: DialogproduktbildmodalPage,
        componentProps: {
          'redDirect': 1
        }
      });

    modal.onDidDismiss().then(data => {
      if (data['data']) {
        console.log('getImage data :', data, data['data']);
        this.activProduct.images = data['data'];
        this.imagesSave = data['data'];

        let imgstr: string = this.imagesSave;
        console.log('productEdit imgstr :', imgstr);
        if (imgstr != null) {
          if (imgstr.indexOf('assets/') != -1) {
            this.imagesSave = imgstr.replace('assets/', '');
          }
          if (imgstr.indexOf('attachments/') != -1) {
            this.imagesSave = imgstr.replace('attachments/', '');
          }
        } else {
          this.imagesSave = '';
        }

        let obj = JSON.parse(JSON.stringify(this.activProduct));
        if (obj['id'] > 0) {
          obj['items'] = JSON.stringify(this.activProduct['items']);
          obj['title'] = JSON.stringify(this.activProduct['title']);
          obj['images'] = this.imagesSave;
          this.apiService.pvs4_set_product(obj).then((result: any) => {
            console.log('result: ', result);
          });
        }

      }
    });
    modal.present();

    console.log('get images :', this.imagesSave);
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
      // this.activProduct.images = 'data:image/jpeg;base64,' + imageData;
      this.imageURI = imageData;
      this.uploadFile();
    }, (err) => {
      console.log(err);
    });
  }

  async uploadFile() {
    if (!this.loader) {
      this.loader = await this.loadingCtrl.create({
        message: 'Uploading...'
      });
    }
    await this.loader.present();
    const fileTransfer: FileTransferObject = this.transfer.create();

    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: 'productimage_' + this.idProduct + '.jpg',
      chunkedMode: false,
      mimeType: 'image/jpeg',
      httpMethod: 'POST',
      params: {
        'dir': 'mobileimages',
        'token': window.localStorage['access_token']
      }
    };

    console.log('imageURI :', this.imageURI);
    console.log('upload :', this.url + 'upload.php');

    fileTransfer.upload(this.imageURI, this.url + 'upload.php', options)
      .then((data) => {
        console.log('Uploaded Successfully :', data);
        this.activProduct.images = this.imageURI;
        this.imagesSave = 'mobileimages/productimage_' + this.idProduct + '.jpg';
        console.log('upload images :', this.imagesSave);
        this.hideLoader();

        let imgstr: string = this.imagesSave;
        console.log('productEdit imgstr :', imgstr);
        if (imgstr != null) {
          if (imgstr.indexOf('assets/') != -1) {
            this.imagesSave = imgstr.replace('assets/', '');
          }
          if (imgstr.indexOf('attachments/') != -1) {
            this.imagesSave = imgstr.replace('attachments/', '');
          }
        } else {
          this.imagesSave = '';
        }

        let obj = JSON.parse(JSON.stringify(this.activProduct));
        if (obj['id'] > 0) {
          obj['items'] = JSON.stringify(this.activProduct['items']);
          obj['title'] = JSON.stringify(this.activProduct['title']);
          obj['images'] = this.imagesSave;
          this.apiService.pvs4_set_product(obj).then((result: any) => {
            console.log('result: ', result);
          });
        }

      }, (err) => {
        console.log('Uploaded Error :', err);
        this.activProduct.images = '';
        this.hideLoader();
      });
  }

  onFileUpload(data: { files: File }): void {
    const formData: FormData = new FormData();
    const file = data.files[0];

    console.log('uploader :', formData, file);

    formData.append('token', window.localStorage['access_token']);
    formData.append('dir', 'mobileimages');
    formData.append('file', file, 'productimage_' + this.idProduct + '.jpg');
    console.log('onBeforeUpload event :', formData, file.name);

   this.apiService.pvs4_uploadphp(formData).then((result: any) => {
        console.log('result: ', result);
        this.nocache = new Date().getTime();
        this.activProduct.images = this.file_link + 'mobileimages/productimage_' + this.idProduct + '.jpg';
        this.imagesSave = 'mobileimages/productimage_' + this.idProduct + '.jpg';
        console.log('upload images :', this.file_link, this.activProduct.images);

        let imgstr: string = this.imagesSave;
        console.log('productEdit imgstr :', imgstr);
        if (imgstr != null) {
          if (imgstr.indexOf('assets/') != -1) {
            this.imagesSave = imgstr.replace('assets/', '');
          }
          if (imgstr.indexOf('attachments/') != -1) {
            this.imagesSave = imgstr.replace('attachments/', '');
          }
        } else {
          this.imagesSave = '';
        }

        let obj = JSON.parse(JSON.stringify(this.activProduct));
        if (obj['id'] > 0) {
          obj['items'] = JSON.stringify(this.activProduct['items']);
          obj['title'] = JSON.stringify(this.activProduct['title']);
          obj['images'] = this.imagesSave;
          this.apiService.pvs4_set_product(obj).then((result: any) => {
            console.log('result: ', result);
          });
        }

    });

  }

  async hideLoader() {
    if (this.loader) {
      await this.loader.dismiss();
      this.loader = null;
    }
  }
  showConfirmAlert(activProduct) {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Deaktivierung des Produkts bestätigen'),
      message: this.translate.instant('Möchten Sie dieses Produkt wirklich deaktivieren'),
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
            activProduct.active = 0;
            let obj = JSON.parse(JSON.stringify(this.activProduct));
            obj['items'] = JSON.stringify(this.activProduct['items']);
            obj['title'] = JSON.stringify(this.activProduct['title']);
            this.apiService.pvs4_set_product(obj).then((result: any) => {
              console.log('result: ', result);
              this.dismiss();
/*               let navigationExtras: NavigationExtras = {
                queryParams: {
                  refresh: new Date().getTime()
                }
              };
              this.navCtrl.navigateBack(['/product-list/' + this.idCustomer], navigationExtras); */
          });
        }
       }
      ]
    }).then(x => x.present());

  }

  showConfirmDeleteTemplate() {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Deaktivierung der Vorlage bestätigen'),
      message: this.translate.instant('Möchten Sie dieses Vorlage wirklich deaktivieren'),
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
            let temp = JSON.parse(JSON.stringify(this.templates.find(x => x.id == this.selectedTmplt)));
            temp.active = 0;
            temp.title = JSON.stringify(temp.title);
            temp.options = JSON.stringify(temp.options);
            this.apiService.pvs4_set_product_tem(temp).then((result: any) => {
              console.log('result: ', result);
              let id = this.selectedTmplt;
              this.templates = this.templates.filter(function (value: any, index: number, array: any[]) { return value.id != id; });
              this.selectedTemplate[this.selectedTmplt] = 0;
              this.selectTemplate = 0;
            });
          }
        }
      ]
    }).then(x => x.present());
  }

  showConfirmTemplateAlert(activProduct) {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Bestätigen Sie die Produkterstellung'),
      message: this.translate.instant('Möchten Sie diese Vorlage wirklich verwenden'),
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
            let temp = this.templates.find(x => x.id == this.selectedTmplt);
            console.log('items: ', temp);

            for (let index = 0; index < temp.options.length; index++) {
              if (temp.options[index].mandatory == '' || temp.options[index].mandatory == undefined) {
                temp.options[index].mandatory = 'false';
              }
              if (temp.options[index].mandatory == 0) {
                temp.options[index].mandatory = 'false';
              }
              if (temp.options[index].mandatory == 1) {
                temp.options[index].mandatory = 'true';
              }
              // console.log('mandatory :', temp.options[index].mandatory);
              if (temp.options[index].type == 0 || temp.options[index].type == 4) {
                temp.options[index].value = temp.options[index].options.default;
                // this.activProduct.items[index].value = temp.options[index].options.default;
              } else {
                temp.options[index].value = null;
              }

            }

            this.activProduct.items = temp.options;
            this.activProduct.title = this.templates.find(x => x.id == this.selectedTmplt).title;
            console.log('activProduct.items :', this.activProduct.items);
          }
        }
      ]
    }).then(x => x.present());
  }

  showMandatoryAlert() {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Produkt speichern short'),
      message: this.translate.instant('Bitte füllen Sie alle Pflichtfelder aus.'),
      buttons: [
        {
          text: this.translate.instant('ja'),
          handler: () => {

          }
        }
      ]
    }).then(x => x.present());
  }

  showOptionAlert() {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Produkt speichern short'),
      message: this.translate.instant('Produkt Option long'),
      buttons: [
        {
          text: this.translate.instant('ja'),
          handler: () => {

          }
        }
      ]
    }).then(x => x.present());
  }

  edit_template() {
    let activTemplate = this.templates.find(x => x.id == this.selectedTmplt);
    console.log('Active Template :', activTemplate);

    let data = {
      idTemplate: this.selectedTmplt,
      idCustomer: this.idCustomer,
      activTemplate: JSON.stringify(activTemplate)
  }
    this.dataService.setData(data);
    this.navCtrl.navigateForward(['/product-template']);
  }

  /*async new_Option() {
    const modal =
      await this.modalCtrl.create({
        component: ProductNewPage,
        componentProps: {
          id: 0, idCustomer: this.idCustomer
        }
      });

    modal.onDidDismiss().then(data => {
      if (data['data']) {
        if (this.activProduct.items == '') {
          this.activProduct.items = [];
        }
        this.activProduct.items.push(data['data']);
      }
    });
    modal.present();
  }*/

  promptOptionTitle(title, type, index) {
    console.log('promptProductTitle(): ', title, type, index);
    console.log('this.activProduct: ', this.activProduct);
    let myTitel = this.translate.instant('Auswahlmöglichkeiten');
    if (type == 1) { myTitel = this.translate.instant('Titel'); }

    let alert = this.alertCtrl.create({
      header: myTitel,
      cssClass: 'promptClass',
      inputs: [
        {
          name: 'de',
          placeholder: this.translate.instant('Titel') + ' (de)',
          value: title.de
        },
        {
          name: 'en',
          placeholder: this.translate.instant('Titel') + ' (en)',
          value: title.en
        },
        {
          name: 'fr',
          placeholder: this.translate.instant('Titel') + ' (fr)',
          value: title.fr
        },
        {
          name: 'it',
          placeholder: this.translate.instant('Titel') + ' (it)',
          value: title.it
        }
      ],
      buttons: [
        {
          text: this.translate.instant('dismiss'),
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked:', data);
          }
        },
        {
          text: this.translate.instant('okay'),
          handler: data => {
            console.log('OK clicked:', data);
            data.de = data.de.trim();
            data.en = data.en.trim();
            data.fr = data.fr.trim();
            data.it = data.it.trim();
            if ((data.de == '') || (data.en == '') || (data.fr == '') || (data.it == '')) {
              return false;
            } else {
              console.log('options:', this.options);
              if (type == 1) {
                this.activProduct.title = data;
              } else {
                this.options[index] = data;
              }
              return true;
            }
          }
        }
      ]
    }).then(x => x.present());
  }

  showConfirmIDNumberAlert() {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Produkt speichern short'),
      message: this.translate.instant('Bitte überprüfen Sie das Feld ID-Nummer. Diese Nummer wird verwendet.'),
      buttons: [
        {
          text: this.translate.instant('ja'),
          handler: () => {

          }
        }
      ]
    }).then(x => x.present());

  }

  showConfirmDeletImageAlert() {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Produktbild löschen'),
      message: this.translate.instant('Das Produktbild wird gelöscht. Sind Sie sicher?'),
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
            this.delImage();
          }
        }
      ]
    }).then(x => x.present());

  }

  delImage() {
    this.activProduct.images = '';
    this.imagesSave = '';
    let obj = JSON.parse(JSON.stringify(this.activProduct));
    if (obj['id'] > 0) {
      obj['items'] = JSON.stringify(this.activProduct['items']);
      obj['title'] = JSON.stringify(this.activProduct['title']);
      obj['images'] = this.activProduct.images;
      this.apiService.pvs4_set_product(obj).then((result: any) => {
        console.log('result: ', result);
      });
    }
  }
}
