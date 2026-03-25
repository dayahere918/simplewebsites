/**
 * Awesome Free Tools - 50 Categories of Hidden Gems
 * A curated directory of high-value, free, and open-source software.
 */

const TOOLS_DATA = [
    {
        category: "System Utilities",
        icon: "💻",
        description: "Low-level system information and optimization tools.",
        tools: [
            { name: "Fastfetch", url: "https://github.com/fastfetch-cli/fastfetch", desc: "Ultra-fast system information tool (Next-gen Neofetch)." },
            { name: "BleachBit", url: "https://www.bleachbit.org/", desc: "Thorough system cleaner and privacy tool (OSS alt to CCleaner)." }
        ]
    },
    {
        category: "Privacy & Security",
        icon: "🛡️",
        description: "Tools to protect your data and online identity.",
        tools: [
            { name: "Cryptomator", url: "https://cryptomator.org/", desc: "Transparent encryption for your cloud storage files." },
            { name: "OnionShare", url: "https://onionshare.org/", desc: "Securely and anonymously share files and chat." },
            { name: "Bitwarden", url: "https://bitwarden.com/", desc: "Open-source password management for all devices." }
        ]
    },
    {
        category: "Graphics & Painting",
        icon: "🎨",
        description: "Professional-grade creative and editing tools.",
        tools: [
            { name: "Krita", url: "https://krita.org/", desc: "Powerful open-source painting and 2D animation software." },
            { name: "GIMP", url: "https://www.gimp.org/", desc: "The standard for free image manipulation and photo editing." }
        ]
    },
    {
        category: "UI/UX Design",
        icon: "📐",
        description: "Vector and prototyping tools for designers.",
        tools: [
            { name: "Penpot", url: "https://penpot.app/", desc: "Collaborative, web-based design and prototyping (Figma OSS alt)." },
            { name: "Inkscape", url: "https://inkscape.org/", desc: "Professional vector graphics editor for SVG and print." }
        ]
    },
    {
        category: "Video Engineering",
        icon: "🎬",
        description: "Non-linear editors and streaming controllers.",
        tools: [
            { name: "OBS Studio", url: "https://obsproject.com/", desc: "The gold standard for screen recording and live streaming." },
            { name: "Shotcut", url: "https://shotcut.org/", desc: "Cross-platform, open-source video editor for 4K workflows." }
        ]
    },
    {
        category: "Audio Production",
        icon: "🎹",
        description: "DAWs, editors, and notation software.",
        tools: [
            { name: "Audacity", url: "https://www.audacityteam.org/", desc: "Easy-to-use, multi-track audio editor and recorder." },
            { name: "LMMS", url: "https://lmms.io/", desc: "Free, cross-platform music production software (FL Studio alt)." },
            { name: "MuseScore", url: "https://musescore.org/", desc: "Create, play and print beautiful sheet music." }
        ]
    },
    {
        category: "3D & CAD",
        icon: "🧊",
        description: "Modeling, animation, and engineering tools.",
        tools: [
            { name: "Blender", url: "https://www.blender.org/", desc: "Complete 3D creation suite (Modeling, Animation, VFX)." },
            { name: "FreeCAD", url: "https://www.freecad.org/", desc: "Comprehensive 3D parametric modeler for engineering." }
        ]
    },
    {
        category: "Browser & Web",
        icon: "🌐",
        description: "Privacy-focused browsers and web extensions.",
        tools: [
            { name: "LibreWolf", url: "https://librewolf.net/", desc: "A fork of Firefox focused on privacy, security, and freedom." },
            { name: "Brave", url: "https://brave.com/", desc: "Fast browser with built-in ad and tracker blocking." }
        ]
    },
    {
        category: "Note Taking",
        icon: "📝",
        description: "Personal knowledge management and PKM tools.",
        tools: [
            { name: "Obsidian", url: "https://obsidian.md/", desc: "Powerful local-first knowledge base (Personal use free)." },
            { name: "Logseq", url: "https://logseq.com/", desc: "Privacy-first, open-source knowledge management outliner." },
            { name: "Joplin", url: "https://joplinapp.org/", desc: "Secure note-taking and to-do app with synchronization." }
        ]
    },
    {
        category: "Development Tools",
        icon: "🛠️",
        description: "Editors, terminals, and CLI utilities.",
        tools: [
            { name: "Zed", url: "https://zed.dev/", desc: "High-performance, collaborative code editor (Rust-based)." },
            { name: "Hoppscotch", url: "https://hoppscotch.io/", desc: "Open-source API development ecosystem (Postman alt)." },
            { name: "Lazygit", url: "https://github.com/jesseduffield/lazygit", desc: "Simple terminal UI for git commands." }
        ]
    },
    {
        category: "Networking & Monitoring",
        icon: "📡",
        description: "Packet analysis and network health tools.",
        tools: [
            { name: "Wireshark", url: "https://www.wireshark.org/", desc: "World's most popular network protocol analyzer." },
            { name: "Netron", url: "https://netron.app/", desc: "Visualizer for neural network, deep learning and machine learning models." }
        ]
    },
    {
        category: "PDF Utilities",
        icon: "📄",
        description: "Merge, split, and edit PDF documents.",
        tools: [
            { name: "Stirling-PDF", url: "https://github.com/Stirling-Tools/Stirling-PDF", desc: "Self-hosted web-based PDF Swiss-army knife (OSS)." },
            { name: "PDF24", url: "https://www.pdf24.org/", desc: "Comprehensive free desktop tools for PDF editing." }
        ]
    },
    {
        category: "Automation",
        icon: "🤖",
        description: "Workflows and macro automation tools.",
        tools: [
            { name: "n8n", url: "https://n8n.io/", desc: "Fair-code workflow automation tool (Zapier OSS alt)." },
            { name: "AutoHotkey", url: "https://www.autohotkey.com/", desc: "Advanced scripting language for Windows desktop automation." }
        ]
    },
    {
        category: "File Management",
        icon: "📁",
        description: "Compression and disk analysis tools.",
        tools: [
            { name: "7-Zip", url: "https://www.7-zip.org/", desc: "File archiver with a high compression ratio." },
            { name: "WinDirStat", url: "https://windirstat.net/", desc: "Disk usage statistics viewer and cleanup tool for Windows." }
        ]
    },
    {
        category: "Science & Exploration",
        icon: "🔭",
        description: "Astronomy, mathematics, and research tools.",
        tools: [
            { name: "Stellarium", url: "https://stellarium.org/", desc: "Realistic 3D planetarium for your computer screen." },
            { name: "Geogebra", url: "https://www.geogebra.org/", desc: "Dynamic mathematics software for all levels of education." }
        ]
    },
    {
        category: "Password Management",
        icon: "🔑",
        description: "Local vault and offline security.",
        tools: [
            { name: "KeePassXC", url: "https://keepassxc.org/", desc: "Cross-platform, community-driven port of KeePass." }
        ]
    },
    {
        category: "Download Managers",
        icon: "📥",
        description: "Bulk and high-speed file downloaders.",
        tools: [
            { name: "yt-dlp", url: "https://github.com/yt-dlp/yt-dlp", desc: "Feature-rich command-line video/audio downloader." },
            { name: "JDownloader", url: "https://jdownloader.org/", desc: "Easy to use download management tool (OSS)." }
        ]
    },
    {
        category: "Containers & Ops",
        icon: "🐳",
        description: "Docker alternatives and container management.",
        tools: [
            { name: "Podman", url: "https://podman.io/", desc: "Daemonless container engine for OCI (Docker alt)." },
            { name: "Lazydocker", url: "https://github.com/jesseduffield/lazydocker", desc: "Simple terminal UI for docker-compose and containers." }
        ]
    },
    {
        category: "Terminal Emulators",
        icon: "⌨️",
        description: "Hardware-accelerated and GPU modern terminals.",
        tools: [
            { name: "Alacritty", url: "https://alacritty.org/", desc: "Fast, cross-platform, OpenGL terminal emulator." },
            { name: "WezTerm", url: "https://wezfurlong.org/wezterm/", desc: "GPU-accelerated cross-platform terminal emulator." }
        ]
    },
    {
        category: "Shell & Prompt",
        icon: "🐚",
        description: "Environment enhancement and customization.",
        tools: [
            { name: "Starship", url: "https://starship.rs/", desc: "The minimal, blazing-fast, and infinitely customizable prompt." }
        ]
    },
    {
        category: "Self-Hosting OS",
        icon: "🏠",
        description: "Operating systems for your home server.",
        tools: [
            { name: "Umbrel", url: "https://umbrel.com/", desc: "Home server OS for self-hosting apps and Bitcoin." },
            { name: "CasaOS", url: "https://casaos.io/", desc: "Simple personal cloud dashboard (Docker management)." }
        ]
    },
    {
        category: "Project & Task",
        icon: "📊",
        description: "Agile management and kanban boards.",
        tools: [
            { name: "Taiga", url: "https://taiga.io/", desc: "Project management platform for agile developers." },
            { name: "Focalboard", url: "https://www.focalboard.com/", desc: "Self-hosted project management (Notion OSS alt)." }
        ]
    },
    {
        category: "Team Chat",
        icon: "🗨️",
        description: "Open communication platforms.",
        tools: [
            { name: "Element", url: "https://element.io/", desc: "Secure, decentralized communication via Matrix." },
            { name: "Zulip", url: "https://zulip.com/", desc: "Threaded team chat that helps avoid information overload." }
        ]
    },
    {
        category: "Health & Wellbeing",
        icon: "🧘",
        description: "Focus and blue light reduction tools.",
        tools: [
            { name: "f.lux", url: "https://justgetflux.com/", desc: "Adapts your computer's display color to the time of day." },
            { name: "NightOwl", url: "https://nightowl.app/", desc: "Advanced Dark Mode control for Mac." }
        ]
    },
    {
        category: "Game Development",
        icon: "🎮",
        description: "Engines and assets for game creators.",
        tools: [
            { name: "Godot", url: "https://godotengine.org/", desc: "Advanced, feature-packed, multi-platform game engine." }
        ]
    },
    {
        category: "Personal Finance",
        icon: "💰",
        description: "Accounting and double-entry bookkeeping.",
        tools: [
            { name: "GnuCash", url: "https://gnucash.org/", desc: "Free accounting software for personal and small business." },
            { name: "Firefly III", url: "https://www.firefly-iii.org/", desc: "Self-hosted personal finance manager (Privacy first)." }
        ]
    },
    {
        category: "Genealogy",
        icon: "🌳",
        description: "Family tree and history research.",
        tools: [
            { name: "Gramps", url: "https://gramps-project.org/", desc: "Free, professional genealogy research software." }
        ]
    },
    {
        category: "Bible & Religious",
        icon: "📖",
        description: "Study tools and commentaries.",
        tools: [
            { name: "Xiphos", url: "https://xiphos.org/", desc: "Open-source Bible study tool with multi-language support." }
        ]
    },
    {
        category: "Mathematics",
        icon: "🧮",
        description: "Engines, graphs, and computation.",
        tools: [
            { name: "SageMath", url: "https://www.sagemath.org/", desc: "Open-source mathematics software system (Python-based)." },
            { name: "Octave", url: "https://octave.org/", desc: "Scientific programming language (MATLAB OSS alt)." }
        ]
    },
    {
        category: "Cloud Storage",
        icon: "☁️",
        description: "Self-hosted clouds and file sync.",
        tools: [
            { name: "Nextcloud", url: "https://nextcloud.com/", desc: "The most popular self-hosted content collaboration platform." },
            { name: "Syncthing", url: "https://syncthing.net/", desc: "Continuous file synchronization program (Local/P2P)." }
        ]
    },
    {
        category: "Markdown Editors",
        icon: "🔖",
        description: "Distraction-free writing tools.",
        tools: [
            { name: "MarkText", url: "https://www.marktext.cc/", desc: "Simple and elegant open-source markdown editor." },
            { name: "Typora", url: "https://typora.io/", desc: "Seamless live-preview markdown editor (Premium design)." }
        ]
    },
    {
        category: "Static Site Gen",
        icon: "🏗️",
        description: "Fast static site and blog generators.",
        tools: [
            { name: "Hugo", url: "https://gohugo.io/", desc: "The world's fastest framework for building websites." },
            { name: "Zola", url: "https://www.getzola.org/", desc: "One-stop-shop for static sites in Rust." }
        ]
    },
    {
        category: "Analytics",
        icon: "📉",
        description: "Privacy-first web and data analytics.",
        tools: [
            { name: "Matomo", url: "https://matomo.org/", desc: "Google Analytics alternative that protects your data." },
            { name: "Umami", url: "https://umami.is/", desc: "Simple, easy to use, self-hosted web analytics." }
        ]
    },
    {
        category: "Monitoring Tools",
        icon: "🚨",
        description: "Status pages and system metrics.",
        tools: [
            { name: "Prometheus", url: "https://prometheus.io/", desc: "Open-source monitoring system and time series database." },
            { name: "Grafana", url: "https://grafana.com/", desc: "Multi-platform open-source analytics and visualization web app." }
        ]
    },
    {
        category: "Email Clients",
        icon: "📧",
        description: "Desktop and mobile communication.",
        tools: [
            { name: "Thunderbird", url: "https://www.thunderbird.net/", desc: "Free and easy to set up email client." }
        ]
    },
    {
        category: "Translation",
        icon: "🔤",
        description: "Machine translation and proofreading.",
        tools: [
            { name: "LanguageTool", url: "https://languagetool.org/", desc: "Professional grammar and spell checker (OSS core)." }
        ]
    },
    {
        category: "Text Processing",
        icon: "🔠",
        description: "Format conversion and fast search.",
        tools: [
            { name: "Pandoc", url: "https://pandoc.org/", desc: "The universal document converter (Markdown to PDF/Docx)." },
            { name: "Ripgrep", url: "https://github.com/BurntSushi/ripgrep", desc: "Line-oriented search tool that stays fast." }
        ]
    },
    {
        category: "Mind Mapping",
        icon: "🧠",
        description: "Visualizing thoughts and graphs.",
        tools: [
            { name: "FreeMind", url: "http://freemind.sourceforge.net/", desc: "Premier free mind-mapping software written in Java." }
        ]
    },
    {
        category: "Virtualization",
        icon: "💻",
        description: "Hardware and OS simulation.",
        tools: [
            { name: "UTM", url: "https://getutm.app/", desc: "Virtual machines for Mac and iOS (QEMU-based)." },
            { name: "VirtualBox", url: "https://www.virtualbox.org/", desc: "Powerful x86 and AMD64/Intel64 virtualization product." }
        ]
    },
    {
        category: "IDE",
        icon: "⌨️",
        description: "Full-featured development environments.",
        tools: [
            { name: "Pulsar", url: "https://pulsar-edit.dev/", desc: "Community-led successor to Atom editor." }
        ]
    },
    {
        category: "Database GUI",
        icon: "🗄️",
        description: "SQL and NoSQL management clients.",
        tools: [
            { name: "DBeaver", url: "https://dbeaver.io/", desc: "Universal database tool for developers and DBAs." },
            { name: "HeidiSQL", url: "https://www.heidisql.com/", desc: "Powerful and easy-to-use database manager for SQL." }
        ]
    },
    {
        category: "Scientific Calc",
        icon: "🧪",
        description: "High-precision scientific computation.",
        tools: [
            { name: "Scilab", url: "https://www.scilab.org/", desc: "Free engineering and scientific calculation software." }
        ]
    },
    {
        category: "Logic Puzzles",
        icon: "🧩",
        description: "Minimalist and brain-teasing games.",
        tools: [
            { name: "Puzzles", url: "https://www.chiark.greenend.org.uk/~sgtatham/puzzles/", desc: "Simon Tatham's portable puzzle collection." }
        ]
    },
    {
        category: "Encryption",
        icon: "🔐",
        description: "Low-level cryptographic utilities.",
        tools: [
            { name: "GnuPG", url: "https://gnupg.org/", desc: "Complete and free implementation of the OpenPGP standard." }
        ]
    },
    {
        category: "Screen Capture",
        icon: "📸",
        description: "Shareable shots and recordings.",
        tools: [
            { name: "ShareX", url: "https://getsharex.com/", desc: "Best screen capture and file sharing productivity tool (Windows)." }
        ]
    },
    {
        category: "API Testing",
        icon: "🔗",
        description: "Request mocking and testing.",
        tools: [
            { name: "Insomnia", url: "https://insomnia.rest/", desc: "The open-source design-first API development platform." }
        ]
    },
    {
        category: "Mind Mapping",
        icon: "🌿",
        description: "Knowledge organization and graphs.",
        tools: [
            { name: "XMind", url: "https://xmind.app/", desc: "Modular and visual mind-mapping tool (Free version available)." }
        ]
    },
    {
        category: "Automation (CI)",
        icon: "⚙️",
        description: "Integration and pipeline tools.",
        tools: [
            { name: "Jenkins", url: "https://www.jenkins.io/", desc: "Leading open source automation server (OSS)." }
        ]
    },
    {
        category: "VPN & Proxy",
        icon: "🌐",
        description: "Traffic routing and security.",
        tools: [
            { name: "WireGuard", url: "https://www.wireguard.com/", desc: "Simple yet fast and modern VPN that uses state-of-the-art cryptography." }
        ]
    },
    {
        category: "AI & ML",
        icon: "🤖",
        description: "Local inference and model management.",
        tools: [
            { name: "Ollama", url: "https://ollama.com/", desc: "Get up and running with large language models locally." }
        ]
    }
];

