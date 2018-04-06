# bustycache [![Build Status](https://travis-ci.org/nerdstrom/bustycache.svg?branch=master)](https://travis-ci.org/nerdstrom/bustycache)
Simple cache busting script to revision filenames in your html files if the resources have changed.

Supports adding a numeric value to the filename (css/main.1523028608000.css), or appending a parameter (css/main.css?v=1523028608000).
It can also 'rollback' and remove previously added revision strings from your files.

`npm install --save-dev busty-cache`


## Usage
```javascript
var bustycache = require('busty-cache');

// ... get file contents

var newContent = bustycache.bust(fileContents, options, rollback);

// ... write new contents to file
```
or use cli.js


### Options
```javascript
var options = {
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
```
#### More options
`options.moreResources` is merged with `options.resources`


## Example
### Before
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.9/css/all.css">
    <link rel="stylesheet" href="css/main.min.css">
    <link rel="stylesheet" href="css/foo/bar.min.css">
    <link rel="stylesheet" href="/css/bla.min.css">
    <link rel="stylesheet" href="/css/bla.css">
    <script async src="js/main.js"></script>
    <title>Title</title>
</head>
<body>
    <div id="map"></div>
    <img src="img/blafi.png">
    <script src="https://maps.googleapis.com/maps/api/js"></script>
    <script async src="js/bar.js"></script>
</body>
</html>
```
### After
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.9/css/all.css">
    <link rel="stylesheet" href="css/main.min.1523028608000.css">
    <link rel="stylesheet" href="css/foo/bar.min.1523028608000.css">
    <link rel="stylesheet" href="/css/bla.min.1523028608000.css">
    <link rel="stylesheet" href="/css/bla.1523028608000.css">
    <script async src="js/main.1523028608000.js"></script>
    <title>Title</title>
</head>
<body>
    <div id="map"></div>
    <img src="img/blafi.1523028608000.png">
    <script src="https://maps.googleapis.com/maps/api/js"></script>
    <script async src="js/bar.1523028608000.js"></script>
</body>
</html>
```


