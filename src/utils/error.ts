import chalk from "chalk";

export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  PERMISSION = "PERMISSION_DENIED",
  NETWORK = "NETWORK_ERROR",
  INTERNAL = "INTERNAL_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

export interface ErrorResponse {
  success: false;
  error: {
    type: ErrorType;
    message: string;
    code: number;
    timestamp: string;
    details?: Record<string, unknown>;
  };
}

export class CLIError extends Error {
  public readonly type: ErrorType;
  public readonly exitCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      type?: ErrorType;
      exitCode?: number;
      details?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    this.name = "CLIError";
    this.type = options.type ?? ErrorType.INTERNAL;
    this.exitCode = options.exitCode ?? getExitCodeForType(this.type);
    this.details = options.details;
    Object.setPrototypeOf(this, CLIError.prototype);
  }

  toJSON(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        code: this.exitCode,
        timestamp: new Date().toISOString(),
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export class ValidationError extends CLIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      type: ErrorType.VALIDATION,
      exitCode: 2,
      details,
    });
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends CLIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      type: ErrorType.NOT_FOUND,
      exitCode: 3,
      details,
    });
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class PermissionError extends CLIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      type: ErrorType.PERMISSION,
      exitCode: 4,
      details,
    });
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

export class NetworkError extends CLIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      type: ErrorType.NETWORK,
      exitCode: 5,
      details,
    });
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

function getExitCodeForType(type: ErrorType): number {
  const exitCodes: Record<ErrorType, number> = {
    [ErrorType.VALIDATION]: 2,
    [ErrorType.NOT_FOUND]: 3,
    [ErrorType.PERMISSION]: 4,
    [ErrorType.NETWORK]: 5,
    [ErrorType.INTERNAL]: 1,
    [ErrorType.UNKNOWN]: 1,
  };
  return exitCodes[type] ?? 1;
}

export function formatError(error: unknown): string {
  if (error instanceof CLIError) {
    const prefix = chalk.red("✖");
    const message = chalk.red(error.message);
    const type = chalk.dim(`[${error.type}]`);
    return `${prefix} ${message} ${type}`;
  }
  if (error instanceof Error) {
    return chalk.red(`✖ ${error.message}`);
  }
  return chalk.red(`✖ ${String(error)}`);
}

export function handleError(error: unknown, options: { json?: boolean } = {}): void {
  if (options.json) {
    if (error instanceof CLIError) {
      console.error(JSON.stringify(error.toJSON(), null, 2));
    } else {
      console.error(
        JSON.stringify(
          {
            success: false,
            error: {
              type: ErrorType.UNKNOWN,
              message: error instanceof Error ? error.message : String(error),
              code: 1,
              timestamp: new Date().toISOString(),
            },
          },
          null,
          2
        )
      );
    }
  } else {
    console.error(formatError(error));
    if (error instanceof CLIError && error.details) {
      console.error(chalk.dim("Details:"), JSON.stringify(error.details, null, 2));
    }
  }

  const exitCode = error instanceof CLIError ? error.exitCode : 1;
  process.exit(exitCode);
}
