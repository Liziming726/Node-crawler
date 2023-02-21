var request = require('request');
var iconv = require('iconv-lite')
const cheerio = require('cheerio');
const fs = require('fs') 

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
    const content = {
        title:$('body > div.max.container.bgfff.focusDetails-container > h4').text(),
        source:$('body > div.max.container.bgfff.focusDetails-container > div.focusDetails-info.clearfix > span:nth-child(1)').text(),  
        times:$('body > div.max.container.bgfff.focusDetails-container > div.focusDetails-info.clearfix > span:nth-child(2)').text(),  
        // address:$('body > div > div.meetingHead > div > div.meetingHead-content-name.pb36 > div:nth-child(2) > span').text(),
        // times:$('body > div > div.meetingHead > div > div.meetingHead-content-name.pb36 > div:nth-child(3) > span').text().replace(/\s+/g,"")
    };
    fs.appendFile('index.txt',JSON.stringify(content),function(err){
    })
    console.log(content);
}

const arr = []
for(let i = 1;i<=184;i++){
    arr.push(`https://www.ckcest.cn/entry/focus/list?index=${i}`)
    // console.log(arr);
}

arr.reduce((rs,url) =>{
    return rs.then(()=>{
        return new Promise(async (resolve)=>{
            await getList(url)
 resolve();
        })
    })
},Promise.resolve())