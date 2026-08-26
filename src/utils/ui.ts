import pc from "picocolors";

// ─── Banner ────────────────────────────────────────────────────────────────

export function printBanner(): void {
  const title = pc.bold(pc.cyan("DevTools CLI"));
  const version = pc.dim("v1.0.0");
  const tagline = pc.dim("A collection of developer utilities");

  process.stderr.write(`\n  ${title}  ${version}\n  ${tagline}\n\n`);
}

// ─── Command Table ─────────────────────────────────────────────────────────

export function printCommandTable(
  commands: { name: string; description: string; usage?: string }[]
): void {
  const nameWidth = Math.max(...commands.map((c) => c.name.length), 8);

  process.stderr.write(
    `  ${pc.bold(pc.underline("Commands"))}\n\n`
  );

  for (const cmd of commands) {
    const name = pc.cyan(cmd.name.padEnd(nameWidth));
    const desc = pc.dim(cmd.description);
    process.stderr.write(`    ${name}  ${desc}\n`);
    if (cmd.usage) {
      process.stderr.write(
        `    ${" ".repeat(nameWidth)}  ${pc.dim("e.g. " + cmd.usage)}\n`
      );
    }
  }

  process.stderr.write(`\n`);
}

// ─── Usage hint ────────────────────────────────────────────────────────────

export function printUsageHint(commandName?: string): void {
  const cmd = commandName ? `devtools ${commandName} --help` : "devtools --help";
  process.stderr.write(
    `\n  ${pc.dim("→ Run")} ${pc.cyan(cmd)} ${pc.dim("for usage details.\n\n")}`
  );
}

// ─── Result display ────────────────────────────────────────────────────────

/**
 * Print a styled success result to stdout.
 * For piping, the raw value goes to stdout; labels go to stderr.
 */
export function printResult(label: string, value: string): void {
  process.stderr.write(
    `\n  ${pc.green("✔")} ${pc.bold(label)}\n`
  );
  process.stdout.write(value + "\n");
}

export function printResultLines(label: string, lines: string[]): void {
  process.stderr.write(
    `\n  ${pc.green("✔")} ${pc.bold(label)}  ${pc.dim(`(${lines.length})`)}\n\n`
  );
  for (const line of lines) {
    process.stdout.write(`  ${pc.cyan("·")} ${line}\n`);
  }
}

// ─── Error ─────────────────────────────────────────────────────────────────

export function printError(message: string, hint?: string): void {
  process.stderr.write(`\n  ${pc.red("✖")} ${pc.bold(pc.red(message))}\n`);
  if (hint) {
    process.stderr.write(`  ${pc.dim("→ " + hint)}\n`);
  }
  process.stderr.write("\n");
}
