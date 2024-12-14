import fs from "fs/promises";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import path from "path";
import { ComparisonResult } from "../types/index.js";

export async function compareImages(
  baselinePath: string,
  comparePath: string,
): Promise<ComparisonResult> {
  const baselineImage = PNG.sync.read(await fs.readFile(baselinePath));
  const compareImage = PNG.sync.read(await fs.readFile(comparePath));

  const { width, height } = baselineImage;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    baselineImage.data,
    compareImage.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 },
  );

  const diffPercentage = (diffPixels / (width * height)) * 100;
  const diffFilename = path.basename(comparePath).replace(".png", "-diff.png");
  const diffPath = path.join(path.dirname(baselinePath), "diffs", diffFilename);

  await fs.mkdir(path.dirname(diffPath), { recursive: true });
  await fs.writeFile(diffPath, PNG.sync.write(diff));

  return {
    url: path.basename(comparePath, ".png"),
    diffPercentage,
    diffImagePath: diffPath,
    passed: diffPercentage < 1, // Consider less than 1% difference as passed
  };
}
