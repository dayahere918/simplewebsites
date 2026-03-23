const { THEMES } = require('../app');

describe('Mood Board Generator', () => {
  test('THEMES are available', () => {
    expect(Object.keys(THEMES).length).toBeGreaterThan(3);
  });
});
