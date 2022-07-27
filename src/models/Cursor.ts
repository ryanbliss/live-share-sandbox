import { IUser } from "./IUser";

export interface ISelection {
  start: number;
  end: number;
}

export interface ICursor {
  // selection range of cursor
  selection: ISelection;
  // color to render cursor as
  color: string;
}

export class Cursor implements ICursor {
  private _selection: ISelection;
  private _color: string;
  private _name: string;
  constructor(selection: ISelection, color: string, name: string) {
    this._selection = selection;
    this._color = color;
    this._name = name;
  }

  /*
    Getters
   */

  public get selection(): ISelection {
    return this._selection;
  }

  public get color(): string {
    return this._color;
  }

  public get name(): string {
    return this._name;
  }

  /*
    Setters
   */

  public set selection(value: ISelection) {
    this._selection = value;
  }

  public set color(value: string) {
    this._color = value;
  }

  /*
    Functions
   */

  public static fromUser(user: IUser): Cursor | undefined {
    if (!user.cursor) {
      return undefined;
    }
    return new Cursor(user.cursor!.selection, user.cursor!.color, user.name);
  }

  public toJson(): ICursor {
    return {
      selection: this.selection,
      color: this.color,
    };
  }
}
