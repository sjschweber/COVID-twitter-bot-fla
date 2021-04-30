var assert = require('assert');
let {mapCountiesToRegion} = require('../index.js')


describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});


describe('String', function() {

    it('should return true if values are equal', function(){
      assert.strictEqual("hello", "hello")
    })

})
