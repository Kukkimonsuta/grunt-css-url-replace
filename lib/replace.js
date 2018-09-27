var fs = require('fs'),
  path = require('path'),
  Replace;

Replace = function(fileName, staticRoots) {
  this.fileName = fileName;
  this.staticRoots = staticRoots;
};

Replace.prototype.run = function() {
  var fileName = this.fileName,
    staticRoots = this.staticRoots,
    data;

  if (fs.existsSync(fileName)) {
    data = fs.readFileSync(fileName).toString();
    if (data && staticRoots) {
      return data.replace(/url\s*\(\s*(['"]?)([^"'\)]*)\1\s*\)/gi, function(match, location) {
        var dirName = path.resolve(path.dirname(fileName)).replace(/\\/g, '/'),
          url;

        match = match.replace(/\s/g, '');
        url = match.slice(4, -1).replace(/"|'/g, '').replace(/\\/g, '/');

        if (/^\/|https:|http:|data:/i.test(url) === false) {
          var urlPath = path.resolve(dirName + '/' + url).replace(/\\/g, '/');

          for (var si = 0; si < staticRoots.length; si++) {
            var staticRoot = staticRoots[si];

            if (urlPath.indexOf(staticRoot) === -1) {
              continue;
            }

            if (urlPath.indexOf(staticRoot) > -1) {
              url = urlPath.substr(urlPath.indexOf(staticRoot) + staticRoot.length);
            }

            break;
          }
        }

        return 'url("' + url + '")';
      });
    }

    return data;
  }

  return '';
};

module.exports = Replace;
