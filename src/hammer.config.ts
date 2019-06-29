import { Injectable } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';

@Injectable()
export class MyHammerGestureConfig extends HammerGestureConfig  {
  overrides = <any> {
      'tap': { threshold: 70, posTreshold: 10, time: 3000 }, // default 2, 10
     // 'press': { threshold: 50, posTreshold: 2, time: 2500 }, // default 2, 10
      'pan': { threshold: 1000, posTreshold: 2 } // default 2, 10
  };
};