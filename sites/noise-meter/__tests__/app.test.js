const { getLevelLabel } = require('../app');

describe('Noise Meter', () => {
  test('identifies noise levels correctly', () => {
    expect(getLevelLabel(20)).toContain('Quiet');
    expect(getLevelLabel(90)).toContain('Loud');
  });
});
