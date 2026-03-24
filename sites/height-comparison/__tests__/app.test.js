/**
 * @jest-environment jsdom
 */
const { 
  cmToFeetInches, getPixelHeight, addPerson, removePerson, clearAll, 
  loadPreset, render, setPeople, getPeople, escapeHtml 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input id="person-name">
    <input id="person-height">
    <input id="person-color">
    <div id="figures-row"></div>
    <div id="ruler"></div>
    <div id="people-list"></div>
  `;
}

describe('Height Comparison', () => {
  beforeEach(() => {
    setupDOM();
    clearAll();
  });

  describe('Utilities', () => {
    test('cmToFeetInches handles edge cases', () => {
      expect(cmToFeetInches(180)).toBe("5'11\"");
      expect(cmToFeetInches(0)).toBe("0'0\"");
      expect(cmToFeetInches(-10)).toBe("0'0\"");
      expect(cmToFeetInches(null)).toBe("0'0\"");
    });

    test('getPixelHeight handles varied scales', () => {
      setPeople([{ height: 100 }, { height: 200 }]);
      const h1 = getPixelHeight(100);
      const h2 = getPixelHeight(200);
      expect(h2).toBeGreaterThan(h1);
    });

    test('escapeHtml handles strings', () => {
      expect(escapeHtml('<b>')).toBe('&lt;b&gt;');
      expect(escapeHtml(null)).toBe('');
    });
  });

  describe('UI & State', () => {
    test('addPerson validates input', () => {
      document.getElementById('person-name').value = 'Alice';
      document.getElementById('person-height').value = '170';
      addPerson();
      expect(getPeople().length).toBe(1);
      
      // Invalid height
      document.getElementById('person-height').value = '40';
      addPerson();
      expect(getPeople().length).toBe(1);
    });

    test('removePerson works', () => {
      setPeople([{ name: 'Bob', height: 180, id: 123 }]);
      removePerson(123);
      expect(getPeople().length).toBe(0);
    });

    test('loadPreset loads Actors', () => {
      loadPreset('actors');
      expect(getPeople().length).toBe(4);
      expect(document.getElementById('figures-row').innerHTML).toContain('Dwayne Johnson');
    });

    test('render handles empty state', () => {
      clearAll();
      expect(document.getElementById('figures-row').innerHTML).toContain('Add people');
      expect(document.getElementById('ruler').innerHTML).toBe('');
    });
  });
});
