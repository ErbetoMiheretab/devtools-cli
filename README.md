# DevTools CLI

A collection of developer utilities accessible from the command line.

## Installation

```bash
pnpm install
pnpm build
```

## Usage

### Development Mode
```bash
pnpm dev <command> [options]
```

### Production Mode
```bash
node dist/index.js <command> [options]
```

Or install globally:
```bash
pnpm link --global
devtools <command> [options]
```

## Available Commands

###  UUID Generator
Generate UUID v4 values.

```bash
devtools uuid              # Generate 1 UUID
devtools uuid -c 5         # Generate 5 UUIDs
devtools uuid --json       # Output as JSON
```

###  Base64 Encoder/Decoder
Encode strings to base64 or decode base64 strings.

```bash
devtools base64 "hello world"           # Encode to base64
devtools base64 "aGVsbG8gd29ybGQ=" -d  # Decode from base64
echo "data" | devtools base64           # From stdin
devtools base64 "test" --json           # JSON output
```

###  Hash Generator
Generate hash digests using various algorithms (MD5, SHA-1, SHA-256, SHA-512).

```bash
devtools hash "text"                    # SHA-256 (default)
devtools hash "text" --algorithm md5    # MD5 hash
devtools hash "text" --algorithm sha1   # SHA-1 hash
devtools hash "text" --algorithm sha512 # SHA-512 hash
echo "data" | devtools hash             # From stdin
```

###  URL Encoder/Decoder
Encode strings to URL-safe format or decode percent-encoded URLs.

```bash
devtools url "hello world"         # Encode to URL-safe format
devtools url "hello%20world" -d    # Decode from URL-safe format
echo "data" | devtools url         # From stdin
```


## Architecture

The CLI follows a modular architecture:

- **Commands** (`src/commands/`) - Individual tool implementations
- **Core** (`src/core/`) - Base classes and infrastructure
  - `BaseCommand` - Template method pattern for consistent command execution
  - `CommandFactory` - Factory pattern for command instantiation
  - `ToolRegistry` - Registry pattern for command management
- **Utils** (`src/utils/`) - Shared utilities for I/O, formatting, and error handling

## Development

### Adding a New Command

1. Create a new file in `src/commands/` (e.g., `base64.ts`)
2. Extend `BaseCommand` and implement the `run()` method
3. Register the command in `src/core/CommandFactory.ts`
4. Add the CLI interface in `src/index.ts`

Example:
```typescript
// src/commands/base64.ts
import { BaseCommand } from "../core/BaseCommand.js";
import type { CommandInput } from "../core/interfaces.js";

export class Base64Command extends BaseCommand {
  name = "base64";
  description = "Encode or decode base64 strings";

  protected async run(input: CommandInput): Promise<unknown> {
    const text = input.stdin || input.args[0];
    if (input.flags.decode) {
      return Buffer.from(text, "base64").toString("utf-8");
    }
    return Buffer.from(text).toString("base64");
  }
}
```

### Build Scripts

- `pnpm build` - Build for production
- `pnpm dev` - Run in development mode
- `pnpm test` - Run tests
- `pnpm test:run` - Run tests once (non-watch mode)

## License

ISC
