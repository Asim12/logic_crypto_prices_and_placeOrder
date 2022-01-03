const conn = require('../databaseConnection/connection');
const MongoClient =   require('mongodb').MongoClient;
const objectId    =   require('mongodb').ObjectId;
const { IoTJobsDataPlane } = require("aws-sdk");
const Binance = require('node-binance-api');

module.exports = {
    getUserBalance : (exchange, userId) => {
        return new Promise(resolve => {
            conn.then( async(db) => {
                let balance = await db.collection(exchange).find( { userId : new objectId(userId.toString()) }).toArray()
                resolve(balance)
            })
        })
    },

    getMarketPrice : (symbol, collectionName) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                db.collection(collectionName).findOne({ symbol : symbol}, async(err, result) => {
                    if(err){

                        console.log('DataBase have some issue!!!!');
                        resolve(false);
                    }else{

                        let price = await result
                        resolve(price);
                    }
                })
            })
        })
    },//end 


    placeOrderForBuy : (addOrderArray, collectionName) => {
        return new Promise(resolve => {
            conn.then(async (db) => {

                db.collection(collectionName).insertOne(addOrderArray);
                resolve(true);
            })
        })
    },//end

    getUserApiKeyDetails : (userId, exchange) => {
        return new Promise(resolve => {
            conn.then(async(db) => {
                let getExchangeDetails = [
                    {
                        '$match' : {
                            
                            'exchange' : exchange,
                            userId     : userId.toString()
                        }
                    },
                    {
                        '$project' : {
                            _id        :   {'$toString' : '$_id'},
                            userId     :   '$userId',
                            exchange   :   '$exchange',
                            apiKey     :   '$apiKey',
                            secretKey  :   '$secretKey'
                        }
                    },
                ];

                let data = await db.collection('exchanges').aggregate(getExchangeDetails).toArray();
                resolve(data);
            })
        })
    },//end helper


    isThisApiValid : (apiKey , secretKey) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                const binance = new Binance().options({
                    APIKEY      :   apiKey,
                    APISECRET   :   secretKey
                });

                binance.balance(async (error, balances) => {
                    if ( error ){

                        resolve(false)
                    }else{

                        resolve(true)
                    }
                })
            })
        })
    }, //end call for api validation


    getOrdersListing : (user_id, tabName, ) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                let searchQuery = {

                    user_id   : user_id.toString()
                }
                if(tabName == 'all'){

                }else if(tabName == 'active'){

                    searchQuery['status'] = { '$in' : ['active', 'new']};
                }else if(tabName == 'completed'){

                    searchQuery['status'] = 'completed';
                }else if(tabName == 'pause'){

                    searchQuery['status'] = 'pause';
                }else{

                    resolve('tabName is not valid!!!!!!')
                }

                let orders = await db.collection('order_binance').find(searchQuery).toArray();
                resolve(orders);
            })
        })
    },

    getSymbols: (collectionName) => {
        return new Promise(resolve => {
            conn.then(async (db) => {
                let lookup = [
                    {
                        '$group' : {
                            _id       : '$symbol',  
                            coin_name : {'$first' : '$coin_name'}
                        }
                    }
                ]
                let coins = await db.collection(collectionName).aggregate(lookup).toArray()
                resolve(coins)
                
            })
        })
    },//end getSymbols


    checkIsThisExchangeAlreadyExists : (user_id, exchange) => {
        return new Promise(resolve => {
            conn.then(async(db) => {

                let count = await db.collection('exchanges').countDocuments({user_id : user_id.toString(), exchange : exchange})
                resolve(count)
            })
        })
    },


    linkExchange : (addObject) => {
        return new Promise( resolve => {
            conn.then((db) => {
                db.collection('exchanges').insertOne(addObject)
            })
        })
    },

    //every 6 hours 
    userExchangeDetails : (exchangeName) => {
        return new Promise (resolve => {
            conn.then(async (db) => {

                var olderDate = new Date();
                olderDate.setHours(olderDate.getHours() - 6)

                let recordUpdateQuery = [
                    {
                        '$match' : {

                            '$or' : [
                                { 'lat-updated_time'  :  {'$exists' : false} },
                                { 'lat-updated_time'  :  {'$gte'    : olderDate} }
                            ],
                            'exchange' : exchangeName
                        }
                    },
                    {
                        '$project' : {
                            _id        :   {'$toString' : '$_id'},
                            user_id    :   "$user_id",
                            exchanges  :   "$exchanges",
                            apiKey     :   '$apiKey',
                            secretKey  :   '$secretKey'
                        }
                    },
                    {
                        '$sort' : { 'updated_time' : -1}
                    },
                    {
                        '$limit' : 5
                    }
                ];

                let data = await db.collection('exchanges').aggregate(recordUpdateQuery).toArray();
                resolve(data);
            })
        })
    },//end balance cron

};//end helper

