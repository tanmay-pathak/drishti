import captureWebsite from "capture-website";
import path from "path";
import fs from "fs/promises";
import os from "os";
import { execSync } from "child_process";
import { ScreenshotOptions } from "../types/index.js";

function getRepoName(): string {
  try {
    // Get the remote origin URL
    const remoteUrl = execSync("git remote get-url origin").toString().trim();
    // Extract repo name from the URL (works for both HTTPS and SSH URLs)
    const match = remoteUrl.match(/[\/:]([^\/]+?)(?:\.git)?$/);
    return match ? match[1] : "default";
  } catch {
    // If not in a git repo or no remote, use the current directory name
    return path.basename(process.cwd());
  }
}

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

  // Create base directory in user's home
  const baseDir = path.join(os.homedir(), "drishti", getRepoName());

  const outputPath = options.branch
    ? path.join(baseDir, options.branch, filename)
    : path.join(baseDir, filename);

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
