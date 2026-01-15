// (c) 2025 Josh Spicer <hello@joshspicer.com>
// https://joshspicer.com

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { fetchSpotifyData, isBrowserUserAgent, generateTerminalOutput, SpotifyResponse } from "../lib/indexHelpers";

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

app.http('index', {
    methods: ['GET'],
    authLevel: 'anonymous', // public
    route: '/',
    handler: index
});
