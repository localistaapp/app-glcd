var express = require('express');
//var shrinkRay = require('shrink-ray');
var app = express();
var path = require('path');
var webpush = require('web-push');
var fs = require('fs');
var url = require('url');
var redis = require('redis');
var loggr = require("loggr");
var request= require('request');
var { Client } = require('pg');
var { Pool } = require('pg');
var axios = require('axios');
var crypto = require('crypto');
var QRCode = require('qrcode');
const { OpenAI } = require('openai');
//var mergeImages = require('merge-images');
var base64 = require('file-base64');
//const { Canvas, Image } = require('canvas');
var LocationService = require('./src/server/locations/location-service.js');
var GeofencingService = require('./src/server/geofencing/geofencing-service.js');
var PricingService = require('./src/server/pricing/pricing-service.js');
const pgClient = new Client({
      host: 'ec2-54-247-188-247.eu-west-1.compute.amazonaws.com',
      port: 5432,
      database: 'dcrgs2nbc0i5vf',
      user: 'nrgkzvyxpdfhkb',
      password: '39798783ada15727c8bd9f24bb6c5808d313ab686991c4aca62e3db947cb016c',
      ssl: true
    });
let dbConfig = {
       database: 'slimcrust',
       host: 'dpg-cc6s37pgp3jupk0q3tu0-a.singapore-postgres.render.com',
         port: 5432,
         user: 'slimcrust',
         password: '3oXJwFL9ytuMtD7ofv5uhr7LceQVBTsv',
         ssl: { rejectUnauthorized: false },
         keepAlive:true
     }
// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
let promptCache = {};
let promptPreAssessCache = {};
const orderid = require('order-id')('randomgenid');
var redisURLVal = process.env.REDISCLOUD_URL || 'redis://rediscloud:vWISiXr6xai89eidZYXjM0OK3KeXfkPU@redis-16431.c10.us-east-1-2.ec2.cloud.redislabs.com:16431';
redisURL = url.parse(redisURLVal);
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var client = require('flipkart-api-affiliate-client');
var uuid = require('uuid-v4');
var http = require("https");
var httpServ = require('http').createServer (app);
var io = require('socket.io')(httpServ);
var DEVELOPER_ACCESS_TOKEN = '7311e67496773579a7924b37e2086b32e68de0a0298890ae236b598d507f0b40';
var shoppingCriteriaMap = {keywords: []};
var shoppingCriteriaUUIDMap = {};
var userCriteriaSelection = {};
var resultsQuery = '';

var goToValKeywords = ["5cbecf1bf96720080791819c", "5cbecf92f96720df8f9181b2", "5cbecfe0dd2e6e8a776f9ee8", "5cbecfe6dd2e6e34916f9eef", "5cbecfeadd2e6e2a0f6f9ef1", "5cbecfeedd2e6e73a56f9ef3", "5cbecff5dd2e6eb3646f9ef6", "5cbecff9f96720ad639181c6"];
var goToValBudgets = ["5cbed205f967203cf9918240", "5cbed20af9672091f0918242", "5cbed20fdd2e6e7eb56f9f60", "5cbed214f96720ea24918248"];
//questionCriteraNameMap
//answer 1 - Object.keys(k)[1]
//answer 2 - Object.keys(k)[2]
//answer 3 - Object.keys(k)[3]
//answer 4 - Object.keys(k)[0]
//answer 5 - Object.keys(k)[4]

var recentlyResearchedImgs = ["https://rukminim1.flixcart.com/image/800/800/jt1tq4w0/smart-band-tag/r/d/b/waterproof-smart-m3-band-black-01-mezire-original-imafccx5gsdhxuh5.jpeg?q=90", "https://rukminim1.flixcart.com/image/800/800/jtrjngw0/mobile/2/t/v/realme-3-rmx1825-original-imaferd5uzuyxrsv.jpeg?q=90","https://rukminim1.flixcart.com/image/800/800/jfsknm80/tablet/f/m/c/apple-mrjp2hn-a-original-imaf46khz8vftwnf.jpeg?q=90","https://rukminim1.flixcart.com/image/800/800/j3lwh3k0/power-bank/y/x/t/power-bank-it-pb-20k-poly-intex-original-imaeupg8dfgtsrfw.jpeg?q=90","https://rukminim1.flixcart.com/image/800/800/jfsknm80/smart-assistant/j/q/h/home-mini-ghmini-chalk-google-original-imaf46ev9a8xkahw.jpeg?q=90"];

var fkClient = new client({
    trackingId:"attiristf",
    token:"1b6372cefdf64b2cbe7c5d8491d2f528",
},"json");

/*fkClient.doIdSearch('MOBFAJB4CWKAZGPZ').then(function(value){
        //console.log(value); //object with status, error and body
});

fkClient.doKeywordSearch("mobiles under 8000",10).then(function(value){
        console.log(value); //object with status, error and body
});*/

//var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
//client.auth('vWISiXr6xai89eidZYXjM0OK3KeXfkPU');
var keyName = 0;
var valName = 0;

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
//app.use(app.json());       // to support JSON-encoded bodies
//app.use(app.urlencoded()); // to support URL-encoded bodies


var pages = [];
  fs.readFile("public/index.html", "utf8", function(err, data) {
    pages.index = data;
  });

  fs.readFile("public/franchise.html", "utf8", function(err, data) {
    pages.franchise = data;
  });

  fs.readFile("public/search.html", "utf8", function(err, data) {
      pages.search = data;
    });

    fs.readFile("public/guide.html", "utf8", function(err, data) {
          pages.guide = data;
        });

    fs.readFile("public/picks.html", "utf8", function(err, data) {
              pages.picks = data;
            });

  fs.readFile("public/products.html", "utf8", function(err, data) {
    pages.products = data;
  });

  fs.readFile("public/getQuote.html", "utf8", function(err, data) {
    pages.getQuote = data;
  });

  fs.readFile("public/getSlot.html", "utf8", function(err, data) {
    pages.getSlot = data;
  });

  fs.readFile("public/ingredients.html", "utf8", function(err, data) {
    pages.ingredients = data;
  });

  fs.readFile("public/startYourOwn.html", "utf8", function(err, data) {
    pages.startYourOwn = data;
  });

io.on('connection', function(socket){
  console.log('a user connected');
});

app.set('port', (process.env.PORT || 5000));

//app.use(shrinkRay());
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

const MERCHANT_ID = 'PGTESTPAYUAT77';
const MERCHANT_KEY = '14fa5465-f8a7-443f-8477-f986b8fcfde9';

