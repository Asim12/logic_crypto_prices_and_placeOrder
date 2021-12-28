
const conn = require('../databaseConnection/connection');
const MongoClient =   require('mongodb').MongoClient;
const objectId    =   require('mongodb').ObjectId;
const Binance = require('node-binance-api');
const binance = new Binance().options({});
const helper  = require('../helper/helper')

module.exports = {
    marketChatData: () => {
        conn.then(async (db) => {
            let symbolsArray = await helper.getSymbols("coins_binance");
            // console.log(symbolsArray)
            var coins = symbolsArray.map(el => el._id);

            binance.websockets.candlesticks(coins, "1m", (candlesticks) => {
                let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
                let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;

                var insertArray = {
                    symbol: symbol,
                    open: parseFloat(open),
                    high: parseFloat(high),
                    low: parseFloat(low),
                    close: parseFloat(close),
                    volume: parseFloat(volume),
                    eventTime: eventTime,
                    time: new Date(),
                }
                console.log(insertArray)

                let whereMatch = {
                    symbol: symbol,
                    high: parseFloat(high),
                }
                db.collection('market_chart_binance').updateOne(whereMatch, { $set: insertArray }, { 'upsert': true }, (err, result) => {
                    if (err) { return true;} else {
                    }
                })
            });
        })
    },

    priceHistory: () => {
        conn.then(async (db) => {
            let symbolsArray = await helper.getSymbols("coins_binance");
            var coins = symbolsArray.map(el => el._id);
            for (let i = 0; i < coins.length; i++) {

                binance.prices(coins[i], (error, ticker) => {
                    if(error){

                        console.log('error ========================================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error)
                        return true;
                    }
                    ticker = Object.entries(ticker);
                    ticker.forEach(([key, value]) => {

                        var result = coins.includes(key);

                        if (result == true || result == 'true') {
                            let insertedArray = {
                                symbol: key,
                                price: parseFloat(value),
                                created_date: new Date()
                            }
                            console.log('======================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',insertedArray)
                            db.collection('market_prices_history_binance').insertOne(insertedArray)
                        }//end if
                    });
                });
            }
        }).catch((err) => {
            console.log(err);
        })
    },
}
