export class State {
  state;
  constructor() {
    this.state = new Map();
  }
  set(key, value) {
    this.state.set(key, value);
  }
  get(key) {
    return this.state.get(key);
  }
  delete(key) {
    return this.state.delete(key);
  }
  has(key) {
    return this.state.has(key);
  }
  keys() {
    return Array.from(this.state.keys());
  }
  values() {
    return Array.from(this.state.values());
  }
  entries() {
    return Array.from(this.state.entries());
  }
  clear() {
    this.state.clear();
  }
}
