/*
 * @Author: Liziming726 873884635@qq.com
 * @Date: 2022-11-07 14:51:17
 * @LastEditors: Liziming726 873884635@qq.com
 * @LastEditTime: 2022-11-07 14:55:24
 * @FilePath: \pachong2\cheng.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
var request = require('request');
var iconv = require('iconv-lite')
const cheerio = require('cheerio');
const fs = require('fs') 
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'koadata'
})
connection.connect();

const requestPromise = (url) =>{
    return new Promise((resolve,reject) =>{
        request(url,{encoding:null},function(error,response,body){
            if(response.statusCode ===200){
                const bufs = iconv.decode(body,'utf-8');
                const html = bufs.toString('utf8');
                resolve(html);
            } else {
                reject(error)
            }
        })
    }).catch((err)=>{console.log(err);})
}

// const url = 'meeting?page=1';
const host = 'https://www.ckcest.cn/'

const getList = async(url) =>{
    const html = await requestPromise(url);
    const $ = cheerio.load(html);
    $('body > div.content > div.left > div > ul > li > h4 > a').each((i,item)=>{
        getMovieDetail($(item).attr('href'))
    })
}
const getMovieDetail = async(url) =>{
    const html = await requestPromise(host + url);
    const $ = cheerio.load(html);
    const content = []
    //文本内容
    content.push({content:$('body > div.max.container.bgfff.focusDetails-container > div.focusDetails-content.mt20 > p').text()})
    //图片
    $("body > div.max.container.bgfff.focusDetails-container > div.focusDetails-content.mt20 > p").each(function(idx,element){
        var $element = $(element);
        var $subElement = $element.find('img');
        var thumbImgSrc = $subElement.attr('src');
        if(thumbImgSrc !== undefined){
            content.push({
            images:thumbImgSrc
        })
        }
    })
//     fs.appendFile('content.txt',JSON.stringify(content),function(err){
//     })
//     console.log(content);
}

const arr = []
for(let i = 1;i<=200;i++){
    arr.push(`https://www.ckcest.cn/entry/focus/list?index=${i}`)
    // console.log(arr);
}

arr.reduce((rs,url) =>{
    return rs.then(()=>{
        return new Promise(async (resolve)=>{
            await getList(url)
            resolve();
        })
    }).catch((err)=>{console.log(err);})
},Promise.resolve())