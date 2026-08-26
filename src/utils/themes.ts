import pc from "picocolors";

export const theme = {
  success:  (msg: string) => pc.green(msg),
  error:    (msg: string) => pc.red(msg),
  warn:     (msg: string) => pc.yellow(msg),
  info:     (msg: string) => pc.cyan(msg),
  dim:      (msg: string) => pc.dim(msg),
  heading:  (msg: string) => pc.bold(pc.underline(msg)),
  accent:   (msg: string) => pc.magenta(msg),
  label:    (msg: string) => pc.bold(msg),
  muted:    (msg: string) => pc.dim(pc.gray(msg)),
  icon: {
    success: pc.green("✔"),
    error:   pc.red("✖"),
    warn:    pc.yellow("⚠"),
    info:    pc.cyan("ℹ"),
    bullet:  pc.cyan("·"),
  },
};