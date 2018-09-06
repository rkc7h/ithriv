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
const duration = 500;
const easing = `${duration}ms ease-in-out`;
const translate = 'translate( {{x}}px, {{y}}px )';
const defaultParams = { params: { x: 0, y: 0 } };

const shown = {
  transform: `${translate}`,
  opacity: 1
};

const parked = {
  transform: 'translate(-200px, -200px) scale(0)',
  opacity: 0
};

const lineHidden = { opacity: 0, transform: 'scale(0)' };
const lineShown = { opacity: 1, transform: 'scale(1)' };
const lineEasing = `${duration}ms ease-in-out`;
const v_to_h: string[] = [
  'root => void',
  'root => parked',
  'root => nary',
  'child => void',
  'child => parked',
  'child => nary',
  'primary => void',
  'primary => parked',
  'primary => nary',
  'secondary => void',
  'secondary => parked',
  'secondary => nary',
  'tertiary => void',
  'tertiary => parked',
  'tertiary => nary'
];
const h_to_h: string[] = [
  'void => void',
  'void => parked',
  'void => nary',
  'parked => void',
  'parked => parked',
  'parked => nary',
  'nary => void',
  'nary => parked',
  'nary => nary'
];
const h_to_v: string[] = [
  'void => root',
  'parked => root',
  'nary => root',
  'void => child',
  'parked => child',
  'nary => child',
  'void => primary',
  'parked => primary',
  'nary => primary',
  'void => secondary',
  'parked => secondary',
  'nary => secondary',
  'void => tertiary',
  'parked => tertiary',
  'nary => tertiary'
];
const v_to_v: string[] = [
  'root => root',
  'root => child',
  'root => primary',
  'root => secondary',
  'root => tertiary',
  'child => root',
  'child => child',
  'child => primary',
  'child => secondary',
  'child => tertiary',
  'primary => root',
  'primary => child',
  'primary => primary',
  'primary => secondary',
  'primary => tertiary',
  'secondary => root',
  'secondary => child',
  'secondary => primary',
  'secondary => secondary',
  'secondary => tertiary',
  'tertiary => root',
  'tertiary => child',
  'tertiary => primary',
  'tertiary => secondary',
  'tertiary => tertiary'
];

const v_to_h_str = v_to_h.join(', ');
const h_to_h_str = h_to_h.join(', ');
const h_to_v_str = h_to_v.join(', ');
const v_to_v_str = v_to_v.join(', ');

export function menuTransition(): AnimationTriggerMetadata {
  return trigger('menuState', [
    state('selected', style({
      transform: `${translate}`,
      opacity: 0.2
    }), defaultParams),
    state('unselected', style({
      transform: `${translate}`,
      opacity: 1,
    }), defaultParams),
    transition('* => *', [
      animate(easing)
    ]),
  ]);
}
export function rootTransition(): AnimationTriggerMetadata {
  return trigger('rootState', [
    state('root', style(shown), defaultParams),
    state('child', style(shown), defaultParams),
    state('parked', style(parked), defaultParams),
    transition('* => *', [
      group([
        query('@lineState', animateChild(), { optional: true }),
        query('@childState', animateChild(), { optional: true }),
        animate(easing)
      ])
    ])
  ]);
}

export function childPositionTransition(): AnimationTriggerMetadata {
  return trigger('childState', [
    state('primary', style({
      transform: `${translate} scale(1.5)`,
      opacity: 1
    }), defaultParams),
    state('secondary', style({
      transform: `scale(1) ${translate}`,
      opacity: 1
    }), defaultParams),
    state('tertiary', style({
      transform: `scale(0.25) ${translate}`,
      opacity: 1
    }), defaultParams),
    state('nary', style({
      transform: `scale(0) ${translate}`,
      opacity: 0
    }), defaultParams),
    transition('* => *', [
      group([
        query('@lineState', animateChild(), { optional: true }),
        query('@grandchildState', animateChild(), { optional: true }),
        animate(easing)
      ])
    ]),
  ]);
}

export function grandchildPositionTransition(): AnimationTriggerMetadata {
  return trigger('grandchildState', [
    state('primary', style({
      transform: `scale(1.5) ${translate}`,
      opacity: 1
    }), defaultParams),
    state('secondary', style({
      transform: `scale(.75) ${translate}`,
      opacity: 1
    }), defaultParams),
    state('tertiary', style({
      transform: `scale(0.25) ${translate}`,
      opacity: 1
    }), defaultParams),
    state('nary', style({
      transform: `scale(0) ${translate}`,
      opacity: 0
    }), defaultParams),
    transition('* => *', [
      animate(easing)
    ]),
  ]);
}

export function lineTransition(): AnimationTriggerMetadata {
  return trigger('lineState', [
    state('root', style(lineShown)),
    state('child', style(lineShown)),
    state('parked', style(lineHidden)),
    state('primary', style(lineShown)),
    state('secondary', style(lineShown)),
    state('tertiary', style(lineShown)),
    state('nary', style(lineHidden)),
    transition(v_to_h_str, [
      animate(lineEasing, keyframes([
        style(lineShown),
        style(lineHidden)
      ]))
    ]),
    transition(h_to_h_str, [
      animate(lineEasing, keyframes([
        style(lineHidden)
      ]))
    ]),
    transition(h_to_v_str, [
      animate(lineEasing, keyframes([
        style(lineHidden),
        style(lineShown)
      ]))
    ]),
    transition(v_to_v_str, [
      animate(lineEasing, keyframes([
        style(lineHidden),
        style(lineShown)
      ]))
    ])
  ]);
}
