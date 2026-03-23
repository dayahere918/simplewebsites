const { DOG_BREEDS, CAT_BREEDS, identifyBreed } = require('../app');

describe('Pet Breed Identifier', () => {
  test('identifyBreed returns valid percentages for dog mode', () => {
    // defaults to dog
    const scores = identifyBreed(9876);
    expect(Object.keys(scores).length).toBe(DOG_BREEDS.length);
    const total = Object.values(scores).reduce((a,b) => a+b, 0);
    expect(total).toBe(100);
  });
});
