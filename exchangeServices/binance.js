
const conn = require('../databaseConnection/connection');
const MongoClient =   require('mongodb').MongoClient;
const objectId    =   require('mongodb').ObjectId;
const Binance = require('node-binance-api');
const binance = new Binance().options({});
const helper  = require('../helper/helper')
const axios  = require("axios");

module.exports = {
    price: () => {
        conn.then(async (db) => {
            let symbolsArray = await helper.getSymbols("coins_binance");
            console.log(symbolsArray)

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

                            let whereCoin = { symbol: key }
                            console.log('where ================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.', whereCoin)

                            db.collection('market_prices_binance').updateOne(whereCoin, { $set: insertedArray }, { upsert: true }, (err, result) => {
                                if (err) {

                                    console.log(err)
                                } else {
                                    console.log('upserted count: ======================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ',result.upsertedCount)
                                    console.log('modified count: ======================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ',result. modifiedCount)
                                }
                            })
                        }//end if
                    });
                });
            }
        }).catch((err) => {
            console.log(err);
        })
    },//End of price crone


    //balance update call
    balanceUpdate : () => {
        conn.then(async (db) => { 
            let exchangeDetails = await helper.userExchangeDetails("binance");
            let coins = await helper.getSymbols("coins_binance");

            if(exchangeDetails.length > 0){
                for(let user = 0 ; user < exchangeDetails.length; user++){

                    console.log('apiKey ====>>>>>>>>>>>>>>',exchangeDetails[user]['apiKey']);
                    console.log('secretKey ======>>>>>>>>>>>>>>>>', exchangeDetails[user]['secretKey']);

                    // let serverTime = await helper.getServerTimeStamp();
                    // let time = new Date(new Date().toUTCString())
                    // console.log( 'current timestamp in milisec ====>>>>>>>>>>>>>>>>>>>>>>>>>', new Date()  )

                    // var unixTimestamp = (new Date().getTime()/1000);
                    // console.log('UNIX time stamp', unixTimestamp);

                    // console.log('serverTime =========>>>>>>>>>>>>>>>>>>' , serverTime )

                    const binance = new Binance().options({
                        APIKEY      :   exchangeDetails[user]['apiKey'],
                        APISECRET   :   exchangeDetails[user]['secretKey'],
                        timestamp   :   Date.now()
                    });

                    binance.balance(async (error, balances) => {
                        if ( error ){

                            db.collection('exchanges').updateOne({ user_id : exchangeDetails[user]['user_id']}, {'$set' : { updated_time : new Date()}})
                            console.log(error.body)
                            return true;
                        }else{
                            for( let coinIteration = 0 ; coinIteration < coins.length ;  coinIteration++ ){
                                let coinName = coins[coinIteration]['coin_name'];
                                
                                let insertBalance = {
                                    balance  :  (balances[coinName].available > 0) ? parseFloat(balances[coinName].available) : parseFloat(0)  ,
                                    onOrder  :  (balances[coinName].onOrder > 0) ? parseFloat(balances[coinName].onOrder) : parseFloat(0) ,
                                    create_date : new Date()
                                } 

                                let insertBalance1 = {
                                    balance  :  (balances[coinName].available > 0) ? parseFloat(balances[coinName].available) :  parseFloat(0)  ,
                                    onOrder  :  (balances[coinName].onOrder > 0) ? parseFloat(balances[coinName].onOrder) :  parseFloat(0) ,
                                    create_date : new Date(),
                                    symbol    :  coins[coinIteration]['_id'], 
                                    user_id   :  exchangeDetails[user]['user_id']
                                } 
                                console.log('balance update call ======>>>>>>>>>>>>>>>>>>>>>>>', insertBalance1);

                                db.collection('balance_binance').updateOne({symbol : coins[coinIteration]['_id'], user_id :  exchangeDetails[user]['user_id']}, {'$set' : insertBalance}, {upsert:true})
                            }//end loop
                            db.collection('exchanges').updateOne({ user_id : exchangeDetails[user]['user_id']}, {'$set' : { updated_time : new Date()}})
                        }//end else
                    });
                }//end loop
            }else{//end if
            
                console.log('<<<<<<<<<<<<<<<<<<<<<<=========    NO USER AVALIABLE FOR UPDATE =========>>>>>>>>>>>>>>>>>>>>>>>')
            
            } 
        })
    },//end balance 


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

    //coin marketCap prices
    coinMarketCapPricesCrone: () => {
        conn.then((db) => {
            const options = {
                method: 'GET',
                url: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
                headers: {
                    'Postman-Token': '34a36f0e-88f4-4d46-8d2b-c0f5e620d71d',
                    'cache-control': 'no-cache',
                    Authorization: 'Basic ZGlnaWVib3QuY29tOllhQWxsYWg=',
                    'Content-Type': 'application/json',
                    'X-CMC_PRO_API_KEY': 'c0e27826-e94d-43f3-a6bd-a170c93d3e38'
                }
            };
            axios.request(options).then(async function (response) {
                console.log('type check',  typeof(response))
                let loopD = await response.data
                // let count = 0;
                const loopData = Object.entries(loopD);
                loopData.forEach(([key, value]) => {

                    if (value.length > 0) {

                        console.log('=====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',  value.length)

                        for(let inner = 0; inner < value.length; inner++){

                            let insertedArray = {
                                name                :   value[inner].name ,
                                symbol              :   value[inner].symbol,
                                slug                :   value[inner].slug,
                                price               :   parseFloat(value[inner].quote.USD.price),
                                volume_24h          :   parseFloat(value[inner].quote.USD.volume_24h),
                                percent_change_1h   :   parseFloat(value[inner].quote.USD.percent_change_1h),
                                percent_change_24h  :   parseFloat(value[inner].quote.USD.percent_change_24h),
                                percent_change_7d   :   parseFloat(value[inner].quote.USD.percent_change_7d),
                                percent_change_30d  :   parseFloat(value[inner].quote.USD.percent_change_30d),
                                percent_change_60d  :   parseFloat(value[inner].quote.USD.percent_change_60d),
                                percent_change_90d  :   parseFloat(value[inner].quote.USD.percent_change_90d),
                                market_cap          :   parseFloat(value[inner].quote.USD.market_cap),
                                created_date        :   new Date()
                            }
                            console.log('insertedArray=============>>>>>>>>>>>>>>>>>>>>>>>>>', insertedArray)
                            let where = { symbol : value[inner].symbol }
                            db.collection('market_prices_coin_market_cap').updateOne(where, { $set: insertedArray }, { upsert: true }, async (err, result) => {
                                if (err) {

                                    console.log('We are Getting some DataBase Error!!')
                                } else {

                                    console.log('Updated SuccessFully Market Prices!!!')
                                }
                            })
                        }//end for loop
                    }
                    // count++;
                })//end loop
            }).catch(function (error) {
                console.error(error);
                return true;
            });
        })
    },//end coin marketcap prices 
}
