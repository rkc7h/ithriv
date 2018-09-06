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


export function menuTransition(translate, defaultParams, easing): AnimationTriggerMetadata {
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
export function rootTransition(shown, defaultParams, parked, easing): AnimationTriggerMetadata {
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

export function childPositionTransition(translate, defaultParams, easing): AnimationTriggerMetadata {
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

export function grandchildPositionTransition(translate, defaultParams, easing): AnimationTriggerMetadata {
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

export function lineTransition(lineShown, v_to_h_str, h_to_v_str, h_to_h_str, v_to_v_str,
                               lineEasing, lineHidden): AnimationTriggerMetadata {
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
