const paginationHandler = (options = {}) => {
    let { defaultPage = 1, defaultLimit = 10, maxLimit = 100, queryKeyPage = "page", queryKeyLimit = "limit", countKey = "total", dataKey = "data", getDataSource, } = options;
    return async function paginationHandler(ctx, next) {
        const rawPage = ctx.req.query[queryKeyPage];
        const rawLimit = ctx.req.query[queryKeyLimit];
        const page = Math.max(parseInt(rawPage || `${defaultPage}`, 10), 1);
        const limit = Math.min(Math.max(parseInt(rawLimit || `${defaultLimit}`, 10), 1), maxLimit);
        const offset = (page - 1) * limit;
        ctx.pagination = {
            page,
            limit,
            offset,
            queryKeyPage,
            queryKeyLimit,
        };
        if (getDataSource) {
            const dataSourceResponse = await getDataSource(ctx, {
                page,
                limit,
                offset,
            });
            const total = dataSourceResponse?.[countKey];
            const data = dataSourceResponse?.[dataKey];
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
            ctx.pagination = pagination;
            const body = {
                [dataKey]: data,
                [countKey]: total,
                pagination,
            };
            ctx.body = body;
            let res = await next();
            if (res) {
                return res;
            }
            return ctx.json(body);
        }
        return await next();
    };
};
export { paginationHandler as default, paginationHandler };
