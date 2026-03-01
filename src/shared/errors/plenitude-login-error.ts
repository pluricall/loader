export class PlenitudeLoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlenitudeLoginError";
  }
}
