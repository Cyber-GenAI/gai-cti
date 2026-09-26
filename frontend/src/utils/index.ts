import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { inflate } from 'pako';
import { table_filter_operators } from "../constants/table";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const numberFormatter = (num: number): string => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });

  if (item) {
    const result = (num / item.value).toString().match(/^-?\d+(?:\.\d{0,2})?/);
    const formattedValue = result ? result[0].replace(rx, "$1") : "0";
    return formattedValue + item.symbol;
  }

  return "0";
};

export const generateUniqueId = (): string => {
  return 'id-' + Math.random().toString(36).substr(2, 9);
};

export const formatOperator = (op: string) => {
  return table_filter_operators[op]
}

export const formatOperatorToLabel = (value: string) => {
  let res = ''
  Object.keys(table_filter_operators).map((key) => {
    if (table_filter_operators[key].value === value)
      res = key
  })
  return res
}

export const stringSeededRandomInRange = (seed: string, min: number, max: number): number => {
  const stringToSeed = (seed: string): number => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  const random = (seed: number): number => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  }

  const seedValue = stringToSeed(seed);
  const randomValue = random(seedValue);
  return Math.abs(Math.floor(randomValue * (max - min) + min));
}

export function decodeCompressedBase64<T = unknown>(encodedData: string): T | null {
  try {
    // Base64 decode
    const binaryString = atob(encodedData);
    const charData = new Uint8Array(
      [...binaryString].map((char) => char.charCodeAt(0))
    );

    const decompressed = inflate(charData, { to: 'string' });

    return JSON.parse(decompressed) as T;
  } catch (error) {
    console.error('Failed to decode and parse data:', error);
    return null;
  }
}

export const roundToNearestTen = (num: number) => {
  return Math.round(num / 10) * 10;
}

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};

export const formatDate = (v: string | number, compressed?: boolean) => {
  const d = new Date(v);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  if (compressed) {
    return `${year}/${month}/${day}`;
  }

  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  const second = String(d.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
};