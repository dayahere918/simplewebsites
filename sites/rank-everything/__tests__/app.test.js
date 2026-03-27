const { fetchCrypto, fetchMovies, fetchGames, saveApiKeys } = require('../app');

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
            return Promise.resolve({ ok: true, json: () => Promise.resolve([{ name: 'Bitcoin', symbol: 'btc', current_price: 50, market_cap: 10 }]) });
        } else if (url.includes('themoviedb')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [{ title: 'Inception', poster_path: '/', vote_average: 9, release_date: '2010' }] }) });
        } else {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [{ name: 'Halo', background_image: '/', rating: 5, released: '2001' }] }) });
        }
    });
});

describe('Rank Everything', () => {
    test('fetchCrypto formats gecko data', async () => {
        const res = await fetchCrypto();
        expect(res[0].title).toBe('Bitcoin (BTC)');
    });

    test('fetchMovies formats tmdb data', async () => {
        document.getElementById('tmdb-key').value = 'key';
        saveApiKeys();
        const res = await fetchMovies();
        expect(res[0].title).toBe('Inception');
    });

    test('fetchGames formats rawg data', async () => {
        document.getElementById('rawg-key').value = 'key';
        saveApiKeys();
        const res = await fetchGames();
        expect(res[0].title).toBe('Halo');
    });
});
