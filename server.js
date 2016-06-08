var express = require('express');
var cors = require('cors');
var moment = require('moment');
var querystring = require('querystring');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.use(cors());

app.get('/v1/tragolegal/:codigo', function(req, res){
   var codigo = req.params.codigo;
   var url = 'http://www.syctrace.com.co/testWs.aspx';
   
   var form = {
       codiSun : codigo.toUpperCase() //'3CM25KWTT1'
   };
   
   var formData = querystring.stringify(form);
   var contentLength = formData.length;
  
   request({
       headers: {
            'Accept':'*/*',//OBLIGATORIO
            // 'Accept-Encoding':'gzip, deflate',
            // 'Accept-Language':'es,en-US;q=0.8,en;q=0.6,gl;q=0.4',
            // 'Connection':'keep-alive',
            'charset': 'utf-8',
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
        res.setHeader('charset', 'utf-8');

        var horaActual = moment();

        var jsonResponse = {
            procesado : false,
            mensaje : '',
            codigo : form.codiSun,
            logError : '',
            fecha : horaActual,
            id : horaActual.unix() 
        };
            
       if(!error){
            
            var $ = cheerio.load(html);
            
            $("input[name$='txtXmlMsg']").filter(function () {
                var data = $(this);
                var dato = data.val();
                
                var autorizado = dato.indexOf("no autorizado") <= -1;// si no esta la palabra
                if(autorizado){
                    jsonResponse.procesado = true;
                    jsonResponse.mensaje = dato.substring(dato.indexOf("<normal>") + 8, dato.indexOf("</normal>") - dato.indexOf("<normal>") + 8) + '&%&';
                    jsonResponse.mensaje = jsonResponse.mensaje.substring(37, jsonResponse.mensaje.indexOf("&%&"));    
                }
                else{
                    jsonResponse.procesado = false;
                    jsonResponse.mensaje = 'Código no autorizado, verifíquelo y escríbalo nuevamente.';
                }
            })
            
            res.send(JSON.stringify(jsonResponse));
             
       }
       else{
           jsonResponse.mensaje = 'Error procesando la solicitud';
           jsonResponse.logError = error;
           res.send(JSON.stringify(jsonResponse));
       }
   });
   
});

app.listen('8081');
console.log('EL servidor esta iniciado en el puerto 8081');

exports = module.exports = app;