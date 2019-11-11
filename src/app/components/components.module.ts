import { NgModule } from '@angular/core';
import { FormsModule, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MainNavComponent } from './main-nav/main-nav.component';
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
import { ChartModule } from 'primeng/chart';
import { ChartPieComponent } from './chart-pie/chart-pie.component';
import { ChartHorizontalComponent } from './chart-horizontal/chart-horizontal.component';

@NgModule({
    declarations: [MainNavComponent,ChartPieComponent, ChartHorizontalComponent,FabDirective],
    imports: [IonicModule, TranslateModule,
        CommonModule, RoundProgressModule,
        MenubarModule, TreeTableModule,
        IonicSelectableModule, NgxQRCodeModule,
        ColorPickerModule,AccordionModule,
        FileUploadModule,DragulaModule,
        SlideMenuModule,ChartModule,FormsModule
        ],
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
        FabDirective,SlideMenuModule,
        ChartModule,
        ChartPieComponent, ChartHorizontalComponent
    ]
})
export class ComponentsModule { }