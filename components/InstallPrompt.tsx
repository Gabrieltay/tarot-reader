"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const DISMISS_KEY = "tarot-reader:install-prompt-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function subscribeNoop() {
  return () => {};
}

function getIsIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function getIsStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getIsDismissed() {
  return localStorage.getItem(DISMISS_KEY) === "1";
}

export default function InstallPrompt() {
  // These read browser-only APIs; getServerSnapshot keeps the banner hidden
  // during SSR/hydration and useSyncExternalStore corrects it right after.
  const isIos = useSyncExternalStore(subscribeNoop, getIsIos, () => false);
  const isStandalone = useSyncExternalStore(subscribeNoop, getIsStandalone, () => true);
  const persistedDismissed = useSyncExternalStore(subscribeNoop, getIsDismissed, () => true);
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone || isIos) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isStandalone, isIos]);

  const dismissed = persistedDismissed || sessionDismissed;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setSessionDismissed(true);
    setDeferredPrompt(null);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(DISMISS_KEY, "1");
      setSessionDismissed(true);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || dismissed) return null;
  if (!isIos && !deferredPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 animate-fade-in-up sm:flex sm:justify-center">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-gold/30 bg-midnight-deep/95 px-4 py-3.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="flex-1 font-sans">
          <p className="text-sm font-medium text-warm-white">
            Install Tarot Reader
          </p>
          {isIos ? (
            <p className="mt-0.5 text-xs leading-relaxed text-lavender-gray/80">
              Tap the Share icon{" "}
              <span role="img" aria-label="share icon">⎋</span> then{" "}
              &ldquo;Add to Home Screen&rdquo;{" "}
              <span role="img" aria-label="plus icon">➕</span>
            </p>
          ) : (
            <p className="mt-0.5 text-xs leading-relaxed text-lavender-gray/80">
              Add it to your home screen for quick, app-like access.
            </p>
          )}
        </div>

        {!isIos && (
          <button
            type="button"
            onClick={handleInstall}
            className="shrink-0 rounded-full bg-gradient-to-b from-gold-soft to-gold px-4 py-2 font-display text-sm tracking-wide text-ink transition-all hover:shadow-[0_6px_18px_-6px_rgba(166,124,61,0.55)] cursor-pointer"
          >
            Install
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full border border-lavender-gray/25 p-1.5 text-lavender-gray/70 transition-colors hover:bg-white/5 hover:text-lavender-gray cursor-pointer"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
