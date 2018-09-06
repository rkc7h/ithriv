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
​
const duration = 500;
const easing = `${duration}ms ease-in-out`;
const translate = 'translate( {{x}}px, {{y}}px )';
const defaultParams = { params: { x: 0, y: 0 } };
​
const shown = style({
  transform: `${translate}`,
  opacity: 1
});
​
const parked = style({
  transform: 'translate(-200px, -200px) scale(0)',
  opacity: 0
});
​
const lineHidden = style({ opacity: 0, transform: 'scale(0)' });
const lineShown = style({ opacity: 1, transform: 'scale(1)' });
const lineEasing = `${duration * 2}ms ease-in-out`;
const hStates = ['void', 'parked', 'nary'];
const vStates = ['root', 'child', 'primary', 'secondary', 'tertiary'];
const v_to_h: string[] = [];
const h_to_h: string[] = [];
const h_to_v: string[] = [];
const v_to_v: string[] = [];
​
hStates.forEach(h1 => hStates.forEach(h2 => h_to_h.push(`${h1} => ${h2}`)));
vStates.forEach(v1 => {
  hStates.forEach(h => {
    v_to_h.push(`${v1} => ${h}`);
    h_to_v.push(`${h} => ${v1}`);
  });
  vStates.forEach(v2 => v_to_v.push(`${v1} => ${v2}`));
});
​
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
​
​
export function rootTransition(): AnimationTriggerMetadata {
  return trigger('rootState', [
    state('root', shown, defaultParams),
    state('child', shown, defaultParams),
    state('parked', parked, defaultParams),
    transition('* => *', [
      group([
        query('@lineState', animateChild(), { optional: true }),
        query('@childState', animateChild(), { optional: true }),
        animate(easing)
      ])
    ])
  ]);
}
​
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
​
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
​
export function lineTransition(): AnimationTriggerMetadata {
  return trigger('lineState', [
    state('root', lineShown),
    state('child', lineShown),
    state('parked', lineHidden),
    state('primary', lineShown),
    state('secondary', lineShown),
    state('tertiary', lineShown),
    state('nary', lineHidden),
    transition(v_to_h.join(', '), [
      animate(lineEasing, keyframes([
        lineShown,
        lineHidden
      ]))
    ]),
    transition(h_to_h.join(', '), [
      animate(lineEasing, keyframes([
        lineHidden
      ]))
    ]),
    transition(h_to_v.join(', '), [
      animate(lineEasing, keyframes([
        lineHidden,
        lineShown
      ]))
    ]),
    transition(v_to_v.join(', '), [
      animate(lineEasing, keyframes([
        lineHidden,
        lineShown
      ]))
    ])
  ]);
}
