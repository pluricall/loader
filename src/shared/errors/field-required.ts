export class FieldRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FieldRequired";
  }
}
