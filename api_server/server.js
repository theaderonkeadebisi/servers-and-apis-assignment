const http = require('http');
const fs = require('fs');
const path = require('path');

const itemsDbPath = path.join(__dirname, 'items.json');
let itemsDB = [];


const PORT = 4000
const HOST_NAME = 'localhost';

const requestHandler = function (req, res) {
    res.setHeader("Content-Type", "application/json");

    if (req.url === '/items' && req.method === 'GET') {
        getAllItems(req, res);
    } else if (req.url === '/items' && req.method === 'POST') {
        addItem(req, res);
    } else if (req.url === '/items' && req.method === 'PUT') {
        updateItem(req, res);
    } else if (req.url.startsWith('/items') && req.method === 'DELETE') {
        deleteItem(req, res);
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({
            message: 'Method Not Supported'
        }));
    }

}


const getAllItems = function (req, res) {
    fs.readFile(itemsDbPath, "utf8", (err, items)=> {
        if (err){
            console.log(err)
            res.writeHead(400)
            res.end("An error occured")
        }

        res.end(items);

    })
}


const addItem = function (req, res) {
    const body = [];

    req.on('data', (chunk) => {
        body.push(chunk);
    });

    req.on('end', () => {
        const parsedBody = Buffer.concat(body).toString();
        const newItem = JSON.parse(parsedBody);


        const lastItem = itemsDB[itemsDB.length - 1];
        const lastItemId = lastItem.id;
        newItem.id = lastItemId + 1;

        itemsDB.push(newItem);
        fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), (err) => {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end(JSON.stringify({
                    message: 'Internal Server Error. Could not save book to database.'
                }));
            }

            res.end(JSON.stringify(newItem));
        });
    });
}


const updateItem = function (req, res) {
    const body = [];

    req.on('data', (chunk) => {
        body.push(chunk);
    });

    req.on('end', () => {
        const parsedBody = Buffer.concat(body).toString();
        const bookToUpdate = JSON.parse(parsedBody);

        const itemIndex = itemsDB.findIndex((item) => {
            return item.id === itemToUpdate.id;
        });

        if (itemIndex === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({
                message: 'Book not found'
            }));
            return;
        }

        itemsDB[itemIndex] = {...itemsDB[itemIndex], ...itemToUpdate}; 

        fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), (err) => {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end(JSON.stringify({
                    message: 'Internal Server Error. Could not update item in database.'
                }));
            }

            res.end(JSON.stringify(itemsDbPath));
        });
    });
}


const deleteItem = function (req, res) {
    const itemId = req.url.split('/')[2];
    
    const itemIndex = itemsDB.findIndex((item) => {
        return item.id === parseInt(itemId);
    })

    if (itemIndex === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({
            message: 'Item not found'
        }));

        return;
    }

    itemsDB.splice(itemIndex, 1);

    fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), (err) => {
        if (err) {
            console.log(err);
            res.writeHead(500);
            res.end(JSON.stringify({
                message: 'Internal Server Error. Could not delete book from database.'
            }));
        }

        res.end(JSON.stringify({
            message: 'Book deleted'
        }));
    });

}

const server = http.createServer(requestHandler)

server.listen(PORT, HOST_NAME, () => {
    itemsDB = JSON.parse(fs.readFileSync(itemsDbPath, 'utf8'));
    console.log(`Server is listening on ${HOST_NAME}:${PORT}`)
})