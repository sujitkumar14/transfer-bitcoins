var bitcoinjsLib = require('bitcoinjs-lib');
var request = require('request');
var isJson = require('is-valid-json');


module.exports = function(fromAddress,fromAddressPrivateKey,toAddress,network,callback){


    //livenet
    if(network === "livenet"){

        var url = "http://insight.coinbank.info/insight-api";

        var key = bitcoinjsLib.ECPair.fromWIF(fromAddressPrivateKey); // for test net pass bitcoinlibjs.networks.testnet

        request.get(url+"/addr"+fromAddress+"/utxo",function(err,response){

            if(err){
                console.log(err);
            }
            else{

                if(response!==undefined && isJson(response)){

                    response = JSON.parse(response);

                    if(response.length!==0){

                        for(var r in response){

                            var bitcoinBalance = r['satoshis'];        
                            var tx = new bitcoinjsLib.TransactionBuilder(); // pass testnet network
                            tx.addInput(r['txid'],0);
                            tx.addOutput(toAddress,bitcoinBalance - 3910000);
                            tx.sign(0,key);

                            var hex = tx.build().toHex();
                            var data = {
                                rawtx: hex
                            }
                            request.post(url+"/tx/send",{form:data},function(err,response){

                                if(err){
                                    callback(err,null);
                                }
                                else{
                                    callback(null,JSON.parse(response).body)
                                   
                                }
                            });
                        }

                    }

                }

            }
        });
    }
    else if(network==="testnet"){

         var url = "https://testnet.blockchain.info";
         var testnet = bitcoinjsLib.networks.testnet;

         var key = bitcoinjsLib.ECPair.fromWIF(fromAddressPrivateKey,testnet); // for test net pass bitcoinlibjs.networks.testnet

        request.get(url+"/unspent?active="+fromAddress,function(err,response){

            if(err){
                console.log(err);
            }
            else{
                //console.log(response);
                if(response!==undefined && isJson(response)){

                    response = JSON.parse(response.body);


                    response = response["unspent_outputs"];
                    



                    if(response.length!==0){

                        for(var r in response){
                             

                            var bitcoinBalance = (response[r])['value'];        
                            var tx = new bitcoinjsLib.TransactionBuilder(testnet); // pass testnet network

                           

                            tx.addInput((response[r])['tx_hash_big_endian'],0);
                            tx.addOutput(toAddress,bitcoinBalance - 3910000);
                            tx.sign(0,key);

                            var hex = tx.build().toHex();
                            //console.log(hex);
                            var data = {
                                tx: hex
                            }
                            request.post(url+"/pushtx",{form:data},function(err,response){

                                if(err){
                                    callback(err,null);
                                }
                                else{
                                    callback(null,JSON.parse(response).body)
                                }
                            });
                        }

                    }

                }

            }
        });

    }
    else{
        callback("network should be testnet or livenet",null);
    }

}

