import { NgModule } from '@angular/core';
import { MainNavComponentModule } from './main-nav/main-nav.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
	/*declarations: [MainNavComponent
    ],
	imports: [
    ],*/
	exports: [
        IonicModule,
        MainNavComponentModule,
        TranslateModule
    ]
})
export class ComponentsModule {}