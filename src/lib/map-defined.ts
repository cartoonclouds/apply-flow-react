/**
 * Maps an array of items to a new array, filtering out any null or undefined values returned by the mapper function.
 *
 * @param items The array of items to be mapped.
 * @param mapper The mapping function that may return a value or null/undefined.
 * @returns A new array containing only the non-null and non-undefined results of the mapper function.
 */
export function mapDefined<TInput, TOutput>(
  items: readonly TInput[],
  mapper: (item: TInput, index: number) => TOutput | null | undefined,
): Array<NonNullable<TOutput>> {
  return items.reduce<Array<NonNullable<TOutput>>>(
    (accumulator, item, index) => {
      const value = mapper(item, index);

      if (value != null) {
        accumulator.push(value as NonNullable<TOutput>);
      }

      return accumulator;
    },
    [],
  );
}

/**
 * Plucks a property value from each item.
 */
export function pluck<TInput, TKey extends keyof TInput>(
  items: readonly TInput[],
  key: TKey,
): Array<TInput[TKey]> {
  return items.map((item) => item[key]);
}

/**
 * Indexes rows by their id for quick lookups.
 */
export function mapToId<TItem extends { id: TId }, TId extends PropertyKey>(
  items: readonly TItem[],
): Map<TId, TItem> {
  return new Map(items.map((item) => [item.id, item]));
}
