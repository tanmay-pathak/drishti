import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { takeScreenshot } from "../utils/screenshot.js";
import { parseSitemap } from "../utils/sitemap.js";
import { getErrorMessage } from "../utils/error.js";
import type { ScreenshotOptions } from "../types/index.js";

export function createCaptureCommand() {
  const command = new Command("capture");

  command
    .description("Capture screenshots of URLs or sitemap")
    .argument("<source>", "URL or sitemap URL to capture")
    .option("-o, --output <dir>", "Output directory", "./screenshots")
    .option("-w, --width <pixels>", "Viewport width", "1920")
    .option("-h, --height <pixels>", "Viewport height", "1080")
    .option("-f, --full-page", "Capture full page", false)
    .option("-d, --delay <seconds>", "Delay before capture", "0")
    .option(
      "-b, --branch <name>",
      "Branch name for organizing screenshots",
      "main",
    )
    .action(async (source: string, options) => {
      const spinner = ora("Processing").start();

      try {
        const screenshotOptions: ScreenshotOptions = {
          outputDir: options.output,
          width: parseInt(options.width),
          height: parseInt(options.height),
          fullPage: options.fullPage,
          delay: parseInt(options.delay),
          branch: options.branch,
        };

        if (source.includes("sitemap")) {
          spinner.text = "Parsing sitemap...";
          const urls = await parseSitemap(source);

          spinner.text = `Capturing ${urls.length} pages...`;
          for (const [index, url] of urls.entries()) {
            spinner.text = `Capturing page ${index + 1}/${urls.length}: ${url.loc}`;
            await takeScreenshot(url.loc, screenshotOptions);
          }
        } else {
          await takeScreenshot(source, screenshotOptions);
        }

        spinner.succeed(chalk.green("Screenshots captured successfully"));
      } catch (error) {
        spinner.fail(chalk.red(`Error: ${getErrorMessage(error)}`));
        process.exit(1);
      }
    });

  return command;
}
