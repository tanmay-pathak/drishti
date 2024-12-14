import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import path from "path";
import fs from "fs/promises";
import { compareImages } from "../utils/compare.js";
import { getErrorMessage } from "../utils/error.js";
import type { ComparisonResult } from "../types/index.js";

export function createCompareCommand() {
  const command = new Command("compare");

  command
    .description("Compare screenshots between branches or against baseline")
    .argument("<baseDir>", "Base directory containing screenshots")
    .argument("<compareDir>", "Directory containing screenshots to compare")
    .option("-o, --output <dir>", "Output directory for diff images", "./diffs")
    .option(
      "-t, --threshold <percentage>",
      "Difference threshold percentage",
      "1",
    )
    .action(async (baseDir: string, compareDir: string, options) => {
      const spinner = ora("Comparing screenshots").start();

      try {
        const results: ComparisonResult[] = [];
        const baseFiles = await fs.readdir(baseDir);

        for (const file of baseFiles) {
          if (!file.endsWith(".png")) continue;

          const basePath = path.join(baseDir, file);
          const comparePath = path.join(compareDir, file);

          try {
            await fs.access(comparePath);
            const result = await compareImages(
              basePath,
              comparePath,
              options.output,
            );
            results.push(result);
          } catch (err) {
            spinner.warn(chalk.yellow(`Missing comparison file: ${file}`));
          }
        }

        const failed = results.filter((r) => !r.passed);

        if (failed.length === 0) {
          spinner.succeed(chalk.green("All comparisons passed!"));
        } else {
          spinner.fail(chalk.red(`${failed.length} comparisons failed:`));
          failed.forEach((f) => {
            console.log(
              chalk.red(
                `  ✖ ${f.url}: ${f.diffPercentage.toFixed(2)}% different`,
              ),
            );
            console.log(chalk.gray(`    Diff image: ${f.diffImagePath}`));
          });
          process.exit(1);
        }
      } catch (error) {
        spinner.fail(chalk.red(`Error: ${getErrorMessage(error)}`));
        process.exit(1);
      }
    });

  return command;
}
