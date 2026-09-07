import { BaseCommand } from "../core/BaseCommand.js";
import type { CommandInput } from "../core/interfaces.js";
import { CLIError } from "../utils/error.js";

export class TimestampCommand extends BaseCommand {
  name = "timestamp";
  description = "Convert between Unix timestamps and human-readable dates";

  protected async run(input: CommandInput): Promise<unknown> {
    const text = input.stdin || (input.args.length > 0 ? input.args.join(" ") : "");

    // If no input, return current timestamp
    if (!text) {
      if (input.flags.toHuman) {
        return this.formatDate(new Date());
      }
      return this.getCurrentTimestamp(input.flags.unit as string);
    }

    // Convert TO human-readable
    if (input.flags.toHuman) {
      const timestamp = this.parseTimestamp(text, input.flags.unit as string);
      return this.formatDate(timestamp);
    }

    // Convert FROM human-readable TO timestamp
    const date = new Date(text);
    if (isNaN(date.getTime())) {
      throw new CLIError(`Invalid date format: ${text}`);
    }

    return this.formatTimestamp(date, input.flags.unit as string);
  }

  private getCurrentTimestamp(unit?: string): number {
    const now = Date.now();
    switch (unit) {
      case "ms":
      case "milliseconds":
        return now;
      case "s":
      case "seconds":
      default:
        return Math.floor(now / 1000);
    }
  }

  private parseTimestamp(text: string, unit?: string): Date {
    const num = parseFloat(text.trim());
    if (isNaN(num)) {
      throw new CLIError(`Invalid timestamp: ${text}`);
    }

    let milliseconds: number;
    switch (unit) {
      case "ms":
      case "milliseconds":
        milliseconds = num;
        break;
      case "s":
      case "seconds":
      default:
        milliseconds = num * 1000;
        break;
    }

    const date = new Date(milliseconds);
    if (isNaN(date.getTime())) {
      throw new CLIError(`Invalid timestamp value: ${text}`);
    }

    return date;
  }

  private formatTimestamp(date: Date, unit?: string): number {
    const time = date.getTime();
    switch (unit) {
      case "ms":
      case "milliseconds":
        return time;
      case "s":
      case "seconds":
      default:
        return Math.floor(time / 1000);
    }
  }

  private formatDate(date: Date): string {
    // ISO 8601 format with timezone
    const iso = date.toISOString();
    const local = date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    return `${iso}\n${local}`;
  }
}
