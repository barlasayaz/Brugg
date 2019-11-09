
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DataResolverService } from './services/data-resolver.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'startscreen', loadChildren: './startscreen/startscreen.module#StartscreenPageModule' },
  { path: 'my-data', loadChildren: './my-data/my-data.module#MyDataPageModule' },
  { path: 'my-data-edit', loadChildren: './my-data/my-data-edit/my-data-edit.module#MyDataEditPageModule' },
  { path: 'appointment-plan', loadChildren: './appointment-plan/appointment-plan.module#AppointmentPlanPageModule' },
  { path: 'customer-details/:id', loadChildren: './customer-details/customer-details.module#CustomerDetailsPageModule' },
  { path: 'contact-person', loadChildren: './customer-details/contact-person/contact-person.module#ContactPersonPageModule' },
  { path: 'contact-person-address', loadChildren: './customer-details/contact-person-address/contact-person-address.module#ContactPersonAddressPageModule' },
  { path: 'customer-table/:customerName', loadChildren: './customer-table/customer-table.module#CustomerTablePageModule' },
  { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardPageModule' },
  { path: 'imprint', loadChildren: './login/imprint/imprint.module#ImprintPageModule' },
  { path: 'old-browser', loadChildren: './login/old-browser/old-browser.module#OldBrowserPageModule' },
  { path: 'note-list/:id', loadChildren: './note-list/note-list.module#NoteListPageModule' },
  { path: 'order-form/:id', loadChildren: './order-form/order-form.module#OrderFormPageModule' },
  { path: 'statistics', loadChildren: './statistics/statistics.module#StatisticsPageModule' },
  {
    path: 'product-details',
    resolve: {
      special: DataResolverService
    },
    loadChildren: './product-details/product-details.module#ProductDetailsPageModule'
  },
  {
    path: 'product-edit',
    resolve: {
      special: DataResolverService
    },
    loadChildren: './product-edit/product-edit.module#ProductEditPageModule'
  },
  { path: 'product-list/:id', loadChildren: './product-list/product-list.module#ProductListPageModule' },
  { path: 'product-migration', loadChildren: './product-migration/product-migration.module#ProductMigrationPageModule' },
  {
    path: 'product-template',
    resolve: {
      special: DataResolverService
    },
    loadChildren: './product-template/product-template.module#ProductTemplatePageModule'
  },
  {
    path: 'protocol-details/:id',
    resolve: {
      special: DataResolverService
    },
    loadChildren: './protocol-details/protocol-details.module#ProtocolDetailsPageModule'
  },
  {
    path: 'protocol-edit',
    resolve: {
      special: DataResolverService
    },
    loadChildren: './protocol-edit/protocol-edit.module#ProtocolEditPageModule'
  },
  {
    path: 'protocol-history',
    resolve: {
      special: DataResolverService
    },
    loadChildren: './protocol-history/protocol-history.module#ProtocolHistoryPageModule'
  },
  { path: 'protocol-list/:id', loadChildren: './protocol-list/protocol-list.module#ProtocolListPageModule' },
  {
    path: 'protocol-template',
    resolve: {
      special: DataResolverService
    },
    loadChildren: './protocol-template/protocol-template.module#ProtocolTemplatePageModule'
  },
  { path: 'rebox', loadChildren: './rebox/rebox.module#ReboxPageModule' },
  { path: 'product-copy', loadChildren: './product-copy/product-copy.module#ProductCopyPageModule' },
  {
    path: 'note-details',
    resolve: {
      special: DataResolverService
    },
    loadChildren: './note-details/note-details.module#NoteDetailsPageModule'
  },
  { path: 'statistics', loadChildren: './statistics/statistics.module#StatisticsPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
