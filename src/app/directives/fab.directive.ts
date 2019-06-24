import { Directive,Input,OnInit, ElementRef, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[labelFab]'
})
export class FabDirective implements OnInit {
  @Input() labelFab :string;
  constructor(private translate:TranslateService,
    private elem: ElementRef, private renderer: Renderer2) {

   }

   ngOnInit()
   {
     this.renderer.setAttribute(this.elem.nativeElement,'label-fab', this.translate.instant(this.labelFab));
   }



}
