/**
 * A simple key-value storage class using Map.
 */
export class State {
    constructor() {
        // Initialize the storage as a Map
        this.state = new Map();
    }
    /**
     * Store a value with a specific key.
     * @param key - The key for the value.
     * @param value - The value to be stored.
     */
    set(key, value) {
        this.state.set(key, value);
    }
    /**
     * Retrieve a value by key.
     * @param key - The key of the value to retrieve.
     * @returns The stored value or undefined if not found.
     */
    get(key) {
        return this.state.get(key);
    }
    /**
     * Delete a key from storage.
     * @param key - The key to remove.
     * @returns True if the key was deleted, false otherwise.
     */
    delete(key) {
        return this.state.delete(key);
    }
    /**
     * Check if a key exists in the storage.
     * @param key - The key to check.
     * @returns True if the key exists, false otherwise.
     */
    has(key) {
        return this.state.has(key);
    }
    /**
     * Get an array of all stored keys.
     * @returns An array of keys.
     */
    keys() {
        return Array.from(this.state.keys());
    }
    /**
     * Get an array of all stored values.
     * @returns An array of values.
     */
    values() {
        return Array.from(this.state.values());
    }
    /**
     * Get an array of all key-value pairs.
     * @returns An array of [key, value] tuples.
     */
    entries() {
        return Array.from(this.state.entries());
    }
    /**
     * Remove all entries from storage.
     */
    clear() {
        this.state.clear();
    }
}
