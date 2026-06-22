import chalk from "chalk";

export class CLIError extends Error {
  constructor(message: string, public readonly exitCode: number = 1) {
    super(message);
    this.name = "CLIError";
  }
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return chalk.red(error.message);
  }
  return chalk.red(String(error));
}

export function handleError(error: unknown): void {
  console.error(chalk.red("✖"), formatError(error));
  const exitCode = error instanceof CLIError ? error.exitCode : 1;
  process.exit(exitCode);
}
