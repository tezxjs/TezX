import { Context, Middleware } from "..";
export type PaginationOptions = {
    /**
     * 🔢 Default page number when not specified
     * @default 1
     * @example 1 // Start from first page
     */
    defaultPage?: number;
    /**
     * 📏 Default items per page
     * @default 10
     * @example 25 // Show 25 items by default
     */
    defaultLimit?: number;
    /**
     * ⚠️ Maximum allowed items per page
     * @default 100
     * @example 50 // Never return more than 50 items
     */
    maxLimit?: number;
    /**
     * 🔍 Query parameter name for page number
     * @default "page"
     * @example "p" // Use ?p=2 instead of ?page=2
     */
    queryKeyPage?: string;
    /**
     * 🔍 Query parameter name for items limit
     * @default "limit"
     * @example "size" // Use ?size=20
     */
    queryKeyLimit?: string;
    /**
     * 📊 Key to read total count from response
     * @default "total"
     * @example "totalCount" // Read from response.totalCount
     */
    countKey?: string;
    /**
     * 📦 Key containing the data array in response
     * @default "data"
     * @example "items" // Process response.items array
     */
    dataKey?: string;
    /**
     * 🛠️ Function to fetch data dynamically
     * @param ctx - Request context
     * @param pagination - Pagination details
     * @returns Promise with data and total count
     * @example
     * getDataSource: async (ctx, { page, limit }) => {
     *   return db.find().skip((page-1)*limit).limit(limit);
     * }
     */
    getDataSource?: (ctx: Context, pagination: {
        page: number;
        limit: number;
        offset: number;
    }) => Promise<{
        [key: string]: any;
    }>;
};
/**
 * 🗂️ Advanced pagination middleware with dynamic data fetching
 *
 * Features:
 * - Automatic pagination parameter handling
 * - Dynamic data source integration
 * - Comprehensive pagination metadata
 * - Built-in error handling
 *
 * @param {PaginationOptions} [options={}] - Configuration options
 * @returns {Middleware} Configured middleware
 *
 * @example
 * // Basic usage
 * app.get('/users', paginationHandler(), getUsers);
 *
 * // With dynamic data source
 * app.get('/products', paginationHandler({
 *   getDataSource: async (ctx, { page, limit }) => {
 *     return await Product.findAndCountAll({
 *       offset: (page-1)*limit,
 *       limit
 *     });
 *   }
 * }));
 */
export declare const paginationHandler: (options?: PaginationOptions) => Middleware;
