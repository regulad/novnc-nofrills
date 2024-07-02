import {useRef, useState} from 'react';
import './App.css';
import {VncScreen as KasmVNCScreen, VncScreenHandle as KasmVNCScreenHandle} from "react-kasmvnc";
import type {
  KasmVNCRFBOptions as KasmVNCExtraRFBOptions,
  Props as KasmVNCScreenProps,
// @ts-expect-error -- the types are exported wrong
} from "react-kasmvnc/dist/types/lib/VncScreen";
import ISpinner from "./ispinner.tsx";
// @ts-expect-error -- the types are exported wrong
import {RFB as KasmVNCRFB} from "react-kasmvnc/dist/types/noVNC/core/rfb";

function buildDefaultUrl(hostname: string, port: string, path: string): string {
  let defaultUrl = window.location.protocol === "https:" ? 'wss' : 'ws';
  defaultUrl += '://' + hostname;
  if (port) {
    defaultUrl += ':' + port;
  }
  defaultUrl += '/' + path;
  return defaultUrl;
}

function Fail({reason}: Readonly<{ reason: string }>) {
  return (
    <div>
      <h1>Failed to connect</h1>
      <p>{reason}</p>
    </div>
  );
}

function App() {
  const params = new URLSearchParams(window.location.search);

  const ref = useRef<KasmVNCScreenHandle>(null);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string>('');

  const hostname = params.get('hostname') ?? window.location.hostname;
  const port = params.get('port') ?? window.location.port;
  const path = params.get('path') ?? "websockify";
  const defaultUrl = buildDefaultUrl(hostname, port, path);

  const url = params.get('url') ?? defaultUrl;

  // other configs
  const viewOnly = params.get('viewOnly') ?? undefined;
  const focusOnClick = params.get('focusOnClick') ?? undefined;
  const retryDuration = params.get('retryDuration') ?? undefined;
  const resizeSession = params.get('resizeSession') ?? undefined;
  const showDotCursor = params.get('showDotCursor') ?? undefined;
  const background = params.get('background') ?? undefined;
  const qualityLevel = params.get('qualityLevel') ?? undefined;
  const compressionLevel = params.get('compressionLevel') ?? undefined;
  const extraProps: Partial<KasmVNCScreenProps> = {
    viewOnly: viewOnly === 'true',
    focusOnClick: focusOnClick === 'true',
    retryDuration: retryDuration ? parseInt(retryDuration) : undefined,
    resizeSession: resizeSession === 'true',
    showDotCursor: showDotCursor === 'true',
    background: background,
    qualityLevel: qualityLevel ? parseInt(qualityLevel) : undefined,
    compressionLevel: compressionLevel ? parseInt(compressionLevel) : undefined,
  }

  // kasm configs
  const dynamicQualityMin = params.get('dynamicQualityMin') ?? undefined;
  const dynamicQualityMax = params.get('dynamicQualityMax') ?? undefined;
  const jpegVideoQuality = params.get('jpegVideoQuality') ?? undefined;
  const webpVideoQuality = params.get('webpVideoQuality') ?? undefined;
  const maxVideoResolutionX = params.get('maxVideoResolutionX') ?? undefined;
  const maxVideoResolutionY = params.get('maxVideoResolutionY') ?? undefined;
  const frameRate = params.get('frameRate') ?? undefined;
  const idleDisconnect = params.get('idleDisconnect') ?? undefined;
  const pointerRelative = params.get('pointerRelative') ?? undefined;
  const videoQuality = params.get('videoQuality') ?? undefined;
  const antiAliasing = params.get('antiAliasing') ?? undefined;

  const kasmExtraProps: Partial<KasmVNCExtraRFBOptions> = {
    dynamicQualityMin: dynamicQualityMin ? parseInt(dynamicQualityMin) : undefined,
    dynamicQualityMax: dynamicQualityMax ? parseInt(dynamicQualityMax) : undefined,
    jpegVideoQuality: jpegVideoQuality ? parseInt(jpegVideoQuality) : undefined,
    webpVideoQuality: webpVideoQuality ? parseInt(webpVideoQuality) : undefined,
    maxVideoResolutionX: maxVideoResolutionX ? parseInt(maxVideoResolutionX) : undefined,
    maxVideoResolutionY: maxVideoResolutionY ? parseInt(maxVideoResolutionY) : undefined,
    frameRate: frameRate ? parseInt(frameRate) : undefined,
    idleDisconnect: idleDisconnect === 'true',
    pointerRelative: pointerRelative === 'true',
    videoQuality: videoQuality ? parseInt(videoQuality) : undefined,
    antiAliasing: antiAliasing ? parseInt(antiAliasing) : undefined,
  };

  function fail(reason: string) {
    setIsFailed(true);
    setFailureReason(reason);
  }

  if (!url) {
    return <Fail reason="No URL provided"/>;
  }

  if (isFailed) {
    return <Fail reason={failureReason}/>;
  }

  return (
    <KasmVNCScreen
      ref={ref}
      url={url}
      scaleViewport
      clipViewport
      dragViewport={false}
      {...extraProps}
      kasmOptions={{
        clipboardSeamless: true,
        enableWebRTC: true, // doesn't hurt; just allow it (will probably fail)
        ...kasmExtraProps
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
      onSecurityFailure={(rfb?: KasmVNCRFB) => {
        console.log("Security failure", rfb);
        const reason: string | null = rfb?.detail?.reason;
        const status: number | null = rfb?.detail?.status;
        fail(`Security failure (status: ${status}, reason: ${reason})`);
      }}
      onDesktopName={(rfb?: KasmVNCRFB) => {
        const name: string | null = rfb?.detail?.name;
        console.log("Desktop name changed", rfb);
        // change the tab name
        if (name) {
          document.title = name;
        }
      }}
    />
  );
}

export default App;
