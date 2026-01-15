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
    // ANSI color codes
    const reset = "\x1b[0m";
    const bold = "\x1b[1m";
    const dim = "\x1b[2m";
    const cyan = "\x1b[36m";
    const brightCyan = "\x1b[96m";
    const yellow = "\x1b[33m";
    const brightYellow = "\x1b[93m";
    const green = "\x1b[32m";
    const brightGreen = "\x1b[92m";
    const magenta = "\x1b[35m";
    const brightMagenta = "\x1b[95m";
    const blue = "\x1b[34m";
    const brightBlue = "\x1b[94m";
    const red = "\x1b[31m";
    const white = "\x1b[97m";

    // Enhanced ASCII art banner with gradient effect
    const asciiArt = `${brightCyan}
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║     ${brightYellow}     ██╗ ██████╗ ███████╗██╗  ██╗    ███████╗██████╗ ██╗ ██████╗███████╗██████╗${brightCyan}     ║
║     ${yellow}     ██║██╔═══██╗██╔════╝██║  ██║    ██╔════╝██╔══██╗██║██╔════╝██╔════╝██╔══██╗${brightCyan}    ║
║     ${brightYellow}     ██║██║   ██║███████╗███████║    ███████╗██████╔╝██║██║     █████╗  ██████╔╝${brightCyan}    ║
║     ${yellow}██╗  ██║██║   ██║╚════██║██╔══██║    ╚════██║██╔═══╝ ██║██║     ██╔══╝  ██╔══██╗${brightCyan}    ║
║     ${brightYellow}╚█████╔╝╚██████╔╝███████║██║  ██║    ███████║██║     ██║╚██████╗███████╗██║  ██║${brightCyan}    ║
║     ${yellow} ╚════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚══════╝╚═╝     ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝${brightCyan}    ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝${reset}
`;

    // Helper function to create consistent boxes with enhanced styling
    function createBox(title: string, content: string[], color: string, width = 70): string {
        const boxTop = `${color}┌──[ ${bold}${title}${reset}${color} ]${'─'.repeat(Math.max(0, width - title.length - 7))}┐${reset}`;
        const boxBottom = `${color}└${'─'.repeat(width - 1)}┘${reset}`;
        const paddedContent = content.map(line => {
            // Remove ANSI codes for length calculation
            const strippedLine = line.replace(/\x1b\[[0-9;]*m/g, '');
            const padding = Math.max(0, width - strippedLine.length - 3);
            return `${color}│${reset} ${line}${' '.repeat(padding)} ${color}│${reset}`;
        });

        return [
            boxTop,
            ...paddedContent,
            boxBottom
        ].join('\n');
    }

    // About box with more personality
    const aboutBox = createBox("👤 About Me", [
        `${brightGreen}${bold}👋 Hey there! I'm Josh Spicer${reset}`,
        ``,
        `${cyan}🎓 Software Engineer & Tech Enthusiast${reset}`,
        `${dim}   Building cool things and sharing knowledge${reset}`,
        ``,
        `${brightBlue}📍 Location:${reset} Boston, MA`,
        `${brightBlue}💼 Work:${reset} Microsoft`,
        `${brightBlue}🌐 Web:${reset} ${white}https://joshspicer.com${reset}`,
    ], brightCyan);

    // Spotify box with enhanced styling
    const spotifyBox = spotifyData ? createBox(
        "🎵 Now Playing on Spotify",
        [
            `${spotifyData.isPlaying ? `${green}▶${reset}  ${brightGreen}Currently vibing to:${reset}` : `${dim}⏸${reset}  ${dim}Last played:${reset}`}`,
            ``,
            `${bold}${brightMagenta}♫ ${spotifyData.songName}${reset}`,
            `   ${magenta}by ${spotifyData.artistName}${reset}`,
        ],
        magenta
    ) : '';

    // Links and social media box
    const linksBox = createBox("🔗 Connect With Me", [
        `${brightBlue}🌐 Website:${reset}      ${white}https://joshspicer.com${reset}`,
        `${brightBlue}📝 Blog:${reset}         ${white}https://joshspicer.com/blog${reset}`,
        `${brightBlue}💻 GitHub:${reset}       ${white}https://github.com/joshspicer${reset}`,
        `${brightBlue}🐦 Twitter:${reset}      ${white}https://twitter.com/joshspicer${reset}`,
        `${brightBlue}💼 LinkedIn:${reset}     ${white}https://linkedin.com/in/joshspicer${reset}`,
        `${brightBlue}📧 Email:${reset}        ${white}hello@joshspicer.com${reset}`,
    ], blue);

    // Projects highlight box
    const projectsBox = createBox("🚀 Featured Projects", [
        `${brightYellow}▸${reset} ${bold}HeartBox${reset} - ${dim}IoT project for meaningful connections${reset}`,
        `  ${cyan}https://joshspicer.com/heartbox${reset}`,
        ``,
        `${brightYellow}▸${reset} ${bold}Azure Functions${reset} - ${dim}Serverless experiments and utilities${reset}`,
        `  ${cyan}https://github.com/joshspicer/functions${reset}`,
    ], yellow);

    // Terminal commands box
    const commandsBox = createBox("⚡ Quick Commands", [
        `${green}${bold}$ curl spicer.dev${reset}`,
        `  ${dim}Display this awesome page${reset}`,
        ``,
        `${green}${bold}$ curl https://joshspicer.com/feed.xml${reset}`,
        `  ${dim}Grab my RSS feed${reset}`,
        ``,
        `${green}${bold}$ curl https://api.joshspicer.com/api/spotify${reset}`,
        `  ${dim}See what I'm listening to (JSON)${reset}`,
    ], green);

    // Fun footer with random tech quote/tip
    const quotes = [
        "💡 Tip: This page looks even better with a dark terminal theme!",
        "🎨 Pro tip: Try running this with 'curl -L spicer.dev | less -R' for colors!",
        "✨ Fun fact: This is an Azure Function running TypeScript!",
        "🔧 DevOps: Deployed automatically via GitHub Actions",
        "🌟 Thanks for visiting! Feel free to reach out anytime.",
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const footer = `
${dim}${'─'.repeat(73)}${reset}
${cyan}${randomQuote}${reset}
${dim}${'─'.repeat(73)}${reset}
`;

    // Combine everything with nice spacing
    return `${asciiArt}
${aboutBox}

${spotifyBox ? spotifyBox + '\n' : ''}
${linksBox}

${projectsBox}

${commandsBox}
${footer}
${dim}Last updated: ${new Date().toUTCString()}${reset}

`;
}

app.http('index', {
    methods: ['GET'],
    authLevel: 'anonymous', // public
    route: '/',
    handler: index
});
