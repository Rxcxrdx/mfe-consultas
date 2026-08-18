# mfe-consultas

<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Webpack_5-8DD6F9?style=flat-square&logo=webpack&logoColor=black" alt="Webpack 5"/>
  <img src="https://img.shields.io/badge/Module_Federation-C7003F?style=flat-square" alt="Module Federation"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

Module Federation remote exposing the `ConsultaSaldo` component, consumed at
runtime by [`shell-app`](https://github.com/Rxcxrdx/shell-app).

> Part of the [**Micro-Frontends on Azure AKS**](https://github.com/Rxcxrdx/microfrontends-aks-jenkins)
> project — see that repository for the full architecture and deployment guide.

| | |
|:--|:--|
| **Remote name** | `consultas` |
| **Exposed module** | `./ConsultaSaldo` |
| **Entry point** | `remoteEntry.js` |
| **API consumed** | `GET /api/saldos/:cuentaId` from [`api-node`](https://github.com/Rxcxrdx/api-node) |

## Running standalone

```bash
npm install
API_URL=http://localhost:3001 npm start
```

Open http://localhost:3002 — `ConsultaSaldo` renders inside a minimal wrapper
against the local API, so the component can be developed without the host.

## Tests

```bash
npm test
```

## Production build

```bash
API_URL=http://api-node:3001 npm run build
```

Emits `dist/remoteEntry.js` plus the static assets the host loads through
Module Federation.

## Docker

```bash
docker build --build-arg API_URL=http://localhost:3001 -t mfe-consultas .
docker run -p 3002:80 mfe-consultas
```

nginx serves `remoteEntry.js` and the static assets on port `80`, with CORS
enabled so the host can load them from a different origin.

> **`API_URL` is resolved at build time**, not at runtime — it is inlined into
> the bundle by `webpack.DefinePlugin`. It must therefore be a URL the
> **browser** can reach, and it has to be passed as a `--build-arg`. Setting it
> as an environment variable on a Kubernetes deployment has no effect.
