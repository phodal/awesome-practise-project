// code basis on https://github.com/JacksonTian/fks/blob/master/bin/generate.js
// Thanks to JacksonTian
var fs = require('fs');
var path = require('path');

var readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8');

var getItems = function (str) {
    var patt = /([ ]*)-(.*)/g;
    var result;

    var list = [];
    while ((result = patt.exec(str)) != null) {
        list.push({level: result[1].length / 2, content: result[2].trim()});
    }
    return list;
};

var filter = function (list) {
    var j = 0;
    var f2e = [];
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (item.level === 0) {
            j = j + 1;
            if (j === 2) {
                break;
            }
        }

        f2e.push(item);
    }
    return f2e;
};

var format = function (list) {
    var result = [];
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var data = {
            name: item.content,
            level: item.level
        };
        result.push(data);
    }
    return result;
};

var items = getItems(readme);
var f2e = filter(items);
var formated = format(f2e);

var generateLinksAndDescription = function (str) {
    var patt = /\[([^\]]+)\]\(([^)]+)\)(.*)/g;
    var result;

    var list = [];
    while ((result = patt.exec(str)) != null) {
        var projectName = result[1];
        var projectLink = result[2];
        var projectDesc = result[3];
        list.push({name: projectName, link: projectLink, desc: projectDesc});
    }
    return list;
};

var buildTree = function (list) {
    var root = null;
    for (var i = 0; i < list.length; i++) {
        var item = list[i];

        if (root === null) {
            root = item;
            root.domains = [];
        }

        var lastLevel0 = root.domains;
        if (item.level === 1) {
            lastLevel0.push(item);
        }

        if (item.level === 2) {
            var lastLevel1 = lastLevel0[lastLevel0.length - 1];
            lastLevel1.subdomains = lastLevel1.subdomains || [];
            lastLevel1.subdomains.push(item);
        }

        if (item.level === 3) {
            var lastLevel1Child = lastLevel0[lastLevel0.length - 1].subdomains;
            var lastLevel2 = lastLevel1Child[lastLevel1Child.length - 1];
            lastLevel2.projects = lastLevel2.projects || [];
            var itemDesc = generateLinksAndDescription(item.name);
            lastLevel2.projects.push(itemDesc[0]);
        }

        delete item.level;
    }
    return root;
};

var api = {};
var tree = buildTree(formated);
api.source = "http://awesome-practise-project.phodal.com/";
api.content = tree.domains;
fs.writeFileSync(path.join(__dirname, '../api/all.json'), JSON.stringify(api, null, '  '));