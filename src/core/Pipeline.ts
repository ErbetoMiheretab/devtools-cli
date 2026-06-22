export interface PipelineHandler<T> {
  setNext(handler: PipelineHandler<T>): PipelineHandler<T>;
  handle(input: T): Promise<T>;
}

export abstract class AbstractHandler<T> implements PipelineHandler<T> {
  private next?: PipelineHandler<T>;

  setNext(handler: PipelineHandler<T>): PipelineHandler<T> {
    this.next = handler;
    return handler;
  }
  async handle(input: T): Promise<T> {
    if (this.next) return this.next.handle(input);
    return input;
  }
}

//Jsont formatter pipeline

class ParseJsonHandler extends AbstractHandler<string> {
  async handle(input: string): Promise<string> {
    JSON.parse(input);
    return super.handle(input);
  }
}

class PrettyPrintHandler extends AbstractHandler<string> {
  async handle(input: string): Promise<string> {
    const parsed = JSON.parse(input);
    const pretty = JSON.stringify(parsed, null, 2);
    return super.handle(pretty);
  }
}
