'use strict';


var cheerio = require('cheerio');
var MD5 = require('md5');
var fs = require('fs');


function getRegex(options) {
    var exts = [];
    for (var i = 0; i < options.resources.length; i++) {
        exts = exts.concat(options.resources[i].extensions);
    }

    var r = '(\\.\\d+)*(\\.(?:' + exts.join('|') + ')(?:[\\?&]*=?\\w*)*$)+';
    if(options.type === 'parameter') {
        //css/main.min.css?asd=wd&aswe=we&v=213
        //css/main.min.css?v=213
        //css/main.min.css
        //(\.(?:js|css))([\?|&][^v]+=?\w*)*([&\?]v=\d+)?$
        r = '(\\.(?:' + exts.join('|') + '))([\\?&][^v]+=?\\w*)*([&|\\?]v=\\d+)?$';
    }
    return new RegExp(r, "i");
}

exports.bust = function(fileContent, options, rollback) {

    options = {
        basePath: 'test',
        type: options.type || 'filename',
        parameterToken: options.parameterToken || 'v',
        value: options.value || new Date().getTime(),
        skipPrefix: options.skipPrefix || ['http(s)?', '\\/\\/'],
        skipSuffix: options.skipSuffix || [],
        hashFilename: options.hashFilename || 'hashes.json',
        resources: options.resources ||
            [{
                selector : 'script[src]',
                extensions : ['js', 'json'],
                attr : 'src'
            },{
                selector : 'link[rel=stylesheet][href]',
                extensions : ['css'],
                attr : 'href'
            },{
                selector : 'link[rel=preload][href], link[rel=prefetch][href]',
                extensions : ['js', 'css', 'woff2'],
                attr : 'href'
            }, {
                selector : 'link[rel=import][href]',
                extensions : ['html', 'css'],
                attr : 'href'
            },{
                selector : 'img',
                extensions : ['png', 'jpg', 'gif'],
                attr : 'src'
            }
            ]
    };

    if(options.moreResources) {
        options.resources.concat(options.moreResources);
    }

    var self = this;
    var $ = cheerio.load(fileContent);
    var regex = getRegex(options);
    var skipRegex = new RegExp('^' + options.skipPrefix.join('|'), "i");

    var manifest = [];
    if(fs.existsSync(options.hashFilename)) {
        manifest = JSON.parse(fs.readFileSync(options.hashFilename).toString())
    }
    // console.log(manifest);

    self.filename = function (old, match, value, rollback) {
        if(rollback) {
            return match[1] === undefined
                    ? old
                    : old.replace(match[1], '');
        }
        return match[1] === undefined
                    ? old.replace(match[2], '.' + value + match[2])
                    : old.replace(match[1], '.' + value);
    };


    self.parameter = function (old, match, value, rollback) {
        if(rollback) {
            return match[3] !== undefined
                    ? old.replace(match[3], '')
                    : old;
        }

        if(match[3]) {
                // /css/main.min.css?asdw=q&asdewf&v=123235
                return old.replace(match[3], match[3][0] + 'v=' + value);
        } else {
            return match[2] === undefined
                    ? old.replace(match[1], match[1] + '?v=' + value)  // /css/main.min.css
                    : old.replace(match[2], match[2] + '&v=' + value); // /css/main.min.css?asdw=q&asdewf
        }
    };

    for (var i = 0; i < options.resources.length; i++) {
        var elements = $(options.resources[i].selector);
        for (var j = 0; j < elements.length; j++) {
            var attrOrig = elements[j].attribs[options.resources[i].attr];

            var match = regex.exec(attrOrig);
            if(match === null || skipRegex.test(attrOrig)) {
                console.log('skipping ' + attrOrig);
                continue;
            }

            var attrFilePath = self[options.type](attrOrig, match, options.value, true).split('?')[0];

            if(!hasFileChanged(options, manifest, attrFilePath)) {
                console.log('file hasn\'t changed ' + attrOrig);
                continue;
            }

            var attrNew = self[options.type](attrOrig, match, options.value);
            console.log('renaming ' + attrOrig + '  ->  ' + attrNew);
            fileContent = fileContent.replace(attrOrig, attrNew);
        }
    }
    fs.writeFileSync('hashes.json', JSON.stringify(manifest) );
    return fileContent;
};

function hasFileChanged(options, manifest, filePath) {
    var path = options.basePath;
    if(!path.endsWith('/') && !filePath.startsWith('/')) {
        path += '/';
    }
    path = path + filePath;
    var hash = MD5(fs.readFileSync(path).toString());
    var hasChanged = true;
    var found = false;
    for (var x = 0; x < manifest.length; x++) {
        if(manifest[x]['file'] === path) {
            found = true;
            if(manifest[x]['hash'] === hash) {
                hasChanged = false;
            } else {
                manifest[x]['hash'] = hash;
            }
            break;
        }
    }
    if(!found) {
        manifest.push({file: path, hash: hash});
    }
    return hasChanged;
}