import { SpriteData } from "../core";
import { getJSCode } from "./langs/javascript";
import { getTSCode } from "./langs/typescript";

export const getCode = (spriteData: SpriteData, lang: string) => {
  if (lang === "Javascript") return getJSCode(spriteData);
  if (lang === "TypeScript") return getTSCode(spriteData);
  return `What language is ${lang}?`;
};
