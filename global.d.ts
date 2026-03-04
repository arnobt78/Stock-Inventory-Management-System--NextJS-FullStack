/**
 * Global type declarations for Next.js project
 * Provides type safety for CSS imports and other module types
 */

// CSS side-effect imports (for global styles like import "./globals.css")
// This allows TypeScript to recognize CSS files as valid imports
declare module "*.css" {
  const content: any;
  export default content;
}

// SCSS side-effect imports
declare module "*.scss" {
  const content: any;
  export default content;
}

// CSS Module declarations (for CSS modules with classNames)
declare module "*.module.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.sass" {
  const content: { [className: string]: string };
  export default content;
}

// SVG imports
declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

// Image imports
declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

declare module "*.ico" {
  const content: string;
  export default content;
}
