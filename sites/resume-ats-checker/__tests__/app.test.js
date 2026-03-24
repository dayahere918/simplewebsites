/**
 * @jest-environment jsdom
 */
const app = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <textarea id="resume-text"></textarea>
    <textarea id="job-desc"></textarea>
    <div id="results" class="hidden"></div>
    <div id="score-circle"></div>
    <div id="score-value"></div>
    <div id="stats-row"></div>
    <div id="keyword-matches"></div>
    <div id="keyword-missing"></div>
    <ul id="tips-list"></ul>
  `;
}

describe('Resume ATS Checker', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  describe('Core Extractors', () => {
    test('extractKeywords limits common words correctly', () => {
      expect(app.extractKeywords(null)).toEqual([]);
      expect(app.extractKeywords('')).toEqual([]);
      
      const kw = app.extractKeywords('The quick brown fox jumps over the lazy dog.');
      expect(kw).toContain('quick');
      expect(kw).toContain('brown');
      expect(kw).not.toContain('the'); // stop word
    });

    test('findMatches separates correctly', () => {
      const { matched, missing } = app.findMatches(['react', 'node'], ['react', 'vue', 'node']);
      expect(matched).toEqual(['react', 'node']);
      expect(missing).toEqual(['vue']);
    });

    test('checkSections identifies common headers', () => {
      const res = app.checkSections('Experience at corp\nEducation: BS');
      expect(res.find(s => s.section === 'experience').found).toBeTruthy();
      expect(res.find(s => s.section === 'skills').found).toBeFalsy();
    });

    test('countWords calculates standard length', () => {
      expect(app.countWords('  hello   world  ')).toBe(2);
      expect(app.countWords('')).toBe(0);
      expect(app.countWords(null)).toBe(0);
    });
  });

  describe('Scoring Logic', () => {
    test('calculateScore respects weighted metrics', () => {
      const matched = ['a'], missing = ['b'];
      const sections = [{ found: true }, { found: false }];
      // Math: (1/2)*50=25, (1/2)*30=15, words 400 => 20 -> 25+15+20 = 60
      expect(app.calculateScore(matched, missing, sections, 400)).toBe(60);
      
      // Empty inputs
      expect(app.calculateScore([], [], [], 0)).toBe(5);
    });

    test('getScoreClass returns relevant class', () => {
      expect(app.getScoreClass(90)).toBe('excellent');
      expect(app.getScoreClass(70)).toBe('good');
      expect(app.getScoreClass(50)).toBe('fair');
      expect(app.getScoreClass(30)).toBe('poor');
    });

    test('generateTips provides actionable context', () => {
      const tips = app.generateTips([], ['a', 'b', 'c', 'd', 'e', 'f'], [{ section: 'skills', found: false }], 150);
      expect(tips).toContain('Your resume is missing 6 important keywords from the job description. Try incorporating them naturally.');
      expect(tips).toContain('Add these missing sections: skills');
      expect(tips).toContain('Your resume seems too short. Aim for 300-800 words.');

      const tipsLong = app.generateTips(['a'], ['b'], [], 1200);
      expect(tipsLong).toContain('Great job! You matched 1 keywords from the job description.');
      expect(tipsLong).toContain('Add these keywords: b');
      expect(tipsLong).toContain('Your resume may be too long. Try to keep it concise (300-800 words).');
    });
  });

  describe('DOM & UI', () => {
    test('analyzeResume updates DOM properly', () => {
      document.getElementById('resume-text').value = 'React developer with 5 years experience';
      document.getElementById('job-desc').value = 'Looking for a React developer';
      
      app.analyzeResume();
      expect(document.getElementById('results').classList.contains('hidden')).toBeFalsy();
      expect(document.getElementById('score-value').textContent).not.toBe('');
      expect(document.getElementById('keyword-matches').innerHTML).toContain('react');
    });

    test('analyzeResume safely escapes invalid elements', () => {
      document.body.innerHTML = '';
      expect(() => app.analyzeResume()).not.toThrow();
      
      setupDOM();
      document.getElementById('resume-text').value = '';
      expect(() => app.analyzeResume()).not.toThrow();
    });

    test('renderResults safely escapes bad DOM', () => {
      document.body.innerHTML = '';
      expect(() => app.renderResults(0, [], [], [], 0)).not.toThrow();
    });
  });
});
