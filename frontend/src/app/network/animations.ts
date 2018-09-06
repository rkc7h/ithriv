import {
  animate,
  animateChild,
  AnimationTriggerMetadata,
  group,
  query,
  state,
  style,
  transition,
  trigger,
  keyframes
} from '@angular/animations';

export function menuTransition(): AnimationTriggerMetadata {
  return trigger('menuState', [
    state('selected', style({
      transform: 'translate( {{x}}px, {{y}}px )',
      opacity: 0.2
    }), { params: { x: 0, y: 0 } }),
    state('unselected', style({
      transform: 'translate( {{x}}px, {{y}}px )',
      opacity: 1,
    }), { params: { x: 0, y: 0 } }),
    transition('* => *', [
      animate('500ms ease-in-out')
    ]),
  ]);
}
export function rootTransition(): AnimationTriggerMetadata {
  return trigger('rootState', [
    state('root', style({
      transform: 'translate( {{x}}px, {{y}}px',
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('child', style({
      transform: 'translate( {{x}}px, {{y}}px',
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('parked', style({
      transform: 'translate(-200px, -200px) scale(0)',
      opacity: 0
    }), { params: { x: 0, y: 0 } }),
    transition('* => *', [
      group([
        query('@lineState', animateChild(), { optional: true }),
        query('@childState', animateChild(), { optional: true }),
        animate('500ms ease-in-out')
      ])
    ])
  ]);
}

export function childPositionTransition(): AnimationTriggerMetadata {
  return trigger('childState', [
    state('primary', style({
      transform: 'translate( {{x}}px, {{y}}px ) scale(1.5)',
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('secondary', style({
      transform: 'scale(1) translate( {{x}}px, {{y}}px )',
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('tertiary', style({
      transform: 'scale(0.25) translate( {{x}}px, {{y}}px )',
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('nary', style({
      transform: 'scale(0) translate( {{x}}px, {{y}}px )',
      opacity: 0
    }), { params: { x: 0, y: 0 } }),
    transition('* => *', [
      group([
        query('@lineState', animateChild(), { optional: true }),
        query('@grandchildState', animateChild(), { optional: true }),
        animate('500ms ease-in-out')
      ])
    ]),
  ]);
}

export function grandchildPositionTransition(): AnimationTriggerMetadata {
  return trigger('grandchildState', [
    state('primary', style({
      transform: 'scale(1.5) translate( {{x}}px, {{y}}px )',
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('secondary', style({
      transform: 'scale(.75) translate( {{x}}px, {{y}}px )',
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('tertiary', style({
      transform: 'scale(0.25) translate( {{x}}px, {{y}}px )',
      opacity: 1
    }), { params: { x: 0, y: 0 } }),
    state('nary', style({
      transform: 'scale(0) translate( {{x}}px, {{y}}px )',
      opacity: 0
    }), { params: { x: 0, y: 0 } }),
    transition('* => *', [
      animate('500ms ease-in-out')
    ]),
  ]);
}

export function lineTransition(): AnimationTriggerMetadata {
  return trigger('lineState', [
    state('root', style({ opacity: 1, transform: 'scale(1)' })),
    state('child', style({ opacity: 1, transform: 'scale(1)' })),
    state('parked', style({ opacity: 0, transform: 'scale(0)' })),
    state('primary', style({ opacity: 1, transform: 'scale(1)' })),
    state('secondary', style({ opacity: 1, transform: 'scale(1)' })),
    state('tertiary', style({ opacity: 1, transform: 'scale(1)' })),
    state('nary', style({ opacity: 0, transform: 'scale(0)' })),
    transition(
      'root => void, root => parked, root => nary, child => void, ' +
      'child => parked, child => nary, primary => void, primary => parked, ' +
      'primary => nary, secondary => void, secondary => parked, ' +
      'secondary => nary, tertiary => void, tertiary => parked, tertiary => nary', [
        animate('500ms ease-in-out', keyframes([
          style({ opacity: 1, transform: 'scale(1)' }),
          style({ opacity: 0, transform: 'scale(0)' })
        ]))
      ]),
    transition(
      'void => void, void => parked, void => nary, parked => void, ' +
      'parked => parked, parked => nary, nary => void, nary => parked, ' +
      'nary => nary', [
        animate('500ms ease-in-out', keyframes([
          style({ opacity: 0, transform: 'scale(0)' })
        ]))
      ]),
    transition('void => root, parked => root, nary => root, void => child, ' +
      'parked => child, nary => child, void => primary, parked => primary, ' +
      'nary => primary, void => secondary, parked => secondary, ' +
      'nary => secondary, void => tertiary, parked => tertiary, ' +
      'nary => tertiary', [
        animate('500ms ease-in-out', keyframes([
          style({ opacity: 0, transform: 'scale(0)' }),
          style({ opacity: 1, transform: 'scale(1)' })
        ]))
      ]),
    transition('root => root, root => child, root => primary, root => secondary, ' +
      'root => tertiary, child => root, child => child, child => primary, ' +
      'child => secondary, child => tertiary, primary => root, ' +
      'primary => child, primary => primary, primary => secondary, ' +
      'primary => tertiary, secondary => root, secondary => child, ' +
      'secondary => primary, secondary => secondary, secondary => tertiary, ' +
      'tertiary => root, tertiary => child, tertiary => primary, ' +
      'tertiary => secondary, tertiary => tertiary', [
        animate('500ms ease-in-out', keyframes([
          style({ opacity: 0, transform: 'scale(0)' }),
          style({ opacity: 1, transform: 'scale(1)' })
        ]))
      ])
  ]);
}
