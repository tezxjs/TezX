/**
 * A simple key-value storage class using Map.
 */
export declare class State {
  private state;
  constructor();
  /**
   * Store a value with a specific key.
   * @param key - The key for the value.
   * @param value - The value to be stored.
   */
  set(key: string, value: any): void;
  /**
   * Retrieve a value by key.
   * @param key - The key of the value to retrieve.
   * @returns The stored value or undefined if not found.
   */
  get(key: string): any | undefined;
  /**
   * Delete a key from storage.
   * @param key - The key to remove.
   * @returns True if the key was deleted, false otherwise.
   */
  delete(key: string): boolean;
  /**
   * Check if a key exists in the storage.
   * @param key - The key to check.
   * @returns True if the key exists, false otherwise.
   */
  has(key: string): boolean;
  /**
   * Get an array of all stored keys.
   * @returns An array of keys.
   */
  keys(): string[];
  /**
   * Get an array of all stored values.
   * @returns An array of values.
   */
  values(): any[];
  /**
   * Get an array of all key-value pairs.
   * @returns An array of [key, value] tuples.
   */
  entries(): [string, any][];
  /**
   * Remove all entries from storage.
   */
  clear(): void;
}
