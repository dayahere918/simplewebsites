const { calcEC2 } = require('../app');

describe('AWS Cost Estimator', () => {
  test('EC2 cost calculation exists', () => {
    expect(typeof calcEC2).toBe('function');
  });
});
