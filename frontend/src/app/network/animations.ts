import {
  animate,
  animateChild,
  AnimationTriggerMetadata,
  group,
  query,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

const easing = '500ms ease-in';
const translate = 'translate( {{x}}px, {{y}}px )';
const parked = { opacity: 0, transform: 'scale(0.5) translateX(-50%) translateY(-50%)' };


export function childPositionTransition(): AnimationTriggerMetadata {
  return trigger('childState', [
    state('primary', style({
      transform: `${translate} scale(1.5)`,
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('secondary', style({
      transform: `scale(1) ${translate}`,
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('tertiary', style({
      transform: `scale(0.25) ${translate}`,
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('nary', style({
      transform: `scale(0) ${translate}`,
      opacity: 0
    }), { params: { x: 0, y: 0 } }),
    transition('* <=> *', [
      group([
        query('@grandchildState', animateChild(), { optional: true }),
        animate(easing),
      ])
    ]),
  ]);
}

export function grandchildPositionTransition(): AnimationTriggerMetadata {
  return trigger('grandchildState', [
    state('primary', style({
      transform: `scale(1.5) ${translate}`,
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('secondary', style({
      transform: `scale(.75) ${translate}`,
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('tertiary', style({
      transform: `scale(0.25) ${translate}`,
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('nary', style({
      transform: `scale(0) ${translate}`,
      opacity: 0
    }), { params: { x: 0, y: 0 } }),
    transition('* <=> *', animate(easing))
  ]);
}

export function rootTransition(): AnimationTriggerMetadata {
  return trigger('rootState', [
    state('root', style({
      transform: `${translate}`,
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('child', style({
      transform: `${translate}`,
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('parked', style(parked), { params: { x: 0, y: 0 } }),
    transition('* <=> *', [
      group([
        query('@childState', animateChild(), { optional: true }),
        animate(easing)
      ])
    ]),
  ]);
}

export function menuTransition(): AnimationTriggerMetadata {
  return trigger('menuState', [
    state('selected', style({
      transform: `${translate}`,
      opacity: 0.2
    }), { params: { x: 0, y: 0 } }),
    state('unselected', style({
      transform: `${translate}`,
      opacity: 1,
    }), { params: { x: 0, y: 0 } }),
    transition('* <=> *', [
      animate(easing)
    ]),
  ]);
}

export function movingTransition(): AnimationTriggerMetadata {
  return trigger('movingTransition', [
    state('initial', style({ opacity: 0.5 })),
    state('moving', style({ opacity: 0 })),
    state('set', style({ opacity: 1 })),
    state('menuDone', style({ opacity: 1 })),
    state('rootDone', style({ opacity: 1 })),
    state('childDone', style({ opacity: 1 })),
    state('grandchildDone', style({ opacity: 1 })),
    transition('* <=> *', [
      animate(easing)
    ]),
  ]);
}
