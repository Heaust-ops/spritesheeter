import { SpriteData } from "../../core";

export const getTSCode = (spriteData: SpriteData) => {
  let code = "";
  code += "const spriteCoords = {\n";
  for (const k in spriteData) {
    const { startX, startY, width, height } = spriteData[k];
    code += `    "${k}": {
          position: [${startX}, ${startY}],
          dimensions: [${width}, ${height}]
      },`;
  }
  code += "\n}";

  code += `
const getAssetCache = () => {
    const AssetCache = {} as Record<string, OffscreenCanvas>;

    const res = await fetch("path/to/sprite/sheet");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const imageElement = new Image();
    imageElement.onload = () => {
        for (const name in spriteCoords) {
            const [x, y] = spriteCoords[name];
            const [w, h] = spriteCoords[name];
            const cnv = new OffscreenCanvas(w, h);
            const ctx = cnv.getContext("2d")!;
            ctx.drawImage(imageElement, x, y, w, h, 0, 0, w, h);
            AssetCache[name] = cnv;
        }
        imageElement.remove();
        URL.revokeObjectURL(url);
    };
    imageElement.src = url;

    return AssetCache;
}

const customDrawImage = (
    imageElement: HTMLImageElement,
    ctx: CanvasRenderingContext2D,
    name: string,
    dx: number,
    dy: number,
    dw: number | undefined,
    dh: number | undefined
) => {
    const [x, y] = spriteCoords[name];
    const [w, h] = spriteCoords[name];
    if (typeof dw !== "number") dw = w;
    if (typeof dh !== "number") dh = h;
    ctx.drawImage(imageElement, x, y, w, h, dx, dy, dw, dh);
};
    `;

  return code;
};
