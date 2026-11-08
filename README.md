# Festivalofpraise

## Render deployment

Deploy as a **Node Web Service** with these settings:

- Build command: `npm ci && npm run build`
- Start command: `npm start` (the existing `yarn start` also works)

Render automatically sets `RENDER=true`, which selects Nitro's Node server
preset. The server uses Render's `PORT` environment variable. Set `HOST=0.0.0.0`
in the service environment so Render can reach the server, and configure the
application's environment variables there before deploying.

To check the same production build locally:

```sh
RENDER=true npm run build
HOST=0.0.0.0 PORT=10000 npm start
```

