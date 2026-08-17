import type { ICommand, CommandInput, CommandResult } from "./interfaces.ts";

export abstract class BaseCommand implements ICommand {
  abstract name: string;
  abstract description: string;

  // Template Method
  async execute(input: CommandInput): Promise<CommandResult> {
    const validated = await this.validate(input);
    const data = await this.run(validated);

    return { data, format: this.outputFormat() };
  }

  //Hook Methods- subclasses override these

  protected async validate(input: CommandInput): Promise<CommandInput> {
    return input; // default: pass-through
  }
  protected abstract run(input: CommandInput): Promise<unknown>;

  protected outputFormat(): "text" | "json" | "binary" {
    return "text";
  }
}
