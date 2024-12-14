export interface ScreenshotOptions {
  outputDir: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
  delay?: number;
  branch?: string;
}

export interface ComparisonResult {
  url: string;
  diffPercentage: number;
  diffImagePath: string;
  passed: boolean;
}

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  priority?: number;
}
