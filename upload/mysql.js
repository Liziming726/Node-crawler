/*
 * Created: 2020-03-08 15:39:07
 * Author : Mockingbird
 * Email : 1768385508@qq.com
 * -----
 * Description: 数据库配置
 */

const mysql = require('mysql')
const pool = mysql.createPool({
  // connectionLimit: 10,
  host: '172.16.245.84',
  port: 31620,
  user: 'root',
  password: 'chaosuan_pass',
  database: 'supportal'
})

const query = function(sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function(
      err,
      connection
    ) {
      if (err) {
        console.warn(err)
        reject(err)
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}
module.exports = {query}
