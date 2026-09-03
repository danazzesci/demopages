# Signal LED Ticker

The public entry point at `/ledticker/` runs the Signal LED Ticker directly from GitHub Pages. The separate display route is available at `/ledticker/ticker/`, and the complete Vite/React application source is preserved in `source/`.

Sports data is loaded directly from ESPN-compatible browser feeds. Market quotes and CNBC headlines use browser-accessible feed adapters, with built-in fallback text if a provider is temporarily unavailable.
