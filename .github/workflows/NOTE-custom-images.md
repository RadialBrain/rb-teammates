# Custom GHCR images (next)

Day-1 Contabo runs upstream `ghcr.io/elie222/rakazo/{app,computer}` with `RAKAZO_THEME`.

To ship Teammates-branded HTML (titles/PWA from this fork), add a workflow that builds and pushes:

- `ghcr.io/radialbrain/rb-teammates/app`
- `ghcr.io/radialbrain/rb-teammates/computer`

Then set on the VPS:

```env
RAKAZO_IMAGE=ghcr.io/radialbrain/rb-teammates/app
RAKAZO_COMPUTER_IMAGE=ghcr.io/radialbrain/rb-teammates/computer
```

Reuse upstream Dockerfiles under `infra/`.
