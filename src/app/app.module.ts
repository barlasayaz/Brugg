import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { SystemService } from './services/system';
import { ApiService } from './services/api';
import { UserdataService } from './services/userdata';
import { FilterPipe } from './components/filter.pipe';
import { LoginPageModule } from './login/login.module';
import { LoginPage } from './login/login.page';
//import { MainNavComponent } from './components/main-nav/main-nav.component';
//import { MainNavComponentModule } from './components/main-nav/main-nav.module';
import { AssignmentPageModule } from './customer-details/assignment/assignment.module';
import { ImprintPageModule } from './login/imprint/imprint.module';
import { DialogproduktbildmodalPageModule } from'./components/dialogproduktbildmodal/dialogproduktbildmodal.module';
import { MyDataEditPageModule } from './my-data/my-data-edit/my-data-edit.module';
import { OrderSendPageModule } from './order-form/order-send/order-send.module';
import { ProductNewPageModule } from'./product-new/product-new.module';
import { SignupPageModule } from './signup/signup.module';
import { AppointmentEditComponentModule } from './components/appointment-edit/appointment-edit.module';
import { ContactPersonPageModule } from'./customer-details/contact-person/contact-person.module';
import { ContactPersonAddressPageModule } from'./customer-details/contact-person-address/contact-person-address.module';
import { ReboxNewPageModule } from'./rebox-new/rebox-new.module';
import { NfcScanComponentModule } from './components/nfc-scan/nfc-scan.module';
import { QrBarcodeComponentModule } from './components/qr-barcode/qr-barcode.module';
import { CustomerEditComponentModule } from './components/customer-edit/customer-edit.module';
import { ProductOptEditComponentModule } from './components/product-opt-edit/product-opt-edit.module';
import { ProtocolOptEditComponentModule } from './components/protocol-opt-edit/protocol-opt-edit.module';
import { DialogObjectNewPageModule } from './order-form/dialog-object-new/dialog-object-new.module';
import { NoteEditComponentModule } from './components/note-edit/note-edit.module';
import { ButtonModule, ColorPickerModule, SharedModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { OrderModule } from 'ngx-order-pipe';
import { FullCalendarModule } from 'ng-fullcalendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TreeTableModule } from 'primeng/treetable';
import { MenubarModule } from 'primeng/menubar';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuModule } from 'primeng/menu';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/components/common/messageservice';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ExcelService } from './services/excel';
import { PdfExportService } from './services/pdf-export';
import { DragulaModule } from 'ng2-dragula';
import { IonicSelectableModule } from 'ionic-selectable';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { ofroot } from './order-form/order-form-root';

import { HomePage } from './home/home';
//import { ComponentsModule } from './components/components.module';

import { Camera } from '@ionic-native/camera/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';

import { AccordionModule } from 'primeng/accordion';
import { ServiceWorkerModule } from '@angular/service-worker'; 
import { environment } from '../environments/environment';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "assets/lang/");
}

@NgModule({
  declarations: [
    AppComponent,
    FilterPipe,
    HomePage/* ,
    MainNavComponent,
    LoginPage */
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    LoginPageModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ColorPickerModule,
    ButtonModule,
    TableModule,
    OrderModule,
    SharedModule,
    FullCalendarModule,
    MultiSelectModule,
    ToggleButtonModule,
    TreeTableModule,
    InputSwitchModule,
    MenuModule,
    MenubarModule,
    TabMenuModule,
    FileUploadModule,
    IonicSelectableModule,
    //ComponentsModule,
    //MainNavComponentModule,
    AssignmentPageModule,
    ImprintPageModule,
    DialogproduktbildmodalPageModule,
    MyDataEditPageModule,
    OrderSendPageModule,
    ProductNewPageModule,
    SignupPageModule,
    AppointmentEditComponentModule,
    ContactPersonPageModule,
    ContactPersonAddressPageModule,
    ReboxNewPageModule,
    ProtocolOptEditComponentModule,
    ProductOptEditComponentModule,
    CustomerEditComponentModule,
    QrBarcodeComponentModule,
    NfcScanComponentModule,
    NoteEditComponentModule,
    DialogObjectNewPageModule,
    AccordionModule,
    NgxQRCodeModule,
    RoundProgressModule,
    DragulaModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
     ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }) 
  ],
  bootstrap: [AppComponent],
  entryComponents: [
   // NoteEditComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: ErrorHandler },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SystemService,
    ApiService,
    UserdataService,
    InAppBrowser,
    ofroot,
    DatePipe,
    MessageService,
    File,
    NFC,
    Ndef,
    FileOpener,
    ExcelService,
    FileTransfer,
    FileTransferObject,
    Camera,
    BarcodeScanner,
    PdfExportService,
    Keyboard
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
