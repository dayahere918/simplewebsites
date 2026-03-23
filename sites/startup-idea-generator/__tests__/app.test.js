/**
 * @jest-environment jsdom
 */
const {
  CATEGORIES, PROBLEMS, SOLUTIONS, TAGS_POOL,
  getRandomItem, getRandomItems, generateName, generateIdeaData,
  generateIdea, saveIdea, removeSavedIdea, renderSaved,
  getCurrentIdea, setCurrentIdea, getSavedIdeas, setSavedIdeas
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="idea-card" class="animate-fadeIn">
      <div id="idea-category"></div>
      <h2 id="idea-name"></h2>
      <p id="idea-problem"></p>
      <p id="idea-solution"></p>
      <div id="idea-tags"></div>
    </div>
    <div id="saved-list"></div>
  `;
}

describe('StartupIdeaGenerator', () => {
  beforeEach(() => {
    setupDOM();
    setCurrentIdea(null);
    setSavedIdeas([]);
  });

  describe('data pools', () => {
    test('has at least 8 categories', () => expect(CATEGORIES.length).toBeGreaterThanOrEqual(8));
    test('has at least 10 problems', () => expect(PROBLEMS.length).toBeGreaterThanOrEqual(10));
    test('has at least 10 solutions', () => expect(SOLUTIONS.length).toBeGreaterThanOrEqual(10));
    test('has at least 15 tags', () => expect(TAGS_POOL.length).toBeGreaterThanOrEqual(15));
  });

  describe('getRandomItem', () => {
    test('returns item from array', () => {
      const arr = ['a', 'b', 'c'];
      expect(arr).toContain(getRandomItem(arr));
    });

    test('returns null for empty array', () => {
      expect(getRandomItem([])).toBeNull();
    });

    test('returns null for non-array', () => {
      expect(getRandomItem(null)).toBeNull();
    });
  });

  describe('getRandomItems', () => {
    test('returns N items', () => {
      const result = getRandomItems(['a', 'b', 'c', 'd', 'e'], 3);
      expect(result.length).toBe(3);
    });

    test('returns all if N > length', () => {
      const result = getRandomItems(['a', 'b'], 5);
      expect(result.length).toBe(2);
    });

    test('returns empty for non-array', () => {
      expect(getRandomItems(null, 3)).toEqual([]);
    });

    test('items are from original array', () => {
      const arr = ['a', 'b', 'c'];
      const result = getRandomItems(arr, 2);
      result.forEach(item => expect(arr).toContain(item));
    });
  });

  describe('generateName', () => {
    test('returns a non-empty string', () => {
      const name = generateName('SaaS', 'problem');
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    test('returns different names on repeated calls', () => {
      const names = new Set();
      for (let i = 0; i < 20; i++) {
        names.add(generateName('SaaS', 'problem'));
      }
      expect(names.size).toBeGreaterThan(1);
    });
  });

  describe('generateIdeaData', () => {
    test('returns idea with all fields', () => {
      const idea = generateIdeaData();
      expect(idea).toHaveProperty('category');
      expect(idea).toHaveProperty('name');
      expect(idea).toHaveProperty('problem');
      expect(idea).toHaveProperty('solution');
      expect(idea).toHaveProperty('tags');
      expect(Array.isArray(idea.tags)).toBe(true);
    });

    test('category is from CATEGORIES', () => {
      const idea = generateIdeaData();
      expect(CATEGORIES).toContain(idea.category);
    });

    test('has 4 tags', () => {
      const idea = generateIdeaData();
      expect(idea.tags.length).toBe(4);
    });
  });

  describe('generateIdea', () => {
    test('sets currentIdea', () => {
      generateIdea();
      expect(getCurrentIdea()).not.toBeNull();
      expect(getCurrentIdea()).toHaveProperty('name');
    });

    test('updates DOM elements', () => {
      generateIdea();
      expect(document.getElementById('idea-category').textContent).toBeTruthy();
      expect(document.getElementById('idea-name').textContent).toBeTruthy();
      expect(document.getElementById('idea-tags').children.length).toBe(4);
    });
  });

  describe('saveIdea', () => {
    test('saves current idea', () => {
      setCurrentIdea({ name: 'Test', problem: 'P', solution: 'S', category: 'SaaS', tags: [] });
      saveIdea();
      expect(getSavedIdeas().length).toBe(1);
    });

    test('does not save when no current idea', () => {
      setCurrentIdea(null);
      saveIdea();
      expect(getSavedIdeas().length).toBe(0);
    });

    test('does not save duplicates', () => {
      const idea = { name: 'Test', problem: 'P', solution: 'S', category: 'SaaS', tags: [] };
      setCurrentIdea(idea);
      saveIdea();
      saveIdea();
      expect(getSavedIdeas().length).toBe(1);
    });
  });

  describe('removeSavedIdea', () => {
    test('removes by index', () => {
      setSavedIdeas([{ name: 'A' }, { name: 'B' }]);
      removeSavedIdea(0);
      expect(getSavedIdeas().length).toBe(1);
      expect(getSavedIdeas()[0].name).toBe('B');
    });

    test('handles invalid index', () => {
      setSavedIdeas([{ name: 'A' }]);
      removeSavedIdea(-1);
      removeSavedIdea(5);
      expect(getSavedIdeas().length).toBe(1);
    });
  });

  describe('renderSaved', () => {
    test('renders saved ideas', () => {
      setSavedIdeas([{ name: 'TestApp', category: 'SaaS' }]);
      renderSaved();
      const list = document.getElementById('saved-list');
      expect(list.innerHTML).toContain('TestApp');
    });

    test('renders empty when no saved', () => {
      setSavedIdeas([]);
      renderSaved();
      expect(document.getElementById('saved-list').innerHTML).toBe('');
    });
  });
});
