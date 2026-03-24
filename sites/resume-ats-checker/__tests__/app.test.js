/**
 * @jest-environment jsdom
 */
const {
  extractKeywords, findMatches, checkSections, calculateScore, 
  getScoreClass, generateTips, analyzeResume, renderResults,
  COMMON_SECTIONS
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
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  describe('Logic', () => {
    test('extractKeywords handles empty/invalid input', () => {
      expect(extractKeywords('')).toEqual([]);
      expect(extractKeywords(null)).toEqual([]);
    });

    test('getScoreClass ranges', () => {
      expect(getScoreClass(90)).toBe('excellent');
      expect(getScoreClass(70)).toBe('good');
      expect(getScoreClass(50)).toBe('fair');
      expect(getScoreClass(10)).toBe('poor');
    });

    test('calculateScore weightings', () => {
      // keywordScore (50) + sectionScore (30) + lengthScore (20)
      const sections = COMMON_SECTIONS.map(s => ({ section: s, found: true }));
      const score = calculateScore(['a'], [], sections, 500);
      expect(score).toBe(100);

      const poorScore = calculateScore([], ['a'], [], 10);
      expect(poorScore).toBeLessThan(20);
    });
  });

  describe('UI & Lifecycle', () => {
    test('analyzeResume early return on empty fields', () => {
      analyzeResume();
      expect(document.getElementById('results').className).toContain('hidden');
    });

    test('renderResults populates all sections', () => {
      const sections = [{ section: 'experience', found: true }, { section: 'skills', found: false }];
      renderResults(85, ['java'], ['aws'], sections, 400);
      
      expect(document.getElementById('results').className).not.toContain('hidden');
      expect(document.getElementById('score-value').textContent).toBe('85');
      expect(document.getElementById('stats-row').innerHTML).toContain('Keywords Matched');
      expect(document.getElementById('keyword-matches').innerHTML).toContain('java');
      expect(document.getElementById('keyword-missing').innerHTML).toContain('aws');
      expect(document.getElementById('tips-list').innerHTML).toContain('<li>');
    });

    test('generateTips edge cases', () => {
      const sections = COMMON_SECTIONS.map(s => ({ section: s, found: true }));
      
      const longTips = generateTips([], [], sections, 1500);
      expect(longTips).toContain('Your resume may be too long. Try to keep it concise (300-800 words).');

      const missingSectionTips = generateTips([], [], [{section:'experience', found:false}], 400);
      expect(missingSectionTips[0]).toContain('missing sections: experience');
    });
  });
});
