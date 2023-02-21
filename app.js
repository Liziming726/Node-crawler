var Crawler = require("crawler");
const Agent = require('socks5-https-client/lib/Agent');
var fs = require('fs');
var request = require('request');
var path = require('path');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'sciencedata'
});

connection.connect();

//创建一个页码变量
// var page = 2;
// var main_url = 'https://www.ckcest.cn/entry/focus/list?index='+page
//共181页
var max_page = 181;
//创建一个数组，用来存放所有的url
var url_list = [];
//将url存入数组
url_list.push(main_url);
//遍历出所有的url
for(var a=1;a<=max_page;a++){
    var main_url = 'https://www.ckcest.cn/entry/focus/list?index='+a;
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
                var len =  $(".focusNews-list>li").length;
                var str = "";
                for(var i=0;i<len;i++){
                    var lll = $(".focusNews-list>li").eq(i).find(".foucsNews-title a").text()
                    var souce = $(".focusNews-list>li").eq(i).find(".foucsNews-infor p").text()
                    var author = $(".focusNews-list>li").eq(i).find(".foucsNews-infor>span").text()
                    str+=lll+"\n"+souce+"\n"+author+"\n\n"
                }
                console.log(str)
                fs.writeFile('data.txt', str, {flag: 'a'}, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('写入成功');
                    }
                });
                //将文件写入数据库
                var addSql = 'INSERT INTO science(title,source,author) VALUES(?,?,?)';
                var addSqlParams = [lll,souce,author];
                //增
                connection.query(addSql,addSqlParams,function (err, result) {
                    if(err){
                        console.log('[INSERT ERROR] - ',err.message);
                        return;
                    }
                    console.log('--------------------------INSERT----------------------------');
                    //console.log('INSERT ID:',result.insertId);
                    console.log('INSERT ID:',result);
                    console.log('-----------------------------------------------------------------\n\n');
                });
            }
            done();
        }
    }]);
}

//                 fs.writeFile('data.txt', str, {flag: 'a'}, function(err) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         console.log('写入成功');
//                     }
//                 });
//                 // var total_pag = Number($(".next.page-numbers").prev().text());
//                 // new Array(total_pag - 246).fill('').forEach(function (item, index) {
//                 //     getID('具体id')
//                 // })
//             }
//             done();
//         }
//     }]);
// }

    





//实现按页码爬取
// function getID(id) {
//     c.queue([{
//         uri: 'https://www.ckcest.cn/entry/focus/list?index='+page,
//         jQuery: true,
//         callback: function (error, res, done) {
//             if (error) {
//                 console.log(error);
//             } else {
//                 var $ = res.$; // 这就可以想使用jQuery一个解析DOM了
//                 var len =  $(".focusNews-list>li").length;
//                 var str = "";
//                 for(var i=0;i<len;i++){
//                     var lll = $(".focusNews-list>li").eq(i).find(".foucsNews-title a").text()
//                     str+=lll+"\n"
//                 }
//                 console.log(str)
//             }
//             done();
//         }
//     }]);
// }


// //获取每一页的图片id
// function getID(url) {
//     c.queue([{
//         uri: url,
//         jQuery: true,
//         callback: function (error, res, done) {
//             if (error) {
//                 console.log('id出错了---'+url)
//                 console.log(error);
//             } else {
//                 var $ = res.$; // 这就可以想使用jQuery一个解析DOM了
//                 var imgArr = $("#pins .lazy");
//                 imgArr.each(async (index, item)=> {
//                     var imgUrl = $(item).attr('data-original');
//                     var imgAlt = $(item).attr('alt').replace('?','');
//                     var mzIdUrl = $(item).parent().attr('href');
//                     // 一个id新建一个目录
//                     await fs.mkdirSync(`./images/${imgAlt}/`);
//                     getImages(mzIdUrl, imgAlt);
//                 })
//                 done();
//             }
//         }
//     }]);
// }

// // 获取具体的图片
// function getImages(url, dest) {
//     c.queue([{
//         uri: url,
//         jQuery: true,
//         callback: function (error, res, done) {
//             if (error) {
//                 console.log('getImages出错了---'+url)
//                 console.log(error);
//             } else {
//                 var $ = res.$; // 这就可以想使用jQuery一个解析DOM了
//                 // 获取页数
//                 var total_pag = Number($(".pagenavi a").eq(-2).find('span').text());
//                 // 先保存第一页的图片
//                 var mainImage = $(".main-image img").attr('src');
//                 // downloadPic(mainImage, `./images/${dest}/${(new Date()).getTime()}.jpg`, '')
//                 new Array(total_pag-1).fill('').forEach((item,index) => {
//                    getImagesItem(`${url}/${index + 2}`, dest,);
//                 })
//                 done();
//             }    
//         }
//     }]);
// }

// function getImagesItem(url, dest) {
//    c.queue([{
//         uri: url || '',
//         jQuery: true,
//         callback: function (error, res, done) {
//             if (error) {
//                 console.log('getImagesItem出错了---'+url)
//                 console.log(error);
//             } else {
//                 var $ = res.$; // 这就可以想使用jQuery一个解析DOM了
//                 var mainImage = $(".main-image img").attr('src');
//                 if(mainImage){
//                     downloadPic(mainImage, `./images/${dest}/${(new Date()).getTime()}.jpg`, url,done)
//                 }else{
//                     done()
//                 }
                
//             }
//         }
//     }]);
// }

// function downloadPic(src, dest,referer,callback) {
//     return new Promise((reslove,reject)=>{
//         request({
//             url: src,
//             // proxy: proxy_url,
//             headers: {
//                 'Referer': referer,
//             }
//         }).pipe(fs.createWriteStream(dest)).on('close', function () {
//             reslove('success')
//         })
//     })
    
// }



// function imgItem() {
// }