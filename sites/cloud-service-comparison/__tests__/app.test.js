/**
 * @jest-environment jsdom
 */
const { SERVICES, filterCategory, renderTable, getCurrentFilter, setCurrentFilter } = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="filter-case">
      <button class="filter-btn active" id="btn-all">All</button>
      <button class="filter-btn" id="btn-compute">Compute</button>
    </div>
    <table><tbody id="table-body"></tbody></table>
  `;
}

describe('Cloud Service Comparison', () => {
  beforeEach(() => {
    setupDOM();
    setCurrentFilter('all');
  });

  test('renderTable shows all services by default', () => {
    renderTable();
    const rows = document.querySelectorAll('#table-body tr');
    expect(rows.length).toBe(SERVICES.length);
  });

  test('renderTable filters services', () => {
    setCurrentFilter('storage');
    renderTable();
    const rows = document.querySelectorAll('#table-body tr');
    const storageCount = SERVICES.filter(s => s.category === 'storage').length;
    expect(rows.length).toBe(storageCount);
    expect(rows[0].querySelector('.cat-cell').textContent).toBe('storage');
  });

  test('filterCategory updates UI classes', () => {
    const btn = document.getElementById('btn-compute');
    // Simulate event object since we use event?.target
    const event = { target: btn };
    global.event = event;
    
    filterCategory('compute');
    
    expect(getCurrentFilter()).toBe('compute');
    expect(btn.classList.contains('active')).toBe(true);
    expect(document.getElementById('btn-all').classList.contains('active')).toBe(false);
  });
});
