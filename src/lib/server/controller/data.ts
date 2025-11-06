/**
 * Data controller. Controls interaction with Minifolio's repository data.
 */

export class DataController {
  /** Root of Minifolio's data */
  #dataRoot: string;

  constructor(dataRoot: string) {
    this.#dataRoot = dataRoot;
  }
}
