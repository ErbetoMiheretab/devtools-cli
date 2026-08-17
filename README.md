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

### ✅ UUID Generator
Generate UUID v4 values.

```bash
devtools uuid              # Generate 1 UUID
devtools uuid -c 5         # Generate 5 UUIDs
devtools uuid --json       # Output as JSON
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
