var express = require('express');
var router = express.Router();
const helper = require('../helper/helper')
const auth = require('../middleware/auth')

router.post('/getUserBalances' , async(req, res, next) => {

    if(req.body.exchange && req.body.userId){
        let exchange = req.body.exchange.toString();
        let userId   = req.body.userId.toString()
        let userBalance = await helper.getUserBalance(exchange, userId)

        let responseArray = {
            status : 200,
            balance : userBalance
        }
        res.status(200).send(responseArray);

    }else{

        let responseArray = {
            status : 400,
            error : "payload missing"
        }
        res.status(400).send(responseArray);           
    }
})


router.post('/apiKeyValidationCheck' , async(req, res, next) => {

    if(req.body.userId && req.body.exchangeName ){

        let apiDetailsCheck = await helper.getUserApiKeyDetails(req.body.userId.toString(), req.body.exchangeName);
        
        if(apiDetailsCheck.length > 0){
            
            let statusCheck = await helper.isThisApiValid( apiDetailsCheck[0]['exchanges'][0]['apiKey'], apiDetailsCheck[0]['exchanges'][0]['secretKey'] );

            let status = '';
            if(statusCheck == true){

                status = 200
            }else{
                status = 400
            }

            let responseArray = {
                status : status,
                message  : statusCheck,
            }
            res.status(200).send(responseArray);  

        }else{

            let responseArray = {
                status : 400,
                message : false,
            }
            res.status(200).send(responseArray);  
        }
    }else{
        let responseArray = {
            status : 400,
            message : "payload missing"
        }
        res.status(400).send(responseArray);  
    }

})


module.exports = router;


