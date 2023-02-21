var Crawler = require("crawler");
const Agent = require('socks5-https-client/lib/Agent');
var fs = require('fs');
var request = require('request');
var path = require('path');

// const main_url = 'http://sk.ncer.top'
const main_url = 'https://www.mzitu.com'
// const page_url = 'https://www.mzitu.com/page/2/'
const proxy_url = 'http://127.0.0.1:7890'


var c = new Crawler({
    maxConnections: 10, // 最大链接数 10
    retries: 5, // 失败重连5次
    rateLimit: 200,
    agentClass: Agent,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($("title").text());
        }
        done();
    }
});

c.on('schedule', function (options) {
    options.proxy = proxy_url;
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
            var $ = res.$; // 这就可以想使用jQuery一个解析DOM了
            var total_pag = Number($(".next.page-numbers").prev().text());
            new Array(total_pag - 246).fill('').forEach(function (item, index) {
                getID(`https://www.mzitu.com/page/${index+2}/`)
            })
        }
        done();
    }
}]);



//获取每一页的图片id
function getID(url) {
    c.queue([{
        uri: url,
        jQuery: true,
        callback: function (error, res, done) {
            if (error) {
                console.log('id出错了---'+url)
                console.log(error);
            } else {
                var $ = res.$; // 这就可以想使用jQuery一个解析DOM了
                var imgArr = $("#pins .lazy");
                imgArr.each(async (index, item)=> {
                    var imgUrl = $(item).attr('data-original');
                    var imgAlt = $(item).attr('alt').replace('?','');
                    var mzIdUrl = $(item).parent().attr('href');
                    // 一个id新建一个目录
                    await fs.mkdirSync(`./images/${imgAlt}/`);
                    getImages(mzIdUrl, imgAlt);
                })
                done();
            }
        }
    }]);
}

// 获取具体的图片
function getImages(url, dest) {
    // https://www.mzitu.com/232347
    c.queue([{
        uri: url,
        jQuery: true,
        callback: function (error, res, done) {
            if (error) {
                console.log('getImages出错了---'+url)
                console.log(error);
            } else {
                var $ = res.$; // 这就可以想使用jQuery一个解析DOM了
                // 获取页数
                var total_pag = Number($(".pagenavi a").eq(-2).find('span').text());
                // 先保存第一页的图片
                var mainImage = $(".main-image img").attr('src');
                // downloadPic(mainImage, `./images/${dest}/${(new Date()).getTime()}.jpg`, 'http://www.mzitu.com/')
                new Array(total_pag-1).fill('').forEach((item,index) => {
                   getImagesItem(`${url}/${index + 2}`, dest,);
                })
                done();
            }    
        }
    }]);
}

function getImagesItem(url, dest) {
    // https://www.mzitu.com/232347/2
   c.queue([{
        uri: url || '',
        jQuery: true,
        callback: function (error, res, done) {
            if (error) {
                console.log('getImagesItem出错了---'+url)
                console.log(error);
            } else {
                var $ = res.$; // 这就可以想使用jQuery一个解析DOM了
                var mainImage = $(".main-image img").attr('src');
                if(mainImage){
                    downloadPic(mainImage, `./images/${dest}/${(new Date()).getTime()}.jpg`, url,done)
                }else{
                    done()
                }
                
            }
        }
    }]);
}

function downloadPic(src, dest,referer,callback) {
    request({
        url: src,
        proxy: proxy_url,
        headers: {
            'Referer': referer,
        }
    }).pipe(fs.createWriteStream(dest)).on('close', function () {
        console.log(src)
        callback&&callback()
    })
}



function imgItem() {
    // https://www.mzitu.com/230840/4
}