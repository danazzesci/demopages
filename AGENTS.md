# Website publishing instructions

## Sharing for all published content

Treat share previews as a required part of publishing or updating ALL public content on this site: articles, posts, lessons, applications, demos, resources, reference material, speaking pages, and any future content type. Do not wait for a separate request. Apply these requirements to existing content whenever it is republished or materially updated.

- Give each item a stable public path, such as /wed-not-wet/. Use that path in share buttons, copied links, announcements, and documentation.
- A homepage hash link such as /#wed-not-wet cannot have a separate server-delivered preview. Keep hash routes for navigation, but distribute the item's public path.
- The public path must deliver item-specific title, description, canonical URL, Open Graph tags, and Twitter card tags in the initial HTML. Do not rely on JavaScript to replace preview metadata.
- Provide a publicly accessible image representing the specific content: an application screenshot, article cover, relevant illustration, or deliberately designed title card, preferably 1200 by 630 or a similar landscape aspect ratio. Include absolute HTTPS image URLs, image dimensions, type, and alt text. Do not use the general presenter banner for an item's preview.
- Preserve the intended visitor experience for each content item. Content designed for the homepage's curved palette must open there with the surrounding homepage layout; standalone content should retain its intended standalone layout. Do not change the layout merely to support previews.
- /wed-not-wet/index.html is the existing example: it serves the homepage shell with lesson-specific metadata, then uses history.replaceState to set the homepage hash without fetching the homepage again. The homepage loads /wed_not_wet/?embedded=1 into its palette.
- Keep the homepage shell on sharing routes synchronized when shared homepage markup changes. Prefer generating these pages from a common template if publishing is automated.
- Before declaring publication complete, check the deployed sharing path returns HTTP 200, its initial HTML contains exactly one correct og:image and the item's title, and the preview image is publicly accessible. Open that sharing path in a browser and verify the content opens in its intended layout, including the palette when applicable.
- Test the exact sharing path in LinkedIn Post Inspector. Report separately what was checked in source, in the browser, and in social or messaging apps. Do not claim a platform preview was verified without seeing it.
- Existing posts and messages may retain cached cards. Always test a new share using the public path; re-inspect that path where the platform offers a refresh tool.

## Browser notifications

Keep the root OneSignalSDKWorker.js available. Never put a OneSignal API secret in frontend code. Publishing does not automatically send a push announcement; sending an announcement requires authorization.
