require('nyks');
var fs       = require('fs');
var glob     = require("glob");
var path     = require("path");


module.exports = {

  fetchSync : function(cwd, start_dir, excludes, remap){
    start_dir = start_dir || '/';
    excludes  = excludes  || [];
    remap     = remap     || {};

    // options is optional
    var files_path = glob.sync("**", {cwd : cwd});


    files_path = files_path.filter(function(path){ return fs.isFileSync(cwd + "/" + path) });
    files_path = Object.combine(files_path, files_path);

    var files = {};


    Object.each(files_path, function(file_path, file_rel){
      if(file_path in remap)
        file_rel = remap[file_path];

      if(excludes.some(function(value){
        return value.test(file_path);
      })) return;

      var stats = fs.statSync(cwd + "/" + file_path)
      if(!stats.isFile())
        return;

      files[start_dir + file_rel] = {
          'file_md5'   : fs.md5FileSync(cwd + "/" + file_path),
          'file_url'   : start_dir + file_path,
          'file_size'  : stats.size,
          'file_path'  : start_dir + file_rel,
      };
    });

    return files;
  },

};