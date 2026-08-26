import { createHash } from "crypto";
import { BaseCommand } from "../core/BaseCommand.js";
import type { CommandInput } from "../core/interfaces.js";
import { CLIError } from "../utils/error.js";

type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";

export class HashCommand extends BaseCommand {
  name = "hash";
  description = "Generate hash digests (MD5, SHA-1, SHA-256, SHA-512)";

  protected async run(input: CommandInput): Promise<unknown> {
    const text = input.stdin || (input.args.length > 0 ? input.args.join(" ") : "");

    if (!text) {
      throw new CLIError("No input provided. Use --help for usage information.");
    }

    const algorithm = (input.flags.algorithm || "sha256") as HashAlgorithm;
    const validAlgorithms: HashAlgorithm[] = ["md5", "sha1", "sha256", "sha512"];

    if (!validAlgorithms.includes(algorithm)) {
      throw new CLIError(
        `Invalid algorithm "${algorithm}". Supported: ${validAlgorithms.join(", ")}`
      );
    }

    try {
      const hash = createHash(algorithm).update(text).digest("hex");
      return {
        hash,
        algorithm,
        input: input.flags.showInput ? text : undefined,
      };
    } catch (error) {
      throw new CLIError(`Failed to generate hash: ${(error as Error).message}`);
    }
  }

  protected outputFormat(): "text" | "json" | "binary" {
    return "text";
  }
}
