#!/usr/bin/env node
import { Command } from "commander";
import { createCaptureCommand } from "./commands/capture.js";

const program = new Command();

program
  .name("drishti")
  .description("Visual regression testing tool for websites.");

program.addCommand(createCaptureCommand());

program.parse();
