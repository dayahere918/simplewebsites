/**
 * @jest-environment jsdom
 */
const { 
  CATEGORIES, PROBLEMS, SOLUTIONS, TAGS_POOL,
  getRandomItem, getRandomItems, generateName, generateIdeaData,
  generateIdea, saveIdea, removeSavedIdea, renderSaved, shareIdea,
  getCurrentIdea, setCurrentIdea, getSavedIdeas, setSavedIdeas 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="idea-card">
      <div id="idea-category"></div>
      <div id="idea-name"></div>
      <div id="idea-problem"></div>
      <div id="idea-solution"></div>
      <div id="idea-tags"></div>
    </div>
    <div id="saved-list"></div>
  `;
}

// Mock Clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

describe('Startup Idea Generator', () => {
  beforeEach(() => {
    setupDOM();
    setSavedIdeas([]);
    setCurrentIdea(null);
    jest.clearAllMocks();
  });

  describe('Logic', () => {
    test('getRandomItem handles empty', () => {
      expect(getRandomItem([])).toBeNull();
    });

    test('generateIdeaData returns 4 tags', () => {
      const idea = generateIdeaData();
      expect(idea.tags.length).toBe(4);
    });
  });

  describe('UI', () => {
    test('generateIdea re-triggers animation', () => {
      generateIdea();
      expect(document.getElementById('idea-name').textContent).not.toBe('');
    });

    test('saveIdea prevents duplicates', () => {
      const idea = { name: 'Dedupe', category: 'SaaS', problem: 'P', solution: 'S', tags: [] };
      setCurrentIdea(idea);
      saveIdea();
      saveIdea();
      expect(getSavedIdeas().length).toBe(1);
    });

    test('removeSavedIdea bounds check', () => {
      setSavedIdeas([{ name: 'A' }]);
      removeSavedIdea(5);
      expect(getSavedIdeas().length).toBe(1);
    });

    test('shareIdea uses clipboard', () => {
      const idea = { name: 'ShareMe', category: 'SaaS', problem: 'P', solution: 'S', tags: [] };
      setCurrentIdea(idea);
      shareIdea();
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });
});
