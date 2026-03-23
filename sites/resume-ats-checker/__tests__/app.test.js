const { extractKeywords, calculateScore, checkSections } = require('../app');

describe('Resume ATS Checker', () => {
  test('extractKeywords filters stop words and keeps important terms', () => {
    const text = "Experience in React and Node.js developer role";
    const keywords = extractKeywords(text);
    expect(keywords).toContain('react');
    expect(keywords).toContain('node.js');
    expect(keywords).not.toContain('in');
  });

  test('calculateScore produces a value between 0 and 100', () => {
    const score = calculateScore(['react'], ['node'], [{found: true}], 500);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('checkSections identifies common headers', () => {
    const sections = checkSections("EXPERIENCE: worked at Google. EDUCATION: MIT.");
    expect(sections.find(s => s.section === 'experience').found).toBe(true);
    expect(sections.find(s => s.section === 'education').found).toBe(true);
    expect(sections.find(s => s.section === 'projects').found).toBe(false);
  });
});
