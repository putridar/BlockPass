# BlockPass

## To setup frontend
1. cd to `front`
2. Run `npm install`
3. Create `.env` file
4. Copy and paste `REACT_APP_USER_API=http://localhost:8000/api/user` into the file

## To setup the backend
1. Go to `https://console.firebase.google.com/u/1/project/blockpass-17/settings/serviceaccounts/adminsdk`
2. Click `Firebase Admin SDK`
3. Click `Generate new private key`
4. Rename the downloaded file to `firebase-config.json`
5. cd to `back`
6. Move `firebase-config.json` to current directory
7. Run `npm install`
8. Create `.env` file
9. Copy and paste `FSALT_ROUNDS=10` and `JWT_PRIVATE_KEY=Bl4ckP455` into the file

