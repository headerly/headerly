export function getObjectKeysWithTypeAssert<T extends object>(value: T) {
  return Object.keys(value) as Array<keyof T>;
}
