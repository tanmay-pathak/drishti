import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import pLimit from "p-limit";
import { takeScreenshot } from "../utils/screenshot.js";
import { parseSitemap } from "../utils/sitemap.js";
import { getErrorMessage } from "../utils/error.js";
import type { ScreenshotOptions } from "../types/index.js";

export function createCaptureCommand() {
  const command = new Command("capture");

  command
    .description("Capture screenshots of URLs or sitemap")
    .argument("<source>", "URL or sitemap URL to capture")
    .option("-w, --width <pixels>", "Viewport width", "1920")
    .option("-h, --height <pixels>", "Viewport height", "1080")
    .option("-f, --full-page", "Capture full page", true)
    .option("-d, --delay <seconds>", "Delay before capture", "0")
    .option("-m, --mobile", "Capture in iPhone X mobile view", false)
    .option("-c, --concurrency <number>", "Number of concurrent captures", "5")
    .action(async (source: string, options) => {
      const spinner = ora("Processing").start();

      try {
        const screenshotOptions: ScreenshotOptions = {
          width: +options.width,
          height: +options.height,
          fullPage: options.fullPage,
          delay: +options.delay,
          mobile: options.mobile,
        };

        if (source.includes("sitemap")) {
          spinner.text = "Parsing sitemap...";
          const urls = await parseSitemap(source);
          const limit = pLimit(+options.concurrency);
          let completed = 0;

          spinner.text = `Capturing ${urls.length} pages...`;
          await Promise.all(
            urls.map((url) =>
              limit(async () => {
                await takeScreenshot(url.loc, screenshotOptions);
                spinner.text = `Captured ${++completed}/${urls.length} pages`;
              }),
            ),
          );
        } else {
          await takeScreenshot(source, screenshotOptions);
        }

        spinner.succeed(chalk.green("Screenshots captured successfully"));
      } catch (error) {
        chalk.red(`Error: ${getErrorMessage(error)}`);
      }
    });

  return command;
}
