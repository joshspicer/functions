# GitHub Copilot Instructions

## Index Function Development

When modifying the index page logic (`src/lib/indexHelpers.ts` or `src/functions/index.ts`):

### Required Testing Steps

After every edit, you must:

1. **Build the TypeScript**:
   ```bash
   npm run build
   ```

2. **Run the test script**:
   ```bash
   node scripts/test-index.js
   ```

3. **Capture and display the output** showing what the terminal will look like

### Output Requirements

- Show the complete test output including ANSI color codes
- Render the output so colors and ASCII art are visible
- Include this in your response, PR comment, or commit message
- This allows rapid async iteration without manual testing

### Quick Command

```bash
npm run build && node scripts/test-index.js
```

## File Structure

- **`src/lib/indexHelpers.ts`**: Core testable logic
  - `isBrowserUserAgent()` - Detects browser vs terminal clients
  - `fetchSpotifyData()` - Fetches Spotify API data
  - `generateTerminalOutput()` - Creates ANSI-formatted output

- **`src/functions/index.ts`**: Azure Functions HTTP handler (thin wrapper)

- **`scripts/test-index.js`**: Standalone test runner

## Workflow Integration

The `test-index-output.yml` workflow automatically runs on changes to these files and displays the output in GitHub Actions job summaries.

## Example Usage

```typescript
// After editing src/lib/indexHelpers.ts
// Run: npm run build && node scripts/test-index.js
// Then include the output like:

/*
Terminal output after changes:
==================================================
1. Testing isBrowserUserAgent()
--------------------------------------------------
  ✓ curl: false (expected: false)
  ✓ browser: true (expected: true)
...
*/
```
