/*
 * @Author: Liziming726 873884635@qq.com
 * @Date: 2022-11-02 10:09:21
 * @LastEditors: Liziming726 873884635@qq.com
 * @LastEditTime: 2022-11-14 21:20:35
 * @FilePath: \pachong2\request.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
var request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'koadata'
})
connection.connect();

const requestPromise = (url)=>{
    return new Promise((resolve,reject)=>{
        request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          resolve(body);
        }else{
            reject(error)
        }
      })
    })
}

const url = '/meeting?page=1'

const host = 'https://www.keoaeic.org'

const getList = async (url) =>{
    const html = await requestPromise(url)
    const $ = cheerio.load(html);
        $('.meetList a').each((i,item) => {
            getHref($(item).attr('href'))
            // console.log($(item).attr('href'))
        })
}


const getHref = async (url) => {
    const html = await requestPromise(host + url);
    const $ = cheerio.load(html);
    const science = {
        title: $('body > div.page-en > div.meetingHead > div > div.meetingHead-content-name.pb36 > h1').text(),
        address: $('body > div.page-en > div.meetingHead > div > div.meetingHead-content-name.pb36 > div:nth-child(2) > span').text(),
        starttime: $('body > div.page-en > div.meetingHead > div > div.meetingHead-content-name.pb36 > div:nth-child(3) > span').text().replace(/\s+/g,"").slice(0,15),//去掉所有空格
        endtime: $('body > div.page-en > div.meetingHead > div > div.meetingHead-content-name.pb36 > div:nth-child(3) > span').text().replace(/\s+/g,"").slice(16,31),
        content: $('body > div.page-en > div.pt36.mb70 > div > div.rich-bg').text().replace(/\s+/g,""),  //会议议程存在问题，改为content
        attendmeeting: $('body > div.page-en > div.meetingHead > div > div.cutdown > div.cutdown-color.pb36 > div:nth-child(3) > div.re-left > a').attr('href'),
    }
    console.log(science);
    //存入数据库
    connection.query('INSERT INTO last SET ?', science, function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);
    }
    );
}

const arr = []

for(let i = 1; i <= 50; i++){
    arr.push(`${host}/meeting?page=${i}`)
}

arr.reduce((rs,url) =>{
    return rs.then(()=>{
        return new Promise(async (resolve) =>{
            await getList(url)
            resolve();
        })
    })
},Promise.resolve())

// console.log(arr);
