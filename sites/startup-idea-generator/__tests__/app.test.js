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

describe('Startup Idea Generator', () => {
  beforeEach(() => {
    setupDOM();
    setSavedIdeas([]);
    setCurrentIdea(null);
  });

  test('getRandomItem returns element from array', () => {
    const arr = [1, 2, 3];
    expect(arr).toContain(getRandomItem(arr));
  });

  test('generateName returns a string', () => {
    const name = generateName('SaaS', 'Problem');
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  test('generateIdeaData creates valid object', () => {
    const idea = generateIdeaData();
    expect(idea).toHaveProperty('name');
    expect(idea).toHaveProperty('tags');
    expect(idea.tags.length).toBe(4);
  });

  test('generateIdea updates DOM', () => {
    generateIdea();
    expect(document.getElementById('idea-name').textContent).not.toBe('');
  });

  test('saveIdea adds to list and renders', () => {
    const idea = { name: 'TestStart', category: 'SaaS', problem: 'P', solution: 'S', tags: [] };
    setCurrentIdea(idea);
    saveIdea();
    expect(getSavedIdeas().length).toBe(1);
    expect(document.getElementById('saved-list').innerHTML).toContain('TestStart');
  });

  test('removeSavedIdea removes by index', () => {
    setSavedIdeas([{ name: 'A' }, { name: 'B' }]);
    removeSavedIdea(0);
    expect(getSavedIdeas().length).toBe(1);
    expect(getSavedIdeas()[0].name).toBe('B');
  });
});
