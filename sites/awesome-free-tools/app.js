/**
 * Awesome Free Tools - 50 Categories of Hidden Gems
 * A curated directory of high-value, free, and open-source software.
 */

const TOOLS_DATA = [
    {
        "category": "System Utilities",
        "icon": "💻",
        "description": "Essential core tools for system monitoring, cleaning, and booting.",
        "tools": [
            {
                "name": "Fastfetch",
                "url": "https://github.com/fastfetch-cli/fastfetch",
                "desc": "Ultra-fast, customizable system information tool written in C."
            },
            {
                "name": "BleachBit",
                "url": "https://www.bleachbit.org/",
                "desc": "Thorough system cleaner and privacy tool (OSS alternative to CCleaner)."
            },
            {
                "name": "WizTree",
                "url": "https://diskanalyzer.com/",
                "desc": "The fastest disk space analyzer for Windows (reads the MFT directly)."
            },
            {
                "name": "Everything",
                "url": "https://www.voidtools.com/",
                "desc": "Locate files and folders instantly on Windows using NTFS indexing."
            },
            {
                "name": "Rufus",
                "url": "https://rufus.ie/",
                "desc": "Create bootable USB drives the easy and fast way."
            },
            {
                "name": "Ventoy",
                "url": "https://www.ventoy.net/",
                "desc": "Open-source tool to create bootable USB drives for ISO/WIM/IMG/VHD(x)."
            },
            {
                "name": "Process Explorer",
                "url": "https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer",
                "desc": "Advanced task manager from Windows Sysinternals."
            },
            {
                "name": "HWMonitor",
                "url": "https://www.cpuid.com/softwares/hwmonitor.html",
                "desc": "Read PC systems main health sensors: voltages, temperatures, fans speed."
            },
            {
                "name": "CrystalDiskInfo",
                "url": "https://crystalmark.info/en/software/crystaldiskinfo/",
                "desc": "HDD/SSD utility supporting SMART reporting and temperature monitoring."
            },
            {
                "name": "AutoRuns",
                "url": "https://learn.microsoft.com/en-us/sysinternals/downloads/autoruns",
                "desc": "See exactly what programs are configured to startup directly during boot."
            }
        ]
    },
    {
        "category": "Privacy & Security",
        "icon": "🛡️",
        "description": "Protect your data, traffic, and personal identity globally.",
        "tools": [
            {
                "name": "Cryptomator",
                "url": "https://cryptomator.org/",
                "desc": "Transparent, client-side encryption for your cloud files."
            },
            {
                "name": "OnionShare",
                "url": "https://onionshare.org/",
                "desc": "Securely and anonymously share files and chat over the Tor network."
            },
            {
                "name": "VeraCrypt",
                "url": "https://www.veracrypt.fr/",
                "desc": "Free open-source disk encryption software for Windows, Mac OSX and Linux."
            },
            {
                "name": "DNSCloak",
                "url": "https://github.com/s-s/dnscloak",
                "desc": "DNSCrypt and DNS wrapper for iOS, enhancing mobile privacy."
            },
            {
                "name": "Portmaster",
                "url": "https://safing.io/",
                "desc": "Free and open-source application firewall that blocks mass surveillance."
            },
            {
                "name": "Privacy Badger",
                "url": "https://privacybadger.org/",
                "desc": "Browser add-on that blocks invisible trackers automatically."
            },
            {
                "name": "uBlock Origin",
                "url": "https://github.com/gorhill/uBlock",
                "desc": "Efficient wide-spectrum content blocker that is easy on CPU and memory."
            },
            {
                "name": "LocalSend",
                "url": "https://localsend.org/",
                "desc": "FOSS, AirDrop alternative to share files to nearby devices over local Wi-Fi."
            },
            {
                "name": "SimpleX Chat",
                "url": "https://simplex.chat/",
                "desc": "First encrypted messenger without user IDs of any kind."
            },
            {
                "name": "KeePassXC",
                "url": "https://keepassxc.org/",
                "desc": "Cross-platform, offline, strictly local community-driven password manager."
            }
        ]
    },
    {
        "category": "Graphics & Painting",
        "icon": "🎨",
        "description": "Powerful open-source canvas manipulation and 2D drawing.",
        "tools": [
            {
                "name": "Krita",
                "url": "https://krita.org/",
                "desc": "Professional FREE and open source painting program."
            },
            {
                "name": "GIMP",
                "url": "https://www.gimp.org/",
                "desc": "The ultimate open-source image manipulation program."
            },
            {
                "name": "Paint.NET",
                "url": "https://www.getpaint.net/",
                "desc": "Highly capable, free image and photo editing software for Windows."
            },
            {
                "name": "Photopea",
                "url": "https://www.photopea.com/",
                "desc": "Advanced web-based photo editor supporting PSD, XCF, and Sketch."
            },
            {
                "name": "Inkscape",
                "url": "https://inkscape.org/",
                "desc": "Professional quality vector graphics software."
            },
            {
                "name": "Darktable",
                "url": "https://www.darktable.org/",
                "desc": "Open source photography workflow application and RAW developer."
            },
            {
                "name": "RawTherapee",
                "url": "https://rawtherapee.com/",
                "desc": "Cross-platform raw image processing program."
            },
            {
                "name": "MagicaVoxel",
                "url": "https://ephtracy.github.io/",
                "desc": "Free, lightweight 8-bit voxel art editor and interactive path tracing renderer."
            },
            {
                "name": "LibreSprite",
                "url": "https://libresprite.github.io/",
                "desc": "Free and open source program for creating and animating your sprites."
            },
            {
                "name": "Pixelorama",
                "url": "https://orama-interactive.itch.io/pixelorama",
                "desc": "Free & open-source 2D sprite editor, made with the Godot Engine."
            }
        ]
    },
    {
        "category": "UI/UX Design",
        "icon": "📐",
        "description": "Prototyping, mockups, and collaborative vector interface design.",
        "tools": [
            {
                "name": "Penpot",
                "url": "https://penpot.app/",
                "desc": "The first open-source design and prototyping platform meant for cross-domain teams."
            },
            {
                "name": "Lunacy",
                "url": "https://icons8.com/lunacy",
                "desc": "Free design software for UI, UX, and web by Icons8. Unlocked assets."
            },
            {
                "name": "Akira",
                "url": "https://github.com/akiraux/Akira",
                "desc": "Native Linux Design application built in Vala and GTK."
            },
            {
                "name": "Pencil Project",
                "url": "https://pencil.evolus.vn/",
                "desc": "Built-in stencils for diagramming and making UI mockups freely."
            },
            {
                "name": "Excalidraw",
                "url": "https://excalidraw.com/",
                "desc": "Virtual whiteboard for sketching hand-drawn like diagrams."
            },
            {
                "name": "Tldraw",
                "url": "https://tldraw.com/",
                "desc": "A tiny, very highly capable collaborative whiteboard."
            },
            {
                "name": "Draw.io",
                "url": "https://app.diagrams.net/",
                "desc": "Free, high quality, and completely open diagram software."
            },
            {
                "name": "Figma",
                "url": "https://www.figma.com/",
                "desc": "Industry standard collaborative interface design tool (Free tier)."
            },
            {
                "name": "Uizard",
                "url": "https://uizard.io/",
                "desc": "Rapid, AI-powered UI design tool for wireframing (Free tier)."
            },
            {
                "name": "Wireflow",
                "url": "https://wireflow.co/",
                "desc": "Free online user flow architecture tool."
            }
        ]
    },
    {
        "category": "Video Engineering",
        "icon": "🎬",
        "description": "Non-linear editors, transcoding, and stream encoders.",
        "tools": [
            {
                "name": "OBS Studio",
                "url": "https://obsproject.com/",
                "desc": "Free, open source software for live streaming and screen recording."
            },
            {
                "name": "Shotcut",
                "url": "https://shotcut.org/",
                "desc": "A free, open source, cross-platform video editor."
            },
            {
                "name": "Kdenlive",
                "url": "https://kdenlive.org/",
                "desc": "Libre video editor for advanced multi-track non-linear workflows."
            },
            {
                "name": "DaVinci Resolve",
                "url": "https://www.blackmagicdesign.com/products/davinciresolve",
                "desc": "Hollywood-grade video editing, color correction, and VFX (Free version)."
            },
            {
                "name": "OpenShot",
                "url": "https://www.openshot.org/",
                "desc": "Incredibly simple and powerful free video editor."
            },
            {
                "name": "LosslessCut",
                "url": "https://mifi.no/losslesscut/",
                "desc": "The swiss army knife of lossless video/audio editing."
            },
            {
                "name": "HandBrake",
                "url": "https://handbrake.fr/",
                "desc": "The open source video transcoder standard for almost any format."
            },
            {
                "name": "Avidemux",
                "url": "http://avidemux.sourceforge.net/",
                "desc": "Free video editor designed for simple cutting, filtering and encoding tasks."
            },
            {
                "name": "Natron",
                "url": "https://natrongithub.github.io/",
                "desc": "Open-source nodal compositing software, an alt to After Effects."
            },
            {
                "name": "ShanaEncoder",
                "url": "https://shana.pe.kr/",
                "desc": "Super fast, lightweight, and powerful audio/video encoding program."
            }
        ]
    },
    {
        "category": "Audio Production",
        "icon": "🎹",
        "description": "Cross-platform DAWs, MIDI sequencers, and podcast editors.",
        "tools": [
            {
                "name": "Audacity",
                "url": "https://www.audacityteam.org/",
                "desc": "The easy-to-use, multi-track audio editor and recorder."
            },
            {
                "name": "LMMS",
                "url": "https://lmms.io/",
                "desc": "Free, cross-platform music production software (FL Studio alt)."
            },
            {
                "name": "MuseScore",
                "url": "https://musescore.org/",
                "desc": "Create, play and print beautiful sheet music effortlessly."
            },
            {
                "name": "Ardour",
                "url": "https://ardour.org/",
                "desc": "Complete digital audio workstation for recording, editing, and mixing."
            },
            {
                "name": "Cakewalk",
                "url": "https://www.bandlab.com/products/cakewalk",
                "desc": "Professional SONAR-based digital audio workstation (Free on Windows)."
            },
            {
                "name": "Surge XT",
                "url": "https://surge-synthesizer.github.io/",
                "desc": "Incredibly powerful open-source hybrid synthesizer plugin."
            },
            {
                "name": "Vital",
                "url": "https://vital.audio/",
                "desc": "Spectral warping wavetable synthesizer (Free Basic Version)."
            },
            {
                "name": "VCV Rack",
                "url": "https://vcvrack.com/",
                "desc": "The open-source virtual Eurorack DAWs."
            },
            {
                "name": "Tenacity",
                "url": "https://tenacityaudio.org/",
                "desc": "Privacy-focused, community-driven fork of Audacity."
            },
            {
                "name": "Ocenaudio",
                "url": "https://www.ocenaudio.com/",
                "desc": "Easy, fast and powerful audio editor (Vamp/VST support)."
            }
        ]
    },
    {
        "category": "3D & CAD",
        "icon": "🧊",
        "description": "VFX, parametric modeling, and architectural drafting.",
        "tools": [
            {
                "name": "Blender",
                "url": "https://www.blender.org/",
                "desc": "Complete open source 3D creation suite and render engine."
            },
            {
                "name": "FreeCAD",
                "url": "https://www.freecad.org/",
                "desc": "Scriptable 3D parametric modeler for mechanical engineering."
            },
            {
                "name": "OpenSCAD",
                "url": "https://openscad.org/",
                "desc": "The programmers solid 3D CAD modeller."
            },
            {
                "name": "LibreCAD",
                "url": "https://librecad.org/",
                "desc": "High quality 2D-CAD application available worldwide."
            },
            {
                "name": "Sweet Home 3D",
                "url": "https://www.sweethome3d.com/",
                "desc": "Free interior design application to draw floor plans."
            },
            {
                "name": "BRL-CAD",
                "url": "https://brlcad.org/",
                "desc": "Powerful cross-platform solid modeling system from the US Military."
            },
            {
                "name": "SolveSpace",
                "url": "https://solvespace.com/",
                "desc": "Parametric 3D CAD tool for engineering design."
            },
            {
                "name": "Dust3D",
                "url": "https://dust3d.org/",
                "desc": "Cross-platform open-source 3D modeling software for quick base meshes."
            },
            {
                "name": "Blockbench",
                "url": "https://www.blockbench.net/",
                "desc": "Free, modern box modeling app for voxel and low-poly art."
            },
            {
                "name": "ArmorPaint",
                "url": "https://armorpaint.org/",
                "desc": "Open-source 3D PBR texture painting software."
            }
        ]
    },
    {
        "category": "Browser & Web",
        "icon": "🌐",
        "description": "Privacy-focused forks, speed optimizations, and development containers.",
        "tools": [
            {
                "name": "LibreWolf",
                "url": "https://librewolf.net/",
                "desc": "A fork of Firefox focused entirely on privacy, security, and freedom."
            },
            {
                "name": "Brave",
                "url": "https://brave.com/",
                "desc": "Extra-fast browser with a strict built-in ad and tracker blocker."
            },
            {
                "name": "Vivaldi",
                "url": "https://vivaldi.com/",
                "desc": "Power-user browser with extreme customization for power users."
            },
            {
                "name": "Floorp",
                "url": "https://floorp.app/",
                "desc": "Lightning fast and highly customizable Firefox derivative from Japan."
            },
            {
                "name": "Zen Browser",
                "url": "https://zen-browser.app/",
                "desc": "Modern, clean, and extremely fast web browser utilizing Firefox engine."
            },
            {
                "name": "Thorium",
                "url": "https://thorium.rocks/",
                "desc": "The fastest browser on Earth. Compiler-optimized Chromium fork."
            },
            {
                "name": "Mullvad Browser",
                "url": "https://mullvad.net/en/browser",
                "desc": "Privacy-focused browser created in collaboration with Tor Project."
            },
            {
                "name": "Tor Browser",
                "url": "https://www.torproject.org/",
                "desc": "Defend against tracking and surveillance perfectly."
            },
            {
                "name": "Firefox Developer",
                "url": "https://www.mozilla.org/en-US/firefox/developer/",
                "desc": "The browser built specifically for people who build the web."
            },
            {
                "name": "Arc",
                "url": "https://arc.net/",
                "desc": "The Chrome replacement built for how you actually use the internet (Free)."
            }
        ]
    },
    {
        "category": "Note Taking",
        "icon": "📝",
        "description": "Local-first knowledge managers and outliners.",
        "tools": [
            {
                "name": "Obsidian",
                "url": "https://obsidian.md/",
                "desc": "The ultimate local-first knowledge base on top of plain text (Free personal)."
            },
            {
                "name": "Logseq",
                "url": "https://logseq.com/",
                "desc": "Privacy-first, open-source knowledge management outliner."
            },
            {
                "name": "Joplin",
                "url": "https://joplinapp.org/",
                "desc": "Excellent secure note-taking and to-do app with cross-sync."
            },
            {
                "name": "Appflowy",
                "url": "https://appflowy.io/",
                "desc": "Open-source Notion alternative with complete control of data."
            },
            {
                "name": "Anytype",
                "url": "https://anytype.io/",
                "desc": "Local-first, encrypted, open-web Notion alternative."
            },
            {
                "name": "Outline",
                "url": "https://www.getoutline.com/",
                "desc": "Fast, collaborative, open-source knowledge base for teams."
            },
            {
                "name": "SilverBullet",
                "url": "https://silverbullet.md/",
                "desc": "Hacker-friendly, highly extensible personal knowledge platform."
            },
            {
                "name": "QOwnNotes",
                "url": "https://www.qownnotes.org/",
                "desc": "Plain-text file markdown note pad with Nextcloud integration."
            },
            {
                "name": "Zettlr",
                "url": "https://www.zettlr.com/",
                "desc": "A Markdown editor for academic and researcher workflows."
            },
            {
                "name": "Standard Notes",
                "url": "https://standardnotes.com/",
                "desc": "Strictly encrypted, long-term survival note-taking app."
            }
        ]
    },
    {
        "category": "Development Tools",
        "icon": "🛠️",
        "description": "Native code editors, API development ecosystems, and SQL clients.",
        "tools": [
            {
                "name": "Zed",
                "url": "https://zed.dev/",
                "desc": "Insanely fast code editor built in Rust by the creators of Atom."
            },
            {
                "name": "Hoppscotch",
                "url": "https://hoppscotch.io/",
                "desc": "Open-source API development ecosystem (Postman OSS replacement)."
            },
            {
                "name": "Lazygit",
                "url": "https://github.com/jesseduffield/lazygit",
                "desc": "Simple terminal UI for safely navigating git commands."
            },
            {
                "name": "Bruno",
                "url": "https://www.usebruno.com/",
                "desc": "Git-friendly, offline-first open-source API client."
            },
            {
                "name": "Insomnia",
                "url": "https://insomnia.rest/",
                "desc": "The open-source design-first API development platform."
            },
            {
                "name": "DBeaver CE",
                "url": "https://dbeaver.io/",
                "desc": "Universal database tool for developers and administrators."
            },
            {
                "name": "Beekeeper Studio",
                "url": "https://www.beekeeperstudio.io/",
                "desc": "Modern and open source SQL editor and database manager."
            },
            {
                "name": "DB Gate",
                "url": "https://dbgate.org/",
                "desc": "Open Source cross platform database manager."
            },
            {
                "name": "DB Browser",
                "url": "https://sqlitebrowser.org/",
                "desc": "High quality visual, open source tool to create and edit SQLite."
            },
            {
                "name": "HTTPie",
                "url": "https://httpie.io/",
                "desc": "Modern user-friendly command-line HTTP client and web interface."
            }
        ]
    },
    {
        "category": "Networking & Monitoring",
        "icon": "📡",
        "description": "Packet sniffers, node explorers, and connection interceptors.",
        "tools": [
            {
                "name": "Wireshark",
                "url": "https://www.wireshark.org/",
                "desc": "The world's most widely-used network protocol analyzer."
            },
            {
                "name": "Nmap",
                "url": "https://nmap.org/",
                "desc": "Free utility for network discovery and security auditing."
            },
            {
                "name": "Angry IP",
                "url": "https://angryip.org/",
                "desc": "Fast and friendly network scanner for Windows, Mac and Linux."
            },
            {
                "name": "Proxyman",
                "url": "https://proxyman.io/",
                "desc": "Modern Web Debugging Proxy for macOS, iOS, and Android (Free Tier)."
            },
            {
                "name": "Fiddler Classic",
                "url": "https://www.telerik.com/fiddler/fiddler-classic",
                "desc": "The original free web debugging proxy for Windows."
            },
            {
                "name": "Netron",
                "url": "https://netron.app/",
                "desc": "Visualizer for neural network topology and deep learning models."
            },
            {
                "name": "TCPView",
                "url": "https://learn.microsoft.com/en-us/sysinternals/downloads/tcpview",
                "desc": "Windows program that shows detailed listings of all TCP/UDP endpoints."
            },
            {
                "name": "GlassWire",
                "url": "https://www.glasswire.com/",
                "desc": "Visual network monitor & firewall to catch unexpected threats (Free tier)."
            },
            {
                "name": "SlothInspect",
                "url": "https://github.com/aress31/slothinspect",
                "desc": "Network traffic analyzer designed for simplicity."
            },
            {
                "name": "Zenmap",
                "url": "https://nmap.org/zenmap/",
                "desc": "Official Nmap Security Scanner GUI."
            }
        ]
    },
    {
        "category": "PDF Utilities",
        "icon": "📄",
        "description": "Merge, sign, annotate, and self-hosted document toolkits.",
        "tools": [
            {
                "name": "Stirling-PDF",
                "url": "https://github.com/Stirling-Tools/Stirling-PDF",
                "desc": "Robust, locally hosted web-based PDF manipulation tool."
            },
            {
                "name": "PDF24",
                "url": "https://tools.pdf24.org/",
                "desc": "Free online and desktop tools targeting all PDF needs."
            },
            {
                "name": "Sumatra PDF",
                "url": "https://www.sumatrapdfreader.org/",
                "desc": "Incredibly fast, minimalist PDF, eBook, and comic reader."
            },
            {
                "name": "Okular",
                "url": "https://okular.kde.org/",
                "desc": "Universal and highly equipped document viewer by KDE."
            },
            {
                "name": "Sioyek",
                "url": "https://sioyek.info/",
                "desc": "PDF viewer designed specifically for reading research papers."
            },
            {
                "name": "Xournal++",
                "url": "https://xournalpp.github.io/",
                "desc": "Handwriting notetaking software with PDF annotation."
            },
            {
                "name": "PDFsam Basic",
                "url": "https://pdfsam.org/download-pdfsam-basic/",
                "desc": "Free, open source, multi-platform software to split, merge, and extract pages."
            },
            {
                "name": "ILovePDF",
                "url": "https://www.ilovepdf.com/",
                "desc": "Every tool you need to work with PDFs in one place (Free tier)."
            },
            {
                "name": "MuPDF",
                "url": "https://mupdf.com/",
                "desc": "Lightweight PDF, XPS, and E-book viewer."
            },
            {
                "name": "Pdftk",
                "url": "https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/",
                "desc": "A simple command-line tool for doing everyday things with PDF documents."
            }
        ]
    },
    {
        "category": "Automation",
        "icon": "🤖",
        "description": "Macro scripts, fair-code web hooks, and system power-ups.",
        "tools": [
            {
                "name": "n8n",
                "url": "https://n8n.io/",
                "desc": "Free and open fair-code workflow automation tool (Zapier alternative)."
            },
            {
                "name": "AutoHotkey",
                "url": "https://www.autohotkey.com/",
                "desc": "Ultimate scripting language for Windows desktop automation."
            },
            {
                "name": "PowerToys",
                "url": "https://learn.microsoft.com/en-us/windows/powertoys/",
                "desc": "Collection of system utilities for Windows power users."
            },
            {
                "name": "Espanso",
                "url": "https://espanso.org/",
                "desc": "Cross-platform Text Expander written in Rust."
            },
            {
                "name": "AutoIt",
                "url": "https://www.autoitscript.com/",
                "desc": "BASIC-like scripting language designed for automating Windows GUI."
            },
            {
                "name": "Tasker",
                "url": "https://tasker.joaoapps.com/",
                "desc": "Total automation for Android devices (Not free, but standard)."
            },
            {
                "name": "Automate",
                "url": "https://llamalab.com/automate/",
                "desc": "Create flowcharts to automate various tasks on your Android device."
            },
            {
                "name": "Hammerspoon",
                "url": "https://www.hammerspoon.org/",
                "desc": "Powerful automation tool for macOS using Lua scripting."
            },
            {
                "name": "Huginn",
                "url": "https://github.com/huginn/huginn",
                "desc": "Create agents that monitor and act on your behalf on the web."
            },
            {
                "name": "Node-RED",
                "url": "https://nodered.org/",
                "desc": "Low-code programming for event-driven applications."
            }
        ]
    },
    {
        "category": "File Management",
        "icon": "📁",
        "description": "FTP clients, deduplicators, dual-pane viewers, and archivers.",
        "tools": [
            {
                "name": "7-Zip",
                "url": "https://www.7-zip.org/",
                "desc": "The legendary open-source file archiver with max compression."
            },
            {
                "name": "WinDirStat",
                "url": "https://windirstat.net/",
                "desc": "Disk usage statistics viewer and tree-map cleanup tool."
            },
            {
                "name": "PeaZip",
                "url": "https://peazip.github.io/",
                "desc": "Free Zip / Unzip software and Rar file extractor."
            },
            {
                "name": "Double Commander",
                "url": "https://doublecmd.sourceforge.io/",
                "desc": "Cross platform open source solid state dual pane file manager."
            },
            {
                "name": "FreeFileSync",
                "url": "https://freefilesync.org/",
                "desc": "Folder comparison and synchronization software."
            },
            {
                "name": "SyncTrayzor",
                "url": "https://github.com/canton7/SyncTrayzor",
                "desc": "Windows tray utility for Syncthing's continuous file sync."
            },
            {
                "name": "FileZilla",
                "url": "https://filezilla-project.org/",
                "desc": "The free FTP solution for client and server deployment."
            },
            {
                "name": "Cyberduck",
                "url": "https://cyberduck.io/",
                "desc": "Libre FTP, SFTP, WebDAV, Amazon S3, and OpenStack Swift browser."
            },
            {
                "name": "WinSCP",
                "url": "https://winscp.net/",
                "desc": "Popular free SFTP and FTP client for Windows."
            },
            {
                "name": "Explorer++",
                "url": "https://explorerplusplus.com/",
                "desc": "Free multi-tabbed file manager for Windows."
            }
        ]
    },
    {
        "category": "Science & Exploration",
        "icon": "🔭",
        "description": "Planetariums, compute-folding grinds, and global GIS tools.",
        "tools": [
            {
                "name": "Stellarium",
                "url": "https://stellarium.org/",
                "desc": "Awesome realistic 3D planetarium for your computer screen."
            },
            {
                "name": "Geogebra",
                "url": "https://www.geogebra.org/",
                "desc": "Dynamic mathematics software for students bridging geometry & algebra."
            },
            {
                "name": "Celestia",
                "url": "https://celestiaproject.space/",
                "desc": "Real-time 3D visualization of space spanning the known universe."
            },
            {
                "name": "BOINC",
                "url": "https://boinc.berkeley.edu/",
                "desc": "Open-source software for volunteer distributed desktop grid computing."
            },
            {
                "name": "Folding@Home",
                "url": "https://foldingathome.org/",
                "desc": "Donate idle PC power to help find cures for diseases."
            },
            {
                "name": "JOSM",
                "url": "https://josm.openstreetmap.de/",
                "desc": "Extensible editor for OpenStreetMap written in Java."
            },
            {
                "name": "QGIS",
                "url": "https://qgis.org/",
                "desc": "A Free and Open Source Geographic Information System."
            },
            {
                "name": "Marble",
                "url": "https://marble.kde.org/",
                "desc": "Virtual globe and world atlas by KDE."
            },
            {
                "name": "SpaceEngine",
                "url": "http://spaceengine.org/",
                "desc": "Realistic virtual universe you can explore (Older v0.980 is free)."
            },
            {
                "name": "NASA Eyes",
                "url": "https://eyes.nasa.gov/",
                "desc": "Explore the Earth, Solar System, and universe in 3D."
            }
        ]
    },
    {
        "category": "Password Management",
        "icon": "🔑",
        "description": "Offline vaults, self-hosted syncs, and stateless generators.",
        "tools": [
            {
                "name": "AuthPass",
                "url": "https://authpass.app/",
                "desc": "Keepass compatible, Flutter-based password manager for all platforms."
            },
            {
                "name": "Vaultwarden",
                "url": "https://github.com/dani-garcia/vaultwarden",
                "desc": "Unofficial Bitwarden compatible server written in Rust."
            },
            {
                "name": "Password Safe",
                "url": "https://pwsafe.org/",
                "desc": "Classic, highly reliable password database manager."
            },
            {
                "name": "Padloc",
                "url": "https://padloc.app/",
                "desc": "Open source password manager with a modern minimalist interface."
            },
            {
                "name": "Pass",
                "url": "https://www.passwordstore.org/",
                "desc": "The standard Unix password manager (Git and GPG integration)."
            },
            {
                "name": "LessPass",
                "url": "https://lesspass.com/",
                "desc": "Stateless password manager (computes them instead of storing them)."
            },
            {
                "name": "Spectre",
                "url": "https://spectre.app/",
                "desc": "A mathematically pure password generator avoiding dark sync chains."
            },
            {
                "name": "Buttercup",
                "url": "https://buttercup.pw/",
                "desc": "Beautiful, encrypted, open-source password manager."
            },
            {
                "name": "MacPass",
                "url": "https://macpassapp.org/",
                "desc": "Native macOS KeePass client (open-source)."
            },
            {
                "name": "KeeWeb",
                "url": "https://keeweb.info/",
                "desc": "Free cross-platform password manager compatible with KeePass."
            }
        ]
    },
    {
        "category": "Download Managers",
        "icon": "📥",
        "description": "High-thread concurrent downloaders and video scrapers.",
        "tools": [
            {
                "name": "yt-dlp",
                "url": "https://github.com/yt-dlp/yt-dlp",
                "desc": "Feature-rich command-line video/audio downloader."
            },
            {
                "name": "JDownloader 2",
                "url": "https://jdownloader.org/",
                "desc": "Platform independent, totally free download management tool."
            },
            {
                "name": "FDM",
                "url": "https://www.freedownloadmanager.org/",
                "desc": "Fast and safe torrent client and download accelerator."
            },
            {
                "name": "Aria2",
                "url": "https://aria2.github.io/",
                "desc": "Ultra lightweight multi-protocol & multi-source CLI download utility."
            },
            {
                "name": "Motrix",
                "url": "https://motrix.app/",
                "desc": "Full-featured download manager supporting HTTP, FTP, BitTorrent."
            },
            {
                "name": "XDM",
                "url": "https://xtremedownloadmanager.com/",
                "desc": "Free tool that increases download speeds up to 500%."
            },
            {
                "name": "uGet",
                "url": "https://ugetdm.com/",
                "desc": "Lightweight, powerful, open-source download manager."
            },
            {
                "name": "Persepolis",
                "url": "https://persepolisdm.github.io/",
                "desc": "A graphical wrapper for aria2 downloader."
            },
            {
                "name": "qBittorrent",
                "url": "https://www.qbittorrent.org/",
                "desc": "Leading open-source software alternative to µTorrent."
            },
            {
                "name": "Transmission",
                "url": "https://transmissionbt.com/",
                "desc": "Fast, easy, and completely free BitTorrent client."
            }
        ]
    },
    {
        "category": "Containers & Ops",
        "icon": "🐳",
        "description": "Docker alternatives, orchestration UIs, and homelab dashboards.",
        "tools": [
            {
                "name": "Podman",
                "url": "https://podman.io/",
                "desc": "Daemonless, open source, Linux native tool designed to find and run containers."
            },
            {
                "name": "Lazydocker",
                "url": "https://github.com/jesseduffield/lazydocker",
                "desc": "Simple graphical terminal UI for docker and docker-compose."
            },
            {
                "name": "Portainer",
                "url": "https://www.portainer.io/",
                "desc": "Beautiful GUI for managing Docker, Swarm, Kubernetes and ACI."
            },
            {
                "name": "Dockge",
                "url": "https://github.com/louislam/dockge",
                "desc": "Reactive, self-hosted docker-compose.yaml management tool."
            },
            {
                "name": "Coolify",
                "url": "https://coolify.io/",
                "desc": "Open-source, self-hostable Heroku / Netlify alternative."
            },
            {
                "name": "Cosmos Server",
                "url": "https://cosmos-cloud.io/",
                "desc": "Secure, self-hosted reverse proxy, container manager, and identity provider."
            },
            {
                "name": "CapRover",
                "url": "https://caprover.com/",
                "desc": "Scalable PaaS in 5 minutes, built on Docker Swarm."
            },
            {
                "name": "Dokku",
                "url": "https://dokku.com/",
                "desc": "The smallest PaaS implementation you've ever seen."
            },
            {
                "name": "Minikube",
                "url": "https://minikube.sigs.k8s.io/",
                "desc": "Run Kubernetes locally natively and quickly."
            },
            {
                "name": "LXD",
                "url": "https://ubuntu.com/lxd",
                "desc": "Next-generation system container manager."
            }
        ]
    },
    {
        "category": "Terminal Emulators",
        "icon": "⌨️",
        "description": "GPU-accelerated, native memory-safe, and highly customizable terminals.",
        "tools": [
            {
                "name": "Alacritty",
                "url": "https://alacritty.org/",
                "desc": "Cross-platform, extreme-performance OpenGL terminal emulator."
            },
            {
                "name": "WezTerm",
                "url": "https://wezfurlong.org/wezterm/",
                "desc": "GPU-accelerated cross-platform terminal emulator and multiplexer (LUA config)."
            },
            {
                "name": "Kitty",
                "url": "https://sw.kovidgoyal.net/kitty/",
                "desc": "The fast, featureful, GPU based terminal emulator."
            },
            {
                "name": "Ghostty",
                "url": "https://mitchellh.com/ghostty",
                "desc": "A fast, native, feature-rich terminal emulator purpose-built from scratch."
            },
            {
                "name": "Windows Terminal",
                "url": "https://github.com/microsoft/terminal",
                "desc": "Modern, fast, efficient application for command-line users."
            },
            {
                "name": "Warp",
                "url": "https://www.warp.dev/",
                "desc": "The terminal for the 21st century (Free for individuals)."
            },
            {
                "name": "iTerm2",
                "url": "https://iterm2.com/",
                "desc": "macOS terminal replacement that does what it should."
            },
            {
                "name": "Hyper",
                "url": "https://hyper.is/",
                "desc": "A terminal built on web technologies for extreme styling."
            },
            {
                "name": "Tabby",
                "url": "https://tabby.sh/",
                "desc": "Highly configurable terminal emulator for Windows, macOS and Linux."
            },
            {
                "name": "Contour",
                "url": "https://github.com/contour-terminal/contour",
                "desc": "Modern, fast, vi-like terminal emulator."
            }
        ]
    },
    {
        "category": "Shell & Prompt",
        "icon": "🐚",
        "description": "Command-line expansions, modern tooling, and smart rust replacements.",
        "tools": [
            {
                "name": "Starship",
                "url": "https://starship.rs/",
                "desc": "The minimal, blazing-fast, and infinitely customizable prompt for any shell."
            },
            {
                "name": "Oh My Zsh",
                "url": "https://ohmyz.sh/",
                "desc": "A delightful community-driven framework for managing your zsh configuration."
            },
            {
                "name": "Fish Shell",
                "url": "https://fishshell.com/",
                "desc": "The smart and user-friendly command line shell."
            },
            {
                "name": "Nushell",
                "url": "https://www.nushell.sh/",
                "desc": "A new type of shell, written in Rust, dealing in typed data."
            },
            {
                "name": "Zoxide",
                "url": "https://github.com/ajeetdsouza/zoxide",
                "desc": "A smarter cd command. Remembers which directories you use most frequently."
            },
            {
                "name": "Fzf",
                "url": "https://github.com/junegunn/fzf",
                "desc": "A general-purpose command-line fuzzy finder."
            },
            {
                "name": "Bat",
                "url": "https://github.com/sharkdp/bat",
                "desc": "A cat(1) clone with syntax highlighting and Git integration."
            },
            {
                "name": "Eza",
                "url": "https://github.com/eza-community/eza",
                "desc": "Modern, maintained replacement for 'ls'."
            },
            {
                "name": "Ripgrep",
                "url": "https://github.com/BurntSushi/ripgrep",
                "desc": "Line-oriented search tool that recursively searches the current directory for a regex pattern."
            },
            {
                "name": "Fd",
                "url": "https://github.com/sharkdp/fd",
                "desc": "A simple, fast and user-friendly alternative to 'find'."
            }
        ]
    },
    {
        "category": "Self-Hosting OS",
        "icon": "🏠",
        "description": "Naked metal homelab supervisors and smart home servers.",
        "tools": [
            {
                "name": "Umbrel",
                "url": "https://umbrel.com/",
                "desc": "Home server OS for self-hosting apps and personal nodes."
            },
            {
                "name": "CasaOS",
                "url": "https://casaos.io/",
                "desc": "Simple, elegant personal cloud dashboard built for Docker."
            },
            {
                "name": "TrueNAS CORE",
                "url": "https://www.truenas.com/truenas-core/",
                "desc": "The World's #1 Open Source Storage OS (ZFS)."
            },
            {
                "name": "Proxmox VE",
                "url": "https://www.proxmox.com/",
                "desc": "Enterprise-class virtualization platform (VMs & LXC)."
            },
            {
                "name": "OpenMediaVault",
                "url": "https://www.openmediavault.org/",
                "desc": "The next generation network attached storage (NAS) solution."
            },
            {
                "name": "XCP-ng",
                "url": "https://xcp-ng.org/",
                "desc": "High performance enterprise-level virtualization platform without limits."
            },
            {
                "name": "Yunohost",
                "url": "https://yunohost.org/",
                "desc": "Server OS aiming to make self-hosting accessible to everyone."
            },
            {
                "name": "DietPi",
                "url": "https://dietpi.com/",
                "desc": "Ligthweight justice for your single-board computers (Raspberry Pi)."
            },
            {
                "name": "Sandstorm",
                "url": "https://sandstorm.io/",
                "desc": "Open source platform for personal servers with radical app confinement."
            },
            {
                "name": "FreedomBox",
                "url": "https://freedombox.org/",
                "desc": "A private web server for non-experts."
            }
        ]
    },
    {
        "category": "Project & Task",
        "icon": "📊",
        "description": "Agile kanbans, timesheets, and collaborative boards.",
        "tools": [
            {
                "name": "Taiga",
                "url": "https://taiga.io/",
                "desc": "Project management platform for agile developers & designers."
            },
            {
                "name": "Focalboard",
                "url": "https://www.focalboard.com/",
                "desc": "Self-hosted project management (Open source Notion alt)."
            },
            {
                "name": "Plane",
                "url": "https://plane.so/",
                "desc": "The open-source software development tool to manage issues."
            },
            {
                "name": "Planka",
                "url": "https://planka.app/",
                "desc": "Elegant open source project tracking for agile teams (Trello alt)."
            },
            {
                "name": "Wekan",
                "url": "https://wekan.github.io/",
                "desc": "The open-source kanban (built with Meteor)."
            },
            {
                "name": "Vikunja",
                "url": "https://vikunja.io/",
                "desc": "The open-source, self-hostable to-do app to organize your life."
            },
            {
                "name": "Super Productivity",
                "url": "https://super-productivity.com/",
                "desc": "To do list & time tracker for programmers and designers."
            },
            {
                "name": "Taskwarrior",
                "url": "https://taskwarrior.org/",
                "desc": "Free and Open Source command-line task management."
            },
            {
                "name": "Leantime",
                "url": "https://leantime.io/",
                "desc": "Strategic project management for non-project managers."
            },
            {
                "name": "OpenProject",
                "url": "https://www.openproject.org/",
                "desc": "The leading open source project management software."
            }
        ]
    },
    {
        "category": "Team Chat",
        "icon": "🗨️",
        "description": "Encrypted communications and workplace collaboration hubs.",
        "tools": [
            {
                "name": "Element",
                "url": "https://element.io/",
                "desc": "Secure, decentralized communication utilizing the Matrix protocol."
            },
            {
                "name": "Zulip",
                "url": "https://zulip.com/",
                "desc": "Open-source team chat that helps avoid inbox overload with threading."
            },
            {
                "name": "Mattermost",
                "url": "https://mattermost.com/",
                "desc": "Secure collaboration hub for technical and operational teams."
            },
            {
                "name": "Rocket.Chat",
                "url": "https://rocket.chat/",
                "desc": "Fully customizable open source communications platform."
            },
            {
                "name": "Revolt",
                "url": "https://revolt.chat/",
                "desc": "Open source, privacy-first Discord alternative."
            },
            {
                "name": "Signal",
                "url": "https://signal.org/",
                "desc": "The standard metric for encrypted messaging worldwide."
            },
            {
                "name": "Session",
                "url": "https://getsession.org/",
                "desc": "End-to-end encrypted messenger that removes sensitive metadata."
            },
            {
                "name": "Tox",
                "url": "https://tox.chat/",
                "desc": "A New Kind of Instant Messaging. Secure and distributed."
            },
            {
                "name": "Jami",
                "url": "https://jami.net/",
                "desc": "Free and universal GNU communication software respecting user freedom."
            },
            {
                "name": "Delta Chat",
                "url": "https://delta.chat/",
                "desc": "Chat app that works like Telegram but runs over the traditional email network."
            }
        ]
    },
    {
        "category": "Health & Wellbeing",
        "icon": "🧘",
        "description": "Ergonomics, blue light reduction, and habit building.",
        "tools": [
            {
                "name": "f.lux",
                "url": "https://justgetflux.com/",
                "desc": "Adapts your computer's display color tone to the time of day."
            },
            {
                "name": "Stretchly",
                "url": "https://hovancik.net/stretchly/",
                "desc": "The break time reminder app that prevents RSI."
            },
            {
                "name": "SafeEyes",
                "url": "https://slgobinath.github.io/SafeEyes/",
                "desc": "Protect your eyes from asthenopia by strictly resting them."
            },
            {
                "name": "Workrave",
                "url": "https://workrave.org/",
                "desc": "Assists in the recovery and prevention of Repetitive Strain Injury."
            },
            {
                "name": "Habitica",
                "url": "https://habitica.com/",
                "desc": "Gamify your life with this open source habit building app."
            },
            {
                "name": "Loop Habit Tracker",
                "url": "https://loophabits.org/",
                "desc": "Track your habits completely offline with open source Android app."
            },
            {
                "name": "ActivityWatch",
                "url": "https://activitywatch.net/",
                "desc": "Open-source, privacy-first automated time tracker."
            },
            {
                "name": "Redshift",
                "url": "http://jonls.dk/redshift/",
                "desc": "Adjusts the color temperature of your screen locally on Linux."
            },
            {
                "name": "LightBulb",
                "url": "https://github.com/Tyrrrz/LightBulb",
                "desc": "Reduces eye strain by modifying display gamma based on sun position (Windows)."
            },
            {
                "name": "Pomotroid",
                "url": "https://github.com/Splode/pomotroid",
                "desc": "Simple & highly customizable Pomodoro timer with aesthetics."
            }
        ]
    },
    {
        "category": "Game Development",
        "icon": "🎮",
        "description": "Cross-platform visual and scripted game engines.",
        "tools": [
            {
                "name": "Godot",
                "url": "https://godotengine.org/",
                "desc": "Advanced, feature-packed, multi-platform open source game engine."
            },
            {
                "name": "Defold",
                "url": "https://defold.com/",
                "desc": "Free and open game engine used for cross-platform games."
            },
            {
                "name": "GDevelop",
                "url": "https://gdevelop.io/",
                "desc": "Open-source, cross-platform game engine designed for everyone (No code)."
            },
            {
                "name": "UPBGE",
                "url": "https://upbge.org/",
                "desc": "Open-source 3D game engine branched from the old Blender Game Engine."
            },
            {
                "name": "Ren'Py",
                "url": "https://www.renpy.org/",
                "desc": "The world's most famous visual novel engine."
            },
            {
                "name": "Twine",
                "url": "https://twinery.org/",
                "desc": "Open-source tool for telling interactive, nonlinear stories."
            },
            {
                "name": "LÖVE",
                "url": "https://love2d.org/",
                "desc": "Awesome 2D Game Framework built dynamically in Lua."
            },
            {
                "name": "Raylib",
                "url": "https://www.raylib.com/",
                "desc": "A simple and easy-to-use C library to enjoy videogames programming."
            },
            {
                "name": "Phaser",
                "url": "https://phaser.io/",
                "desc": "A fast, free, and fun open source HTML5 game framework."
            },
            {
                "name": "Stencyl",
                "url": "https://www.stencyl.com/",
                "desc": "Create Flash, iOS, Android and PC games without code (Free tier)."
            }
        ]
    },
    {
        "category": "Personal Finance",
        "icon": "💰",
        "description": "Double-entry bookkeeping and wealth portfolios.",
        "tools": [
            {
                "name": "GnuCash",
                "url": "https://gnucash.org/",
                "desc": "Free accounting software for personal and small business."
            },
            {
                "name": "Firefly III",
                "url": "https://www.firefly-iii.org/",
                "desc": "Self-hosted, highly secure personal finance manager."
            },
            {
                "name": "Actual Budget",
                "url": "https://actualbudget.com/",
                "desc": "Super-fast, privacy-focused open source budget app."
            },
            {
                "name": "MoneyManager Ex",
                "url": "https://moneymanagerex.org/",
                "desc": "Easy-to-use personal finance software for Windows, Mac & Linux."
            },
            {
                "name": "KMyMoney",
                "url": "https://kmymoney.org/",
                "desc": "Personal finance manager by KDE, operating similarly to MS Money."
            },
            {
                "name": "HomeBank",
                "url": "http://homebank.free.fr/",
                "desc": "Free software that will assist you to manage your personal accounting."
            },
            {
                "name": "Skrooge",
                "url": "https://skrooge.org/",
                "desc": "Powerful personal finances manager powered by KDE."
            },
            {
                "name": "Portfolio Performance",
                "url": "https://www.portfolio-performance.info/",
                "desc": "Calculate the true performance of your global investment portfolios."
            },
            {
                "name": "Ghostfolio",
                "url": "https://ghostfol.io/",
                "desc": "Open source wealth management software for self-hosters."
            },
            {
                "name": "Buckets",
                "url": "https://www.budgetwithbuckets.com/",
                "desc": "Local-first budgeting app with an unbounded free trial."
            }
        ]
    },
    {
        "category": "Genealogy",
        "icon": "🌳",
        "description": "Family tree tracing and ancestral timeline hosting.",
        "tools": [
            {
                "name": "Gramps",
                "url": "https://gramps-project.org/",
                "desc": "Free, professional genealogy research software."
            },
            {
                "name": "Ancestris",
                "url": "https://www.ancestris.org/",
                "desc": "Free genealogy software strictly respecting the GEDCOM standard."
            },
            {
                "name": "Webtrees",
                "url": "https://webtrees.net/",
                "desc": "The web's leading self-hosted, collaborative genealogy application."
            },
            {
                "name": "HuMo-genealogy",
                "url": "https://humo-gen.com/",
                "desc": "Open source server-side family tree building system."
            },
            {
                "name": "GeneWeb",
                "url": "https://github.com/geneweb/geneweb",
                "desc": "Genealogy software program with web interface created at INRIA."
            },
            {
                "name": "LifeLines",
                "url": "https://github.com/lifelines/lifelines",
                "desc": "Powerful, scripting-based open-source genealogy software."
            },
            {
                "name": "GEDkeeper",
                "url": "https://gedkeeper.github.io/",
                "desc": "Windows and Linux desktop tool for managing personal family databases."
            },
            {
                "name": "GenealogyJ",
                "url": "http://genj.sourceforge.net/",
                "desc": "A viewer and editor for pedagogic genealogic data in Java."
            },
            {
                "name": "Ahnenblatt",
                "url": "https://www.ahnenblatt.com/",
                "desc": "Easy to use genealogy software (Classic v2.99 is strictly free)."
            },
            {
                "name": "Legacy Family Tree",
                "url": "https://legacyfamilytree.com/",
                "desc": "Comprehensive standard edition is offered completely natively free."
            }
        ]
    },
    {
        "category": "Text Processing",
        "icon": "🔠",
        "description": "Regex pipelines, parsers, and multi-cursor text editors.",
        "tools": [
            {
                "name": "Pandoc",
                "url": "https://pandoc.org/",
                "desc": "The universal document converter (Markdown to PDF/Docx/HTML)."
            },
            {
                "name": "Ripgrep",
                "url": "https://github.com/BurntSushi/ripgrep",
                "desc": "Line-oriented search tool that stays fast recursively."
            },
            {
                "name": "jq",
                "url": "https://jqlang.github.io/jq/",
                "desc": "A lightweight and extremely flexible command-line JSON processor."
            },
            {
                "name": "yq",
                "url": "https://github.com/mikefarah/yq",
                "desc": "Portable command-line YAML, JSON, XML, and CSV processor."
            },
            {
                "name": "Notepad++",
                "url": "https://notepad-plus-plus.org/",
                "desc": "The free standard text editor and source code replacement."
            },
            {
                "name": "Kate",
                "url": "https://kate-editor.org/",
                "desc": "Advanced multi-document editor by KDE."
            },
            {
                "name": "Geany",
                "url": "https://www.geany.org/",
                "desc": "A fast and lightweight IDE and text editor."
            },
            {
                "name": "Micro",
                "url": "https://micro-editor.github.io/",
                "desc": "A modern and intuitive terminal-based text editor (nano alt)."
            },
            {
                "name": "GNU awk",
                "url": "https://www.gnu.org/software/gawk/",
                "desc": "Incredibly powerful pattern scanning and processing language."
            },
            {
                "name": "GNU sed",
                "url": "https://www.gnu.org/software/sed/",
                "desc": "Non-interactive command-line text stream editor."
            }
        ]
    },
    {
        "category": "Mathematics",
        "icon": "🧮",
        "description": "Symbolic computation, graphing, and statistical engines.",
        "tools": [
            {
                "name": "SageMath",
                "url": "https://www.sagemath.org/",
                "desc": "Open-source mathematics software system integrating Python."
            },
            {
                "name": "Octave",
                "url": "https://octave.org/",
                "desc": "Scientific programming language designed as MATLAB alternative."
            },
            {
                "name": "Maxima",
                "url": "https://maxima.sourceforge.io/",
                "desc": "Computer algebra system for the manipulation of symbolic equations."
            },
            {
                "name": "RStudio",
                "url": "https://posit.co/download/rstudio-desktop/",
                "desc": "IDE specifically for R, tailored for statistical computing."
            },
            {
                "name": "Scilab",
                "url": "https://www.scilab.org/",
                "desc": "Free and open source software for numerical computation."
            },
            {
                "name": "Jupyter",
                "url": "https://jupyter.org/",
                "desc": "Interactive computational environment replacing traditional notebooks."
            },
            {
                "name": "SymPy",
                "url": "https://www.sympy.org/",
                "desc": "Python library for robust, free symbolic mathematics."
            },
            {
                "name": "Gnuplot",
                "url": "http://www.gnuplot.info/",
                "desc": "Portable command-line driven graphing utility."
            },
            {
                "name": "Euler Math Toolbox",
                "url": "https://euler.rene-grothmann.de/",
                "desc": "Powerful numerical and symbolic mathematical software."
            },
            {
                "name": "R",
                "url": "https://www.r-project.org/",
                "desc": "The worldwide standard free software environment for statistical computing."
            }
        ]
    },
    {
        "category": "Cloud Storage",
        "icon": "☁️",
        "description": "End-to-end encrypted backup and self-hosted drives.",
        "tools": [
            {
                "name": "Nextcloud",
                "url": "https://nextcloud.com/",
                "desc": "The most popular self-hosted, sovereign content collaboration platform."
            },
            {
                "name": "Syncthing",
                "url": "https://syncthing.net/",
                "desc": "Continuous decentralised P2P file synchronization program."
            },
            {
                "name": "OwnCloud",
                "url": "https://owncloud.com/",
                "desc": "Open-source enterprise file sync and share."
            },
            {
                "name": "Seafile",
                "url": "https://www.seafile.com/",
                "desc": "High performance file syncing and sharing built with C."
            },
            {
                "name": "Resilio Sync",
                "url": "https://www.resilio.com/individuals/",
                "desc": "Fast, reliable P2P file syncing without the cloud (Free tier)."
            },
            {
                "name": "Kopia",
                "url": "https://kopia.io/",
                "desc": "Fast and secure open-source backup/restore tool."
            },
            {
                "name": "Rclone",
                "url": "https://rclone.org/",
                "desc": "The Swiss army knife of cloud storage file synchronization."
            },
            {
                "name": "MEGA",
                "url": "https://mega.io/",
                "desc": "End-to-end encrypted cloud storage provider with 20GB free tier."
            },
            {
                "name": "Proton Drive",
                "url": "https://proton.me/drive",
                "desc": "Swiss-based highly secure encrypted cloud storage (Free tier)."
            },
            {
                "name": "Pydio",
                "url": "https://pydio.com/",
                "desc": "Modern self-hosted file sharing platform tailored for massive datasets."
            }
        ]
    },
    {
        "category": "Markdown Editors",
        "icon": "🔖",
        "description": "Distraction-free, offline WYSIWYG plain-text writing apps.",
        "tools": [
            {
                "name": "MarkText",
                "url": "https://www.marktext.cc/",
                "desc": "Simple and elegant open-source markdown editor with live preview."
            },
            {
                "name": "Ghostwriter",
                "url": "https://ghostwriter.kde.org/",
                "desc": "Distraction-free markdown editor for Windows and Linux."
            },
            {
                "name": "Abricotine",
                "url": "https://abricotine.brrd.fr/",
                "desc": "Open-source markdown editor built for desktop with inline rendering."
            },
            {
                "name": "Zettlr",
                "url": "https://www.zettlr.com/",
                "desc": "Highly advanced editor focused on Zettelkasten and academic writing."
            },
            {
                "name": "StackEdit",
                "url": "https://stackedit.io/",
                "desc": "In-browser markdown editor functioning fully offline."
            },
            {
                "name": "MacDown",
                "url": "https://macdown.uranusjr.com/",
                "desc": "The premium open source Markdown editor for macOS."
            },
            {
                "name": "Remarkable",
                "url": "https://remarkableapp.github.io/",
                "desc": "Linux Markdown Editor utilizing full GitHub styling."
            },
            {
                "name": "KeenWrite",
                "url": "https://keenwrite.com/",
                "desc": "Free, open-source, cross-platform desktop text editor with string interpolation."
            },
            {
                "name": "Apostrophe",
                "url": "https://gitlab.gnome.org/World/apostrophe",
                "desc": "A distraction free Markdown editor made with GTK+."
            },
            {
                "name": "VNote",
                "url": "https://vnotex.github.io/vnote/",
                "desc": "A Vim-inspired note-taking application designed especially for programmers."
            }
        ]
    },
    {
        "category": "Static Site Gen",
        "icon": "🏗️",
        "description": "Zero-database blazing-fast blogging frameworks.",
        "tools": [
            {
                "name": "Hugo",
                "url": "https://gohugo.io/",
                "desc": "The world's fastest framework for building websites in Go."
            },
            {
                "name": "Zola",
                "url": "https://www.getzola.org/",
                "desc": "Dead-simple, crazy-fast static site generator in Rust."
            },
            {
                "name": "Jekyll",
                "url": "https://jekyllrb.com/",
                "desc": "Transform your plain text into static websites and blogs (Ruby)."
            },
            {
                "name": "Eleventy (11ty)",
                "url": "https://www.11ty.dev/",
                "desc": "A simpler static site generator tailored for pure JS logic."
            },
            {
                "name": "Astro",
                "url": "https://astro.build/",
                "desc": "The web framework for content-driven websites (zero JS by default)."
            },
            {
                "name": "Docusaurus",
                "url": "https://docusaurus.io/",
                "desc": "Optimized project documentation tool built with React."
            },
            {
                "name": "MkDocs",
                "url": "https://www.mkdocs.org/",
                "desc": "Fast, simple and gorgeous static site generator in Python."
            },
            {
                "name": "Hexo",
                "url": "https://hexo.io/",
                "desc": "A fast, simple & powerful blog framework powered by Node.js."
            },
            {
                "name": "Gatsby",
                "url": "https://www.gatsbyjs.com/",
                "desc": "A React-based open source framework with performance, scalability."
            },
            {
                "name": "Pelican",
                "url": "https://getpelican.com/",
                "desc": "Static site generator written in Python minimizing dependencies."
            }
        ]
    },
    {
        "category": "Analytics",
        "icon": "📉",
        "description": "Self-hosted, cookieless, privacy-first data trackers.",
        "tools": [
            {
                "name": "Matomo",
                "url": "https://matomo.org/",
                "desc": "The leading Google Analytics alternative that protects your data."
            },
            {
                "name": "Umami",
                "url": "https://umami.is/",
                "desc": "Simple, fast, privacy-focused open source web analytics."
            },
            {
                "name": "Plausible",
                "url": "https://plausible.io/self-hosted",
                "desc": "Lightweight, privacy-friendly CE analytical software."
            },
            {
                "name": "GoatCounter",
                "url": "https://www.goatcounter.com/",
                "desc": "Easy web analytics completely free for non-commercial use."
            },
            {
                "name": "PostHog",
                "url": "https://posthog.com/",
                "desc": "The open source Product Operating System suite."
            },
            {
                "name": "Shynet",
                "url": "https://github.com/milesmcc/shynet",
                "desc": "Modern, privacy-friendly, self-hosted web analytics."
            },
            {
                "name": "Ackee",
                "url": "https://ackee.electerious.com/",
                "desc": "Self-hosted node.js based analytics tool for those who care about privacy."
            },
            {
                "name": "Fathom Lite",
                "url": "https://github.com/usefathom/fathom",
                "desc": "The open source version of the popular Fathom Analytics."
            },
            {
                "name": "Open Web Analytics",
                "url": "https://www.openwebanalytics.com/",
                "desc": "Open source alternative tracking software designed like GA."
            },
            {
                "name": "Koko Analytics",
                "url": "https://www.kokoanalytics.com/",
                "desc": "Privacy-friendly, completely free local plugin for WordPress."
            }
        ]
    },
    {
        "category": "Monitoring Tools",
        "icon": "🚨",
        "description": "Status pages, time-series metrics, and alerting pipelines.",
        "tools": [
            {
                "name": "Prometheus",
                "url": "https://prometheus.io/",
                "desc": "Legendary time series database and systems monitoring."
            },
            {
                "name": "Grafana",
                "url": "https://grafana.com/",
                "desc": "The open observability platform to visualize your Prometheus maps."
            },
            {
                "name": "Uptime Kuma",
                "url": "https://uptime.kuma.pet/",
                "desc": "A fancy self-hosted monitoring tool (Alternative to Uptime Robot)."
            },
            {
                "name": "Netdata",
                "url": "https://www.netdata.cloud/",
                "desc": "Real-time, high-resolution health monitoring for all containers."
            },
            {
                "name": "Zabbix",
                "url": "https://www.zabbix.com/",
                "desc": "Enterprise-class open source distributed monitoring solution."
            },
            {
                "name": "Nagios Core",
                "url": "https://www.nagios.org/projects/nagios-core/",
                "desc": "The industry standard IT infrastructure server monitoring."
            },
            {
                "name": "Icinga",
                "url": "https://icinga.com/",
                "desc": "Stackable, fully automated monitoring system monitoring entire infrastructures."
            },
            {
                "name": "Munin",
                "url": "http://munin-monitoring.org/",
                "desc": "Network resource monitoring tool that can help analyze trends."
            },
            {
                "name": "Cacti",
                "url": "https://www.cacti.net/",
                "desc": "Complete network graphing solution harnessing RRDTool."
            },
            {
                "name": "Statping-ng",
                "url": "https://github.com/statping-ng/statping-ng",
                "desc": "Lightweight status page system with completely native SQL support."
            }
        ]
    },
    {
        "category": "Email Clients",
        "icon": "📧",
        "description": "Desktop mail apps with unified inboxes and PGP integrations.",
        "tools": [
            {
                "name": "Thunderbird",
                "url": "https://www.thunderbird.net/",
                "desc": "The legendary free and highly configurable desktop email client."
            },
            {
                "name": "Mailspring",
                "url": "https://getmailspring.com/",
                "desc": "A beautiful, fast, native Mac, Windows, and Linux email application (Free tier)."
            },
            {
                "name": "Spark",
                "url": "https://sparkmailapp.com/",
                "desc": "The smart email client that prioritizes your inbox (Free personal tier)."
            },
            {
                "name": "Betterbird",
                "url": "https://www.betterbird.eu/",
                "desc": "A fine-tuned fork of Thunderbird with hundreds of fixes and enhancements."
            },
            {
                "name": "Sylpheed",
                "url": "https://sylpheed.sraoss.jp/en/",
                "desc": "Simple, lightweight but featureful, and easy-to-use e-mail client."
            },
            {
                "name": "Evolution",
                "url": "https://wiki.gnome.org/Apps/Evolution",
                "desc": "Personal information management application for GNOME."
            },
            {
                "name": "Geary",
                "url": "https://wiki.gnome.org/Apps/Geary",
                "desc": "An email application built around conversations for the Linux desktop."
            },
            {
                "name": "KMail",
                "url": "https://apps.kde.org/kmail2/",
                "desc": "The standard KDE email component of Kontact."
            },
            {
                "name": "Mutt",
                "url": "http://www.mutt.org/",
                "desc": "Small but very powerful text-based mail client for Unix."
            },
            {
                "name": "NeoMutt",
                "url": "https://neomutt.org/",
                "desc": "The command-line mail reader (A modernized Mutt fork)."
            }
        ]
    },
    {
        "category": "Translation",
        "icon": "🔤",
        "description": "Offline language processing and international string hubs.",
        "tools": [
            {
                "name": "LanguageTool",
                "url": "https://languagetool.org/",
                "desc": "Professional open-source style and grammar checker."
            },
            {
                "name": "DeepL",
                "url": "https://www.deepl.com/translator",
                "desc": "The world's most accurate neural machine translator (Free Web)."
            },
            {
                "name": "Crowdin",
                "url": "https://crowdin.com/",
                "desc": "The leading localization platform strictly free for open source."
            },
            {
                "name": "OmegaT",
                "url": "https://omegat.org/",
                "desc": "The free computer-assisted translation tool for professionals."
            },
            {
                "name": "Apertium",
                "url": "https://www.apertium.org/",
                "desc": "A free/open-source rule-based machine translation platform."
            },
            {
                "name": "Argos Translate",
                "url": "https://www.argos-opentech.com/",
                "desc": "Offline neural machine translation library based on OpenNMT."
            },
            {
                "name": "LibreTranslate",
                "url": "https://libretranslate.com/",
                "desc": "Free and Open Source Machine Translation API without keys."
            },
            {
                "name": "Weblate",
                "url": "https://weblate.org/",
                "desc": "Web-based continuous localization tool tightening versions."
            },
            {
                "name": "Poedit",
                "url": "https://poedit.net/",
                "desc": "The best, simple translation editor for gettext and PO files."
            },
            {
                "name": "Firefox Translations",
                "url": "https://addons.mozilla.org/en-US/firefox/addon/firefox-translations/",
                "desc": "Automated, totally offline translation of web pages right in browser."
            }
        ]
    },
    {
        "category": "Video Formatting",
        "icon": "🎞️",
        "description": "Command-line encoders, lossy transcoders, and filter graphs.",
        "tools": [
            {
                "name": "FFmpeg",
                "url": "https://ffmpeg.org/",
                "desc": "The ultimate cross-platform engine to record, convert video streams."
            },
            {
                "name": "VidCoder",
                "url": "https://vidcoder.net/",
                "desc": "Open-source DVD/Blu-ray ripping and video transcoding app (HandBrake GUI)."
            },
            {
                "name": "StaxRip",
                "url": "https://github.com/staxrip/staxrip",
                "desc": "Powerful video & audio encoding GUI for Windows."
            },
            {
                "name": "MKVToolNix",
                "url": "https://mkvtoolnix.download/",
                "desc": "The ultimate set of tools to create, alter and inspect Matroska files."
            },
            {
                "name": "AviSynth",
                "url": "http://avisynth.nl/",
                "desc": "A powerful frameserver providing non-linear video editing via scripting."
            },
            {
                "name": "VapourSynth",
                "url": "https://www.vapoursynth.com/",
                "desc": "A video processing framework with simplicity via Python scripts."
            },
            {
                "name": "MeGUI",
                "url": "https://sourceforge.net/projects/megui/",
                "desc": "The most comprehensive GUI based ISO MPEG-4 converter."
            },
            {
                "name": "Hybrid",
                "url": "https://www.selur.de/",
                "desc": "Multi-platform frontend for x264/x265/Xvid heavily focused on quality."
            },
            {
                "name": "Shutter Encoder",
                "url": "https://www.shutterencoder.com/",
                "desc": "A complete video/audio/image conversion UI created by editors."
            },
            {
                "name": "File Converter",
                "url": "https://file-converter.org/",
                "desc": "Context menu tool that converts files effortlessly directly in Explorer."
            }
        ]
    },
    {
        "category": "Mind Mapping",
        "icon": "🧠",
        "description": "Thought visualization, organizational flowcharts, and diagrams.",
        "tools": [
            {
                "name": "FreeMind",
                "url": "http://freemind.sourceforge.net/",
                "desc": "Premier free mind-mapping software written globally in Java."
            },
            {
                "name": "XMind",
                "url": "https://xmind.app/",
                "desc": "Modular and visual mind-mapping desktop tool (Free tier features)."
            },
            {
                "name": "MindNode",
                "url": "https://mindnode.com/",
                "desc": "Visually stunning mind mapping application built natively for Mac."
            },
            {
                "name": "Freeplane",
                "url": "https://www.freeplane.org/",
                "desc": "Powerful knowledge management and project planning fork of FreeMind."
            },
            {
                "name": "Vym",
                "url": "https://software.opensuse.org/package/vym",
                "desc": "View Your Mind. Simple Linux diagram generator."
            },
            {
                "name": "SimpleMind",
                "url": "https://simplemind.eu/",
                "desc": "Cross-platform mind mapping solution focusing on simplicity."
            },
            {
                "name": "MindMup",
                "url": "https://www.mindmup.com/",
                "desc": "Frictionless free online mind mapping running straight from browser."
            },
            {
                "name": "Wisemapping",
                "url": "https://www.wisemapping.com/",
                "desc": "Free and open source browser-based mind mapping workspace."
            },
            {
                "name": "Coggle",
                "url": "https://coggle.it/",
                "desc": "Collaborative, free-flow mind map software designed online."
            },
            {
                "name": "PlantUML",
                "url": "https://plantuml.com/",
                "desc": "Open-source tool to create UML diagrams programmatically via text."
            }
        ]
    },
    {
        "category": "Virtualization",
        "icon": "🖥️",
        "description": "Hardware emulators, virtual environments, and boot supervisors.",
        "tools": [
            {
                "name": "UTM",
                "url": "https://mac.getutm.app/",
                "desc": "Native QEMU wrapper running macOS and Windows guests perfectly on Apple Silicon."
            },
            {
                "name": "VirtualBox",
                "url": "https://www.virtualbox.org/",
                "desc": "Massively popular cross-platform x86 and AMD64/Intel64 virtualization."
            },
            {
                "name": "QEMU",
                "url": "https://www.qemu.org/",
                "desc": "Generic and open source machine emulator and bare-metal virtualizer."
            },
            {
                "name": "VMware Workstation Player",
                "url": "https://www.vmware.com/products/workstation-player.html",
                "desc": "High-profile Windows hypervisor (Now officially free for personal use)."
            },
            {
                "name": "Hyper-V",
                "url": "https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/",
                "desc": "Microsoft's native hardware virtualization product on Windows Pro/Enterprise."
            },
            {
                "name": "Multipass",
                "url": "https://multipass.run/",
                "desc": "Spin up instant, low-resource Ubuntu VMs directly on developers' machines."
            },
            {
                "name": "GNOME Boxes",
                "url": "https://wiki.gnome.org/Apps/Boxes",
                "desc": "Simple Linux app designed for creating simple remote or local virtual spaces."
            },
            {
                "name": "Lima",
                "url": "https://github.com/lima-vm/lima",
                "desc": "Linux virtual machines running native Docker setups securely on macOS."
            },
            {
                "name": "Docker Desktop",
                "url": "https://www.docker.com/products/docker-desktop/",
                "desc": "Seamless engine running localized native Linux containers immediately on OS."
            },
            {
                "name": "Vagrant",
                "url": "https://www.vagrantup.com/",
                "desc": "Tool for building and distributing development environments (HashiCorp)."
            }
        ]
    },
    {
        "category": "IDE",
        "icon": "📝",
        "description": "Full-featured integrated development suites and AI code planners.",
        "tools": [
            {
                "name": "Eclipse",
                "url": "https://www.eclipse.org/ide/",
                "desc": "Extensible, highly equipped open source IDE heavily tailored for Java teams."
            },
            {
                "name": "IntelliJ IDEA CE",
                "url": "https://www.jetbrains.com/idea/download/",
                "desc": "The Community Edition of JetBrains' incredible Java IDE."
            },
            {
                "name": "PyCharm CE",
                "url": "https://www.jetbrains.com/pycharm/download/",
                "desc": "Community Edition IDE providing all strict Python tools needed entirely free."
            },
            {
                "name": "Visual Studio Community",
                "url": "https://visualstudio.microsoft.com/vs/community/",
                "desc": "Full-stack development environment entirely free for standard individuals."
            },
            {
                "name": "Neovim",
                "url": "https://neovim.io/",
                "desc": "Hyperextensible Vim-based text editor built exclusively for modern developers."
            },
            {
                "name": "Emacs",
                "url": "https://www.gnu.org/software/emacs/",
                "desc": "The endlessly customizable, self-documenting, extensible text editor system."
            },
            {
                "name": "VSCodium",
                "url": "https://vscodium.com/",
                "desc": "Free/Libre Open Source Software Binaries of VS Code without MS telemetry."
            },
            {
                "name": "Pulsar",
                "url": "https://pulsar-edit.dev/",
                "desc": "The community-led successor directly reviving the Atom editor."
            },
            {
                "name": "Cursor",
                "url": "https://cursor.com/",
                "desc": "The AI-first code editor designed closely around GPT infrastructure (Free tier)."
            },
            {
                "name": "Windsurf",
                "url": "https://codeium.com/windsurf",
                "desc": "Incredibly fast native AI-based editor focusing purely on dev flows (Free limit)."
            }
        ]
    },
    {
        "category": "Database GUI",
        "icon": "🗄️",
        "description": "SQL visualizers, query runners, and local schema designers.",
        "tools": [
            {
                "name": "DBeaver",
                "url": "https://dbeaver.io/",
                "desc": "Universal database multi-tool designed for developers and analysts."
            },
            {
                "name": "HeidiSQL",
                "url": "https://www.heidisql.com/",
                "desc": "Powerful, fast, lightweight SQL graphical interface globally loved."
            },
            {
                "name": "TablePlus",
                "url": "https://tableplus.com/",
                "desc": "Modern, native, and friendly GUI tool for relational databases (Free Tier)."
            },
            {
                "name": "pgAdmin",
                "url": "https://www.pgadmin.org/",
                "desc": "The most feature-rich open source administration platform strictly for PostgreSQL."
            },
            {
                "name": "SQuirreL SQL",
                "url": "http://squirrel-sql.sourceforge.net/",
                "desc": "Java-based JDBC compliant graphical interface."
            },
            {
                "name": "Studio 3T Free",
                "url": "https://studio3t.com/free/",
                "desc": "Essential GUI, IDE, and client designed strictly for MongoDB."
            },
            {
                "name": "SQLiteStudio",
                "url": "https://sqlitestudio.pl/",
                "desc": "Free, portable, intuitive interface solely for SQLite nodes."
            },
            {
                "name": "RedisInsight",
                "url": "https://redis.com/redis-enterprise/redis-insight/",
                "desc": "The ideal GUI strictly for Redis visualizing databases and data streams."
            },
            {
                "name": "Azure Data",
                "url": "https://learn.microsoft.com/en-us/azure-data-studio/download-azure-data-studio",
                "desc": "Modern data workbench providing native connection to SQL Server."
            },
            {
                "name": "MongoDB Compass",
                "url": "https://www.mongodb.com/products/tools/compass",
                "desc": "The official GUI tightly exploring your MongoDB architecture."
            }
        ]
    },
    {
        "category": "Reverse Engineering",
        "icon": "🔬",
        "description": "Disassemblers, memory debuggers, and decompilation logic.",
        "tools": [
            {
                "name": "Ghidra",
                "url": "https://ghidra-sre.org/",
                "desc": "The legendary software reverse engineering suite developed by the NSA."
            },
            {
                "name": "x64dbg",
                "url": "https://x64dbg.com/",
                "desc": "Open-source x64/x32 debugger intended largely for Windows."
            },
            {
                "name": "Cutter",
                "url": "https://cutter.re/",
                "desc": "Free and open-source reverse engineering platform powered directly by Rizin."
            },
            {
                "name": "Radare2",
                "url": "https://rada.re/",
                "desc": "Unix-like reverse engineering framework and intense command-line toolkit."
            },
            {
                "name": "IDA Free",
                "url": "https://hex-rays.com/ida-free/",
                "desc": "World standard interactive disassembler offering its core engine totally free."
            },
            {
                "name": "Cheat Engine",
                "url": "https://cheatengine.org/",
                "desc": "Open source memory scanner, debugger, and overall local hex editor."
            },
            {
                "name": "OllyDbg",
                "url": "http://www.ollydbg.de/",
                "desc": "A classic 32-bit assembler level analyzing debugger widely known."
            },
            {
                "name": "Binary Ninja",
                "url": "https://binary.ninja/free/",
                "desc": "Lightning fast reverse engineering platform heavily driven by its IR (Free Tier)."
            },
            {
                "name": "dnSpy",
                "url": "https://github.com/dnSpy/dnSpy",
                "desc": "Incredible .NET debugger and assembly editor."
            },
            {
                "name": "ILSpy",
                "url": "https://github.com/icsharpcode/ILSpy",
                "desc": "The open-source .NET assembly browser and active decompiler."
            }
        ]
    },
    {
        "category": "Logic Puzzles",
        "icon": "🧩",
        "description": "Offline brain teasers and classic tile matching variations.",
        "tools": [
            {
                "name": "Simon Tatham's",
                "url": "https://www.chiark.greenend.org.uk/~sgtatham/puzzles/",
                "desc": "Brilliant portable puzzle collection containing 40+ unique classic modules."
            },
            {
                "name": "GNOME Sudoku",
                "url": "https://wiki.gnome.org/Apps/Sudoku",
                "desc": "Elegant logical puzzle utilizing number grids endlessly generating."
            },
            {
                "name": "Enigma",
                "url": "https://www.nongnu.org/enigma/",
                "desc": "Open source puzzle game heavily inspired by Oxyd mimicking physics perfectly."
            },
            {
                "name": "Pingus",
                "url": "https://pingus.seul.org/",
                "desc": "Free clone of the hugely popular Lemmings focusing on logic paths."
            },
            {
                "name": "Hex-a-hop",
                "url": "http://hexahop.sourceforge.net/",
                "desc": "Hexagonal puzzle layout requiring destroying all green tiles smartly."
            },
            {
                "name": "Kigo",
                "url": "https://apps.kde.org/kigo/",
                "desc": "An open-source implementation of the classic board game strictly Go."
            },
            {
                "name": "KLines",
                "url": "https://apps.kde.org/klines/",
                "desc": "Tactical board game moving diverse colored balls avoiding full boards."
            },
            {
                "name": "KMahjongg",
                "url": "https://apps.kde.org/kmahjongg/",
                "desc": "Highly polished tile matching logic variant built deeply for KDE."
            },
            {
                "name": "KSudoku",
                "url": "https://apps.kde.org/ksudoku/",
                "desc": "Generating completely new 3D and 2D logic grids spanning standard lines."
            },
            {
                "name": "Peg Solitaire",
                "url": "https://en.wikipedia.org/wiki/Peg_solitaire",
                "desc": "Mathematical board logic leaping over pieces rapidly removing them."
            }
        ]
    },
    {
        "category": "Encryption",
        "icon": "🔐",
        "description": "File obfuscation, symmetric ciphers, and hash pipelines.",
        "tools": [
            {
                "name": "GnuPG",
                "url": "https://gnupg.org/",
                "desc": "The absolute complete implementation of the reliable OpenPGP protocol."
            },
            {
                "name": "Kleopatra",
                "url": "https://apps.kde.org/kleopatra/",
                "desc": "Certificate manager and unified GUI bridging smoothly into GnuPG."
            },
            {
                "name": "Age",
                "url": "https://github.com/FiloSottile/age",
                "desc": "Extremely simple, modern and secure local file encryption tool."
            },
            {
                "name": "SOPS",
                "url": "https://github.com/getsops/sops",
                "desc": "Simple and globally flexible tool managing heavily encrypted configuration arrays."
            },
            {
                "name": "Hat.sh",
                "url": "https://hat.sh/",
                "desc": "Locally run, AES-256-GCM browser encryption strictly offline securely."
            },
            {
                "name": "AES Crypt",
                "url": "https://www.aescrypt.com/",
                "desc": "Incredibly minimal advanced encryption standard perfectly integrated in explorer."
            },
            {
                "name": "Steghide",
                "url": "http://steghide.sourceforge.net/",
                "desc": "Steganography program seamlessly hiding sensitive data in native images/audio."
            },
            {
                "name": "Gpg4win",
                "url": "https://gpg4win.org/",
                "desc": "Secure emails and tightly guarded files seamlessly delivered for Windows."
            },
            {
                "name": "Keybase",
                "url": "https://keybase.io/",
                "desc": "Secure messaging integrating closely with PGP identities freely."
            },
            {
                "name": "Picocrypt",
                "url": "https://github.com/HACKERALERT/Picocrypt",
                "desc": "Very small, very simple, and very secure encryption leveraging XChaCha20."
            }
        ]
    },
    {
        "category": "Screen Capture",
        "icon": "📸",
        "description": "Annotated screenshots, GIF recorders, and region selectors.",
        "tools": [
            {
                "name": "ShareX",
                "url": "https://getsharex.com/",
                "desc": "Absolutely incredible ultimate screen capture and infinite file sharing capability (Windows)."
            },
            {
                "name": "Flameshot",
                "url": "https://flameshot.org/",
                "desc": "Powerful yet brutally simple to use screenshot software spanning cross platform."
            },
            {
                "name": "Greenshot",
                "url": "https://getgreenshot.org/",
                "desc": "Lightweight screenshot software precisely tailored closely for productivity."
            },
            {
                "name": "Lightshot",
                "url": "https://app.prntscr.com/",
                "desc": "The fastest way universally taking a deeply customizable screenshot."
            },
            {
                "name": "Ksnip",
                "url": "https://github.com/ksnip/ksnip",
                "desc": "Qt-based cross-platform screenshot tool providing highly structured annotation."
            },
            {
                "name": "Spectacle",
                "url": "https://apps.kde.org/spectacle/",
                "desc": "A slick, heavily integrated widget taking screenshots gracefully in KDE."
            },
            {
                "name": "Peek",
                "url": "https://github.com/phw/peek",
                "desc": "Simple heavily-styled animated GIF screen recorder locally."
            },
            {
                "name": "ScreenToGif",
                "url": "https://www.screentogif.com/",
                "desc": "Screen, webcam and strictly sketchboard actively rendering native GIFs."
            },
            {
                "name": "Kooha",
                "url": "https://github.com/SeaDve/Kooha",
                "desc": "Elegantly simple screen recorder smoothly functioning deeply within GNOME."
            },
            {
                "name": "Captura",
                "url": "https://mathewsachin.github.io/Captura/",
                "desc": "Capture screen rapidly alongside audio inputs strictly on Windows."
            }
        ]
    },
    {
        "category": "API Testing",
        "icon": "🔗",
        "description": "REST payload mockers, runners, and GraphQL evaluators.",
        "tools": [
            {
                "name": "SoapUI",
                "url": "https://www.soapui.org/",
                "desc": "The world's most widely-used automated testing tool for SOAP and REST APIs."
            },
            {
                "name": "Thunder Client",
                "url": "https://www.thunderclient.com/",
                "desc": "Lightweight REST API Client Extension strictly natively inside VS Code."
            },
            {
                "name": "REST Client",
                "url": "https://marketplace.visualstudio.com/items?itemName=humao.rest-client",
                "desc": "Superb VS Code extension allowing directly sending text-based HTTP requests."
            },
            {
                "name": "TestMace",
                "url": "https://testmace.com/",
                "desc": "Modern powerful IDE heavily focusing specifically on APIs (Free tier)."
            },
            {
                "name": "HttpMaster",
                "url": "https://www.httpmaster.net/",
                "desc": "Reliable testing functionality seamlessly verifying API responses natively."
            },
            {
                "name": "Karate",
                "url": "https://github.com/karatelabs/karate",
                "desc": "Open-source framework directly integrating API test automation, mocks, and performance."
            },
            {
                "name": "Yaak",
                "url": "https://yaak.app/",
                "desc": "The desktop API client beautifully organizing REST and GraphQL completely locally."
            },
            {
                "name": "Apidog",
                "url": "https://apidog.com/",
                "desc": "All-in-one platform integrating testing, mocking, and design (Free)."
            },
            {
                "name": "Milkman",
                "url": "https://github.com/warmuuh/milkman",
                "desc": "Highly extensible open-source desktop workspace crafting rapid HTTP/REST tests."
            },
            {
                "name": "Restyled",
                "url": "https://github.com/mulesoft/restyled",
                "desc": "Free interactive platform providing solid visual REST execution engines."
            }
        ]
    },
    {
        "category": "Automation (CI)",
        "icon": "⚙️",
        "description": "Continuous integration, declarative delivery, and devops lifecycles.",
        "tools": [
            {
                "name": "Jenkins",
                "url": "https://www.jenkins.io/",
                "desc": "The legendary leading open source automation server spanning massive plugins."
            },
            {
                "name": "Gitea Actions",
                "url": "https://docs.gitea.com/usage/actions/overview",
                "desc": "Natively integrated CI/CD directly mirroring GitHub Actions syntax locally."
            },
            {
                "name": "GitLab CI",
                "url": "https://docs.gitlab.com/ee/ci/",
                "desc": "Incredible tightly integrated DevOps platform completely free for local runners."
            },
            {
                "name": "Buildbot",
                "url": "https://buildbot.net/",
                "desc": "Python-based continuous integration globally scheduling complex dynamic pipelines."
            },
            {
                "name": "Drone",
                "url": "https://www.drone.io/",
                "desc": "Container-native CI orchestrating smoothly atop Docker infrastructures."
            },
            {
                "name": "Concourse",
                "url": "https://concourse-ci.org/",
                "desc": "Pipeline-based continuous integration strictly executing tasks blindly and safely."
            },
            {
                "name": "Woodpecker",
                "url": "https://woodpecker-ci.org/",
                "desc": "Simple CI engine closely branching directly off earlier Drone models."
            },
            {
                "name": "ArgoCD",
                "url": "https://argo-cd.readthedocs.io/",
                "desc": "Declarative, massively resilient GitOps continuous delivery tool purely for Kubernetes."
            },
            {
                "name": "Flux",
                "url": "https://fluxcd.io/",
                "desc": "Open and extensible continuous delivery exclusively keeping Kubernetes clustered safely."
            },
            {
                "name": "Tekton",
                "url": "https://tekton.dev/",
                "desc": "Powerful cloud-native framework actively building CI/CD tightly alongside Kubernetes."
            }
        ]
    },
    {
        "category": "VPN & Proxy",
        "icon": "🛡️",
        "description": "Encrypted tunnels, overlay switching fabrics, and mesh networks.",
        "tools": [
            {
                "name": "WireGuard",
                "url": "https://www.wireguard.com/",
                "desc": "Extremely simple, incredibly fast, strictly modern secure VPN architecture natively."
            },
            {
                "name": "OpenVPN",
                "url": "https://openvpn.net/community/",
                "desc": "The most widely deployed open source SSL VPN historically reliable completely."
            },
            {
                "name": "Tailscale",
                "url": "https://tailscale.com/",
                "desc": "Zero-config VPN securely spanning universally across all user devices (Free)."
            },
            {
                "name": "ZeroTier",
                "url": "https://www.zerotier.com/",
                "desc": "P2P virtual networking simply abstracting complex LAN configurations tightly (Free)."
            },
            {
                "name": "Headscale",
                "url": "https://github.com/juanfont/headscale",
                "desc": "Open source, self-hosted implementation entirely replacing Tailscale control servers."
            },
            {
                "name": "Shadowsocks",
                "url": "https://shadowsocks.org/",
                "desc": "A secure, immensely robust socks5 proxy carefully masking internet protocol."
            },
            {
                "name": "V2Ray",
                "url": "https://www.v2fly.org/",
                "desc": "Extremely versatile proxy platform actively bypassing strict network environments globally."
            },
            {
                "name": "SoftEther",
                "url": "https://www.softether.org/",
                "desc": "Free cross-platform multi-protocol VPN massively outperforming classic IPsec perfectly."
            },
            {
                "name": "Netmaker",
                "url": "https://www.netmaker.io/",
                "desc": "Automated WireGuard virtual infrastructure tightly securing microservices cleanly."
            },
            {
                "name": "Outline",
                "url": "https://getoutline.org/",
                "desc": "Make it safely easy sharing incredibly robust VPN access completely built open."
            }
        ]
    },
    {
        "category": "AI & ML",
        "icon": "🦾",
        "description": "Local large language inferencing and image synthesis.",
        "tools": [
            {
                "name": "Ollama",
                "url": "https://ollama.com/",
                "desc": "Get up and running locally immediately launching incredibly large language models."
            },
            {
                "name": "LM Studio",
                "url": "https://lmstudio.ai/",
                "desc": "Discover, download, and seamlessly spin completely offline huggingface models globally."
            },
            {
                "name": "GPT4All",
                "url": "https://gpt4all.io/",
                "desc": "Free-to-use natively operating ecosystem closely inferencing massive edge models."
            },
            {
                "name": "InvokeAI",
                "url": "https://invoke-ai.github.io/InvokeAI/",
                "desc": "Beautiful creative engine seamlessly providing incredibly stable diffusion styling."
            },
            {
                "name": "Automatic1111",
                "url": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
                "desc": "The most feature-rich web ui perfectly accelerating local diffusion workflows."
            },
            {
                "name": "ComfyUI",
                "url": "https://github.com/comfyanonymous/ComfyUI",
                "desc": "Node-based graphical deeply powerful interface flawlessly driving stable diffusion."
            },
            {
                "name": "Jan",
                "url": "https://jan.ai/",
                "desc": "Open source ChatGPT-equivalent seamlessly executing heavily locally across devices."
            },
            {
                "name": "LocalAI",
                "url": "https://localai.io/",
                "desc": "Drop-in heavily optimized strict replacement exactly mirroring OpenAI API natively."
            },
            {
                "name": "HuggingFace Chat",
                "url": "https://huggingface.co/chat/",
                "desc": "The open alternative completely securely interacting tightly with top massive models."
            },
            {
                "name": "AnythingLLM",
                "url": "https://useanything.com/",
                "desc": "The strictly private brilliantly scalable application precisely managing RAG flawlessly."
            }
        ]
    },
    {
        "category": "OSINT & Security",
        "icon": "🕵️",
        "description": "Threat harvesting, packet injection, and ethical penetration suites.",
        "tools": [
            {
                "name": "Maltego (CE)",
                "url": "https://www.maltego.com/",
                "desc": "Incredible graphical link analysis natively mapping incredibly complex intelligence accurately."
            },
            {
                "name": "Recon-ng",
                "url": "https://github.com/lanmaster53/recon-ng",
                "desc": "Full-featured web reconnaissance seamlessly acting absolutely globally identically completely."
            },
            {
                "name": "SpiderFoot",
                "url": "https://www.spiderfoot.net/",
                "desc": "Automate completely Open Source Intelligence practically targeting IPs perfectly cleanly."
            },
            {
                "name": "Shodan",
                "url": "https://www.shodan.io/",
                "desc": "The legendary search engine explicitly spanning internet-connected insecure endpoints strictly."
            },
            {
                "name": "Metasploit",
                "url": "https://www.metasploit.com/",
                "desc": "The world's absolute most widely used native penetration testing framework securely."
            },
            {
                "name": "Burp Suite CE",
                "url": "https://portswigger.net/burp/communitydownload",
                "desc": "The essential native manual toolkit seamlessly intercepting incredibly deep proxy requests."
            },
            {
                "name": "OWASP ZAP",
                "url": "https://www.zaproxy.org/",
                "desc": "The world's perfectly widely used free automated native web app scanner securely."
            },
            {
                "name": "Sherlock",
                "url": "https://github.com/sherlock-project/sherlock",
                "desc": "Hunt down securely incredibly deep social media locally completely identically accurately."
            },
            {
                "name": "The Harvester",
                "url": "https://github.com/laramies/theHarvester",
                "desc": "Gather brilliantly structured native emails precisely analyzing tightly completely incredibly."
            },
            {
                "name": "OSINT Framework",
                "url": "https://osintframework.com/",
                "desc": "The absolute massive comprehensive tightly gathered completely deeply structured intelligence directory."
            }
        ]
    },
    {
        "category": "Brain Training",
        "icon": "🧠",
        "description": "Sharpen cognitive skills with puzzles, memory games, and logic challenges.",
        "tools": [
            {
                "name": "Lumosity",
                "url": "https://www.lumosity.com/",
                "desc": "Personalized brain training program backed by neuroscience research."
            },
            {
                "name": "Peak",
                "url": "https://www.peak.net/",
                "desc": "Fun brain workouts designed with Cambridge and Yale academics."
            },
            {
                "name": "Elevate",
                "url": "https://www.elevateapp.com/",
                "desc": "Brain training app focused on communication and analytical skills."
            },
            {
                "name": "BrainHQ",
                "url": "https://www.brainhq.com/",
                "desc": "Clinically proven brain exercises from Posit Science."
            },
            {
                "name": "Chess.com",
                "url": "https://www.chess.com/",
                "desc": "The world's largest chess community with puzzles, lessons, and AI play."
            },
            {
                "name": "Lichess",
                "url": "https://lichess.org/",
                "desc": "100% free, open-source chess server with zero ads."
            },
            {
                "name": "Dual N-Back",
                "url": "https://brainscale.net/dual-n-back",
                "desc": "Free working memory training game proven to boost fluid intelligence."
            },
            {
                "name": "Brilliant",
                "url": "https://brilliant.org/",
                "desc": "Interactive learning for math, science, and computer science (Free tier)."
            },
            {
                "name": "Cognifit",
                "url": "https://www.cognifit.com/",
                "desc": "Cognitive assessment and brain training program for all ages."
            },
            {
                "name": "Human Benchmark",
                "url": "https://humanbenchmark.com/",
                "desc": "Measure your abilities with reaction time, memory, and verbal tests."
            }
        ]
    },
    {
        "category": "Kids & Education",
        "icon": "👶",
        "description": "Safe, engaging, and free learning platforms for children of all ages.",
        "tools": [
            {
                "name": "Khan Academy Kids",
                "url": "https://learn.khanacademy.org/khan-academy-kids/",
                "desc": "Joyful, free learning app for ages 2-8 with no ads or subscriptions."
            },
            {
                "name": "Scratch",
                "url": "https://scratch.mit.edu/",
                "desc": "MIT's free coding platform where kids create stories, games, and animations."
            },
            {
                "name": "Tinkercad",
                "url": "https://www.tinkercad.com/",
                "desc": "Free 3D design, electronics, and coding tool for students and hobbyists."
            },
            {
                "name": "Code.org",
                "url": "https://code.org/",
                "desc": "Free coding courses for K-12 students with hour-of-code activities."
            },
            {
                "name": "PBS Kids Games",
                "url": "https://pbskids.org/games/",
                "desc": "Free educational games from PBS featuring beloved characters."
            },
            {
                "name": "National Geographic Kids",
                "url": "https://kids.nationalgeographic.com/",
                "desc": "Explore animals, science, and the world with fun games and videos."
            },
            {
                "name": "Cool Math Games",
                "url": "https://www.coolmathgames.com/",
                "desc": "Brain-teasing math and logic games that make learning fun."
            },
            {
                "name": "TypingClub",
                "url": "https://www.typingclub.com/",
                "desc": "Free touch typing curriculum used by schools worldwide."
            },
            {
                "name": "SplashLearn",
                "url": "https://www.splashlearn.com/",
                "desc": "Adaptive math and reading program for PreK-Grade 5."
            },
            {
                "name": "GCompris",
                "url": "https://gcompris.net/",
                "desc": "Free, open-source educational activity suite for children aged 2 to 10."
            }
        ]
    },
    {
        "category": "Meditation & Wellness",
        "icon": "🧘",
        "description": "Free mindfulness, meditation, and mental health support tools.",
        "tools": [
            {
                "name": "Insight Timer",
                "url": "https://insighttimer.com/",
                "desc": "World's largest free library of guided meditations and music."
            },
            {
                "name": "Medito",
                "url": "https://meditofoundation.org/",
                "desc": "100% free meditation app built by a nonprofit foundation."
            },
            {
                "name": "Smiling Mind",
                "url": "https://www.smilingmind.com.au/",
                "desc": "Free evidence-based mindfulness app for all ages developed by psychologists."
            },
            {
                "name": "UCLA Mindful",
                "url": "https://www.uclahealth.org/programs/marc/free-guided-meditations",
                "desc": "Free guided meditations from UCLA's Mindful Awareness Research Center."
            },
            {
                "name": "MyNoise",
                "url": "https://mynoise.net/",
                "desc": "Online background noise generator with calibrated soundscapes."
            },
            {
                "name": "Calm (Free Features)",
                "url": "https://www.calm.com/",
                "desc": "Sleep stories, breathing exercises, and mindfulness (select free content)."
            },
            {
                "name": "Waking Up (Free Access)",
                "url": "https://www.wakingup.com/",
                "desc": "Sam Harris's meditation app with free scholarship access for anyone."
            },
            {
                "name": "Do Nothing for 2 Min",
                "url": "https://donothingfor2minutes.com/",
                "desc": "Simple web challenge: do absolutely nothing for 2 minutes to decompress."
            },
            {
                "name": "Rainy Mood",
                "url": "https://rainymood.com/",
                "desc": "Ambient rain sounds for focus, relaxation, and sleep."
            },
            {
                "name": "Tide",
                "url": "https://tide.fm/",
                "desc": "Focus timer and sleep sounds inspired by nature."
            }
        ]
    },
    {
        "category": "Data Visualization",
        "icon": "📊",
        "description": "Turn raw data into beautiful, interactive charts and dashboards.",
        "tools": [
            {
                "name": "RAWGraphs",
                "url": "https://rawgraphs.io/",
                "desc": "Open-source, free data visualization framework for complex data."
            },
            {
                "name": "Datawrapper",
                "url": "https://www.datawrapper.de/",
                "desc": "Create charts, maps, and tables with no coding (Free tier)."
            },
            {
                "name": "Flourish",
                "url": "https://flourish.studio/",
                "desc": "Beautiful, animated data stories without coding (Free for public projects)."
            },
            {
                "name": "Apache Superset",
                "url": "https://superset.apache.org/",
                "desc": "Modern, enterprise-ready open-source BI web application."
            },
            {
                "name": "Redash",
                "url": "https://redash.io/",
                "desc": "Open source tool to query databases and visualize results."
            },
            {
                "name": "Metabase",
                "url": "https://www.metabase.com/",
                "desc": "Open-source business intelligence tool anyone can use (Free self-hosted)."
            },
            {
                "name": "Observable",
                "url": "https://observablehq.com/",
                "desc": "Collaborative data visualization notebooks using JavaScript (Free tier)."
            },
            {
                "name": "Plotly Chart Studio",
                "url": "https://chart-studio.plotly.com/",
                "desc": "Create interactive, shareable charts and dashboards online (Free tier)."
            },
            {
                "name": "Grafana",
                "url": "https://grafana.com/",
                "desc": "The open-source analytics and monitoring platform (Free self-hosted)."
            },
            {
                "name": "Chartbrew",
                "url": "https://chartbrew.com/",
                "desc": "Open-source platform to create live dashboards from any data source."
            }
        ]
    },
    {
        "category": "Research & Academic",
        "icon": "🔬",
        "description": "Find papers, track citations, and access knowledge freely.",
        "tools": [
            {
                "name": "Semantic Scholar",
                "url": "https://www.semanticscholar.org/",
                "desc": "AI-powered research tool for scientific literature search."
            },
            {
                "name": "Connected Papers",
                "url": "https://www.connectedpapers.com/",
                "desc": "Visual tool to explore connected academic papers in a graph."
            },
            {
                "name": "CORE",
                "url": "https://core.ac.uk/",
                "desc": "World's largest collection of open access research papers."
            },
            {
                "name": "Unpaywall",
                "url": "https://unpaywall.org/",
                "desc": "Browser extension that finds free, legal versions of research papers."
            },
            {
                "name": "BASE Search",
                "url": "https://www.base-search.net/",
                "desc": "One of the world's most voluminous search engines for academic web resources."
            },
            {
                "name": "DOAJ",
                "url": "https://doaj.org/",
                "desc": "Directory of Open Access Journals with 19,000+ peer-reviewed journals."
            },
            {
                "name": "arXiv",
                "url": "https://arxiv.org/",
                "desc": "Open-access archive for scholarly articles in STEM fields."
            },
            {
                "name": "ResearchGate",
                "url": "https://www.researchgate.net/",
                "desc": "Professional network for scientists and researchers to share papers."
            },
            {
                "name": "Google Scholar",
                "url": "https://scholar.google.com/",
                "desc": "Freely accessible search engine for scholarly literature."
            },
            {
                "name": "Zotero",
                "url": "https://www.zotero.org/",
                "desc": "Free, open-source reference management software for researchers."
            }
        ]
    },
    {
        "category": "Music Discovery",
        "icon": "🎵",
        "description": "Discover new music, explore genres, and find rare recordings.",
        "tools": [
            {
                "name": "Every Noise at Once",
                "url": "https://everynoise.com/",
                "desc": "Algorithmically-generated scatter-plot of every music genre."
            },
            {
                "name": "MusicBrainz",
                "url": "https://musicbrainz.org/",
                "desc": "Open music encyclopedia and the community-maintained music database."
            },
            {
                "name": "Discogs",
                "url": "https://www.discogs.com/",
                "desc": "Crowdsourced music database and marketplace for collectors."
            },
            {
                "name": "Rate Your Music",
                "url": "https://rateyourmusic.com/",
                "desc": "Community music database with reviews, ratings, and custom lists."
            },
            {
                "name": "Album of the Year",
                "url": "https://www.albumoftheyear.org/",
                "desc": "Aggregate music review scores and discover critically acclaimed albums."
            },
            {
                "name": "Bandcamp",
                "url": "https://bandcamp.com/",
                "desc": "Platform where artists share music directly and fans discover new sounds."
            },
            {
                "name": "Radio Garden",
                "url": "https://radio.garden/",
                "desc": "Listen to live radio stations from around the world on a 3D globe."
            },
            {
                "name": "Radiooooo",
                "url": "https://radiooooo.com/",
                "desc": "Musical time machine: listen to music from any decade and country."
            },
            {
                "name": "Mixcloud",
                "url": "https://www.mixcloud.com/",
                "desc": "Platform for DJ mixes, podcasts, and radio shows worldwide."
            },
            {
                "name": "Music-Map",
                "url": "https://www.music-map.com/",
                "desc": "Find similar artists in an interactive graph — type any artist name."
            }
        ]
    },
    {
        "category": "Stock Media",
        "icon": "📸",
        "description": "Free, high-quality photos, videos, and illustrations for any project.",
        "tools": [
            {
                "name": "Unsplash",
                "url": "https://unsplash.com/",
                "desc": "Beautiful, free images and photos gifted by the world's best photographers."
            },
            {
                "name": "Pexels",
                "url": "https://www.pexels.com/",
                "desc": "Free stock photos, royalty free images, and videos shared by creators."
            },
            {
                "name": "Pixabay",
                "url": "https://pixabay.com/",
                "desc": "Over 4 million free, high-quality stock images, videos, and music."
            },
            {
                "name": "Burst",
                "url": "https://www.shopify.com/stock-photos",
                "desc": "Free stock photos for commercial use from Shopify."
            },
            {
                "name": "StockSnap",
                "url": "https://stocksnap.io/",
                "desc": "Beautiful free stock photos with no attribution required."
            },
            {
                "name": "Reshot",
                "url": "https://www.reshot.com/",
                "desc": "Handpicked, non-stocky free icons, illustrations, and photos."
            },
            {
                "name": "Life of Pix",
                "url": "https://www.lifeofpix.com/",
                "desc": "Free high-resolution photography donated by a creative agency."
            },
            {
                "name": "Gratisography",
                "url": "https://gratisography.com/",
                "desc": "Quirky, creative, always-free stock photos you won't find anywhere else."
            },
            {
                "name": "Coverr",
                "url": "https://coverr.co/",
                "desc": "Beautiful free stock video footage for your homepage or project."
            },
            {
                "name": "unDraw",
                "url": "https://undraw.co/",
                "desc": "Open-source illustrations for any idea with customizable colors."
            }
        ]
    },
    {
        "category": "Keyboard & Typing",
        "icon": "⌨️",
        "description": "Master touch typing with speed tests, practice, and gamified challenges.",
        "tools": [
            {
                "name": "Monkeytype",
                "url": "https://monkeytype.com/",
                "desc": "Minimalistic, customizable typing test with tons of options."
            },
            {
                "name": "Keybr",
                "url": "https://www.keybr.com/",
                "desc": "AI-adaptive typing practice that generates lessons based on your weaknesses."
            },
            {
                "name": "TypingTest.com",
                "url": "https://www.typingtest.com/",
                "desc": "Quick typing speed test with WPM tracking and history."
            },
            {
                "name": "10FastFingers",
                "url": "https://10fastfingers.com/",
                "desc": "Online typing speed test with multiplayer competitions."
            },
            {
                "name": "TypeRacer",
                "url": "https://play.typeracer.com/",
                "desc": "Competitive typing game where you race others by typing quotes."
            },
            {
                "name": "ZType",
                "url": "https://zty.pe/",
                "desc": "Space-themed typing game where you destroy words to save your ship."
            },
            {
                "name": "Typing.com",
                "url": "https://www.typing.com/",
                "desc": "Free typing tutor with structured lessons and digital literacy courses."
            },
            {
                "name": "Ratatype",
                "url": "https://www.ratatype.com/",
                "desc": "Free online typing tutor with touch typing course and certification."
            },
            {
                "name": "NitroType",
                "url": "https://www.nitrotype.com/",
                "desc": "Competitive typing game with car racing mechanics and team play."
            },
            {
                "name": "Speed Coder",
                "url": "https://www.speedcoder.net/",
                "desc": "Typing practice specifically designed for programmers and code syntax."
            }
        ]
    },
    {
        "category": "Language Learning",
        "icon": "🌍",
        "description": "Learn new languages for free with spaced-repetition and immersion tools.",
        "tools": [
            {
                "name": "Duolingo",
                "url": "https://www.duolingo.com/",
                "desc": "The world's most popular free language-learning platform with gamification."
            },
            {
                "name": "Anki",
                "url": "https://apps.ankiweb.net/",
                "desc": "Powerful, open-source flashcard app using spaced repetition algorithm."
            },
            {
                "name": "Clozemaster",
                "url": "https://www.clozemaster.com/",
                "desc": "Gamified language learning through mass exposure to vocabulary in context."
            },
            {
                "name": "LingQ",
                "url": "https://www.lingq.com/",
                "desc": "Learn languages from content you love — import books, podcasts, and more."
            },
            {
                "name": "Tandem",
                "url": "https://www.tandem.net/",
                "desc": "Language exchange app connecting you with native speakers worldwide."
            },
            {
                "name": "HelloTalk",
                "url": "https://www.hellotalk.com/",
                "desc": "Chat with native speakers and learn languages through conversation."
            },
            {
                "name": "Busuu (Free Tier)",
                "url": "https://www.busuu.com/",
                "desc": "Language courses with native speaker corrections (Free basic access)."
            },
            {
                "name": "Memrise",
                "url": "https://www.memrise.com/",
                "desc": "Learn languages with real-world videos and spaced-repetition flashcards."
            },
            {
                "name": "Readlang",
                "url": "https://readlang.com/",
                "desc": "Web reader that translates words as you read — builds vocabulary naturally."
            },
            {
                "name": "Language Reactor",
                "url": "https://www.languagereactor.com/",
                "desc": "Learn languages while watching Netflix and YouTube with dual subtitles."
            }
        ]
    },
    {
        "category": "Fitness & Workout",
        "icon": "🏋️",
        "description": "Free exercise libraries, workout trackers, and fitness programs.",
        "tools": [
            {
                "name": "DAREBEE",
                "url": "https://darebee.com/",
                "desc": "Hundreds of free, no-equipment workouts, programs, and challenges."
            },
            {
                "name": "MuscleWiki",
                "url": "https://musclewiki.com/",
                "desc": "Click a muscle to see exercises — the simplest exercise encyclopedia."
            },
            {
                "name": "Hevy",
                "url": "https://www.hevyapp.com/",
                "desc": "Free gym workout tracker and planner with social features."
            },
            {
                "name": "FitOn",
                "url": "https://fitonapp.com/",
                "desc": "Free workout app with celebrity trainer-led classes."
            },
            {
                "name": "wger",
                "url": "https://wger.de/",
                "desc": "Free, open-source web app for tracking workouts, nutrition, and body weight."
            },
            {
                "name": "Hasfit",
                "url": "https://hasfit.com/",
                "desc": "Free full-length workout videos for every fitness level."
            },
            {
                "name": "Nike Training Club",
                "url": "https://www.nike.com/ntc-app",
                "desc": "Free workout programs from Nike's world-class trainers."
            },
            {
                "name": "JEFIT",
                "url": "https://www.jefit.com/",
                "desc": "Free workout tracker with huge exercise database and routines."
            },
            {
                "name": "Fitness Blender",
                "url": "https://www.fitnessblender.com/",
                "desc": "600+ free full-length workout videos for every level and goal."
            },
            {
                "name": "Workout.lol",
                "url": "https://workout.lol/",
                "desc": "Open-source exercise picker — choose equipment and muscles, get a workout."
            }
        ]
    }
];

// Re-map to 60 unique categories if there are overlaps
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
