export function isUrlValid(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch (error: any) {
    return false;
  }
}
