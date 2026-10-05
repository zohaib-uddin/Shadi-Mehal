import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSizeFullName(size?: string | null): string {
  if (!size) return '';
  const s = size.toUpperCase().trim();
  switch (s) {
    case 'S': return 'Small';
    case 'M': return 'Medium';
    case 'L': return 'Large';
    case 'XL': return 'Extra Large';
    default: return size; // fallback for non-standard or custom
  }
}

export function formatVariantNameOnly(color?: string | null, size?: string | null): string {
  const isColorValid = color && color.trim() !== '' && color.toLowerCase() !== 'standard';
  const isSizeValid = size && size.trim() !== '' && size.toLowerCase() !== 'standard';

  const sizeText = isSizeValid ? getSizeFullName(size) : '';

  if (isColorValid && isSizeValid) {
    return `${color.trim()} - ${sizeText}`;
  } else if (isSizeValid) {
    return sizeText;
  } else if (isColorValid) {
    return color.trim();
  }
  return '';
}

export function formatProductVariantName(title: string, color?: string | null, size?: string | null): string {
  const parts: string[] = [title];
  const variantDetails = formatVariantNameOnly(color, size);
  if (variantDetails) {
    parts.push(variantDetails);
  }
  return parts.join(' - ');
}
