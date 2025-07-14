export type RecordItems<K extends string, V> = [K, V][];

/** Ordered record, basically a record + ordering */
export type OrderedRecord<K extends string, V> = {
  __record: Record<K, V>,
  __order: K[],
  get: (key: K) => V,
  set: (key: K, value: V) => void,
  keys: () => K[],
  values: () => V[],
  items: () => RecordItems<K, V>,
  filter: (fn: (key: K, value: V) => boolean) => OrderedRecord<K, V>,
  map: <T>(fn: (key: K, value: V) => T) => OrderedRecord<K, T>,
};

/** Create an ordered record from a record and an array of key names */
export function fromRecord<K extends string, V>(record: Record<K, V>, order: K[]): OrderedRecord<K, V> {
  const values = () => order.map(k => record[k]);
  const items: () => RecordItems<K, V> = () => order.map(k => [k, record[k]]);
  const map: OrderedRecord<K, V>['map'] = fn => fromRecord(
    // @ts-expect-error -- Object.fromEntries produces a Record<string, T>
    // instead of a Record<K, T>, but since we can't introduce the type var T
    // in a way that allows us to use it in this expression, there is no way
    // for us to cast it to the correct type. Therefore, we just need to
    // silence the error. Yucky.
    Object.fromEntries(
      items().map(([k, v]) => [k, fn(k, v)]),
    ),
    order,
  );
  const filter: OrderedRecord<K, V>['filter'] = (fn) => {
    const filtered = items().filter(([k, v]) => fn(k, v));
    return fromRecord(
      Object.fromEntries(
        filtered,
      ) as Record<K, V>,
      filtered.map(([k]) => k),
    );
  };
  return {
    __record: record,
    __order: order,
    get: k => record[k],
    set: (k, v) => { record[k] = v },
    keys: () => order,
    values,
    items,
    map,
    filter,
  };
}

/** Create an ordered record from an array of key-value pairs */
export function fromItems<K extends string, V>(items: RecordItems<K, V>): OrderedRecord<K, V> {
  const order = items.map(([k]) => k);
  const record = Object.fromEntries(items) as Record<K, V>;
  return fromRecord(record, order);
}

export default {
  fromRecord,
  fromItems,
};
