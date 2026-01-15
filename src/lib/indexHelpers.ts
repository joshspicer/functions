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
    const cyan = "\x1b[36m";
    const yellow = "\x1b[33m";
    const green = "\x1b[32m";
    const magenta = "\x1b[35m";

    // ASCII art logo similar to the example in the image
    const asciiArt = `${yellow}
    _           _
   (_)         | |
    _  ___  ___| |__
   | |/ _ \\/ __| '_ \\
   | | (_) \\__ \\ | | |
   | |\\___/|___/_| |_|
  _/ |
 |__/
${reset}`;

    // Helper function to create consistent boxes
    function createBox(title: string, content: string[], color: string, width = 35): string {
        const boxTop = `${color}┌─${title}${'─'.repeat(width - title.length - 2)}┐`;
        const boxBottom = `└${'─'.repeat(width - 1)}┘${reset}`;
        const paddedContent = content.map(line =>
            `${color}│ ${line}${' '.repeat(Math.max(0, width - line.length - 2))}│${reset}`
        );

        return [
            boxTop,
            `${color}│${' '.repeat(width - 1)}│${reset}`,
            ...paddedContent,
            `${color}│${' '.repeat(width - 1)}│${reset}`,
            boxBottom
        ].join('\n');
    }

    // About box
    const aboutBox = createBox("About", ["👋 I'm Josh Spicer"], cyan);

    // Spotify box
    const spotifyBox = spotifyData ? createBox(
        "Now Playing on Spotify",
        [
            `${spotifyData.isPlaying ? '▶️ Currently playing' : '⏸️ Last played'}:`,
            `"${spotifyData.songName}" by ${spotifyData.artistName}`
        ],
        magenta
    ) : '';

    return `${asciiArt}

${aboutBox}

${spotifyBox}

${cyan}Commands${reset}
${green}$ curl spicer.dev${reset}                           ${cyan}Get this page${reset}
${green}$ curl https://joshspicer.com/feed.xml${reset}      ${cyan}Get the RSS Feed${reset}

`;
}
