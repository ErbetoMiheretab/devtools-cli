export interface ICommand {
  name: string;
  description: string;
  execute(input: CommandInput): Promise<CommandResult>;
}

export interface CommandInput {
  args: string[];
  flags: Record<string, unknown>;
  stdin?: string;
}

export interface CommandResult {
  data: unknown;
  format: "text" | "json" | "binary";
}

export interface IOutputFormatter {
  format(result: CommandResult): string;
}

export interface IInputReader {
  read(source: InputSource): Promise<string>;
}

export type InputSource =
  | { type: "arg"; value: string }
  | { type: "stdin" }
  | { type: "file"; path: string };
