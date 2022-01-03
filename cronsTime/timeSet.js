const cron          =   require('node-cron');
const cronBinance   =   require('../exchangeServices/binance');

//run after every 2 sec
cron.schedule('0 */1 * * * *', () => {
        
    // cronBinance.marketChatData();
});

cron.schedule('0 */1 * * * *', () => {
        
    // cronBinance.priceHistory();
});


cron.schedule('*/10 * * * * *', () => {
        
    // cronBinance.coinMarketCapPricesCrone();
});


//run after every 2 sec
cron.schedule('*/4 * * * * *', () => {
        
    // cronBinance.price();
});

// cron.schedule('0 0 */1 * * *', () => {
    cron.schedule('*/10 * * * * *', () => {
    cronBinance.balanceUpdate();
});


cron.schedule('*/5 * * * * *' , () => {

    // cronBinance.volume();
})