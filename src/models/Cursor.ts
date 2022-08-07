import { IUser } from "./IUser";

export interface ISelection {
  start: number;
  end: number;
}

export enum CursorColorType {
  red = "red",
  blue = "blue",
  green = "green",
  orange = "orange",
  yellow = "yellow",
  purple = "purple",
  pink = "pink",
}

export interface ICursor {
  // selection range of cursor
  selection: ISelection | undefined;
  // color to render cursor as
  color: CursorColorType;
}

export class Cursor implements ICursor {
  private _selection: ISelection | undefined;
  private _color: CursorColorType;
  private _userId: string;
  private _name: string;
  private _decorations: string[] = [];
  private _pageKey: string | undefined;
  constructor(
    selection: ISelection | undefined,
    color: CursorColorType,
    userId: string,
    name: string,
    pageKey: string | undefined
  ) {
    this._selection = selection;
    this._color = color;
    this._userId = userId;
    this._name = name;
    this._pageKey = pageKey;
  }

  /*
    Getters
   */

  public get selection(): ISelection | undefined {
    return this._selection;
  }

  public get color(): CursorColorType {
    return this._color;
  }

  public get userId(): string {
    return this._userId;
  }

  public get name(): string {
    return this._name;
  }

  public get pageKey(): string | undefined {
    return this._pageKey;
  }

  public get decorations(): string[] {
    return this._decorations;
  }

  /*
    Setters
   */

  public set selection(value: ISelection | undefined) {
    this._selection = value;
  }

  public set color(value: CursorColorType) {
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
      user.name,
      user.currentPageKey
    );
  }

  public toJson(): ICursor {
    return {
      selection: this.selection,
      color: this.color,
    };
  }
}
