import { Command } from "commander";
import { CommandFactory } from "./core/CommandFactory.ts";
import { ToolRegistry } from "./core/ToolRegistry.ts";
import { InputReader } from "./utils/input.ts";
import { getFormatter } from "./utils/output.ts";
import { handleError } from "./utils/error.ts";

export { CLIError } from "./utils/error.ts";

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

  // Generic command handler factory
  const createCommandHandler = (commandName: string) => {
    return async (args: string[], options: Record<string, unknown>) => {
      try {
        const cmd = registry.get(commandName);
        const inputReader = new InputReader();
        const stdin = await inputReader.read({ type: "stdin" });

        const result = await cmd.execute({
          args,
          flags: options,
          stdin,
        });

        // Use custom formatter based on json option or command result format
        const formatType = options.json ? "json" : result.format;
        const formatter = getFormatter(formatType as "text" | "json" | "binary");
        console.log(formatter.format(result));
      } catch (error) {
        handleError(error);
      }
    };
  };

  // Register uuid command
  program
    .command("uuid [args...]")
    .description("Generate one or more UUID v4 values")
    .option("-c, --count <number>", "Number of UUIDs to generate", "1")
    .option("-j, --json", "Format output as JSON", false)
    .action(async (args, options) => {
      const countNum = parseInt(options.count as string, 10);
      if (isNaN(countNum) || countNum <= 0) {
        handleError(new Error("Count option must be a positive integer."));
        return;
      }
      options.count = countNum;
      await createCommandHandler("uuid")(args || [], options);
    });

  // Register base64 command
  program
    .command("base64 [text...]")
    .description("Encode or decode base64 strings")
    .option("-d, --decode", "Decode base64", false)
    .option("-j, --json", "Format output as JSON", false)
    .action((text, options) => {
      return createCommandHandler("base64")(text || [], options);
    });

  // Register hash command
  program
    .command("hash [text...]")
    .description("Generate hash digests (MD5, SHA-1, SHA-256, SHA-512)")
    .option("-a, --algorithm <algo>", "Hash algorithm (md5, sha1, sha256, sha512)", "sha256")
    .option("--show-input", "Include input in output", false)
    .option("-j, --json", "Format output as JSON", false)
    .action((text, options) => {
      return createCommandHandler("hash")(text || [], options);
    });

  // Register url command
  program
    .command("url [text...]")
    .description("Encode or decode URL strings (percent encoding)")
    .option("-d, --decode", "Decode URL", false)
    .option("-j, --json", "Format output as JSON", false)
    .action((text, options) => {
      return createCommandHandler("url")(text || [], options);
    });

  // Handle parsing of arguments
  program.parse(process.argv);
}

main().catch((error) => handleError(error));

