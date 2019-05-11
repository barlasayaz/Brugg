import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { ApiService } from '../services/api';
import { TreeNode } from 'primeng/api';

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
export class ProductMigrationPage {
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
              public navParams: NavParams,
              public viewCtrl: ModalController,
              public translate: TranslateService,
              public userdata: UserdataService,
              public apiService: ApiService,
              public alertCtrl: AlertController) {
                this.url = this.apiService.pvsApiURL;
                this.idCustomer = this.navParams.get("idCustomer");
                this.productList = this.navParams.get("productList");
                console.log('ProductMigrationPage productList:', this.productList); 
                this.loadSourceCustomer();
                this.loadTargetCustomer();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProductMigrationPage');
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  loadSourceCustomer() {
    this.apiService.pvs4_get_customer(this.idCustomer).then((result:any)=>{
      this.activCustomer = result.obj;  
      console.log('loadCustomer: ' , this.activCustomer); 
    });
  }

  loadTargetCustomer(){
    this.apiService.pvs4_get_customer_list(0).then((result: any) => {
      this.listCustomer = [];
      this.data_tree(result.list);
      console.log("listcustomer :", this.listCustomer);
    });
  }

  data_tree(nodes: TreeNode[]): any {
    for (let i = 0; i < nodes.length; i++) {
      if(nodes[i].data.id != this.idCustomer) {
        this.listCustomer.push(nodes[i].data);
        if (nodes[i].children && nodes[i].children.length > 0) {
          this.data_tree(nodes[i].children);
        }
      }
    }
  }

  customerChange(event) {
    console.log('port:', event.value);
    console.log('customer:', this.targetCustomer);
  }

  productMigrationAlert() {
    if(this.targetCustomer) {
      let alert = this.alertCtrl.create({
        header: 'Bestätigen Sie das Migration Produkt',
        message: this.translate.instant('Möchten Sie dieses Produkt wirklich migrieren?'),
        buttons: [
          {
            text: this.translate.instant('dismiss'),
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: this.translate.instant('okay'),
            handler: () => {
              this.productMigration();                           
            }
          }
        ]
      }).then(x=> x.present());
    }
  }

  productMigration() {
    this.productList.forEach(element => { 
      this.apiService.pvs4_get_product(element.data.id).then((resultProduct:any)=>{
        let oldObj = {                      
          id:               element.data.id,
          title:            resultProduct.obj.title,
          customer:         resultProduct.obj.customer,
          id_number:        resultProduct.obj.id_number,
          parent:           resultProduct.obj.parent, 
          active:           0,
          check_interval:   resultProduct.obj.check_interval,
          last_protocol:    resultProduct.obj.last_protocol,
          articel_no:       resultProduct.obj.articel_no,                
          items:            resultProduct.obj.items,        
          images:           resultProduct.obj.images, 
          nfc_tag_id:       resultProduct.obj.nfc_tag_id,
          qr_code:          resultProduct.obj.qr_code       
        };
        let oldParent: any = resultProduct.obj.parent;
        this.apiService.pvs4_set_product(oldObj).then((result: any) => {
          console.log('deactive product result: ', result);
        });  

        this.apiService.pvs4_get_product_parrent(element.data.id).then((resultParent: any) => {
          if(resultParent.obj) {
            let parentObj = {                      
              id:               resultParent.obj.id,
              title:            resultParent.obj.title,
              customer:         resultParent.obj.customer,
              id_number:        resultParent.obj.id_number,
              parent:           oldParent, 
              active:           resultParent.obj.active,
              check_interval:   resultParent.obj.check_interval,
              last_protocol:    resultParent.obj.last_protocol,
              articel_no:       resultParent.obj.articel_no,                
              items:            resultParent.obj.items,        
              images:           resultParent.obj.images, 
              nfc_tag_id:       resultParent.obj.nfc_tag_id,
              qr_code:          resultParent.obj.qr_code
            };
            this.apiService.pvs4_set_product(parentObj).then((result: any) => {
              console.log('parent product result: ', result);
            });  
          }
        });  

        let newObj = {                      
            id:               0,
            title:            resultProduct.obj.title,
            customer:         this.targetCustomer.id,
            id_number:        resultProduct.obj.id_number,
            parent:           0, 
            active:           resultProduct.obj.active,
            check_interval:   resultProduct.obj.check_interval,
            last_protocol:    resultProduct.obj.last_protocol,
            articel_no:       resultProduct.obj.articel_no,                
            items:            resultProduct.obj.items,        
            images:           resultProduct.obj.images, 
            nfc_tag_id:       resultProduct.obj.nfc_tag_id,
            qr_code:          resultProduct.obj.qr_code      
          };
  
          console.log("obj :", newObj);
          this.apiService.pvs4_set_product(newObj).then((result: any) => {
            console.log('migration product result: ', result);

            let newImgPath: string = "";
            if(resultProduct.obj.images) {
              if (resultProduct.obj.images.indexOf('img/') != -1) {
                newImgPath = resultProduct.obj.images;
              }
              if (resultProduct.obj.images.indexOf('mobileimages/') != -1) {
                newImgPath = 'mobileimages/productimage_'+result.id+'.jpg';                
                this.copyFile('mobileimages/productimage_'+element.data.id+'.jpg', 'mobileimages/productimage_'+result.id+'.jpg');
              }
            }
            else {
              newImgPath = "";
            }

            this.apiService.pvs4_get_file(element.data.id, 'product').then((result2) => {
              console.log("dateiliste :", result2);
              this.attachmentsFileCount = result2["files"].length;
              console.log("attachmentsFileCount :", this.attachmentsFileCount);
              if(this.attachmentsFileCount > 0) {
                this.copyFile('product_'+ element.data.id, 'product_'+ result.id);
              }
          });

            newObj.id = result.id;
            newObj.images = newImgPath;
            console.log("obj :", newObj);
            this.apiService.pvs4_set_product(newObj).then((result: any) => {
              console.log('images product result: ', result);
              this.navCtrl.navigateBack("/product-list/"+this.idCustomer); 
            });
          });  
      });      
    });            
  }

  copyFile(sourceFile: any, targetFile: any) {
    console.log("copyFile sourceFile-targetFile",sourceFile,' - ',targetFile);
    this.params = { "sourceFile": sourceFile, 
                    "targetFile": targetFile
                  }; 
    this.apiService.pvs4_copy_file(this.params).then((result) => {
      console.log("result :",result);
    });
  }

}
