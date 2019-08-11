import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController } from '@ionic/angular';
import { UserdataService } from '../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/api';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { DataService } from '../services/data.service';

/**
 * Generated class for the ProtocolEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-protocol-edit',
  templateUrl: './protocol-edit.page.html',
  styleUrls: ['./protocol-edit.page.scss'],
})
export class ProtocolEditPage implements OnInit {
  public pageTitle: string ;
  public idCustomer: number = 0;
  public idProtocol: number = 0;
  public itsNew: boolean = false;
  public activProtocol: any = {
    active: 1,
    id : 0,
    protocol_number: 0,
    protocol_date: '',
    protocol_date_next : '',
    result: 0,
    items : [],
    customer: 0,
    title: '',
    product: ''
  };
  public templates: any[] = [];
  public products: any[] = [];
  public productList: any[] = [];
  public templateAll: any[] = [];
  public selectedTemplate: any[] = [];
  public selectedTmplt: any = 0;
  public selectTemplate: any = 0;
  public searchText: string = '';
  public lang: string = '';
  public company: string = '';
  public downClick: any = 0;
  public maxDate: string;
  public mandatoryControl: boolean = false;

  constructor(public navCtrl: NavController,
    public route: ActivatedRoute,
    public translate: TranslateService,
    public userdata: UserdataService,
    public apiService: ApiService,
    public modalCtrl: ModalController,
    public dataService: DataService,
    public alertCtrl: AlertController) {
  }

  ngOnInit() {
    this.maxDate = this.apiService.maxDate;
    if (this.route.snapshot.data['special']) {
      let params = this.route.snapshot.data['special'];
      this.idCustomer = params['idCustomer'];
      this.idProtocol = params['id'];
      let list = params['productList'];
      if (list) {
        this.productList = JSON.parse(list);
        console.log('productList :', this.productList);
      }
    }

    if (this.idProtocol > 0) {
      console.log('protocol new');
      this.itsNew = false;
      this.pageTitle = this.translate.instant('Protokoll bearbeiten');
      this.loadProtocol();
    } else {
      console.log('protocol edit');
      this.idProtocol = 0;
      this.itsNew = true;
      this.pageTitle = this.translate.instant('Neues Protokoll');
      this.activProtocol.protocol_date = new Date().toISOString();
      let date = new Date();
      date.setDate(date.getDate() + 365);
      this.activProtocol.protocol_date_next = date.toISOString();
    }
    this.lang = localStorage.getItem('lang');
    this.loadTemplate();
    this.loadProduct();
    console.log('ProtocolEditComponent: ', this.idProtocol);
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
        (event.keyCode >= 96 && event.keyCode <= 105)) {
      // Left / Up / Right / Down Arrow, Backspace, Delete keys
      return;
    }

    if (!inputChar.match(regex)) {
      // invalid character, prevent input
      event.preventDefault();
    }
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

  loadProtocol() {
    this.apiService.pvs4_get_protocol(this.idProtocol).then((result: any) => {
      this.activProtocol = result.obj;
      this.activProtocol.title = JSON.parse(this.activProtocol.title);
      this.activProtocol.items = JSON.parse(result.obj.items);
      if (result.obj.protocol_date && result.obj.protocol_date != null && new Date(result.obj.protocol_date) >= new Date(1970, 0, 1)) {
          this.activProtocol.protocol_date = new Date(result.obj.protocol_date).toISOString();
          this.activProtocol.protocol_date_next = new Date(result.obj.protocol_date_next).toISOString();
      }
      console.log('loadProtocol: ' , this.activProtocol);
    });
  }

  loadTemplate() {
    this.templates = [];
    this.apiService.pvs4_get_protocol_tem(this.userdata.licensee, 1).then((result: any) => {
      result.list.forEach(element => {
        element.data.options = JSON.parse(element.data.options);
        element.data.title = JSON.parse(element.data.title);
        this.templates.push(element.data);
        this.selectedTemplate[element.data.id] = 0;
      });
      this.templateAll = JSON.parse(JSON.stringify(this.templates));
      console.log('Template Title :', this.templates);
     });
  }

  loadProduct() {
    console.log('loadProduct() productList:', this.productList);
    let interval: number = 36;
    this.productList.forEach(element => {
      let obj = element;
      if (element.data) { obj = element.data; }
      // obj.id = parseInt( obj.id ); //have to be a string
      this.products.push({'id': obj.id, 'id_number': obj.id_number});
      obj.check_interval = parseInt(obj.check_interval);
      if ((obj.check_interval  < interval) && (obj.check_interval > 1)) { interval = obj.check_interval; }
    });
    let date = new Date(this.activProtocol.protocol_date);

    if (interval == 12) {
       date.setDate(date.getDate() + (365) );
    } else if (interval == 24) {
      date.setDate(date.getDate() + (2 * 365) );
    } else if (interval == 36) {
      date.setDate(date.getDate() + (3 * 365) );
    } else {
      date.setDate(date.getDate() + (30 * interval) );
    }
    this.activProtocol.protocol_date_next = date.toISOString();
    this.activProtocol.product = this.products;
    this.activProtocol.result = '0';
    console.log('products :', this.products, interval, this.activProtocol);
  }

  search_all() {
    this.templates = JSON.parse(JSON.stringify(this.templateAll));
    for (let i = this.templates.length - 1; i >= 0; i--) {
        if (this.templates[i].title[this.lang].toLowerCase().indexOf(this.searchText.toLowerCase()) < 0) {
           this.templates.splice(i, 1);
        }
    }
  }

  move_left() {
    this.showConfirmTemplateAlert(this.activProtocol);
  }

  protocolEdit() {
    console.log('protocolEdit()');
    this.mandatoryControl = false;
    if (this.activProtocol['title'] == '') {
      this.showOptionAlert();
      return;
    }

    this.activProtocol.items.forEach(element => {
      // console.log('Mandatory Control :', element, element.mandatory, element.type, element.value);
      // Toggle
      if (element.type == 0) {
        // console.log('toggle :', element.value);
        if (element.mandatory == 'true' && !element.value) {
          this.mandatoryControl = true;
        }
      }
      // Sekect
      if (element.type == 1) {
        // console.log('select :', element.value);
        if (element.mandatory == 'true' && element.value == null) {
          this.mandatoryControl = true;
        }
      }
      // Textarea
      if (element.type == 2) {
        // console.log('textarea :', element.value);
        if (element.mandatory == 'true' && element.value == null) {
          this.mandatoryControl = true;
        }
      }
      // Number
      if (element.type == 3) {
        // console.log('number :', element.value);
        if (element.mandatory == 'true' && element.value == null) {
          this.mandatoryControl = true;
        }
      }
      // Time
      if (element.type == 4) {
        // console.log('time :', element.value);
        if (element.mandatory == 'true' && element.value == null) {
          this.mandatoryControl = true;
        }
      }
      // Date
      if (element.type == 5) {
        // console.log('date :', element.value);
        if (element.mandatory == 'true' && element.value == null) {
          this.mandatoryControl = true;
        }
      }

    });

    if (this.mandatoryControl) {
      this.showMandatoryAlert();
      return;
    }

    let obj = {
        active: 1,
        protocol_number: 0,
        protocol_date : '',
        protocol_date_next : '',
        result: 0,
        items : '',
        title : '',
        customer: this.idCustomer,
        id: 0,
        product: ''
    };
    console.log('this.activProtocol :', this.activProtocol);
    if (this.activProtocol['active']) { obj.active = this.activProtocol['active']; }
    if (this.activProtocol['protocol_number']) { obj.protocol_number = this.activProtocol['protocol_number']; }
    if (this.activProtocol['title']) { obj.title = JSON.stringify(this.activProtocol['title']); } 
    if (this.activProtocol['items']) { obj.items = JSON.stringify(this.activProtocol['items']); }
    if (this.activProtocol['customer']) { obj.customer = this.activProtocol['customer']; }
    if (this.activProtocol['product']) { obj.product = JSON.stringify(this.activProtocol['product']); }
    let pipe = new DatePipe('en-US'); 
    if (this.activProtocol['protocol_date']) {
      obj.protocol_date = pipe.transform(this.activProtocol['protocol_date'], 'yyyy-MM-dd HH:mm:ss');
    }
    if (this.activProtocol['protocol_date_next']) {
      obj.protocol_date_next = pipe.transform(this.activProtocol['protocol_date_next'], 'yyyy-MM-dd HH:mm:ss');
    }
    if (this.activProtocol['result']) {
      obj.result = parseInt(this.activProtocol['result']);
    }

    console.log('edit title :', this.activProtocol['title']);
    if (!this.itsNew) {
      obj.id = this.activProtocol['id'];
      this.idProtocol = this.activProtocol['id'];
    } else {
      this.activProtocol.active = 1;
    }

    this.apiService.pvs4_set_protocol(obj).then((result: any) => {
      // console.log('result: ', result);
      let navigationExtras: NavigationExtras = {
        queryParams: {
          refresh: new Date().getTime()
        }
      };
      this.navCtrl.navigateBack(['/product-list/' + this.idCustomer],navigationExtras);
    });

  }

  dismiss() {
    this.navCtrl.navigateBack('/protocol-list/' + this.idCustomer);
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

  showConfirmTemplateAlert(activProtocol) {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Bestätigen Sie die Protokollerstellung'),
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
            console.log('items: ', temp, ' - ', this.selectedTmplt); 

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
                // this.activProtocol.items[index].value =  temp.options[index].options.default;
              } else {
                temp.options[index].value = null;
              }
            }

            this.activProtocol.items = temp.options;
            this.activProtocol.title = this.templates.find(x => x.id == this.selectedTmplt).title;
            // this.activProtocol.title = temp.title;
          }
        }
      ]
    }).then(x => x.present());
  }

  showMandatoryAlert() {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Protokoll speichern short'),
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
      header: this.translate.instant('Protokoll speichern short'),
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
    this.navCtrl.navigateForward(['/protocol-template']);
  }
}
