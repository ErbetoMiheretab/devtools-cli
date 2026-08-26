/**
 * Interactive mode — runs when `devtools` is called with no arguments.
 * Uses @clack/prompts for a minimal, friendly prompt flow.
 */
import * as p from "@clack/prompts";
import pc from "picocolors";
import { ToolRegistry } from "../core/ToolRegistry.ts";
import { getFormatter } from "./output.ts";
import { printResult, printResultLines, printError } from "./ui.ts";

type SelectOption = { value: string; label: string; hint?: string };

const COMMAND_META: Record<
  string,
  {
    hint: string;
    prompts: () => Promise<Record<string, unknown> | symbol>;
  }
> = {
  uuid: {
    hint: "Generate UUID v4 values",
    prompts: async () => {
      const count = await p.text({
        message: "How many UUIDs?",
        placeholder: "1",
        defaultValue: "1",
        validate: (v) => {
          const n = parseInt(v, 10);
          if (isNaN(n) || n < 1) return "Enter a positive integer";
        },
      });
      return p.isCancel(count) ? p.cancel() : { count: count ?? "1" };
    },
  },
  base64: {
    hint: "Encode or decode base64",
    prompts: async () => {
      const text = await p.text({
        message: "Text to encode / decode:",
        placeholder: "hello world",
        validate: (v) => (!v.trim() ? "Input cannot be empty" : undefined),
      });
      if (p.isCancel(text)) return p.cancel();

      const mode = await p.select<SelectOption>({
        message: "Operation:",
        options: [
          { value: "encode", label: "Encode  →  base64" },
          { value: "decode", label: "Decode  ←  base64", hint: "input must be valid base64" },
        ],
      });
      if (p.isCancel(mode)) return p.cancel();

      return { args: [text as string], decode: mode === "decode" };
    },
  },
  hash: {
    hint: "Hash a string (MD5, SHA-256 …)",
    prompts: async () => {
      const text = await p.text({
        message: "Text to hash:",
        placeholder: "hello world",
        validate: (v) => (!v.trim() ? "Input cannot be empty" : undefined),
      });
      if (p.isCancel(text)) return p.cancel();

      const algorithm = await p.select<SelectOption>({
        message: "Algorithm:",
        options: [
          { value: "sha256", label: "SHA-256", hint: "recommended" },
          { value: "sha512", label: "SHA-512" },
          { value: "sha1", label: "SHA-1", hint: "legacy" },
          { value: "md5", label: "MD5", hint: "legacy" },
        ],
      });
      if (p.isCancel(algorithm)) return p.cancel();

      return { args: [text as string], algorithm };
    },
  },
  url: {
    hint: "Encode or decode URL strings",
    prompts: async () => {
      const text = await p.text({
        message: "URL / text to process:",
        placeholder: "hello world or https://example.com?q=hello world",
        validate: (v) => (!v.trim() ? "Input cannot be empty" : undefined),
      });
      if (p.isCancel(text)) return p.cancel();

      const mode = await p.select<SelectOption>({
        message: "Operation:",
        options: [
          { value: "encode", label: "Encode  →  percent-encoded" },
          { value: "decode", label: "Decode  ←  percent-encoded" },
        ],
      });
      if (p.isCancel(mode)) return p.cancel();

      return { args: [text as string], decode: mode === "decode" };
    },
  },
};

export async function runInteractive(): Promise<void> {
  const registry = ToolRegistry.getInstance();

  p.intro(pc.bold(pc.cyan("⬡  DevTools CLI")));

  // Pick command
  const commandOptions: SelectOption[] = Object.entries(COMMAND_META).map(
    ([name, meta]) => ({ value: name, label: name, hint: meta.hint })
  );

  const chosen = await p.select<SelectOption>({
    message: "What would you like to do?",
    options: commandOptions,
  });

  if (p.isCancel(chosen)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const commandName = chosen as string;
  const meta = COMMAND_META[commandName];
  if (!meta) {
    printError(`Unknown command: ${commandName}`);
    process.exit(1);
  }

  // Run command-specific prompts
  const answers = await meta.prompts();
  if (p.isCancel(answers)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const flags = answers as Record<string, unknown>;
  const args = (flags.args as string[] | undefined) ?? [];
  delete flags.args;

  const spinner = p.spinner();
  spinner.start("Running…");

  try {
    const cmd = registry.get(commandName);
    const result = await cmd.execute({ args, flags, stdin: "" });

    spinner.stop("Done");

    // Pretty-print result
    const data = result.data;
    if (Array.isArray(data)) {
      printResultLines("Result", data.map(String));
    } else if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      // Special case: hash result
      if (obj.hash) {
        printResult(
          `${String(obj.algorithm).toUpperCase()} hash`,
          String(obj.hash)
        );
      } else {
        const formatter = getFormatter(result.format);
        printResult("Result", formatter.format(result));
      }
    } else {
      printResult("Result", String(data));
    }

    p.outro(pc.dim("Done! Run with --help to see all options."));
  } catch (err) {
    spinner.stop("Failed");
    printError((err as Error).message);
    process.exit(1);
  }
}
