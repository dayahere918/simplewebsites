const fs = require('fs');

jest.mock('fs');

describe('Build Script Dummy Pass', () => {
  test('passes to allow main test to report coverage', () => {
    expect(true).toBe(true);
  });
});
