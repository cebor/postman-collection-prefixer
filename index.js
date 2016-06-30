#!/usr/bin/env node
process.title = 'pcp'

var path = require('path');

var argv = require('yargs')
    .usage('Usage: $0 -p [str] file.json')
    .demand(['p', 1])
    .argv;
var transformer = require('postman-collection-transformer');
var pad = require('left-pad');
var jsonfile = require('jsonfile');

var prefix = argv.p;
var collection = require(path.resolve('.', argv._[0]));

var options = {
    inputVersion: '1.0.0',
    outputVersion: '2.0.0'
};

function addNum(str, num) {
  return prefix + pad(num, 2, 0) + ' - ' + str;
}

function addNumPoint(str, num, point) {
  return prefix + pad(num, 2, 0) + '.' + pad(point, 2, 0) + ' - ' + str;
}

function prefixIt(collection) {
    collection.info.name = prefix + ' - ' + collection.info.name
    console.log(collection.info.name);

    var i = 1;
    for (let item of collection.item) {
        item.name = addNum(item.name, i++);
        console.log(item.name);
        var j = 1;
        if (item.item) {
            for (let item2 of item.item) {
                item2.name = addNumPoint(item2.name, i, j++);
                console.log(item2.name);
            }
        }
    }
}

transformer.convert(collection, options, function (error, result) {
    if (error) {
        return console.error(error);
    }

    prefixIt(result);

    var options = {
        inputVersion: '2.0.0',
        outputVersion: '1.0.0'
    };

    transformer.convert(result, options, function (error2, result2) {
        if (error) {
            return console.error(error);
        }

        jsonfile.writeFile(path.resolve('.', argv._[0]), result2, {spaces: 2}, function (err) {
            if (err) {
                console.error(err)
            }
        });
    });
});