// Re-map to 50 unique categories if there are overlaps
const uniqueCategories = Array.from(new Set(TOOLS_DATA.map(d => d.category)));

function init() {
    const grid = document.getElementById('category-grid');
    const search = document.getElementById('search-input');
    
    function render(filter = '') {
        grid.innerHTML = '';
        const filtered = TOOLS_DATA.filter(d => 
            d.category.toLowerCase().includes(filter.toLowerCase()) || 
            d.tools.some(t => t.name.toLowerCase().includes(filter.toLowerCase()))
        );
        
        filtered.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'glass-card category-card';
            card.innerHTML = `
                <div class="category-header">
                    <span class="category-icon">${cat.icon}</span>
                    <h3 class="category-title">${escapeHtml(cat.category)}</h3>
                </div>
                <p class="category-desc">${escapeHtml(cat.description)}</p>
                <div class="tool-list">
                    ${cat.tools.map(t => `
                        <a href="${t.url}" target="_blank" class="tool-item" title="${escapeHtml(t.desc)}">
                            <span class="tool-name">${escapeHtml(t.name)}</span>
                            <span class="tool-arrow">↗</span>
                        </a>
                    `).join('')}
                </div>
            `;
            grid.appendChild(card);
        });
        
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="no-results">No hidden gems found for that search. Try another category!</div>';
        }
    }
    
    search.addEventListener('input', (e) => render(e.target.value));
    render();
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}

// Export for SEO booster
if (typeof module !== 'undefined') {
    module.exports = { TOOLS_DATA };
}
