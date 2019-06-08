import { Component } from '@angular/core';
import { NavController, ModalController, Events, Platform,LoadingController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { DatePipe } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PdfExportService } from '../services/pdf-export';
import { OrderSendNewPage } from './order-send-new/order-send-new.page';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { NavigationExtras, ActivatedRoute } from '@angular/router';
/**
 * Generated class for the OrderFormNewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 */

@Component({
  selector: 'app-order-form-new',
  templateUrl: 'order-form-new.page.html',
  styleUrls: ['./order-form-new.page.scss'],
})

export class OrderFormNewPage {
  public idCustomer: number = 0;
  public company: string = "";
  public maxDate: string;
  public deliveryDate: any;
  public mouseoverButton1: boolean;
  public mouseoverButton2: boolean;
  public mobilePlatform: boolean = false;
  public activCustomer: any = [];
  public contactPersonList: any = [];
  public listProduct: any[] = [];
  public lang: string = localStorage.getItem('lang');
  public products: any = [{
    quantity: "",
    pvsid: "",
    articleno: "",
    designation: ""
  }];
  public activOrderForm: any = {
    orderCheckBox: false,
    offerCheckBox: false,
    repairCheckBox: false,
    inspectionCheckBox: false,
    rentCheckBox: false,
    billing: {
      company: "",
      street: "",
      zip_code: "",
      sector: "",
      email: "",
      phone: "",
      internet: ""
    },
    shipping: {
      name: "",
      street: "",
      zip_code: "",
      department: "",
      email: "",
      phone: "",
      mobile: ""
    },
    order_nr: "",
    contract_nr: "",
    pvs_order_nr: "",
    commission: "",
    order_date: "",
    delivery_date: "",
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
      quantity: "",
      pvsid: "",
      articleno: "",
      designation: ""},
    note: "",
    commissioned: ""
  };

  constructor(public navCtrl: NavController, 
              public apiProvider : ApiService,
              public userdata: UserdataService,
              public translate : TranslateService,
              public modalCtrl : ModalController,
              public events:Events,
              public platform: Platform,
              public pdf: PdfExportService,
              public datePipe: DatePipe,
              public loadingCtrl: LoadingController,
              private route: ActivatedRoute) {

                platform.ready().then(() => {
                  if ( this.platform.is('ios') ||
                    this.platform.is('android') ) {
                    this.mobilePlatform = true;
                    this.mouseoverButton1 = true;
                    this.mouseoverButton2 = true;
                    console.log("platform mobile:", this.platform.platforms());
                  }
                  else {
                    console.log("platform not mobile:", this.platform.platforms());
                    this.mobilePlatform = false;
                    this.mouseoverButton1 = false;
                    this.mouseoverButton2 = false;
                  }
                });

                this.route.queryParams.subscribe(params => {
                  this.idCustomer = params["idCustomer"];
                 // this.company = params["company"];
              });
                this.maxDate = this.apiProvider.maxDate; 
                this.getContactList(); 
                this.loadCustomer(this.idCustomer);
                this.activOrderForm.commissioned = this.userdata.first_name+' '+this.userdata.last_name+' ('+this.userdata.email+')';                
  }

  mouseover(buttonNumber) {
    if (buttonNumber == 1)
      this.mouseoverButton1 = true;
    else if (buttonNumber == 2)
      this.mouseoverButton2 = true;
  }

  mouseout(buttonNumber) {
    if (this.mobilePlatform == false) {
      if (buttonNumber == 1)
        this.mouseoverButton1 = false;
      else if (buttonNumber == 2)
        this.mouseoverButton2 = false;
    }
  }

  loadCustomer(id: number) {
    this.apiProvider.pvs4_get_customer(id).then((result: any) => {
      console.log("loadCustomer :", result.obj);
      this.activCustomer = result.obj;   
      this.loadOrderForm(this.activCustomer);
    });    
  }

  loadOrderForm(activCustomer) {
    console.log("activCustomer :", activCustomer);
    this.activOrderForm.billing.company = activCustomer.company;  
    this.activOrderForm.billing.street = activCustomer.street;
    this.activOrderForm.billing.zip_code = activCustomer.zip_code;
    this.activOrderForm.billing.sector = activCustomer.sector;
    this.activOrderForm.billing.email = activCustomer.email;
    this.activOrderForm.billing.phone = activCustomer.phone;
    this.activOrderForm.billing.internet = activCustomer.website;
    
    this.activOrderForm.shipping.street = activCustomer.street;
    this.activOrderForm.shipping.zip_code = activCustomer.zip_code;
    this.activOrderForm.shipping.email = activCustomer.email;
    this.activOrderForm.shipping.phone = activCustomer.phone;

    this.activOrderForm.order_date = new Date().toISOString();
    this.deliveryDate = new Date();
    this.deliveryDate.setDate(this.deliveryDate.getDate() + 7);
    this.activOrderForm.delivery_date = this.deliveryDate.toISOString();
  }

  getContactList() {
    console.log("getContactList :", this.idCustomer);
    this.apiProvider.pvs4_get_contact_person(this.idCustomer).then((result: any) => {  
      console.log('getPointContact result', result.list);
      for (var i = 0, len = result.list.length; i < len; i++) {
        var item = result.list[i].data;
        item.addresses = JSON.parse(item.addresses);
        this.contactPersonList.push(item);        
      }
    });
  }

  changeContactPerson(contactPerson) {
    console.log("contactPerson :", contactPerson, contactPerson.addresses);
    this.activOrderForm.shipping.name = contactPerson.first_name + ' ' + contactPerson.last_name;
    this.activOrderForm.shipping.street = '';
    this.activOrderForm.shipping.zip_code = '';
    this.activOrderForm.shipping.department = '';
    this.activOrderForm.shipping.email = '';
    this.activOrderForm.shipping.phone = '';
    this.activOrderForm.shipping.mobile = ''; 
    for (var i = 0, len = contactPerson.addresses.length; i < len; i++) {
      if(contactPerson.addresses[i].address_type == 'Lieferadresse') {
        this.activOrderForm.shipping.street = contactPerson.addresses[i].street;
        this.activOrderForm.shipping.zip_code = contactPerson.addresses[i].zip_code;
        this.activOrderForm.shipping.department = contactPerson.addresses[i].department;
        this.activOrderForm.shipping.email = contactPerson.addresses[i].email;
        this.activOrderForm.shipping.phone = contactPerson.addresses[i].phone;
        this.activOrderForm.shipping.mobile = contactPerson.addresses[i].mobile;
        return;    
      }
    }
  }

  addProduct() {
    this.products.push({
      quantity: "",
      pvsid: "",
      articleno: "",
      designation: ""
    });
    console.log("addProduct :", this.products);
  }

  remProduct(index) {
    this.products.splice(index, 1); 
    if(this.products.length==0) {
      this.products.push({
        quantity: "",
        pvsid: "",
        articleno: "",
        designation: ""
      });
    }          
  }

   ordersSend() {
    this.activOrderForm.products = {quantity: "",
                                    pvsid: "",
                                    articleno: "",
                                    designation: ""
                                   };
    let tmpProducts: any = [];
    for (var i = 0, len = this.products.length; i < len; i++) {
      tmpProducts.push(this.products[i]);
    }
    this.activOrderForm.products = tmpProducts;
    
    this.printPdf('base64').then(async (result:string) => {
      console.log("pdf result :", result);
      let modalPage = await this.modalCtrl.create({
        component: OrderSendNewPage,
        componentProps: {
          "idCustomer": this.idCustomer, 
          "company": this.company,
          "activOrderForm": this.activOrderForm,
          "pdfRetVal": result
        }
      });    
      modalPage.onDidDismiss().then(ret => {      
        if (ret) {
          console.log('OrderSendNewPage ret', ret);
        }
      });
      modalPage.present(); 
    });     
  }

  async printPdf(pdfMethod: any) {  
    let loader = await this.loadingCtrl.create({
      message: this.translate.instant("Bitte warten")
    });
    loader.present();
    return new Promise((res) => {  
      this.activOrderForm.products = {quantity: "",
                                      pvsid: "",
                                      articleno: "",
                                      designation: ""
                                    };
      let tmpProducts: any = [];
      for (var i = 0, len = this.products.length; i < len; i++) {
        tmpProducts.push(this.products[i]);
      }
      this.activOrderForm.products = tmpProducts;

      var src = 'assets/imgs/banner_'+this.userdata.licensee+'.jpg';
      let pipe = new DatePipe('en-US');

      /* Check Box 1 */                
      var checkBoxBody1 = [];
      if(this.activOrderForm.orderCheckBox) {
        checkBoxBody1.push([ { text: this.translate.instant('Bestellen'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody1.push([ { text: this.translate.instant('Bestellen'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody1.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      var checkBoxBody2 = [];
      if(this.activOrderForm.offerCheckBox) {
        checkBoxBody2.push([ { text: this.translate.instant('Offerte'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody2.push([ { text: this.translate.instant('Offerte'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody2.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      var checkBoxBody3 = [];
      if(this.activOrderForm.repairCheckBox) {
        checkBoxBody3.push([ { text: this.translate.instant('Reparatur'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody3.push([ { text: this.translate.instant('Reparatur'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody3.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);                  
      var checkBoxBody4 = [];
      if(this.activOrderForm.inspectionCheckBox) {
        checkBoxBody4.push([ { text: this.translate.instant('Prüfung'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody4.push([ { text: this.translate.instant('Prüfung'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody4.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      var checkBoxBody5 = [];
      if(this.activOrderForm.rentCheckBox) {
        checkBoxBody5.push([ { text: this.translate.instant('Miete'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody5.push([ { text: this.translate.instant('Miete'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody5.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Invoice Address */
      var bodyInvoiceAddress = [];
      bodyInvoiceAddress.push([ { text: this.translate.instant('Rechnungsadresse'), color: '#ffffff', fillColor: '#005e86', colSpan: 2, alignment: 'center', fontSize: 12 },
                                { text: "", color: '#ffffff', fillColor: '#005e86', colSpan: 2, alignment: 'center' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Firma'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.billing.company, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Strasse'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.billing.street, color: '#000000', fillColor: '#ffffff' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('PLZ'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.billing.zip_code, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Branche'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.billing.sector, color: '#000000', fillColor: '#ffffff' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('E-Mail'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.billing.email, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Telefon'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.billing.phone, color: '#000000', fillColor: '#ffffff' } ]);
      bodyInvoiceAddress.push([ { text: this.translate.instant('Internet'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.billing.internet, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyInvoiceAddress.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                                { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Shipping Address */
      var bodyShippingAddress = [];
      bodyShippingAddress.push([ { text: this.translate.instant('Lieferadresse'), color: '#ffffff', fillColor: '#005e86', colSpan: 2, alignment: 'center', fontSize: 12 },
                                { text: "", color: '#ffffff', fillColor: '#005e86', colSpan: 2, alignment: 'center' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('Name'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.shipping.name, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('Strasse'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.shipping.street, color: '#000000', fillColor: '#ffffff' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('PLZ'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.shipping.zip_code, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('Abteilung'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.shipping.department, color: '#000000', fillColor: '#ffffff' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('E-Mail'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.shipping.email, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('Telefon'), color: '#000000', fillColor: '#ffffff' },
                                { text: this.activOrderForm.shipping.phone, color: '#000000', fillColor: '#ffffff' } ]);
      bodyShippingAddress.push([ { text: this.translate.instant('Mobiltelefon'), color: '#000000', fillColor: '#f5f7f7' },
                                { text: this.activOrderForm.shipping.mobile, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyShippingAddress.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                                { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
  
      /* Group A */
      var bodyGroupA = [];
      bodyGroupA.push([ { text: this.translate.instant('Bestell Nr.'), color: '#000000', fillColor: '#f5f7f7' },
                        { text: this.activOrderForm.order_nr, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyGroupA.push([ { text: this.translate.instant('PVS Bestellungs Nr.'), color: '#000000', fillColor: '#ffffff' },
                        { text: this.activOrderForm.pvs_order_nr, color: '#000000', fillColor: '#ffffff' } ]);
      bodyGroupA.push([ { text: this.translate.instant('Bestelldatum'), color: '#000000', fillColor: '#f5f7f7' },
                        { text: pipe.transform(this.activOrderForm.order_date, 'dd.MM.yyyy'), color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyGroupA.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                        { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Group B */
      var bodyGroupB = [];
      bodyGroupB.push([ { text: this.translate.instant('Auftrags Nr.'), color: '#000000', fillColor: '#f5f7f7' },
                        { text: this.activOrderForm.contract_nr, color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyGroupB.push([ { text: this.translate.instant('Komission'), color: '#000000', fillColor: '#ffffff' },
                        { text: this.activOrderForm.commission, color: '#000000', fillColor: '#ffffff' } ]);
      bodyGroupB.push([ { text: this.translate.instant('Liefertermin'), color: '#000000', fillColor: '#f5f7f7' },
                        { text: pipe.transform(this.activOrderForm.delivery_date, 'dd.MM.yyyy'), color: '#000000', fillColor: '#f5f7f7' } ]);
      bodyGroupB.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                        { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Check Box 2 */                
      var checkBoxBody6 = [];
      if(this.activOrderForm.sampleDeliveryCheckBox) {
        checkBoxBody6.push([ { text: this.translate.instant('Musterlieferung'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody6.push([ { text: this.translate.instant('Musterlieferung'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody6.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      var checkBoxBody7 = [];
      if(this.activOrderForm.creditCheckBox) {
        checkBoxBody7.push([ { text: this.translate.instant('Gutschrift'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody7.push([ { text: this.translate.instant('Gutschrift'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody7.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);
      var checkBoxBody8 = [];
      if(this.activOrderForm.confOrderCheckBox) {
        checkBoxBody8.push([ { text: this.translate.instant('Auftragsbestätigung'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody8.push([ { text: this.translate.instant('Auftragsbestätigung'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody8.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);                     
      var checkBoxBody9 = [];
      if(this.activOrderForm.afterLoadingCheckBox) {
        checkBoxBody9.push([ { text: this.translate.instant('Nach belastung'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody9.push([ { text: this.translate.instant('Nach belastung'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody9.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                          { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);

      /* Check Box 3 */                
      var checkBoxBody10 = [];
      if(this.activOrderForm.postCheckBox) {
        checkBoxBody10.push([ { text: this.translate.instant('Post'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody10.push([ { text: this.translate.instant('Post'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody10.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                            { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);  
      var checkBoxBody11 = [];
      if(this.activOrderForm.expressCheckBox) {
        checkBoxBody11.push([ { text: this.translate.instant('Express'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody11.push([ { text: this.translate.instant('Express'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody11.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                            { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);  
      var checkBoxBody12 = [];
      if(this.activOrderForm.aboutBrachtCheckBox) {
        checkBoxBody12.push([ { text: this.translate.instant('Überbracht'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody12.push([ { text: this.translate.instant('Überbracht'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      } 
      checkBoxBody12.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                            { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);                     
      var checkBoxBody13 = [];
      if(this.activOrderForm.lkwCheckBox) {
        checkBoxBody13.push([ { text: this.translate.instant('LKW'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody13.push([ { text: this.translate.instant('BesteLKWllen'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody13.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                            { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);  
      var checkBoxBody14 = [];
      if(this.activOrderForm.evenPickupCheckBox) {
        checkBoxBody14.push([ { text: this.translate.instant('Selbst Abholer'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        checkBoxBody14.push([ { text: this.translate.instant('Selbst Abholer'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      checkBoxBody14.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                            { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);  

      /* Retain ID Number */
      var bodyRetain = [];
      if(this.activOrderForm.keepIdNumber) {
        bodyRetain.push([ { text: this.translate.instant('ID-Nummer beibehalten'), color: '#000000', fillColor: '#ffffff' },
                            { text: '√', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true} ]);
      } else {
        bodyRetain.push([ { text: this.translate.instant('ID-Nummer beibehalten'), color: '#000000', fillColor: '#ffffff' },
                            { text: ' ', color: '#000000', fillColor: '#ffffff', alignment: 'center', fontSize: 14, bold: true } ]);
      }
      bodyRetain.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center', fontSize: 12, border: [false, false, false, false] },
                        { text: "", color: '#ffffff', fillColor: '#ffffff', colSpan: 2, alignment: 'center' } ]);  

      /* Table */                
      var bodyTableHeader = []; 
      var bodyTableValue = [];
      var bodyTableValueTmp = [];
      var bodyTableFooter = [];   
      bodyTableHeader.push( { text: this.translate.instant('Menge'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 },
                            { text: this.translate.instant('PVS ID'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 },
                            { text: this.translate.instant('Artikel-Nr.'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 },
                            { text: this.translate.instant('Bezeichnung'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 } );
      bodyTableValue.push(bodyTableHeader);   
      let ind: any;
      ind = 0;
      this.activOrderForm.products.forEach(element => {
        bodyTableValueTmp = [];
        if(ind == 0) bodyTableValueTmp.push({ text: element.quantity, color: '#000000', fillColor: '#f5f7f7', fontSize: 10 });
        if(ind == 1) bodyTableValueTmp.push({ text: element.quantity, color: '#000000', fillColor: '#ffffff', fontSize: 10 });
        if(ind == 0) bodyTableValueTmp.push({ text: element.pvsid, color: '#000000', fillColor: '#f5f7f7', fontSize: 10 });
        if(ind == 1) bodyTableValueTmp.push({ text: element.pvsid, color: '#000000', fillColor: '#ffffff', fontSize: 10 });
        if(ind == 0) bodyTableValueTmp.push({ text: element.articleno, color: '#000000', fillColor: '#f5f7f7', fontSize: 10 });
        if(ind == 1) bodyTableValueTmp.push({ text: element.articleno, color: '#000000', fillColor: '#ffffff', fontSize: 10 });
        if(ind == 0) bodyTableValueTmp.push({ text: element.designation, color: '#000000', fillColor: '#f5f7f7', fontSize: 10 });
        if(ind == 1) bodyTableValueTmp.push({ text: element.designation, color: '#000000', fillColor: '#ffffff', fontSize: 10 });
        bodyTableValue.push(bodyTableValueTmp);
        ind++;
        if(ind > 1) ind = 0; 
      });          
      bodyTableFooter.push( { text: "", color: '#ffffff', fillColor: '#ffffff', fontSize: 10, border: [false, false, false, false] },
                            { text: "", color: '#ffffff', fillColor: '#ffffff', fontSize: 10, border: [false, false, false, false] },
                            { text: "", color: '#ffffff', fillColor: '#ffffff', fontSize: 10, border: [false, false, false, false] },
                            { text: "", color: '#ffffff', fillColor: '#ffffff', fontSize: 10, border: [false, false, false, false] } );
      bodyTableValue.push(bodyTableFooter);
  
      /* Notes */
      var bodyNotesHeader = [];
      bodyNotesHeader.push([ { text: this.translate.instant('Notizen'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 } ]);
      bodyNotesHeader.push([ { text: this.activOrderForm.note, color: '#000000', fillColor: '#ffffff', fontSize: 10 } ]);
      bodyNotesHeader.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', fontSize: 12 , border: [false, false, false, false]} ]);

      /* Commissioned */
      var bodyCommissionedHeader = [];
      bodyCommissionedHeader.push([ { text: this.translate.instant('Beauftragt'), color: '#ffffff', fillColor: '#005e86', fontSize: 12 } ]);
      bodyCommissionedHeader.push([ { text: this.activOrderForm.commissioned, color: '#000000', fillColor: '#ffffff', fontSize: 10 } ]);
      bodyCommissionedHeader.push([ { text: "", color: '#ffffff', fillColor: '#ffffff', fontSize: 12, border: [false, false, false, false] } ]);

      this.pdf.toDataURL(src,resDataURL => {
        var docDefinition = {
          pageSize: 'A4',
          pageOrientation: 'portrait',
          pageMargins: [20, 140, 20, 20],
          header: {
            columns: [
              {
                "image": resDataURL, "width": 550, "height": 80,  margin: 20
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
                    hLineColor: function (i, node) { return i === 1 ? 'black' : '#aaa'; },
                    vLineColor: function (i, node) { return '#cccccc'; },
                    paddingTop: function (i, node) { return 4; },
                    paddingBottom: function (i, node) { return 4; },
                  },
                  table: {
                    headerRows: 1,
                    widths: ['*','*','*','*'],
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
          ]
        };
        
        this.pdf.createPdf(docDefinition, pdfMethod, this.translate.instant("Bestellformular".replace(/\s/g, "")) + ".pdf").then((result) => {
          console.log("pdf result :", result);
          loader.dismiss();
          res(result);
        });
        
      });  
      
    });
  }

}
