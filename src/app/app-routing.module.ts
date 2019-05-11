import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule} from '@angular/core';
import { IonApp } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { SystemService } from './services/system';
import { ApiService } from './services/api';
import { UserdataService } from './services/userdata';
import { FilterPipe } from './components/filter.pipe';
import { AppComponent } from './app.component';
import { LoginPage } from './login/login.page'; 
import { MainNavComponentModule } from './components/main-nav/main-nav.module';
import { DashboardNewPage } from './dashboard-new/dashboard-new.page';
import { SignupPage } from './signup/signup.page';
import { StartscreenNewPage } from './startscreen-new/startscreen-new.page';
import { SinglefilterPage } from './singlefilter/singlefilter.page';
import { StatistikPage } from './statistik/statistik.page';
import { AppointmentPlanPage } from './appointment-plan/appointment-plan.page';


import { ButtonModule,  ColorPickerModule, SharedModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { OrderModule } from 'ngx-order-pipe';
import { FullCalendarModule } from 'ng-fullcalendar';
import { MultiSelectModule} from 'primeng/multiselect';
import { ToggleButtonModule} from 'primeng/togglebutton';
import { TreeTableModule } from 'primeng/treetable';
import { MenubarModule } from 'primeng/menubar';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuModule } from 'primeng/menu';
import {InputSwitchModule} from 'primeng/inputswitch';
import { IonicModule } from '@ionic/angular';
import {RoundProgressModule} from 'angular-svg-round-progressbar';

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

import { CustomerTablePage } from './customer-table/customer-table.page';
import { CustomerDetailsPage } from './customer-details/customer-details.page';
import { ProductListPage } from './product-list/product-list.page';
import { ProductDetailsPage } from './product-details/product-details.page';
import { ProtocolListPage } from './protocol-list/protocol-list.page';
import { ProtocolDetailsPage } from './protocol-details/protocol-details.page';
import { NoteListPage } from './note-list/note-list.page';
import { NoteDetailsPage } from './note-details/note-details.page';
import { ProductTemplatePage } from './product-template/product-template.page'; 
import { ProductEditPage  } from './product-edit/product-edit.page';
import { ProtocolTemplatePage } from './protocol-template/protocol-template.page'; 
import { ProtocolEditPage  } from './protocol-edit/protocol-edit.page';
import { ofroot } from './order-form/order-form-root';
import { OrderFormPage } from './order-form/order-form.page';
import { HomePage } from './home/home';
import { ComponentsModule } from './components/components.module';
import { MyDataPage } from './my-data/my-data.page';
import { Camera } from '@ionic-native/camera/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ProtocolHistoryPage } from './protocol-history/protocol-history.page';
import { AccordionModule } from 'primeng/accordion';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "assets/lang/");
}


