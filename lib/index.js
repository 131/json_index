require('nyks');
var fs       = require('fs');
var glob     = require("glob");
var path     = require("path");
var async    = require("async");


var index =  {

  _forgeList : function(cwd, start_dir, excludes, remap, callback){
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

      files[file_rel] = {
        'file_url'   : start_dir + file_path,
        'file_size'  : stats.size,
        'file_path'  : start_dir + file_rel,
      };
    });

    return files;
  },


  fetch : function(cwd, start_dir, excludes, remap, callback){
    start_dir = start_dir || '/';


    var tasks = [], files = {};
    Object.each(index._forgeList(cwd, start_dir, excludes, remap), function(file, file_rel) {

      tasks.push(function(chain) {

        fs.md5File(cwd + "/" + file.file_path, function (err, hash){

          files[start_dir + file_rel] = {
              'file_md5'   : hash,
              'file_url'   : file.file_url,
              'file_size'  : file.file_size,
              'file_path'  : file.file_path,
          };
          chain();
        });
      });
    });

    async.series(tasks, function(){
      callback(null, files);
    });
  },

  fetchSync : function(cwd, start_dir, excludes, remap){
    start_dir = start_dir || '/';

    var files = {};
    Object.each(index._forgeList(cwd, start_dir, excludes, remap), function(file, file_rel) {
      files[start_dir + file_rel] = {
          'file_md5'   : fs.md5FileSync(cwd + "/" + file.file_path),
          'file_url'   : file.file_url,
          'file_size'  : file.file_size,
          'file_path'  : file.file_path,
      };
    });

    return files;
  },

};

module.exports = index;