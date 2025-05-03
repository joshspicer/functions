// (c) 2025 Josh Spicer <hello@joshspicer.com>
// https://joshspicer.com

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

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
    } else {
        // For terminal users, display ASCII art and information
        const terminalOutput = generateTerminalOutput();
        return {
            status: 200,
            headers: {
                "Content-Type": "text/plain"
            },
            body: terminalOutput
        };
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

function generateTerminalOutput(): string {
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

    return `${asciiArt}

${cyan}About:${reset}
👋 I'm Josh Spicer, a software engineer at Microsoft.

${cyan}Legend:${reset}
${green}$ curl spicer.dev${reset}                           ${cyan}Get this page${reset}
${green}$ curl https://joshspicer.com/feed.xml${reset}      ${cyan}Get the RSS Feed${reset}

`;
}

app.http('index', {
    methods: ['GET'],
    authLevel: 'anonymous', // public
    route: '/',
    handler: index
});
