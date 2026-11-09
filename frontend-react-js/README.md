# Cruddur frontend

React 18 frontend for the AWS Cloud Project Bootcamp exercise. Vite 8 replaces the old Create React App toolchain; React Router 7 handles the existing routes.

## Getting started

Use Node.js 26 LTS:

```sh
npm ci
npm start
```

Open http://localhost:3000. `npm run dev` is an alias for the same server.

Copy `.env.example` to `.env.local` and set `REACT_APP_BACKEND_URL` to the Flask API's local base URL. This variable is public build-time configuration, not a place for secrets. The legacy variable name is retained. When it is empty, requests use same-origin `/api/...` paths; configure the API or a local reverse proxy before expecting real data. Vite does not start or proxy Flask automatically.

```sh
npm test          # four component and route checks using synthetic fixtures
npm run build     # production assets in build/
npm run preview   # local preview of the production output
```

The HTML entry is root-level `index.html`; JSX-bearing modules use `.jsx`. Inline SVG component imports keep their original named `ReactComponent` form through the SVG plugin. A future static host must serve `index.html` for application URLs. No deployment or hosting setup is performed by this refresh.

## Verification and limits

On Node 26.13.0, the original frozen npm install and CRA production build passed. Its only test still expected the removed "learn react" scaffold and failed. It was replaced with four focused checks for fetched activity/SVG navigation, posting, demo sign-in rejection and the `@handle` profile/message routes. The refreshed frozen npm install, tests and production build pass.

Chromium checks passed on the original and refreshed production builds with every API request intercepted locally: home feed, inline SVGs, sign-in rejection, signup/confirmation/recovery navigation, a synthetic cookie-demo session, posting, messages and direct `@handle` URLs. Router 7 requires whole-segment parameters, so those routes now validate the leading `@` and pass the same handle to the existing API URL logic. These checks do not verify the Flask backend, AWS services, real users, live authentication or deployment.

The refreshed lockfile reports zero npm audit findings, down from 68 affected-package findings (including three critical) before the refresh. This is a dependency scan, not a full security review. Modern-browser defaults differ from CRA's old browserslist settings; older browsers have not been verified.

## Demo authentication warning

The course starter's frontend-only authentication is unchanged. It stores demo credentials and confirmation values in script-readable cookies and uses them for local sign-in checks. This is not secure authentication and must not be used with real passwords or real accounts. It needs a separate server-backed authentication design before production use. Recovery, notifications and other course placeholder behavior should not be mistaken for completed services.
