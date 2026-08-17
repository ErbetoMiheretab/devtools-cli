import type { ICommand } from "./interfaces.ts";
import { UuidCommand } from "../commands/uuid.ts";

type CommandConstructor = new () => ICommand;

const COMMAND_MAP: Record<string, CommandConstructor> = {
  uuid: UuidCommand,
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
