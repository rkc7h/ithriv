import { SpyObject } from './helper.mock';
import Spy = jasmine.Spy;
import { IntervalService } from '../interval/interval.service';

export class MockIntervalService extends SpyObject {
  callback: () => void;

  clearInterval = jasmine.createSpy('clearInterval');

  constructor() {
    super(IntervalService);
  }

  setInterval(callback: () => void, time: number): any {
    this.callback = callback;
    return null;
  }

  tick() {
    this.callback();
  }
}
