import { Component, OnInit, Input } from '@angular/core';
import { UserdataService } from '../../services/userdata';
import { ApiService } from '../../services/api';
import { NavController, Events, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

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
    private menu: MenuController,
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

  openMenu() {
    this.menu.enable(true, 'menu');
    this.menu.open('menu');
    console.log('menu opend');
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
