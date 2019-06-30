import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNavComponent } from './main-nav/main-nav.component';
//import { MainNavComponentModule } from './main-nav/main-nav.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { MenubarModule } from 'primeng/menubar';
import { SlideMenuModule } from 'primeng/slideMenu';
import { TreeTableModule } from 'primeng/treetable';
import { IonicSelectableModule } from 'ionic-selectable';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { ColorPickerModule } from 'primeng/primeng';
import { AccordionModule } from 'primeng/accordion';
import { FileUploadModule } from 'primeng/fileupload';
import { DragulaModule } from 'ng2-dragula';
import { FabDirective } from '../directives/fab.directive';

@NgModule({
    declarations: [MainNavComponent,FabDirective],
    imports: [IonicModule, TranslateModule,
        CommonModule, RoundProgressModule,
        MenubarModule, TreeTableModule,
        IonicSelectableModule, NgxQRCodeModule,
        ColorPickerModule,AccordionModule,
        FileUploadModule,DragulaModule,
        SlideMenuModule],
    exports: [
        //IonicModule,
        MainNavComponent,
        TranslateModule,
        RoundProgressModule,
        MenubarModule,
        TreeTableModule,
        IonicSelectableModule,NgxQRCodeModule,
        ColorPickerModule,AccordionModule,
        FileUploadModule,DragulaModule,
        FabDirective,SlideMenuModule
    ]
})
export class ComponentsModule { }