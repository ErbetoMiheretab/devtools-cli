






















































import type { ICommand } from "./interfaces.js";
import { UuidCommand } from "../commands/uuid.js";
import { Base64Command } from "../commands/base64.js";
import { HashCommand } from "../commands/hash.js";
import { UrlCommand } from "../commands/url.js";
import { CaseCommand } from "../commands/case.js";
import { TimestampCommand } from "../commands/timestamp.js";
import { BaseConverterCommand } from "../commands/base.js";

type CommandConstructor = new () => ICommand;

const COMMAND_MAP: Record<string, CommandConstructor> = {
  uuid: UuidCommand,
  base64: Base64Command,
  hash: HashCommand,
  url: UrlCommand,
  case: CaseCommand,
  timestamp: TimestampCommand,
  base: BaseConverterCommand,
};

export class CommandFactory {
  // Optional cache for singleton instances
  private static instances: Record<string, ICommand> = {};

  static create(name: string): ICommand {
    const Ctor = COMMAND_MAP[name];
    if (!Ctor) throw new Error(`No entry for: ${name}`);

    if (!this.instances[name]) {
      this.instances[name] = new Ctor();
    }
    return this.instances[name];
  }

  static createAll(): ICommand[] {
    return Object.keys(COMMAND_MAP).map((name) => CommandFactory.create(name));
  }
  static list(): { name: string; description: string }[] {
    return CommandFactory.createAll().map((cmd) => ({
      name: cmd.name,
      description: cmd.description,
    }));
  }
}
