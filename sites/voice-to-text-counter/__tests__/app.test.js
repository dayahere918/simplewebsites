const { countWords, countFillers } = require('../app');

describe('Voice To Text Counter', () => {
  test('word count is accurate', () => {
    expect(countWords("Hello world test")).toBe(3);
  });

  test('filler word detection', () => {
    const text = "Um, so like, I am here.";
    const fillers = countFillers(text);
    expect(fillers).toHaveProperty('um');
    expect(fillers).toHaveProperty('like');
  });
});
