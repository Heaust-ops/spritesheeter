export interface ImageDataElement {
  img: File;
  width: number;
  height: number;
}

export interface SpriteDataElement {
  img: File;
  width: number;
  height: number;
  startX: number;
  startY: number;
}

export type ImageData = Record<string, ImageDataElement>;
export type SpriteData = Record<string, SpriteDataElement>;
type CondensedImageElement = {
  img: File;
  width: number;
  height: number;
  name: string;
};
type CondensedSpriteElement = {
  img: File;
  width: number;
  height: number;
  name: string;
  startX: number;
  startY: number;
};

const getMaxDims = (spriteData: SpriteData) => {
  let maxWidth = 0,
    maxHeight = 0;

  // Calculate Canvas borders
  for (const k in spriteData) {
    if (spriteData[k].startX + spriteData[k].width > maxWidth)
      maxWidth = spriteData[k].startX + spriteData[k].width;

    if (spriteData[k].startY + spriteData[k].height > maxHeight)
      maxHeight = spriteData[k].startY + spriteData[k].height;
  }
  return [maxWidth, maxHeight];
};

export function getPackedSprites(imageData: ImageData) {
  const spriteData = {} as SpriteData;
  const spriteArr = [] as CondensedSpriteElement[];

  const isOverlap = (img: CondensedImageElement, xy: [number, number]) => {
    for (const el of spriteArr) {
      const { name, ...value } = el;
      spriteData[name] = value;
    }

    const [x, y] = xy;
    for (const k in spriteData) {
      const el = spriteData[k];
      if (
        x < el.startX + el.width &&
        x + img.width > el.startX &&
        y < el.startY + el.height &&
        y + img.height > el.startY
      )
        return true;
    }

    return false;
  };

  const getCoords = (
    img: CondensedImageElement,
    spriteArr: CondensedSpriteElement[]
  ) => {
    if (!spriteArr.length) return [0, 0];

    for (const el of spriteArr) {
      const { name, ...value } = el;
      spriteData[name] = value;
    }

    const [maxWidth, maxHeight] = getMaxDims(spriteData);

    for (const el of spriteArr) {
      const { startX, width, startY, height } = el;

      if (maxWidth < maxHeight) {
        if (!isOverlap(img, [startX + width, startY]))
          return [startX + width + 1, startY + 1];
        if (!isOverlap(img, [startX, startY + height]))
          return [startX + 1, startY + height + 1];
      } else {
        if (!isOverlap(img, [startX, startY + height]))
          return [startX + 1, startY + height + 1];
        if (!isOverlap(img, [startX + width, startY]))
          return [startX + width + 1, startY + 1];
      }
      if (!isOverlap(img, [startX + width, startY + height]))
        return [startX + width + 1, startY + height + 1];
    }

    throw new Error("No free space found");
  };

  const arr = [] as CondensedImageElement[];
  for (const name in imageData) {
    arr.push({ name, ...imageData[name] });
  }

  arr.sort((a, b) => b.width * b.height - a.width - a.height);

  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];
    const [startX, startY] = getCoords(el, spriteArr);
    spriteArr.push({ ...el, startX, startY });
  }

  for (const el of spriteArr) {
    const { name, ...value } = el;
    spriteData[name] = value;
  }

  return spriteData;
}

export const drawSpriteData = (
  canvas: HTMLCanvasElement,
  spriteData: SpriteData
) => {
  const [maxWidth, maxHeight] = getMaxDims(spriteData);
  // resize canvas pixels
  canvas.width = maxWidth;
  canvas.height = maxHeight;

  // draw all sprites
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas Refused to Give Context.");
  ctx.clearRect(0, 0, maxWidth, maxHeight);

  /** Draw checkerboard */
  const size = 50; // size of each square
  const rows = canvas.height / size; // number of rows
  const cols = canvas.width / size; // number of columns

  // Loop through rows and columns
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Alternate between white and black squares
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = "#555";
      } else {
        ctx.fillStyle = "#222";
      }
      ctx.fillRect(col * size, row * size, size, size);
    }
  }

  for (const k in spriteData) {
    const { img, startX, startY, width, height } = spriteData[k];
    const url = URL.createObjectURL(img);

    const imageElement = new Image();
    imageElement.onload = () => {
      ctx.drawImage(imageElement, startX, startY, width, height);
      imageElement.remove();
      URL.revokeObjectURL(url);
    };
    imageElement.src = url;
  }
};

export const downloadSpriteData = async (
  spriteData: SpriteData,
  format: string
) => {
  const [maxWidth, maxHeight] = getMaxDims(spriteData);
  const canvas = new OffscreenCanvas(maxWidth, maxHeight);

  // draw all sprites
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas Refused to Give Context.");
  ctx.clearRect(0, 0, maxWidth, maxHeight);

  for (const k in spriteData) {
    const { img, startX, startY, width, height } = spriteData[k];
    const url = URL.createObjectURL(img);

    await new Promise<void>((r, _) => {
      const imageElement = new Image();
      imageElement.onload = () => {
        ctx.drawImage(imageElement, startX, startY, width, height);
        imageElement.remove();
        URL.revokeObjectURL(url);
        r();
      };
      imageElement.src = url;
    });
  }

  canvas
    .convertToBlob({ type: `image/${format}` })
    .then((blob) => {
      // Create a link element to download the image
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `spritesheetgen.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      link.remove();

      // Clean up the Blob object
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Error converting OffscreenCanvas to Blob:", error);
    });
};

export const downloadJSON = (jsonString: string, fileName: string) => {
  // Create a Blob from the string
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a link element to download the file
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the Blob
  URL.revokeObjectURL(url);
};
