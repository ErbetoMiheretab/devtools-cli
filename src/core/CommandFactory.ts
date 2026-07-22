import type { ICommand } from "./interfaces";
import { UuidCommand } from "../commands/uuid";

type CommandConstructor = new () => ICommand;

const COMMAND_MAP: Record<string, CommandConstructor> = {
  uuid: UuidCommand,
};

export class CommandFactory {
  static create(name: string): ICommand {
    const Ctor = COMMAND_MAP[name];
    if (!Ctor) throw new Error(`No entry for: ${name}`);
    return new Ctor();
  }

  static createAll(): ICommand[] {
    return Object.keys(COMMAND_MAP).map(CommandFactory.create);
  }
}

