import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNavComponent } from './main-nav/main-nav.component';
//import { MainNavComponentModule } from './main-nav/main-nav.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { MenubarModule } from 'primeng/menubar';
import { TreeTableModule } from 'primeng/treetable';
import { CustomerEditComponent } from './customer-edit/customer-edit.component';
import { NoteEditComponent } from './note-edit/note-edit.component';
import { ProductOptEditComponent } from './product-opt-edit/product-opt-edit.component';
import { ProtocolOptEditComponent } from './protocol-opt-edit/protocol-opt-edit.component';
import { IonicSelectableModule } from 'ionic-selectable';
import { NfcScanComponent } from './nfc-scan/nfc-scan.component';
import { QrBarcodeComponent } from './qr-barcode/qr-barcode.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
    declarations: [MainNavComponent],
    imports: [IonicModule, TranslateModule,
        CommonModule, RoundProgressModule,
        MenubarModule, TreeTableModule,
        CustomerEditComponent, NoteEditComponent,
        ProductOptEditComponent, ProtocolOptEditComponent,
        IonicSelectableModule, NfcScanComponent,
        QrBarcodeComponent, NgxQRCodeModule],
    exports: [
        //IonicModule,
        MainNavComponent,
        TranslateModule,
        RoundProgressModule,
        MenubarModule,
        TreeTableModule,
        CustomerEditComponent, NoteEditComponent,
        ProductOptEditComponent, ProtocolOptEditComponent,
        IonicSelectableModule, NfcScanComponent,
        QrBarcodeComponent, NgxQRCodeModule
    ]
})
export class ComponentsModule { }