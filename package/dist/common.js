import { GlobalConfig } from "./config/config";
export class CommonHandler {
    /**
     * Register a custom 404 handler for missing routes
     * @param {Callback} callback - Handler function to execute when no route matches
     * @returns {this} - Returns current instance for chaining
     *
     * @example
     * // Register a custom not-found handler
     * app.notFound((ctx) => {
     *   ctx.status(404).text('Custom not found message');
     * });
     */
    notFound(callback) {
        GlobalConfig.notFound = callback;
        return this;
    }
    onError(callback) {
        GlobalConfig.onError = callback;
        return this;
    }
}
// class T<T> {
//     private data: T;
//     constructor() {
//         this.data = {} as T; // Initialize with an empty object of type T
//     }
//     // Method to set a value
//     set<K extends keyof T>(key: K, value: T[K]): void {
//         this.data[key] = value;
//     }
//     // Method to get a value
//     get<K extends keyof T>(key: K): T[K] | undefined {
//         return this.data[key];
//     }
// }
// // Create an instance of T with a specific type
// const x = new T<{ user: string }>();
// // Set the 'user' property
// x.set('user', 'rakib');
// // Get the 'user' property
// console.log(x.get('user')); // Output: "rakib"
// class T<T extends Record<string,any>> {
//     [key: any extends keyof  T]: T; // Allow dynamic properties
//     constructor() { }
// }
// // Create an instance of T with a specific type
// const x = new T<{ user: string }>();
// // Assign the 'user' property dynamically
// x.user = 'rakib';
// // // Access the 'user' property
// console.log(x.user); // Output: "rakib"
// class T {
//     constructor(data: T) {
//         Object.assign(this, data);
//     }
// }
// type x = T & {
//     user: 5345
// }
// const xx: x = {
//     user: 5345
// }
// class T<T> {
//     constructor(public data: T) { }
// }
// const x = new T<{ user: string }>({ user: 'rakib' });
// x.data.user = 'rakib';
// console.log(x.data.user); // Outputs: rakib
// class T<T extends object> {
//     constructor(data: T) {
//         Object.assign(this, data);
//     }
// }
// const x = new T({ user: 'rakib' }) as T<{ user: string }> & { user: string };
// x.user = 'rakib';
// console.log(x.user); // Outputs: rakib
// const x = new T({ user: 'rakib' }) as T<{ user: string }> & { user: string };
// x.user = 'rakib';
// console.log(x.user); // Outputs:
// class T<T extends Record<string, any>> {
//     private data: T = {} as T;
//     [key: string]: any; // Allows dynamic property assignment
//     set<K extends keyof T>(key: K, value: T[K]): void {
//         this.data[key] = value;
//     }
//     get<K extends keyof T>(key: K): T[K] | undefined {
//         return this.data[key];
//     }
// }
// // ✅ Usage
// const x = new T<{ user: string }>();
// x.user = "rakib"; // ✅ Works
// console.log(x.user); // Output: "rakib"