function generateTokenUrl(merchantId, merchantSecret, callbackUrl) {
  const timestamp = Date.now().toString();
  const data = `${merchantId}|${timestamp}|${callbackUrl}`;
  
  const hmac = crypto.createHmac('sha256', merchantSecret);
  hmac.update(data);
  const signature = hmac.digest('hex');
  
  const tokenUrl = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay/initialize?merchantId=${merchantId}&timestamp=${timestamp}&signature=${signature}`;
  return tokenUrl;
}

app.get('/questions/:role/:stack', async (req, res) => {
  let role = req.params.role;
  let stack = req.params.stack;

  if(promptCache[role+'-'+stack] != null) {
    console.log('---cache hit---');
    res.send(promptCache[role+'-'+stack]);
  } else {
    try {
      const prompt = `
      For a ${role} working on ${stack} tech stack,
       can you share a tota lof 15 multiple choice questions to check whether he has higher order design skills focusing on five important skill categories such as for example system design? But keep it medium in complexity.
  Return in JSON array format like [{"question":"","question":[{"option":"A","text":""}]},...].
  `;
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });
      console.log('--response--', response.choices[0].message);
      const messages = response.choices[0].message.content;
      promptCache[role+'-'+stack] = messages;
      res.send(messages);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error generating questions");
    }
  }

  
});

app.post('/preassess', async (req, res) => {
  //response.send(pages.startYourOwn);
  var selections = req.body.selections;

  if(promptPreAssessCache[JSON.stringify(selections)] != null) {
    console.log('---preassess cache hit---');
    res.send(promptPreAssessCache[JSON.stringify(selections)]);
  } else {
    try {
        const prompt = `
        Given the responses for the above questions in the format [{"question":"..", "selectedOptions":["A","C"]},...] are ${JSON.stringify(selections)}, come up with
a skills evaluation for the 5 skills the questions were focusing on and share the evaluation in the format
 [{"header":"SKILL GAP ANALYSIS","captions":["skill1","skill2","skill3","skill4","skill5"],"values":[0.5,0.5,0.5,0.5,0.5]}]. 
Replace skill1, skill2 etc with actual skill names and values with the evaluation score with each evaluation score ranging from 0 to 1
    `;
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        });
        console.log('--response--', response.choices[0].message);
        const messages = response.choices[0].message.content;
        promptPreAssessCache[JSON.stringify(selections)] = messages;
        res.send(messages);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error generating questions");
      }
  }
 });

app.get('/pp-token', function(request, response) {
  const merchantId = MERCHANT_ID;
const merchantSecret = MERCHANT_KEY;
const callbackUrl = '/pp-success';

const tokenUrl = generateTokenUrl(merchantId, merchantSecret, callbackUrl);
console.log('--Token URL:--', tokenUrl);

});

app.get('/cyber-leaks/:email', function(request, response) {
  let email = request.params.email;

  axios.get('https://leakcheck.io/api/v2/query/'+email, {
    headers: {
    'Accept': 'application/json',
    'X-API-Key': '928cbc88988acd70188030109ee9f24080955071',
  }}).then(cyberLeaksResponse => {
          if (cyberLeaksResponse != null && cyberLeaksResponse.hasOwnProperty('data')) {
            response.send(cyberLeaksResponse.data);
          } else {
            response.send('not found');
          }
       }).catch(err => {
          console.log('---Fetch error---', err);
       });
      
});

app.post('/payment-pg-success', (req, res) => {
  console.log('Webhook received:', req.body);
  let providerRefId = req.body.providerReferenceId;

  // Do something with the webhook data
  // ...

  // Generate a QR code from the UUID
  QRCode.toDataURL(providerRefId, function (err, url) {
    if (err) {
      console.error('Error generating QR code:', err);
      return;
    }
    console.log('Generated QR code:', url);
    const base64Data = url.replace(/^data:image\/png;base64,/, '');
    const urlSafeBase64Data = encodeURIComponent(url);
    console.log('QR code base64:', base64Data);
    // Redirect to another URL
    res.redirect(301, '/cafe/acceldata?qr='+urlSafeBase64Data);
  });

  
});

app.get('/create-pg-payment', (req, res) => {
  const { amount, orderId, redirectUrl } = req.query;
  console.log('--amount--', amount);

  const payload = {
    "merchantId": "PGTESTPAYUAT77",
    "merchantTransactionId": "ORDER12345",
    "merchantUserId": '123',
    "amount": amount * 100,
    "redirectUrl": "http://localhost:5000/payment-pg-success",
    "redirectMode": "POST",
    "callbackUrl": "http://localhost:5000/payment-pg",
    "mobileNumber": "1234567890",
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  }

  const payloadStr = JSON.stringify(payload);
  let base64EncodeStr = new Buffer.from(payloadStr).toString('base64');

  const checksum = crypto.createHash('sha256').update(base64EncodeStr+'/pg/v1/pay'+MERCHANT_KEY)
                         .digest('hex');

  console.log('--checksum--', checksum + '###' + '1');

  const options = {
    url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum + '###' + '1',
    },
    body: '{"request":"'+base64EncodeStr+'"}'
  };

  request.post(options, (error, response, body) => {

    //console.log('--res--', response);
    if (error) {
      console.log('--err--', error);
      res.status(500).send('Error creating payment request');
    } else {
      console.log('--body--', body);
      const responseBody = JSON.parse(body);
      if (responseBody.success) {
        //res.status(200).send(responseBody.data.instrumentResponse.redirectInfo.url);
        res.redirect(responseBody.data.instrumentResponse.redirectInfo.url);
      } else {
        res.status(500).send(responseBody.message);
      }
    }
  });
});

app.post('/create-payment', (req, res) => {
  const { amount, orderId, redirectUrl } = req.body;

  const payload = {
    "merchantId": "PGTESTPAYUAT77",
    "merchantTransactionId": "ORDER12345",
    "merchantUserId": MERCHANT_KEY,
    "amount": 10000,
    "redirectUrl": "https://your-website.com/payment-success",
    "redirectMode": "POST",
    "callbackUrl": "https://webhook.site/85dc0642-586a-4d96-9d5a-e827b7170070",
    "mobileNumber": "1234567890",
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  }

  const data = JSON.stringify(payload);

  const checksum = crypto.createHmac('sha256', MERCHANT_KEY)
                         .update(data)
                         .digest('hex');

  console.log('--checksum--', checksum + '###' + '1');

  const options = {
    url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': '3cadfcc71275f846d27bca8aef01c838f04665884e1f7fb7c436f61e9d7473ed' + '###' + '1',
    },
    body: '{"request":"ewogICAgIm1lcmNoYW50SWQiOiAiUEdURVNUUEFZVUFUNzciLAogICAgIm1lcmNoYW50VHJhbnNhY3Rpb25JZCI6ICJPUkRFUjEyMzQ1IiwKICAgICJtZXJjaGFudFVzZXJJZCI6ICIxMjMiLAogICAgImFtb3VudCI6IDEwMDAwLAogICAgInJlZGlyZWN0VXJsIjogImh0dHBzOi8veW91ci13ZWJzaXRlLmNvbS9wYXltZW50LXN1Y2Nlc3MiLAogICAgInJlZGlyZWN0TW9kZSI6ICJQT1NUIiwKICAgICJjYWxsYmFja1VybCI6ICJodHRwczovL3dlYmhvb2suc2l0ZS84NWRjMDY0Mi01ODZhLTRkOTYtOWQ1YS1lODI3YjcxNzAwNzAiLAogICAgIm1vYmlsZU51bWJlciI6ICIxMjM0NTY3ODkwIiwKICAgICJwYXltZW50SW5zdHJ1bWVudCI6IHsKICAgICAgInR5cGUiOiAiUEFZX1BBR0UiCiAgICB9CiAgfQ=="}'
  };

  console.log('--data--', data);

  request.post(options, (error, response, body) => {

    //console.log('--res--', response);
    if (error) {
      console.log('--err--', error);
      res.status(500).send('Error creating payment request');
    } else {
      console.log('--body--', body);
      const responseBody = JSON.parse(body);
      if (responseBody.success) {
        res.status(200).send(responseBody.data.instrumentResponse.redirectInfo.url);
      } else {
        res.status(500).send(responseBody.message);
      }
    }
  });
});



app.get('/courses', function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'list.html'));
});

function updateQuestion(uuid, interactionId, num, question, outputStr, resp, gotoVal, keywords, budgetArr, nextQuestionInteractionVal) {
  var options = {
        "method": "PUT",
        "hostname": "api.chatbot.com",
        "port": null,
        "path": "/stories/5cb8b496f96720dfac900749/interactions/"+interactionId,
        "headers": {
            "content-type": "application/json",
            "authorization": "Bearer "+DEVELOPER_ACCESS_TOKEN
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            console.log('data: ', chunk);
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log('resp body: ', body.toString());
            storyId = JSON.parse(body.toString()).id;
            console.log('storyId: ', storyId);
            let output = {
                statusCode: 200,
                body: storyId,
             };

          });
       });

       var buttonStr = '';//[{\"type\":\"goto\",\"title\":\"yes\",\"value\":\""+gotoVal+"\"},{\"type\":\"postback\",\"title\":\"Not really\",\"value\":\"\"}]
       var buttons = [];

       if(num == 4) {
         console.log('--keywords--', keywords);
         for(var i in keywords) {
            if(i>7){
              break;
            }
            var btn = {type:'goto',title:keywords[i].keyword.substr(0,16)+'...', value: goToValKeywords[i]};
            buttons.push(btn);
         }

         buttonStr = JSON.stringify(buttons);
         //buttonStr = buttonStr.replace(/"/g, '\\"');
         console.log('buttonStr: ', buttonStr);
         req.write("{\"name\":\"question"+num+"\",\"action\":\"\",\"userSays\":[],\"triggers\":[],\"parameters\":[],\"responses\":[{\"type\":\"quickReplies\",\"title\":\""+question+"?\",\"buttons\":"+buttonStr+",\"filters\":[],\"delay\":100}]}");
       } else if (num == 5) {
         console.log('--budgetArr--', budgetArr);
         for(var i in budgetArr) {
            var btn = {type:'goto',title:budgetArr[i], value: goToValBudgets[i]};
            buttons.push(btn);
         }

         buttonStr = JSON.stringify(buttons);
         //buttonStr = buttonStr.replace(/"/g, '\\"');
         console.log('buttonStr: ', buttonStr);
         req.write("{\"name\":\"question"+num+"\",\"action\":\"\",\"userSays\":[],\"triggers\":[],\"parameters\":[],\"responses\":[{\"type\":\"quickReplies\",\"title\":\""+question+"?\",\"buttons\":"+buttonStr+",\"filters\":[],\"delay\":100}]}");
       } else {
         if(num == 1) {
           req.write("{\"name\":\"question"+num+"\",\"action\":\"\",\"userSays\":[],\"triggers\":[],\"parameters\":[],\"responses\":[{\"type\":\"setAttributes\",\"filters\":[],\"elements\":[{\"action\":\"set\",\"name\":\"default_id\",\"value\":\""+uuid+"\"}]},{\"type\":\"quickReplies\",\"title\":\""+question+"?\",\"buttons\":[{\"type\":\"goto\",\"title\":\"yes\",\"value\":\""+gotoVal+"\"},{\"type\":\"goto\",\"title\":\"Not really\",\"value\":\""+nextQuestionInteractionVal+"\"}],\"filters\":[],\"delay\":100}]}");
         } else {
           req.write("{\"name\":\"question"+num+"\",\"action\":\"\",\"userSays\":[],\"triggers\":[],\"parameters\":[],\"responses\":[{\"type\":\"quickReplies\",\"title\":\""+question+"?\",\"buttons\":[{\"type\":\"goto\",\"title\":\"yes\",\"value\":\""+gotoVal+"\"},{\"type\":\"goto\",\"title\":\"Not really\",\"value\":\""+nextQuestionInteractionVal+"\"}],\"filters\":[],\"delay\":100}]}");
         }
       }

       req.end();
}

function constructQuestion(questionNum, specObj, quickQuestionTemplates) {
    let specName = specObj.key; //{key: "Display Features", values: Array(6)}
    let suffix = "";

    console.log('specObj.values.length: ', specObj.values.length);
    if(specObj.values.length == 1) {
      suffix = specName + ' like ' + specObj.values[0].key;
      shoppingCriteriaMap[specName] = [specObj.values[0].key];
    } else if(specObj.values.length >= 2) {
      suffix = specName + ' like ' + specObj.values[0].key + " and " + specObj.values[1].key;
      shoppingCriteriaMap[specName] = [specObj.values[0].key, specObj.values[1].key];
    }

    let question = quickQuestionTemplates[questionNum] + suffix;

    if(quickQuestionTemplates[questionNum].indexOf('Lot of online users considered') !== -1) {
      question = question + '. Do you wish to add these to your search'
    }
    //question += '?';
    return {qnum: questionNum, question};
}

function positiveScore(link) {
  let score = 0;
  if(link.indexOf('things to condier') != -1 || link.indexOf('factors to condier') != -1 || link.indexOf('guide') != -1)  {
    score = 10;
  } else if(link.indexOf('facotrs') != -1 || link.indexOf('consider') != -1 || link.indexOf('keep in mind') != -1) {
    score = 5;
  } else {
    score = 2;
  }
  return score;
}

function negativeScore(link) {
  let score = 0;
  if(link.indexOf('hdfc') != -1) {
    score = 10;
  } else if(link.indexOf('Where to shop') != -1 || link.indexOf('where to buy') != -1 || link.indexOf('Where to <b>buy') != -1 || link.indexOf('where to <b>buy') != -1) {
    score = 5;
  }
  return score;
}

function calculateScore(link) {
  return positiveScore(link) - negativeScore(link);
}

function getSortOrder(prop) {
    return function(a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

function getBuyingGuideSearchLink(htmlContent) {
    let linkScore = [];
    let htmlStr = htmlContent.substr(htmlContent.indexOf('Web results')+'Web results'.length, htmlContent.length);
    let links = htmlStr.split('<a href="');
    links.shift();
    links.shift();
    links.shift();
    for (i in links) {
      let link = links[i].substr(links[i].indexOf('">')+2, links[i].indexOf('</a>'));
      console.log('links[i]: ', link);
      let score = calculateScore(link);
      let ls = {score, link};
      linkScore.push(ls);
    }
    linkScore.sort(getSortOrder("score"))
    let selectedLink = linkScore[linkScore.length - 1];
    let finalLink = '';
    for(var i in links) {
      if(links[i].indexOf(selectedLink.link) != -1) {
        finalLink = links[i];
        break;
      }
    }
    finalLink = finalLink.substr(finalLink.indexOf('url?q=')+6, finalLink.indexOf('&amp')).replace(/&amp;sa/,'');
    return finalLink;
}

function getBrands(q, budgetSuffix, resp) {

  let productsByBrand = {};
  let fetchCount = 0;



 var options = {
        "method": "GET",
        "hostname": "www.flipkart.com",
        "port": null,
        "path": "/search?q="+q.replace(/ /,'+')
    };
    console.log('url:', options.path);
  var req = http.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            //console.log('data: ', chunk);
            chunks.push(chunk);
        });

        var extract = [];

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            //console.log('syntax: ', body.toString());
            //resp.send(body.toString());

            var summaryText = body.toString();

            summaryText = summaryText.substring(summaryText.indexOf('Brand</div>')+11, summaryText.indexOf('MORE</span>'));
            console.log('summaryText: ', summaryText);
            let summaryArr = summaryText.split('<div class="_1GEhLw">');
            summaryArr.shift();

            //console.log('brandIndex: ', brandIndex);
            for(var j in summaryArr) {
              //console.log('item:',summaryArr[j].sentence);
              extract.push(summaryArr[j].substring(0,summaryArr[j].indexOf('</div>')));

            }

            console.log('extract: ',extract);
            for(var i in extract) {
              var brandName = extract[i];
              fkClient.doKeywordSearch(extract[i]+' '+q+budgetSuffix).then(function(value){
                  productTitle = JSON.parse(value.body).products[0].productBaseInfoV1.title;
                  var productBrand = JSON.parse(value.body).products[0].productBaseInfoV1.productBrand


                  productTitle = productTitle.indexOf(" ") != -1 ? productTitle.split(" ")[0]+'%2B'+productTitle.split(" ")[1] : productTitle;
                  console.log('productTitle:', productTitle);



                  let productsRanked = [];
                  let products = JSON.parse(value.body).products;
                  for(var i=0;i<products.length;i++) {
                    let product = {title: products[i].productBaseInfoV1.title, img: products[i].productBaseInfoV1.imageUrls['800x800'],
                      mrp: products[i].productBaseInfoV1.maximumRetailPrice.amount, specialPrice: products[i].productBaseInfoV1.flipkartSpecialPrice.amount,
                      attributes: products[i].productBaseInfoV1.attributes, keySpecs: products[i].categorySpecificInfoV1.keySpecs,
                      detailedSpecs: products[i].categorySpecificInfoV1.detailedSpecs};
                    productsRanked.push(product);
                  }

                  productsByBrand[productBrand] = productsRanked;
                  io.emit('product-found', { for: 'everyone', title: productTitle });
                  fetchCount++;
                  if(fetchCount==extract.length) {
                    resp.send(productsByBrand);
                  }

              });
            }

          });
       });

  /*var req = http.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log('body: ', body.toString());
            var extract = body.toString();
            extract = extract.substr(extract.indexOf('Brand'),extract.indexOf(' MORE'));
            extract = extract.split('\n');
            extract.shift();
            extract = extract.slice(0,6);
            console.log('extract: ', extract);


            for(var i in extract) {
              var brandName = extract[i];
              fkClient.doKeywordSearch(extract[i]+' '+q+budgetSuffix).then(function(value){
                  productTitle = JSON.parse(value.body).products[0].productBaseInfoV1.title;
                  var productBrand = JSON.parse(value.body).products[0].productBaseInfoV1.productBrand


                  productTitle = productTitle.indexOf(" ") != -1 ? productTitle.split(" ")[0]+'%2B'+productTitle.split(" ")[1] : productTitle;
                  console.log('productTitle:', productTitle);



                  let productsRanked = [];
                  let products = JSON.parse(value.body).products;
                  for(var i=0;i<products.length;i++) {
                    let product = {title: products[i].productBaseInfoV1.title, img: products[i].productBaseInfoV1.imageUrls['800x800'],
                      mrp: products[i].productBaseInfoV1.maximumRetailPrice.amount, specialPrice: products[i].productBaseInfoV1.flipkartSpecialPrice.amount,
                      attributes: products[i].productBaseInfoV1.attributes, keySpecs: products[i].categorySpecificInfoV1.keySpecs,
                      detailedSpecs: products[i].categorySpecificInfoV1.detailedSpecs};
                    productsRanked.push(product);
                  }

                  productsByBrand[productBrand] = productsRanked;
                  io.emit('product-found', { for: 'everyone', title: productTitle });
                  fetchCount++;
                  if(fetchCount==extract.length) {
                    resp.send(productsByBrand);
                  }

              });
            }

          });
       });*/

       req.end();
}

function getArticle(q, resp, productPrice) {
  var options = {
        "method": "GET",
        "hostname": "www.google.co.in",
        "port": null,
        "path": "/search?q=what+to+look+for+when+buying+a+"+q+"+in+india"
    };
  var req = http.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            console.log('data: ', chunk);
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log('resp body: ', body.toString());
            let buyingGuideSearchLink = getBuyingGuideSearchLink(body.toString());
            let keywords = getKeywords(q, buyingGuideSearchLink, resp, productPrice);
          });
       });

       req.end();
}

function getBudget(resp, productPrice) {
    let budgetRanges = [];
    if(productPrice < 5000) {
      budgetRanges.push('1 to 2k');budgetRanges.push('2 to 3k');budgetRanges.push('3 to 4k');budgetRanges.push('4000+');
    } else if(productPrice >= 5000 && productPrice < 10000) {
      budgetRanges.push('2 to 5k');budgetRanges.push('5 to 8k');budgetRanges.push('8 to 12k');budgetRanges.push('12000+');
    } else if(productPrice >= 10000 && productPrice < 25000) {
      budgetRanges.push('5 to 10k');budgetRanges.push('10 to 15k');budgetRanges.push('15 to 20k');budgetRanges.push('20k+');
    } else if(productPrice >= 20000 && productPrice < 50000) {
      budgetRanges.push('15 to 25k');budgetRanges.push('25 to 35k');budgetRanges.push('35 to 45k');budgetRanges.push('45k++');
    } else if(productPrice >= 50000) {
      budgetRanges.push('40 to 60k');budgetRanges.push('60 to 80k');budgetRanges.push('80 to 1Lakh');budgetRanges.push('1Lakh+');
    }
    updateQuestion(resp.uuid, '5cbb5ca8dd2e6e52316ebf74',5, "Sure. what’s the budget range you’re looking at?", '', resp, '5cbb64b5dd2e6e840e6ec0ca', [], budgetRanges);
    shoppingCriteriaMap.budgetRanges = budgetRanges;
    shoppingCriteriaUUIDMap[resp.uuid] = shoppingCriteriaMap;
    resp.send(shoppingCriteriaUUIDMap);
}

function getKeywords(q, url, resp, productPrice) {
  var options = {
        "method": "GET",
        "hostname": "www.summarizebot.com",
        "port": null,
        "path": "/api/summarize?apiKey=2842d14a3a2545d19938a34566dd1e38&size=20&keywords=10&fragments=15&url="+url
    };
  var req = http.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            console.log('data: ', chunk);
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log('keywords: ', body.toString());
            //resp.send(body.toString());
            var keywordsJson = JSON.parse(body.toString());
            var keywords = keywordsJson[1].keywords;
            var keywordsArr = [];
            for (var i in keywords) {
              if(keywords[i] !== q) {
                keywordsArr.push(keywords[i]);
                if(i<=7) {
                  shoppingCriteriaMap.keywords.push({index: i, keyword: keywords[i].keyword});
                }
              }
            }

            updateQuestion(resp.uuid, '5cbb2b95dd2e6e9ad36eb5b9',4, "Which of these is a must have for you?", '', resp, '5cbb5e27dd2e6e9c5b6ebfb2', keywordsArr);

            getBudget(resp, productPrice);
          });
       });

       req.end();
}

app.get('/getRecentlyResearched', function(request, resp) {
  resp.send(recentlyResearchedImgs);
});

app.get('/fetchWishList', function(request, response) {
  let query = request.query["main"];
  query = query.indexOf('under') != -1 ? query.substr(0, query.indexOf('under')) : query;
  let budgetStr = request.query["q"].indexOf(',') != -1 ? request.query["q"].split(',').filter((elem)=>elem.indexOf(' to ')!=-1) : '';
  let budgetSuffix='';
  if(budgetStr && budgetStr.length) {
    let actualBudgetStr = '';
    actualBudgetStr = budgetStr[0].split(' to ')[1].indexOf('lakh') == -1 ? budgetStr[0].split(' to ')[1].replace('k','000') : budgetStr[0].split(' to ')[1];
    budgetSuffix += " under " + actualBudgetStr;
  }

  getBrands(query, budgetSuffix, response);

  let criteria = request.query["q"].split(',');
  criteria.pop(); //remove budget criteria*/

  /*if(criteria && criteria.length > 1) {
    for(let i in criteria) {
      if(i == 0) {
        query += " with best "+criteria[i].split(' ')[0];
      } else if(i==1) {
        query += " and "+criteria[i].split(' ')[0];
      }
    }
  } else {
    query += " with best "+criteria[0].split(' ')[0];
  }*/

  //cut short query if conditions more than two


});

app.get('/invokeChat', function(request, resp) {
  const response = {
        statusCode: 200,
        body: request.query.q,
    };
    let body = "";
    resp.uuid = uuid();
    userCriteriaSelection[resp.uuid] = [];
    var storyId = '';
    var integrationId = '';
    var integrationScript = undefined;

    let productTitle = '';
    let productPrice = '';
    let shoppingSearchSpecs = [];
    let reviewedSpecs = [];
    let productTitleForReviewSearch = '';
    let productReviewPageLink = '';
    let productReviewText = '';
    let specRelevanceArray = [{name: '', relevance: 3}]; //spec name string, value score
    let quickQuestionTemplates = ["Do you want to consider ","Lot of online users considered ", "How about "];
    let featureSuggestTemplate ="Also, does any of the below features sound relevant";
    shoppingCriteriaMap = {keywords: []};
    console.log('resp.uuid: ',resp.uuid);
    let questionNum = 0;


    return fkClient.doKeywordSearch(request.query["q"],10).then(function(value){
        productTitle = JSON.parse(value.body).products[0].productBaseInfoV1.title;
        io.emit('product-found', { for: 'everyone', title: productTitle });

        productPrice = JSON.parse(value.body).products[0].productBaseInfoV1.maximumRetailPrice.amount;
        try {
          let productImg = JSON.parse(value.body).products[0].productBaseInfoV1.imageUrls['800x800'];
          /*if (productImg && productImg!=null && productImg!='') {
            if(recentlyResearchedImgs.length >= 5) {
              recentlyResearchedImgs = [];
              recentlyResearchedImgs.push(productImg);
            } else {
              recentlyResearchedImgs.push(productImg);
            }

          }*/
        }catch(e){
          console.log('Error loading researched images.');
        }
        console.log('Body: ', value.body);

        shoppingSearchSpecs = JSON.parse(value.body).products[0].categorySpecificInfoV1.specificationList;
        shoppingSearchSpecs.shift();
        if(shoppingSearchSpecs.length >= 1) {
          let questionNum = Math.floor(Math.random() * 2);
          let q1 = constructQuestion(questionNum, shoppingSearchSpecs[0], quickQuestionTemplates);
          console.log('question 1: ', q1.question);

          updateQuestion(resp.uuid, '5cb8c5f1f967202ea5900e2f',1, q1.question, productTitle, resp, "5cb8d781dd2e6ef9bb6e3b3d",null,null,"5cb98762f967201188903bea");
        }
        if(shoppingSearchSpecs.length >= 2) {
          questionNum = questionNum == 0 ? 1 : 0;
          let q2 = constructQuestion(questionNum, shoppingSearchSpecs[1], quickQuestionTemplates);
          console.log('question 2: ', q2.question);

          updateQuestion(resp.uuid, '5cb98762f967201188903bea',2, q2.question, productTitle, resp, "5cb9d13ff96720733d905af6",null,null,"5cb9d15edd2e6eb11b6e78f8");
        }
        if(shoppingSearchSpecs.length >= 3) {
          questionNum = 2;
          let q3 = constructQuestion(questionNum, shoppingSearchSpecs[2], quickQuestionTemplates);
          console.log('question 3: ', q3.question);

          updateQuestion(resp.uuid, '5cb9d15edd2e6eb11b6e78f8',3, q3.question, productTitle, resp, "5cbb2b83f967200300909b2e",null,null,"5cbb2b95dd2e6e9ad36eb5b9");
        }

        //request to google for "shopping guide" request
        let q = request.query["q"].indexOf(" ") != -1? request.query["q"].split(' ')[0] : request.query["q"];
        let articleHTML = getArticle(q, resp, productPrice) ;

        console.log('articleHTML: ', articleHTML);


        //resp.send("success");

    });

});

app.post('/captureChatData', (req, res) => {
    // check if verification token is correct
    if (req.query.token !== 'ka935tutur') {
        return res.sendStatus(401);
    }

    let uuid = req.body.result.sessionParameters.default_id;
    console.log('user uuid:', uuid);
    console.log('webhook data: ', JSON.stringify(req.body));

    switch(req.body.result.interaction.name) {
      case 'capture answer 1':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[1]]);
        break;
      case 'capture answer 2':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[2]]);
        break;
      case 'capture answer 3':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[3]]);
        break;
      case 'capture answer 4a':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[0]].filter((elem)=>{return elem.index === '0'})[0].keyword);
        break;
      case 'capture answer 4b':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[0]].filter((elem)=>{return elem.index === '1'}))[0].keyword;
        break;
      case 'capture answer 4c':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[0]].filter((elem)=>{return elem.index === '2'})[0].keyword);
        break;
      case 'capture answer 4d':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[0]].filter((elem)=>{return elem.index === '3'})[0].keyword);
        break;
      case 'capture answer 4e':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[0]].filter((elem)=>{return elem.index === '4'})[0].keyword);
        break;
      case 'capture answer 4f':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[0]].filter((elem)=>{return elem.index === '5'})[0].keyword);
        break;
      case 'capture answer 4g':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[0]].filter((elem)=>{return elem.index === '6'})[0].keyword);
        break;
      case 'capture answer 4h':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[0]].filter((elem)=>{return elem.index === '7'})[0].keyword);
        break;
      case 'capture answer 5a':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[4]][0]);
        io.emit('shopping parameters captured', {q: userCriteriaSelection[uuid].toString()});
        break;
      case 'capture answer 5b':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[4]][1]);
        io.emit('shopping parameters captured', {q: userCriteriaSelection[uuid].toString()});
        break;
      case 'capture answer 5c':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[4]][2]);
        io.emit('shopping parameters captured', {q: userCriteriaSelection[uuid].toString()});
        break;
      case 'capture answer 5d':
        userCriteriaSelection[uuid] = userCriteriaSelection[uuid].concat(shoppingCriteriaUUIDMap[uuid][Object.keys(shoppingCriteriaUUIDMap[uuid])[4]][3]);
        io.emit('shopping parameters captured', {q: userCriteriaSelection[uuid].toString()});
        break;
    }
    // return challenge
    // return a text response
    const data = {
        responses: [
            {
                type: 'text',
                elements: []
            }
        ]
    };


    console.log('parameters captured: ', userCriteriaSelection);

    res.json(data);
});

app.get('/sendnotif', function(request, response) {
    // VAPID keys should only be generated only once.
    var vapidKeys = webpush.generateVAPIDKeys();

    webpush.setGCMAPIKey('AAAAb0Jcd5Y:APA91bF0de1UNG5yFMZinQhn1We89nTyigofC-kIrTGeM2RoI4bgSXUcYyUy17W4IgRJborqAENOb-t4zEo2MQD32LoAr64KFQdb8CPKdV-yOzVdG7RDhrWcqTvx96Yaf9_oQsX70Yl-');
    //Above is obtained from https://console.firebase.google.com/project/push-notification-web-d0beb/settings/cloudmessaging

    webpush.setVapidDetails(
      'mailto:sampath.oops@gmail.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    var pushSubscription = {
      endpoint: 'https://android.googleapis.com/gcm/send/fiSjtrIp9u0:APA91bF9zt6Q2nTmvAXeq7_bUzdD9GopkXfSmpW2kkbEGAluHCdzSRutceviXn4Xcu8E1r1PS4aUsfIXq4I5zTrxYNXaM03q0hUyH3QiNdpw7MqQt60xmuEPWEe3amVo3dH96TWOe_P5',
      keys: {
        auth: 'b-UTZCGu2p735HpH1g5g4w==',
        p256dh: 'BAtnK3PMuoczYKkRi2Iqzz-BJnPo1ZUhk_9ontvTVWcVLmFy44dN_RoiCfIy22y03TASWlbRxxuVlntwCVf8_e8='
      }
    };

    webpush.sendNotification(pushSubscription, 'First notification.')
    .then(function(result){
      console.log(result)
    }).catch(function(error){
      console.log('error', error)
    });

});

app.get('/fit-test', function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'steps.html'));
});

app.get("/index", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'guide.html'));
});

app.get("/mytasks", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'mytasks.html'));
});

app.get("/checker/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'shortlists.html'));
});

app.get("/assess/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'assess.html'));
});

app.get("/home/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'shortlists.html'));
});

app.post("/home/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'shortlists.html'));
});

app.get("/events/v1", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'v1cred.html'));
});

app.get("/booking-success/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'shortlists.html'));
});

app.get("/process/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'process.html'));
});

app.get("/orders/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/club/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'club.html'));
});

app.get("/cafe/:cafeId", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'corporatepwa.html'));
});


app.get("/franchise/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'franchise.html'));
});

app.get("/reset/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'reset_session.html'));
});

app.get("/packages/:id", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'shortlists.html'));
});

app.get("/order-detail/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-quote/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-quote-res/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-enquiries/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/web-orders/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-create-order/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-store-inventory/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-store-checklist/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-store-onboarding/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-create-enquiry/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-create-sample-order/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-create-store/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-create-store-order/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/dashboard-pay-store-order/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/store-location-planner/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/store/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'orders.html'));
});

app.get("/stage2/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'process.html'));
});

app.get("/stage3/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'process.html'));
});

app.get("/terms/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'terms.html'));
});

app.get("/memory", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'memory.html'));
});

app.get("/bake", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'bake.html'));
});

app.get("/redirect/", function(request, response) {
  let paymentStatus = 'PENDING';
  let paymentRequestId = request.query.payment_request_id;
  if(request.query.payment_status == 'Credit') {
    paymentStatus = 'PAID';
  } else {
    paymentStatus = request.query.payment_status;
  }

  const client = new Client(dbConfig)
              client.connect(err => {
                if (err) {
                  console.error('error connecting', err.stack)
                } else {
                  console.log('connected')
                  client.query("UPDATE \"public\".\"sample_order\" set order_status = $1 WHERE payment_request_id = $2",
                      [paymentStatus, paymentRequestId], (err, res) => {
                            if (err) {
                              console.log(err);
                            } else {
                              console.log(response);
                            }

                          });
                }
              })
  response.sendFile(path.resolve(__dirname, 'public', 'shortlists.html'));
});

app.post("/setCOD", function(request, response) {
  let paymentStatus = 'COD';
  let orderId = request.body.orderId;

  const client = new Client(dbConfig)
              client.connect(err => {
                if (err) {
                  console.error('error connecting', err.stack)
                } else {
                  console.log('connected')
                  client.query("UPDATE \"public\".\"sample_order\" set status = $1 WHERE order_id = $2",
                      [paymentStatus, orderId], (err, res) => {
                            if (err) {
                              console.log(err);
                            } else {
                              console.log(response);
                            }
                            response.send('success');
                          });
                }
              })
});

app.get("/credits/", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'shortlists.html'));
});

app.get("/data/:task/:loc/:zone", function(request, response) {
  const fs = require('fs');
  let rawdata = fs.readFileSync('./src/data-source/'+request.params.task+'/'+request.params.loc+'/'+request.params.zone+'/mockDataQnA.json');
  response.send(rawdata);
});

app.get("/cafe/data/:id", function(request, response) {
  const fs = require('fs');
  let rawdata = fs.readFileSync('./src/data-source/cafe/'+request.params.id+'/mockDataQnA.json');
  response.send(rawdata);
});

app.get("/data/:task/:loc/:zone/starter", function(request, response) {
  const fs = require('fs');
  let rawdata = fs.readFileSync('./src/data-source/'+request.params.task+'/'+request.params.loc+'/'+request.params.zone+'/mockDataStarter.json');
  response.send(rawdata);
});

app.get("/products", function(request, response) {
  //Todo: comment above n uncomment below
  response.send(pages.products);
});

app.get("/getQuote", function(request, response) {
  response.send(pages.getQuote);
});

app.get("/getSlot", function(request, response) {
  response.send(pages.getSlot);
});

app.get("/ingredients", function(request, response) {
  response.send(pages.ingredients);
});

app.get('/quoteChecker', function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'quoteChecker.html'));
});

app.get('/franchise', function(request, response) {
 //response.send(pages.startYourOwn);
 response.sendFile(path.resolve(__dirname, 'public', 'startYourOwn.html'));
});

app.get('/corporate', function(request, response) {
  //response.send(pages.startYourOwn);
  response.sendFile(path.resolve(__dirname, 'public', 'corporate.html'));
 });

app.get('/privacy-policy', function(request, response) {
 //response.send(pages.startYourOwn);
 response.sendFile(path.resolve(__dirname, 'public', 'privacy.html'));
});



app.get('/getIngredients', function(request, response) {
 var uid = request.query.u;
 console.log('--user id--', uid);
 client.get(uid, function (err, reply) {
    if (reply != null) {
      var recipeJson = reply;
      var ingredientsRecommender = new IngredientsRecommender();
      var allIngredients = ingredientsRecommender.getAllIngredients(recipeJson);
      response.send(allIngredients);
    } else {
      response.send("key not found");
    }
  });

});

app.post('/franchiseEnquiry', function(req, res) {
 //response.send(pages.startYourOwn);
 var email = req.body.email,
        members = req.body.members
        client.set(members, email);
 res.sendFile(path.resolve(__dirname, 'public', 'franchiseEnquiry.html'));
});

app.post('/paymentRequest', function(req, res) {
    const orderId = req.body.orderId;
    const slot = req.body.slot;
    var headers = { 'X-Api-Key': 'b442e3b63d6c01b2e7fdb49e14e8a069', 'X-Auth-Token': '96650eeefedf39e2bbdb32d8496f0ca2'}
    //amount: req.body.amount,
    var payload = {
      purpose: 'Pizza order',
      amount: req.body.amount,
      phone: req.body.phone,
      name: req.body.phone,
      redirect_url: 'https://www.slimcrust.com/redirect/',
      send_email: false,
      send_sms: false,
      allow_repeated_payments: false}

    request.post('https://www.instamojo.com/api/1.1/payment-requests/', {form: payload,  headers: headers}, function(error, response, body){
      if(!error && response.statusCode == 201){
        console.log('-----im response body: ', body);
        console.log('-----payment request id: ', JSON.parse(body).payment_request.id);

        let paymentRequestId = JSON.parse(body).payment_request.id;
        const client = new Client(dbConfig)
            client.connect(err => {
              if (err) {
                console.error('error connecting', err.stack)
              } else {
                console.log('connected')
                client.query("UPDATE \"public\".\"sample_order\" set payment_request_id = $1, delivery_slot = $3 WHERE order_id = $2",
                    [paymentRequestId, orderId, slot], (err, response) => {
                          if (err) {
                            console.log(err)
                            res.send(body);
                          } else {
                            console.log(response)
                             res.send(body);
                          }

                        });
              }
            })



      }
    })
})


/*app.post('/selfie', function(req, res) {

       const selfie = req.body.dataURL;
       console.log('---selfie---', selfie);
       let fileExtensionArr = selfie.split('base64,');

       let fileExtension = fileExtensionArr[0].split('data:image/')[1].replace(';','');
       //decode base64 image
         var matches = selfie.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
           response = {};

         if (matches.length !== 3) {
           return new Error('Invalid input string');
         }

         response.data = selfie.split(",")[1];



         // Defaults
         var defaultOptions = {
         	format: 'image/png',
         	quality: 0.92,
         	width: undefined,
         	height: undefined,
         	Canvas: undefined,
         	crossOrigin: undefined
         };

         // Return Promise
         var mergeImages = function (sources, options) {
         	if ( sources === void 0 ) sources = [];
         	if ( options === void 0 ) options = {};

         	return new Promise(function (resolve) {
         	options = Object.assign({}, defaultOptions, options);

         	// Setup browser/Node.js specific variables
         	var canvas = options.Canvas ? new options.Canvas() : window.document.createElement('canvas');
         	var Image = options.Image || window.Image;

         	// Load sources
         	var images = sources.map(function (source) { return new Promise(function (resolve, reject) {

         	    console.log('--source--', source);
         		// Convert sources to objects
         		if (source.constructor.name !== 'Object') {
         			source = { src: source };
         		}

         		// Resolve source and img when loaded
         		var img = new Image();
         		img.crossOrigin = options.crossOrigin;
         		img.onerror = function () { return reject(new Error('Couldn\'t load image')); };
         		img.onload = function () { return resolve(Object.assign({}, source, { img: img })); };
         		img.src = source.src;
         	}); });

         	// Get canvas context
         	var ctx = canvas.getContext('2d');

         	// When sources have loaded
         	resolve(Promise.all(images)
         		.then(function (images) {
         			// Set canvas dimensions
         			var getSize = function (dim) { return options[dim] || Math.max.apply(Math, images.map(function (image) { return image.img[dim]; })); };
         			canvas.width = getSize('width');
         			canvas.height = getSize('height');

         			// Draw images to canvas
         			images.forEach(function (image) {
         				ctx.globalAlpha = image.opacity ? image.opacity : 1;
         				return ctx.drawImage(image.img, image.x || 0, image.y || 0);
         			});

         			if (options.Canvas && options.format === 'image/jpeg') {
         				// Resolve data URI for node-canvas jpeg async
         				return new Promise(function (resolve, reject) {
         					canvas.toDataURL(options.format, {
         						quality: options.quality,
         						progressive: false
         					}, function (err, jpeg) {
         						if (err) {
         							reject(err);
         							return;
         						}
         						resolve(jpeg);
         					});
         				});
         			}

         			// Resolve all other data URIs sync
         			return canvas.toDataURL(options.format, options.quality);
         		}));
         });
         };



         mergeImages(['public/img/images/sbg.jpg',{ src: selfie.replace(/ /g, "+"), x: 630, y: 540 }],
         {
           Canvas: Canvas,
           Image: Image
         })
           .then((b64) => {console.log('merged');console.log('merged image: ', b64);res.send(b64);});




   });*/

app.post('/homelyOrder', function(req, res) {

    const mobile = req.body.dMobile;
    const name = req.body.dName;
    const orderId = orderid.generate();
    let whitelisted = false;
    const status = 'PENDING';
    const summary = req.body.dItems;
    const deliverySlot = req.body.dSlot;
    const price = req.body.dPrice;
    const address = req.body.dAddress;
    const pincode = req.body.dPincode;
    const referralCode = req.body.referralCode;
    const eOrderId = req.body.eOrderId;

    //res.send('{"orderId":"'+orderId+'", "whitelisted":true}');

    const client = new Client(dbConfig)
    client.connect(err => {
      if (err) {
        console.error('error connecting', err.stack)
      } else {
        console.log('connected')


            client.query("INSERT INTO \"public\".\"sample_order\"(delivery_mobile, delivery_name, order_id, order_status, delivery_slot, delivery_price, delivery_items, delivery_address, delivery_pincode, event_order_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
                        [mobile, name, orderId, status, deliverySlot, price, summary, address, pincode, eOrderId], (err, response) => {
                              if (err) {
                                console.log(err)
                                 res.send("error");
                              } else {
                                console.log(response);
                                axios
                                  .post('https://api.pushalert.co/rest/v1/send', 'title=Order%20Received&message=New%20Pizza%20Order&icon=https://www.slimcrust.com/rounded.png&url=https://www.slimcrust.com', {headers: {'Authorization': 'api_key=c0a692d5772f7c2b7642013d80439aea'}})
                                  .then(res => {
                                    console.log('Pushalert success: ', res);
                                  })
                                  .catch(error => {
                                    console.log('Pushalert error: ', error);
                                  });
                                 res.send('{"orderId":"'+orderId+'", "whitelisted":true}');
                              }

                            });


      }
    })


})

app.get("/event-orders/:email", function(req, res) {
  let email = req.params.email;
  email = email.replace('owner@','@');
  const client = new Client(dbConfig)

  client.connect(err => {
        if (err) {
          console.error('error connecting', err.stack)
          res.send('{}');
        } else {
          console.log('connected');
            let franchiseWhereClause = '';
            if (email != null && email != '' && email != 'support@slimcrust.com') {
              franchiseWhereClause = "and franchise_email IN ('"+email+"')";
            } else {
              franchiseWhereClause = '';
            }
          client.query("Select event_date, event_time, pizza_quantity, wraps_quantity, garlic_bread_quantity, quote_price, venue_address, event_contact_mobile, venue_map_url, booking_amount_paid, customer_name, topping_ingredients, extras, special_ingredients, size, comments, order_status, order_id, order_type From confirmed_order where order_status IN ('COMPLETED','CONFIRMED') "+franchiseWhereClause,
                      [], (err, response) => {
                            if (err) {
                              console.log(err)
                               res.send("error");
                            } else {
                               res.send(response.rows);
                            }

                          });
        }
      })
});

app.get("/enquiry-orders/:location/:franchiseId", function(req, res) {
  let location = req.params.location;
  const client = new Client(dbConfig)

  client.connect(err => {
        if (err) {
          console.error('error connecting', err.stack)
          res.send('{}');
        } else {
          console.log('connected')
          let franchiseId = req.params.franchiseId;
          let franchiseWhereClause = '';
          if (franchiseId != null && franchiseId != '' && franchiseId != '1') {
            franchiseWhereClause = " and location =  '" + location +"'";
          } else {
            franchiseWhereClause = '';
          }
          client.query("Select distinct date as event_date, num_guests as quantity, mobile as event_contact_mobile, id as order_id From booking where status IN ('PENDING') "+franchiseWhereClause,
                      [], (err, response) => {
                            if (err) {
                              console.log(err)
                               res.send("error");
                            } else {
                               res.send(response.rows);
                            }

                          });
        }
      })
});

app.get("/stats/:email", function(req, res) {
  let orderStatus = req.params.status;
  let origEmail = req.params.email;
  email = origEmail.replace('owner@','@');
  let franchiseWhereClause1 = '';
  let franchiseWhereClause2 = '';
  const client = new Client(dbConfig)

client.connect(err => {
        if (err) {
          console.error('error connecting', err.stack)
          res.send('{}');
          client.end();
        } else {
  client.query("Select id from franchise where owner_email IN ('"+email+"') ",
                        [], (err, response) => {
                              if (err) {
                                console.log(err)
                                 res.send("error");
                                 client.end();
                              } else {
                                 //res.send(response.rows);
                                 if (response.rows.length == 0) {
                                    res.send("auth error");
                                    client.end();
                                 } else {
                                    let franchiseId = response.rows[0]['id'];
                                    if (franchiseId != null && franchiseId != '' && franchiseId != '1') {
                                        franchiseWhereClause1 = 'where franchise_id = '+franchiseId;
                                        franchiseWhereClause2 = 'and franchise_id = '+franchiseId;
                                      } else {
                                        franchiseWhereClause1 = '';
                                        franchiseWhereClause2 = '';
                                      }

                                    
                                      //if email contains owner, change query
                                    let statsQuery ="SELECT SUM (quote_amt) as sales FROM confirmed_order where event_date >= to_char(current_date, 'YYYY-MM-01') and event_date <= to_char(current_date, 'YYYY-MM-31') "+franchiseWhereClause2;
                                    if (origEmail.indexOf('owner') >= 0) {
                                      console.log('--franchiseId--', franchiseId);
                                      client.query("Select id from store where franchise_id = "+franchiseId,
                                      [], (errNested, responseNested) => {
                                            if (errNested) {
                                              console.log(errNested)
                                              res.send("error");
                                              client.end();
                                            } else {
                                              console.log('--franchiseStoreId--', responseNested.rows[0]['id']);
                                              let franchiseStoreId = responseNested.rows[0]['id'];
                                              console.log('--statsQuery 1--', statsQuery);
                                              
                                              client.query(statsQuery,
                                                [], (err, response) => {
                                                      if (err) {
                                                        console.log(err)
                                                         res.send("error");
                                                         client.end();
                                                      } else {
                                                        let eventOrders = response.rows[0].sales;
                                                        
                                                        let storeStatsQuery ="select sum(discounted_price) as sales from store_order where store_id IN (select id from store "+franchiseWhereClause1+") and status = 'PAID' and created_at >= date_trunc('month', current_date) AND created_at < date_trunc('month', current_date) + interval '1 month'";
                                                        console.log('-storeStatsQuery-', storeStatsQuery);    
                                                          client.query(storeStatsQuery,
                                                              [], (storeErr, storeResponse) => {
                                                                    if (storeErr) {
                                                                      console.log(storeErr)
                                                                      res.send("error");
                                                                      client.end();
                                                                    } else {
                                                                      let storeOrders = storeResponse.rows[0].sales;
                                                                      console.log('--event orders--', eventOrders);
                                                                      console.log('--storeOrders orders--', storeOrders);                                                  
              
                                                                      
                                                                      res.send('{"eventSales":'+eventOrders+',"storeSales":'+storeOrders+'}');
                                                                      client.end();
                                                                    }
                      
                                                                  });
                                                         //res.send(response.rows);
                                                         //client.end();
                                                      }
         
                                                    });
                                            }});
                                     
                                      } else {
                                        statsQuery = statsQuery + "";
                                        console.log('--statsQuery 2--', statsQuery);
                                        client.query(statsQuery,
                                          [], (err, response) => {
                                                if (err) {
                                                  console.log(err)
                                                   res.send("error");
                                                   client.end();
                                                } else {
                                                   res.send(response.rows);
                                                   client.end();
                                                }
   
                                              });
                                      }
                                    }
                                    

                              }

                            });
        }
    });
});

app.get("/locations-reach/:loc", function(req, res) {
  let loc = req.params.loc;
  console.log('--Location--', loc);
  const localities = LocationService.fetchLocalities();
  res.send(localities);
});

app.get("/locations/:loc", function(req, res) {
  let loc = req.params.loc;
  const localities = LocationService.fetch(loc);
  res.send(localities);
});

app.get("/nearby/:loc", function(req, res) {
  let loc = req.params.loc;
  const localities =  LocationService.fetchNearByPlaces(loc).then((data)=> {
    res.send(data);
  });
  
});

app.get("/franchise-profile/:email", function(req, res) {
  let orderStatus = req.params.status;
  let email = req.params.email;
  email = email.replace('owner@','@');
  const client = new Client(dbConfig)

    client.connect(err => {
        if (err) {
          console.error('error connecting', err.stack)
          res.send('{}');
          client.end();
        } else {
            client.query("Select id, owner_name, city, role from franchise where owner_email IN ('"+email+"') ",
                        [], (err, response) => {
                              if (err) {
                                console.log(err);
                                 res.send("error");
                                 client.end();
                              } else {
                                 //res.send(response.rows);
                                 if (response.rows.length == 0) {
                                    res.send("auth error");
                                    client.end();
                                 } else {
                                    res.send(response.rows);
                                    client.end();
                                 }

                              }

                            });
         }
    });


});

app.get("/user-orders/:email", function(req, res) {
  let orderStatus = req.params.status;
  let email = req.params.email;
  const client = new Client(dbConfig)

    client.connect(err => {
        if (err) {
          console.error('error connecting', err.stack)
          res.send('{}');
        } else {
            client.query("Select total_price, discounted_price from store_order where user_id IN (select id from club_user where email IN ('"+email+"')) AND status = 'PAID' order by created_at desc",
                        [], (err, response) => {
                              if (err) {
                                console.log(err);
                                 res.send("error");
                                 client.end();
                              } else {
                                 //res.send(response.rows);
                                 if (response.rows.length == 0) {
                                    res.send("auth error");
                                    client.end();
                                 } else {
                                    res.send(response.rows);
                                    client.end();
                                 }

                              }

                            });
         }
    });


});

app.get("/store/name/:franchiseId", function(req, res) {
  let franchiseId = req.params.franchiseId;
  const client = new Client(dbConfig)

    client.connect(async err => {
        if (err) {
          console.error('error connecting', err.stack)
          res.send('{}');
          client.end();
        } else {
              while(true){
                  await new Promise(resolve => setTimeout(resolve, 25000));
                    client.query("Select s.id, s.locality, s.accepting_online_orders, count(o.id)  from store s, online_order o where o.status != 'PAID' and o.store_id = s.id and s.franchise_id = "+franchiseId +" group by s.id",
                        [], (err, response) => {
                              if (err) {
                                console.log(err);
                                res.send("error");
                                client.end();
                              } else {
                                 //res.send(response.rows);
                                
                                  io.emit('web-orders', response.rows[0].count);
                                 /*if (response.rows.length == 0) {
                                    client.query("Select id, locality from store where franchise_id = "+franchiseId,
                                      [], (er, r) => {
                                        if (r.rows.length == 0) {
                                          res.send("error");
                                          client.end();
                                        } else {
                                          res.send(r.rows);
                                          client.end();
                                        }
                                      });
                                 } else {
                                    res.send(response.rows);
                                    client.end();
                                 }*/
                              }
                            });
                  
                }
         }
    });
  });

    app.get("/store-default/name/:franchiseId", function(req, res) {
      let franchiseId = req.params.franchiseId;
      const client = new Client(dbConfig)
    
        client.connect(async err => {
            if (err) {
              console.error('error connecting', err.stack)
              res.send('{}');
              client.end();
            } else {
                        client.query("Select s.id, s.locality, s.accepting_online_orders, count(o.id)  from store s, online_order o where o.status != 'PAID' and o.store_id = s.id and s.franchise_id = "+franchiseId +" group by s.id",
                            [], (err, response) => {
                                  if (err) {
                                    console.log(err);
                                    res.send("error");
                                    client.end();
                                  } else {
                                      if (response.rows.length == 0) {
                                        client.query("Select id, locality from store where franchise_id = "+franchiseId,
                                          [], (er, r) => {
                                            if (r.rows.length == 0) {
                                              res.send("error");
                                              client.end();
                                            } else {
                                              res.send(r.rows);
                                              client.end();
                                            }
                                          });
                                     } else {
                                        res.send(response.rows);
                                        client.end();
                                     }
                                  }
                                });
             }
        });


});

app.get("/web-orders/:franchiseId", function(req, res) {
  let franchiseId = req.params.franchiseId;
  const client = new Client(dbConfig)

    client.connect(err => {
        if (err) {
          console.error('error connecting', err.stack)
          res.send('{}');
          client.end();
        } else {
            client.query("Select o.id, o.name, o.mobile, o.status, o.address, o.delivery_pincode, o.delivery_schedule, o.delivery_timeslot, o.price, o.created_at, o.order from store s, online_order o where o.store_id = s.id and s.franchise_id = "+franchiseId+" group by s.id, o.id order by o.created_at desc",
                        [], (err, response) => {
                              if (err) {
                                console.log(err);
                                res.send("error");
                                client.end();
                              } else {
                                 //res.send(response.rows);
                                 if (response.rows.length == 0) {
                                    res.send("error");
                                    client.end();
                                 } else {
                                    res.send(response.rows);
                                    client.end();
                                 }
                              }
                            });
         }
    });


});

app.get("/store/inventory/:franchiseId", function(req, res) {
  let franchiseId = req.params.franchiseId;
  const client = new Client(dbConfig)

    client.connect(err => {
        if (err) {
          console.error('error connecting', err.stack)
          res.send('{}');
          client.end();
        } else {
            client.query("Select id,store_id,pizza_mix_qty,cheese_qty,pizza_sauce_qty,tomato_sauce_qty,white_sauce_qty,peri_peri_qty,oregano_qty,olives_qty,paneer_qty,capsicum_qty,onion_qty,jalapenos_qty,sweet_corn_qty,mushroom_qty,hand_cover_qty,takeaway_box_qty,last_updated,basil_qty,wastebin_cover_qty,tomato_qty,red_chilli_qty from store_inventory where franchise_id = "+franchiseId,
                        [], (err, response) => {
                              if (err) {
                                console.log(err);
                                res.send("error");
                                client.end();
                              } else {
                                 //res.send(response.rows);
                                 if (response.rows.length == 0) {
                                    res.send("error");
                                    client.end();
                                 } else {
                                    res.send(response.rows[0]);
                                    client.end();
                                 }
                              }
                            });
         }
    });


});

app.get("/store/checklist/:franchiseId", function(req, res) {
  let franchiseId = req.params.franchiseId;
  const client = new Client(dbConfig)

    client.connect(err => {
        if (err) {
          console.error('error connecting', err.stack)
          res.send('{}');
          client.end();
        } else {
            client.query("Select id,store_id,check1Checked,check2checked,check3checked,check4checked,check5checked,check6checked,check7checked,check8checked,check9checked,check10checked,check11checked,check12checked,check13checked,check14checked,check15checked,check16checked from store_checklist where franchise_id = "+franchiseId,
                        [], (err, response) => {
                              if (err) {
                                console.log(err);
                                res.send("error");
                                client.end();
                              } else {
                                 //res.send(response.rows);
                                 if (response.rows.length == 0) {
                                    res.send("error");
                                    client.end();
                                 } else {
                                    res.send(response.rows[0]);
                                    client.end();
                                 }
                              }
                            });
         }
    });


});

app.post('/eventOrder', function(req, res) {

    const eDate = req.body.eDate;
    const ePincode = req.body.ePincode;
    const orderId = orderid.generate();
    let whitelisted = false;
    const status = 'PENDING';
    const eMobile = req.body.eMobile;

    const client = new Client(dbConfig)
    client.connect(err => {
      if (err) {
        console.error('error connecting', err.stack)
      } else {
        console.log('connected')


            client.query("INSERT INTO \"public\".\"event_order\"(order_id, event_date, venue_pincode, event_contact_mobile, order_status) VALUES($1, $2, $3, $4, $5)",
                        [orderId, eDate, ePincode, eMobile, status], (err, response) => {
                              if (err) {
                                console.log(err)
                                 res.send("error");
                              } else {
                                console.log(response);
                                axios
                                  .post('https://api.pushalert.co/rest/v1/send', 'title=Event Order%20Received&message=New%20Pizza%20Event&icon=https://www.slimcrust.com/rounded.png&url=https://www.slimcrust.com', {headers: {'Authorization': 'api_key=c0a692d5772f7c2b7642013d80439aea'}})
                                  .then(res => {
                                    console.log('Pushalert success: ', res);
                                  })
                                  .catch(error => {
                                    console.log('Pushalert error: ', error);
                                  });
                                 res.send('{"orderId":"'+orderId+'", "whitelisted":true}');
                              }

                            });


      }
    })


})

app.post('/createConfirmedOrder', function(req, res) {

    const orderId = orderid.generate();
    let whitelisted = false;

    const eDate = req.body.orderDate;
    const eTime = req.body.orderTime;
    const pizzaQty = req.body.orderPizzaQty;
    const quotePrice = req.body.orderPrice;
    const venueAddress = req.body.orderAddress;
    const customerMobile = req.body.orderContact;
    const venueMapURL = req.body.orderMapURL;
    const bookingAmountPaid = req.body.orderAmtPaid;
    const customerName = req.body.orderName;
    const toppingIngredients = req.body.orderToppingIng;
    const etxras = req.body.orderExtras;
    const specialIngredients = req.body.orderSpecialIng;
    const pizzaSize = req.body.orderPizzaSize;
    const comments = req.body.orderComments;
    const wrapsQty = req.body.orderWrapsQty;
    const garlicBreadQty = req.body.orderGarlicBreadQty;
    const city = req.body.orderCity;
    const zone =  req.body.orderZone;
    const orderType = req.body.orderType;

    const client = new Client(dbConfig)
    client.connect(err => {
      if (err) {
        console.error('error connecting', err.stack)
      } else {
        console.log('connected')


            client.query("INSERT INTO \"public\".\"confirmed_order\"(order_id, event_date, event_time, pizza_quantity, quote_price, venue_address, event_contact_mobile, order_status, venue_map_url, booking_amount_paid, customer_name, topping_ingredients, extras, special_ingredients, size, comments, wraps_quantity, garlic_bread_quantity, city, zone, order_type, quote_amt) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)",
                        [orderId, eDate, eTime, pizzaQty, quotePrice, venueAddress, customerMobile, 'CONFIRMED', venueMapURL, bookingAmountPaid, customerName, toppingIngredients, etxras, specialIngredients, pizzaSize, comments, wrapsQty, garlicBreadQty, city, zone, orderType, quotePrice], (err, response) => {
                              if (err) {
                                console.log(err)
                                 res.send("error");
                              } else {
                                console.log(response);
                                res.send('{"orderId":"'+orderId+'", "whitelisted":true}');
                              }

                            });
      }
    })
})

app.post('/createStore', function(req, res) {
  
  const lat = req.body.lat;
  const long = req.body.long;
  

  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected')


          client.query("INSERT INTO \"public\".\"store\"(lat, long) VALUES($1, $2)",
                      [lat, long], (err, response) => {
                            if (err) {
                              console.log(err)
                               res.send("error");
                            } else {
                                //res.send(response);
                                //res.send('{"orderId":"'+orderId+'", "whitelisted":true}');
                                client.query("select id from store order by created_at desc",
                                            [], (err, response) => {
                                                  if (err) {
                                                    console.log(err)
                                                     res.send("error");
                                                  } else {
                                                    res.send('{"id": '+response.rows[0].id+'}');
                                                  }
                                            });
                            }

                          });
    }
  })
})

app.post('/store/web-order', function(req, res) {
  
  const price = req.body.price;
  const mobile = req.body.mobile;
  const name = req.body.name;
  const slot = req.body.slot;
  const items = req.body.items;
  const pincode = req.body.pincode;
  const schedule = req.body.schedule;
  const address = req.body.address;
  const clubCode = req.body.clubCode;
  let storeId = 0;
  let userId = 0;

  console.log('--items--', items);

  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected');

      client.query("select id from club_user where customer_code = '"+clubCode+"'",
      [], (err, response) => {
            if (err) {
              console.log(err)
               res.send("error");
               client.end();
            } else {
              if(response.rows && response.rows.length > 0) {
                  userId = response.rows[0].id;
              }


              client.query("select store_id from store_order where user_id = "+userId+"",
                [], (err, responseStore) => {
                    if (err) {
                      console.log(err)
                      res.send("error");
                      client.end();
                    } else {
                      if(responseStore.rows && responseStore.rows.length > 0) {
                          storeId = responseStore.rows[0].store_id;

                          client.query("INSERT INTO \"public\".\"online_order\"(name, mobile, address, delivery_pincode, delivery_schedule, delivery_timeslot, \"order\", price, user_id, store_id) VALUES('"+name+"', '"+mobile+"', '"+address+"', '"+pincode+"', '"+schedule+"', '"+slot+"', '"+items+"', '"+price+"', "+userId+", "+storeId+")",
                              [], (err, response) => {
                                    if (err) {
                                      console.log(err)
                                      res.send("error");
                                      client.end();
                                    } else {
                                        res.send("success");
                                        client.end();
                                    }

                                  });

                      }
                    }
                });


          

                        }
      });
                        
    }
  })
})

app.post('/createClubUser', function(req, res) {
  
  const email = req.body.email;
  const name = req.body.name;
  const loggedIn = 'Y';
  
  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected')

      client.query("select id, customer_code from club_user where email = '"+email+"'",
      [], (err, response) => {
            if (err) {
              console.log(err)
               res.send("error");
            } else {
              if(response.rows && response.rows.length > 0) {
                  let userId = response.rows[0].id;
                  let customerCode = response.rows[0].customer_code;
                  client.query("UPDATE \"public\".\"club_user\" SET logged_in = $1, last_active_on = now() where id = $2",
                      ['Y', userId], (err, response) => {
                            if (err) {
                              console.log(err)
                               res.send("error");
                            } else {
                                //res.send(response);
                                res.send('{"code":"'+customerCode+'","registered":"true"}');
                            }

                          });
                } else {
                  //Generate unique code
                  let code = '';
                  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                  const charactersLength = characters.length;
                  let counter = 0;
                  while (counter < 6) {
                    code += characters.charAt(Math.floor(Math.random() * charactersLength));
                    counter += 1;
                  }
                  client.query("INSERT INTO \"public\".\"club_user\"(customer_code, email, name, logged_in) VALUES($1, $2, $3, $4)",
                      [code, email, name, loggedIn], (err, response) => {
                            if (err) {
                              console.log(err)
                               res.send("error");
                            } else {
                                //res.send(response);
                                res.send('{"code":"'+code+'","registered":"false"}');
                            }

                          });

                }
            }
    })
  }
 })
});

app.post('/createCorporateUser', function(req, res) {
  
  const email = req.body.email;
  const name = req.body.name;
  const loggedIn = 'Y';
  
  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected')

      client.query("select id, customer_code from corporate_user where email = '"+email+"'",
      [], (err, response) => {
            if (err) {
              console.log(err)
               res.send("error");
            } else {
              if(response.rows && response.rows.length > 0) {
                  let userId = response.rows[0].id;
                  let customerCode = response.rows[0].customer_code;
                  client.query("UPDATE \"public\".\"corporate_user\" SET logged_in = $1, last_active_on = now() where id = $2",
                      ['Y', userId], (err, response) => {
                            if (err) {
                              console.log(err)
                               res.send("error");
                            } else {
                                //res.send(response);
                                res.send('{"code":"'+customerCode+'","registered":"true"}');
                            }

                          });
                } else {
                  //Generate unique code
                  let code = '';
                  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                  const charactersLength = characters.length;
                  let counter = 0;
                  while (counter < 6) {
                    code += characters.charAt(Math.floor(Math.random() * charactersLength));
                    counter += 1;
                  }
                  client.query("INSERT INTO \"public\".\"corporate_user\"(customer_code, email, name, logged_in) VALUES($1, $2, $3, $4)",
                      [code, email, name, loggedIn], (err, response) => {
                            if (err) {
                              console.log(err)
                               res.send("error");
                            } else {
                                //res.send(response);
                                res.send('{"code":"'+code+'","registered":"false"}');
                            }

                          });

                }
            }
    })
  }
 })
});

app.post('/onboardCorporateUser', function(req, res) {
  
  const email = req.body.email;
  
  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      client.query("UPDATE \"public\".\"corporate_user\" SET onboarded = $1, last_active_on = now() where email = $2",
          ['Y', email], (err, response) => {
                if (err) {
                  console.log(err)
                    res.send("error");
                } else {
                    //res.send(response);
                    res.send('{"registered":"true"}');
                }

              });
  }
 })
});

app.post('/onboardClubUser', function(req, res) {
  
  const email = req.body.email;
  
  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      client.query("UPDATE \"public\".\"club_user\" SET onboarded = $1, last_active_on = now() where email = $2",
          ['Y', email], (err, response) => {
                if (err) {
                  console.log(err)
                    res.send("error");
                } else {
                    //res.send(response);
                    res.send('{"registered":"true"}');
                }

              });
  }
 })
});

app.post('/signUpClubUser', function(req, res) {
  
  const email = req.body.email;
  
  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      client.query("UPDATE \"public\".\"club_user\" SET signed_up = $1 where email = $2",
          ['true', email], (err, response) => {
                if (err) {
                  console.log(err)
                    res.send("error");
                } else {
                    //res.send(response);
                    res.send('{"registered":"true"}');
                }

              });
  }
 })
});


app.post('/updateStore', function(req, res) {
  
  const lat = req.body.storeLat;
  const long = req.body.storeLong;
  const storeAddress = req.body.storeAddress;
  const storeArea = req.body.storeArea;
  const storeCity = req.body.storeCity;
  const storeCountry = req.body.storeCountry;
  const storeFranchise = req.body.storeFranchise;
  const storeNum = req.body.storeNum;
  const paymentQr = req.body.paymentQr.replace(/ /g, '+');

  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected');

      client.query("select id from store where lat = '"+lat+"' and long = '"+long+"'",
                                            [], (err, response) => {
                                                  if (err) {
                                                    console.log(err)
                                                     res.send("error");
                                                  } else {
                                                    //res.send('{"id": '+response.rows[0].id+'}');
                                                      let storeId = response.rows[0].id;
                                                      client.query("UPDATE \"public\".\"store\" SET locality = $1, city = $2, country = $3, full_address = $4, franchise_id = $5 where id = $6",
                                                        [storeArea, storeCity, storeCountry, storeAddress, storeFranchise, storeId], (err, response) => {
                                                              if (err) {
                                                                console.log(err)
                                                                res.send("error");
                                                              } else {

                                                                  client.query("INSERT INTO \"public\".\"store_profile\"(store_id, store_contact_number, payment_qr_base64) VALUES($1, $2, $3)",
                                                                      [storeId, storeNum, paymentQr], (err, response) => {
                                                                            if (err) {
                                                                              console.log(err)
                                                                              res.send("error");
                                                                            } else {
                                                                                //console.log('--store creation response--', response);
                                                                                //res.send(response);
                                                                                client.query("INSERT INTO \"public\".\"store_inventory\"(store_id,franchise_id) VALUES($1,$2)",
                                                                                  [storeId,storeFranchise], (err, response) => {
                                                                                        if (err) {
                                                                                          console.log(err)
                                                                                          res.send("error");
                                                                                        } else {
                                                                                            //console.log('--store creation response--', response);
                                                                                            //res.send(response);
                                                                                            res.send('{"storeId":"'+storeId+'"}');
                                                                                            
                                                                                        }

                                                                                      });
                                                                                
                                                                            }

                                                                          });
                                                              }

                                                            });
                                                  }
                                            });


          
    }
  })
})

app.post('/createStoreOrder', function(req, res) {
  const lat = req.body.storeLat;
  const long = req.body.storeLong;
  const hasReviewed = req.body.hasReviewed == 'true' ? 'y' : 'n';
  const clubCode = req.body.clubCode;
  const pizza1Qty = req.body.pizza1Qty;
  const pizza2Qty = req.body.pizza2Qty;
  const pizza3Qty = req.body.pizza3Qty;
  const pizza4Qty = req.body.pizza4Qty;
  const pizza5Qty = req.body.pizza5Qty;
  const pizza6Qty = req.body.pizza6Qty;
  const pizza7Qty = req.body.pizza7Qty;
  const pizza8Qty = req.body.pizza8Qty;
  const takeAwayQty = req.body.takeAwayQty;
  const pizza1SliceQty = req.body.pizza1SliceQty;
  const pizza2SliceQty = req.body.pizza2SliceQty;
  const pizza3SliceQty = req.body.pizza3SliceQty;
  const pizza4SliceQty = req.body.pizza4SliceQty;
  const pizza5SliceQty = req.body.pizza5SliceQty;
  const pizza6SliceQty = req.body.pizza6SliceQty;
  const pizza7SliceQty = req.body.pizza7SliceQty;
  const pizza8SliceQty = req.body.pizza8SliceQty;
  const takeAwaySliceQty = req.body.takeAwaySliceQty;
  const extraToppingsQty = req.body.extraToppingsQty;
  const franchiseId = req.body.franchiseId;

  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected')

      client.query("select lat, long, id from store where franchise_id = "+franchiseId,
          [], (err, response) => {
                if (err) {
                  console.log(err)
                    res.send("error");
                } else {
                  //const storeLat = response.rows[0].lat;
                  //const storeLong = response.rows[0].long;
                  const storeId = response.rows[0].id;
                  //const isInVicinity = GeofencingService.isLocationInVicinity(lat, long, storeLat,storeLong);
                  const isInVicinity = true;
                  if (!isInVicinity) {
                    res.send("error-not-in-vicinity");
                    client.end();
                  } else {

                    client.query("select id from club_user where customer_code = '"+clubCode+"'",
                                            [], (err, resp) => {
                                                  if (err) {
                                                    console.log(err)
                                                     res.send("error");
                                                  } else {
                    
                    let clubUserId = 0; 
                    if (resp.rows[0] && resp.rows[0].id != null) {                            
                        clubUserId = resp.rows[0].id;
                      }
                        //ToDo: Query to read user id based on club code & derive returning customer based on number of store orders for user id before current date
                        let hasValidCode = clubUserId != 0;
                        const orderJson = "{\"pizza1Qty\":"+pizza1Qty+",\"pizza2Qty\":"+pizza2Qty+",\"pizza3Qty\":"+pizza3Qty+",\"pizza4Qty\":"+pizza4Qty+",\"pizza5Qty\":"+pizza5Qty+",\"pizza6Qty\":"+pizza6Qty+",\"pizza7Qty\":"+pizza7Qty+",\"pizza8Qty\":"+pizza8Qty+", \"takeAwayQty\":"+takeAwayQty+", \"extraToppingsQty\":"+extraToppingsQty+"}";
                        const totalPrice = PricingService.getTotalPrice(pizza1Qty, pizza2Qty, pizza3Qty, pizza4Qty, pizza5Qty, pizza6Qty, pizza7Qty, pizza8Qty, takeAwayQty, extraToppingsQty, hasValidCode, hasReviewed, pizza1SliceQty, pizza2SliceQty, pizza3SliceQty, pizza4SliceQty, pizza5SliceQty, pizza6SliceQty, pizza7SliceQty, pizza8SliceQty, takeAwaySliceQty);
                        const discountedPrice = PricingService.getDiscountedPrice(pizza1Qty, pizza2Qty, pizza3Qty, pizza4Qty, pizza5Qty, pizza6Qty, pizza7Qty, pizza8Qty, takeAwayQty, extraToppingsQty, hasValidCode, hasReviewed, pizza1SliceQty, pizza2SliceQty, pizza3SliceQty, pizza4SliceQty, pizza5SliceQty, pizza6SliceQty, pizza7SliceQty, pizza8SliceQty, takeAwaySliceQty);
                        const returningCustomer = 'N'; 
                        
                        client.query("INSERT INTO \"public\".\"store_order\"(store_id, order_json, total_price, discounted_price, status, returning_customer, user_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
                          [storeId, orderJson, totalPrice, discountedPrice, 'PAYMENT_PENDING', returningCustomer, clubUserId], (err, response) => {
                                if (err) {
                                  console.log(err)
                                  res.send("error");
                                  client.end();
                                } else {
                                  res.send('{"orderId": "'+response.rows[0].id+'", "price": "'+discountedPrice+'", "storeId": '+storeId+'}');
                                  client.end();
                                }
                              });
                       
                      }
                        
                  });
                        
                  }
                }
          });

    }
  })
})

app.post('/updateStoreOrder/status/:status', function(req, res) {
  const status = req.params.status;
  const orderId = req.body.orderId;
  const mode = req.body.mode;

  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
          console.log('connected');
          client.query("UPDATE \"public\".\"store_order\" SET status = $1, payment_mode = $2 where id = $3",
            [status, mode, orderId], (err, response) => {
                  if (err) {
                    console.log(err)
                    res.send("error");
                    client.end();
                  } else {
                      res.send('{"orderId":"'+orderId+'"}');
                      client.end();
                  }

                });
          }
    });

})

app.post('/updateStoreWebOrder/:status', function(req, res) {
  const status = req.params.status;
  const storeId = req.body.storeId;
  const mode = req.body.mode;

  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
          console.log('connected');
          client.query("UPDATE \"public\".\"store\" SET accepting_online_orders = $1 where id = $2",
            [status, storeId], (err, response) => {
                  if (err) {
                    console.log(err)
                    res.send("error");
                    client.end();
                  } else {
                      res.send('{"storeId":"'+storeId+'"}');
                      client.end();
                  }

                });
          }
    });

})

app.post('/updateStoreInventory', function(req, res) {
  const basil_qty = req.body.basil_qty;
  const capsicum_qty = req.body.capsicum_qty;
  const tomato_qty = req.body.tomato_qty;
  const red_chilli_qty = req.body.red_chilli_qty;
  const cheese_qty = req.body.cheese_qty;
  const hand_cover_qty = req.body.hand_cover_qty;
  const jalapenos_qty = req.body.jalapenos_qty;
  const mushroom_qty = req.body.mushroom_qty;
  const olives_qty = req.body.olives_qty;
  const onion_qty = req.body.onion_qty;
  const oregano_qty = req.body.oregano_qty;
  const paneer_qty = req.body.paneer_qty;
  const peri_peri_qty = req.body.peri_peri_qty;
  const pizza_mix_qty = req.body.pizza_mix_qty;
  const pizza_sauce_qty = req.body.pizza_sauce_qty;
  const sweet_corn_qty = req.body.sweet_corn_qty;
  const takeaway_box_qty = req.body.takeaway_box_qty;
  const tomato_sauce_qty = req.body.tomato_sauce_qty;
  const wastebin_cover_qty = req.body.wastebin_cover_qty;
  const white_sauce_qty = req.body.white_sauce_qty;
  const franchise_id = req.body.franchiseId;

  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
          console.log('connected');
          client.query("UPDATE \"public\".\"store_inventory\" SET pizza_mix_qty=$1, cheese_qty=$2, pizza_sauce_qty=$3, tomato_sauce_qty=$4, white_sauce_qty=$5, peri_peri_qty=$6, oregano_qty=$7, olives_qty=$8, paneer_qty=$9, capsicum_qty=$10, onion_qty=$11, jalapenos_qty=$12, sweet_corn_qty=$13, mushroom_qty=$14, hand_cover_qty=$15, takeaway_box_qty=$16, basil_qty=$17, wastebin_cover_qty=$18, tomato_qty=$19, red_chilli_qty=$20 where franchise_id = $21",
            [pizza_mix_qty, cheese_qty, pizza_sauce_qty, tomato_sauce_qty, white_sauce_qty, peri_peri_qty, oregano_qty, olives_qty, paneer_qty, capsicum_qty, onion_qty, jalapenos_qty, sweet_corn_qty, mushroom_qty, hand_cover_qty, takeaway_box_qty, basil_qty, wastebin_cover_qty, tomato_qty, red_chilli_qty, franchise_id], (err, response) => {
                  if (err) {
                    console.log(err)
                    res.send("error");
                    client.end();
                  } else {
                      res.send('{"franchiseId":"'+franchise_id+'"}');
                      client.end();
                  }

                });
          }
    });

})

app.post('/updateStoreChecklist', function(req, res) {
  const checkedColumn = req.body.checkedColumn;
  const isChecked = req.body.isChecked;
  const franchise_id = req.body.franchiseId;
  const doneForTheDayColumn = 'check16checked';

  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
          console.log('connected');
          if (checkedColumn == doneForTheDayColumn) {
            client.query("UPDATE \"public\".\"store_checklist\" SET check1checked='n',check2checked='n',check3checked='n',check4checked='n',check5checked='n',check6checked='n',check7checked='n',check8checked='n',check9checked='n',check10checked='n',check11checked='n',check12checked='n',check13checked='n',check14checked='n',check15checked='n',check16checked='n' where franchise_id = $1",
            [franchise_id], (err, response) => {
                  if (err) {
                    console.log(err)
                    res.send("error");
                    client.end();
                  } else {
                      res.send('{"franchiseId":"'+franchise_id+'"}');
                      client.end();
                  }

                });
          } else {
            client.query("UPDATE \"public\".\"store_checklist\" SET "+checkedColumn+"=$1 where franchise_id = $2",
            [isChecked, franchise_id], (err, response) => {
                  if (err) {
                    console.log(err)
                    res.send("error");
                    client.end();
                  } else {
                      res.send('{"franchiseId":"'+franchise_id+'"}');
                      client.end();
                  }

                });
          }
          
          }
          
    });

})

app.get('/franchises', function(req, res) {
  

  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected');
      client.query("select owner_name,id from franchise",
                  [], (err, response) => {
                        if (err) {
                          console.log(err)
                            res.send("error");
                            client.end();
                        } else {
                          res.send(response.rows);
                          client.end();
                        }
                  });

      }});
});

app.get('/store/get/:clubCode', function(req, res) {
  let clubCode = req.params.clubCode;
  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected');
      client.query("select online_orders_timings,accepting_online_orders,online_orders_pincodes from store where id in (select store_id from store_order where user_id in (select id from club_user where customer_code='"+clubCode+"'))",
                  [], (err, response) => {
                        if (err) {
                          console.log(err)
                            res.send("error");
                            client.end();
                        } else {
                          res.send(response.rows);
                          client.end();
                        }
                  });

      }});
});

app.get('/user/get/:clubCode', function(req, res) {
  let clubCode = req.params.clubCode;
  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected');
      client.query("select signed_up from club_user where customer_code='"+clubCode+"'",
                  [], (err, response) => {
                        if (err) {
                          console.log(err)
                            res.send("error");
                            client.end();
                        } else {
                          if (response.rows.length > 0) {
                            res.send(response.rows[0].signed_up);
                          }
                          client.end();
                        }
                  });

      }});
});

app.get('/corporateUser/get/:clubCode', function(req, res) {
  let clubCode = req.params.clubCode;
  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected');
      client.query("select signed_up from corporate_user where customer_code='"+clubCode+"'",
                  [], (err, response) => {
                        if (err) {
                          console.log(err)
                            res.send("error");
                            client.end();
                        } else {
                          if (response.rows.length > 0) {
                            res.send(response.rows[0].signed_up);
                          }
                          client.end();
                        }
                  });

      }});
});

app.get('/payQrByStore/:storeId', function(req, res) {
  let storeId = req.params.storeId;
  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected');
      client.query("select payment_qr_base64 from store_profile where store_id="+storeId,
                  [], (err, response) => {
                        if (err) {
                          console.log(err)
                            res.send("error");
                            client.end();
                        } else {
                          if(response.rows.length > 0) {
                            res.send(response.rows[0].payment_qr_base64);
                            client.end();
                          } else {
                            res.send("error");
                            client.end();
                          }
                        }
                  });

      }});
})

app.post('/createEnquiry/:franchiseId', function(req, res) {
    let whitelisted = false;
    const eDate = req.body.orderDate;
    const eTime = req.body.orderTime;
    const pizzaQty = req.body.orderPizzaQty || 0;
    const venueAddress = req.body.orderAddress;
    const customerMobile = req.body.orderContact;
    const customerName = req.body.orderName;
    const toppingIngredients = req.body.orderToppingIng;
    const etxras = req.body.orderExtras;
    const specialIngredients = req.body.orderSpecialIng;
    const pizzaSize = req.body.orderPizzaSize || 0;
    const comments = req.body.orderComments;
    const wrapsQty = req.body.orderWrapsQty || 0;
    const garlicBreadQty = req.body.orderGarlicBreadQty || 0;
    const city = req.body.orderCity;
    let franchiseId = req.params.franchiseId;

    const client = new Client(dbConfig)
    client.connect(err => {
      if (err) {
        console.error('error connecting', err.stack)
      } else {
        console.log('connected');


            client.query("INSERT INTO \"public\".\"booking\"(date, event_time, pizza_qty, address, mobile, customer_name, topping_ingredients, extras, special_ingredients, pizza_size, comments, wraps_qty, garlic_bread_qty, city, franchise_id, location) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",
                        [eDate, eTime, pizzaQty, venueAddress, customerMobile, customerName, toppingIngredients, etxras, specialIngredients, pizzaSize, comments, wrapsQty, garlicBreadQty, city, franchiseId, city], (err, response) => {
                              if (err) {
                                 res.send('{"status":"error","message":'+err+'}');
                              } else {
                                console.log(response);

                                    client.query("select distinct franchise_id, count(*) from booking where franchise_id is not null and franchise_id NOT IN (1) and city = '"+city+"' group by franchise_id order by count;",
                                            [], (err, response) => {
                                                  if (err) {
                                                    console.log(err)
                                                     res.send("error");
                                                  } else {
                                                    console.log('--f id--', response.rows[0]['franchise_id']);
                                                     //res.send(response.rows);
                                                     if (response.rows.length == 0) {
                                                        res.send("auth error");
                                                        client.end();
                                                     } else {
                                                        let franchiseId = response.rows[0]['franchise_id'];
                                                        client.query("UPDATE \"public\".\"booking\" SET franchise_id = $1 WHERE ID IN (SELECT ID FROM BOOKING WHERE location = '"+city+"' ORDER BY ID DESC LIMIT 1)",
                                                                                [franchiseId], (err, response) => {
                                                                                      if (err) {
                                                                                         res.send('{"status":"error","message":'+err+'}');
                                                                                         client.end();
                                                                                      } else {
                                                                                            res.send('{"status":"success"}');
                                                                                            client.end();
                                                                                      }
                                                                                  });
                                                     }

                                                  }
                                            });
                              }

                            });
      }
    })
});

app.post('/createBooking', function(req, res) {

    const orderId = orderid.generate();
    let whitelisted = false;

    const eMobile = req.body.eMobile;
    const eDate = req.body.eDate;
    const eSlot = req.body.eSlot;
    const eGuests = req.body.eGuests;
    const ePackage = req.body.ePackage;

    const client = new Client(dbConfig)
    client.connect(err => {
      if (err) {
        console.error('error connecting', err.stack)
      } else {
        console.log('connected')

         res.send('{"orderId":"'+orderId+'", "whitelisted":true}');

            client.query("INSERT INTO \"public\".\"booking\"(mobile, date, slot, num_guests, package) VALUES($1, $2, $3, $4, $5)",
                        [eMobile, eDate, eSlot, eGuests, ePackage], (err, response) => {
                              if (err) {
                                console.log(err)
                                 res.send("error");
                                 client.end();
                              } else {
                                console.log(response);
                                axios.post('https://api.pushalert.co/rest/v1/send', 'title=Order%20Received&message=New%20Pizza%20Order&icon=https://www.slimcrust.com/rounded.png&url=https://www.slimcrust.com', {headers: {'Authorization': 'api_key=c0a692d5772f7c2b7642013d80439aea'}})
                                                                  .then(res => {
                                                                    console.log('Pushalert success: ', res);
                                                                    client.end();
                                                                  })
                                                                  .catch(error => {
                                                                    console.log('Pushalert error: ', error);
                                                                    client.end();
                                                                  });
                                //res.send('{"orderId":"'+orderId+'", "whitelisted":true}');
                              }

                            });
      }
    })
})

app.post('/completeConfirmedOrder', function(req, res) {

    let whitelisted = false;

    const orderId = req.body.orderId;

    const client = new Client(dbConfig)
    client.connect(err => {
      if (err) {
        console.error('error connecting', err.stack)
      } else {
        console.log('connected')
            client.query("UPDATE \"public\".\"confirmed_order\" set order_status='COMPLETED' where order_id=$1",
                        [orderId], (err, response) => {
                              if (err) {
                                console.log(err)
                                 res.send("error");
                                 client.end();
                              } else {
                                console.log(response);
                                res.send('{"orderId":"'+orderId+'", "whitelisted":true}');
                                client.end();
                              }

                            });

      }
    })
})

app.post('/updateEnquiry/:orderId/:status', function(req, res) {

    let whitelisted = false;
    let orderStatus = req.params.status;
    const orderId = req.params.orderId;

    const client = new Client(dbConfig)
    client.connect(err => {
      if (err) {
        console.error('error connecting', err.stack)
      } else {
        console.log('connected')
            client.query("UPDATE \"public\".\"event_order\" set order_status='"+orderStatus+"' where order_id=$1",
                        [orderId], (err, response) => {
                              if (err) {
                                console.log(err)
                                 res.send("error");
                                 client.end();
                              } else {
                                console.log(response);
                                res.send('{"orderId":"'+orderId+'", "whitelisted":true}');
                                client.end();
                              }

                            });

      }
    })
})

app.post('/updateWebOrder/:orderId/:status', function(req, res) {

  let orderStatus = req.params.status;
  const orderId = req.params.orderId;

  const client = new Client(dbConfig)
  client.connect(err => {
    if (err) {
      console.error('error connecting', err.stack)
    } else {
      console.log('connected')
          client.query("UPDATE \"public\".\"online_order\" set status='"+orderStatus+"' where id=$1",
                      [orderId], (err, response) => {
                            if (err) {
                              console.log(err)
                               res.send("error");
                               client.end();
                            } else {
                              console.log(response);
                              res.send('{"orderId":"'+orderId+'", "whitelisted":true}');
                              client.end();
                            }

                          });

    }
  })
})

app.post('/updateEventOrder', function(req, res) {
    const eQuantity = req.body.eventQuantity;
    const eQuote = req.body.eventQuote;
    const orderId = req.body.eventOrderId;
    let whitelisted = false;

    const client = new Client(dbConfig)
    client.connect(err => {
      if (err) {
        console.error('error connecting', err.stack)
      } else {
        console.log('connected')


            client.query("UPDATE \"public\".\"event_order\" set quantity = $1, quote_price = $2 WHERE order_id = $3",
                        [eQuantity, eQuote, orderId], (err, response) => {
                              if (err) {
                                console.log(err)
                                 res.send("error");
                                 client.end();
                              } else {
                                 res.send('{"orderId":"'+orderId+'", "whitelisted":true}');
                                 client.end();
                              }

                            });
      }
    })


})

app.post('/submitGetQuote', function(req, res) {
    var email = req.body.email,
        members = req.body.members,
        date = req.body.date;
        client.set(email, members);
    //res.send(pages.getQuote);*/
    res.redirect('/quoteChecker');
});

app.get("/search", function(request, response) {
  let q = request.query.q;
  let c = request.query.c;
  console.log('--q--', q);
  console.log('--c--', c);

const client = new Client(dbConfig)
client.connect(err => {
  if (err) {
    console.error('error connecting', err.stack)
  } else {
    console.log('connected')

    client.query("INSERT INTO \"public\".\"corporate_enquiry\"(company_name, num_employees) VALUES($1, $2)",
                      [q, c], (err, response) => {
                            if (err) {
                              console.log(err)
                            } 
                          });
  }
});
  response.sendFile(path.resolve(__dirname, 'public', 'confirmation.html'));
});


app.get("/recommended-picks", function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'picks.html'));
});

app.post('/submitMealType', function(req, res) {
    var date = req.body.date,
        orderMeal = req.body.orderMeal,
        email = req.body.email;
        members = req.body.members;
    var obj = {date:date, mealType:orderMeal, members: members}
        client.set(email, JSON.stringify(obj));
    //res.send(pages.getQuote);*/
    res.send('success');
});

app.post('/submitCuisine', function(req, res) {
    var date = req.body.date,
        orderMeal = req.body.orderMeal,
        email = req.body.email,
        members = req.body.members,
        cuisine = req.body.cuisine;
    var obj = {date:date, mealType:orderMeal, members: members, cuisine: cuisine}
        client.set(email, JSON.stringify(obj));
    //res.send(pages.getQuote);*/
    res.send('success');
});

app.post('/submitGetSlot', function(req, res) {
    var email = req.body.email,
        members = req.body.members;
        //client.set(email, 123);
        client.set(email, members);
    //res.send(members);
    res.redirect('/getSlot');
});

app.post('/submitItemChange', function(req, res) {
    var email = req.body.email,
        members = req.body.members;
        //client.set(email, 123);
        client.set(email, members);
    //res.send(members);
    res.send('success');
});

app.get("/set", function(request, response) {
  keyName++;valName++;
  response.send(client.set('key'+keyName, "User"+valName));
});

app.get("/get", function(request, response) {
  var log = loggr.logs.get("poshfind", "b687eacebeee405cafc202bc350d4f71");
  //console.log('--loggr--', log);
log.events.createEvent().text("this is text2").post();

  //var REDISCLOUD_URL = 'redis-16431.c10.us-east-1-2.ec2.cloud.redislabs.com:16431';
  // res.send(process.env);

//var client = redis.createClient('redis://rediscloud:vWISiXr6xai89eidZYXjM0OK3KeXfkPU@redis-16431.c10.us-east-1-2.ec2.cloud.redislabs.com:16431', {no_ready_check: true});


// res.send(client);
// client.set("welcome_msg", "Hello from Redis!");
  client.get("key1", function (err, reply) {
    if (reply != null) {
      response.send(reply);
    } else {
      response.send("key not found");
    }
  });
});

app.get("/redis", function(request, response) {
  response.send('redis test...');
});

app.get('/v2', function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.get('/onboard/step2', function(request, response) {
  response.writeHead(301,
  {Location: '/'}
);
response.end();
});

httpServ.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
