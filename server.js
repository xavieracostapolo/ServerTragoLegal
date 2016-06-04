var express = require('express');
var fs = require('fs');
var querystring = require('querystring');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/tragolegal', function(req, res){
   
   var url = 'http://www.syctrace.com.co/testWs.aspx';
   
   var form = {
       codiSun : '3CM25KWTT1'
   };
   
   var formData = querystring.stringify(form);
   var contentLength = formData.length;
  
   request({
       headers: {
            'Accept':'*/*',//OBLIGATORIO
            // 'Accept-Encoding':'gzip, deflate',
            // 'Accept-Language':'es,en-US;q=0.8,en;q=0.6,gl;q=0.4',
            // 'Connection':'keep-alive',
            'Content-Length':contentLength,//OBLIGATORIO
            'Content-Type':'application/x-www-form-urlencoded',//OBLIGATORIO
            // 'Cookie':'NSC_sdpotvnp_wt_mc=ffffffff09181c6345525d5f4f58455e445a4a423660; __utmt=1; __utma=90809496.372950464.1464998234.1464998234.1465064699.2; __utmb=90809496.1.10.1465064699; __utmc=90809496; __utmz=90809496.1464998234.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)',
            // 'Host':'www.syctrace.com.co',
            // 'Origin':'http://www.syctrace.com.co',
            // 'Referer':'http://www.syctrace.com.co/',
            // 'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36'
        },
        uri: url,
        body: formData,
        method: 'POST'
   }, function(error, response, html){
       
        res.setHeader('Content-Type', 'application/json');
                    
        var procesado, mensaje, codigo;
        var jsonResponse = {
            procesado : false,
            mensaje : '',
            codigo : form.codiSun
        };
            
       if(!error){
            
            var $ = cheerio.load(html);
            
            $("input[name$='txtXmlMsg']").filter(function () {
                var data = $(this);
                var dato = data.val();
                jsonResponse.mensaje = dato.substring(dato.indexOf("<normal>") + 8, dato.indexOf("</normal>") - dato.indexOf("<normal>") + 8);
                console.log(dato);
            })
            
            jsonResponse.procesado = 'true';
            res.send(JSON.stringify(jsonResponse));
             
       }
       else{
           console.log(error);
           jsonResponse.mensaje = 'Error procesando la solicitud';
           res.send(JSON.stringify(jsonResponse));
       }
   });
   
});

app.get('/scrape', function(req, res){
    
    // The URL we will scrape from - in our example Anchorman 2.

    url = 'http://www.imdb.com/title/tt1229340/';

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request
        // res.send(html);
        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            // Finally, we'll define the variables we're going to capture

            var title, release, rating;
            var json = { title : "", release : "", rating : ""};
            
            $('.header').filter(function(){
                var data = $(this);
                title = data.children().first().text();
            
                release = data.children().last().children().text();

                json.title = title;
                json.release = release;
            })

            // Since the rating is in a different section of the DOM, we'll have to write a new jQuery filter to extract this information.

            $('.star-box-giga-star').filter(function(){
                var data = $(this);

                // The .star-box-giga-star class was exactly where we wanted it to be.
                // To get the rating, we can simply just get the .text(), no need to traverse the DOM any further

                rating = data.text();

                json.rating = rating;
            });
            
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(json));
            
        }
        else{
            console.log(error);
        }
    })
    
});

app.listen('8081');
console.log('EL servidor esta iniciado en el puerto 8081');

exports = module.exports = app;