export declare class HeadersParser {
  private headers;
  constructor(init?: [string, string | string[]][] | Record<string, string>);
  /**
   * Adds multiple headers to the parser.
   * @param headers - Headers as an array of tuples or a record object.
   */
  add(headers: [string, string | string[]][] | Record<string, string>): this;
  /**
   * Sets a header value.
   * @param key - Header name.
   * @param value - Header value(s).
   */
  set(key: string, value: string | string[]): this;
  clear(): this;
  /**
   * Retrieves the first value of a header.
   * @param key - Header name.
   * @returns The first header value or undefined if not found.
   */
  get(key: string): string | undefined;
  /**
   * Retrieves all values of a header.
   * @param key - Header name.
   * @returns An array of header values.
   */
  getAll(key: string): string[];
  /**
   * Checks if a header exists.
   * @param key - Header name.
   * @returns True if the header exists, false otherwise.
   */
  has(key: string): boolean;
  /**
   * Deletes a header.
   * @param key - Header name.
   * @returns True if deleted successfully, false otherwise.
   */
  delete(key: string): boolean;
  /**
   * Appends a value to an existing header or creates a new one.
   * @param key - Header name.
   * @param value - Value to append.
   */
  append(key: string, value: string): this;
  /**
   * Returns an iterator over header entries.
   * @returns IterableIterator of header key-value pairs.
   */
  entries(): IterableIterator<[string, string[]]>;
  /**
   * Returns an iterator over header keys.
   * @returns IterableIterator of header names.
   */
  keys(): IterableIterator<string>;
  /**
   * Returns an iterator over header values.
   * @returns IterableIterator of header values arrays.
   */
  values(): IterableIterator<string[]>;
  /**
   * Iterates over headers and executes a callback function.
   * @param callback - Function to execute for each header.
   */
  forEach(callback: (value: string[], key: string) => void): void;
  /**
   * Converts headers into a plain object.
   * @returns A record of headers where single-value headers are returned as a string.
   */
  toObject(): Record<string, string | string[]>;
}
