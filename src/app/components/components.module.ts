import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNavComponent} from './main-nav/main-nav.component';
//import { MainNavComponentModule } from './main-nav/main-nav.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { MenubarModule } from 'primeng/menubar';
import { TreeTableModule } from 'primeng/treetable';

@NgModule({
	declarations: [MainNavComponent],
	imports: [ IonicModule,TranslateModule, CommonModule,RoundProgressModule,MenubarModule,TreeTableModule],
	exports: [
        //IonicModule,
        MainNavComponent,
        TranslateModule,
        RoundProgressModule,
        MenubarModule,
        TreeTableModule
    ]
})
export class ComponentsModule {}