import captureWebsite from "capture-website";
import path from "path";
import fs from "fs/promises";
import { ScreenshotOptions } from "../types/index.js";

export async function takeScreenshot(
  url: string,
  options: ScreenshotOptions,
): Promise<string> {
  const filename = `${Buffer.from(url).toString("base64")}.png`;
  const outputPath = path.join(
    options.outputDir,
    options.branch || "main",
    filename,
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await captureWebsite.file(url, outputPath, {
    width: options.width || 1920,
    height: options.height || 1080,
    fullPage: options.fullPage || true,
    delay: options.delay || 0,
  });

  return outputPath;
}
