const database = require('../src/config/database');
const CacheHelper = require('../src/utils/cacheHelper');

async function testDatabase() {
    try {
        // Initialize
        await database.initialize();

        // Test cache
        const testPayload = { test: 'data' };
        const testResponse = { result: 'cached' };

        // Save to cache
        await CacheHelper.saveCachedResponse('test', testPayload, testResponse);

        // Retrieve from cache
        const cached = await CacheHelper.getCachedResponse('test', testPayload);
        console.log('Cached data:', cached);

        // Test query
        const allCacheEntries = await database.all('SELECT * FROM llm_cache');
        console.log('Total cache entries:', allCacheEntries.length);

        console.log('✓ Database test successful!');
        await database.close();
    } catch (err) {
        console.error('Database test failed:', err);
        process.exit(1);
    }
}

testDatabase();
