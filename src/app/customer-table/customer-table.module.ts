import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../components/components.module';
import { IonicModule } from '@ionic/angular';
import { MainNavComponentModule } from '../components/main-nav/main-nav.module';
import { CustomerTablePage } from './customer-table.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerTablePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MainNavComponentModule,
    ComponentsModule
  ],
  declarations: [CustomerTablePage]
})
export class CustomerTablePageModule {}
