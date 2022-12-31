import { CursorColorType } from "../../../../../../models";

export function getRandomCursorColor(): CursorColorType {
  const colors = Object.keys(CursorColorType).filter((item) => {
    return isNaN(Number(item));
  });
  const randomIndex = Math.floor(Math.random() * colors.length);
  const color = colors[randomIndex] as CursorColorType;
  return color;
}
