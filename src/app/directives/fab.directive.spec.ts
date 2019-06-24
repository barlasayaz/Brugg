import { FabDirective } from './fab.directive';
import { TranslateService } from '@ngx-translate/core';
import { Directive, Input, OnInit, ElementRef, Renderer2 } from '@angular/core';

describe('FabDirective', () => {
  it('should create an instance', () => {
    let translate: TranslateService;
    let elem: ElementRef, renderer: Renderer2
    const directive = new FabDirective(translate, elem, renderer);
    expect(directive).toBeTruthy();
  });
});
