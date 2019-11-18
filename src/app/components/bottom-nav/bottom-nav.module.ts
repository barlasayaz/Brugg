import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BottomNavComponent } from './bottom-nav.component';
import { TranslateModule } from '@ngx-translate/core';
import {RoundProgressModule} from 'angular-svg-round-progressbar';

const routes: Routes = [
  {
    path: '',
    component: BottomNavComponent
  }
];

@NgModule({
 // declarations: [BottomNavComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RoundProgressModule,
    RouterModule.forChild(routes),
  ],
  exports: [
  ]
})
export class BottomNavComponentModule {}
