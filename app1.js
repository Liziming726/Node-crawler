/*
 * @Author: Liziming726 873884635@qq.com
 * @Date: 2022-10-27 14:27:37
 * @LastEditors: Liziming726 873884635@qq.com
 * @LastEditTime: 2022-11-02 09:31:17
 * @FilePath: \pachong2\app1.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
var Crawler = require("crawler");
const Agent = require('socks5-https-client/lib/Agent');
var fs = require('fs');
var request = require('request');
var path = require('path');
const { error } = require("console");
// var mysql = require('mysql');

// var connection = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : '123456',
//     database : 'keaodata'
// });

// connection.connect();

//创建一个页码变量
// var page = 2;
// var main_url = 'https://www.ckcest.cn/entry/focus/list?index='+page
//共181页
var max_page = 50;
//创建一个数组，用来存放所有的url
var url_list = [];
//将url存入数组
url_list.push(main_url);

for(var a=1;a<=max_page;a++){
    var main_url = 'https://www.keoaeic.org/meeting?page='+a;
    url_list.push(main_url);
    var c = new Crawler({
        maxConnections: 10, // 最大链接数 10
        retries: 5, // 失败重连5次
        // rateLimit: 200,
        // agentClass: Agent,
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
            } else {
                //var $ = res.$;
                // $ is Cheerio by default
                //a lean implementation of core jQuery designed specifically for the server
                // console.log($("title").text());
            }
            done();
        }
    });
    c.on('schedule', function (options) {
        // options.proxy = proxy_url;
    });

    
    c.queue([{
        uri: main_url,
        jQuery: true,
        // proxy: proxy_url,
        // limiter: proxy_url,
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
            } else {
                // console.log(res.body)
                // const imgArr = JSON.parse(res.body).result.pics;
                // // downloadPic('http:'+imgArr[0].big_img,`./images/sign/sign_${(new Date()).getTime()}.jpg`,'http:'+imgArr[0].big_img)
                // imgArr.forEach(async (item,index)=>{
                //   await downloadPic('http:'+item.big_img,`./images/28flt/28flt_${(new Date()).getTime()}_${500+index}.jpg`,'http:'+item.big_img)
                // })
                var $ = res.$; // 这就可以想使用jQuery一个解析DOM了
                var len =  $(".meetList>a").length;
                var str = "";
                for(var i=0;i<len;i++){
                    // var type = $(".meetList>a").eq(i).find(".cardInner .oneLine").text();
                    var title = $(".meetList>a").eq(i).find(".cardInner .conts").text();
                    var times = $(".meetList>a").eq(i).find(".cardInner .layui-col-md11 span").text();
                    // var address = $(".meetList>a").eq(i).find(".cardInner .dateText").text();

                    str+="\n"+title+"\n"+times+"\n\n";
                }
                console.log(str);
                fs.writeFile('data1.txt', str, {flag: 'a'},(err) => {
                if(err){
                    console.log(err);
                } else {
                    // console.log("写入成功");
                }
            });
            // var total_pag = Number($(".next.page-numbers").prev().text());
                // new Array(total_pag - 246).fill('').forEach(function (item, index) {
                //     getID('具体id')
                // })
            }
            done();
        }
    }]);
}
