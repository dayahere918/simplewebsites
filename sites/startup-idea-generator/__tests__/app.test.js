/**
 * Comprehensive tests for startup-idea-generator
 */
const app = require('../app');
const {
    getRandomItem, getRandomItems, generateName, generateIdeaData,
    generateIdea, saveIdea, removeSavedIdea, renderSaved, shareIdea,
    getCurrentIdea, setCurrentIdea, getSavedIdeas, setSavedIdeas
} = app;

const DOM_HTML = `
    <div id="idea-card"></div>
    <div id="idea-category"></div>
    <div id="idea-name"></div>
    <div id="idea-problem"></div>
    <div id="idea-solution"></div>
    <div id="idea-tags"></div>
    <div id="saved-list"></div>
`;

beforeEach(() => {
    document.body.innerHTML = DOM_HTML;
    setCurrentIdea(null);
    setSavedIdeas([]);
    global.navigator.share = jest.fn();
    global.navigator.clipboard = { writeText: jest.fn() };
});

describe('Startup Idea Generator — Pure Logic', () => {
    test('getRandomItem returns null for empty array', () => {
        expect(getRandomItem([])).toBeNull();
        expect(getRandomItem(null)).toBeNull();
    });

    test('getRandomItem returns an item', () => {
        const item = getRandomItem(['a', 'b']);
        expect(['a', 'b']).toContain(item);
    });

    test('getRandomItems returns correct count', () => {
        expect(getRandomItems(['a', 'b', 'c'], 2).length).toBe(2);
        expect(getRandomItems(['a'], 5).length).toBe(1);
        expect(getRandomItems(null, 5)).toEqual([]);
    });

    test('generateName returns string', () => {
        expect(typeof generateName('SaaS', 'Prob')).toBe('string');
    });

    test('generateIdeaData returns full object', () => {
        const data = generateIdeaData();
        expect(data).toHaveProperty('category');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('tags');
        expect(data.tags.length).toBe(4);
    });
});

describe('Startup Idea Generator — DOM Logic', () => {
    test('generateIdea updates DOM', () => {
        generateIdea();
        expect(document.getElementById('idea-name').textContent).toBeTruthy();
        expect(getCurrentIdea()).toBeTruthy();
    });

    test('saveIdea adds to list and renders', () => {
        setCurrentIdea({ name: 'App1', category: 'SaaS', problem: 'P', solution: 'S', tags: ['T'] });
        saveIdea();
        expect(getSavedIdeas().length).toBe(1);
        expect(document.getElementById('saved-list').innerHTML).toContain('App1');
    });

    test('saveIdea prevents duplicates', () => {
        const idea = { name: 'App1', category: 'SaaS', problem: 'P', solution: 'S', tags: ['T'] };
        setCurrentIdea(idea);
        saveIdea();
        saveIdea();
        expect(getSavedIdeas().length).toBe(1);
    });

    test('removeSavedIdea removes from list', () => {
        setSavedIdeas([{ name: 'App1' }, { name: 'App2' }]);
        removeSavedIdea(0);
        expect(getSavedIdeas().length).toBe(1);
        expect(getSavedIdeas()[0].name).toBe('App2');
    });

    test('removeSavedIdea handles invalid index', () => {
        setSavedIdeas([{ name: 'A' }]);
        removeSavedIdea(5);
        expect(getSavedIdeas().length).toBe(1);
    });

    test('shareIdea calls navigator.share if available', () => {
        const idea = { name: 'App1', category: 'SaaS', problem: 'P', solution: 'S' };
        setCurrentIdea(idea);
        shareIdea();
        expect(global.navigator.share).toHaveBeenCalled();
    });

    test('shareIdea calls clipboard.writeText if share unavailable', () => {
        delete global.navigator.share;
        setCurrentIdea({ name: 'App1' });
        shareIdea();
        expect(global.navigator.clipboard.writeText).toHaveBeenCalled();
    });
});
