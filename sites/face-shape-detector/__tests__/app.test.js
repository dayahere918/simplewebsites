const { generateAnalysis, getTopShape } = require('../app');

describe('Face Shape Detector', () => {
  test('generateAnalysis produces 100% total coverage', () => {
    const scores = generateAnalysis(12345);
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  test('getTopShape identifies the highest score', () => {
    const scores = { 'Oval': 40, 'Round': 30, 'Square': 30 };
    expect(getTopShape(scores)).toBe('Oval');
  });
});
