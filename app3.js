/*
 * @Author: Liziming726 873884635@qq.com
 * @Date: 2022-10-29 12:15:01
 * @LastEditors: Liziming726 873884635@qq.com
 * @LastEditTime: 2022-10-29 12:15:05
 * @FilePath: \pachong2\app3.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use strict";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const fs = require('fs');
const moment = require('moment');
const Crawler = require('crawler');

const _prgname = 'doubanTop250';
class Douban{
    constructor() {
        this.writeStream = fs.createWriteStream('../result/' + _prgname + '_book_' + moment().format('YYYY-MM-DD') + '.csv');
        this.header = ['排名','标题','信息','评分','url','抓取时间'];
        this.rank = 1;
        this.crawler = new Crawler({
            maxConnection: 1,
            forceUTF8: true,
            rateLimit: 2000,
            jar: true,
            time: true,
            headers: {
                'User-Agent':`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36`//,
            }
        });
        this.crawler.on('drain', () => {
            console.log('Job done');
            //end stream
            this.writeStream.end();
        }).on('schedule', options => {
            //options.proxy = 'http://xxx.xxx.xx.xxx:xxxx';
            options.limiter = Math.floor(Math.random() * 10);//并发10
        });
    }

    start() {
        let self = this;
        self.writeStream.write(`\ufeff${self.header}\n`);
        console.log(`start`);
        this.crawler.queue({
            uri: 'https://book.douban.com/top250?icn=index-book250-all' ,
            method:'GET',
            gene:{
                page : 1
            },
            callback: this.pageList.bind(this)
        });
    }
    
    pageList(err, res, done) {
        let self = this;
        if (err) {
            console.log(`pageList got erro : ${err.stack}`);
            return done();
        }
        const gene = res.options.gene;
        const $ = res.$;
        $('#content > div > div.article > div.indent >table').map(function (){
            const title = $('tr > td:nth-child(2) > div.pl2 a ',this).text().trim().replace(/[,\r\n]/g, '');
            const src = $('tr > td:nth-child(2) > div.pl2 a',this).attr("href");
            const info = $('tr > td:nth-child(2) p.pl',this).text();
            const rate = $('tr > td:nth-child(2) span.rating_nums',this).text();
            const time = moment().format('YYYY-MM-DD HH:mm:ss');
            
            const result = [self.rank++, title, info, rate, src, time];
            console.log(`${result}\n`);
            self.writeStream.write(`${result}\n`);
        });

        if(gene.page <= 10){
            console.log(`currentPage : ${gene.page}`);
            this.crawler.queue({
                uri: 'https://book.douban.com/top250?start=' + gene.page*25,
                method:'GET',
                gene : {
                    page : gene.page + 1
                },
                callback: self.pageList.bind(self)
            });
        }
        return done();
    }
}
const douban = new Douban();
douban.start();
