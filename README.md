# BlockPass

## To setup frontend
1. cd to `front`
2. Run `npm install`
3. Create `.env` file
4. Copy and paste the code below into the file
```
REACT_APP_USER_API=http://localhost:8000/api/user
REACT_APP_TICKET_ADDRESS=<TICKET CONTRACT ADDRESS>
REACT_APP_EVENT_ADDRESS=<EVENT CONTRACT ADDRESS>
REACT_APP_MARKET_ADDRESS=<MARKET CONTRACT ADDRESS>
```

## To setup the backend
1. Go to `https://console.firebase.google.com/u/1/project/blockpass-17/settings/serviceaccounts/adminsdk`
2. Click `Firebase Admin SDK`
3. Click `Generate new private key`
4. Rename the downloaded file to `firebase-config.json`
5. Run `cd back`
6. Move `firebase-config.json` to current directory
7. Run `npm install`
8. Create `.env` file
9. Copy and paste the code below into the file
```
FSALT_ROUNDS=10
JWT_PRIVATE_KEY=Bl4ckP455
```
 

## To run frontend
1. Run `cd front`   
2. Run `npm run start`

## To run backend
1. Run `cd back`
2. Run `node index.js`

## To setup Truffle and EVM
1. Launch Ganache
2. Open cmd and go to the `eth-contracts` folder
3. `truffle compile`
4. `truffle migrate`
5. `truffle test`
