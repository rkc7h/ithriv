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
    const minutes = Math.floor((ms % oneHour) / oneMinute);
    const hours = Math.floor((ms % oneDay) / oneHour);

    let timeString = '';
    timeString += hours + 'h:' + minutes + 'm';
    return timeString;
  }

}