const routes: Routes = [
  { path: '', loadChildren: './customer-table/customer-table.module#CustomerTablePageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'statistik', loadChildren: './statistik/statistik.module#StatistikPageModule' },
  { path: 'startscreen-new', loadChildren: './startscreen-new/startscreen-new.module#StartscreenNewPageModule' },
  { path: 'my-data', loadChildren: './my-data/my-data.module#MyDataPageModule' },
  { path: 'my-data-edit', loadChildren: './my-data/my-data-edit/my-data-edit.module#MyDataEditPageModule' },
  { path: 'appointment-plan', loadChildren: './appointment-plan/appointment-plan.module#AppointmentPlanPageModule' },
  { path: 'customer-details', loadChildren: './customer-details/customer-details.module#CustomerDetailsPageModule' },
  { path: 'contact-person', loadChildren: './customer-details/contact-person/contact-person.module#ContactPersonPageModule' },
  { path: 'contact-person-address', loadChildren: './customer-details/contact-person-address/contact-person-address.module#ContactPersonAddressPageModule' },
  { path: 'customer-table', loadChildren: './customer-table/customer-table.module#CustomerTablePageModule' },
  { path: 'dashboard-new', loadChildren: './dashboard-new/dashboard-new.module#DashboardNewPageModule' },
  { path: 'imprint', loadChildren: './login/imprint/imprint.module#ImprintPageModule' },
  { path: 'note-details', loadChildren: './note-details/note-details.module#NoteDetailsPageModule' },
  { path: 'note-list', loadChildren: './note-list/note-list.module#NoteListPageModule' },
  { path: 'order-form', loadChildren: './order-form/order-form.module#OrderFormPageModule' },
  { path: 'order-send', loadChildren: './order-form/order-send/order-send.module#OrderSendPageModule' },
  { path: 'dialog-object-new', loadChildren: './order-form/dialog-object-new/dialog-object-new.module#DialogObjectNewPageModule' },
  { path: 'product-details', loadChildren: './product-details/product-details.module#ProductDetailsPageModule' },
  { path: 'product-edit', loadChildren: './product-edit/product-edit.module#ProductEditPageModule' },
  { path: 'product-list', loadChildren: './product-list/product-list.module#ProductListPageModule' },
  { path: 'product-migration', loadChildren: './product-migration/product-migration.module#ProductMigrationPageModule' },
  { path: 'product-new', loadChildren: './product-new/product-new.module#ProductNewPageModule' },
  { path: 'product-template', loadChildren: './product-template/product-template.module#ProductTemplatePageModule' },
  { path: 'protocol-details', loadChildren: './protocol-details/protocol-details.module#ProtocolDetailsPageModule' },
  { path: 'protocol-edit', loadChildren: './protocol-edit/protocol-edit.module#ProtocolEditPageModule' },
  { path: 'protocol-history', loadChildren: './protocol-history/protocol-history.module#ProtocolHistoryPageModule' },
  { path: 'protocol-list', loadChildren: './protocol-list/protocol-list.module#ProtocolListPageModule' },
  { path: 'protocol-template', loadChildren: './protocol-template/protocol-template.module#ProtocolTemplatePageModule' },
  { path: 'rebox-new', loadChildren: './rebox-new/rebox-new.module#ReboxNewPageModule' },
  { path: 'signup', loadChildren: './signup/signup.module#SignupPageModule' },
  { path: 'singlefilter', loadChildren: './singlefilter/singlefilter.module#SinglefilterPageModule' },
  { path: 'appointment-edit', loadChildren: './components/appointment-edit/appointment-edit.module#AppointmentEditComponentModule' },
  { path: 'customer-edit', loadChildren: './components/customer-edit/customer-edit.module#CustomerEditComponentModule' },
  { path: 'dialogproduktbildmodal', loadChildren: './components/dialogproduktbildmodal/dialogproduktbildmodal.module#DialogproduktbildmodalPageModule' },
  //{ path: 'main-nav', loadChildren: './components/main-nav/main-nav.module#MainNavComponentModule' },
  { path: 'nfc-scan', loadChildren: './components/nfc-scan/nfc-scan.module#NfcScanComponentModule' },
  { path: 'note-edit', loadChildren: './components/note-edit/note-edit.module#NoteEditComponentModule' },
  { path: 'product-opt-edit', loadChildren: './components/product-opt-edit/product-opt-edit.module#ProductOptEditComponentModule' },
  { path: 'protocol-opt-edit', loadChildren: './components/protocol-opt-edit/protocol-opt-edit.module#ProtocolOptEditComponentModule' },
  { path: 'qr-barcode', loadChildren: './components/qr-barcode/qr-barcode.module#QrBarcodeComponentModule' }
];
@NgModule({
  declarations: [
    //AppComponent,
    FilterPipe,
    HomePage,
    LoginPage 
  ],
  imports: [
    IonicModule,
    BrowserModule,
    HttpClientModule, 
    BrowserAnimationsModule, 
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
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
    ComponentsModule,
    MainNavComponentModule,
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
    })
  ],
  bootstrap: [IonApp],
  entryComponents: [
    AppComponent,
    LoginPage
    /*DashboardNewPage,
    SignupPage,
    StartscreenNewPage,
    SinglefilterPage,
    CustomerTablePage,
    CustomerDetailsPage,
    ProductListPage,
    ProductDetailsPage,    
    ProtocolListPage,
    ProtocolDetailsPage,
    NoteListPage,
    NoteDetailsPage,
    ProductTemplatePage,
    ProductEditPage,
    ProtocolTemplatePage,
    ProtocolEditPage,
    StatistikPage,
    OrderFormPage,
    MyDataPage,
    AppointmentPlanPage,
    ProtocolHistoryPage*/
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: ErrorHandler},
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
  ]
})
export class AppRoutingModule {}
