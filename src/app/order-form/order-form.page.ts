import { Component } from '@angular/core';
import { NavController, ModalController, Events, Platform, LoadingController, AlertController,ToastController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { SystemService } from './../services/system';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { DatePipe } from '@angular/common';
import { PdfExportService } from '../services/pdf-export';
import { OrderSendPage } from './order-send/order-send.page';
import { ActivatedRoute } from '@angular/router';
import { DialogproduktbildmodalPage } from '../components/dialogproduktbildmodal/dialogproduktbildmodal.component';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

/**
 * Generated class for the OrderFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 */

@Component({
  selector: 'app-order-form',
  templateUrl: 'order-form.page.html',
  styleUrls: ['./order-form.page.scss'],
})

export class OrderFormPage {
  public idCustomer: number;
  public maxDate: string;
  public deliveryDate: any;
  public mobilePlatform: boolean;
  public activCustomer: any = [];
  public contactPersonList: any = [];
  public listProduct: any[] = [];
  public nocache: any;
  public noteRows: any;
  public file_link: any;
  public url: any;
  public imageDataUri: any;
  public imageURI: any;
  private loader: HTMLIonLoadingElement;
  public lang: string = localStorage.getItem('lang');
  public products: any[] = [];
  // public products: any = [{
  //   quantity: '',
  //   pvsid: '',
  //   articleno: '',
  //   designation: ''
  // }];
  public activOrderForm: any = {
    orderCheckBox: false,
    offerCheckBox: false,
    repairCheckBox: false,
    inspectionCheckBox: false,
    rentCheckBox: false,
    billing: {
      company: '',
      street: '',
      zipCodePlace: '',
      sector: '',
      email: '',
      phone: '',
      internet: ''
    },
    shipping: {
      name: '',
      street: '',
      zipCodePlace: '',
      department: '',
      email: '',
      phone: '',
      mobile: ''
    },
    order_nr: '',
    contract_nr: '',
    pvs_order_nr: Date.now(),
    commission: '',
    order_date: '',
    delivery_date: '',
    sampleDeliveryCheckBox: false,
    creditCheckBox: false,
    confOrderCheckBox: false,
    afterLoadingCheckBox: false,
    postCheckBox: false,
    expressCheckBox: false,
    aboutBrachtCheckBox: false,
    lkwCheckBox: false,
    evenPickupCheckBox: false,
    keepIdNumber: false,
    products: {
      quantity: '',
      pvsid: '',
      articleno: '',
      designation: ''},
    note: '',
    image: '',
    imageType: '',
    commissioned: '',
    customerNumber: '',
    dbId: ''
  };

  constructor(public navCtrl: NavController,
              public apiProvider: ApiService,
              public systemService: SystemService,
              public userdata: UserdataService,
              public translate: TranslateService,
              public modalCtrl: ModalController,
              public events: Events,
              public platform: Platform,
              public pdf: PdfExportService,
              public datePipe: DatePipe,
              public loadingCtrl: LoadingController,
              private route: ActivatedRoute,
              public alertCtrl: AlertController,
              private toastCtrl: ToastController,
              public camera: Camera,
              public transfer: FileTransfer) {

  }

  ngOnInit() {
    this.idCustomer = 0;
    this.mobilePlatform = false;
    this.noteRows = 5;
    this.dateiListe();
    this.activOrderForm.orderCheckBox = false;
    this.activOrderForm.orderCheckBox = false;
    this.activOrderForm.offerCheckBox = false;
    this.activOrderForm.repairCheckBox = false;
    this.activOrderForm.inspectionCheckBox = false;
    this.activOrderForm.rentCheckBox = false;
    this.activOrderForm.billing.company = '';
    this.activOrderForm.billing.street = '';
    this.activOrderForm.billing.zipCodePlace = '';
    this.activOrderForm.billing.sector = '';
    this.activOrderForm.billing.email = '';
    this.activOrderForm.billing.phone = '';
    this.activOrderForm.billing.internet = '';
    this.activOrderForm.shipping.name = '';
    this.activOrderForm.shipping.street = '';
    this.activOrderForm.shipping.zipCodePlace = '';
    this.activOrderForm.shipping.department = '';
    this.activOrderForm.shipping.email = '';
    this.activOrderForm.shipping.phone = '';
    this.activOrderForm.shipping.mobile = '';
    this.activOrderForm.order_nr = '';
    this.activOrderForm.contract_nr = '';
    this.activOrderForm.pvs_order_nr = Date.now();
    this.activOrderForm.commission = '';
    this.activOrderForm.order_date = '';
    this.activOrderForm.delivery_date = '';
    this.activOrderForm.sampleDeliveryCheckBox = false;
    this.activOrderForm.creditCheckBox = false;
    this.activOrderForm.confOrderCheckBox = false;
    this.activOrderForm.afterLoadingCheckBox = false;
    this.activOrderForm.postCheckBox = false;
    this.activOrderForm.expressCheckBox = false;
    this.activOrderForm.aboutBrachtCheckBox = false;
    this.activOrderForm.lkwCheckBox = false;
    this.activOrderForm.evenPickupCheckBox = false;
    this.activOrderForm.keepIdNumber = false;
    this.activOrderForm.products.quantity = '';
    this.activOrderForm.products.pvsid = '';
    this.activOrderForm.products.articleno = '';
    this.activOrderForm.products.designation = '';
    this.activOrderForm.note = '';
    this.activOrderForm.image = '';
    this.activOrderForm.imageType = '';
    this.activOrderForm.commissioned = '';
    this.activOrderForm.customerNumber = '';
    this.activOrderForm.dbId = '';

    this.url = this.apiProvider.pvsApiURL;
    this.imageDataUri = '';
    this.noteRows = 5;

    this.pdf.toDataURL('assets/imgs/product_img.jpg', data => {
      if (data) {
        this.imageDataUri = data;
      }
    });

    this.platform.ready().then(() => {
      if ( this.platform.is('ios') ||
        this.platform.is('android') ) {
        this.mobilePlatform = true;
        console.log('platform mobile:', this.platform.platforms());
      } else {
        console.log('platform not mobile:', this.platform.platforms());
        this.mobilePlatform = false;
      }
    });

    this.idCustomer = parseInt(this.route.snapshot.paramMap.get('id'));
    this.getContactList();
    this.loadCustomer(this.idCustomer);
    this.loadProducts();

    this.maxDate = this.apiProvider.maxDate;
    this.activOrderForm.commissioned = this.userdata.first_name + ' ' +
                                       this.userdata.last_name + ' (' +
                                       this.userdata.email + ')';
  }

  loadCustomer(id: number) {
    this.apiProvider.pvs4_get_customer(id).then((result: any) => {
      console.log('loadCustomer :', result.obj);
      this.activCustomer = result.obj;
      this.loadOrderForm(this.activCustomer);
    });
  }

  loadOrderForm(activCustomer) {
    console.log('activCustomer :', activCustomer);
    this.activOrderForm.billing.company = activCustomer.company;
    this.activOrderForm.billing.street = activCustomer.street;
    this.activOrderForm.billing.zipCodePlace = activCustomer.zip_code + '  ' + activCustomer.place;
    this.activOrderForm.billing.sector = activCustomer.sector;
    this.activOrderForm.billing.email = activCustomer.email;
    this.activOrderForm.billing.phone = activCustomer.phone;
    this.activOrderForm.billing.internet = activCustomer.website;

    this.activOrderForm.shipping.street = activCustomer.street;
    this.activOrderForm.shipping.zipCodePlace = activCustomer.zip_code + '  ' + activCustomer.place;
    this.activOrderForm.shipping.email = activCustomer.email;
    this.activOrderForm.shipping.phone = activCustomer.phone;

    this.activOrderForm.order_date = new Date().toISOString();
    this.deliveryDate = new Date();
    this.deliveryDate.setDate(this.deliveryDate.getDate() + 7);
    this.activOrderForm.delivery_date = this.deliveryDate.toISOString();
    this.activOrderForm.customerNumber = activCustomer.customer_number;
    this.activOrderForm.dbId = activCustomer.id;
  }

  getContactList() {
    console.log('getContactList :', this.idCustomer);
    this.apiProvider.pvs4_get_contact_person(this.idCustomer).then((result: any) => {
      console.log('getPointContact result', result.list);
      for (let i = 0, len = result.list.length; i < len; i++) {
        let item = result.list[i].data;
        item.addresses = JSON.parse(item.addresses);
        this.contactPersonList.push(item);
      }
    });
  }

  changeContactPerson(contactPerson) {
    console.log('contactPerson :', contactPerson.detail.value);
    if (contactPerson.detail.value == 0) {
      this.activOrderForm.shipping.name = '';
      this.activOrderForm.shipping.street = this.activOrderForm.billing.street;
      this.activOrderForm.shipping.zipCodePlace = this.activOrderForm.billing.zipCodePlace;
      this.activOrderForm.shipping.department = '';
      this.activOrderForm.shipping.email = this.activOrderForm.billing.email;
      this.activOrderForm.shipping.phone = this.activOrderForm.billing.phone;
      this.activOrderForm.shipping.mobile = '';
    } else if (contactPerson.detail.value == 1) {
      this.activOrderForm.shipping.name = '';
      this.activOrderForm.shipping.street = '';
      this.activOrderForm.shipping.zipCodePlace = '';
      this.activOrderForm.shipping.department = '';
      this.activOrderForm.shipping.email = '';
      this.activOrderForm.shipping.phone = '';
      this.activOrderForm.shipping.mobile = '';
    } else {
      console.log('contactPerson :', contactPerson.detail, contactPerson.detail.value.addresses);
      this.activOrderForm.shipping.name = contactPerson.detail.value.first_name + ' ' + contactPerson.detail.value.last_name;
      this.activOrderForm.shipping.street = '';
      this.activOrderForm.shipping.zipCodePlace = '';
      this.activOrderForm.shipping.department = '';
      this.activOrderForm.shipping.email = '';
      this.activOrderForm.shipping.phone = '';
      this.activOrderForm.shipping.mobile = '';
      for (let i = 0, len = contactPerson.detail.value.addresses.length; i < len; i++) {
        if (contactPerson.detail.value.addresses[i].address_type == 'Lieferadresse') {
          this.activOrderForm.shipping.street = contactPerson.detail.value.addresses[i].street;
          this.activOrderForm.shipping.zipCodePlace = contactPerson.detail.value.addresses[i].zip_code;
          this.activOrderForm.shipping.department = contactPerson.detail.value.addresses[i].department;
          this.activOrderForm.shipping.email = contactPerson.detail.value.addresses[i].email;
          this.activOrderForm.shipping.phone = contactPerson.detail.value.addresses[i].phone;
          this.activOrderForm.shipping.mobile = contactPerson.detail.value.addresses[i].mobile;
          return;
        }
      }
    }
  }

  loadProducts() {
    this.products = this.systemService.getProduct();
  }

  addProduct() {
    // this.products.push({
    //   quantity: '',
    //   pvsid: '',
    //   articleno: '',
    //   designation: ''
    // });
    this.systemService.addProduct(0, '', '', '', '');
    this.loadProducts();
    console.log('addProduct :', this.products);
  }

  remProduct(index) {
    this.systemService.removeProduct(index);
    // this.products.splice(index, 1);
    if (this.products.length == 0) {
      // this.products.push({
      //   quantity: '',
      //   pvsid: '',
      //   articleno: '',
      //   designation: ''
      // });
      this.systemService.addProduct(0, '', '', '', '');
    }
    this.loadProducts();
    console.log('remProduct :', this.products);
  }

   ordersSend() {
    this.activOrderForm.products = {quantity: '',
                                    pvsid: '',
                                    articleno: '',
                                    designation: ''
                                   };
    const tmpProducts: any = [];
    for (let i = 0, len = this.products.length; i < len; i++) {
      tmpProducts.push(this.products[i]);
    }
    this.activOrderForm.products = tmpProducts;

    this.printPdf('base64').then(async (result: string) => {
      // console.log('pdf result :', result);
      const modalPage = await this.modalCtrl.create({
        component: OrderSendPage,
        cssClass: 'ordersend-modal-css',
        componentProps: {
          'idCustomer': this.idCustomer,
          'company': this.activOrderForm.billing.company ,
          'activOrderForm': this.activOrderForm,
          'pdfRetVal': result
        }
      });
      modalPage.onDidDismiss().then(ret => {
        if (ret) {
          console.log('OrderSendPage ret', ret);
          if (ret.data == true) {
            this.ngOnInit();
            this.systemService.resetProduct();
            this.loadProducts();
          }
        }
      });
      modalPage.present();
    });
  }

  async printPdf(pdfMethod: any) {
    const pageDesc: string = this.translate.instant('Seite');
    const loader = await this.loadingCtrl.create({
      message: this.translate.instant('Bitte warten')
    });
    loader.present();
    return new Promise((res) => {
      this.activOrderForm.products = {quantity: '',
                                      pvsid: '',
                                      articleno: '',
                                      designation: ''
                                    };
      const tmpProducts: any = [];
      for (let i = 0, len = this.products.length; i < len; i++) {
        tmpProducts.push(this.products[i]);
      }
      this.activOrderForm.products = tmpProducts;

      let src = 'assets/imgs/banner_' + this.userdata.licensee + '.jpg';
      const pipe = new DatePipe('en-US');

      /* Check Box 1 */
      let checkBoxBody1 = [];
      if (this.activOrderForm.orderCheckBox) {
        checkBoxBody1.push([ { text: this.translate.instant('Bestellen'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody1.push([ { text: this.translate.instant('Bestellen'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody1.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody2 = [];
      if (this.activOrderForm.offerCheckBox) {
        checkBoxBody2.push([ { text: this.translate.instant('Offerte'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody2.push([ { text: this.translate.instant('Offerte'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody2.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody3 = [];
      if (this.activOrderForm.repairCheckBox) {
        checkBoxBody3.push([ { text: this.translate.instant('Reparatur'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody3.push([ { text: this.translate.instant('Reparatur'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody3.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody4 = [];
      if (this.activOrderForm.inspectionCheckBox) {
        checkBoxBody4.push([ { text: this.translate.instant('Prüfung'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody4.push([ { text: this.translate.instant('Prüfung'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody4.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody5 = [];
      if (this.activOrderForm.rentCheckBox) {
        checkBoxBody5.push([ { text: this.translate.instant('Miete'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody5.push([ { text: this.translate.instant('Miete'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody5.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Invoice Address */
      let bodyInvoiceAddress = [];
      bodyInvoiceAddress.push([ { text: this.translate.instant('Rechnungsadresse'), color: '#ffffff', fillColor: '#005e86', colSpan: 2, alignment: 'center', fontSize: 12 },
                                { text: '', color: '#ffffff', fillColor: '#005e86', colSpan: 2, alignment: 'center' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Firma'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.billing.company, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Strasse'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.billing.street, color: '#000000', fillColor: '#ffffff' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('PLZ'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.billing.zipCodePlace, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Branche'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.billing.sector, color: '#000000', fillColor: '#ffffff' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('E-Mail'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.billing.email, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Telefon'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.billing.phone, color: '#000000', fillColor: '#ffffff' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Internet'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.billing.internet, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Kundennummer'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.customerNumber, color: '#000000', fillColor: '#ffffff' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('DB-ID'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.dbId, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyInvoiceAddress.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                                { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Shipping Address */
      let bodyShippingAddress = [];
      bodyShippingAddress.push([ { text: this.translate.instant('Lieferadresse'), color: '#ffffff', fillColor: '#005e86', colSpan: 2, alignment: 'center', fontSize: 12 },
                                { text: '', color: '#ffffff', fillColor: '#005e86', colSpan: 2, alignment: 'center' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('Name'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.shipping.name, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('Strasse'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.shipping.street, color: '#000000', fillColor: '#ffffff' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('PLZ'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.shipping.zipCodePlace, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('Abteilung'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.shipping.department, color: '#000000', fillColor: '#ffffff' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('E-Mail'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.shipping.email, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('Telefon'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.shipping.phone, color: '#000000', fillColor: '#ffffff' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('Mobiltelefon'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.shipping.mobile, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyShippingAddress.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                                { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Group A */
      let bodyGroupA = [];
      bodyGroupA.push([ { text: this.translate.instant('Bestell Nr.'), color: '#000000', fillColor: '#f5f7f7' },
                        { text: this.activOrderForm.order_nr, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyGroupA.push([ { text: this.translate.instant('PVS Bestellungs Nr.'), color: '#000000', fillColor: '#ffffff' },
                        { text: this.activOrderForm.pvs_order_nr, color: '#000000', fillColor: '#ffffff' } ]);
      bodyGroupA.push([ { text: this.translate.instant('Bestelldatum'), color: '#000000', fillColor: '#f5f7f7' },
                        { text: pipe.transform(this.activOrderForm.order_date, 'dd.MM.yyyy'), color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyGroupA.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                        { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Group B */
      let bodyGroupB = [];
      bodyGroupB.push([ { text: this.translate.instant('Auftrags Nr.'), color: '#000000', fillColor: '#f5f7f7' },
                        { text: this.activOrderForm.contract_nr, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyGroupB.push([ { text: this.translate.instant('Komission'), color: '#000000', fillColor: '#ffffff' },
                        { text: this.activOrderForm.commission, color: '#000000', fillColor: '#ffffff' } ]);
      bodyGroupB.push([ { text: this.translate.instant('Liefertermin'), color: '#000000', fillColor: '#f5f7f7' },
                        { text: pipe.transform(this.activOrderForm.delivery_date, 'dd.MM.yyyy'), color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyGroupB.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                        { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Check Box 2 */
      let checkBoxBody6 = [];
      if (this.activOrderForm.sampleDeliveryCheckBox) {
        checkBoxBody6.push([ { text: this.translate.instant('Musterlieferung'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody6.push([ { text: this.translate.instant('Musterlieferung'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody6.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody7 = [];
      if (this.activOrderForm.creditCheckBox) {
        checkBoxBody7.push([ { text: this.translate.instant('Gutschrift'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody7.push([ { text: this.translate.instant('Gutschrift'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody7.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody8 = [];
      if (this.activOrderForm.confOrderCheckBox) {
        checkBoxBody8.push([ { text: this.translate.instant('Auftragsbestätigung'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody8.push([ { text: this.translate.instant('Auftragsbestätigung'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody8.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody9 = [];
      if (this.activOrderForm.afterLoadingCheckBox) {
        checkBoxBody9.push([ { text: this.translate.instant('Nach belastung'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody9.push([ { text: this.translate.instant('Nach belastung'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody9.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Check Box 3 */
      let checkBoxBody10 = [];
      if (this.activOrderForm.postCheckBox) {
        checkBoxBody10.push([ { text: this.translate.instant('Post'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody10.push([ { text: this.translate.instant('Post'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody10.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                            { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody11 = [];
      if (this.activOrderForm.expressCheckBox) {
        checkBoxBody11.push([ { text: this.translate.instant('Express'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody11.push([ { text: this.translate.instant('Express'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody11.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                            { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody12 = [];
      if (this.activOrderForm.aboutBrachtCheckBox) {
        checkBoxBody12.push([ { text: this.translate.instant('Überbracht'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody12.push([ { text: this.translate.instant('Überbracht'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody12.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                            { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody13 = [];
      if (this.activOrderForm.lkwCheckBox) {
        checkBoxBody13.push([ { text: this.translate.instant('LKW'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody13.push([ { text: this.translate.instant('BesteLKWllen'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody13.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                            { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      let checkBoxBody14 = [];
      if (this.activOrderForm.evenPickupCheckBox) {
        checkBoxBody14.push([ { text: this.translate.instant('Selbst Abholer'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody14.push([ { text: this.translate.instant('Selbst Abholer'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody14.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                            { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Retain ID Number */
      let bodyRetain = [];
      if (this.activOrderForm.keepIdNumber) {
        bodyRetain.push([ { text: this.translate.instant('ID-Nummer beibehalten'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        bodyRetain.push([ { text: this.translate.instant('ID-Nummer beibehalten'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      bodyRetain.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                        { text: '', color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Table */
      let bodyTableHeader = [];
      let bodyTableValue = [];
      let bodyTableValueTmp = [];
      let bodyTableFooter = [];
      bodyTableHeader.push( { text: this.translate.instant('Menge'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 },
                            { text: this.translate.instant('PVS ID'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 },
                            { text: this.translate.instant('Artikel-Nr.'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 },
                            { text: this.translate.instant('Bezeichnung'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 } );
      bodyTableValue.push(bodyTableHeader);
      let ind: any;
      ind = 0;
      this.activOrderForm.products.forEach(element => {
        bodyTableValueTmp = [];
        if (ind == 0) { bodyTableValueTmp.push({ text: element.quantity, color: '#000000', fillColor: '#f5f7f7', fontSize: 10 }); }
        if (ind == 1) { bodyTableValueTmp.push({ text: element.quantity, color: '#000000', fillColor: '#ffffff', fontSize: 10 }); }
        if (ind == 0) { bodyTableValueTmp.push({ text: element.pvsid, color: '#000000', fillColor: '#f5f7f7', fontSize: 10 }); }
        if (ind == 1) { bodyTableValueTmp.push({ text: element.pvsid, color: '#000000', fillColor: '#ffffff', fontSize: 10 }); }
        if (ind == 0) { bodyTableValueTmp.push({ text: element.articleno, color: '#000000', fillColor: '#f5f7f7', fontSize: 10 }); }
        if (ind == 1) { bodyTableValueTmp.push({ text: element.articleno, color: '#000000', fillColor: '#ffffff', fontSize: 10 }); }
        if (ind == 0) { bodyTableValueTmp.push({ text: element.designation, color: '#000000', fillColor: '#f5f7f7', fontSize: 10 }); }
        if (ind == 1) { bodyTableValueTmp.push({ text: element.designation, color: '#000000', fillColor: '#ffffff', fontSize: 10 }); }
        bodyTableValue.push(bodyTableValueTmp);
        ind++;
        if (ind > 1) { ind = 0; }
      });
      bodyTableFooter.push( { text: '', color: '#ffffff', fillColor: '#ffffff', fontSize: 10, border: [false, false, false, false] },
                            { text: '', color: '#ffffff', fillColor: '#ffffff', fontSize: 10, border: [false, false, false, false] },
                            { text: '', color: '#ffffff', fillColor: '#ffffff', fontSize: 10, border: [false, false, false, false] },
                            { text: '', color: '#ffffff', fillColor: '#ffffff', fontSize: 10, border: [false, false, false, false] } );
      bodyTableValue.push(bodyTableFooter);

      /* Notes */
      let bodyNotesHeader = [];
      bodyNotesHeader.push([ { text: this.translate.instant('Notizen'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 } ]);
      bodyNotesHeader.push([ { text: this.activOrderForm.note, color: '#000000', fillColor: '#ffffff', fontSize: 10 } ]);
      bodyNotesHeader.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', fontSize: 12 , border: [false, false, false, false]} ]);

      /* Image */
      let bodyImageHeader = [];
      bodyImageHeader.push([ { text: this.translate.instant('Bild'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 } ]);
      bodyImageHeader.push([ { image: this.imageDataUri, margin: 0, fit: [200, 100], alignment: 'center' } ]);
      bodyImageHeader.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', fontSize: 12 , border: [false, false, false, false]} ]);

      /* Commissioned */
      let bodyCommissionedHeader = [];
      bodyCommissionedHeader.push([ { text: this.translate.instant('Beauftragt'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 } ]);
      bodyCommissionedHeader.push([ { text: this.activOrderForm.commissioned, color: '#000000', fillColor: '#ffffff', fontSize: 10 } ]);
      bodyCommissionedHeader.push([ { text: '', color: '#ffffff', fillColor: '#ffffff', fontSize: 12, border: [false, false, false, false] } ]);

      this.pdf.toDataURL(src, resDataURL => {
        let docDefinition = {
          pageSize: 'A4',
          pageOrientation: 'portrait',
          pageMargins: [20, 140, 20, 20],
          header: {
            columns: [
              {
                'image': resDataURL, 'width': 550, 'height': 80,  margin: 20
              }
            ]
          },
          content: [
            /* Check Box 1 */
            {
              columns: [
                {
                  width: '20%',
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
                    widths: ['*', 20],
                    body: checkBoxBody1
                  }
                },
                {
                  width: '20%',
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
                    widths: ['*', 20],
                    body: checkBoxBody2
                  }
                },
                {
                  width: '20%',
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
                    widths: ['*', 20],
                    body: checkBoxBody3
                  }
                },
                {
                  width: '20%',
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
                    widths: ['*', 20],
                    body: checkBoxBody4
                  }
                },
                {
                  width: '20%',
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
                    widths: ['*', 20],
                    body: checkBoxBody5
                  }
                }
              ],
              columnGap: 10
            },
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
                    body: bodyInvoiceAddress
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
                    body: bodyShippingAddress
                  }
                }
              ],
              columnGap: 10
            },
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
                    widths: ['*', '*'],
                    body: bodyGroupA
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
                    widths: ['*', '*'],
                    body: bodyGroupB
                  }
                }
              ],
              columnGap: 10
            },
            /* Check Box 2 */
            {
              columns: [
                {
                  width: '25%',
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
                    widths: ['*', 20],
                    body: checkBoxBody6
                  }
                },
                {
                  width: '25%',
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
                    widths: ['*', 20],
                    body: checkBoxBody7
                  }
                },
                {
                  width: '25%',
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
                    widths: ['*', 20],
                    body: checkBoxBody8
                  }
                },
                {
                  width: '25%',
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
                    widths: ['*', 20],
                    body: checkBoxBody9
                  }
                }
              ],
              columnGap: 10
            },
            /* Check Box 3 */
            {
              columns: [
                {
                  width: '20%',
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
                    widths: ['*', 20],
                    body: checkBoxBody10
                  }
                },
                {
                  width: '20%',
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
                    widths: ['*', 20],
                    body: checkBoxBody11
                  }
                },
                {
                  width: '20%',
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
                    widths: ['*', 20],
                    body: checkBoxBody12
                  }
                },
                {
                  width: '20%',
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
                    widths: ['*', 20],
                    body: checkBoxBody13
                  }
                },
                {
                  width: '20%',
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
                    widths: ['*', 20],
                    body: checkBoxBody14
                  }
                }
              ],
              columnGap: 10
            },
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
                    widths: ['auto', 20],
                    body: bodyRetain
                  }
                }
              ],
              columnGap: 10
            },
            {
              columns: [
                {
                  width: '100%',
                  fontSize: 10,
                  layout: {
                    hLineWidth: function (i, node) { return 1; },
                    vLineWidth: function (i, node) { return 1; },
                    hLineColor: function (i, node) { return i == 1 ? 'black' : '#aaa'; },
                    vLineColor: function (i, node) { return '#cccccc'; },
                    paddingTop: function (i, node) { return 4; },
                    paddingBottom: function (i, node) { return 4; },
                  },
                  table: {
                    headerRows: 1,
                    widths: [50, 80, 80, '*'],
                    body: bodyTableValue
                  }
                }
              ],
              columnGap: 10
            },
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
                    widths: ['*'],
                    body: bodyNotesHeader
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
                    body: bodyImageHeader
                  },
                },
              ],
              columnGap: 10
            },
            {
              columns: [
                {
                  width: '100%',
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
                    body: bodyCommissionedHeader
                  }
                },
              ],
              columnGap: 10
            }
          ],
          footer: function (currentPage, pageCount) {
            return { text: pageDesc + ' ' + currentPage.toString() + ' / ' + pageCount, alignment: 'center' };
          }
        };

        this.pdf.createPdf(docDefinition,
                           pdfMethod,
                           this.translate.instant('Bestellformular'.replace(/\s/g, '')) + '.pdf').then((result) => {
          // console.log('pdf result :', result);
          loader.dismiss();
          res(result);
        });

      });

    });
  }

  dateiListe() {
    this.apiProvider.pvs4_get_file(0, 'product').then((result) => {
        console.log('dateiliste', result);
        this.file_link = result['file_link'];
        console.log('file link :', this.file_link);
    });
  }

  showConfirmDeletImageAlert() {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Achtung'),
      message: this.translate.instant('Das Bild wird gelöscht. Sind Sie sicher?'),
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
    this.activOrderForm.image = '';
    this.imageDataUri = '';
    this.activOrderForm.imageType = '';
    this.noteRows = 5;

    this.pdf.toDataURL('assets/imgs/product_img.jpg', data => {
      if (data) {
        this.imageDataUri = data;
      }
    });

  }

  async getImage() {
    const modal =
      await this.modalCtrl.create({
        component: DialogproduktbildmodalPage,
        cssClass: 'getimage-modal-css',
        componentProps: {
          'redDirect': 1
        }
      });

    modal.onDidDismiss().then(data => {
      if (data['data']) {
        console.log('getImage data :', data, data['data']);
        this.nocache = new Date().getTime();
        this.activOrderForm.image = data['data'];
        this.activOrderForm.imageType = 'assets';
        this.noteRows = 10;
        console.log('image ........ :', this.activOrderForm.image);
        this.pdf.toDataURL(this.activOrderForm.image, data => {
          if (data) {
            this.imageDataUri = data;
          }
        });
      }
    });
    modal.present();

    console.log('get images :', this.activOrderForm.image);
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

    let productId: any;
    let dateTime: any = new Date().toISOString();
    dateTime = dateTime.replace('-', '');
    dateTime = dateTime.replace('-', '');
    dateTime = dateTime.replace(':', '');
    dateTime = dateTime.replace(':', '');
    dateTime = dateTime.replace('.', '');

    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: 'orderformimage_' + dateTime + '.jpg',
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
        this.nocache = new Date().getTime();
        this.activOrderForm.image = this.file_link + 'mobileimages/orderformimage_' + dateTime + '.jpg';
        this.activOrderForm.imageType = 'mobileimages';
        this.noteRows = 10;

        const arrttMobileimages = [];
        arrttMobileimages.push({
          type      : 'mobileimages',
          path      : this.activOrderForm.image,
          dataURI   : '',
          fileName  : this.activOrderForm.image.substring(this.activOrderForm.image.lastIndexOf('/') + 1, this.activOrderForm.image.length)
        });
        this.loadMedia(arrttMobileimages[0].fileName, 'mobileimages').then(data => {
          this.imageDataUri = data;
        });

        this.hideLoader();
        console.log('image ........ :', this.activOrderForm.image);
      }, (err) => {
        console.log('Uploaded Error :', err);
        this.activOrderForm.image = '';
        this.activOrderForm.imageType = '';
        this.hideLoader();
      });
  }

  async hideLoader() {
    if (this.loader) {
      await this.loader.dismiss();
      this.loader = null;
    }
  }

  onFileUpload(data: { files: File }): void {
    const formData: FormData = new FormData();
    const file = data.files[0];
    this.activOrderForm.image = '';

    console.log('uploader :', formData, file);

    let dateTime: any = new Date().toISOString();
    dateTime = dateTime.replace('-', '');
    dateTime = dateTime.replace('-', '');
    dateTime = dateTime.replace(':', '');
    dateTime = dateTime.replace(':', '');
    dateTime = dateTime.replace('.', '');

    formData.append('token', window.localStorage['access_token']);
    formData.append('dir', 'mobileimages');
    formData.append('file', file, 'orderformimage_' + dateTime + '.jpg');
    console.log('onBeforeUpload event :', formData, file.name);

    this.apiProvider.pvs4_uploadphp(formData).then((result: any) => {
        console.log('result: ', result);
        this.nocache = new Date().getTime();
        this.activOrderForm.image = this.file_link + 'mobileimages/orderformimage_' + dateTime + '.jpg';
        this.activOrderForm.imageType = 'mobileimages';
        console.log('upload images :', this.file_link, this.activOrderForm.image);
        this.noteRows = 10;

        const arrttMobileimages = [];
        arrttMobileimages.push({
          type      : 'mobileimages',
          path      : this.activOrderForm.image,
          dataURI   : '',
          fileName  : this.activOrderForm.image.substring(this.activOrderForm.image.lastIndexOf('/') + 1, this.activOrderForm.image.length)
        });
        this.loadMedia(arrttMobileimages[0].fileName, 'mobileimages').then(data => {
          this.imageDataUri = data;
        });

        console.log('image ........ :', this.activOrderForm.image);
    });

  }

  validateFileSize(event: any, maxFileSize: number) {
    if (event.files[0].size > maxFileSize) {
      const toast = this.toastCtrl.create({
        message: this.translate.instant('Die Dateigröße die Sie hochladen sollte höchstens 5 MB betragen'),
        cssClass: 'toast-warning',
        duration: 3500
      }).then(x => x.present());
    }
  }

  loadMedia(fileName: string, subDir: string) {
    return new Promise((resolve) => {
      this.apiProvider.pvs4_getMedia(fileName, subDir).then( (data: any) => {
        console.log('getMedia() data: ', data);
        resolve(data.fileDataUri);

      }).catch(err => {
        // show the error message
        console.log('getMedia Error: ', err);
        resolve('LoadError');
      });
    });
  }

}
