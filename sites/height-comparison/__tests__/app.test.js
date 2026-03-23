const { cmToFeetInches } = require('../app');

describe('Height Comparison', () => {
  test('cmToFeetInches returns formatted string', () => {
    expect(cmToFeetInches(180)).toBe("5'11\"");
  });
});
