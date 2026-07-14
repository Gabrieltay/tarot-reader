"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "tarot-reader:chunk-reload-attempted";
const CLEAR_DELAY_MS = 5000;

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    /loading chunk .*failed|failed to load chunk/i.test(error.message)
  );
}

function reloadOnce() {
  // Guards against an infinite reload loop if the error isn't actually
  // caused by a stale deploy (e.g. the server itself is down).
  if (sessionStorage.getItem(RELOAD_FLAG) === "1") return;
  sessionStorage.setItem(RELOAD_FLAG, "1");
  window.location.reload();
}

export default function ChunkErrorReload() {
  useEffect(() => {
    const clearFlag = setTimeout(() => {
      sessionStorage.removeItem(RELOAD_FLAG);
    }, CLEAR_DELAY_MS);

    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error)) reloadOnce();
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) reloadOnce();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      clearTimeout(clearFlag);
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
