# AI Changes the Work

Seven editable HTML boards at /lance/. The existing 1440 × 810 composition, master photographic background, original compass, cream palette, frame opening and footer remain intact. Only the foreground narrative changes. Navigation derives its count from the boards and supports Previous/Next, dots, arrow keys, Page Up/Down, Home/End and direct #1–#7 links.

The presentation scales to the available viewport without page scrolling. Desktop/landscape is the primary reading format. Wipes and articles remain future work.

Edit board copy in index.html and layout in style.css. app.js controls navigation only. No build dependencies or remote services are required. No commits or publication performed.

## Career evidence used on Board 7

Reviewed read-only originals in:
`/Users/Dan/Library/CloudStorage/OneDrive-PerformanceCyberSecurityandConsultingLLC/01-Workspace/01-Dan - Company/01-Azzesci/90-Packet/lance/`

- `daniel_schaupner_bio.docx`, Consulting Impact / Margin & Accountability: 25-person consulting practice, workforce realignment, talent elevation and accountability.
- `lance-examples.docx`, vulnerability-management case: separation of scan operation, analysis and business approval; reporting linked to asset owners and leadership decisions.
- `1-Dan-Schaupner_Executive-Candidate_Power-Narrative.docx`, Outcomes and Results: 2,500-endpoint MFA rollout and return of senior staff to mission functions.
- `3-Dan-Schaupner_Executive-Resume_2025.docx`: cross-check of consulting leadership, process redesign, and MFA deployment.

The local project's synced sources folder was empty. The above career originals were found alongside the supplied storyboard. The optional Marines/Unix and global cloud-capability examples were not used because they were not verified in these reviewed documents. Boards 1–6 express the user's supplied positioning and proposed method, not additional research claims.

## Revised transformation snapshots
Board 7 now follows the user’s supplied career account from the subsequent revision request, including software/mission operating work, global cloud capability, and the Marines/Unix anecdote. These are user-provided career statements; the Marine and cloud details were not independently verified in the earlier four documents. AI is framed as the current method, not a claimed completed client outcome.

## Market strip
The stationary strip above the storyboard cycles through all 28 requested tickers. Quotes load from TradingView's official tv-single-ticker web component, in USD; feed delays and availability depend on the symbol and provider. Network access is required. No made-up or cached fallback prices are displayed.

Rotation changes groups every 15 seconds, pauses on hover/focus or hidden pages, and offers Previous/Pause/Next controls. Reduced-motion preferences start rotation paused. Phone layouts show one symbol at a time.

Source: https://www.tradingview.com/widget-docs/widgets/tickers/single-ticker/
Styling: https://www.tradingview.com/widget-docs/tutorials/web-components/styling-and-themes/

The earlier statement that no remote services are loaded predates the market strip. The quote widget now loads external TradingView resources.

## News strip and article canvas
Run locally with `python3 /Users/Dan/coding/demopages/lance/server.py --port 8766`. The server binds to localhost and serves the website plus `/api/news`. A plain static server cannot provide the news feed.

Ten relevant recent headlines are selected from BBC and Guardian public RSS feeds, filtered for the requested companies, infrastructure, and related politics. Cross-publisher readership rankings are unavailable, so these are not labeled most-read. Feeds refresh every ten minutes; failed refreshes preserve cached stories.

The bottom strip scrolls slowly with pause, hover/focus pause, and reduced-motion support. Clicking a headline opens a short publisher excerpt, topical subtitle, source, GMT publication timestamp, and supplied author in the canvas. Missing authors are explicitly indicated. Read more opens the publisher. Home returns to board 1; article Previous/Next wrap. Mobile defaults and the original storyboard navigation are retained.
