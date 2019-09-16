import { Component } from '@angular/core';
import { NavController, ModalController, Events, Platform, LoadingController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { DatePipe } from '@angular/common';
import { PdfExportService } from '../services/pdf-export';
import { OrderSendPage } from './order-send/order-send.page';
import { ActivatedRoute } from '@angular/router';

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
  public company: string;
  public maxDate: string;
  public deliveryDate: any;
  public mouseoverButton1: boolean;
  public mouseoverButton2: boolean;
  public mobilePlatform: boolean;
  public activCustomer: any = [];
  public contactPersonList: any = [];
  public listProduct: any[] = [];
  public lang: string = localStorage.getItem('lang');
  public products: any = [{
    quantity: '',
    pvsid: '',
    articleno: '',
    designation: ''
  }];
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
    pvs_order_nr: '',
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
    commissioned: '',
    customerNumber: '',
    dbId: ''
  };

  constructor(public navCtrl: NavController,
              public apiProvider: ApiService,
              public userdata: UserdataService,
              public translate: TranslateService,
              public modalCtrl: ModalController,
              public events: Events,
              public platform: Platform,
              public pdf: PdfExportService,
              public datePipe: DatePipe,
              public loadingCtrl: LoadingController,
              private route: ActivatedRoute) {

                this.idCustomer = 0;
                this.company = '';
                this.mobilePlatform = false;

                platform.ready().then(() => {
                  if ( this.platform.is('ios') ||
                    this.platform.is('android') ) {
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

                this.idCustomer = parseInt(this.route.snapshot.paramMap.get('id'));
                this.getContactList();
                this.loadCustomer(this.idCustomer);

                this.maxDate = this.apiProvider.maxDate;
                this.activOrderForm.commissioned = this.userdata.first_name + ' ' +
                                                   this.userdata.last_name + ' (' +
                                                   this.userdata.email + ')';
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

  addProduct() {
    this.products.push({
      quantity: '',
      pvsid: '',
      articleno: '',
      designation: ''
    });
    console.log('addProduct :', this.products);
  }

  remProduct(index) {
    this.products.splice(index, 1);
    if (this.products.length == 0) {
      this.products.push({
        quantity: '',
        pvsid: '',
        articleno: '',
        designation: ''
      });
    }
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
                    widths: ['*', '*'],
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
                    widths: ['*', '*'],
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
                    body: bodyNotesHeader
                  }
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

}
