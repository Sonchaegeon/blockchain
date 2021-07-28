const express = require('express');
const app = express();
const path = require('path');
var bodyParser = require('body-parser');

const PORT = 3000;
const HOST = '0.0.0.0';

// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const ccpPath = path.resolve(__dirname, '..','..','basic-network','connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);

app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST : /set
app.post('/set', async (req, res) => {
    const constract = await getContract();
    const result = await constract.submitTransaction('set', req.body.id, req.body.data)
    console.log('set', result.toString());
    res.status(200).send(result);
})

// GET : /get
app.get('/get', async (req, res) => {
    const constract = await getContract();
    const result = await constract.evaluateTransaction('get', req.query.id)
    console.log('get', result.toString());
    res.status(200).send(result);
});

// GET : /getAll
app.get('/getAll', async (req, res) => {
    const constract = await getContract();
    const result = await constract.evaluateTransaction('getAllKeys')
    console.log('getAll', result.toString());
    res.status(200).send(result);
});

// GET : /getHistory
app.get('/getHistory', async (req, res) => {
    const constract = await getContract();
    const result = await constract.evaluateTransaction('getHistoryForKey', req.query.id)
    console.log('getHistory', result.toString());
    res.status(200).send(result);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

const getContract = async () => {
    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('myfirstcc');
    return contract;
}