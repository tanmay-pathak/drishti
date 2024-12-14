#!/usr/bin/env node
import { Command } from "commander";
import { createCaptureCommand } from "./commands/capture.js";
import { createCompareCommand } from "./commands/compare.js";

const program = new Command();

program
  .name("drishti")
  .description("Visual regression testing tool for websites")
  .version("1.0.0");

program.addCommand(createCaptureCommand());
program.addCommand(createCompareCommand());

program.parse();
