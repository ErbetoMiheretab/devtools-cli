import * as fs from "fs/promises";
import * as path from "path";
import type { IInputReader, InputSource } from "../core/interfaces";

/**
 * Resolves a user-provided path and verifies it stays within an allowed directory.
 */

export async function getSafePath(
  userPath: string,
  baseDir: string = process.cwd(),
): Promise<string> {
  //Resolve absolute paths for the base and target
  const safeBase = path.resolve(baseDir);
  const targetPath = path.resolve(safeBase, userPath);

  //Append path separator to prevent partial folder name matches
  // (e.g., preventing /var/app/data-secret from matching /var/app/data)
  const safePrefix = safeBase.endsWith(path.sep)
    ? safeBase
    : safeBase + path.sep;

  //Verify target path is inside safeBase
  if (!targetPath.startsWith(safePrefix) && targetPath !== safeBase) {
    throw new Error(`Access denied: Directory traversal detected.`);
  }

  //Resolve symlinks to prevent symlink traversal bypasses
  try {
    const realTargetPath = await fs.realpath(targetPath);
    const realSafeBase = await fs.realpath(safeBase);
    const realSafePrefix = realSafeBase.endsWith(path.sep)
      ? realSafeBase
      : realSafeBase + path.sep;

    if (
      !realTargetPath.startsWith(realSafePrefix) &&
      realTargetPath !== realSafeBase
    ) {
      throw new Error(
        `Access denied: Symlink points outside allowed directory.`,
      );
    }

    return realTargetPath;
  } catch (error) {
    // Re-throw traversal errors; let missing files propagate to normal file handling
    if ((error as Error).message.startsWith("Access denied")) {
      throw error;
    }
    return targetPath;
  }
}

export class InputReader implements IInputReader {
  async read(source: InputSource): Promise<string> {
    switch (source.type) {
      case "arg":
        return source.value;

      case "file": {
        try {
          // Restricts file reads to current working directory (or pass a specific allowed root)
          const safePath = await getSafePath(source.path, process.cwd());
          return await fs.readFile(safePath, "utf-8");
        } catch (error) {
          throw new Error(
            `Failed to read file at ${source.path}: ${(error as Error).message}`,
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
