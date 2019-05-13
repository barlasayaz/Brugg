import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNavComponent} from './main-nav/main-nav.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
	declarations: [//MainNavComponent
    ],
	imports: [ CommonModule
    ],
	exports: [
        IonicModule,
        //MainNavComponent,
        TranslateModule
    ]
})
export class ComponentsModule {}