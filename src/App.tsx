import {useRef, useState} from 'react'
import './App.css'
// @ts-expect-error -- the types are exported wrong
import {VncScreen, VncScreenHandle, RFB} from "react-vnc";
import ISpinner from "./ispinner.tsx";

type WSProtocol = "text" | "binary";

function App() {
  const ref = useRef<VncScreenHandle>(null);
  const params = new URLSearchParams(window.location.search);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string>('');

  // building the defaults
  const hostname = params.get('hostname') ?? window.location.hostname;
  const port = params.get('port') ?? window.location.port;
  const path = params.get('path') ?? "websockify";
  // https://github.com/novnc/noVNC/blob/7fcf9dcfe0cc5b14e3841a4429dc091a6ffca861/vnc_lite.html#L143
  let defaultUrl;
  if (window.location.protocol === "https:") {
    defaultUrl = 'wss';
  } else {
    defaultUrl = 'ws';
  }
  defaultUrl += '://' + hostname;
  if (port) {
    defaultUrl += ':' + port;
  }
  defaultUrl += '/' + path;

  // essentials
  const url = params.get('url') ?? defaultUrl;
  const username = params.get('username');
  const password = params.get('password');
  let urlProtocol = params.get('protocol') ?? "binary";

  if (urlProtocol !== "text" && urlProtocol !== "binary") {
    console.log("Invalid protocol", urlProtocol); // can't escape here because it would break rule of hooks
    urlProtocol = "binary";
  }

  const [protocol, setProtocol] = useState<WSProtocol>(urlProtocol as WSProtocol);

  // other configs
  const qualityLevel = params.get('qualityLevel') ?? undefined;
  const compressionLevel = params.get('compressionLevel') ?? undefined;
  const retryDuration = params.get('retryDuration') ?? undefined;
  const viewOnly = params.get('viewOnly') ?? undefined;

  function fail(reason: string) {
    setIsFailed(true);
    setFailureReason(reason)
  }

  function Fail({reason}: Readonly<{reason: string}>) {
    return (
      <div>
        <h1>Failed to connect</h1>
        <p>{reason}</p>
        <button onClick={() => {
          setProtocol(protocol === "text" ? "binary" : "text")
        }}>Switch protocol</button>
      </div>
    )
  }

  if (!url) {
    return (
      <Fail reason="No URL provided"/>
    )
  }

  if (isFailed) {
    return (
      <Fail reason={failureReason}/>
    )
  }

  // KasmVNC client headers: https://gist.github.com/regulad/f4cbce7d9313a483bf1a99da910a9a39
  // our client's headers: https://gist.github.com/regulad/0d89c8d2456e5b6f86887d17b3e4979e

  // to set Sec-WebSocket-Protocol: binary or Sec-WebSocket-Protocol: text should make it work

  // https://github.com/novnc/noVNC/blob/master/docs/API.md#properties
  return (
    <VncScreen
      url={url}
      qualityLevel={qualityLevel}
      compressionLevel={compressionLevel}
      retryDuration={retryDuration}
      viewOnly={viewOnly}
      debug
      scaleViewport
      clipViewport
      autoConnect
      rfbOptions={{
        wsProtocols: [protocol]
      }}
      loadingUI={<ISpinner large/>}
      background="rgba(0, 0, 0, 0)"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
      // this completely breaks the connection; i have no idea why
      // onDisconnect={(rfb?: RFB) => {
      //   console.log("Disconnected", rfb);
      //   fail('Disconnected (cannot reconnect)');
      // }}
      onCredentialsRequired={(rfb?: RFB) => {
        console.log("Password required", rfb);
        if (!password) {
          fail('Password required but not provided');
          return;
        }
        ref.current.sendCredentials(!!username ? {
          username: username,
          password: password,
        } : {
          password: password,
        });
      }}
      onSecurityFailure={(rfb?: RFB) => {
        console.log("Security failure", rfb);
        const reason: string | null = rfb?.detail?.reason;
        const status: number | null = rfb?.detail?.status;
        fail(`Security failure (status: ${status}, reason: ${reason})`);
      }}
      onDesktopName={(rfb?: RFB) => {
        const name: string | null = rfb?.detail?.name;
        console.log("Desktop name changed", rfb);
        // change the tab name
        if (name) {
          document.title = name;
        }
      }}
      onClipboard={(rfb?: RFB) => {
        const newClipboardContent: string | null = rfb?.detail?.text;
        console.log("Clipboard updated", rfb);
        // update the clipboard
        if (newClipboardContent) {
          navigator.clipboard.writeText(newClipboardContent);
        }
      }}
      ref={ref}
    />
  )
}

export default App
