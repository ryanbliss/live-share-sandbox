import { SharedString } from "fluid-framework";

export interface IKeyedFile {
  key: string;
  value: SharedString | undefined;
}

export class CodeFilesHelper {
  files: Map<string, SharedString>;
  currentKey: string | undefined;
  constructor(
    files: Map<string, SharedString>,
    currentKey: string | undefined
  ) {
    this.files = files;
    this.currentKey = currentKey;
  }

  get currentFile(): IKeyedFile | undefined {
    if (this.currentKey) {
      return {
        key: this.currentKey,
        value: this.getKeyedFile(this.currentKey),
      };
    }
    return undefined;
  }

  public getKeyedFile(key: string): SharedString | undefined {
    return this.files.get(key);
  }
}
