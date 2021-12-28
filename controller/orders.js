var express = require('express');
const req = require('express/lib/request');
var router = express.Router();
const helper = require('../helper/helper')
const auth = require('../middleware/auth')

router.post('/placeOrder', async(req,res) => {
    if(req.body.user_id && req.body.exchange && req.body.buy_symbol && req.body.use_wallet){

        console.log('buy_symbol =========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', req.body.buy_symbol)
        console.log('use_wallet =======>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', req.body.use_wallet)

        let collection_name = 'market_prices_'+req.body.exchange.toLowerCase()
        let buy_symbol_price = await helper.getMarketPrice(req.body.buy_symbol, collection_name)
        let use_wallet = await helper.getMarketPrice(req.body.use_wallet, collection_name)

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
                    error : "order is placed successfully!!!!!!!!!!!!!"
                }
                res.status(200).send(responseArray);      
            }else if(req.body.roleType == 'timer'){

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
                    'type'                  :  'timer'
                }
                helper.placeOrderForBuy(insertOrder, 'order_binance');
                
                
                let responseArray = {
                    status : 200,
                    error : "order is placed successfully!!!!!!!!!!!!!"
                }
                res.status(200).send(responseArray);      

            }else if(req.body.roleType == 'event'){

                helper.placeOrderForBuy(req.body.eventObject, 'order_binance');

                let responseArray = {
                    status : 200,
                    error : "order is placed successfully!!!!!!!!!!!!!"
                }
                res.status(200).send(responseArray);   

                // let addOrderArray = {
                //     'type'                  :  'event',

                //     'user_id'               :  req.body.user_id.toString(),
                //     //cond line first
                //     'symbol'                :  req.body.symbol.toString(),
                //     'coinCondition'         :  req.body.coinCondition.toString(),//has wali condition ha yah
                //     'behaviour'             :  req.body.behaviour.toString(),
                //     'behaviour_value'       :  parseFloat(req.body.behaviour_value),
                //     'behaviour_cheking_Time':  parseFloat(req.body.behaviour_cheking_Time),
    
                //     //if condition
                //     'condition_type'        :   req.body.condition_type.toString(),  // and ha ya or
                //     'symbol_condition'      :   req.body.symbol_condition.toString(),
                //     'coinCondition_if'      :   req.body.coinCondition_if.toString(),//has wali condition ha yah
                //     'behaviour_if'          :   req.body.behaviour_if.toString(),
                //     'behaviour_value_if'    :   parseFloat(req.body.behaviour_value_if),
                //     'behaviour_cheking_Time_if':  parseFloat(req.body.behaviour_cheking_Time_if),
    
                //      //if condition
                //      'condition_type_next'   :   req.body.condition_type.toString(),  // and ha ya or
                //      'symbol_condition_next' :   req.body.symbol_condition.toString(),
                //      'coinCondition_if_next' :   req.body.coinCondition_if.toString(),//has wali condition ha yah
                //      'behaviour_if_next'     :   req.body.behaviour_if.toString(),
                //      'behaviour_value_if_next':   parseFloat(req.body.behaviour_value_if),
                //      'behaviour_cheking_Time_if_next':  parseFloat(req.body.behaviour_cheking_Time_if),
    
    
    
                //     'role_created_price'    :  parseFloat(coinPrice.price),
                //     'purchased_price'       : '', 
                //     'quantity'              :  parseFloat(req.body.quantity),
                //     'sell_price'            :  '',
                //     'role_type'             :  req.body.role_type.toString(),
                //     'status'                :  'new',
                //     'is_sell_order'         :  'yes',
                //     'created_date'          :  new Date(),
                //     'exchange'              :  req.body.exchange.toString(),
    
                //     'execuation_time'       :  parseFloat(req.body.symbol),   //kitny time yah condition check krne ha
                // }

            }else{

                let responseArray = {
                    status : 400,
                    error : "role type not selected!!!"
                }
                res.status(400).send(responseArray);    
            }
           
            // $sell_price = (float)((($purchase_price / 100)* 1.2) + $purchase_price);
            
        }else{
            let responseArray = {
                status : 400,
                error : "We are not Trading this Coin!!"
            }
            res.status(400).send(responseArray);    
        }
    }else{

        let responseArray = {
            status : 400,
            error : "some data are missing missing"
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

module.exports = router;