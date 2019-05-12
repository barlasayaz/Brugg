import { Component, Input } from '@angular/core';
import { UserdataService } from '../../services/userdata';
import { NavController, NavParams, Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ofroot } from '../../order-form/order-form-root';
/**
 * Generated class for the MainNavComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {
  @Input() aktivPage: string;
  @Input() idCustomer: number;
  @Input() company: string;
  public progressBar: any = 0;
  public rowRecords: any = 0;
  public totalRecords: any = 0;
  public anz_wahrenkorb: any = 0;

  constructor(
    public userdata: UserdataService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public events: Events,
    public of: ofroot) {

    console.log('Hello MainNavComponent Component');
    this.events.subscribe('progressBar', (progressBar) => {
      if (progressBar > 0) {
        this.progressBar = progressBar;
      }
    });
    this.events.subscribe('rowRecords', (rowRecords) => {
      this.rowRecords = rowRecords;
    });
    this.events.subscribe('totalRecords', (totalRecords) => {
      this.totalRecords = totalRecords;
    });

    if (this.of.anz_wahrenkorb) {
      this.anz_wahrenkorb = this.of.anz_wahrenkorb;
    } else {
      this.anz_wahrenkorb = 0;
    }

  }

  getClass(path) {
    if (this.aktivPage === path) {
      return 'active';
    } else {
      return '';
    }
  }

  go(action: any, id: number = 0) {
    // Navigation
    console.info("app.go: ", action, id, this.aktivPage);
    if (this.aktivPage != action) {
      switch (action) {
        case "StartscreenNew": //HOME
          this.navCtrl.navigateRoot("/startscreen-new");
          break;
        case "DashboardNew":
          this.navCtrl.navigateRoot("/dashboard-new");
          break;
        case "CustomerTable":
          this.navCtrl.navigateRoot(["/customer-table", { "idCustomer": id }]);
          break;
        case "CustomerDetails":
          this.navCtrl.navigateRoot(["/customer-details", { "idCustomer": id, "company": this.company }]);
          break;
        case "ProductList":
          this.navCtrl.navigateRoot(["/product-list", { "idCustomer": id, "company": this.company }]);
          break;
        case "ProtocolList":
          this.navCtrl.navigateRoot(["/protocol-list", { "idCustomer": id, "company": this.company }]);
          break;
        case "OrderForm":
          this.navCtrl.navigateRoot(["/order-form", { "idCustomer": id, "company": this.company }]);
          break;
        case "NoteList":
          this.navCtrl.navigateRoot(["/note-list", { "idCustomer": id, "company": this.company }]);
          break;
      }
    }
    this.aktivPage = action;
  }

  showdashfirst() {
    this.events.publish("className", "showdashfirst");
    document.getElementById('dashfirst').className = 'active';
    document.getElementById('dashsecond').className = 'inactive';
  };

  showdashsecond() {
    this.events.publish("className", "showdashsecond");
    document.getElementById('dashsecond').className = 'active';
    document.getElementById('dashfirst').className = 'inactive';
  };


}
