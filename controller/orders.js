var express = require('express');
// const req = require('express/lib/request');
var router = express.Router();
const helper = require('../helper/helper')
const auth = require('../middleware/auth')

router.post('/placeOrder', async(req,res) => {
    if(req.body.user_id){
    
        console.log('buy_symbol =========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', req.body.buy_symbol)
        console.log('use_wallet =======>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', req.body.use_wallet)

        let collection_name = 'market_prices_'+req.body.exchange.toLowerCase()

        console.log('collection_name ====>>>>>>>>>>' , collection_name);
        console.log('buy_symbol ====>>>>>>>>>>' , req.body.buy_symbol);
        console.log('use_wallet ====>>>>>>>>>>' , req.body.use_wallet);
        
        let buy_symbol_price = await helper.getMarketPrice(req.body.buy_symbol, collection_name)
        let use_wallet = await helper.getMarketPrice(req.body.use_wallet, collection_name)

        console.log('buy_symbol_price',  buy_symbol_price)
        console.log('use_wallet',  use_wallet)
        if(buy_symbol_price && use_wallet ){        
            console.log('buy symbol Price ========>>>>>>>>>>>>>>>>>>>>>>>>>', buy_symbol_price.price);
            console.log('use wallet symbol Price ========>>>>>>>>>>>>>>>>>>>>>>>>>', use_wallet.price);

            if(req.body.roleType == 'direct'){

                let insertOrder = {
                    'buy_symbol_price'      :  parseFloat(buy_symbol_price.price),
                    'use_wallet_price'      :  parseFloat(use_wallet.price),
                    'user_id'               :  req.body.user_id.toString(),
                    'action'                :  req.body.action.toString(), //buy/sell
                    'quantity'              :  parseFloat(req.body.quantity),
                    'quantity_behaviour'    :  req.body.quantity_behaviour.toString(),//coin/ usd / percentage
                    'buy_symbol'            :  req.body.buy_symbol.toString(),
                    'use_wallet'            :  req.body.use_wallet.toString(),
                    'exchange'              :  req.body.exchange.toLowerCase(),
                    'status'                :  'new',
                    'created_date'          :  new Date(),
                    'name'                  :  req.body.name.toString(),
                    'type'                  :  'direct'
                }

                helper.placeOrderForBuy(insertOrder, 'order_binance');

                let responseArray = {
                    status : 200,
                    message : "order is placed successfully!!!!!!!!!!!!!"
                }
                res.status(200).send(responseArray);      
            }else if(req.body.roleType == 'timer'){

                let insertOrder = {
                    'buy_symbol_price'      :       parseFloat(buy_symbol_price.price),
                    'use_wallet_price'      :       parseFloat(use_wallet.price),
                    'user_id'               :       req.body.user_id.toString(),
                    'action'                :       req.body.action.toString(), //buy/sell  
                    'quantity'              :       parseFloat(req.body.quantity),
                    'quantity_behaviour'    :       req.body.quantity_behaviour.toString(),//coin/ usd / percentage
                    'buy_symbol'            :       req.body.buy_symbol.toString(),
                    'use_wallet'            :       req.body.use_wallet.toString(),
                    'exchange'              :       req.body.exchange.toLowerCase(),
                    'status'                :       'new',
                    'created_date'          :       new Date(),
                    'name'                  :       req.body.name.toString(),
                    'type'                  :       'timer',
                    'created_date_new'      :       new Date()
                }

                //re.body.timeCondition  value should be every, on , right_now
                if(req.body.timeCondition  == 'every'){

                    insertOrder['timeCondition'] = req.body.timeCondition;  
                    insertOrder['startTime']     = req.body.startTime; //from date 
                    insertOrder['checking_time'] = req.body.checking_time; // time count ay ga kitne deer bad check krna from date sa 
                    insertOrder['startTimeType'] = req.body.startTimeType;//m,h,d,w 
                    insertOrder['checkingStartCount']  =  parseFloat(req.body.checkingStartCount);//kitne dafa roles ko check krna
                    insertOrder['execuationCondition'] = req.body.execuationCondition;

                    if(req.body.execuationCondition == 'but_not_more_than'){

                        insertOrder['checkingTimeRange'] = req.body.checkingTimeRange; 
                        insertOrder['checkingTimeRangeType'] = req.body.checkingTimeRangeType;
                    }

                }else if( req.body.timeCondition == 'on'){

                    insertOrder['startTime']     =  req.body.startTime;
                    insertOrder['timeCondition'] =  req.body.timeCondition;
                    insertOrder['checkingStartCount']  =  1;//kitne dafa roles ko check krna
                }else if( req.body.timeCondition  == 'right_now'){

                    insertOrder['timeCondition'] = req.body.timeCondition;
                    insertOrder['execuationCondition'] = req.body.execuationCondition;

                    if(req.body.execuationCondition == 'but_not_more_than'){

                        insertOrder['checkingTimeRange'] = req.body.checkingTimeRange;
                        insertOrder['checkingTimeRangeType'] = req.body.checkingTimeRangeType;
                    }
                }
                helper.placeOrderForBuy(insertOrder, 'order_binance');
                let responseArray = {
                    status : 200,
                    message : "order is placed successfully!!!!!!!!!!!!!"
                }
                res.status(200).send(responseArray);      

            }else if(req.body.roleType == 'event'){

                let insertRule = {                    
                    select_coin         :   req.body.select_coin,
                    buy_symbol_price    :   parseFloat(buy_symbol_price.price),
                    use_wallet_price    :   parseFloat(use_wallet.price),
                    has_condition       :   req.body.has_condition,
                    has_checking        :   req.body.has_checking,
                    checking_value      :   parseFloat(req.body.checking_value),
                    checking_symbol     :   req.body.checking_symbol,
                    checking_time       :   parseFloat(req.body.checking_time),
                    action              :   req.body.action,
                    startTime           :   req.body.startTime,
                    checkingStartCount  :   parseFloat(req.body.checkingStartCount),//kitne dafa roles ko check krna
                    quantity            :   parseFloat(req.body.quantity),
                    quantity_behaviour  :   req.body.quantity_behaviour,
                    buy_symbol          :   req.body.buy_symbol,
                    use_wallet          :   req.body.use_wallet,
                    exchange            :   req.body.exchange,
                    name                :   req.body.name,
                    user_id             :   req.body.user_id.toString(),
                    status              :   'new',
                    startTimeType       :   req.body.user_id.startTimeType, 
                    created_date        :   new Date(),
                    'type'              :   'event'
                }
                helper.placeOrderForBuy(insertRule, 'order_binance');
                let responseArray = {
                    status : 200,
                    message : "order is placed successfully!!!!!!!!!!!!!"
                }
                res.status(200).send(responseArray);   
            }else{

                let responseArray = {
                    status : 400,
                    message : "role type not selected!!!"
                }
                res.status(400).send(responseArray);    
            }
        }else{
            let responseArray = {
                status : 400,
                message : "We are not Trading this Coin!!"
            }
            res.status(400).send(responseArray);    
        }
    }else{

        let responseArray = {
            status : 400,
            message : "some data are missing missing"
        }
        res.status(400).send(responseArray);    
    }
})//end add order


