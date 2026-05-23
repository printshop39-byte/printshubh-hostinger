import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — shadcn's canonical class-name combiner.
 * Lets you compose Tailwind classes with conditional logic and resolves
 * conflicts (e.g. "p-2 p-4" → "p-4") using tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
