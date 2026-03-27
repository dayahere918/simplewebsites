/**
 * Rank Everything Core Logic using TMDB, RAWG, and CoinGecko APIs
 */

let apiKeys = { tmdb: '', rawg: '' };
let currentCategory = 'crypto';

function checkApiKeys() {
    apiKeys.tmdb = localStorage.getItem('stacky_tmdb_key') || '';
    apiKeys.rawg = localStorage.getItem('stacky_rawg_key') || '';
    
    if (!apiKeys.tmdb || !apiKeys.rawg) {
        document.getElementById('api-key-banner').classList.remove('hidden');
    } else {
        document.getElementById('api-key-banner').classList.add('hidden');
    }
}

function saveApiKeys() {
    const tmdb = document.getElementById('tmdb-key').value.trim();
    const rawg = document.getElementById('rawg-key').value.trim();
    if (tmdb) localStorage.setItem('stacky_tmdb_key', tmdb);
    if (rawg) localStorage.setItem('stacky_rawg_key', rawg);
    checkApiKeys();
    
    // Reload if stuck
    if (['movies', 'games'].includes(currentCategory)) {
        loadCategory(currentCategory);
    }
}

async function loadCategory(cat) {
    currentCategory = cat;
    ['crypto', 'movies', 'games'].forEach(c => {
        const btn = document.getElementById(`tab-${c}`);
        if(btn) btn.className = c === cat ? 'btn btn-primary active' : 'btn btn-secondary';
    });
    
    const list = document.getElementById('rank-list');
    const loader = document.getElementById('loading-spinner');
    const errorEl = document.getElementById('error-msg');
    
    list.innerHTML = '';
    errorEl.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        let items = [];
        if (cat === 'crypto') {
            items = await fetchCrypto();
        } else if (cat === 'movies') {
            if (!apiKeys.tmdb) throw new Error("TMDB API Key required");
            items = await fetchMovies();
        } else if (cat === 'games') {
            if (!apiKeys.rawg) throw new Error("RAWG API Key required");
            items = await fetchGames();
        }
        
        renderList(items);
    } catch (e) {
        console.error(e);
        errorEl.textContent = `❌ Error loading ${cat}: ${e.message}`;
        errorEl.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}

async function fetchCrypto() {
    // CoinGecko open API
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false');
    if(!res.ok) throw new Error("Rate limited by CoinGecko. Try again later.");
    const data = await res.json();
    return data.map((c, i) => ({
        rank: i + 1,
        title: `${c.name} (${c.symbol.toUpperCase()})`,
        image: c.image,
        stat: `$${c.current_price.toLocaleString()}`,
        desc: `Market Cap: $${c.market_cap.toLocaleString()}`
    }));
}

async function fetchMovies() {
    const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKeys.tmdb}&language=en-US&page=1`);
    if(!res.ok) throw new Error("Invalid TMDB API Key");
    const data = await res.json();
    return data.results.slice(0, 20).map((m, i) => ({
        rank: i + 1,
        title: m.title,
        image: `https://image.tmdb.org/t/p/w200${m.poster_path}`,
        stat: `⭐ ${m.vote_average}`,
        desc: `Released: ${m.release_date}`
    }));
}

async function fetchGames() {
    const res = await fetch(`https://api.rawg.io/api/games?key=${apiKeys.rawg}&ordering=-rating&page_size=20`);
    if(!res.ok) throw new Error("Invalid RAWG API Key");
    const data = await res.json();
    return data.results.map((g, i) => ({
        rank: i + 1,
        title: g.name,
        image: g.background_image,
        stat: `⭐ ${g.rating}`,
        desc: `Released: ${g.released}`
    }));
}

function renderList(items) {
    const list = document.getElementById('rank-list');
    list.innerHTML = items.map(item => `
        <div class="rank-card flex items-center p-4 gap-4 bg-surface rounded-lg border border-border hover:border-primary transition-colors">
            <div class="rank-number text-2xl font-bold w-8 text-center text-muted">${item.rank}</div>
            <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded-md bg-bg">
            <div class="flex-grow">
                <h3 class="m-0 text-lg">${item.title}</h3>
                <p class="text-sm text-muted m-0">${item.desc}</p>
            </div>
            <div class="font-bold text-accent whitespace-nowrap">${item.stat}</div>
        </div>
    `).join('');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        checkApiKeys();
        loadCategory('crypto'); // initial load
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { saveApiKeys, fetchCrypto, fetchMovies, fetchGames };
}
