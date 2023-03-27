# BlockPass

## To setup the backend
1. Go to `https://console.firebase.google.com/u/1/project/blockpass-17/settings/serviceaccounts/adminsdk`
2. Click `Firebase Admin SDK`
3. Click `Generate new private key`
4. Rename the downloaded file to `firebase-config.json`
5. Move `firebase-config.json` to `back` directory

## To setup Truffle and EVM
1. Launch Ganache
2. Open cmd and go to the `eth-contracts` folder
3. `truffle compile`
4. `truffle migrate`
5. `truffle test`
