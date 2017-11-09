'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express.Router();
const request =  require('request');
const firebaseConfig = require('../../firebaseConfig.json');

app.post('/textrecognition', function(req, res){
    if(!req.body.imageBase64){
        res.send(JSON.stringify({code: 0, messages: ['Không tìm thấy ảnh']}));
        return;
    }
    var fileSize = getBase64FileSize(req.body.imageBase64);
    if(fileSize >= 4096){
        res.send(JSON.stringify({code: 0, messages: ['Dung lượng ảnh quá lớn']}));
        return;
    }
    var requestBody = {
        "requests": [
            {
                "image": {
                    "content": req.body.imageBase64
                },
                "features": [
                    {
                        "type": "TEXT_DETECTION"
                    }
                ]
            }
        ]
    };
    request({
        method: 'POST',
        uri: 'https://vision.googleapis.com/v1/images:annotate?key=' + firebaseConfig.apiKey,
        body: JSON.stringify(requestBody),
        json: true
    }, function (error, response, body) {
        if(response.statusCode == 200){
            console.log('==============success===============');
            console.log(typeof body);
            console.log(body);
            console.log('====================================');
            res.send(JSON.stringify({code: 1}));
            return;
        } else {
            console.log('====================================');
            console.log('response.statusCode', response.statusCode);
            console.log('error',error);
            console.log('body',body);
            console.log('====================================');
            res.send(JSON.stringify({code: 0, messages: ['OCR error']}));
            return;
        }
    });
});

function getBase64FileSize(base64Encodeed){
    if(!base64Encodeed){
        return 0;
    }
    return parseInt(base64Encodeed.replace(/=/g,"").length * 0.75);
}

module.exports = app;