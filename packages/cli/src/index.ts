#!/usr/bin/env node
import { Command } from "commander"
import { initCommand } from "./commands/init.js"
import { docsCommand } from "./commands/docs.js"

const program = new Command()

program
  .name("shipstack-agent")
  .description("AI-native fullstack scaffolder — your app in 2 minutes")
  .version("0.1.0")

program
  .command("init")
  .description("Scaffold a new ShipFast Stack project")
  .argument("[name]", "Project name")
  .action(initCommand)

program
  .command("docs")
  .description("Regenerate AI documentation (CLAUDE.md, PATTERNS.md, llms.txt)")
  .action(docsCommand)

program.parse()
