import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FilterPipe } from './components/filter.pipe';
import { LoginPageModule } from './login/login.module';

import { ProductMigrationPageModule } from './product-migration/product-migration.module';
import { AssignmentPageModule } from './customer-details/assignment/assignment.module';
import { ImprintPageModule } from './login/imprint/imprint.module';
import { OldBrowserPageModule } from './login/old-browser/old-browser.module';
import { DialogproduktbildmodalPageModule } from'./components/dialogproduktbildmodal/dialogproduktbildmodal.module';
import { MyDataEditPageModule } from './my-data/my-data-edit/my-data-edit.module';
import { OrderSendPageModule } from './order-form/order-send/order-send.module';
import { AppointmentEditComponentModule } from './components/appointment-edit/appointment-edit.module';
import { ContactPersonPageModule } from'./customer-details/contact-person/contact-person.module';
import { ContactPersonAddressPageModule } from'./customer-details/contact-person-address/contact-person-address.module';
import { ReboxPageModule } from'./rebox/rebox.module';
import { NfcScanComponentModule } from './components/nfc-scan/nfc-scan.module';
import { QrBarcodeComponentModule } from './components/qr-barcode/qr-barcode.module';
import { CustomerEditComponentModule } from './components/customer-edit/customer-edit.module';
import { ProductOptEditComponentModule } from './components/product-opt-edit/product-opt-edit.module';
import { ProtocolOptEditComponentModule } from './components/protocol-opt-edit/protocol-opt-edit.module';
import { NoteEditComponentModule } from './components/note-edit/note-edit.module';
import { ProductCopyPageModule } from './product-copy/product-copy.module';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { DragulaModule } from 'ng2-dragula';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "assets/lang/");
}

@NgModule({
  declarations: [
    AppComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LoginPageModule,
    ProductMigrationPageModule,
    AssignmentPageModule,
    ImprintPageModule,
    OldBrowserPageModule,
    DialogproduktbildmodalPageModule,
    MyDataEditPageModule,
    OrderSendPageModule,
    AppointmentEditComponentModule,
    ContactPersonPageModule,
    ContactPersonAddressPageModule,
    ReboxPageModule,
    ProtocolOptEditComponentModule,
    ProductOptEditComponentModule,
    CustomerEditComponentModule,
    QrBarcodeComponentModule,
    NfcScanComponentModule,
    NoteEditComponentModule,
    ProductCopyPageModule,
    DragulaModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [AppComponent],
  entryComponents: [
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: ErrorHandler },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    InAppBrowser,
    DatePipe,
    File,
    NFC,
    Ndef,
    FileOpener,
    FileTransfer,
    FileTransferObject,
    Camera,
    BarcodeScanner,
    Keyboard,
    Geolocation,
    ScreenOrientation
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
