import { BaseCommand } from "../core/BaseCommand.js";
import type { CommandInput } from "../core/interfaces.js";
import { CLIError } from "../utils/error.js";

export class UrlCommand extends BaseCommand {
  name = "url";
  description = "Encode or decode URL strings (percent encoding)";

  protected async run(input: CommandInput): Promise<unknown> {
    const text = input.stdin || (input.args.length > 0 ? input.args.join(" ") : "");

    if (!text) {
      throw new CLIError("No input provided. Use --help for usage information.");
    }

    try {
      if (input.flags.decode) {
        const decoded = decodeURIComponent(text);
        return decoded;
      }

      // Default: encode
      const encoded = encodeURIComponent(text);
      return encoded;
    } catch (error) {
      throw new CLIError(`Failed to process URL: ${(error as Error).message}`);
    }
  }
}
