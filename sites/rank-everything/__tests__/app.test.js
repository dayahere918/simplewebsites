const { fetchCrypto, fetchMovies, fetchGames, saveApiKeys, loadCategory, renderList, checkApiKeys } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="api-key-banner"></div>
        <input id="tmdb-key" value="test_tmdb" />
        <input id="rawg-key" value="test_rawg" />
        <button id="tab-crypto"></button>
        <button id="tab-movies"></button>
        <button id="tab-games"></button>
        <div id="loading-spinner" class="hidden"></div>
        <div id="error-msg" class="hidden"></div>
        <div id="rank-list"></div>
    `;
    global.fetch = jest.fn((url) => {
        if (url.includes('coingecko')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([{ name: 'Bitcoin', symbol: 'btc', current_price: 50, market_cap: 10, image: '' }]) });
        } else if (url.includes('themoviedb')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [{ title: 'Inception', poster_path: '/', vote_average: 9, release_date: '2010' }] }) });
        } else {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [{ name: 'Halo', background_image: '/', rating: 5, released: '2001' }] }) });
        }
    });
    localStorage.clear();
});

describe('Rank Everything Max Coverage', () => {
    test('checkApiKeys shows/hides banner', () => {
        checkApiKeys();
        expect(document.getElementById('api-key-banner').classList.contains('hidden')).toBe(false);
        
        localStorage.setItem('stacky_tmdb_key', 't');
        localStorage.setItem('stacky_rawg_key', 'r');
        checkApiKeys();
        expect(document.getElementById('api-key-banner').classList.contains('hidden')).toBe(true);
    });

    test('saveApiKeys workflow', () => {
        document.getElementById('tmdb-key').value = 'new_tmdb';
        document.getElementById('rawg-key').value = 'new_rawg';
        saveApiKeys();
        expect(localStorage.getItem('stacky_tmdb_key')).toBe('new_tmdb');
    });

    test('loadCategory all branches', async () => {
        // Crypto
        await loadCategory('crypto');
        expect(document.getElementById('rank-list').innerHTML).toContain('Bitcoin');

        // Movies error
        localStorage.removeItem('stacky_tmdb_key');
        checkApiKeys();
        await loadCategory('movies');
        expect(document.getElementById('error-msg').textContent).toContain('Key required');

        // Movies success
        localStorage.setItem('stacky_tmdb_key', 'k');
        checkApiKeys();
        await loadCategory('movies');
        expect(document.getElementById('rank-list').innerHTML).toContain('Inception');

        // Games error
        localStorage.removeItem('stacky_rawg_key');
        checkApiKeys();
        await loadCategory('games');
        expect(document.getElementById('error-msg').textContent).toContain('Key required');

        // Games success
        localStorage.setItem('stacky_rawg_key', 'k');
        checkApiKeys();
        await loadCategory('games');
        expect(document.getElementById('rank-list').innerHTML).toContain('Halo');
    });

    test('fetch functions failure branches', async () => {
        global.fetch.mockResolvedValue({ ok: false });
        await expect(fetchCrypto()).rejects.toThrow();
        await expect(fetchMovies()).rejects.toThrow();
        await expect(fetchGames()).rejects.toThrow();
    });

    test('renderList detail', () => {
        renderList([{ rank: 1, title: 'T', image: 'i', stat: 'S', desc: 'D' }]);
        const html = document.getElementById('rank-list').innerHTML;
        expect(html).toContain('rank-card');
        expect(html).toContain('T');
    });
});
