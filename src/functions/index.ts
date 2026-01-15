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
        return {
            status: 302,
            headers: { "Location": "https://joshspicer.com" }
        };
    }

    const prefs = readTerminalPreferences(request);

    let spotifyData: SpotifyResponse | null = null;
    try {
        spotifyData = await fetchSpotifyData();
    } catch (error) {
        context.log(`Error fetching Spotify data: ${error}`);
    }

    const terminalOutput = generateTerminalOutput({ spotifyData, prefs });
    return {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store"
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

function generateTerminalOutput(options: { spotifyData?: SpotifyResponse | null; prefs: TerminalPreferences }): string {
    const { spotifyData, prefs } = options;
    const theme = buildTheme(prefs.monochrome);
    const width = prefs.width;

    const timeString = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }).format(new Date());

    const header = [
        gradientBar(width, theme),
        centerLine(gradientText("spicer.dev", theme), width),
        centerLine(`${theme.dim}NYC → SF · ${timeString}${theme.reset}`, width),
        gradientBar(width, theme),
        ""
    ];

    const panels = [];
    panels.push(makePanel("Status", [
        `Now: ${theme.accent}building, shipping, tinkering${theme.reset}`,
        `Where: ${theme.accent}San Francisco (usually)${theme.reset}`,
        `Inbox: ${theme.accent}hello@joshspicer.com${theme.reset}`
    ], width, theme));

    panels.push(makePanel("Now Playing", [
        spotifyData
            ? `${spotifyData.isPlaying ? "▶️" : "⏸️"} ${spotifyData.songName} — ${spotifyData.artistName}`
            : "No live track right now. (Spotify quietly dozing.)"
    ], width, theme));

    panels.push(makePanel("Build Log", [
        `Latest deploy: ${theme.accent}Azure Functions${theme.reset}`,
        `Packages: ${theme.accent}@azure/functions • moment${theme.reset}`,
        `Stack: ${theme.accent}TypeScript • serverless • edge${theme.reset}`
    ], width, theme));

    panels.push(makePanel("Try These", [
        "$ curl spicer.dev",
        "$ curl spicer.dev?w=110      # wide layout",
        "$ curl spicer.dev?mono=1     # monochrome",
        "$ curl https://joshspicer.com/feed.xml"
    ], width, theme));

    const body = layoutPanels(panels, width, theme);

    const footer = [
        "",
        centerLine(`${theme.dim}Made with curiosity. Optimized for terminals.${theme.reset}`, width),
        centerLine(`${theme.dim}Tip: add ?w=120 or ?mono=1 depending on your tty.${theme.reset}`, width),
        ""
    ];

    return [...header, body, ...footer].join("\n");
}

function readTerminalPreferences(request: HttpRequest): TerminalPreferences {
    const url = new URL(request.url);
    const widthParam = url.searchParams.get("w") || url.searchParams.get("width") || request.headers.get("x-terminal-width") || request.headers.get("x-width");
    const parsedWidth = widthParam ? Number(widthParam) : NaN;
    const width = clampWidth(Number.isFinite(parsedWidth) ? parsedWidth : 90);
    const monochrome = url.searchParams.has("mono") || url.searchParams.has("nocolor") || request.headers.get("x-no-color") === "1";
    return { width, monochrome };
}

function clampWidth(width: number): number {
    const min = 64;
    const max = 140;
    if (Number.isNaN(width)) return 90;
    return Math.min(Math.max(Math.floor(width), min), max);
}

function buildTheme(monochrome: boolean): Theme {
    if (monochrome) {
        return {
            reset: "",
            primary: "",
            accent: "",
            dim: "",
            strong: "",
            background: "",
            bar: "",
            monochrome: true
        };
    }

    return {
        reset: "\x1b[0m",
        primary: "\x1b[38;5;213m",
        accent: "\x1b[38;5;81m",
        dim: "\x1b[38;5;244m",
        strong: "\x1b[38;5;231m",
        background: "\x1b[48;5;17m",
        bar: "\x1b[38;5;51m",
        monochrome: false
    };
}

