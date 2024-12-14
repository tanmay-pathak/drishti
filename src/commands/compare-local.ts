import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import path from "path";
import {
  getCurrentBranch,
  switchBranch,
  restoreOriginalBranch,
} from "../utils/git.js";
import { takeScreenshot } from "../utils/screenshot.js";
import { compareImages } from "../utils/compare.js";
import { getErrorMessage } from "../utils/error.js";
import type { ScreenshotOptions } from "../types/index.js";

export function createCompareLocalCommand() {
  const command = new Command("compare-local");

  command
    .description(
      "Compare screenshots of URL between current branch and main branch",
    )
    .argument("<url>", "URL to capture and compare")
    .option("-w, --width <pixels>", "Viewport width", "1920")
    .option("-h, --height <pixels>", "Viewport height", "1080")
    .option("-f, --full-page", "Capture full page", true)
    .option("-d, --delay <seconds>", "Delay before capture", "0")
    .option("-m, --mobile", "Capture in iPhone X mobile view", false)
    .action(async (url: string, options) => {
      const spinner = ora("Processing").start();

      try {
        const currentBranch = await getCurrentBranch();
        const screenshotOptions: ScreenshotOptions = {
          width: +options.width,
          height: +options.height,
          fullPage: options.fullPage,
          delay: +options.delay,
          mobile: options.mobile,
        };

        // Take screenshot in current branch
        spinner.text = `Capturing screenshot in ${currentBranch} branch...`;
        screenshotOptions.branch = currentBranch;
        const currentBranchPath = await takeScreenshot(url, screenshotOptions);

        // Switch to main branch and take screenshot
        spinner.text = "Switching to main branch...";
        await switchBranch("main");

        spinner.text = "Capturing screenshot in main branch...";
        screenshotOptions.branch = "main";
        const mainBranchPath = await takeScreenshot(url, screenshotOptions);

        // Compare screenshots
        spinner.text = "Comparing screenshots...";
        const result = await compareImages(
          mainBranchPath,
          currentBranchPath,
        );

        // Switch back to original branch
        await restoreOriginalBranch(currentBranch);

        if (result.passed) {
          spinner.succeed(
            chalk.green("No significant visual differences detected"),
          );
        } else {
          spinner.info(
            chalk.yellow(
              `Visual differences detected (${result.diffPercentage.toFixed(2)}% different)\n` +
                `Diff image saved to: ${result.diffImagePath}`,
            ),
          );
        }
      } catch (error) {
        spinner.fail(chalk.red(`Error: ${getErrorMessage(error)}`));
        // Ensure we switch back to original branch even if there's an error
        try {
          const currentBranch = await getCurrentBranch();
          await restoreOriginalBranch(currentBranch);
        } catch {
          // Ignore cleanup errors
        }
      }
    });

  return command;
}
