import { randomUUID } from "crypto";

import { BaseCommand } from "../core/BaseCommand.ts";

import type { CommandInput } from "../core/interfaces.ts";

export class UuidCommand extends BaseCommand {
  name = "uuid";
  description = "Generate one or more UUID v4 values";

  protected async run(input: CommandInput): Promise<unknown> {
    const count = Number(input.flags.count ?? 1);
    return Array.from({ length: count }, () => randomUUID());
  }
}
