import { Category } from '../../category';

export function getDummyCategory(): Category {
  return {
    id: 123,
    parent_id: 0,
    level: 1,
    name: 'Droids',
    brief_description: 'Human-cyborg relations',
    description: `
> Around both humans and droids I must
> Be seen to make such errant beeps and squeaks
> That they shall think me simple. Truly, though,
> Although with sounds obilque I speak to them,
> I clearly see how I shall play my part,
> And how a vast rebellion shall succeed
> by wit and wisdom of a simple droid.
–Ian Doescher, *William Shakespeare's Star Wars: Verily, A New Hope*`,
    color: '#123456',
    children: [],
    icon_id: '',
    image: '',
    resource_count: 1,
    display_order: 0
  };
}
