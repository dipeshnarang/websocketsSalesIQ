const mariadb=require('mariadb')

const connectionPool = mariadb.createPool({
    host: 'localhost',
    user:'zohosales', 
    password: 'zohosales',
    database:'salesiq'
});

module.exports={
    connectionPool:connectionPool
}
