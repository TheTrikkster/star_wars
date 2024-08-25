import { createSelector } from 'reselect';
import { RootState } from '../redux/store';

export const getCookie = (): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; session=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
};

export const makeSelectFieldsWithKeys = <
  T extends Record<string, (state: RootState) => unknown>,
>(
  fieldSelectors: T,
) => {
  return createSelector(
    Object.values(fieldSelectors),
    (...fields: unknown[]) => {
      const result: { [K in keyof T]: ReturnType<T[K]> } = {} as {
        [K in keyof T]: ReturnType<T[K]>;
      };
      Object.keys(fieldSelectors).forEach((key, index) => {
        result[key as keyof T] = fields[index] as ReturnType<T[typeof key]>;
      });
      return result;
    },
  );
};

export const debounce = (
  func: (event: React.KeyboardEvent<HTMLInputElement>) => void,
  delay: number,
) => {
  let timeoutId: NodeJS.Timeout;

  return function (
    this: void,
    ...args: [React.KeyboardEvent<HTMLInputElement>]
  ) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};
