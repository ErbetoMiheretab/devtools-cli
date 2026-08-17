import type { ICommand } from "./interfaces.ts";

export class ToolRegistry {
  private static instance: ToolRegistry;
  private commands = new Map<string, ICommand>();

  private constructor() {}

  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  register(command: ICommand): void {
    if (this.commands.has(command.name)) {
      throw new Error(`Command "${command.name}" is already registered `);
    }
    this.commands.set(command.name, command);
  }
  get(name: string): ICommand {
    const cmd = this.commands.get(name);
    if (!cmd) throw new Error(`Unknown command: "${name}"`);
    return cmd;
  }
  getAll(): ICommand[] {
    return Array.from(this.commands.values());
  }
}