router.post('/ruleListing', async(req, res) => {


    if(req.body.user_id  && req.body.tabName ){

        console.log('tab name is ======>>>>>>>>>>>>>>>', req.body.tabName )
        let orders = await helper.getOrdersListing(req.body.user_id, req.body.tabName)
        let responseArray = {
            status : 200,
            data : orders
        }
        res.status(200).send(responseArray);    

    }else{

        let responseArray = {
            status : 400,
            error : "some data are missing missing"
        }
        res.status(400).send(responseArray);    
    }
})


router.post('/linkExchange', async (req, res) => {
    if(req.body.user_id && req.body.apiKey && req.body.secretkey && req.body.exchange){
        
        let checkStatus =  await helper.checkIsThisExchangeAlreadyExists(req.body.user_id.toString(),  req.body.exchange.toLowerCase());
        console.log('checkStatus =>>>>>>>>>>>>>>>>>>>>>>',checkStatus);
        if(checkStatus > 0){

            let responseArray = {
                status  : 400,
                message : "You cannot add twice please remove the exchange and link again!!"
            }
            res.status(400).send(responseArray);    
        }else{
            let addObject = {
                apiKey       :   req.body.apiKey.toString(),
                secretKey    :   req.body.secretkey.toString(),
                user_id      :   req.body.user_id.toString(),
                exchange     :   req.body.exchange.toLowerCase(),
                created_date :   new Date()
            }

            helper.linkExchange(addObject);

            let responseArray = {
                status  : 200,
                message : "successfully linked!!"
            }
            res.status(200).send(responseArray);   
        }
    }else{
        let responseArray = {
            status  : 400,
            message : "some data are missing missing"
        }
        res.status(400).send(responseArray);    
    }
})

module.exports = router;