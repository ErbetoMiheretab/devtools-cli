import type { IOutputFormatter, CommandResult } from "../core/interfaces.ts";

class JsonFormatter implements IOutputFormatter {
  format(result: CommandResult): string {
    return JSON.stringify({ ok: true, data: result.data }, null, 2);
  }
}

class TextFormatter implements IOutputFormatter {
  format(result: CommandResult): string {
    const { data } = result;
    if (Array.isArray(data)) return data.join("\n");
    if (typeof data === "object") return JSON.stringify(data, null, 2);
    return String(data);
  }
}

class BinaryFormatter implements IOutputFormatter {
  format(result: CommandResult): string {
    if (result.data instanceof Uint8Array) {
      return Buffer.from(result.data).toString("base64");
    }
    throw new Error("BinaryFormatter expects Uint8Array data");
  }
}

export function getFormatter(
  format: "text" | "json" | "binary",
): IOutputFormatter {
  switch (format) {
    case "json":
      return new JsonFormatter();
    case "binary":
      return new BinaryFormatter();
    case "text":
    default:
      return new TextFormatter();
  }
}
