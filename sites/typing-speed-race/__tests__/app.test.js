const { calculateWPM, calculateAccuracy } = require('../app');

describe('Typing Speed Race', () => {
  test('WPM calculation is correct', () => {
    const chars = 100; // 20 words
    const seconds = 60;
    expect(calculateWPM(chars, seconds)).toBe(20);
  });

  test('Accuracy calculation handles 100%', () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
    expect(calculateAccuracy(8, 10)).toBe(80);
  });
});
