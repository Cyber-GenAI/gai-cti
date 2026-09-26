// @types/elastic-eui-icons.d.ts
declare module '@elastic/eui/es/components/icon/assets/arrow_down' {
  export const icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module '@elastic/eui/es/components/icon/assets/unfold' {
  export const icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

// declare module '@elastic/eui/es/components/icon/icon' 
declare module '@elastic/eui/es/components/icon/icon' {
  export function appendIconComponentCache(icons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>>): void;
}
