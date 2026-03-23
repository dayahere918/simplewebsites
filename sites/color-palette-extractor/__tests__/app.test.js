const { kMeansClustering } = require('../app');

describe('Color Palette Extractor', () => {
  test('kMeansClustering returns k colors', () => {
    const pixels = [[255,0,0], [255,0,0], [0,255,0], [0,255,0]];
    const centers = kMeansClustering(pixels, 2, 5);
    expect(centers.length).toBe(2);
  });
});
