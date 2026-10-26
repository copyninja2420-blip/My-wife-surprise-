export function gatewayUrl(location: Pick<Location, "href">): string {
  return location.href;
}

export async function saveGatewayCard(qr: Blob, title: string, message: string) {
  await document.fonts.ready;
  const styles = getComputedStyle(document.documentElement);
  const parchment = styles.getPropertyValue("--qr-parchment").trim();
  const wine = styles.getPropertyValue("--qr-ink").trim();
  const gold = styles.getPropertyValue("--gold-soft").trim();
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export is unavailable.");
  const image = await createImageBitmap(qr);
  ctx.fillStyle = parchment;
  ctx.fillRect(0, 0, 1200, 1500);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(45, 45, 1110, 1410);
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 60, 1080, 1380);
  ctx.fillStyle = wine;
  ctx.textAlign = "center";
  ctx.font = '72px "Great Vibes", cursive';
  ctx.fillText(title, 600, 205, 1020);
  ctx.font = '24px "Jost", sans-serif';
  ctx.fillText("OUR SECRET GATEWAY", 600, 275);
  ctx.strokeStyle = gold;
  ctx.strokeRect(155, 330, 890, 890);
  ctx.drawImage(image, 180, 355, 840, 840);
  image.close();
  ctx.font = 'italic 36px "Cormorant Garamond", serif';
  ctx.fillText(message, 600, 1320, 1020);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Image export failed."))),
      "image/png",
    );
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "our-secret-gateway.png";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
