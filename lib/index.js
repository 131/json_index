var fs       = require('fs');
var glob     = require("glob");
var path     = require("path");
var async    = require("async");

var forIn        = require("mout/object/forIn");
var md5File      = require("nyks/fs/md5File");
var md5FileSync  = require("nyks/fs/md5FileSync");
var isFileSync   = require("nyks/fs/isFileSync");
var combine      = require("nyks/object/combine");


var index =  {

  _forgeList : function(cwd, start_dir, excludes, remap, callback){
    excludes  = excludes  || [];
    remap     = remap     || {};

    // options is optional
    var files_path = glob.sync("**", {cwd : cwd});

    files_path = files_path.filter(function(path){ return isFileSync(cwd + "/" + path) });
    files_path = combine(files_path, files_path);

    var files = {};

    forIn(files_path, function(file_path, file_rel){

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
        'file_path'  : cwd + "/" + file_path,
        'file_rel'   : start_dir +  file_rel,
      };
    });

    return files;
  },


  fetch : function(cwd, start_dir, excludes, remap, callback){
    start_dir = start_dir || '/';


    var tasks = [], files = {};
    forIn(index._forgeList(cwd, start_dir, excludes, remap), function(file, file_rel) {

      tasks.push(function(chain) {

        md5File(file.file_path, function (err, hash){

          files[file.file_rel] = {
              'file_md5'   : hash,
              'file_url'   : file.file_url,
              'file_size'  : file.file_size,
              'file_path'  : file.file_rel,
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
    forIn(index._forgeList(cwd, start_dir, excludes, remap), function(file, file_rel) {
      files[file.file_rel] = {
          'file_md5'   : md5FileSync(file.file_path),
          'file_url'   : file.file_url,
          'file_size'  : file.file_size,
          'file_path'  : file.file_rel,
      };
    });

    return files;
  },

};

module.exports = index;