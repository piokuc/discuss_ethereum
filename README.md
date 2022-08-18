# Description of the project

## Web application

This project is a node.js app deployed on Heroku, please refer to Heroku documentation on
how to [deploy](https://devcenter.heroku.com/articles/getting-started-with-nodejs) it.

The app has been deployed on [https://discussethereum.herokuapp.com/]( https://discussethereum.herokuapp.com/ )

Locally it can be tested with `npm start`.

The app uses jQuery DataTables to display data loaded from a MongoDB instance.
When the app is loaded it first loads latest 100 transactions from the database.
One second later it reloads the table with all historical transactions.
The idea is to show the page to the user as quickly as possible with small amount of data,
then load the rest of it in the background. 
This is very simple but obviously once the number of transactions in the database grows
it may fail to load all of them into memory, so a better solution would be needed in production.

Frontend of the app checks for new data in the database using a simple polling mechanism,
it is currently doing it every one minute.

## Transactions database

The MongoDB database is populated with data pulled from infura.
The script `load_transactions.js` pulls new blocks from infura
and populates `txns` collection with transaction objects present in the blocks.
Currently the script `load_transactions.js` is being run by the author on his laptop,
proper deployment as a background job in the cloud would be needed in production.

The transactions objects retrieved from infura are enriched with timestamp information from the blocks they were included in.

## Discussions

Disqus has been used to allow users to comment on specific transactions.
Once the user clicks on a row in the table details of the transaction in the row
are displayed below the table and the Disqus plugin is reloaded
with a page id being set to the transaction's hash.
This way there can be a different thread per each transaction.

