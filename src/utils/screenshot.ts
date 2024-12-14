import captureWebsite from "capture-website";
import path from "path";
import fs from "fs/promises";
import { ScreenshotOptions } from "../types/index.js";

function sanitizeUrl(url: string): string {
  // Remove protocol (http://, https://)
  let clean = url.replace(/^https?:\/\//, "");
  // Remove trailing slashes
  clean = clean.replace(/\/$/, "");
  // Replace special characters with dashes
  clean = clean.replace(/[^a-zA-Z0-9]/g, "-");
  // Replace multiple dashes with single dash
  clean = clean.replace(/-+/g, "-");
  // Trim dashes from start and end
  clean = clean.replace(/^-+|-+$/g, "");
  return clean;
}

export async function takeScreenshot(
  url: string,
  options: ScreenshotOptions,
): Promise<string> {
  const sanitizedUrl = sanitizeUrl(url);
  const filename = `${sanitizedUrl}${options.mobile ? "-mobile" : ""}.png`;

  const outputPath = path.join(
    options.outputDir,
    options.branch || "main",
    filename,
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Check if file exists
  try {
    await fs.access(outputPath);
    // If file exists, delete it
    await fs.unlink(outputPath);
  } catch {
    // File doesn't exist, which is fine
  }

  const captureOptions: any = {
    width: options.width || 1920,
    height: options.height || 1080,
    fullPage: options.fullPage || true,
    delay: options.delay || 0,
  };

  if (options.mobile) {
    captureOptions.emulateDevice = "iPhone X";
  }

  await captureWebsite.file(url, outputPath, captureOptions);

  return outputPath;
}
