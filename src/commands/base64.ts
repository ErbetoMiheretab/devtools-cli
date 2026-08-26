import { BaseCommand } from "../core/BaseCommand.js";
import type { CommandInput } from "../core/interfaces.js";
import { CLIError } from "../utils/error.js";

export class Base64Command extends BaseCommand {
  name = "base64";
  description = "Encode or decode base64 strings";

  protected async run(input: CommandInput): Promise<unknown> {
    const text = input.stdin || (input.args.length > 0 ? input.args.join(" ") : "");

    if (!text) {
      throw new CLIError("No input provided. Use --help for usage information.");
    }

    if (input.flags.decode) {
      try {
        const decoded = Buffer.from(text, "base64").toString("utf-8");
        return decoded;
      } catch (error) {
        throw new CLIError("Invalid base64 input");
      }
    }

    // Default: encode
    const encoded = Buffer.from(text).toString("base64");
    return encoded;
  }
}
