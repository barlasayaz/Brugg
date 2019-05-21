import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../components.module';
import { IonicModule } from '@ionic/angular';

import { ProductOptEditComponent } from './product-opt-edit.component';

const routes: Routes = [
  {
    path: '',
    component: ProductOptEditComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProductOptEditComponent]
})
export class ProductOptEditComponentModule {}
