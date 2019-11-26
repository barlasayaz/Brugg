import { Component, OnInit, Input , Output, EventEmitter, NgModule  } from '@angular/core';
import { UserdataService } from '../../services/userdata';
import { ApiService } from '../../services/api';
import { NavController, Events, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { SystemService } from '../../services/system';
import { Router, RouterEvent } from '@angular/router';

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
  @Input() idCustomer: number = 0;
  @Output() ping: EventEmitter<any> = new EventEmitter<any>();
  @Input() searchText: string = '';
  @Input() filterText: string = '';
  @Input() filterOn: boolean = false;

  public progressBar: any = 0;
  public rowRecords: any = 0;
  public totalRecords: any = 0;
  public customerName = '';

  public nextAppointmentEnable = true;
  public customerEnable = true;
  public appointmentPlanEnable = false;
  public searchTimeout;

  constructor(
    public userdata: UserdataService,
    public navCtrl: NavController,
    public translate: TranslateService,
    public events: Events,
    public systemService: SystemService,
    private menu: MenuController,
    private router: Router,
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
    console.log('main-nav ngOnInit this.idCustomer:', this.idCustomer );
    if (this.idCustomer > 0) {
      this.apiService.pvs4_get_customer(this.idCustomer).then((result: any) => {
        if (result && result.obj) {
          this.customerName = result.obj.company;
        }
      });
    }
  }

  search(event: any) {
    console.log('search', event.target.value);
    if(this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchText = event.target.value;
      const eventObj = {
        lable: 'searchText',
        text: this.searchText
      };
      this.ping.emit(eventObj);
    }, 700);
  }

  sendPing(ping) {
    const eventObj = { lable: ping };
    this.ping.emit(eventObj);
  }

  filterOff() {
    this.systemService.filterText = '';
    // this.navCtrl.navigateForward(['/customer-table', '']);
  }

  openMenu() {
    this.menu.enable(true, 'menu');
    this.menu.open('menu');
    console.log('menu opend');
  }

  shrinkMenu() {
    console.log('menu shrinked');
    this.systemService.shrinkMenu = !this.systemService.shrinkMenu ;
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

  getClass(path) {
    // console.log('this.router.isActive : ',path, this.router.isActive(path, false) );
    if (this.router.isActive(path, false)) {
      return 'active';
    } else {
      return '';
    }
  }

  updateDashboard() {
    const eventObj = {
      nextAppointmentEnable: this.nextAppointmentEnable,
      customerEnable: this.customerEnable,
      appointmentPlanEnable: this.appointmentPlanEnable
    };
    this.ping.emit(eventObj);
  }

  homePage() {
    this.systemService.customerId = 0;
  }

}
