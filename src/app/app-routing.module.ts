
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'startscreen-new', loadChildren: './startscreen-new/startscreen-new.module#StartscreenNewPageModule' },
  { path: 'my-data', loadChildren: './my-data/my-data.module#MyDataPageModule' },
  { path: 'my-data-edit', loadChildren: './my-data/my-data-edit/my-data-edit.module#MyDataEditPageModule' },
  { path: 'appointment-plan', loadChildren: './appointment-plan/appointment-plan.module#AppointmentPlanPageModule' },
  { path: 'customer-details/:id', loadChildren: './customer-details/customer-details.module#CustomerDetailsPageModule' },
  { path: 'contact-person', loadChildren: './customer-details/contact-person/contact-person.module#ContactPersonPageModule' },
  { path: 'contact-person-address', loadChildren: './customer-details/contact-person-address/contact-person-address.module#ContactPersonAddressPageModule' },
  { path: 'customer-table', loadChildren: './customer-table/customer-table.module#CustomerTablePageModule' },
  { path: 'dashboard-new', loadChildren: './dashboard-new/dashboard-new.module#DashboardNewPageModule' },
  { path: 'imprint', loadChildren: './login/imprint/imprint.module#ImprintPageModule' },
  { path: 'note-details/:id', loadChildren: './note-details/note-details.module#NoteDetailsPageModule' },
  { path: 'note-list/:id', loadChildren: './note-list/note-list.module#NoteListPageModule' },
  { path: 'order-form-new/:id', loadChildren: './order-form-new/order-form-new.module#OrderFormNewPageModule' },
  { path: 'product-details/:id', loadChildren: './product-details/product-details.module#ProductDetailsPageModule' },
  { path: 'product-edit', loadChildren: './product-edit/product-edit.module#ProductEditPageModule' },
  { path: 'product-list/:id', loadChildren: './product-list/product-list.module#ProductListPageModule' },
  { path: 'product-migration', loadChildren: './product-migration/product-migration.module#ProductMigrationPageModule' },
  { path: 'product-new', loadChildren: './product-new/product-new.module#ProductNewPageModule' },
  { path: 'product-template', loadChildren: './product-template/product-template.module#ProductTemplatePageModule' },
  { path: 'protocol-details/:id', loadChildren: './protocol-details/protocol-details.module#ProtocolDetailsPageModule' },
  { path: 'protocol-edit', loadChildren: './protocol-edit/protocol-edit.module#ProtocolEditPageModule' },
  { path: 'protocol-history', loadChildren: './protocol-history/protocol-history.module#ProtocolHistoryPageModule' },
  { path: 'protocol-list/:id', loadChildren: './protocol-list/protocol-list.module#ProtocolListPageModule' },
  { path: 'protocol-template', loadChildren: './protocol-template/protocol-template.module#ProtocolTemplatePageModule' },
  { path: 'rebox-new', loadChildren: './rebox-new/rebox-new.module#ReboxNewPageModule' },
  { path: 'signup', loadChildren: './signup/signup.module#SignupPageModule' },
  // ,{ path: 'appointment-edit', loadChildren: './components/appointment-edit/appointment-edit.module#AppointmentEditComponentModule' },
  // { path: 'customer-edit', loadChildren: './components/customer-edit/customer-edit.module#CustomerEditComponentModule' },
  // { path: 'dialogproduktbildmodal', loadChildren: './components/dialogproduktbildmodal/dialogproduktbildmodal.module#DialogproduktbildmodalPageModule' },
  // { path: 'nfc-scan', loadChildren: './components/nfc-scan/nfc-scan.module#NfcScanComponentModule' },
  // { path: 'note-edit', loadChildren: './components/note-edit/note-edit.module#NoteEditComponentModule' },
  // { path: 'product-opt-edit', loadChildren: './components/product-opt-edit/product-opt-edit.module#ProductOptEditComponentModule' },
  // { path: 'protocol-opt-edit', loadChildren: './components/protocol-opt-edit/protocol-opt-edit.module#ProtocolOptEditComponentModule' },
  // { path: 'qr-barcode', loadChildren: './components/qr-barcode/qr-barcode.module#QrBarcodeComponentModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    FormsModule, ReactiveFormsModule,
  ],
  exports: [RouterModule]
})

export class AppRoutingModule {}
