var argv = require('yargs')
    .usage('Usage: $0 -p [str] file.json')
    .demand(['p', 1])
    .argv;
var pad = require('left-pad');
var jsonfile = require('jsonfile')

var prefix = argv.p;
var obj = require('./' + argv._[0]);

function addNum(str, num) {
  return prefix + pad(num, 2, 0) + ' - ' + str;
}

function addNumPoint(str, num, point) {
  return prefix + pad(num, 2, 0) + '.' + pad(point, 2, 0) + ' - ' + str;
}

obj.info.name = prefix + ' - ' +obj.info.name
console.log(obj.info.name);

var i = 1;
for (let item of obj.item) {
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

jsonfile.writeFile('./_' + argv._[0], obj, {spaces: 2}, function (err) {
  if (err) {
    console.error(err)
  }
});
