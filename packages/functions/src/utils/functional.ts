export const tap = (fn: Function) => (...args: any[]) => {
  console.log(...args);
  return fn(...args);
};
