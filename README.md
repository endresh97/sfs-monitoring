# SFS Monitoring

SFS Monitoring is an Angular dashboard for monitoring production devices. It displays live device status and production metrics, including order progress, parts per minute, and parts produced over time.

## Features

- Select a device and view its live status and current order.
- Track production progress against an order target.
- View production-rate and parts-produced history in charts.
- Switch between English and German; the selected language is remembered in the browser.
- See connection and data-loading errors in the dashboard.

## Technology

- Angular 16 and Angular Material
- TypeScript and SCSS
- RxJS
- D3.js
- `@ngx-translate` for localization

## Getting started

Install [Node.js](https://nodejs.org/) and npm, then install dependencies and start the development server:

```bash
npm install
npm start
```

Open <http://localhost:4200/>. The development server reloads when source files change.

At startup, the app loads its configuration and data from the assessment API defined in `src/app/constants/api.constants.ts`. The API must be reachable for the dashboard to initialize and display device data.

## Commands

```bash
npm start   # Start the development server
npm run build   # Build the production application into dist/sfs-monitoring/
npm test    # Run unit tests with Karma
```
