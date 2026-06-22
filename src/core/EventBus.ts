import chalk from "chalk";

type EventName = "command:start" | "command:success" | "command:error";
type Handler = (payload: unknown) => void;

export class EventBus {
  private static instance = new EventBus();
  private listeners = new Map<EventName, Handler[]>();

  static get() {
    return EventBus.instance;
  }

  on(event: EventName, handler: Handler): void {
    const list = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...list, handler]);
  }

  emit(event: EventName, payload: unknown): void {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }
}

// Wire it up in index.ts
EventBus.get().on("command:error", (err) => {
  console.error(chalk.red("✖"), err);
  process.exit(1);
});
