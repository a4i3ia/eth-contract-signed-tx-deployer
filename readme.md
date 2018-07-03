# toixe

## Start

```angular2html
    npm i -g eth-contract-signed-tx-deployer
```

### Commands list:

    - toixe -v
    - toixe init
    - toixe deploy
    
### More info:

```angular2html
    toixe -v
```

Show installed version of the package.

```angular2html
    mkdir test_folder_toixe
    cd test_folder_toixe
    toixe init
```

If the initialization is completed you will have a folder "toixe" with the default files:
- toixe.conf
- toixe.js
- toixe.sol


##### toixe.conf

Config file which contains the deploy parameters.

- *ownerAddress* - Address which pays for a deploy transaction. In transaction body this address listed as "from".

- *ownerKey* - Private key to ownerAddress. 
    > Note: If key was set but it's wrong, then you won't get an error but your contract will be deployed from another address.
- *dataDir* - Full path to "dataDir" of your "geth" which stores a keystore folder with files of keys. (it is used when "ownerKey" isn't set)

- *password* - Password to keystore file of "ownerAddress". (it is  used when "ownerKey" isn't set)

- *enodePath* - Full path (with port if it's needed) to the enode for deploy.

- *gasLimit* - gasLimit of your deploy transaction.

- *gasPrice* - gasPrice of your deploy transaction.

- *chainId* - chainId of network to deploy to. (by default the value of variable equals to **"3"** for deploy to **Ropsten(testnet)**)
    > Note: It's not a networkId
- *artifacts* - Path to empty folder where **toixe** will save the global json of compilation to (it's a result of **solc** compilation).

- *contracts* - Lists objects by solidity files. Objects should contain the keys:
    - *name* - name of this file
    - *path* - path to this file
    > Note: See the default config file.
    

##### toixe.js

The example js file for simple contract deploy.

##### toixe.sol

The example sol file of simple contract.

> Note: toixe.conf and toixe.js are reserved names of files for toixe. If one of them is not set then toixe will not work.