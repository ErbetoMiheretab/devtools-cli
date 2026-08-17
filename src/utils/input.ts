import * as fs from "fs/promises";
import * as path from "path";
import type { IInputReader, InputSource } from "../core/interfaces";

export class InputReader implements IInputReader {
  async read(source: InputSource): Promise<string> {
    switch (source.type) {
      case "arg":
        return source.value;
      case "file": {
        // Sanitize the file path to prevent directory traversal vulnerabilities if untrusted
        // TODO(security): If this CLI runs in a shared environment, restrict the paths allowed.
        const safePath = path.resolve(source.path);
        try {
          return await fs.readFile(safePath, "utf-8");
        } catch (error) {
          throw new Error(
            `Failed to read file at ${safePath}: ${(error as Error).message}`,
          );
        }
      }
      case "stdin":
        return new Promise<string>((resolve, reject) => {
          if (process.stdin.isTTY) {
            resolve("");
            return;
          }
          const chunks: Buffer[] = [];
          // Removed setEncoding so chunks remain as raw binary Buffers
          process.stdin.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
          });
          process.stdin.on("end", () => {
            // Concatenate all binary chunks into a single buffer before decoding
            const fullBuffer = Buffer.concat(chunks);
            resolve(fullBuffer.toString("utf-8").trim());
          });
          process.stdin.on("error", (err: Error) => {
            reject(new Error(`Failed to read from stdin: ${err.message}`));
          });
        });
      default:
        throw new Error(`Unsupported input source type`);
    }
  }
}
