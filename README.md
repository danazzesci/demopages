# demopages

## Browser notifications and link previews

The primary pages include Open Graph and Twitter card metadata using the existing presenter photograph. Hash routes share their containing page’s preview. Messaging and social services may cache previews or choose their own rendering.

OneSignal Web SDK v16 is installed on the homepage, /lance/, /about/, /who-is-dan/, /speaking-topics/, /shared-articles/, and /reference-materials/. App ID: `a058ed41-75da-4806-9e43-73f90883f9a8`. Permission prompt timing and welcome messages are configured in OneSignal’s Typical Site dashboard. The root `OneSignalSDKWorker.js` must remain available for subscribed browsers. No API secret belongs in this repository.

After deploying, verify https://danschaupner.com/OneSignalSDKWorker.js, subscribe from a normal browser window, and send a test push to your own subscription in OneSignal. Production subscriptions cannot be validated on a local server against this production-domain app configuration. The web manifest supports adding the site to the Home Screen; iPhone/iPad visitors must open it from there to subscribe.

Publishing the site does not automatically send a notification. Compose and send announcements in OneSignal; automatic posting triggers require a separate integration once the content and publishing workflow are defined.
