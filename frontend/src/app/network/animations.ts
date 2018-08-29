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

export function childPositionTransition():  AnimationTriggerMetadata {
  return trigger('childState', [
    state('primary', style({
      transform: 'translate({{x}}px,{{y}}px) scale(1.5) '
    }), {params: {x: 0, y: 0}}),
    state('secondary',   style({
      transform: 'scale(1) translate({{x}}px,{{y}}px)'
    }), {params: {x: 0, y: 0}}),
    state('tertiary',   style({
      transform: 'scale(0.25) translate({{x}}px,{{y}}px)'
    }), {params: {x: 0, y: 0}}),
    state('nary',   style({
      transform: 'scale(0) translate({{x}}px,{{y}}px)'
    }), {params: {x: 0, y: 0}}),
    transition('* => *', [
      group([
        query('@grandchildState', animateChild(), { optional: true }),
        animate('600ms ease-in'),
      ])
    ]),
  ]);
}

export function grandchildPositionTransition():  AnimationTriggerMetadata {
  return trigger('grandchildState', [
    state('primary', style({
      transform: 'scale(1.5) translate({{x}}px,{{y}}px)',
      color: 'red'
    }), {params: {x: 0, y: 0}}),
    state('secondary',   style({
      transform: 'scale(.75) translate({{x}}px,{{y}}px)',
      color: 'blue'
    }), {params: {x: 0, y: 0}}),
    state('tertiary',   style({
      transform: 'scale(0.25) translate({{x}}px,{{y}}px)',
      color: 'green'
    }), {params: {x: 0, y: 0}}),
    state('nary',   style({
      transform: 'scale(0) translate({{x}}px,{{y}}px)',
      color: 'white'
    }), {params: {x: 0, y: 0}}),
    transition('* => *', animate('600ms ease-in'))
    ]);
}



export function rootTransition(): AnimationTriggerMetadata {
  return trigger('rootState', [

    state('root',   style({
      transform: 'translate({{x}}px,{{y}}px)'
    }), {params: {x: 0, y: 0}}),
    state('child',   style({
      transform: 'translate({{x}}px,{{y}}px)'
    }), {params: {x: 0, y: 0}}),
    transition('* => *', [
      group([
        query('@childState', animateChild(), { optional: true }),
        animate('600ms ease-in')
        ])
    ]),
  ]);
}

export function menuTransition(): AnimationTriggerMetadata {
  return trigger('menuState', [

    state('selected',   style({
      transform: 'translate({{x}}px,{{y}}px)'
    }), {params: {x: 0, y: 0}}),
    state('unselected',   style({
      opacity: 0.25,
      transform: 'translate({{x}}px,{{y}}px)'
    }), {params: {x: 0, y: 0}}),
    transition('* => *', [
        animate('600ms ease-in')
    ]),
  ]);
}


