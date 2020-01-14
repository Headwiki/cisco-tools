#!/usr/bin/env node
'use strict'

require('dotenv').config()
const Client = require('ssh2').Client;
const Program = require('commander')
const https = require("https");

const runSoap = () => {
    const authentication = `${process.env.CUCM_USER}:${process.env.CUCM_PASS}`;

    let headers = {
        'SOAPAction': '"CUCM:DB ver=10.5 listCss"',
        'Authorization': 'Basic ' + new Buffer(authentication).toString('base64'),
        'Content-Type': 'text/xml; charset=utf-8'
    }

    let soapBody = new Buffer('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.cisco.com/AXL/API/10.5">' +
        '<soapenv:Header/>' +
        '<soapenv:Header/>' +
        '<soapenv:Body>' +
        '<axl:listLine>' +
        '<searchCriteria>' +
        '<pattern>4141</pattern>' +
        '</searchCriteria>' +
        '<returnedTags>' +
        '<pattern/>' +
        '<description/>' +
        '<usage/>' +
        '<routePartitionName/>' +
        '</returnedTags>' +
        '</axl:listLine>' +
        '</soapenv:Body>' +
        '</soapenv:Envelope>');


    let options = {
        host: process.env.CUCM_IP,  // The IP Address of the Communications Manager Server
        port: 8443,                 // Clearly port 443 for SSL -- I think it's the default so could be removed
        path: '/axl/',              // This is the URL for accessing axl on the server
        method: 'POST',             // AXL Requires POST messages
        headers: headers,           // using the headers we specified earlier
        rejectUnauthorized: false   // required to accept self-signed certificate
    };

    options.agent = new https.Agent(options);


    let req = https.request(options, function (res) {
        console.log("status code = ", res.statusCode);
        console.log("headers = ", res.headers);
        res.setEncoding('utf8');
        res.on('data', function (d) {
            console.log("Got Data: " + d);
        });
    });

    req.write(soapBody);
    req.end();
    req.on('error', function (e) {
        console.error(e);
    });
}

Program
    .version('0.0.2')
    .description('Cisco Tools')

Program
    .command('test')
    .alias('t')
    .description('Test command')
    .action(() => {
        let conn = new Client();
        conn.on('ready', function () {
            console.log('Client :: ready');
            conn.exec('show clock', function (err, stream) {
                if (err) throw err;
                stream.on('close', function (code, signal) {
                    console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                    conn.end();
                }).on('data', function (data) {
                    console.log('STDOUT: ' + data);
                }).stderr.on('data', function (data) {
                    console.log('STDERR: ' + data);
                });
            });
        }).connect({
            host: `${process.env.SSH_HOST}`,
            port: process.env.SSH_PORT,
            username: process.env.SSH_USER,
            password: process.env.SSH_PASS
        });

    })


Program
    .command('soap')
    .alias('s')
    .description('SOAP command')
    .action(() => {
        runSoap();
    })



Program.parse(process.argv)




