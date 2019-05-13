import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNavComponent} from './main-nav/main-nav.component';
//import { MainNavComponentModule } from './main-nav/main-nav.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

@NgModule({
	declarations: [MainNavComponent],
	imports: [ IonicModule,TranslateModule, CommonModule,RoundProgressModule],
	exports: [
        //IonicModule,
        MainNavComponent,
        TranslateModule,
        RoundProgressModule
    ]
})
export class ComponentsModule {}