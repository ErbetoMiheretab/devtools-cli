import { BaseCommand } from "../core/BaseCommand.js";
import type { CommandInput } from "../core/interfaces.js";
import { CLIError } from "../utils/error.js";

export class BaseConverterCommand extends BaseCommand {
  name = "base";
  description = "Convert numbers between different bases (binary, octal, decimal, hex)";

  protected async run(input: CommandInput): Promise<unknown> {
    const text = input.stdin || (input.args.length > 0 ? input.args.join(" ") : "");

    if (!text) {
      throw new CLIError("No input provided. Use --help for usage information.");
    }

    const fromBase = this.parseBase(input.flags.from as string || "10");
    const toBase = this.parseBase(input.flags.to as string || "10");

    // Parse the input number from the source base
    const inputStr = text.trim().replace(/^0x|^0b|^0o/i, "");
    const decimalValue = parseInt(inputStr, fromBase);

    if (isNaN(decimalValue)) {
      throw new CLIError(`Invalid number for base ${fromBase}: ${text}`);
    }

    // Convert to target base
    let result: string;
    switch (toBase) {
      case 2:
        result = `0b${decimalValue.toString(2)}`;
        break;
      case 8:
        result = `0o${decimalValue.toString(8)}`;
        break;
      case 10:
        result = decimalValue.toString(10);
        break;
      case 16:
        result = `0x${decimalValue.toString(16).toUpperCase()}`;
        break;
      default:
        result = decimalValue.toString(toBase);
    }

    if (input.flags.all) {
      return this.convertToAll(decimalValue);
    }

    return result;
  }

  private parseBase(baseStr: string): number {
    const normalized = baseStr.toLowerCase();
    
    switch (normalized) {
      case "bin":
      case "binary":
      case "2":
        return 2;
      case "oct":
      case "octal":
      case "8":
        return 8;
      case "dec":
      case "decimal":
      case "10":
        return 10;
      case "hex":
      case "hexadecimal":
      case "16":
        return 16;
      default:
        const num = parseInt(baseStr, 10);
        if (isNaN(num) || num < 2 || num > 36) {
          throw new CLIError(
            `Invalid base: ${baseStr}. Base must be between 2 and 36, or use: binary, octal, decimal, hex`
          );
        }
        return num;
    }
  }

  private convertToAll(decimal: number): string {
    const binary = `0b${decimal.toString(2)}`;
    const octal = `0o${decimal.toString(8)}`;
    const dec = decimal.toString(10);
    const hex = `0x${decimal.toString(16).toUpperCase()}`;

    return `Binary:      ${binary}\nOctal:       ${octal}\nDecimal:     ${dec}\nHexadecimal: ${hex}`;
  }
}
