/*
 * Created: 2021-03-11 14:47:06
 * Author : Mockingbird
 * Email : 1768385508@qq.com
 * -----
 * Description: 上传文件到fastdfs
 */
var fs = require('fs');
var path = require("path");
const moment = require('moment-mini')
var pathName = "./../images/sign/"; //读取的文件夹
var filename = "./sign.txt"; // 写入的目录
var FdfsClient = require('fastdfs-client');
const { query } = require('./mysql');

const fastdfs_host = '172.16.245.84'
const fastdfs_port = 30694

var fdfs = new FdfsClient({
  // tracker servers
  trackers: [
      {
          host: fastdfs_host,
          port: fastdfs_port
      }
  ],
  // 默认超时时间10s
  timeout: 10000,
  // 默认后缀
  // 当获取不到文件后缀时使用
  defaultExt: 'jpg',
  // charset默认utf8
  charset: 'utf8'
});


// 读取目录文件写入txt
function main(){
    // 先读再写
    fs.readdir(pathName, function(err, files){
        var dirs = [];
        (function iterator(i){
          if(i == files.length) {
            fs.writeFile(filename, dirs.join('\n'), function (error) {
                if (error) {
                  console.log('写入失败')
                } else {
                  console.log('写入成功了')
                  // 读取
                  read()
                }
              })
            return ;
          }
          fs.stat(path.join(pathName, files[i]), function(err, data){     
            if(data.isFile()){               
                dirs.push(files[i]);
            }
            iterator(i+1);
           });   
        })(0);
    });
}

// 读取text的内容，执行上传
async function readFile(filename){
    return new Promise((resolve,reject)=>{
        fs.readFile(filename, function (error, data) {
            if (error) {
            // 在这里就可以通过判断 error 来确认是否有错误发生
            reject('读取失败')
            } else {
                // <Buffer 68 65 6c 6c 6f 20 6e 6f 64 65 6a 73 0d 0a>
            // 文件中存储的其实都是二进制数据 0 1
            // 这里为什么看到的不是 0 和 1 呢？原因是二进制转为 16 进制了
            // 但是无论是二进制01还是16进制，人类都不认识
            // 所以我们可以通过 toString 方法把其转为我们能认识的字符
            resolve(data.toString())
            }
        })
    })
    
}

// 读取
async function read(){
  var str = await readFile(filename)
  var dirs = str.split('\n')
  var a = 'group1/M00/00/02/wKj4y2BK1I-AVBJAAAG9EFAtmlI053.jpg'
  const sql = 'insert into expo(id,path,e_type,doc,created_at,deleted) VALUES(0,?,?,?,?,?)'
  
  for(let i=0;i<dirs.length;i++){
    try {
      var a = await upload(pathName,dirs[i])
      // 操作数据库
      await query(sql,[a,1,'',moment.utc().format('YYYY-MM-DD HH:mm:ss'),0])
      console.log(a)
    } catch (error) {
      console.log(error)
    }
  }
}

// upload
async function upload(pathName,file){
  return new Promise((resolve,reject)=>{
    fdfs.upload(pathName+file).then(function(fileId) {
      // fileId 为 group + '/' + filename
      resolve(fileId);
  }).catch(function(err) {
    reject(err);
    }
  );
  })
} 
// getStr()
main()