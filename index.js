const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const MongoClient = require('mongodb').MongoClient;
const JSONStream = require('JSONStream')

// Below needs to be updated with a valid MongoDB connection string
const uri = "mongodb+srv://user:password@cluster0-vq8ax.mongodb.net/test?retryWrites=true&w=majority";

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
        const client = new MongoClient(uri, { useNewUrlParser: true });
        client.connect((err, client) => {
            const txns = client.db("ethereum").collection("txns");
            txns.find().sort({blockNumber:-1}).limit(100).toArray((err, transactions) => {
                if (err) res.send(err);
                else {
                    res.render('pages/index', {transactions: transactions});
                }
            });
            client.close();
        });
  }).get('/txs/:timestamp', (req, res) => {
        const client = new MongoClient(uri, { useNewUrlParser: true });
        client.connect((err, client) => {
            const timestamp = parseInt(req.params["timestamp"]);
            const txns = client.db("ethereum").collection("txns");
            txns.find({timestamp: {$gt: timestamp}})
            .stream()
            .pipe(JSONStream.stringify())
            .pipe(res.type('json'));
        });
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
