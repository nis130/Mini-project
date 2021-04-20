const pgp = require("pg-promise")({
    error: function (error, e) {
        if (e.cn) {
            console.log("CONNECTION:", e.cn);
        }
        console.log("err: ",error);
    }
});


const db = pgp({
    "host": process.env.POSTGRES_HOST || "localhost",
    "port":  process.env.POSTGRES_PORT || "5432",
    "database": process.env.POSTGRES_DB || "stocks",
    "user": process.env.POSTGRES_USER || "nishit",
    "password": process.env.POSTGRES_PASSWROD || "pass"
  });

  
// add query functins
function getSingleStock(req, res, next) {
  db.one('select stockname, industry, round(cast(close as numeric),2) as close, round(cast(open as numeric),2) as open,' +
    ' round(cast(high as numeric),2) as high, round(cast(low as numeric),2) as low, volume' +
    ' from stock inner join (' +
    ' select distinct on (stockid) stockid, day, open, high, low, close, volume, adj_close' +
    ' from history order by stockid asc, day desc) t' +
    ' on stock.stockid=t.stockid where stockname = ${stockname}', req.params)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE stock'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getStockHist(req, res, next) {
  db.any('select day, round(cast(open as numeric),2) as open, round(cast(high as numeric),2) as high, ' +
    ' round(cast(low as numeric),2) as low, round(cast(close as numeric),2) as close, volume, ' +
    ' round(cast(adj_close as numeric),2) as adj_close' +
    ' from history' +
    ' where stockid = (select stockid from stock where stockname= ${stockname})' +
    ' order by day desc', req.params)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE stock history'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function getSensexPrice(req, res, next) {
  db.one('select distinct on (stockid) stockid, round(cast(close as numeric),2) as close , ' +
    ' round(cast((close-open) as numeric),2) as diff, ' +
    ' round(cast(100*(close-open)/open as numeric),2) as perc' +
    ' from history where stockid = (select stockid from stock where stockname= \'Sensex\') ' +
    ' order by stockid, day desc')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved sensex price'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getSensexHist(req, res, next) {
  db.any('select day, round(cast(open as numeric),2) as open, round(cast(high as numeric),2) as high, ' +
    ' round(cast(low as numeric),2) as low, round(cast(close as numeric),2) as close, volume, ' +
    ' round(cast(adj_close as numeric),2) as adj_close' +
    ' from history where stockid = (select stockid from stock where stockname=\'Sensex\')' +
    ' order by day desc', req.body)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved sensex history'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}
function getAllUsers(req,res,next){
   db.many(' select username from users ', req.body)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all users'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAllStocks(req, res, next) {
  db.many('select *' +
    'from stock', req.body)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL stocks'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getTopStocks(req, res, next) {
  db.many('select stockname, industry, t.day as day, round(cast(t.close as numeric),2) as curr_price, ' +
    ' round(cast((t.close-t.open) as numeric),2) as diff, ' +
    ' round(cast(100*(t.close-t.open)/t.open as numeric),2) as perc' +
    ' from stock inner join (' +
    ' select distinct on (stockid) stockid, day, open, high, low, close, volume, adj_close' +
    ' from history order by stockid asc, day desc ) t' +
    ' on stock.stockid=t.stockid' +
    ' where stockname <> \'Sensex\'' +
    ' order by perc desc limit 5', req.body)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved top gainers'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getLowStocks(req, res, next) {
  db.many('select stockname, industry, t.day as day, round(cast(t.close as numeric),2) as curr_price, ' +
    ' round(cast((t.close-t.open) as numeric),2) as diff, ' +
    ' round(cast(100*(t.close-t.open)/t.open as numeric),2) as perc' +
    ' from stock inner join (' +
    ' select distinct on (stockid) stockid, day, open, high, low, close, volume, adj_close' +
    ' from history order by stockid asc, day desc ) t' +
    ' on stock.stockid=t.stockid' +
    ' where stockname <> \'Sensex\'' +
    ' order by perc limit 5', req.body)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved top losers'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getUserDetails(req, res, next) {
  db.one('select username, email' +
    ' from users' +
    ' where username = ${username}', req.body)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved user details'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function authenticate(req, res, next) {
  // set session variables
  // console.log(req.body);
  db.one('select *' +
    ' from users' +
    ' where username = ${username} and password = ${password} ', req.body)
    .then(function (data) {
      // console.log(data);
      req.session.authenticated = true;
      req.session.username = data.username;
      req.session.role = data.role;
      next();
    })
    .catch(function (err) {
      // console.log(err);
      req.session.authenticated = false;
      next();
    });
}


function getPortStocks(req, res, next) {
  console.log("--------this called----------------", req.body, '-----');
  db.any('select stock.stockid, stockname, round(cast(close as numeric),2) as close, ' +
    ' round(cast((close-open) as numeric),2) as diff, ' +
    ' round(cast(100*(close-open)/open as numeric),2) as perc, qty, ' +
    ' round(cast((qty*close - cost) as numeric),2) as profit' +
    ' from stock inner join ' +
    ' (select t2.stockid, close, open, qty, cost from portfolio inner join ' +
    ' (select distinct on (stockid) stockid, day, open, high, low, close, volume, adj_close' +
    ' from history' +
    ' order by stockid asc, day desc) t2' +
    ' on portfolio.stockid = t2.stockid' +
    ' where portfolio.userid = (select userid from users where username = ${username})) t1' +
    ' on stock.stockid = t1.stockid', req.body)
    .then(function (data) {
      // console.log("---------this finished--------------")
      // console.log(data);
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved portfolio stocks of one user'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getPortStockDetails(req, res, next) {
  db.one('select stockname, industry, round(cast(close as numeric),2) as close, ' +
    ' round(cast((close-open) as numeric),2) as diff, ' +
    ' round(cast(100*(close-open)/open as numeric),2) as perc, qty, ' +
    ' round(cast((qty*close - cost) as numeric),2) as profit' +
    ' from stock inner join ' +
    ' (select t2.stockid, close, open, qty, cost from portfolio inner join ' +
    '(select distinct on (stockid) stockid, day, open, high, low, close, volume, adj_close' +
    ' from history' +
    ' order by stockid asc, day desc) t2' +
    ' on portfolio.stockid = t2.stockid' +
    ' where portfolio.userid = (select userid from users where username = ${username})) t1' +
    ' on stock.stockid = t1.stockid' +
    ' where stock.stockid = (select stockid from stock where stockname = ${stockname})', req.body)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved portfolio stock details of one user and one stock'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function getTransHist(req, res, next) {
  db.any('select trans_qty, trans_date, round(cast(close as numeric),2) as close ' +
    'from log inner join history' +
    ' on log.stockid = history.stockid' +
    ' and log.trans_date = history.day' +
    ' where log.userid = (select userid from users where username = ${username})' +
    ' and log.stockid = (select stockid from stock where stockname = ${stockname})' +
    ' order by trans_date', req.body)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved transaction history of one stock for one user'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getPortNetValue(req, res, next) {
  db.one('select round(cast(sum(qty*close) as numeric),2) as net_value, ' +
    ' round(cast(sum(qty*close) - sum(cost) as numeric),2) as profit ' +
    'from (' +
    'select distinct on (stockid) stockid, close ' +
    'from history ' +
    'order by stockid asc, day desc ' +
    ') t inner join portfolio ' +
    'on t.stockid = portfolio.stockid ' +
    'where portfolio.userid=(select userid from users where username=${username}) ' +
    'group by userid', req.body)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved net prtfolio value for one user'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function createStock(req, res, next) {
  db.none('insert into stock(stockname, industry)' +
    'values(${stockname}, ${industry})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one stock'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function createHist(req, res, next) {
  req.body.open = parseFloat(req.body.open);
  req.body.high = parseFloat(req.body.high);
  req.body.low = parseFloat(req.body.low);
  req.body.close = parseFloat(req.body.close);
  req.body.adj_close = parseFloat(req.body.adj_close);
  req.body.volume = parseInt(req.body.volume);
  req.body.day = Date(req.body.day);
  db.none('insert into stock(stockid, day, open, high, low, close, volume, adj_close)' +
    'values((select stockid from stock where stockname = ${stockname}), ${day}, ${open},' +
    ' ${high}, ${low}, ${close}, ${volume}, ${adj_close})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one historical entry'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function mapnametoid(req, res, next) {
  db.one('select stockid from stock where stockname=${stockname}', req.body).then(function (data) {
      console.log(data);
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Got stock id'
        });
    })
    .catch(function (err) {
      console.log("error:",err);
      res.status(200)
        .json({
          status: 'success',
          message: err
        });
    });
}

function createLog(req, res, next) {
  req.body.stockid = parseInt(req.body.stockid);
  req.body.open = parseFloat(req.body.open);
  req.body.close = parseFloat(req.body.close);
  req.body.low = parseFloat(req.body.low);
  req.body.high = parseFloat(req.body.high);
  req.body.volume = parseInt(req.body.volume);
  req.body.adj_close = parseFloat(req.body.adj_close);
  req.body.trans_qty = parseInt(req.body.qty);
  req.body.trans_date = req.body.date;
  console.log("update portfolio: ",req.body)
  db.none('insert into history(stockid, day, open, high, low, close , volume, adj_close, quantity)' +
  'values(${stockid}, ${trans_date}, ${open}, ${high}, ${low}, ${close}, ${volume}, ${adj_close}, ${trans_qty})', req.body)

  db.none('insert into log(userid, stockid, trans_qty, trans_date)' +
    'values((select userid from users where username = ${username}), ' +
    '(select stockid from stock where stockname = ${stockname}), ${trans_qty}, ${trans_date})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one user transaction'
        });
    })
    .catch(function (err) {
      console.log("error:",err);
      res.status(200)
        .json({
          status: 'success',
          message: err
        });
    });
}

function createUser(req, res, next) {
  console.log(req);
  db.none('insert into users(username, password, role, email)' +
    ' values(${username},${password},${role} ,${email})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one user entry'
        });
    })
    .catch(function (err) {
      res.status(200)
        .json({
          status: 'failure',
          message: err.detail
        });
    });
}

