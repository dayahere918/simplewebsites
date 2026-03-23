const { generateTraits, getState, setParent1, setParent2 } = require('../app');

describe('Baby Face Generator', () => {
  test('generateTraits returns exactly 5 traits', () => {
    const traits = generateTraits();
    expect(traits.length).toBe(5);
  });

  test('parent loaded state tracking', () => {
    setParent1(true);
    setParent2(true);
    expect(getState().parent1Loaded).toBe(true);
    expect(getState().parent2Loaded).toBe(true);
  });
});
