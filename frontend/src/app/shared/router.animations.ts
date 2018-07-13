import { sequence, trigger, stagger, animate, style, group, query as q, transition, keyframes, animateChild } from '@angular/animations';

const query = (s, a, o = { optional: true }) => q(s, a, o);
const easing = '500ms cubic-bezier(.75, -0.48, .26, 1.52)';
const hide = style({ opacity: 0 });
const show = style({ opacity: 1 });
const transitionOut = [show, animate(easing, hide)];
const transitionIn = [hide, animate(easing, show)];

export const Animations = {
  routerTransition: trigger('routerTransition', [
    transition('* => *', [
      query(':enter,:leave', show),
      query(':enter', hide),
      sequence([
        query(':leave', animateChild()),
        group([
          query(':leave', transitionOut),
          query(':enter', transitionIn),
        ]),
        query(':enter', animateChild()),
      ])
    ])
  ])
};
