import { Command } from "commander";
import { CommandFactory } from "./core/CommandFactory.ts";
import { ToolRegistry } from "./core/ToolRegistry.ts";
import { InputReader } from "./utils/input.ts";
import { getFormatter } from "./utils/output.ts";
import { handleError } from "./utils/error.ts";
import {
  printBanner,
  printCommandTable,
  printUsageHint,
  printResult,
  printResultLines,
  printError,
} from "./utils/ui.ts";
import { runInteractive } from "./utils/interactive.ts";

export { CLIError } from "./utils/error.ts";

// ─── Command metadata for the help table ───────────────────────────────────

const COMMAND_HELP = [
  { name: "uuid",      description: "Generate one or more UUID v4 values",               usage: "devtools uuid -c 5" },
  { name: "base64",    description: "Encode or decode base64 strings",                    usage: "devtools base64 'hello' | devtools base64 -d 'aGVsbG8='"},
  { name: "hash",      description: "Hash text (MD5, SHA-1, SHA-256, SHA-512)",           usage: "devtools hash -a sha512 'hello'" },
  { name: "url",       description: "Encode or decode URL strings (percent-encode)",      usage: "devtools url 'hello world'" },
  { name: "case",      description: "Convert text case (upper, lower, title, snake, etc.)", usage: "devtools case -f snake 'Hello World'" },
  { name: "timestamp", description: "Convert Unix timestamps ↔ human-readable dates",     usage: "devtools timestamp --to-human 1609459200" },
  { name: "base",      description: "Convert numbers between bases (binary, octal, hex)", usage: "devtools base 255 --to hex" },
];

// ─── Styled output helper ──────────────────────────────────────────────────

