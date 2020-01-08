#!/usr/bin/env node
'use strict'

require('dotenv').config()
const Client = require('ssh2').Client;
const Program = require('commander')

Program
    .version('0.0.1')
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
            host: process.env.SSH_HOST,
            port: process.env.SSH_PORT,
            username: process.env.SSH_USER,
            password: process.env.SSH_PASS
        });

    })

Program.parse(process.argv)




