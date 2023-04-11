import express from 'express';
import cors from 'cors';
import { signUp, signIn, signInWithToken } from './controller/user-controller.js';
import { verifyUserToken } from './middleware/authentication.js';

const PORT = 8000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options('*', cors());

const router = express.Router();

router.get('/', (_, res) => res.send('Hello World from BlockPass-backend'));

router.post('/signup', signUp);
router.post('/signin', signIn);
router.get('/signInWithToken', verifyUserToken, signInWithToken);

app.use('/api/user', router).all((_, res) => {
  res.setHeader('content-type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
});

app.listen(PORT, () => console.log(`BlockPass-backend listening on port ${PORT}`));

export default app;