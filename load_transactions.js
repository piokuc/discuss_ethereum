let Web3 = require('web3');
let web3 = new Web3(
// Update infura URI with a valid one
  new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/3bcc391bfd244ff8902fb215ae4f233d")
);

const MongoClient = require('mongodb').MongoClient;

// Update MongoDB connection string with a valid one
const uri = "mongodb+srv://user:password!@cluster0-vq9ax.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });


function isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0);
}

function stringify(o) {
    return JSON.stringify(o, null, 4);
}

function timestampToTime(t) {
    var date = new Date(t * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();

    // time in 10:30:23 format
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

function saveBlock(block) {
    client.connect(err => {
        if (err) return console.error('ERROR connecting to Mongo:' + err);

        const blocks = client.db("ethereum").collection("blocks");
        block._id = block.number;
        console.log('Saving ' + block.number + '(' + block.hash + ')');
        blocks.insertOne(block);
        console.log(block.number + ' saved');

        if (! isEmpty(block.transactions)) {
            const txns = client.db("ethereum").collection("txns");
            for (var i = 0; i < block.transactions.length; i++) {
                var txn = block.transactions[i];
                console.log("" + i + ":" + txn.hash + ' ' + txn.from + ' ' + txn.to + ' ' + txn.value);

                txn._id = txn.hash;
                txn.timestamp = block.timestamp;
                d = new Date(block.timestamp * 1000);
                iso = d.toISOString();
                txn.date = iso.split('T')[0];
                txn.time = iso.split('T')[1].split('.')[0];
                txns.insertOne(txn);
            }
        }
    });
}

var subscription = web3.eth.subscribe('newBlockHeaders', (error, result) => {
    if (error) {
        console.error("newBlockHeaders error:", error);
        return;
    }
    console.log("newBlockHeader: " + result.number + ' ' + result.hash + ' ' + timestampToTime(result.timestamp))
    let blockNumber = result.number;
    web3.eth.getBlock(blockNumber, true, (error, block) => {
        if (error) {
            console.error("getBlock error:", error);
        } else {
            if (! isEmpty(block)) {
                saveBlock(block);
            }
        }
    });
}).on("data", function(blockHeader){
    console.log("data:" + blockHeader);
}).on("error", console.error);

// unsubscribes the subscription
subscription.unsubscribe(function(error, success){
    if (success) {
        console.log('Successfully unsubscribed!');
    }
});

