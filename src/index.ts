import { Command } from "commander";
import { CommandFactory } from "./core/CommandFactory.ts";
import { ToolRegistry } from "./core/ToolRegistry.ts";
import { InputReader } from "./utils/input.ts";
import { getFormatter } from "./utils/output.ts";
import { handleError, CLIError } from "./utils/error.ts";

async function main() {
  const program = new Command();
  program
    .name("devtools")
    .description("DevTools CLI - A collection of developer utilities")
    .version("1.0.0");

  // Initialize and register commands
  const registry = ToolRegistry.getInstance();
  try {
    const commands = CommandFactory.createAll();
    for (const cmd of commands) {
      registry.register(cmd);
    }
  } catch (error) {
    handleError(error);
  }

  // Register uuid command
  program
    .command("uuid")
    .description("Generate one or more UUID v4 values")
    .option("-c, --count <number>", "Number of UUIDs to generate", "1")
    .option("-j, --json", "Format output as JSON", false)
    .action(async (options) => {
      try {
        const countNum = parseInt(options.count, 10);
        if (isNaN(countNum) || countNum <= 0) {
          throw new CLIError("Count option must be a positive integer.");
        }

        const cmd = registry.get("uuid");
        const inputReader = new InputReader();
        const stdin = await inputReader.read({ type: "stdin" });

        const result = await cmd.execute({
          args: [],
          flags: { count: countNum },
          stdin,
        });

        // Use custom formatter based on json option or command result format
        const formatType = options.json ? "json" : result.format;
        const formatter = getFormatter(formatType);
        console.log(formatter.format(result));
      } catch (error) {
        handleError(error);
      }
    });

  // Handle parsing of arguments
  program.parse(process.argv);
}

main().catch(handleError);
