# novnc-nofrills

Bare-minimum functionality to connect to a VNC server using noVNC.

To the user, it is entirely transparent. All variables must be passed by URL params. Reconnection is handled automatically, and the user sees a loading screen while the connection is being established.

Used as part of Doppelganger and test-scrcpy.

## Usage

### URL Parameters

- `host`: The hostname of the VNC server.
- `port`: The port of the VNC server.
- `path`: The path of the VNC server. Default is `/websockify`.
- `username`: The username of the VNC server. (Optional)
- `password`: The password of the VNC server.
- `qualityLevel` https://github.com/novnc/noVNC/blob/master/docs/API.md#properties:~:text=Enabled%20by%20default.-,qualityLevel,-Is%20an%20int
- `compressionLevel` https://github.com/novnc/noVNC/blob/master/docs/API.md#properties:~:text=Disabled%20by%20default.-,compressionLevel,-Is%20an%20int
- `retryDuration` ms between reconnection attempts. Default is 3000.
- `viewOnly` https://github.com/novnc/noVNC/blob/master/docs/API.md#properties:~:text=Disabled%20by%20default.-,viewOnly,-Is%20a%20boolean
- ...and more! See App.tsx

## Running

```bash
pnpm install
pnpm run dev
```

## Building

Useful for projects like https://github.com/regulad/workspaces-images/blob/189d2615d9925d91573d7f00297ebe30bb3b6669/dockerfile-kasm-scrcpy to provide a minimum viable noVNC client for extremely static apps (like scrcpy).

```bash
pnpm run build
```


## TODO

- [x] Connect to KasmVNC servers and use keyboard/mouse
- [x] Port to React for ease of reactivity
- [ ] Kasm audio support (port from KasmVDI)
