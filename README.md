# Nexus.ai

A customer-support AI dashboard with a knowledge base, embeddable web chat widget, lead capture, human handoff notifications, channel settings, and conversation review.

## Generated with GenMB

This project was generated using [GenMB](https://genmb.com) - AI-powered application builder.

### Original Prompt

> Build an AI chatbot that answers customer questions about my business - products, pricing, and hours - from a knowledge base I provide, captures the visitor's name and email as a lead, and hands off to a human by notifying me when it can't answer. Include an embeddable website chat widget, the option to also run it on Telegram or WhatsApp, and a log of every conversation so I can review them later.

## Getting Started

### Prerequisites

- Node.js 18+

### Running Locally

```bash
npm install
npm run dev
```

## Framework

This project uses **React-Ts**.

## Progressive Web App (PWA)

This app is PWA-enabled and can be installed on mobile devices!

### PWA Files Included

- `manifest.json` - App manifest for installability
- `service-worker.js` - Caching and offline support
- `offline.html` - Offline fallback page
- `install-prompt.js` - "Add to Home Screen" install banner

### Installing on Mobile

1. Open the deployed app in your mobile browser
2. A custom install banner will appear after 2 seconds
3. Tap "Install" to add the app to your home screen
4. On iOS: Tap the share button and select "Add to Home Screen" (iOS shows instructions)

### Testing PWA Locally

PWA features require HTTPS to work. For local testing:

```bash
# Option 1: Use a local HTTPS server
npx local-web-server --https

# Option 2: Use Chrome's DevTools
# Open DevTools > Application > Service Workers
# Check "Bypass for network" to test offline mode
```

## License

MIT
