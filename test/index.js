"use strict";

var expect = require('expect.js')
var Index  = require('../lib');
var fs     = require('fs') ;
var equals = require('mout/object/equals') ;
var omit  = require('mout/object/omit') ;


describe("Testing inner lib", function(){


    it("should should compare to commited values", function(done){
      var dir = "test/references/data";

      var data = JSON.parse(fs.readFileSync("test/references/data.json", 'utf-8'));

    var Syncfiles = Index.fetchSync(dir, null, null, null)

      var foo = Index.fetch(dir, null, null, null, function(err, hash){
          expect(hash).to.eql(data);
          expect(Syncfiles).to.eql(data);

          done(); 
        });
    });

    it("should should compare to commited with exlude", function(){
      var dir = "test/references/data";

      var Syncfiles = Index.fetchSync(dir, null, ["ar-.*.png"], null) ;
      expect(Syncfiles).to.eql({}) ;

      var Syncfiles = Index.fetchSync(dir, null, [new RegExp("ar-tests_drawing.png")], null) ;
      expect(Syncfiles).to.eql({}) ;
    });


    it("should should compare to commited with remap", function(){
      var dir = "test/references/data";

      var data = JSON.parse(fs.readFileSync("test/references/data.json", 'utf-8'));

    var Syncfiles = Index.fetchSync(dir, null, null, {
      "ar-tests_drawing.png" : "image.png"
    }) ;

    data["/image.png"] = data["/ar-tests_drawing.png"] ;
    data["/image.png"]["file_path"] = "/image.png" ;
    data = omit(data, "/ar-tests_drawing.png")

    expect(Syncfiles).to.eql(data) ;
    
    });

});
