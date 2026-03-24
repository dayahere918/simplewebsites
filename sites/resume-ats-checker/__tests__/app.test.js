/**
 * @jest-environment jsdom
 */
const {
  extractKeywords, findMatches, checkSections, calculateScore, getScoreClass, generateTips, analyzeResume, renderResults
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <textarea id="resume-text"></textarea>
    <textarea id="job-desc"></textarea>
    <div id="results" class="hidden">
      <div id="score-circle"></div>
      <div id="score-value"></div>
      <div id="stats-row"></div>
      <div id="keyword-matches"></div>
      <div id="keyword-missing"></div>
      <ul id="tips-list"></ul>
    </div>
  `;
}

describe('Resume ATS Checker', () => {
  beforeEach(() => setupDOM());

  test('extractKeywords filters stop words and short words', () => {
    const text = "The software engineer is building a distributed system with Java and AWS.";
    const keywords = extractKeywords(text);
    expect(keywords).toContain('software');
    expect(keywords).toContain('engineer');
    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('is');
  });

  test('calculateScore produces valid integer', () => {
    const score = calculateScore(['java'], ['aws'], [{section:'experience', found:true}], 300);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('analyzeResume updates DOM when fields are filled', () => {
    document.getElementById('resume-text').value = "Experience with Java and AWS in softare engineering.";
    document.getElementById('job-desc').value = "Looking for a software engineer with Java and AWS skills.";
    analyzeResume();
    expect(document.getElementById('results').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('score-value').textContent).not.toBe('');
  });

  test('generateTips provides relevant advice', () => {
    const tips = generateTips(['java'], ['aws'], [{section:'education', found:false}], 50);
    expect(tips.join(' ')).toContain('education');
    expect(tips.join(' ')).toContain('too short');
  });

  test('checkSections identifies common headers', () => {
    const sections = checkSections("EXPERIENCE: worked at Google. EDUCATION: MIT.");
    expect(sections.find(s => s.section === 'experience').found).toBe(true);
    expect(sections.find(s => s.section === 'education').found).toBe(true);
    expect(sections.find(s => s.section === 'projects').found).toBe(false);
  });
});
