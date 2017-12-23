'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express.Router();
const request = require('request');
const firebaseConfig = require('../firebaseConfig.js');
const Translate = require('@google-cloud/translate');
const projectId = 'anhhunglau-7b113';

// Instantiates a client
const translate = new Translate({
    projectId: projectId,
});

app.post('/textrecognition', function(req, res) {
    if (!req.body.imageBase64) {
        res.send(JSON.stringify({ code: 0, messages: ['Không tìm thấy ảnh'] }));
        return;
    }
    var fileSize = getBase64FileSize(req.body.imageBase64);
    if (fileSize >= 2 * 1024 * 1024) {
        console.log('Dung lượng ảnh quá lớn', fileSize);
        res.send(JSON.stringify({ code: 0, messages: ['Dung lượng ảnh quá lớn'] }));
        return;
    }
    var requestBody = {
        "requests": [{
            "image": {
                "content": req.body.imageBase64
            },
            "features": [{
                "type": "DOCUMENT_TEXT_DETECTION"
            }]
        }]
    };
    request({
        method: 'POST',
        uri: 'https://vision.googleapis.com/v1/images:annotate?key=' + firebaseConfig.apiKey,
        body: requestBody,
        json: true
    }, function(error, response, body) {
        if (response.statusCode == 200) {

            var result = [];
            if (body.responses) {
                body.responses.forEach((rsOb1) => {
                    if (rsOb1.fullTextAnnotation && rsOb1.fullTextAnnotation.text) {
                        result.push(rsOb1.fullTextAnnotation.text);
                    }
                })
            }
            res.send({ code: 1, data: result.join('') });
            return;
        } else {
            console.error('====================================');
            console.error('response.statusCode', response.statusCode);
            console.error('error', error);
            console.error('body', body);
            console.error('====================================');
            res.send(JSON.stringify({ code: 0, messages: ['OCR error'] }));
            return;
        }
    });
});
app.post('/texttranslate', function(req, res) {
    if (!req.body.q) {
        res.send(JSON.stringify({ code: 0, messages: ['Dữ liệu không hợp lệ'] }));
        return;
    }
    translate
        .translate(req.body.q, 'vi')
        .then(results => {
            const translation = results[0];

            res.send(JSON.stringify({ code: 1, data: { translatedText: translation } }));
            return;
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
})

function getBase64FileSize(base64Encodeed) {
    if (!base64Encodeed) {
        return 0;
    }
    return parseInt(base64Encodeed.replace(/=/g, "").length * 0.75);
}

module.exports = app;