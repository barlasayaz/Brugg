import { NgModule } from '@angular/core';
import { MainNavComponent } from './main-nav/main-nav.component';
import { CustomerEditComponent } from './customer-edit/customer-edit.component';
import { NoteEditComponent} from './note-edit/note-edit.component';
import { ProductOptEditComponent } from './product-opt-edit/product-opt-edit.component';
import { ProtocolOptEditComponent } from './protocol-opt-edit/protocol-opt-edit.component';
import { IonicModule } from '@ionic/angular';
import { AppointmentEditComponent } from './appointment-edit/appointment-edit.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { ColorPickerModule } from 'primeng/primeng';
import { IonicSelectableModule } from 'ionic-selectable';
import { NfcScanComponent } from './nfc-scan/nfc-scan.component';
import { TableModule } from 'primeng/table';
import { QrBarcodeComponent } from './qr-barcode/qr-barcode.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "assets/lang/");
  }
@NgModule({
	declarations: [
        //MainNavComponent,
        //CustomerEditComponent,
        //NoteEditComponent,
        //ProtocolOptEditComponent,
        //ProductOptEditComponent,
        //AppointmentEditComponent,
        //NfcScanComponent,
        //QrBarcodeComponent
    ],
	imports: [
        IonicModule,
        ColorPickerModule,
        IonicSelectableModule,
        TableModule,
        NgxQRCodeModule,
        TranslateModule.forChild({
            loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient]
            }
          })
    ],
	exports: [
        //MainNavComponent,
        //CustomerEditComponent,
        //NoteEditComponent,
        //ProtocolOptEditComponent,
        //ProductOptEditComponent,
        //AppointmentEditComponent,
        //NfcScanComponent,
        //QrBarcodeComponent
    ]
})
export class ComponentsModule {}