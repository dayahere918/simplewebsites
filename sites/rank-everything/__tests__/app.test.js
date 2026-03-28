const {
    fetchCrypto, fetchMovies, fetchGames, saveApiKeys, loadCategory, renderList, checkApiKeys,
    loadListsFromStorage, saveListsToStorage, createList, voteItem, deleteList,
    exportList, importList, toggleCreateList, submitNewList, renderCommunityLists,
    STORAGE_KEY
} = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="api-key-banner"></div>
        <input id="tmdb-key" value="test_tmdb" />
        <input id="rawg-key" value="test_rawg" />
        <button id="tab-crypto"></button>
        <button id="tab-movies"></button>
        <button id="tab-games"></button>
        <button id="tab-community"></button>
        <div id="loading-spinner" class="hidden"></div>
        <div id="error-msg" class="hidden"></div>
        <div id="rank-list"></div>
        <div id="community-actions" class="hidden"></div>
        <div id="create-list-ui" class="hidden"></div>
        <input id="new-list-name" value="" />
        <textarea id="new-list-items"></textarea>
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

// ── Community Lists ─────────────────────────────────────

describe('Community Lists — CRUD', () => {
    beforeEach(() => localStorage.removeItem(STORAGE_KEY));

    test('loadListsFromStorage returns empty array for no data', () => {
        expect(loadListsFromStorage()).toEqual([]);
    });

    test('createList saves and returns a list', () => {
        const list = createList('Best Foods', ['Pizza', 'Sushi', 'Tacos']);
        expect(list).not.toBeNull();
        expect(list.name).toBe('Best Foods');
        expect(list.items).toHaveLength(3);
        expect(list.items[0].votes).toBe(0);
    });

    test('createList returns null for missing name or items', () => {
        expect(createList('', ['a'])).toBeNull();
        expect(createList('X', [])).toBeNull();
        expect(createList(null, null)).toBeNull();
    });

    test('loadListsFromStorage returns saved lists', () => {
        createList('L1', ['A', 'B']);
        createList('L2', ['C', 'D']);
        const lists = loadListsFromStorage();
        expect(lists).toHaveLength(2);
    });

    test('voteItem increments/decrements votes', () => {
        const list = createList('Vote Test', ['Alpha', 'Beta']);
        const itemId = list.items[0].id;
        voteItem(list.id, itemId, 'up');
        voteItem(list.id, itemId, 'up');
        const updated = loadListsFromStorage().find(l => l.id === list.id);
        const item = updated.items.find(i => i.id === itemId);
        expect(item.votes).toBe(2);
    });

    test('voteItem down does not go below 0', () => {
        const list = createList('Down Test', ['X']);
        const itemId = list.items[0].id;
        voteItem(list.id, itemId, 'down');
        const updated = loadListsFromStorage().find(l => l.id === list.id);
        expect(updated.items[0].votes).toBe(0);
    });

    test('voteItem returns null for invalid list/item', () => {
        expect(voteItem('nope', 'nope', 'up')).toBeNull();
        const list = createList('T', ['A']);
        expect(voteItem(list.id, 'bad_id', 'up')).toBeNull();
    });

    test('deleteList removes a list', () => {
        const list = createList('Delete Me', ['A']);
        deleteList(list.id);
        expect(loadListsFromStorage()).toHaveLength(0);
    });

    test('exportList returns JSON string', () => {
        const list = createList('Export', ['A', 'B']);
        const json = exportList(list.id);
        expect(json).toContain('Export');
        expect(JSON.parse(json).name).toBe('Export');
    });

    test('exportList returns null for invalid id', () => {
        expect(exportList('nope')).toBeNull();
    });

    test('importList adds a valid list', () => {
        const data = JSON.stringify({ name: 'Imported', items: [{ id: '1', name: 'A', votes: 5 }] });
        const result = importList(data);
        expect(result).not.toBeNull();
        expect(result.name).toBe('Imported');
        expect(loadListsFromStorage()).toHaveLength(1);
    });

    test('importList returns null for invalid JSON', () => {
        expect(importList('not json')).toBeNull();
        expect(importList(JSON.stringify({ bad: true }))).toBeNull();
    });

    test('toggleCreateList shows/hides UI', () => {
        toggleCreateList(true);
        expect(document.getElementById('create-list-ui').classList.contains('hidden')).toBe(false);
        toggleCreateList(false);
        expect(document.getElementById('create-list-ui').classList.contains('hidden')).toBe(true);
    });

    test('renderCommunityLists shows empty message', () => {
        renderCommunityLists();
        expect(document.getElementById('rank-list').innerHTML).toContain('No community lists');
    });

    test('renderCommunityLists shows created lists', () => {
        createList('My List', ['Item1', 'Item2']);
        renderCommunityLists();
        const html = document.getElementById('rank-list').innerHTML;
        expect(html).toContain('My List');
        expect(html).toContain('Item1');
    });

    test('submitNewList creates list from form fields', () => {
        document.getElementById('new-list-name').value = 'Form List';
        document.getElementById('new-list-items').value = 'Apple\nBanana\nCherry';
        submitNewList();
        const lists = loadListsFromStorage();
        expect(lists).toHaveLength(1);
        expect(lists[0].name).toBe('Form List');
    });

    test('loadCategory community shows community UI', async () => {
        createList('CL', ['X', 'Y']);
        await loadCategory('community');
        expect(document.getElementById('community-actions').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('rank-list').innerHTML).toContain('CL');
    });
});
