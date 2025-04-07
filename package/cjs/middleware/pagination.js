"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationHandler = void 0;
const paginationHandler = (options = {}) => {
    const { defaultPage = 1, defaultLimit = 10, maxLimit = 100, queryKeyPage = "page", queryKeyLimit = "limit", countKey = "total", dataKey = "data", getDataSource, } = options;
    return async (ctx, next) => {
        const rawPage = ctx.req.query[queryKeyPage];
        const rawLimit = ctx.req.query[queryKeyLimit];
        const page = Math.max(parseInt(rawPage || `${defaultPage}`, 10), 1);
        const limit = Math.min(Math.max(parseInt(rawLimit || `${defaultLimit}`, 10), 1), maxLimit);
        const offset = (page - 1) * limit;
        ctx.pagination = {
            page,
            limit,
            offset: offset,
            queryKeyPage,
            queryKeyLimit
        };
        if (getDataSource) {
            try {
                const dataSourceResponse = await getDataSource(ctx, { page, limit, offset });
                const total = dataSourceResponse?.[countKey];
                const data = dataSourceResponse?.[dataKey];
                if (typeof total !== "number" || !Array.isArray(data)) {
                    throw new Error("Invalid data structure returned by getDataSource.");
                }
                ctx.body = {
                    [dataKey]: data,
                    [countKey]: total,
                    pagination: {
                        page,
                        limit,
                        totalItems: total,
                        totalPages: Math.ceil(total / limit),
                        hasNextPage: page < Math.ceil(total / limit),
                        hasPrevPage: page > 1,
                        nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
                        prevPage: page > 1 ? page - 1 : null,
                    },
                };
            }
            catch (error) {
                ctx.setStatus = 500;
                ctx.body = { error: "Internal Server Error", };
                throw new Error("Error fetching or processing data:", error?.message);
            }
        }
        return await next();
    };
};
exports.paginationHandler = paginationHandler;
