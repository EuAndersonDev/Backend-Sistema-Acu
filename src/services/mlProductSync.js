const axios = require('axios');
const Product = require('../models/Product');

const BASE_URL = 'https://api.mercadolibre.com';

const buildHeaders = (accessToken) => (
    accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
);

const chunkArray = (items, size) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
};

const fetchSellerItemIds = async (sellerId, accessToken) => {
    const response = await axios.get(`${BASE_URL}/users/${sellerId}/items/search`, {
        headers: buildHeaders(accessToken),
        params: {
            limit: 50,
        },
    });

    return response.data && response.data.results ? response.data.results : [];
};

const fetchItemsByIds = async (ids, accessToken) => {
    if (!ids.length) {
        return [];
    }

    const response = await axios.get(`${BASE_URL}/items`, {
        headers: buildHeaders(accessToken),
        params: {
            ids: ids.join(','),
        },
    });

    return Array.isArray(response.data) ? response.data : [];
};

const syncSellerProducts = async ({ sellerId, accessToken } = {}) => {
    try {
        // Coloque seu SELLER_ID e ACCESS_TOKEN nos envs ML_SELLER_ID e ML_ACCESS_TOKEN.
        const resolvedSellerId = sellerId || process.env.ML_SELLER_ID;
        const resolvedAccessToken = accessToken || process.env.ML_ACCESS_TOKEN;

        if (!resolvedSellerId || !resolvedAccessToken) {
            throw new Error('ML_SELLER_ID e ML_ACCESS_TOKEN sao obrigatorios para sincronizar');
        }

        const itemIds = await fetchSellerItemIds(resolvedSellerId, resolvedAccessToken);
        const idChunks = chunkArray(itemIds, 20);

        let syncedCount = 0;

        for (const chunk of idChunks) {
            const items = await fetchItemsByIds(chunk, resolvedAccessToken);

            for (const item of items) {
                if (!item || item.code !== 200 || !item.body) {
                    continue;
                }

                const body = item.body;
                const record = {
                    ml_id: body.id,
                    title: body.title,
                    price: body.price,
                    currency_id: body.currency_id,
                    available_quantity: body.available_quantity,
                    permalink: body.permalink,
                    thumbnail: body.thumbnail,
                    status: body.status,
                    last_updated: body.last_updated ? new Date(body.last_updated) : new Date(),
                };

                await Product.upsert(record);
                syncedCount += 1;
            }
        }

        return { total: itemIds.length, synced: syncedCount };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    syncSellerProducts,
};
