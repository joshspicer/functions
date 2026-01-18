// (c) 2025 Josh Spicer <hello@joshspicer.com>
// https://joshspicer.com
// Helper functions for the index endpoint

// Interface for the Spotify API response
export interface SpotifyResponse {
    artistName: string;
    isPlaying: boolean;
    response: string;
    songName: string;
}

export async function fetchSpotifyData(): Promise<SpotifyResponse | null> {
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

export function isBrowserUserAgent(userAgent: string): boolean {
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

export function generateTerminalOutput(spotifyData?: SpotifyResponse | null): string {
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
    const white = "\x1b[37m";

    // Enhanced ASCII art with better styling
    const asciiArt = `${brightYellow}${bold}
     ██╗ ██████╗ ███████╗██╗  ██╗    ███████╗██████╗ ██╗ ██████╗███████╗██████╗
     ██║██╔═══██╗██╔════╝██║  ██║    ██╔════╝██╔══██╗██║██╔════╝██╔════╝██╔══██╗
     ██║██║   ██║███████╗███████║    ███████╗██████╔╝██║██║     █████╗  ██████╔╝
██   ██║██║   ██║╚════██║██╔══██║    ╚════██║██╔═══╝ ██║██║     ██╔══╝  ██╔══██╗
╚█████╔╝╚██████╔╝███████║██║  ██║    ███████║██║     ██║╚██████╗███████╗██║  ██║
 ╚════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚══════╝╚═╝     ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝
${reset}`;

    // Helper function to create section with header line (no side/bottom borders)
    function createSection(title: string, content: string[], color: string, width = 70): string {
        const headerLine = `${color}${bold}${title}${'─'.repeat(width - title.length)}${reset}`;
        const paddedContent = content.map(line => ` ${line}`);

        return [
            headerLine,
            ...paddedContent
        ].join('\n');
    }

    // Get current time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    // Header with greeting and time
    const greeting = `${brightCyan}${bold}👋 Welcome!${reset} ${dim}${timeStr}${reset}`;

    // About section mirroring joshspicer.com/whoami
    const aboutContent = [
        `${brightGreen}👋${reset} Hey there - I'm Josh.`,
        ``,
        `${brightGreen}📍${reset} I work at Microsoft on the VS Code Team. Previously GitHub Codespaces.`,
        ``,
        `${brightGreen}🎓${reset} I have a Master of Science in Cybersecurity and Bachelor of Science`,
        `   in Computer Science`,
        ``,
        `${brightGreen}☕️${reset} I'm learning Italian (ask me how to order a cappuccino)`
    ];
    const aboutSection = createSection("About Me", aboutContent, cyan);

    // Links section
    const linksContent = [
        `${brightBlue}[web]${reset}       https://joshspicer.com`,
        `${white}[github]${reset}    https://github.com/joshspicer`,
        `${brightCyan}[linkedin]${reset}  https://linkedin.com/in/joshspicer`,
        `${yellow}[mail]${reset}       hello@joshspicer.com`
    ];
    const linksSection = createSection("Connect", linksContent, blue);

    // Spotify section with enhanced styling
    let spotifySection = '';
    if (spotifyData) {
        const statusIcon = spotifyData.isPlaying ? '▶️' : '⏸️';
        const statusText = spotifyData.isPlaying ? 'playing on Spotify' : 'last played on Spotify';
        const spotifyContent = [
            ``,
            `${brightGreen}♫${reset} ${bold}"${spotifyData.songName}"${reset}`,
            `   ${dim}by${reset} ${spotifyData.artistName}`
        ];
        spotifySection = '\n' + createSection(`🎵 Now ${statusText}`, spotifyContent, magenta);
    }

    // Commands section (keeping original design style)
    const commands = `
${cyan}Commands${reset}
${green}$ curl spicer.dev${reset}                           ${cyan}Get this page${reset}
${green}$ curl https://joshspicer.com/feed.xml${reset}      ${cyan}Get the RSS Feed${reset}
`;

    return `
${asciiArt}

${greeting}

${aboutSection}

${linksSection}
${spotifySection}

${commands}
`;
}
