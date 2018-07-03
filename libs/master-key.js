const keythereum = require("keythereum");
const keypress = require('keypress');
const log = require("./log");


module.exports = {
  getKey: function (config) {
    return new Promise(function (resolve, reject) {
      if (config.ownerKey && typeof config.ownerKey === 'string' && config.ownerKey !== '') {
        resolve(config.ownerKey);
      } else if (config.ownerAddress && config.password && config.dataDir) {
        try {
          log.print("Config ownerAddress - " + config.ownerAddress + ' and dataDir - ' + config.dataDir);
          keythereum.importFromFile(config.ownerAddress, config.dataDir, function (ko) {
            try {
              const privateKey = keythereum.recover(config.password, ko);
              if (privateKey) {
                log.completed("Complete!");
                resolve(privateKey.toString('hex'));
              } else {
                log.failed('Failed to load the keystore file (address).');
                inputs().then(function (key) {
                  resolve(key);
                });
              }
            } catch (e) {
              log.failed('Failed to load the keystore file (path).');
              inputs().then(function (key) {
                resolve(key);
              });
            }
          });
        } catch (e) {
          log.failed("Incorrect the owner, password or path to datadir in the config file.");
          inputs().then(function (key) {
            resolve(key);
          });
        }
      } else {
        inputs().then(function (key) {
          resolve(key);
        });
      }
    });
  },

  inputs: function () {
    return inputs();
  }
};

function inputs() {
  return new Promise(function (resolve, reject) {
    keypress(process.stdin);

    let step = 'path';
    let datadir, address, password, keyObject;
    log.print('Set path to geth dataDir: ');
    process.stdin.on('data', function (ch) {

      if (Number(ch.join('')) === 27 || Number(ch.join('')) === 3) {
        process.exit()
      }

      switch (step) {
        case 'path':
          try {
            let phrase = String(ch);
            datadir = phrase.replace('\n', '');
            step = 'address';
            log.completed("Getting datadir is completed! datadir: " + datadir);
            log.print('Set address: ');
          } catch (e) {
            log.failed("Incorrect path to datadir, please try again.");
          }
          break;
        case 'address':
          try {
            let phrase = String(ch);
            address = phrase.replace('\n', '');
            log.print('address : ' + address + " , datadir : " + datadir);
            keythereum.importFromFile(address, datadir, function (ko) {
              keyObject = ko;
              if (keyObject && keyObject.address) {
                log.completed("Loaded the key's object for the address: " + address);
                log.print('Set password for this address: ');
                step = 'password';
              } else {
                step = 'path';
              }
            });
          } catch (e) {
            step = 'path';
            address = '';
            datadir = '';
            log.failed("Incorrect address or previous step, please try again.");
          }
          break;
        case 'password':
          try {
            let phrase = String(ch);
            password = phrase.replace('\n', '');
            let privateKey = keythereum.recover(password, keyObject);
            log.completed("Complete!");
            resolve(privateKey.toString('hex'));
          } catch (e) {
            step = 'path';
            address = '';
            datadir = '';
            password = '';
            log.failed("Incorrect password or some of previous step, please try again.");
          }
          break;
      }
    });
  });
}