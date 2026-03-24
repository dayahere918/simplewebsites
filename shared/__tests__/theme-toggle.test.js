describe('Theme Toggle Module', () => {
  let originalMatchMedia;
  let originalLocalStorage;
  let documentElement;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    documentElement = document.documentElement;
    documentElement.setAttribute('data-theme', '');

    // Mock localStorage
    const store = {};
    originalLocalStorage = Object.getOwnPropertyDescriptor(global, 'localStorage');
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value; }),
      },
      writable: true
    });

    // Mock matchMedia
    originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    // Reset module registry to reload theme-toggle logic
    jest.resetModules();
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', originalLocalStorage);
    window.matchMedia = originalMatchMedia;
  });

  it('applies saved theme over system preference', () => {
    global.localStorage.getItem.mockReturnValueOnce('light');
    window.matchMedia.mockImplementationOnce(() => ({ matches: true })); // prefers dark
    
    // Load module to trigger auto-init
    require('../theme-toggle.js');
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('respects system dark mode if no saved theme', () => {
    window.matchMedia.mockImplementationOnce(() => ({ matches: true })); // prefers dark
    require('../theme-toggle.js');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('defaults to light if no saved theme and system is light', () => {
    window.matchMedia.mockImplementationOnce(() => ({ matches: false })); // prefers light
    require('../theme-toggle.js');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('creates toggle button and handles clicks', () => {
    global.localStorage.getItem.mockReturnValueOnce('light');
    const { toggleTheme } = require('../theme-toggle.js');
    
    const btn = document.querySelector('#theme-toggle');
    expect(btn).toBeTruthy();
    expect(btn.innerHTML).toContain('🌙'); // light mode shows moon icon
    
    // Test manual toggle via API
    toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(global.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(btn.innerHTML).toContain('☀️'); // dark mode shows sun icon

    // Test click handler
    btn.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(global.localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });
});
