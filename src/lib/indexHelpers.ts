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

    // Helper function to create consistent boxes with better visuals
    function createBox(title: string, content: string[], color: string, width = 70): string {
        const boxTop = `${color}${bold}╔═${title}${'═'.repeat(width - title.length - 2)}╗${reset}`;
        const boxBottom = `${color}╚${'═'.repeat(width - 1)}╝${reset}`;
        const paddedContent = content.map(line => {
            // Strip ANSI codes to measure actual length
            const lineLength = line.replace(/\x1b\[[0-9;]*m/g, '').length;
            const padding = Math.max(0, width - lineLength - 3);
            return `${color}║${reset} ${line}${' '.repeat(padding)}${color}║${reset}`;
        });

        return [
            boxTop,
            ...paddedContent,
            boxBottom
        ].join('\n');
    }

    // Get current time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    // Header with greeting and time
    const greeting = `${brightCyan}${bold}👋 Welcome!${reset} ${dim}${timeStr}${reset}`;

    // About section with more details
    const aboutContent = [
        `${brightGreen}●${reset} ${bold}Software Engineer${reset} building cool things`,
        `${brightGreen}●${reset} Passionate about ${cyan}cloud${reset}, ${magenta}IoT${reset}, and ${blue}automation${reset}`,
        `${brightGreen}●${reset} Based in ${red}♥${reset} Boston, MA`
    ];
    const aboutBox = createBox("About Me", aboutContent, cyan);

    // Links section
    const linksContent = [
        `${brightBlue}🌐 Website:${reset}   https://joshspicer.com`,
        `${white}🐙 GitHub:${reset}    https://github.com/joshspicer`,
        `${brightCyan}💼 LinkedIn:${reset}  https://linkedin.com/in/joshspicer`,
        `${yellow}📧 Email:${reset}     hello@joshspicer.com`
    ];
    const linksBox = createBox("Connect", linksContent, blue);

    // Spotify section with enhanced styling
    let spotifyBox = '';
    if (spotifyData) {
        const statusIcon = spotifyData.isPlaying ? '▶️' : '⏸️';
        const statusText = spotifyData.isPlaying ? 'Currently playing' : 'Last played';
        const spotifyContent = [
            `${statusIcon} ${bold}${statusText}${reset}`,
            ``,
            `${brightGreen}♫${reset} ${bold}"${spotifyData.songName}"${reset}`,
            `   ${dim}by${reset} ${spotifyData.artistName}`
        ];
        spotifyBox = '\n' + createBox("🎵 Now on Spotify", spotifyContent, magenta);
    }

    // API endpoints section
    const endpointsContent = [
        `${green}GET${reset}  ${dim}/${reset}                  ${dim}→${reset} This page`,
        `${green}GET${reset}  ${dim}/api/heartbox${reset}      ${dim}→${reset} IoT heartbeat data`,
        `${green}GET${reset}  ${dim}/feed.xml${reset}          ${dim}→${reset} Blog RSS feed (on main site)`
    ];
    const endpointsBox = createBox("📡 Available Endpoints", endpointsContent, green);

    // Fun commands/examples section
    const examplesContent = [
        `${brightYellow}$${reset} curl spicer.dev`,
        `${brightYellow}$${reset} curl -H "Accept: application/json" spicer.dev/api/heartbox`,
        `${brightYellow}$${reset} curl https://joshspicer.com/feed.xml ${dim}| grep '<title>'${reset}`,
        `${brightYellow}$${reset} curl -L joshspicer.com  ${dim}# Main website${reset}`
    ];
    const examplesBox = createBox("💡 Try These Commands", examplesContent, yellow);

    // Tech tip
    const tips = [
        "Did you know? Azure Functions can scale automatically based on demand!",
        "Pro tip: Use 'curl -i' to see HTTP headers in the response.",
        "Fun fact: This page detects your user agent and redirects browsers to the main site.",
        "Tip: Add '-L' to curl to automatically follow redirects.",
        "Did you know? You can pipe curl output through 'jq' for pretty JSON formatting!"
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    // Footer with tip
    const footer = `
${dim}─────────────────────────────────────────────────────────────────────${reset}
${brightCyan}💡 ${randomTip}${reset}
${dim}─────────────────────────────────────────────────────────────────────${reset}
`;

    return `
${asciiArt}

${greeting}

${aboutBox}

${linksBox}
${spotifyBox}

${endpointsBox}

${examplesBox}
${footer}
`;
}
