type Name = [
  'penguin',
  'pickle',
  'donut',
  'giraffe',
  'potato',
  'banana',
  'raccoon',
  'bumblebee',
  'butterfly',
  'unicorn',
  'walrus',
  'kangaroo',
  'hippopotamus',
  'chinchilla',
  'elephant',
  'dolphin',
  'flamingo',
  'octopus',
  'hedgehog',
  'armadillo',
  'tortoise',
  'starfish',
  'peacock',
  'porcupine',
  'platypus'
];

type Adjective = [
  'fluffy',
  'pinky',
  'bumpy',
  'slimy',
  'giggly',
  'squishy',
  'jumpy',
  'bouncy',
  'zippy',
  'dizzy',
  'wacky',
  'goofy',
  'zany',
  'quirky',
  'funky',
  'spunky',
  'crunchy',
  'slick',
  'sparkly',
  'bubbly',
  'twisty',
  'squiggly',
  'jiggly',
  'puffy',
  'wiggly'
];

export const name: Name = [
  'penguin',
  'pickle',
  'donut',
  'giraffe',
  'potato',
  'banana',
  'raccoon',
  'bumblebee',
  'butterfly',
  'unicorn',
  'walrus',
  'kangaroo',
  'hippopotamus',
  'chinchilla',
  'elephant',
  'dolphin',
  'flamingo',
  'octopus',
  'hedgehog',
  'armadillo',
  'tortoise',
  'starfish',
  'peacock',
  'porcupine',
  'platypus'
];

export const adjective: Adjective = [
  'fluffy',
  'pinky',
  'bumpy',
  'slimy',
  'giggly',
  'squishy',
  'jumpy',
  'bouncy',
  'zippy',
  'dizzy',
  'wacky',
  'goofy',
  'zany',
  'quirky',
  'funky',
  'spunky',
  'crunchy',
  'slick',
  'sparkly',
  'bubbly',
  'twisty',
  'squiggly',
  'jiggly',
  'puffy',
  'wiggly'
];

export function generate_name(): string {

  const random_name = name[ Math.floor( Math.random() * name.length ) ];
  const random_adjective = adjective[ Math.floor( Math.random() * adjective.length ) ];

  return `${random_adjective}-${random_name}`;
}