function displayResult(
  commandName: string,
  data: unknown,
  format: "text" | "json" | "binary"
): void {
  if (format === "json") {
    const formatter = getFormatter("json");
    console.log(formatter.format({ data, format }));
    return;
  }

  if (Array.isArray(data)) {
    const labels: Record<string, string> = {
      uuid: "Generated UUIDs",
    };
    printResultLines(labels[commandName] ?? "Result", data.map(String));
    return;
  }

  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    // Special: hash output
    if (obj.hash !== undefined) {
      printResult(
        `${String(obj.algorithm ?? "").toUpperCase()} hash`,
        String(obj.hash)
      );
      if (obj.input !== undefined) {
        process.stderr.write(`  input: ${obj.input}\n`);
      }
      return;
    }
    const formatter = getFormatter("text");
    printResult("Result", formatter.format({ data, format }));
    return;
  }

  const labels: Record<string, string> = {
    base64: "base64",
    url: "encoded URL",
    case: "converted text",
    timestamp: "timestamp",
    base: "converted number",
  };
  printResult(labels[commandName] ?? "Result", String(data));
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  // Initialize registry — must happen before interactive OR command-line mode
  const registry = ToolRegistry.getInstance();
  try {
    const commands = CommandFactory.createAll();
    for (const cmd of commands) {
      registry.register(cmd);
    }
  } catch (error) {
    handleError(error);
  }

  // Auto-detect: if no args, run interactive mode
  if (process.argv.length <= 2) {
    await runInteractive();
    return;
  }



  const program = new Command();

  // ── Custom help output ──────────────────────────────────────────────────
  program.configureHelp({ sortSubcommands: true });
  program.addHelpText("beforeAll", () => {
    printBanner();
    printCommandTable(COMMAND_HELP);
    return ""; // commander still renders the default block
  });

  program
    .name("devtools")
    .description("DevTools CLI — A collection of developer utilities")
    .version("1.0.0", "-v, --version", "Show version");

  // ── Generic command handler factory ─────────────────────────────────────
  const createCommandHandler = (commandName: string) => {
    return async (args: string[], options: Record<string, unknown>) => {
      try {
        const cmd = registry.get(commandName);
        const inputReader = new InputReader();
        const stdin = await inputReader.read({ type: "stdin" });

        const result = await cmd.execute({ args, flags: options, stdin });

        if (options.json) {
          const formatter = getFormatter("json");
          console.log(formatter.format(result));
        } else {
          displayResult(commandName, result.data, result.format);
        }
      } catch (error) {
        printError((error as Error).message, `Run: devtools ${commandName} --help`);
        process.exit(1);
      }
    };
  };

  // ── uuid ─────────────────────────────────────────────────────────────────
  program
    .command("uuid [args...]")
    .description("Generate one or more UUID v4 values")
    .option("-c, --count <number>", "Number of UUIDs to generate", "1")
    .option("-j, --json", "Format output as JSON", false)
    .addHelpText("after", `\n  Examples:\n    $ devtools uuid\n    $ devtools uuid -c 5\n`)
    .action(async (args, options) => {
      const countNum = parseInt(options.count as string, 10);
      if (isNaN(countNum) || countNum <= 0) {
        printError("--count must be a positive integer.", "devtools uuid -c 3");
        process.exit(2);
      }
      options.count = countNum;
      await createCommandHandler("uuid")(args || [], options);
    });

  // ── base64 ───────────────────────────────────────────────────────────────
  program
    .command("base64 [text...]")
    .description("Encode or decode base64 strings")
    .option("-d, --decode", "Decode base64", false)
    .option("-j, --json", "Format output as JSON", false)
    .addHelpText("after", `\n  Examples:\n    $ devtools base64 'hello world'\n    $ devtools base64 -d 'aGVsbG8gd29ybGQ='\n    $ echo 'hello' | devtools base64\n`)
    .action((text, options) => createCommandHandler("base64")(text || [], options));

  // ── hash ──────────────────────────────────────────────────────────────────
  program
    .command("hash [text...]")
    .description("Generate hash digests (MD5, SHA-1, SHA-256, SHA-512)")
    .option("-a, --algorithm <algo>", "Hash algorithm (md5, sha1, sha256, sha512)", "sha256")
    .option("--show-input", "Include input in output", false)
    .option("-j, --json", "Format output as JSON", false)
    .addHelpText("after", `\n  Examples:\n    $ devtools hash 'hello world'\n    $ devtools hash -a md5 'hello'\n    $ echo 'secret' | devtools hash -a sha512\n`)
    .action((text, options) => createCommandHandler("hash")(text || [], options));

  // ── url ───────────────────────────────────────────────────────────────────
  program
    .command("url [text...]")
    .description("Encode or decode URL strings (percent encoding)")
    .option("-d, --decode", "Decode URL", false)
    .option("-j, --json", "Format output as JSON", false)
    .addHelpText("after", `\n  Examples:\n    $ devtools url 'hello world'\n    $ devtools url -d 'hello%20world'\n`)
    .action((text, options) => createCommandHandler("url")(text || [], options));

  // ── case ──────────────────────────────────────────────────────────────────
  program
    .command("case [text...]")
    .description("Convert text between different cases")
    .option("-f, --format <type>", "Case format (upper, lower, title, snake, kebab, camel, pascal, constant)", "upper")
    .option("-j, --json", "Format output as JSON", false)
    .addHelpText("after", `\n  Examples:\n    $ devtools case 'hello world'\n    $ devtools case -f snake 'Hello World'\n    $ devtools case -f camel 'hello-world-example'\n    $ echo 'myVariableName' | devtools case -f snake\n`)
    .action((text, options) => createCommandHandler("case")(text || [], options));

  // ── timestamp ─────────────────────────────────────────────────────────────
  program
    .command("timestamp [value...]")
    .description("Convert between Unix timestamps and human-readable dates")
    .option("-h, --to-human", "Convert timestamp to human-readable date", false)
    .option("-u, --unit <unit>", "Time unit (s/seconds or ms/milliseconds)", "s")
    .option("-j, --json", "Format output as JSON", false)
    .addHelpText("after", `\n  Examples:\n    $ devtools timestamp\n    $ devtools timestamp --to-human 1609459200\n    $ devtools timestamp '2024-01-01'\n    $ devtools timestamp --to-human 1609459200000 -u ms\n`)
    .action((value, options) => createCommandHandler("timestamp")(value || [], options));

  // ── base ──────────────────────────────────────────────────────────────────
  program
    .command("base [number...]")
    .description("Convert numbers between different bases")
    .option("-f, --from <base>", "Source base (binary/2, octal/8, decimal/10, hex/16)", "10")
    .option("-t, --to <base>", "Target base (binary/2, octal/8, decimal/10, hex/16)", "10")
    .option("-a, --all", "Show conversion to all common bases", false)
    .option("-j, --json", "Format output as JSON", false)
    .addHelpText("after", `\n  Examples:\n    $ devtools base 255\n    $ devtools base 255 --to hex\n    $ devtools base FF --from hex --to binary\n    $ devtools base 1010 --from binary --all\n`)
    .action((number, options) => createCommandHandler("base")(number || [], options));

  // ── Parse ─────────────────────────────────────────────────────────────────
  program.parse(process.argv);
}

main().catch((error) => handleError(error));
