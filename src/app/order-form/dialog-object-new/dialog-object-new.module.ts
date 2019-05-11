import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DialogObjectNewPage } from './dialog-object-new.page';

const routes: Routes = [
  {
    path: '',
    component: DialogObjectNewPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DialogObjectNewPage]
})
export class DialogObjectNewPageModule {}
