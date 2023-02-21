/*
 * @Author: Liziming726 873884635@qq.com
 * @Date: 2022-11-03 11:15:41
 * @LastEditors: Liziming726 873884635@qq.com
 * @LastEditTime: 2022-11-03 16:40:09
 * @FilePath: \pachong2\requesttwo.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
var request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
//连接数据库
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
    }).catch(err=>{err})
}

// const url = '/list?index=1'

const host = 'https://www.ckcest.cn/'

const getList = async (url) =>{
    const html = await requestPromise(url)
    const $ = cheerio.load(html);
        $('body > div.content > div.left > div > ul > li > h4 > a').each((i,item) => {
            getHref($(item).attr('href'))
            // console.log($(item).attr('href'))
        })
}


const getHref = async (url) => {
    const html = await requestPromise(host + url);
    const $ = cheerio.load(html);
    const science = {
        title: $('body > div.max.container.bgfff.focusDetails-container > h4').text(),
        source: $('body > div.max.container.bgfff.focusDetails-container > div.focusDetails-info.clearfix > span:nth-child(1)').text(),
        data: $('body > div.max.container.bgfff.focusDetails-container > div.focusDetails-info.clearfix > span:nth-child(2)').text(),
        content: $('body > div.max.container.bgfff.focusDetails-container').text(),
        // title: $('body > div.page-en > div.meetingHead > div > div.meetingHead-content-name.pb36 > h1').text(),
        // address: $('body > div.page-en > div.meetingHead > div > div.meetingHead-content-name.pb36 > div:nth-child(2) > span').text(),
        // time: $('body > div.page-en > div.meetingHead > div > div.meetingHead-content-name.pb36 > div:nth-child(3) > span').text().replace(/\s+/g,""),//此处存在问题 正则不会用
        // schedule: $('body > div.page-en > div.pt36.mb70 > div > div.rich-bg > div > table:nth-child(96)').text(),  //会议议程存在问题，每个议程的标签都不同
    }
    console.log(science);
    //存入数据库
    connection.query('INSERT INTO project SET ?', science, function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);
    }
    );
}

const arr = []

for(let i = 1; i <= 184; i++){
    arr.push(`${host}/entry/focus/list?index=${i}`)
}

arr.reduce((rs,url) =>{
    return rs.then(()=>{
        return new Promise(async (resolve) =>{
            await getList(url)
            resolve();
        })
    }).catch(err=>{err})
},Promise.resolve()).catch(err=>{err})

// console.log(arr);