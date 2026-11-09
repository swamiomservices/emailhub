# EmailHub — free web portal

A static, responsive web portal that loads predefined email templates and opens an editable draft in the user's configured email handler.

## What it does
- Works in desktop and mobile browsers.
- Can be installed as a PWA from a supported browser when hosted over HTTPS.
- Lets a user select a template and edit To, CC, BCC, subject, and message.
- Uses `mailto:` to hand the draft to the user's email app. The user reviews and presses **Send** in that app.
- Includes a copy-email-text fallback.

## What it does not do
- It does not send email itself.
- It does not log in to Gmail, Outlook, or any email account.
- It does not store user data or send form contents to a server.
- It does not provide a central admin screen. Templates are edited in `templates.js` and republished.
- It cannot guarantee a chooser listing every installed email app. The browser/operating system decides which app handles `mailto:` links. Users may need to configure their default email app or mail handler.

## Change the templates
Open `templates.js` in a text editor. Each item has:
- `id`: unique internal value
- `name`: template name shown in the portal
- `description`: short explanation
- `to`, `cc`, `bcc`: recipient addresses
- `subject`: subject line
- `body`: message text; use `\\n` for line breaks

Replace the example `example.com` addresses and sample wording with your real details. You can add more objects to the array. Do not put passwords or private credentials in this file.

## Free publishing options

### Option A — GitHub Pages
1. Create a free GitHub account if you do not already have one.
2. Create a public repository, for example `emailhub`.
3. Upload all files and folders from this project (keep the folder structure).
4. In the repository, open **Settings → Pages**.
5. Under build/deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
6. Wait for GitHub Pages to publish. The portal URL will be shown in the Pages settings.
7. Share that HTTPS link with users.

### Option B — Cloudflare Pages
1. Create a free Cloudflare account.
2. Create a Pages project by connecting the repository or uploading the static site files.
3. No build command is needed; use the project root as the output directory.
4. Publish and share the HTTPS URL.

Free-plan terms and limits are controlled by the hosting provider and can change. A free subdomain is included; a custom domain usually costs money.

## Install on a phone
- Android: open the HTTPS portal in Chrome, then use the browser menu → **Install app** or **Add to Home screen** (wording varies).
- iPhone/iPad: open the HTTPS portal in Safari, tap **Share**, then **Add to Home Screen**.
- Desktop: use the install icon in a supported browser if offered.

No APK installation or special device permissions are required.

## Important email-client note
`mailto:` support varies between browsers and email apps. Some clients may ignore CC/BCC or long message bodies, and some mobile devices may show an app chooser only if multiple mail handlers are configured. Test your real templates on the devices and email apps your users use. The user always sends the message manually from their email app.

## Local preview
For a quick preview, open `index.html` in a browser. PWA installation and service-worker offline caching require hosting over HTTPS (or localhost). Google Fonts are optional; if offline, the browser will use fallback fonts.
