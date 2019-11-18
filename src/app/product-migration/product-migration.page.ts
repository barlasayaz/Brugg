import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { ApiService } from '../services/api';
import { TreeNode } from 'primeng/api';
import { File } from '@ionic-native/file/ngx';

/**
 * Generated class for the ProductMigrationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-product-migration',
  templateUrl: './product-migration.page.html',
  styleUrls: ['./product-migration.page.scss'],
})
export class ProductMigrationPage implements OnInit {
  public inputError: boolean = false;
  public lang: string = localStorage.getItem('lang');
  public idCustomer: any;
  public activCustomer: any = {}; 
  public productList: any[] = [];
  public listCustomer: any[] = [];
  public targetCustomer: any = {};
  public url: any;
  public params: any = [];
  public file_link: any;
  public attachmentsFileCount: any = 0;

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
      this.navParams.get('idCustomer');
      let list = this.navParams.get('productList');
      if (list) {
        this.productList = JSON.parse(list);
      }

      console.log('ProductMigrationPage productList:', this.productList);
      this.targetCustomer = '';
      this.loadSourceCustomer();
      this.loadTargetCustomer();
   }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  loadSourceCustomer() {
    this.apiService.pvs4_get_customer(this.idCustomer).then((result: any) => {
      this.activCustomer = result.obj;
      console.log('loadCustomer: ' , this.activCustomer);
    });
  }

  loadTargetCustomer() {
    this.apiService.pvs4_get_customer_list(0, '').then((result: any) => {
      this.listCustomer = [];
      this.data_tree(result.list);
      console.log('listcustomer :', this.listCustomer);
    });
  }

  data_tree(nodes: TreeNode[]): any {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].data.id != this.idCustomer) {
        this.listCustomer.push(nodes[i].data);
        if (nodes[i].children && nodes[i].children.length > 0) {
          this.data_tree(nodes[i].children);
        }
      }
    }
  }

  customerChange(event) {
    this.inputError = false;
    console.log('port:', event.value);
    console.log('customer:', this.targetCustomer);
  }

  inputErrorMsg() {
    this.inputError = false;
  }

  productMigrationAlert() {
    this.inputError = false;
    if (this.targetCustomer == '') {
      this.inputError = true;
      return;
    }
    if (this.targetCustomer) {
      let alert = this.alertCtrl.create({
        header: this.translate.instant('Achtung'),
        message: this.translate.instant('Möchten sie dieses produkt wirklich migrieren?'),
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
              this.productMigration();
            }
          }
        ]
      }).then(x => x.present());
    }
  }

  productMigration() {
    this.productList.forEach(element => {
      this.apiService.pvs4_get_product_parrent(element.id).then((resultParent: any) => {
        resultParent.obj.forEach(element => {
          this.apiService.pvs4_get_product(element.data.id).then((result: any) => {
            const activChildProduct = element.data;
            activChildProduct.customer = this.targetCustomer.id;
            this.apiService.pvs4_set_product(activChildProduct).then((setResult: any) => {
                console.log('result: ', setResult);
            });
          });
        });
      });
      this.apiService.pvs4_get_product(element.id).then((result: any) => {
        const activProduct = result.obj;
        activProduct.customer = this.targetCustomer.id;
        this.apiService.pvs4_set_product(activProduct).then((setResult: any) => {
            console.log('result: ', setResult);
            this.viewCtrl.dismiss(true);
        });
      });
    });
  }

}