function updateStock(req, res, next) {
  db.none('update stock set stockname = ${stockname1}, ' +
    'industry = ${industry} ' +
    'where stockname = ${stockname2}',
    [req.body])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated stock'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function updatePort(req, res, next) {

  db.none('update portfolio ' +
    'set qty = qty + ${qty} ' +
    'cost = cost + ${qty} * ' +
    '(select close from history where stockid = ' +
    '(select stockid from stock where stockname=${stockname})' +
    ' and day = ${day} )' +
    ' where stockid = (select stockid from stock where stockname=${stockname})' +
    ' and userid = (select userid from users where username=${username})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated portfolio'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateUser(req, res, next) {
  db.none('update users ' +
    'set username = ${username2}, ' +
    'password = ${password}, ' +
    'role = ${role}, ' +
    'email = ${email} ' +
    'where username = ${username1}',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated User'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeStock(req, res, next) {
  db.result('delete from stock where stockname = ${stockname}', req.body)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} Stock`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeUser(req, res, next) {
  db.result('delete from users where username = ${username}', req.body)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} User`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

function removePortTrig(req, res, next) {
  db.result('delete from portfolio where qty = 0', req.body)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} Portfolio entry`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

function removePort(req, res, next) {
  db.result('delete from portfolio ' +
    'where stockid = (select stockid from stock where stockname = ${stockname})' +
    ' and userid = (select userid from users where username = ${username})', req.body)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} Portfolio entry`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  
  authenticate: authenticate,
  getAllStocks: getAllStocks,
  getTopStocks: getTopStocks,
  getLowStocks: getLowStocks,
  getSingleStock: getSingleStock,
  getSensexPrice: getSensexPrice,
  getSensexHist: getSensexHist,
  getStockHist: getStockHist,
  getUserDetails: getUserDetails,
  getPortStocks: getPortStocks,
  getPortStockDetails: getPortStockDetails,
  getPortNetValue: getPortNetValue,
  getTransHist: getTransHist,
  createStock: createStock,
  createHist: createHist,
  createLog: createLog,
  createUser: createUser,
  updateStock: updateStock,
  updatePort: updatePort,
  updateUser: updateUser,
  removeStock: removeStock,
  removeUser: removeUser,
  removePortTrig: removePortTrig,
  removePort: removePort,
  mapnametoid: mapnametoid,
  getAllUsers: getAllUsers
};