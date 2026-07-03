import type { CSSProperties } from "react";

export type BannerImageCrop = {
  x: number;
  y: number;
  zoom: number;
};

const DEFAULT_CROP: BannerImageCrop = { x: 50, y: 50, zoom: 1 };

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function stripBannerImageCrop(url?: string | null) {
  return (url ?? "").split("#crop=")[0];
}

export function getBannerImageCrop(url?: string | null): BannerImageCrop {
  const encoded = url?.split("#crop=")[1];
  if (!encoded) return DEFAULT_CROP;

  const [x, y, zoom] = encoded.split(",").map(Number);
  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100),
    zoom: clamp(zoom, 1, 2),
  };
}

export function decorateBannerImageUrl(url: string, crop: BannerImageCrop) {
  const src = stripBannerImageCrop(url);
  if (!src) return "";

  const x = Math.round(clamp(crop.x, 0, 100));
  const y = Math.round(clamp(crop.y, 0, 100));
  const zoom = clamp(crop.zoom, 1, 2).toFixed(2);

  if (x === DEFAULT_CROP.x && y === DEFAULT_CROP.y && Number(zoom) === DEFAULT_CROP.zoom) {
    return src;
  }

  return `${src}#crop=${x},${y},${zoom}`;
}

export function getBannerImageStyle(url?: string | null): CSSProperties {
  const { x, y, zoom } = getBannerImageCrop(url);

  return {
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
  };
}
