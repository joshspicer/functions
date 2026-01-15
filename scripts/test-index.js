#!/usr/bin/env node
// Quick test script for index page JavaScript functions
// Run with: node scripts/test-index.js

const { isBrowserUserAgent, generateTerminalOutput } = require('../dist/src/lib/indexHelpers');

console.log("Testing index page JavaScript functions\n");
console.log("=" .repeat(50));

// Test 1: isBrowserUserAgent
console.log("\n1. Testing isBrowserUserAgent()");
console.log("-".repeat(50));

const testCases = [
    { userAgent: "curl/7.68.0", expected: false, desc: "curl" },
    { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", expected: true, desc: "browser" },
    { userAgent: "wget/1.20.3", expected: false, desc: "wget" },
    { userAgent: "", expected: false, desc: "empty" },
    { userAgent: "python-requests/2.28.0", expected: false, desc: "python-requests" },
];

testCases.forEach(({ userAgent, expected, desc }) => {
    const result = isBrowserUserAgent(userAgent);
    const status = result === expected ? "✓" : "✗";
    console.log(`  ${status} ${desc}: ${result} (expected: ${expected})`);
});

// Test 2: generateTerminalOutput without Spotify data
console.log("\n2. Testing generateTerminalOutput() without Spotify data");
console.log("-".repeat(50));
const outputNoSpotify = generateTerminalOutput(null);
console.log("Output length:", outputNoSpotify.length, "characters");
console.log("Contains 'josh':", outputNoSpotify.toLowerCase().includes('josh') ? "✓" : "✗");
console.log("Contains 'About':", outputNoSpotify.includes('About') ? "✓" : "✗");
console.log("Contains 'Commands':", outputNoSpotify.includes('Commands') ? "✓" : "✗");

// Test 3: generateTerminalOutput with Spotify data
console.log("\n3. Testing generateTerminalOutput() with Spotify data");
console.log("-".repeat(50));
const mockSpotifyData = {
    artistName: "Test Artist",
    isPlaying: true,
    response: "success",
    songName: "Test Song"
};
const outputWithSpotify = generateTerminalOutput(mockSpotifyData);
console.log("Output length:", outputWithSpotify.length, "characters");
console.log("Contains 'Test Song':", outputWithSpotify.includes('Test Song') ? "✓" : "✗");
console.log("Contains 'Test Artist':", outputWithSpotify.includes('Test Artist') ? "✓" : "✗");
console.log("Contains 'Currently playing':", outputWithSpotify.includes('Currently playing') ? "✓" : "✗");

// Test 4: Display sample output
console.log("\n4. Sample terminal output");
console.log("-".repeat(50));
console.log(outputNoSpotify);

console.log("=" .repeat(50));
console.log("All tests completed!\n");
