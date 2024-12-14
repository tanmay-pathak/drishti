import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { compareImages } from "../utils/compare.js";
import { getErrorMessage } from "../utils/error.js";
import { takeScreenshot } from "../utils/screenshot.js";
import {
  getCurrentBranch,
  switchBranch,
  restoreOriginalBranch,
} from "../utils/git.js";

export function createCompareCommand() {
  const command = new Command("compare");

  command
    .description("Compare a URL between your current branch and main")
    .argument("<url>", "URL to compare")
    .option("-o, --output <dir>", "Output directory for diff images", "./diffs")
    .option(
      "-t, --threshold <percentage>",
      "Difference threshold percentage",
      "1",
    )
    .action(async (url: string, options) => {
      const spinner = ora("Comparing screenshots").start();
      let mainScreenshot: string | null = null;
      let branchScreenshot: string | null = null;

      try {
        const currentBranch = await getCurrentBranch();

        try {
          // Switch to main and take screenshot
          spinner.text = "Switching to main branch";
          await switchBranch("main");

          try {
            spinner.text = "Capturing screenshot from main branch";
            mainScreenshot = await takeScreenshot(url, {
              outputDir: "./screenshots",
              branch: "main",
            });
          } catch (error) {
            spinner.fail(chalk.red(`Failed to capture main branch: ${getErrorMessage(error)}`));
            process.exit(1);
          }

          // Switch to comparison branch and take screenshot
          spinner.text = `Switching to ${currentBranch} branch`;
          await switchBranch(currentBranch);

          try {
            spinner.text = "Capturing screenshot from current branch";
            branchScreenshot = await takeScreenshot(url, {
              outputDir: "./screenshots",
              branch: currentBranch,
            });
          } catch (error) {
            spinner.fail(chalk.red(`Failed to capture current branch: ${getErrorMessage(error)}`));
            process.exit(1);
          }

          // Switch back to original branch
          spinner.text = "Switching back to original branch";
          await restoreOriginalBranch(currentBranch);

          if (mainScreenshot && branchScreenshot) {
            spinner.text = "Comparing screenshots";
            const result = await compareImages(
              mainScreenshot,
              branchScreenshot,
              options.output,
            );

            if (result.passed) {
              spinner.succeed(chalk.green("Comparison passed!"));
            } else {
              spinner.fail(
                chalk.red(
                  `Comparison failed: ${result.diffPercentage.toFixed(2)}% different`,
                ),
              );
              console.log(chalk.gray(`Diff image: ${result.diffImagePath}`));
              process.exit(1);
            }
          }
        } catch (error) {
          // Ensure we switch back to original branch even if there's an error
          await restoreOriginalBranch(currentBranch);
          throw error;
        }
      } catch (error) {
        spinner.fail(chalk.red(`Error: ${getErrorMessage(error)}`));
        process.exit(1);
      }
    });

  return command;
}
