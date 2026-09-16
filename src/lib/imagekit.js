import ImageKit from "@imagekit/nodejs";

let imagekit;

export function getImageKit() {
  if (!process.env.IMAGEKIT_PRIVATE_KEY) return null;
  if (!imagekit) {
    imagekit = new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });
  }
  return imagekit;
}
