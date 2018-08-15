import {
  animate,
  animateChild,
  group,
  query,
  sequence,
  style,
  transition,
  trigger,
  AnimationTriggerMetadata,
  state
} from '@angular/animations';

const easing = '0.5s ease-in-out';
const hide = style({ opacity: 0 });
const show = style({ opacity: 1 });
const transitionOut = [show, animate(easing, hide)];
const transitionIn = [hide, animate(easing, show)];
const optional = { optional: true };

export function fadeTransition(): AnimationTriggerMetadata {
  return trigger('fadeTransition', [
    transition('* <=> *', [
      query(':enter, :leave', show, optional),
      query(':enter', hide, optional),
      sequence([
        query(':leave', animateChild(), optional),
        group([
          query(':leave', transitionOut, optional),
          query(':enter', transitionIn, optional),
        ]),
        query(':enter', animateChild(), optional),
      ])
    ])
  ]);
}

export function slideTransition(): AnimationTriggerMetadata {
  return trigger('slideTransition', [
    transition('* <=> *', [
      query(':enter, :leave',
        style({ position: 'fixed', width: '100%' }), optional),
      group([
        query(':enter', [
          style({ transform: 'translateX(100%)' }),
          animate(easing, style({ transform: 'translateX(0%)' }))
        ], optional),
        query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate(easing, style({ transform: 'translateX(-100%)' }))
        ], optional),
      ])
    ])
  ]);
}

export function zoomTransition(): AnimationTriggerMetadata {
  const normal = { opacity: 1, transform: 'translateX(0) scale(1)' };
  const zoomedOut = { opacity: 0, transform: 'translateX(0) scale(0)' };
  const zoomedIn = { opacity: 0, transform: 'translateX(0) scale(100)' };
  return trigger('zoomTransition', [

    // Zoom in
    transition(':increment', group([
      query(':enter', [
        style(zoomedOut),
        animate(easing, style(normal))
      ]),
      query(':leave', [
        style(normal),
        animate(easing, style(zoomedIn))
      ])
    ])),

    // Zoom out
    transition(':decrement', group([
      query(':enter', [
        style(zoomedIn),
        animate(easing, style(normal))
      ]),
      query(':leave', [
        style(normal),
        animate(easing, style(zoomedOut))
      ])
    ]))
  ]);
}
