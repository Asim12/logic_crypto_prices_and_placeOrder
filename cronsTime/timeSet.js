
const cron          =   require('node-cron');
const cronBinance   =   require('../exchangeServices/binance');

//run after every 2 sec
cron.schedule('0 */1 * * * *', () => {
        
    cronBinance.marketChatData();
});

cron.schedule('0 */1 * * * *', () => {
        
    cronBinance.priceHistory();
});
