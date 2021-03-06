var fs = require('fs-extra');
var path = require('path');
var nugget = require('nugget');
var extract = require('extract-zip');

var downloadUrl = require('./download').url;
var version = require('./download').version;
var platform = process.platform;
var arch = platform === 'win32' ? 'ia32' : process.arch;


var target = 'jibo-nlu-js-v' + version + '-' + platform + '-' + arch + '.zip';
var targetDir = 'jibo-nlu-js';
downloadUrl += target;

var cacheDir = path.join(__dirname, 'tmp');
var copyDir = path.join(__dirname, 'parser');

var opts = {
    target: target,
    dir: cacheDir,
    verbose: true,
    strictSSL: true,
    resume: true
};
try {
    fs.removeSync(cacheDir);
    fs.removeSync(copyDir);
}
catch(e) {
    //don't care
}

fs.mkdirsSync(cacheDir);
fs.mkdirsSync(copyDir);

nugget(downloadUrl, opts, function (err) {
    if (err) {
        console.error(err);
        return;
    }
    extract(path.join(cacheDir, target), {dir: cacheDir}, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        fs.copySync(path.join(cacheDir, targetDir), copyDir, {clobber: true});
        fs.remove(cacheDir, function() {});
        var parserRoot = path.join(__dirname, 'parser', 'build', 'Release');
        //get around v8 version red bug
        fs.renameSync(path.join(parserRoot, 'jsjibonlu.node'), path.join(parserRoot, 'jsjibonlu.jibo'));
    });
});

