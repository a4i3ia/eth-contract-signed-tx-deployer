"use strict";

const Web3 = require('web3');
const solc = require('solc');
const mkdirp = require('mkdirp');
const log = require("./log");
const masterKey = require("./master-key");
const fs = require('fs');
const _ = require("lodash");
const path = require("path");
const dJSON = require('dirty-json');

var compiledBody;
var currentContract;
var configs;
var web3;

const DEFAULT_GAS_LIMIT = 4000000;
const DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000000";
const DEFAULT_GAS_PRICE = 20000000000;
const DEFAULT_CHAIN_ID = 3;                   // this "chain id" is the default value for <Ropsten> network

// initialized sendAsync function for the some versions web3
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

module.exports = {
  deploy: function (contractName, options) {
    log.header(' 𝔻𝕖𝕡𝕝𝕠𝕪𝕖𝕣');
    if (!contractName) {
      log.failed("Contract name is not found!");
      return false;
    }
    if (!options) {
      try {
        const confPath = process.cwd() + "/toixe/toixe.conf";
        configs = JSON.parse(fs.readFileSync(confPath, 'utf8'));
      } catch (e) {
        log.failed("Config file (tioxe.conf) load error: " + e);
        return false;
      }
    }
    web3 = new Web3(new Web3.providers.HttpProvider(configs.enodePath));
    if (!configs.contracts) {
      log.failed("Config does not contain \"contracts\" key.");
      return false;
    } else {
      const artifacts = path.join(configs.artifacts, "artifacts");
      mkdirp(artifacts, function (err) {
        if (err) {
          log.failed('Init \"mkdirp\" error: ' + err);
          return err;
        }
        compilation(configs.contracts, path.join(artifacts, contractName + ".json"))
          .then(function (compiled) {
            const mainABI = _.find(compiled.contracts, function (val, key) {
              if (key.indexOf(":" + contractName) !== -1) {
                currentContract = val;
              }
              return key.indexOf(":" + contractName) !== -1;
            });
            try {
              return web3.eth.estimateGas({data: '0x' + currentContract.bytecode});
            } catch (e) {
              log.print("estimateGas error: ", e);
              return 0;
            }
          })
          .then(function (estimateGas) {
            log.print('estimateGas: ' + estimateGas);
            return masterKey.getKey(configs);
          })
          .then(function (privateKey) {
            log.print('privateKey: ' + privateKey);

            return deploy(privateKey, currentContract.bytecode, contractName);
          })
          .then(function (deployed) {
            log.print('Deployed result: ', deployed);

          })
          .catch(function (err) {
            log.failed(err);
            return false;
          })
      });
    }
  },

  library: function (fileData) {

  },

  load: function (filePath) {
    return fs.readFileSync(filePath, 'utf8');
  },
  readFile: function (filePath, defaults = false) {
    return readFile(filePath, defaults);
  }
};

function readFile(filePath, defaults = false) {
  try {
    return defaults
      ? fs.readFileSync(path.join(__dirname, filePath), 'utf8')
      : fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    log.failed('File read error: ', e);
    return e;
  }
}

function compilation(compilationList, pathToSave) {
  return new Promise(async function (resolve, reject) {
    if (_.isArray(compilationList)) {
      var input = {};
      for (var i = 0; i < compilationList.length; i++) {
        if (compilationList[i].name && compilationList[i].path) {
          input[compilationList[i].name] = fs.readFileSync(compilationList[i].path, 'utf8');
        }
      }
      compiledBody = solc.compile({sources: input}, 1);
      fs.writeFileSync(pathToSave, JSON.stringify(compiledBody, null, 4));
      resolve(compiledBody);
    } else {
      reject("Error: compilationList is not a list.");
    }
  });
}

function transform(souce) {
  const cur = String(__dirname).split(path.sep).splice(1);
  var transformedPath = _.map(
    cur,
    function (item) {
      return '..';
    }
  ).join(path.sep);
  return transformedPath + souce;
}

function deploy(privateKey, bytecode, name) {
  return new Promise(function (resolve, reject) {
    var contract;
    var bytedata = bytecode;
    var addressLib = '';
    var signedTx;

    const mainABI = _.find(compiledBody.contracts, function (val, key) {
      if (key.indexOf(":" + name) !== -1) {
        contract = val;
      }
      return key.indexOf(":" + name) !== -1;
    });

    const contractAbi = new web3.eth.Contract(dJSON.parse(currentContract.interface));

    if (bytedata.indexOf('_') !== -1) {
      addressLib = bytedata.replace(/_{2}[a-zA-Z0-9]*_{1,38}/gm, library);
    }

    const deploy = contractAbi.deploy({
      data: bytecode.split('__RealNetLib____________________________').join(addressLib.slice(2))
    }).encodeABI();

    const gasLimit = configs.gasLimit ? configs.gasLimit : DEFAULT_GAS_LIMIT;
    const gasPrice = configs.gasPrice ? configs.gasPrice : DEFAULT_GAS_PRICE;
    const from = configs.ownerAddress ? configs.ownerAddress : DEFAULT_ADDRESS;
    const chainId = configs.chainId ? configs.chainId : DEFAULT_CHAIN_ID;

    const params = {
      gas: web3.utils.toHex(gasLimit),
      from: from,
      gasLimit: web3.utils.toHex(gasLimit),
      gasPrice: web3.utils.toHex(gasPrice),
      data: '0x' + deploy,
      chainId: web3.utils.toHex(chainId)
    };

    cost(params)
      .then(function (price) {
        !price.result
          ? log.failed('Estimate gas of \"' + name + '\" contract error: ', price)
          : log.print('Estimate gas of \"' + name + '\" contract is ', Number(price.result));
        return web3.eth.getTransactionCount(from)
      })
      .then(function (nonce) {
        log.completed('Got current \"nonce\". Number of this transaction is ' + nonce);
        const marketVirtualSpaceTransactionObject = {
          // >> main parameters (required)
          gas: web3.utils.toHex(gasLimit),
          gasLimit: web3.utils.toHex(gasLimit),
          gasPrice: web3.utils.toHex(gasPrice),
          data: '0x' + deploy,
          chainId: web3.utils.toHex(chainId),
          // >> advanced options (not required)
          nonce: nonce,
        };
        return web3.eth.accounts.signTransaction(marketVirtualSpaceTransactionObject, '0x' + privateKey);
      })
      .then(function (tx) {
        log.completed('Transaction is signed!');
        signedTx = tx;
        return web3.eth.accounts.recoverTransaction(signedTx.rawTransaction)
      })
      .then(function (recover) {
        log.completed('Check recover: ' + recover);
        web3.eth.sendSignedTransaction(signedTx.rawTransaction)
          .on('transactionHash', async function (hash) {
            log.completed("Hash of created transaction: " + hash);
            log.completed("Awaiting the mining...");
          })
          .on('receipt', async function (receipt) {
            log.completed("Got receipt!");
            resolve(receipt);
          })
          .on('error', function (err) {
            log.failed("error: ", err);
            process.exit();
          });
      })
      .catch(function (err) {
        log.failed("Error: ", err);
        process.exit();
      });
  });
}

function library(str, offset, s) {
  log.print('str: ' + str + ' , offset: ' + offset + ' , s: ' + s);
}

function cost(params) {
  return new Promise(function (resolve, reject) {
    web3.currentProvider.send({
      method: "eth_estimateGas",
      params: [params],
      jsonrpc: "2.0",
      id: new Date().getSeconds()
    }, function (e, r) {
      if (e) {
        reject(e);
      } else {
        resolve(r);
      }
    });
  });
}