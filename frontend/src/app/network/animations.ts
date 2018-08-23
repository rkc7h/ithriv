import {
  animate,
  animateChild,
  AnimationTriggerMetadata,
  group,
  query,
  sequence, state, style,
  transition,
  trigger
} from '@angular/animations';



export function selectTransition(): AnimationTriggerMetadata {
  return trigger('circleState', [

    state('primary', style({
      transform: 'scale(1.5)'
    })),
    state('secondary',   style({
      transform: 'scale(1)'
    })),
    state('tertiary',   style({
      transform: 'scale(0.25)'
    })),
    state(' n-ary',   style({
      transform: 'scale(0.1)'
    })),
    transition('* => *', animate('600ms ease-in')),
  ]);
}
