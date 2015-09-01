"use strict";

var expect = require('expect.js')
var Index  = require('../lib');





describe("Testing inner lib", function(){


    it("should should compare to commited values", function(){
      var dir = "test/references/data";

      var foo = Index.fetch(dir, null, null, null, function(err, hash){
          console.log(err, JSON.stringify(hash, null, 2));
      });

    });




});
