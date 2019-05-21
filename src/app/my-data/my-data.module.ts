import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../components/components.module';
import { IonicModule } from '@ionic/angular';
import { OrderModule } from 'ngx-order-pipe';
import { MyDataPage } from './my-data.page';

const routes: Routes = [
  {
    path: '',
    component: MyDataPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    OrderModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MyDataPage]
})
export class MyDataPageModule {}
