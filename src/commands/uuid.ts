import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

import { BaseCommand } from "../core/BaseCommand";

import type { CommandInput } from "../core/interfaces";

export class UuidCommand extends BaseCommand {
  name = "uuid";
  description = "Generate one or more UUID v4 values";

  protected async run(input: CommandInput): Promise<unknown> {
    const count = Number(input.flags.count ?? 1);
    return Array.from({ length: count }, () => randomUUID());
  }
}

// Allow direct execution
if (process.argv[1]) {
  const isDirectRun = 
    process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith("/uuid.ts") ||
    process.argv[1].endsWith("\\uuid.ts") ||
    process.argv[1].endsWith("/uuid.js") ||
    process.argv[1].endsWith("\\uuid.js");

  if (isDirectRun) {
    (async () => {
      // Simple CLI flag parser (e.g. --count=5 or --count 5)
      const flags: Record<string, unknown> = {};
      const args = process.argv.slice(2);
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith("--count=")) {
          flags.count = arg.split("=")[1];
        } else if (arg === "--count" || arg === "-c") {
          if (i + 1 < args.length) {
            flags.count = args[++i];
          }
        }
      }

      const cmd = new UuidCommand();
      const result = await cmd.execute({ args: [], flags });
      
      if (Array.isArray(result.data)) {
        console.log(result.data.join("\n"));
      } else {
        console.log(result.data);
      }
    })().catch(console.error);
  }
}

