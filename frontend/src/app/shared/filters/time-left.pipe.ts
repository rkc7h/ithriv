import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeLeft'
})
export class TimeLeftPipe implements PipeTransform {

  transform(ms: number): string {
    const oneSecond = 1000;
    const oneMinute = oneSecond * 60;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;
    const h = Math.floor((ms % oneDay) / oneHour);
    const m = Math.floor((ms % oneHour) / oneMinute);
    const s = Math.floor((ms % oneMinute) / oneSecond);
    return `${this._pad(h)}:${this._pad(m)}:${this._pad(s)}`;
  }

  private _pad(n: number): string {
    return n.toLocaleString('en', { minimumIntegerDigits: 2 });
  }


}
