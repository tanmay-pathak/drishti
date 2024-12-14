# Drishti

A powerful visual regression testing tool for websites that can capture screenshots of individual URLs or entire sitemaps with customizable viewport settings.

[![npm version](https://img.shields.io/npm/v/drishti.svg)](https://www.npmjs.com/package/drishti)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 📸 Capture screenshots of single URLs or entire sitemaps
- 📱 Support for desktop and mobile (iPhone X) viewports
- ⚡ Concurrent processing for faster sitemap captures
- 🎨 Customizable viewport dimensions
- ⏱️ Configurable capture delay
- 🔍 Pixel-by-pixel comparison
- 📊 Detailed visual diff reports

## Requirements

- Node.js >= 16

## Installation

You can install Drishti globally using npm:

```bash
npm install -g drishti
```

For local development:

```bash
# Clone the repository
git clone https://github.com/tanmay-pathak/drishti.git

# Install dependencies
npm install

# Build the package
npm run build

# Optional: Link the package globally
npm link
```

## Usage

### CLI Usage

```bash
drishti capture <url-or-sitemap> [options]
```

#### Options

- `-o, --output <dir>` - Output directory (default: "./screenshots")
- `-w, --width <pixels>` - Viewport width (default: 1920)
- `-h, --height <pixels>` - Viewport height (default: 1080)
- `-f, --full-page` - Capture full page (default: false)
- `-d, --delay <seconds>` - Delay before capture in seconds (default: 0)
- `-m, --mobile` - Capture in iPhone X mobile view (default: false)
- `-c, --concurrency <number>` - Number of concurrent captures (default: 5)

### Examples

1. Capture a single URL:

```bash
drishti capture https://example.com
```

2. Capture a sitemap with mobile view:

```bash
drishti capture https://example.com/sitemap.xml -m
```

3. Capture with custom viewport and output directory:

```bash
drishti capture https://example.com -w 1440 -h 900 -o ./my-screenshots
```

4. Capture full page with 2-second delay:

```bash
drishti capture https://example.com -f -d 2
```

## Development

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

### Available Scripts

- `npm run build` - Build the project
- `npm run drishti` - Run the CLI tool locally
- `npm run fix-permissions` - Fix file permissions if needed (requires sudo)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Name Origin

"Drishti" (दृष्टि) is a Sanskrit word meaning "vision" or "sight", reflecting the tool's purpose in visual testing and monitoring.

## License

MIT © Tanmay Pathak
