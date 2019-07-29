import { Component, NgZone,OnInit } from '@angular/core';
import { NavParams, Platform, ModalController, AlertController, NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api';
import { DataService } from '../../services/data.service';
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
  public listView: boolean = true;
  public tagId: string = "";
  public cols: any[];
  public result: string = "";
  public lang: string = localStorage.getItem('lang');
  public company:string ="";

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
    private navCtrl: NavController) {

  }

  ngOnInit()
  {
    this.readonly = this.navParams.get("readOnly");
    this.pid = this.navParams.get("pid");

    this.cols = [
      { field: 'id_number', header: 'ID', width: '300px' },
      { field: 'title', header: this.translate.instant('Produkt') },
      { field: 'details', header: this.translate.instant('Produktdetails')  } 
    ];
    this.procedure = 0;
    this.isWritable = true;
    if (!this.readonly) this.listView = false;

    this.platform.ready().then(() => {
      if (this.platform.is('ios') ||
        this.platform.is('android') ||
        this.platform.is('ipad') ||
        this.platform.is('iphone') ||
        this.platform.is('phablet') ||
        this.platform.is('tablet')) {
          this.nfc.enabled().then((flag) => {
          this.subscribeNfc();
        }).catch(this.onFailure);;
      }
      else {
        console.log("platform :", this.platform.platforms());
      }
    });
  }

  subscribeNfc() {
    console.log("subscribeNfc()");
    this.ndeflistener = this.nfc.addNdefListener()
    this.subscription = this.ndeflistener.subscribe(
      (data: Event) => this.nfcReadNdef(data),
      (err: any) => console.log(err)
    );
  }


  nfcReadNdef(event: any) {
    console.log("nfcReadNdef()", event);
    if (event && event.tag && event.tag.id) {
      this.tagId = this.nfc.bytesToHexString(event.tag.id);
      this.isWritable = event.tag.isWritable;
      console.log(typeof (this.tagId) + " tagId: ", this.tagId);
      console.log("isWritable: ", this.isWritable);
      console.log("only read: ", this.readonly);
      if (this.readonly) {
        this.read_nfc_data(event);
      } else {
        this.procedure = 1;
      }

    }

  }

  read_nfc_data(nfcEvent: any) {
    console.log("read_nfc_data()", nfcEvent);
    if (!nfcEvent.tag.ndefMessage) {
      const toast = this.toastCtrl.create({
        message: this.translate.instant("Produkt unbekannt"),
        duration: 2000
      }).then(x => x.present());
      return;
    }
    var art = this.nfc.bytesToString(nfcEvent.tag.ndefMessage[0].type);
    console.log('NFC art:', art);
    if (art == "T") {
      var text = this.ndef.textHelper.decodePayload(nfcEvent.tag.ndefMessage[0].payload);
      console.log("NFC text", text);
      var res = text.split(":");
      if (res.length >= 3) {
        if (res[0] == "BruggPVS") {
          if (res[1] == "ProductID") {
            let pid = parseInt(res[2]);
            console.log("NFC pid", pid);
            if (pid > 0) {
              this.apiService.pvs4_get_nfc_product(this.tagId).then((result: any) => {
                console.log("nfc result", result);
                if (result.amount == 0) {
                  const toast = this.toastCtrl.create({
                    message: this.translate.instant("Produkt unbekannt"),
                    duration: 2000
                  }).then(x => x.present());
                  return;
                }
                if (!this.listView) {
                  //result.obj.title = JSON.parse(result.obj.title);
                  this.viewCtrl.dismiss();
                  this.navCtrl.navigateForward(['/product-details', result.obj.id ] );                  
                }
                else {
                  let rein = true;
                  for (var i = 0; i < this.scanList.length; i++) {
                    if (this.scanList[i].id == result.obj.id) rein = false;
                  }
                  for (var i = 0; i < this.scanList.length; i++) {
                    this.scanList[i].idCustomer = parseInt(this.scanList[i].idCustomer);
                    result.obj.customer = parseInt(result.obj.customer);
                    if (this.scanList[i].idCustomer != result.obj.customer){
                      rein = false;
                      const toast = this.toastCtrl.create({
                        message: this.translate.instant("Produkt einem anderem Kunden zugeteilt"),
                        duration: 2000
                      }).then(x => x.present());
                      return;
                    } 
                  }
                  if (rein) {
                    this.apiService.pvs4_get_customer(result.obj.customer).then((customer: any) => {
                      try
                      {
                        result.obj.title = JSON.parse(result.obj.title);   
                        result.obj.title = result.obj.title[this.lang];   
                      }
                      catch{
                         console.error('JSON.parse err title', result.obj.title) ;
                      }
                      let details ="";
                      try
                      {
                        let items = JSON.parse(result.obj.items); 
                        
                        console.log("items:", result.obj.details );   
                        for (var i = 0; i < items.length; i++) {
                          if (items[i].type != 2 ) continue;
                          if (items[i].value.trim() == "" ) continue;
                          if(details != ""){
                            details +=", ";
                          }
                          details += items[i].title[this.lang] +":"+items[i].value.trim();   
                          if(details.length>63) {
                            details = details.substring(0,60)+"...";
                            break;
                          } 
                        } 
                      }
                      catch{
                         console.error('JSON.parse err items', result.obj.items) ;
                      }

                      this.company = customer.obj.company;

                      let new_obj = {
                        id: result.obj.id,
                        id_number: result.obj.id_number,
                        title: result.obj.title,
                        company: customer.obj.company,
                        idCustomer: customer.obj.id,
                        details: details
                      }
                      this.zone.run(() => {
                        this.scanList.push(new_obj);
                        console.log("scanList:", this.scanList);
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
    console.log("nfc_write()");
    let message = [
      this.ndef.textRecord("BruggPVS:ProductID:" + this.pid),
      this.ndef.uriRecord("https://www.pvs2go.com/")
    ];
    console.log("nfc_write()", message);
    this.procedure = 2;
    this.nfc.write(message)
      .then(() => {
        console.log("nfc_write() ok");
        let obj = { nfc_tag_id: this.tagId, id: this.pid }

        this.apiService.pvs4_set_product_tag(obj).then((done: any) => {
          console.log("pvs4_set_product_tag() ok:", done);
        }).catch((err: any) => {
          console.log("pvs4_set_product_tag() ok:", err);
          this.procedure = 4;
          this.result = this.translate.instant('NFC-Schreibvorgang fehlgeschlagen!');
        });

        this.procedure = 3;
        this.result = this.translate.instant('NFC-Schreibvorgang erfolgreich abgeschlossen.');
      })
      .catch((err) => {
        console.log("nfc_write() error:", err);
        this.procedure = 4;
        this.result = this.translate.instant('NFC-Schreibvorgang fehlgeschlagen!');
      });
  }

  onFailure(reason: any) {
    console.log('NFC onFailure():', reason);

    this.procedure = 4;

    let alert = this.alertCtrl.create({
      header: 'Error',
      message: "Fehler: NFC Listener " + reason,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
          }
        }
      ]
    }).then(x => x.present());

  }

  onSuccess(msg: any) {
    console.log("onSuccess()", msg);
  }

  delScanList = function (del: any) {
    console.log('NFC delScanList():', del);
    var hilf = [];
    for (var i = 0; i < this.scanList.length; i++) {
      if (this.scanList[i].id != del.id) hilf.push(this.scanList[i]);
    }
    this.scanList = hilf;
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  createProtocol() {
    console.log("scanList :", this.scanList);
    if (this.scanList.length > 0) {
      var hilf = [];
      for (var i = 0; i < this.scanList.length; i++) {
        let data = this.scanList[i];
        hilf.push(data);
      }

      let data = {
            id: 0, 
            idCustomer: this.scanList[0].idCustomer,
            productList: JSON.stringify(hilf)
        }
      this.dataService.setData(data);
      this.navCtrl.navigateForward(["/protocol-edit"]);
      this.viewCtrl.dismiss();
    }
  }


}
