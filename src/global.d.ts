declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.ttf?url" {
  const value: string;
  export default value;
}

declare module "*.woff2?url" {
  const value: string;
  export default value;
}