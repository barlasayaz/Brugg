import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DialogproduktbildmodalPage } from './dialogproduktbildmodal.component';

const routes: Routes = [
  {
    path: '',
    component: DialogproduktbildmodalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
   declarations: [DialogproduktbildmodalPage]
})
export class DialogproduktbildmodalPageModule {}
