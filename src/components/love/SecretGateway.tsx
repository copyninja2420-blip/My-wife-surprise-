import { useEffect, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";
import { Check, Copy, Download, Heart, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gatewayUrl, saveGatewayCard } from "@/lib/secretGateway";

const title = "A Key to My Heart";
const keepsakeMessage = "Every path leads me back to you.";

export function SecretGateway() {
  const host = useRef<HTMLDivElement>(null);
  const qr = useRef<QRCodeStyling | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const { default: QR } = await import("qr-code-styling");
        if (cancelled || !host.current) return;
        const styles = getComputedStyle(document.documentElement);
        const wine = styles.getPropertyValue("--qr-ink").trim();
        const cream = styles.getPropertyValue("--qr-parchment").trim();
        const rose = styles.getPropertyValue("--qr-heart").trim();
        const heart = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="${cream}"/><path d="M50 79C-6 43 22 8 50 32C78 8 106 43 50 79Z" fill="${rose}"/></svg>`;
        const code = new QR({
          width: 1024,
          height: 1024,
          type: "canvas",
          margin: 70,
          data: gatewayUrl(window.location),
          qrOptions: { errorCorrectionLevel: "H" },
          dotsOptions: { type: "rounded", color: wine },
          cornersSquareOptions: { type: "extra-rounded", color: wine },
          cornersDotOptions: { type: "dot", color: wine },
          backgroundOptions: { color: cream },
          image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(heart)}`,
          imageOptions: { imageSize: 0.22, margin: 6, hideBackgroundDots: true },
        });
        await code.getRawData("png");
        if (cancelled || !host.current) return;
        host.current.replaceChildren();
        code.append(host.current);
        qr.current = code;
        setReady(true);
      } catch {
        if (!cancelled) setNotice("The key couldn’t load. Please refresh and try again.");
      }
    }
    void render();
    return () => {
      cancelled = true;
      qr.current = null;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => {
      setNotice("");
      setCopied(false);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function download() {
    if (!qr.current || saving) return;
    setSaving(true);
    try {
      qr.current.update({ data: gatewayUrl(window.location) });
      const blob = await qr.current.getRawData("png");
      if (!(blob instanceof Blob)) throw new Error("No image");
      await saveGatewayCard(blob, title, keepsakeMessage);
      setNotice("Your little keepsake is ready ❤️");
    } catch {
      setNotice("Couldn’t save the card. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(gatewayUrl(window.location));
      setCopied(true);
      setNotice("Secret link copied to heart ❤️");
    } catch {
      setNotice("Copy isn’t available here. You can copy the address from your browser.");
    }
  }

  return (
    <section aria-labelledby="gateway-title" className="px-5 py-16 sm:py-24">
      <div className="secret-gateway relative mx-auto max-w-lg rounded-3xl px-5 pt-20 pb-10 text-center sm:px-10 sm:pt-10">
        <div className="gateway-sparkles" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="relative">
          <p className="mb-4 flex items-center justify-center gap-3 text-xs text-gold-soft">
            <span className="h-px w-10 bg-gold-soft/30" />
            <Heart className="size-4" />
            <span className="h-px w-10 bg-gold-soft/30" />
          </p>
          <h2
            id="gateway-title"
            className="romantic text-4xl leading-tight text-gold-soft sm:text-5xl"
          >
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xs font-serif text-lg leading-relaxed text-rose-soft/85">
            Save or share this code to unlock our special world anytime.
          </p>
          <div className="gateway-frame relative mx-auto my-9 w-full max-w-[290px] rounded-lg p-5">
            <span className="gateway-flourish top-1 left-2" aria-hidden="true">
              ❦
            </span>
            <span className="gateway-flourish right-2 bottom-1 rotate-180" aria-hidden="true">
              ❦
            </span>
            <div
              ref={host}
              role="img"
              aria-label="Heart-centered QR code linking to our love story"
              className="gateway-code aspect-square w-full"
            />
            {!ready && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-qr-ink">
                <LoaderCircle className="size-6 animate-spin" aria-label="Preparing QR code" />
              </div>
            )}
          </div>
          <p className="mb-6 font-serif text-lg italic text-gold-soft/80">{keepsakeMessage}</p>
          <div className="mx-auto flex w-full max-w-xs flex-col items-stretch gap-3 [&_svg]:shrink-0">
            <Button
              className="btn-love h-auto min-h-12 w-full justify-center gap-2 px-6 py-3 tracking-normal"
              disabled={!ready || saving}
              onClick={download}
            >
              {saving ? <LoaderCircle className="animate-spin" /> : <Download />}
              {saving ? "Saving…" : "Download QR Card"}
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-12 w-full justify-center gap-2 rounded-full border-gold-soft/30 bg-transparent px-6 py-3 text-gold-soft hover:bg-gold-soft/10 hover:text-gold-soft"
              onClick={copy}
            >
              {copied ? <Check /> : <Copy />}Copy Link
            </Button>
          </div>
          <div role="status" aria-live="polite" className="mt-4 min-h-10 text-sm text-rose-soft">
            {notice}
          </div>
        </div>
      </div>
    </section>
  );
}
