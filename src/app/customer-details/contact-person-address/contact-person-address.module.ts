import { AccordionModule } from 'primeng/accordion';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ContactPersonAddressPage } from './contact-person-address.page';

const routes: Routes = [
  {
    path: '',
    component: ContactPersonAddressPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ContactPersonAddressPage]
})
export class ContactPersonAddressPageModule {}