function gradientText(text: string, theme: Theme): string {
    if (theme.monochrome) return text;
    const colors = [198, 207, 214, 123, 45, 33, 39, 69, 129, 199];
    return text
        .split("")
        .map((char, idx) => `\x1b[38;5;${colors[idx % colors.length]}m${char}`)
        .join("") + theme.reset;
}

function gradientBar(width: number, theme: Theme): string {
    const colors = [45, 51, 57, 63, 69, 75, 81, 117, 123];
    const blocks = [];
    for (let i = 0; i < width; i++) {
        const color = colors[i % colors.length];
        const block = theme.monochrome ? "━" : `\x1b[38;5;${color}m━`;
        blocks.push(block);
    }
    return blocks.join("") + (theme.monochrome ? "" : theme.reset);
}

function centerLine(text: string, width: number): string {
    const len = visibleLength(text);
    if (len >= width) return text;
    const padding = Math.floor((width - len) / 2);
    return `${" ".repeat(padding)}${text}`;
}

function makePanel(title: string, lines: string[], totalWidth: number, theme: Theme): string[] {
    const panelWidth = calculatePanelWidth(totalWidth);
    const innerWidth = panelWidth - 2;
    const borderColor = theme.monochrome ? "" : theme.primary;
    const topPadding = Math.max(0, innerWidth - title.length - 1);
    const top = `${borderColor}┌ ${title}${" ".repeat(topPadding)}┐${theme.reset}`;
    const bottom = `${borderColor}└${"─".repeat(innerWidth)}┘${theme.reset}`;

    const wrapped = lines
        .flatMap(line => wrapLine(line, innerWidth - 1))
        .map(content => {
            const visible = visibleLength(content);
            const available = Math.max(0, innerWidth - 1);
            const padding = Math.max(0, available - visible);
            return `${borderColor}│${theme.reset} ${content}${" ".repeat(padding)}${borderColor}│${theme.reset}`;
        });

    return [top, ...wrapped, bottom];
}

function layoutPanels(panels: string[][], width: number, theme: Theme): string {
    const twoColumn = width >= 92;
    if (!twoColumn) {
        return panels.map(panel => panel.join("\n")).join("\n\n");
    }

    const colWidth = calculatePanelWidth(width);
    const rows: string[] = [];

    for (let i = 0; i < panels.length; i += 2) {
        const left = panels[i];
        const right = panels[i + 1] || [];
        const maxLines = Math.max(left.length, right.length);

        for (let line = 0; line < maxLines; line++) {
            const l = padToWidth(left[line] || "", colWidth, theme);
            const r = padToWidth(right[line] || "", colWidth, theme);
            rows.push(`${l}  ${r}`);
        }

        if (i + 2 < panels.length) {
            rows.push("");
        }
    }

    return rows.join("\n");
}

function calculatePanelWidth(totalWidth: number): number {
    const twoColumn = totalWidth >= 92;
    if (!twoColumn) {
        return Math.min(totalWidth, 88);
    }
    return Math.floor((totalWidth - 2) / 2);
}

function wrapLine(text: string, width: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const proposed = current ? `${current} ${word}` : word;
        if (visibleLength(proposed) <= width) {
            current = proposed;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }

    if (current) lines.push(current);
    return lines;
}

function visibleLength(text: string): number {
    return stripAnsi(text).length;
}

function padToWidth(text: string, width: number, theme: Theme): string {
    const len = visibleLength(text);
    if (len >= width) return text;
    return text + " ".repeat(width - len) + (theme.monochrome ? "" : theme.reset);
}

function stripAnsi(input: string): string {
    return input.replace(/\x1B\[[0-9;]*m/g, "");
}

interface TerminalPreferences {
    width: number;
    monochrome: boolean;
}

interface Theme {
    reset: string;
    primary: string;
    accent: string;
    dim: string;
    strong: string;
    background: string;
    bar: string;
    monochrome: boolean;
}

app.http('index', {
    methods: ['GET'],
    authLevel: 'anonymous', // public
    route: '/',
    handler: index
});
