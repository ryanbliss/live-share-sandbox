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
  private _userId: string;
  private _name: string;
  private _decorations: string[] = [];
  constructor(
    selection: ISelection,
    color: string,
    userId: string,
    name: string
  ) {
    this._selection = selection;
    this._color = color;
    this._userId = userId;
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

  public get userId(): string {
    return this._userId;
  }

  public get name(): string {
    return this._name;
  }

  public get decorations(): string[] {
    return this._decorations;
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

  public set decorations(value: string[]) {
    this._decorations = value;
  }

  /*
    Functions
   */

  public static fromUser(user: IUser): Cursor | undefined {
    if (!user.cursor) {
      return undefined;
    }
    return new Cursor(
      user.cursor!.selection,
      user.cursor!.color,
      user.userId,
      user.name
    );
  }

  public toJson(): ICursor {
    return {
      selection: this.selection,
      color: this.color,
    };
  }
}
