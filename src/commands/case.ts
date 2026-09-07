import { BaseCommand } from "../core/BaseCommand.js";
import type { CommandInput } from "../core/interfaces.js";
import { CLIError } from "../utils/error.js";

export class CaseCommand extends BaseCommand {
  name = "case";
  description = "Convert text between different cases (upper, lower, title, snake, camel, etc.)";

  protected async run(input: CommandInput): Promise<unknown> {
    const text = input.stdin || (input.args.length > 0 ? input.args.join(" ") : "");

    if (!text) {
      throw new CLIError("No input provided. Use --help for usage information.");
    }

    const format = (input.flags.format as string) || "upper";

    switch (format.toLowerCase()) {
      case "upper":
        return text.toUpperCase();
      
      case "lower":
        return text.toLowerCase();
      
      case "title":
        return this.toTitleCase(text);
      
      case "snake":
        return this.toSnakeCase(text);
      
      case "kebab":
        return this.toKebabCase(text);
      
      case "camel":
        return this.toCamelCase(text);
      
      case "pascal":
        return this.toPascalCase(text);
      
      case "constant":
        return this.toConstantCase(text);
      
      default:
        throw new CLIError(
          `Unknown format: ${format}. Valid formats: upper, lower, title, snake, kebab, camel, pascal, constant`
        );
    }
  }

  private toTitleCase(text: string): string {
    return text
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private toSnakeCase(text: string): string {
    return text
      .trim()
      .replace(/['\u2019]/g, "") // Remove apostrophes
      .replace(/[^a-zA-Z0-9]+/g, "_") // Replace non-alphanumeric with underscore
      .replace(/([a-z])([A-Z])/g, "$1_$2") // Handle camelCase
      .toLowerCase()
      .replace(/^_+|_+$/g, ""); // Trim underscores
  }

  private toKebabCase(text: string): string {
    return text
      .trim()
      .replace(/['\u2019]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase()
      .replace(/^-+|-+$/g, "");
  }

  private toCamelCase(text: string): string {
    const words = text
      .trim()
      .replace(/['\u2019]/g, "")
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean);
    
    if (words.length === 0) return "";
    
    return words[0].toLowerCase() + 
      words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  }

  private toPascalCase(text: string): string {
    const words = text
      .trim()
      .replace(/['\u2019]/g, "")
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean);
    
    return words
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");
  }

  private toConstantCase(text: string): string {
    return this.toSnakeCase(text).toUpperCase();
  }
}
