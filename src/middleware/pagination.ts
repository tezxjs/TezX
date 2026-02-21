import { Context, NextCallback } from "../index.js";

export type PaginationOptions<
  DataKey extends string = "data",
  CountKey extends string = "total",
  Item = any,
> = {
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
  countKey?: CountKey;

  /**
   * 📦 Key containing the data array in response
   * @default "data"
   * @example "items" // Process response.items array
   */
  dataKey?: DataKey;

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
  getDataSource?: <T extends Record<string, any> = {}>(
    ctx: Context<T>,
    pagination: { page: number; limit: number; offset: number },
  ) => Promise<
    {
      [K in DataKey]: Item[];
    } & {
      [K in CountKey]: number;
    }
  >;
};

export type PaginationBodyType = {
  [x: string]: any;
  pagination: {
    page: number;
    limit: number;
    totalItems: any;
    offset: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
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
 * @param {PaginationOptions} [options={}] - Configuration options for pagination behavior
 * @returns {Callback} Middleware function that processes pagination and sets response
 *
 * @example
 * // Basic usage
 * app.get('/users', paginationHandler());
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

const paginationHandler = <DataKey extends string = "data", CountKey extends string = "total", Item = any>(options: PaginationOptions<DataKey, CountKey, Item> = {}): any => {
  let {
    defaultPage = 1,
    defaultLimit = 10,
    maxLimit = 100,
    queryKeyPage = "page",
    queryKeyLimit = "limit",
    countKey = "total" as CountKey, // Default key for total count
    dataKey = "data" as DataKey, // Default key for data array
    getDataSource,
  } = options;
  return async function paginationHandler(ctx: Context, next: NextCallback) {
    // Extract pagination parameters from query
    const rawPage = ctx.req.query[queryKeyPage] as string;
    const rawLimit = ctx.req.query[queryKeyLimit] as string;

    // 🔢 Parse and sanitize pagination inputs
    const page = Math.max(parseInt(rawPage || `${defaultPage}`, 10), 1);
    const limit = Math.min(
      Math.max(parseInt(rawLimit || `${defaultLimit}`, 10), 1),
      maxLimit,
    );
    // 📌 Calculate offset and attach pagination context
    const offset = (page - 1) * limit;
    ctx.pagination = {
      page,
      limit,
      offset,
      queryKeyPage,
      queryKeyLimit,
    };

    // 🛠️ Fetch data dynamically if a data source is provided
    if (getDataSource) {
      // 📡 Call the data source function with pagination details
      const dataSourceResponse = await getDataSource(ctx, {
        page,
        limit,
        offset,
      });

      // 📊 Extract total count and data array using specified keys
      const total = dataSourceResponse?.[countKey];
      const data = dataSourceResponse?.[dataKey];

      // 📈 Compute pagination metadata
      const pagination = {
        page,
        limit,
        offset,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      };

      // 📌 Update context with full pagination details
      ctx.pagination = pagination;

      // 📦 Construct response body
      const body = {
        [dataKey]: data, // Use specified dataKey for the data array
        [countKey]: total, // Use specified countKey for the total count
        pagination, // Include pagination metadata
      };
      // 🛠️ Apply custom callback if provided
      ctx.body = body;
      let res = await next() as unknown as Response;
      if (res) {
        return res
      }
      // 📤 Set response body (automatically wrapped as Response)
      return ctx.json(body);
    }
    return await next();
  };
};

export { paginationHandler as default, paginationHandler };

