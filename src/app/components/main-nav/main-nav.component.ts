import { Component, OnInit, Input } from '@angular/core';
import { UserdataService } from '../../services/userdata';
import { ApiService } from '../../services/api';
import { NavController, Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NavigationExtras } from '@angular/router';

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
export class MainNavComponent implements OnInit {
  @Input() aktivPage: string;
  @Input() idCustomer: number;

  public progressBar: any = 0;
  public rowRecords: any = 0;
  public totalRecords: any = 0;
  public customerName = '';

  constructor(
    public userdata: UserdataService,
    public navCtrl: NavController,
    public translate: TranslateService,
    public events: Events,
    public apiService: ApiService) {

    console.log('Hello MainNavComponent Component');
    this.events.subscribe('progressBar', (progressBar) => {
      if (progressBar >= 0) {
        this.progressBar = progressBar;
      }
    });
    this.events.subscribe('rowRecords', (rowRecords) => {
      this.rowRecords = rowRecords;
    });
    this.events.subscribe('totalRecords', (totalRecords) => {
      this.totalRecords = totalRecords;
    });

  }

  ngOnInit() {
    if (this.idCustomer > 0) {
      this.apiService.pvs4_get_customer(this.idCustomer).then((result: any) => {
        if (result && result.obj) {
        this.customerName = result.obj.company;
        }
      });
    }
  }

  getClass(path) {
    if (this.aktivPage == path) {
      return 'active';
    } else {
      return '';
    }
  }

  go(action: any, id: number = 0) {
    // Navigation
    console.log('app.go: ', action, id, this.aktivPage);

    if (this.aktivPage != action) {
      switch (action) {
        case 'Startscreen': // HOME
          this.navCtrl.navigateRoot('/startscreen');
          break;
        case 'Dashboard':
          this.navCtrl.navigateRoot('/dashboard');
          break;
        case 'CustomerTable':
          this.navCtrl.navigateRoot(['/customer-table']);
          break;
        case 'CustomerDetails':
          this.navCtrl.navigateRoot(['/customer-details', id]);
          break;
        case 'ProductList':
            const navigationExtras: NavigationExtras = {
              queryParams: {
                refresh: new Date().getTime()
              }
            };
          this.navCtrl.navigateRoot(['/product-list/' + id], navigationExtras);
          break;
        case 'ProtocolList':
          this.navCtrl.navigateRoot(['/protocol-list/' + id]);
          break;
        case 'OrderForm':
          this.navCtrl.navigateRoot(['/order-form', id]);
          break;
        case 'NoteList':
          this.navCtrl.navigateRoot(['/note-list/' + id]);
          break;
      }
    } else {
      if (this.aktivPage == 'Statistics') {
        this.navCtrl.navigateRoot('/dashboard');
      }
    }
    this.aktivPage = action;
  }

  showdashfirst() {
    this.events.publish('className', 'showdashfirst');
    document.getElementById('dashfirst').className = 'active';
    document.getElementById('dashsecond').className = 'inactive';
  }

  showdashsecond() {
    this.events.publish('className', 'showdashsecond');
    document.getElementById('dashsecond').className = 'active';
    document.getElementById('dashfirst').className = 'inactive';
  }


}
