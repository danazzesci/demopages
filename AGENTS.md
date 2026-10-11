# Website publishing instructions

## Lesson and application sharing

Treat share previews as part of publishing every new lesson or application. Do not wait for a separate request.

- Give each item a stable public path, such as /wed-not-wet/. Use that path in share buttons, copied links, announcements, and documentation.
- A homepage hash link such as /#wed-not-wet cannot have a separate server-delivered preview. Keep hash routes for navigation, but distribute the item's public path.
- The public path must deliver item-specific title, description, canonical URL, Open Graph tags, and Twitter card tags in the initial HTML. Do not rely on JavaScript to replace preview metadata.
- Provide a publicly accessible image of the actual item, preferably 1200 by 630 or a similar landscape aspect ratio. Include absolute HTTPS image URLs, image dimensions, type, and alt text. Do not use the general presenter banner for an item's preview.
- Preserve the intended visitor experience: lessons open inside the homepage's curved palette, with the surrounding homepage layout. Do not replace the sharing route with a full-screen standalone lesson unless the user requests that.
- /wed-not-wet/index.html is the existing example: it serves the homepage shell with lesson-specific metadata, then uses history.replaceState to set the homepage hash without fetching the homepage again. The homepage loads /wed_not_wet/?embedded=1 into its palette.
- Keep the homepage shell on sharing routes synchronized when shared homepage markup changes. Prefer generating these pages from a common template if publishing is automated.
- Before declaring publication complete, check the deployed sharing path returns HTTP 200, its initial HTML contains exactly one correct og:image and the item's title, and the preview image is publicly accessible. Open that sharing path in a browser and verify the lesson appears inside the palette.
- Test the exact sharing path in LinkedIn Post Inspector. Report separately what was checked in source, in the browser, and in social or messaging apps. Do not claim a platform preview was verified without seeing it.
- Existing posts and messages may retain cached cards. Always test a new share using the public path; re-inspect that path where the platform offers a refresh tool.

## Browser notifications

Keep the root OneSignalSDKWorker.js available. Never put a OneSignal API secret in frontend code. Publishing does not automatically send a push announcement; sending an announcement requires authorization.
