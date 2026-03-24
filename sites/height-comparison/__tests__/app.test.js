/**
 * @jest-environment jsdom
 */
const { 
  cmToFeetInches, getPixelHeight, addPerson, removePerson, clearAll, loadPreset, render, setPeople, getPeople 
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

  test('cmToFeetInches returns formatted string', () => {
    expect(cmToFeetInches(180)).toBe("5'11\"");
    expect(cmToFeetInches(152.4)).toBe("5'0\"");
  });

  test('addPerson validates input and updates state', () => {
    document.getElementById('person-name').value = 'Alice';
    document.getElementById('person-height').value = '170';
    addPerson();
    expect(getPeople().length).toBe(1);
    expect(getPeople()[0].name).toBe('Alice');
  });

  test('removePerson works correctly', () => {
    setPeople([{ name: 'Bob', height: 180, id: 123 }]);
    removePerson(123);
    expect(getPeople().length).toBe(0);
  });

  test('loadPreset loads specific preset', () => {
    loadPreset('basketball');
    expect(getPeople().length).toBeGreaterThan(2);
    expect(document.getElementById('figures-row').children.length).toBeGreaterThan(2);
  });

  test('renderFigures handles empty state', () => {
    render();
    expect(document.getElementById('figures-row').innerHTML).toContain('Add people');
  });
});
