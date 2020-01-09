import { Component, NgZone, OnInit } from '@angular/core';
import { NavParams, Platform, ModalController, AlertController, NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api';
import { DataService } from '../../services/data.service';
import * as moment from 'moment';
import { SystemService } from '../../services/system';

/**
 * Generated class for the NfcScanComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */

@Component({
  selector: 'app-nfc-scan',
  templateUrl: './nfc-scan.component.html',
  styleUrls: ['./nfc-scan.component.scss']
})

export class NfcScanComponent implements OnInit {
  subscription: Subscription = new Subscription;
  ndeflistener: any;
  timeout: any;
  activProduct: any;
  public pid: number;
  public procedure: number;
  public readonly: boolean;
  public scanList: any = [];
  public isWritable: boolean;
  public autoMode: boolean = false;  
  public listView = false;
  public tagId = '';
  public cols: any[];
  public result = '';
  public lang: string = localStorage.getItem('lang');
  public company = '';

  constructor(
    public translate: TranslateService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private viewCtrl: ModalController,
    private dataService: DataService,
    public nfc: NFC,
    public zone: NgZone,
    public ndef: Ndef,
    public platform: Platform,
    private navParams: NavParams,
    private apiService: ApiService,
    private navCtrl: NavController,
    public systemService: SystemService) {

  }

  ngOnInit() {
    this.readonly = this.navParams.get('readOnly');
    this.pid = this.navParams.get('pid');
    this.cols = [
      { field: 'id_number', header: 'ID', width: '60px' },
      { field: 'title', header: this.translate.instant('Produkt') },
      { field: 'next_protocol', header: this.translate.instant('nächste Prüfung') },
      { field: 'details', header: this.translate.instant('Produktdetails') }
    ];
    this.procedure = 0;
    this.isWritable = true;
    if (this.platform.is('android')) {
      this.autoMode = true;
      this.readNFC();
    }
  }

  readNFC() {
    this.procedure = 0;
    this.isWritable = true;
    this.platform.ready().then(() => {
      if (this.platform.is('ios')) {
        this.nfc.enabled().then((flag) => {
          this.subscribeNfc_ios();
        }).catch(this.onFailure);
      } 
      if (this.platform.is('android')) {
          this.nfc.enabled().then((flag) => {
            this.subscribeNfc_android();
        }).catch(this.onFailure);
      }       
      console.log('platform :', this.platform.platforms());
    });
  }

  subscribeNfc_ios() {
    console.log('subscribeNfc_ios()');
    this.subscription.unsubscribe();
    this.nfc.beginSession().subscribe(res => {
      this.ndeflistener = this.nfc.addNdefListener();
      this.subscription = this.ndeflistener.subscribe(
        (data: Event) => this.nfcReadNdef_ios(data),
        (err: any) => console.log(err)
      );
    }, err => {
      console.log(err);
    });
  }

  subscribeNfc_android() {
    console.log('subscribeNfc_android()');
    this.subscription.unsubscribe();
    this.ndeflistener = this.nfc.addNdefListener();
    this.subscription = this.ndeflistener.subscribe(
      (data: Event) => this.nfcReadNdef_android(data),
      (err: any) => console.log(err)
    );
  }

  nfcReadNdef_ios(event: any) {
    console.log('nfcReadNdef()', JSON.stringify(event));
    console.log('received ndef message. the tag contains: ', JSON.stringify(event.tag));
    console.log('received ndef message. the ndefMessage contains: ', JSON.stringify(event.tag.ndefMessage));
    console.log('received ndef message. the id contains: ', JSON.stringify(event.tag.ndefMessage[0].id), this.ndef.encodeMessage(event));
    console.log('received ndef message. payload 1: ', this.ndef.textHelper.decodePayload(event.tag.ndefMessage[0].payload));
    console.log('received ndef message. payload 2: ', this.ndef.textHelper.decodePayload(event.tag.ndefMessage[1].payload));
    console.log('isTrusted: ', JSON.stringify(event.isTrusted));
    // console.log('tagID :', this.nfc.bytesToHexString(event.tag.id));
    if (event) {
      this.isWritable = false;
      this.tagId = '';
      if (this.readonly) {
        this.read_nfc_data_ios(event);
      } else {
        this.procedure = 1;
      }
    }
  }

  read_nfc_data_ios(nfcEvent: any) {
    console.log('read_nfc_data()', nfcEvent);
    if (!nfcEvent.tag.ndefMessage) {
      const toast = this.toastCtrl.create({
        message: this.translate.instant('Produkt unbekannt'),
        cssClass: 'toast-warning',
        duration: 3000
      }).then(x => x.present());
      return;
    }
    let art = this.nfc.bytesToString(nfcEvent.tag.ndefMessage[0].type);
    console.log('NFC art:', art);
    if (art == 'T') {
      let text = this.ndef.textHelper.decodePayload(nfcEvent.tag.ndefMessage[0].payload);
      console.log('NFC text', text);
      let res = text.split(':');
      if (res.length >= 3) {
        if (res[0] == 'BruggPVS') {
          if (res[1] == 'ProductID') {
            const pid = parseInt(res[2]);
            console.log('NFC pid', pid);
            if (pid > 0) {
              this.apiService.pvs4_get_product(pid).then((result: any) => {
                console.log('nfc result', result);
                if (result.amount == 0) {
                  const toast = this.toastCtrl.create({
                    message: this.translate.instant('Produkt unbekannt'),
                    cssClass: 'toast-warning',
                    duration: 3000
                  }).then(x => x.present());
                  return;
                }
                if (!this.listView) {
                  // result.obj.title = JSON.parse(result.obj.title);
                  this.viewCtrl.dismiss();
                  this.systemService.customerId = result.obj.customer;
                  const data = {
                    id: result.obj.id,
                    idCustomer: result.obj.customer,
                    parent: result.obj.parent
                  };
                  this.dataService.setData(data);
                  this.navCtrl.navigateForward(['/product-details'] );
                } else {
                  let rein = true;
                  for (let i = 0; i < this.scanList.length; i++) {
                    if (this.scanList[i].id == result.obj.id) { rein = false; }
                  }
                  for (let i = 0; i < this.scanList.length; i++) {
                    this.scanList[i].idCustomer = parseInt(this.scanList[i].idCustomer);
                    result.obj.customer = parseInt(result.obj.customer);
                    if (this.scanList[i].idCustomer != result.obj.customer) {
                      rein = false;
                      const toast = this.toastCtrl.create({
                        message: this.translate.instant('Produkt einem anderem Kunden zugeteilt'),
                        cssClass: 'toast-warning',
                        duration: 3000
                      }).then(x => x.present());
                      return;
                    }
                  }
                  if (rein) {
                    this.apiService.pvs4_get_customer(result.obj.customer).then((customer: any) => {
                      try {
                        result.obj.title = JSON.parse(result.obj.title);
                        result.obj.title = result.obj.title[this.lang];
                      } catch {
                         console.error('JSON.parse err title', result.obj.title) ;
                      }
                      let pr = result.obj.last_protocol;
                      if (pr &&  pr.length > 0) {
                              try {
                                  pr = JSON.parse(pr);
                                  result.obj.next_protocol_color = 'rgb(74, 83, 86)';
                                  if (pr.protocol_date_next) {
                                      result.obj.next_protocol = this.apiService.mysqlDate2view(pr.protocol_date_next);
                                      let x = moment(pr.protocol_date_next, 'YYYY-M-D');
                                      let y = moment();
                                      let diffDays = x.diff(y, 'days');
                                      if (diffDays < 90) { result.obj.next_protocol_color = '#f1c40f'; }
                                      if (diffDays < 30) { result.obj.next_protocol_color = '#e74c3c'; }
                                      // console.log('x :', pr.protocol_date_next ,  diffDays);
                                  }
                                  if (pr.result) {
                                      if (pr.result == 1) {
                                          result.obj.next_protocol = this.translate.instant('reparieren');
                                          result.obj.next_protocol_color = '#f1c40f';
                                      }
                                      if (pr.result == 3) {
                                          result.obj.next_protocol = this.translate.instant('unauffindbar');
                                          result.obj.next_protocol_color = '#e74c3c';
                                      }
                                      if ((pr.result == 2) || (pr.result == 4)) {
                                          result.obj.next_protocol = this.translate.instant('ausmustern');
                                          result.obj.next_protocol_color = '#C558D3';
                                      }
                                  }
                              } catch (e) {
                                  console.error('JSON.parse(pr) err :', e);
                                  console.log('pr :', pr);
                              }
                      }

                      let details = '';
                      try {
                        const items = JSON.parse(result.obj.items);

                        console.log('items:', result.obj.items );
                        for (let i = 0; i < items.length; i++) {
                          if (items[i].type != 2 ) { continue; }
                          if (items[i].value.trim() == '' ) { continue; }
                          if (details != '') {
                            details += ', ';
                          }
                          details += items[i].title[this.lang] + ':' + items[i].value.trim();
                          if (details.length > 63) {
                            details = details.substring(0, 60) + '...';
                            break;
                          }
                        }
                      } catch {
                         console.error('JSON.parse err items', result.obj.items) ;
                      }

                      this.company = customer.obj.company;

                      const new_obj = {
                        id: result.obj.id,
                        id_number: result.obj.id_number,
                        title: result.obj.title,
                        company: customer.obj.company,
                        idCustomer: customer.obj.id,
                        details: details,
                        next_protocol: result.obj.next_protocol,
                        next_protocol_color: result.obj.next_protocol_color
                      };
                      this.zone.run(() => {
                        this.scanList.push(new_obj);
                        console.log('scanList:', this.scanList);
                      });

                    }).catch(this.onFailure);
                  }
                }
              }).catch(this.onFailure);
            }
          }
        }
      }
    }
  }

  nfcReadNdef_android(event: any) {
    console.log('nfcReadNdef()', event);
    if (event && event.tag && event.tag.id) {
      this.tagId = this.nfc.bytesToHexString(event.tag.id);
      this.isWritable = event.tag.isWritable;
      console.log(typeof (this.tagId) + ' tagId: ', this.tagId);
      console.log('isWritable: ', this.isWritable);
      console.log('only read: ', this.readonly);
      if (this.readonly) {
        this.read_nfc_data_andorid(event);
      } else {
        this.procedure = 1;
        this.nfc_write();
      }
    }
  }

  read_nfc_data_andorid(nfcEvent: any) {
    console.log('read_nfc_data()', nfcEvent);
    if (!nfcEvent.tag.ndefMessage) {
      const toast = this.toastCtrl.create({
        message: this.translate.instant('Produkt unbekannt'),
        cssClass: 'toast-warning',
        duration: 3000
      }).then(x => x.present());
      return;
    }
    let art = this.nfc.bytesToString(nfcEvent.tag.ndefMessage[0].type);
    console.log('NFC art:', art);
    if (art == 'T') {
      let text = this.ndef.textHelper.decodePayload(nfcEvent.tag.ndefMessage[0].payload);
      console.log('NFC text', text);
      let res = text.split(':');
      if (res.length >= 3) {
        if (res[0] == 'BruggPVS') {
          if (res[1] == 'ProductID') {
            const pid = parseInt(res[2]);
            console.log('NFC pid', pid);
            if (pid > 0) {
              this.apiService.pvs4_get_nfc_product(this.tagId).then((result: any) => {
                console.log('nfc result', result);
                if (result.amount == 0) {
                  const toast = this.toastCtrl.create({
                    message: this.translate.instant('Produkt unbekannt'),
                    cssClass: 'toast-warning',
                    duration: 3000
                  }).then(x => x.present());
                  return;
                }
                if (!this.listView) {
                  // result.obj.title = JSON.parse(result.obj.title);
                  this.viewCtrl.dismiss();
                  this.systemService.customerId = result.obj.customer;
                  const data = {
                    id: result.obj.id,
                    idCustomer: result.obj.customer,
                    parent: result.obj.parent
                  };
                  this.dataService.setData(data);
                  this.navCtrl.navigateForward(['/product-details'] );
                } else {
                  let rein = true;
                  for (let i = 0; i < this.scanList.length; i++) {
                    if (this.scanList[i].id == result.obj.id) { rein = false; }
                  }
                  for (let i = 0; i < this.scanList.length; i++) {
                    this.scanList[i].idCustomer = parseInt(this.scanList[i].idCustomer);
                    result.obj.customer = parseInt(result.obj.customer);
                    if (this.scanList[i].idCustomer != result.obj.customer) {
                      rein = false;
                      const toast = this.toastCtrl.create({
                        message: this.translate.instant('Produkt einem anderem Kunden zugeteilt'),
                        cssClass: 'toast-warning',
                        duration: 3000
                      }).then(x => x.present());
                      return;
                    }
                  }
                  if (rein) {
                    this.apiService.pvs4_get_customer(result.obj.customer).then((customer: any) => {
                      try {
                        result.obj.title = JSON.parse(result.obj.title);
                        result.obj.title = result.obj.title[this.lang];
                      } catch {
                         console.error('JSON.parse err title', result.obj.title) ;
                      }
                      let pr = result.obj.last_protocol;
                      if (pr &&  pr.length > 0) {
                              try {
                                  pr = JSON.parse(pr);
                                  result.obj.next_protocol_color = 'rgb(74, 83, 86)';
                                  if (pr.protocol_date_next) {
                                      result.obj.next_protocol = this.apiService.mysqlDate2view(pr.protocol_date_next);
                                      let x = moment(pr.protocol_date_next, 'YYYY-M-D');
                                      let y = moment();
                                      let diffDays = x.diff(y, 'days');
                                      if (diffDays < 90) { result.obj.next_protocol_color = '#f1c40f'; }
                                      if (diffDays < 30) { result.obj.next_protocol_color = '#e74c3c'; }
                                      // console.log('x :', pr.protocol_date_next ,  diffDays);
                                  }
                                  if (pr.result) {
                                      if (pr.result == 1) {
                                          result.obj.next_protocol = this.translate.instant('reparieren');
                                          result.obj.next_protocol_color = '#f1c40f';
                                      }
                                      if (pr.result == 3) {
                                          result.obj.next_protocol = this.translate.instant('unauffindbar');
                                          result.obj.next_protocol_color = '#e74c3c';
                                      }
                                      if ((pr.result == 2) || (pr.result == 4)) {
                                          result.obj.next_protocol = this.translate.instant('ausmustern');
                                          result.obj.next_protocol_color = '#C558D3';
                                      }
                                  }
                              } catch (e) {
                                  console.error('JSON.parse(pr) err :', e);
                                  console.log('pr :', pr);
                              }
                      }

                      let details = '';
                      try {
                        const items = JSON.parse(result.obj.items);

                        console.log('items:', result.obj.items );
                        for (let i = 0; i < items.length; i++) {
                          if (items[i].type != 2 ) { continue; }
                          if (items[i].value.trim() == '' ) { continue; }
                          if (details != '') {
                            details += ', ';
                          }
                          details += items[i].title[this.lang] + ':' + items[i].value.trim();
                          if (details.length > 63) {
                            details = details.substring(0, 60) + '...';
                            break;
                          }
                        }
                      } catch {
                         console.error('JSON.parse err items', result.obj.items) ;
                      }

                      this.company = customer.obj.company;

                      const new_obj = {
                        id: result.obj.id,
                        id_number: result.obj.id_number,
                        title: result.obj.title,
                        company: customer.obj.company,
                        idCustomer: customer.obj.id,
                        details: details,
                        next_protocol: result.obj.next_protocol,
                        next_protocol_color: result.obj.next_protocol_color
                      };
                      this.zone.run(() => {
                        this.scanList.push(new_obj);
                        console.log('scanList:', this.scanList);
                      });

                    }).catch(this.onFailure);
                  }
                }
              }).catch(this.onFailure);
            }
          }
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  nfc_write() {
    console.log('nfc_write()');
    const message = [
      this.ndef.textRecord('BruggPVS:ProductID:' + this.pid),
      this.ndef.uriRecord('https://www.pvs2go.com/')
    ];
    console.log('nfc_write()', message);
    this.procedure = 2;
    this.nfc.write(message)
      .then(() => {
        console.log('nfc_write() ok');
        const obj = { nfc_tag_id: this.tagId, id: this.pid };

        this.apiService.pvs4_set_product_tag(obj).then((done: any) => {
          console.log('pvs4_set_product_tag() ok:', done);
        }).catch((err: any) => {
          console.log('pvs4_set_product_tag() ok:', err);
          this.procedure = 4;
          this.result = this.translate.instant('NFC-Schreibvorgang fehlgeschlagen!');
        });

        this.procedure = 3;
        this.result = this.translate.instant('NFC-Schreibvorgang erfolgreich abgeschlossen.');
      })
      .catch((err) => {
        console.log('nfc_write() error:', err);
        this.procedure = 4;
        this.result = this.translate.instant('NFC-Schreibvorgang fehlgeschlagen!');
      });
  }

  onFailure(reason: any) {
    console.log('NFC onFailure():', reason);

    this.procedure = 4;

    const alert = this.alertCtrl.create({
      header: this.translate.instant('information'),
      message: 'Fehler: NFC Listener ' + reason,
      buttons: [
        {
          text: this.translate.instant('okay'),
          handler: () => {
          }
        }
      ]
    }).then(x => x.present());

  }

  onSuccess(msg: any) {
    console.log('onSuccess()', msg);
  }

  delScanList = function (del: any) {
    console.log('NFC delScanList():', del);
    let hilf = [];
    for (let i = 0; i < this.scanList.length; i++) {
      if (this.scanList[i].id != del.id) { hilf.push(this.scanList[i]); }
    }
    this.scanList = [];
    this.scanList = hilf;
    if (hilf.length == 0) {
      this.company = '';
    }
  };
  dismiss() {
    this.viewCtrl.dismiss();
  }

  createProtocol() {
    console.log('scanList :', this.scanList);
    if (this.scanList.length > 0) {
      let hilf = [];
      for (let i = 0; i < this.scanList.length; i++) {
        const data = this.scanList[i];
        hilf.push(data);
      }

      const data = {
            id: 0,
            idCustomer: this.scanList[0].idCustomer,
            productList: JSON.stringify(hilf)
        };
      this.dataService.setData(data);
      this.navCtrl.navigateForward(['/protocol-edit']);
      this.viewCtrl.dismiss();
    }
  }


}
