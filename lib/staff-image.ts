import type { CSSProperties } from "react";
import type { Staff } from "@/types/database";

export type StaffImageCrop = {
  x: number;
  y: number;
  zoom: number;
};

const DEFAULT_CROP: StaffImageCrop = { x: 50, y: 50, zoom: 1 };

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function stripStaffImageCrop(url?: string | null) {
  return (url ?? "").split("#crop=")[0];
}

export function getStaffImageSrc(staff: Pick<Staff, "image_url">) {
  return stripStaffImageCrop(staff.image_url);
}

export function getStaffImageCrop(
  staff: Pick<Staff, "image_url" | "image_position_x" | "image_position_y" | "image_zoom"> | null | undefined,
): StaffImageCrop {
  const encoded = staff?.image_url?.split("#crop=")[1];
  if (encoded) {
    const [x, y, zoom] = encoded.split(",").map(Number);
    return {
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
      zoom: clamp(zoom, 1, 2),
    };
  }

  return {
    x: staff?.image_position_x ?? DEFAULT_CROP.x,
    y: staff?.image_position_y ?? DEFAULT_CROP.y,
    zoom: staff?.image_zoom ?? DEFAULT_CROP.zoom,
  };
}

export function decorateStaffImageUrl(url: string, crop: StaffImageCrop) {
  const src = stripStaffImageCrop(url);
  if (!src) return "";

  const x = Math.round(clamp(crop.x, 0, 100));
  const y = Math.round(clamp(crop.y, 0, 100));
  const zoom = clamp(crop.zoom, 1, 2).toFixed(2);

  if (x === DEFAULT_CROP.x && y === DEFAULT_CROP.y && Number(zoom) === DEFAULT_CROP.zoom) {
    return src;
  }

  return `${src}#crop=${x},${y},${zoom}`;
}

export function getStaffImageStyle(
  staff: Pick<Staff, "image_url" | "image_position_x" | "image_position_y" | "image_zoom">,
): CSSProperties {
  const { x, y, zoom } = getStaffImageCrop(staff);

  return {
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
  };
}
