import { Component, Input } from '@angular/core';
import { Platform, NavController, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavigationExtras } from '@angular/router';
import { ApiService } from './services/api';
import { SystemService } from './services/system';
import { UserdataService } from './services/userdata';
import { Router , RouterEvent} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
 
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public apiService: ApiService,
    public systemService: SystemService,
    public userdata: UserdataService,
    private navCtrl: NavController,
    private router: Router,
    public menuCtrl: MenuController
  ) {
    
    this.router.events.subscribe((event: RouterEvent) => {
      console.log('RouterEvent:',event);
      
      if(this.router.isActive("/startscreen", false) ){
        this.menuCtrl.enable(false);
      }if(this.router.isActive("/startscreen", false) ){
        this.menuCtrl.enable(false);
      }else{
        this.menuCtrl.enable(true);
      }
    }); 
    
    this.initializeApp();

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();      
      this.navCtrl.navigateRoot('/login');
    });
  }

  

  getClass(path) {
    //console.log('this.router.isActive : ',path, this.router.isActive(path, false) );
    if (this.router.isActive(path, false)) {
      return 'active';
    } else {
      return '';
    }
  }

  
  shrinkMenu() {
    console.log('menu shrinked');
    this.systemService.shrinkMenu = !this.systemService.shrinkMenu ;
  }

  
}
