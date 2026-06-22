import type { IOutoutFormatter, CommandResult } from "../core/interfaces";

class jsonFormatter implements IOutoutFormatter {
  format(result: CommandResult): string {
    return JSON.stringify({ ok: true, data: result.data }, null, 2);
  }
}

class TextFormatter implements IOutoutFormatter {
  format(result: CommandResult): string {
    const { data } = result;
    if (Array.isArray(data)) return data.join("\n");
    if (typeof data === "object") return JSON.stringify(data, null, 2);
    return String(data);
  }
}

export function getFormatter(useJson: boolean): IOutoutFormatter {
  return useJson ? new jsonFormatter() : new TextFormatter();
}
