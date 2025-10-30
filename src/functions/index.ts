// (c) 2025 Josh Spicer <hello@joshspicer.com>
// https://joshspicer.com

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

// Interface for the Spotify API response
interface SpotifyResponse {
    artistName: string;
    isPlaying: boolean;
    response: string;
    songName: string;
}

export async function index(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Index function processed request for url "${request.url}"`);

    const userAgent = request.headers.get("user-agent") || "";
    const isBrowser = isBrowserUserAgent(userAgent);

    if (isBrowser) {
        // For browser users, redirect to main website
        return {
            status: 302,
            headers: {
                "Location": "https://joshspicer.com"
            }
        };
    }

    let spotifyData: SpotifyResponse | null = null;
    try {
        spotifyData = await fetchSpotifyData();
    } catch (error) {
        context.log(`Error fetching Spotify data: ${error}`);
    }
    const terminalOutput = generateTerminalOutput(spotifyData);
    return {
        status: 200,
        headers: {
            "Content-Type": "text/plain"
        },
        body: terminalOutput
    };
}

async function fetchSpotifyData(): Promise<SpotifyResponse | null> {
    try {
        const response = await fetch('https://api.joshspicer.com/api/spotify');
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }
        return await response.json() as SpotifyResponse;
    } catch (error) {
        console.error('Error fetching Spotify data:', error);
        return null;
    }
}

function isBrowserUserAgent(userAgent: string): boolean {
    // Check for common browser identifiers
    const browserIdentifiers = [
        "Mozilla", "Chrome", "Safari", "Firefox", "Edge", "Opera",
        "MSIE", "Trident", "Gecko", "WebKit", "Blink"
    ];

    // Check for common terminal/CLI tools
    const terminalIdentifiers = [
        "curl", "wget", "HTTPie", "Postman", "insomnia",
        "python-requests", "Ruby", "Go-http-client", "node-fetch"
    ];

    // If empty user agent, assume it's a terminal
    if (!userAgent) return false;

    // If it has terminal identifiers, it's likely from terminal
    for (const term of terminalIdentifiers) {
        if (userAgent.toLowerCase().includes(term.toLowerCase())) return false;
    }

    // If it has browser identifiers, it's likely a browser
    for (const browser of browserIdentifiers) {
        if (userAgent.toLowerCase().includes(browser.toLowerCase())) return true;
    }

    // Default to terminal if we can't determine
    return false;
}

function generateTerminalOutput(spotifyData?: SpotifyResponse | null): string {
    // ANSI color codes and styles
    const reset = "\x1b[0m";
    const bold = "\x1b[1m";
    const dim = "\x1b[2m";
    const italic = "\x1b[3m";
    const underline = "\x1b[4m";
    
    // Colors
    const black = "\x1b[30m";
    const red = "\x1b[31m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const blue = "\x1b[34m";
    const magenta = "\x1b[35m";
    const cyan = "\x1b[36m";
    const white = "\x1b[37m";
    
    // Bright colors
    const brightBlack = "\x1b[90m";
    const brightRed = "\x1b[91m";
    const brightGreen = "\x1b[92m";
    const brightYellow = "\x1b[93m";
    const brightBlue = "\x1b[94m";
    const brightMagenta = "\x1b[95m";
    const brightCyan = "\x1b[96m";
    const brightWhite = "\x1b[97m";
    
    // Background colors
    const bgBlue = "\x1b[44m";
    const bgMagenta = "\x1b[45m";
    const bgCyan = "\x1b[46m";
    
    // Impressive ASCII art banner with gradient effect
    const banner = `
${brightCyan}╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║${reset}     ${brightMagenta}     ██╗ ██████╗ ███████╗██╗  ██╗    ███████╗██████╗ ██╗ ██████╗███████╗██████╗${reset}${brightCyan}    ║
${brightCyan}║${reset}     ${brightMagenta}     ██║██╔═══██╗██╔════╝██║  ██║    ██╔════╝██╔══██╗██║██╔════╝██╔════╝██╔══██╗${reset}${brightCyan}   ║
${brightCyan}║${reset}     ${brightBlue}     ██║██║   ██║███████╗███████║    ███████╗██████╔╝██║██║     █████╗  ██████╔╝${reset}${brightCyan}   ║
${brightCyan}║${reset}     ${blue}██  ██║██║   ██║╚════██║██╔══██║    ╚════██║██╔═══╝ ██║██║     ██╔══╝  ██╔══██╗${reset}${brightCyan}   ║
${brightCyan}║${reset}     ${cyan}╚█████╔╝╚██████╔╝███████║██║  ██║    ███████║██║     ██║╚██████╗███████╗██║  ██║${reset}${brightCyan}   ║
${brightCyan}║${reset}      ${cyan}╚════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚══════╝╚═╝     ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝${reset}${brightCyan}   ║
║                                                                               ║
║${reset}          ${brightWhite}${bold}⚡ Software Engineer  •  Cloud Architect  •  Creative Technologist ⚡${reset}${brightCyan}     ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝${reset}
`;

    // Helper function to create impressive boxes with double borders
    function createFancyBox(title: string, content: string[], icon: string, colorTitle: string, colorBorder: string, width = 78): string {
        const titleSection = ` ${icon} ${bold}${colorTitle}${title}${reset}${colorBorder} `;
        const titleLength = title.length + icon.length + 2; // without ANSI codes
        const boxTop = `${colorBorder}╔═${titleSection}${'═'.repeat(width - titleLength - 3)}╗`;
        const boxBottom = `╚${'═'.repeat(width)}╝${reset}`;
        const paddedContent = content.map(line => {
            // Calculate actual display length (remove ANSI codes for length calculation)
            const displayLength = line.replace(/\x1b\[[0-9;]*m/g, '').length;
            return `${colorBorder}║${reset} ${line}${' '.repeat(Math.max(0, width - displayLength - 1))} ${colorBorder}║${reset}`;
        });
        
        return [
            boxTop,
            ...paddedContent,
            boxBottom
        ].join('\n');
    }

    // Stats badges with visual flair
    const badges = `${dim}${brightBlack}    ╭────────────────────────────────────────────────────────────────────────────╮
    │${reset} ${bgCyan}${black}${bold} BLOG ${reset} ${bgMagenta}${white}${bold} OPEN SOURCE ${reset} ${bgBlue}${white}${bold} AZURE ${reset} ${brightGreen}●${reset} ${dim}Available for Consulting${reset} ${dim}${brightBlack}│
    ╰────────────────────────────────────────────────────────────────────────────╯${reset}`;

    // About section with enhanced styling
    const aboutContent = [
        `${brightWhite}${bold}Hey there! 👋 I'm Josh Spicer${reset}`,
        ``,
        `${brightYellow}▸${reset} ${white}Software Engineer passionate about cloud architecture & DevOps`,
        `${brightYellow}▸${reset} ${white}Building scalable solutions on Azure & modern web technologies`,
        `${brightYellow}▸${reset} ${white}Sharing knowledge through ${underline}https://joshspicer.com${reset}`,
    ];
    const aboutBox = createFancyBox("ABOUT", aboutContent, "👤", brightCyan, cyan, 78);
    
    // Spotify box with enhanced styling
    let spotifyBox = '';
    if (spotifyData) {
        const playingIcon = spotifyData.isPlaying ? '🎵' : '⏸️';
        const statusText = spotifyData.isPlaying ? 'Currently Vibing To' : 'Last Played';
        const spotifyContent = [
            `${brightGreen}${playingIcon} ${statusText}${reset}`,
            ``,
            `${brightWhite}${bold}♪ ${spotifyData.songName}${reset}`,
            `${dim}${italic}by ${spotifyData.artistName}${reset}`,
        ];
        spotifyBox = '\n' + createFancyBox("NOW PLAYING", spotifyContent, "🎧", brightMagenta, magenta, 78);
    }

    // Links section with visual hierarchy
    const linksContent = [
        `${brightBlue}🌐 Website:${reset}     ${underline}https://joshspicer.com${reset}`,
        `${brightMagenta}📝 Blog:${reset}        ${underline}https://joshspicer.com/blog${reset}`,
        `${brightGreen}📡 RSS Feed:${reset}    ${dim}curl ${underline}https://joshspicer.com/feed.xml${reset}`,
        `${brightCyan}💼 GitHub:${reset}      ${underline}https://github.com/joshspicer${reset}`,
        `${brightYellow}📧 Email:${reset}       ${underline}hello@joshspicer.com${reset}`,
    ];
    const linksBox = createFancyBox("CONNECT", linksContent, "🔗", brightGreen, green, 78);

    // Command examples with professional styling
    const commandsSection = `
${brightCyan}╔═══════════════════════════════════════════════════════════════════════════════╗
║ ${bold}⚡ QUICK COMMANDS${reset}                                                            ${brightCyan}║
╠═══════════════════════════════════════════════════════════════════════════════╣
║${reset}                                                                               ${brightCyan}║
║${reset}  ${brightGreen}▸ curl spicer.dev${reset}                                                          ${brightCyan}║
║${reset}    ${dim}Show this page${reset}                                                             ${brightCyan}║
║${reset}                                                                               ${brightCyan}║
║${reset}  ${brightGreen}▸ curl https://joshspicer.com/feed.xml${reset}                                    ${brightCyan}║
║${reset}    ${dim}Get latest blog posts via RSS${reset}                                             ${brightCyan}║
║${reset}                                                                               ${brightCyan}║
║${reset}  ${brightGreen}▸ curl -L joshspicer.com${reset}                                                   ${brightCyan}║
║${reset}    ${dim}Visit the full website${reset}                                                    ${brightCyan}║
║${reset}                                                                               ${brightCyan}║
╚═══════════════════════════════════════════════════════════════════════════════╝${reset}`;

    // Footer with subtle branding
    const footer = `
${dim}${brightBlack}    ────────────────────────────────────────────────────────────────────────────${reset}
${dim}${italic}    Made with ❤️  and deployed on Azure Functions  •  © 2025 Josh Spicer${reset}
${dim}${brightBlack}    ────────────────────────────────────────────────────────────────────────────${reset}
`;

    // Assemble the complete output
    return `${banner}
${badges}

${aboutBox}
${spotifyBox}

${linksBox}
${commandsSection}
${footer}
`;
}

app.http('index', {
    methods: ['GET'],
    authLevel: 'anonymous', // public
    route: '/',
    handler: index
});
