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
const delay = { delay: `${duration}ms` };
const easing = `${duration}ms ease-in-out`;
const translate = 'translate( {{x}}px, {{y}}px )';
const defaultParams = { params: { x: 0, y: 0 } };

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
    transition('* <=> *', [
      animate(easing)
    ]),
  ]);
}


export function rootTransition(): AnimationTriggerMetadata {
  const shown = style({
    transform: `${translate}`,
    opacity: 1
  });

  return trigger('rootState', [
    state('root', shown, defaultParams),
    state('child', shown, defaultParams),
    state('parked', style({
      opacity: 0, transform: 'scale(0) translateX(-80%) translateY(-100%)'
    }), defaultParams),
    transition('* <=> *', [
      group([
        animate(easing),
        query('@lineState', animateChild(), { optional: true }),
        query('@childState', animateChild(delay), { optional: true })
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
    transition('* <=> *', [
      group([
        query('@lineState', animateChild(), { optional: true }),
        query('@grandchildState', animateChild(delay), { optional: true }),
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
    transition('* <=> *', [
      animate(easing)
    ]),
  ]);
}

export function lineTransition(): AnimationTriggerMetadata {
  const hidden = style({ opacity: 0, transform: 'scale(0)' });
  const shown = style({ opacity: 1, transform: 'scale(1)' });

  const hStates = ['void', 'parked', 'nary'];
  const vStates = ['root', 'child', 'primary', 'secondary', 'tertiary'];
  const v_to_h: string[] = [];
  const h_to_h: string[] = [];
  const h_to_v: string[] = [];
  const v_to_v: string[] = [];

  hStates.forEach(h1 => hStates.forEach(h2 => h_to_h.push(`${h1} => ${h2}`)));
  vStates.forEach(v1 => {
    hStates.forEach(h => {
      v_to_h.push(`${v1} => ${h}`);
      h_to_v.push(`${h} => ${v1}`);
    });
    vStates.forEach(v2 => v_to_v.push(`${v1} => ${v2}`));
  });

  return trigger('lineState', [
    state('root', shown),
    state('child', shown),
    state('parked', hidden),
    state('primary', shown),
    state('secondary', shown),
    state('tertiary', shown),
    state('nary', hidden),
    transition(v_to_h.join(', '), [
      animate('2s ease-in-out', keyframes([
        shown,
        hidden
      ]))
    ]),
    transition(h_to_h.join(', '), [
      animate('2s ease-in-out', keyframes([
        hidden
      ]))
    ]),
    transition(h_to_v.join(', '), [
      animate('2s ease-in-out', keyframes([
        hidden,
        shown
      ]))
    ]),
    transition(v_to_v.join(', '), [
      animate('2s ease-in-out', keyframes([
        shown,
        hidden,
        shown
      ]))
    ])
  ]);
}
