/**
 * @jest-environment jsdom
 */
const { 
  DOG_BREEDS, CAT_BREEDS, setPetType, identifyBreed, 
  renderBreedBars, renderBreedInfo, resetAnalysis 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <canvas id="pet-canvas" width="100" height="100"></canvas>
    <div id="results" class="hidden"></div>
    <div id="breed-badge"></div>
    <div id="confidence-text"></div>
    <div id="breed-bars"></div>
    <div id="breed-info"></div>
    <div id="care-tips"></div>
    <div id="upload-area"></div>
    <button id="btn-dog" class="pet-btn"></button>
    <button id="btn-cat" class="pet-btn"></button>
    <input id="file-input" type="file">
  `;
}

describe('Pet Breed Identifier', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('setPetType changes mode and UI', () => {
    setPetType('cat');
    expect(document.getElementById('btn-cat').className).toContain('active');
    
    setPetType('dog');
    expect(document.getElementById('btn-dog').className).toContain('active');
  });

  test('identifyBreed logic for both types', () => {
    const { setPetTypeVal } = require('../app');
    
    // Dog
    setPetTypeVal('dog');
    const dogResult = identifyBreed(123);
    expect(Object.keys(dogResult).length).toBe(DOG_BREEDS.length);
    
    // Cat
    setPetTypeVal('cat');
    const catResult = identifyBreed(456);
    expect(Object.keys(catResult).length).toBe(CAT_BREEDS.length);
  });

  test('renderBreedInfo handles missing breeds gracefully', () => {
    renderBreedInfo('Non Existent');
    expect(document.getElementById('breed-info').innerHTML).toBe('');
  });

  test('renderBreedInfo populates dog details', () => {
    const { setPetTypeVal } = require('../app');
    setPetTypeVal('dog');
    renderBreedInfo('Golden Retriever');
    const info = document.getElementById('breed-info');
    expect(info.innerHTML).toContain('Scotland');
    expect(info.innerHTML).toContain('Large');
  });
});
