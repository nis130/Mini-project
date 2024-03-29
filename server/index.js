const express = require('express')
const app = express()
const mysql = require('mysql2');
const cors = require("cors");

const db = mysql.createConnection({
    host            : process.env.MYSQL_HOST || "localhost",
    port            : process.env.MYSQL_PORT || 3306,
    user            : process.env.MYSQL_USER || "root",
    password        : process.env.MYSQL_PASSWORD || "Hello#123",
    // database        : process.env.MYSQL_DATABASE || "portfolioDB"
});
console.log("port: ",process.env.DATABASE_HOST)

db.connect(function(err) {
if (err) {
    console.error("error connecting: " + err.stack);
    return process.exit(22);
}
console.log("Connected!");
});

app.use(cors());
app.use(express.json())
app.get('/',(req, res) => {
    db.query("create database if not exists portfolioDB;",(err, result) => {
            console.log("sql result: ",result);
            res.send(result)
        });
    db.query("use PortfolioDB;",(err, result) => {
        console.log("sql result: ",result);
    });
    db.query("create table IF NOT EXISTS user( user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, user_name VARCHAR(100), password VARCHAR(100) NOT NULL);",(err, result) => {
        console.log("sql result: ",result);
        
    });
    db.query("create table IF NOT EXISTS stock( transaction_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, stock_id VARCHAR(10) NOT NULL, stock_name VARCHAR(100), quantity INT NOT NULL, buy_price INT NOT NULL, buy_date VARCHAR(15), user_id INT NOT NULL, FOREIGN KEY (user_id) REFERENCES user(user_id));",(err, result) => {
        console.log("sql result: ",result);
        console.log("Error: ",err)
    });
     db.query("create table IF NOT EXISTS mutual_fund( transaction_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, fund_id VARCHAR(10) NOT NULL, fund_name VARCHAR(100), quantity INT NOT NULL, buy_price INT NOT NULL, buy_date VARCHAR(15), user_id INT NOT NULL, FOREIGN KEY (user_id) REFERENCES user(user_id));",(err, result) => {
        console.log("sql result: ",result);
        console.log("Error: ",err)
    });
    // res.send("Hello world");
    
});


app.get('/users',(req, res) => {

    
    db.query("SELECT * from user;",(err, result) => {
        console.log("sql result: ",result);
        res.send(result)
    });
});

app.get('/investments/:id',(req, res) => {

    var userId = req.params.id
    console.log(userId)

    
    db.query("SELECT * FROM stock WHERE user_id = ?;",[userId],(err, result) => {
        console.log("sql result: ",result);
        res.send(result)
        console.log("Error: ",err)
    });
});

app.post('/add-stocks', (req, res) => {

    console.log(req.body);
    db.query("INSERT INTO stock(stock_name , buy_price , quantity , buy_date ) values (?,?,?,?) ;", [req.body.stockName , req.body.buyPrice ,req.body.quantity , req.body.buyDate])
    res.status(200);
    return res;

})


app.get('/admin',(req, res) => {
    res.send("Hello admin");
});
app.listen(3001, () => {
    console.log("server is up on 3001");
});
