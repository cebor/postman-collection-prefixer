#!/usr/bin/env node
process.title = 'pcp'

var argv = require('yargs')
    .usage('Usage: pcp -p [str] file.json')
    .demand(['p', 1])
    .string('p')
    .normalize(1)
    .argv;

var pad = require('left-pad');
var prefix = '#' + argv.p;

function prefixIt(collection, prevCounters = []) {
    function addNum(str, num, pre) {
        // remove old prefix
        str = str.replace(/^#[a-zA-Z0-9]+(\.[0-9]+)*\s-\s/, '');
        
        // add prefix
        var ret = prefix;
        prevCounters.forEach(function (index, i) {
            ret = ret + (i > 0 ? '.' : '') + pad(index, 2, 0) + '0';
        });
        ret = ret + (prevCounters.length ? '.' : '') + pad(num, 2, 0) + '0';
 
        return ret + ' - ' + str;
    }

    // first level
    if (collection.info) {
        // remove old prefix
        collection.info.name = collection.info.name.replace(/^#[a-zA-Z0-9]+\s-\s/, '');
        collection.info.name = prefix + ' - ' + collection.info.name
        console.log(collection.info.name);

        // prefix childs
        if (collection.item && collection.item.length) {
            prefixIt(collection.item);
        }
    // deeper levels
    } else {
        collection.forEach(function (item, i) {
            // start with 1, not with 0
            var counter = i + 1;
            item.name = addNum(item.name, counter);
            console.log(item.name);

            // prefix childChilds
            if (item.item && item.item.length) {
                prefixIt(item.item, [...prevCounters, counter]);
            }
        });
    }
}

function adaptCollection(filePath, adapter) {
    var path = require('path');

    var transformer = require('postman-collection-transformer');
    var jsonfile = require('jsonfile');

    var collection = require(path.resolve(filePath));

    // v1 -> v2
    transformer.convert(collection, { inputVersion: '1.0.0', outputVersion: '2.0.0' }, function (error, result) {
        if (error) {
            return console.error(error);
        }

        // do it
        adapter(result);

        // v2 -> v1
        transformer.convert(result, { inputVersion: '2.0.0', outputVersion: '1.0.0' }, function (error, result) {
            if (error) {
                return console.error(error);
            }

            // write to disk
            jsonfile.writeFile(path.resolve(filePath), result, { spaces: '\t' }, function (error) {
                if (error) {
                    console.error(error)
                }
            });
        });
    });
}

adaptCollection(argv._[0], prefixIt);
