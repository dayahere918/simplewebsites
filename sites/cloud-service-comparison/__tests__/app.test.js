const { SERVICES, getCurrentFilter, setCurrentFilter } = require('../app');

describe('Cloud Service Comparison', () => {
  test('SERVICES array is populated and categorized', () => {
    expect(SERVICES.length).toBeGreaterThan(10);
    expect(SERVICES[0]).toHaveProperty('category');
    expect(SERVICES[0]).toHaveProperty('aws');
  });

  test('filter updates state', () => {
    setCurrentFilter('compute');
    expect(getCurrentFilter()).toBe('compute');
  });
});
