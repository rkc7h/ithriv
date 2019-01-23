import { TimeLeftPipe } from './time-left.pipe';
import {assertEqual} from '@angular/core/src/render3/assert';

describe('TimeLeftPipe', () => {
  it('create an instance', () => {
    const pipe = new TimeLeftPipe();
    expect(pipe).toBeTruthy();
    assertEqual(pipe.transform(1000), 'silly', 'Should be silly.');
  });
});
