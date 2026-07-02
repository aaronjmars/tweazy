// Ambient declaration for global (non-module) CSS side-effect imports.
// TypeScript 6.0 checks side-effect imports (`import "x.css"`), and Next.js
// only declares `*.module.css`, so plain stylesheet imports need this.
declare module "*.css";
