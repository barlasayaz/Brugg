import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCopyPage } from './product-copy.page';

describe('ProductCopyPage', () => {
  let component: ProductCopyPage;
  let fixture: ComponentFixture<ProductCopyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductCopyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductCopyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
