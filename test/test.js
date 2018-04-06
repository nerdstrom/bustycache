var assert = require('assert');
var fs = require('fs');

var bustycache = require('../lib/busty-cache');


function getOptions(type) {
  return {
        type: type,
        basePath: 'test/',
        hashFilename: 'test-hashes.json',
        value: 123
    };
}

afterEach(function() {
  if(fs.existsSync(getOptions('filename').hashFilename)) {
    fs.unlinkSync(getOptions('filename').hashFilename);
  }
});

describe('bustycache html', function() {


  describe('type: filename', function() {

    var options = getOptions('filename');
    var file = fs.readFileSync('test/filename/test.html', 'utf8');
    var expected = fs.readFileSync('test/filename/test_expected.html', 'utf8');
    var expected2 = fs.readFileSync('test/filename/test_expected2.html', 'utf8');
    var expected_rollback = fs.readFileSync('test/filename/test_rollback_expected.html', 'utf8');

    it('add value to filenames', function() {
      assert.equal(bustycache.bust(file, options), expected);
    });


    it('add value to already prepped filenames', function() {
      options.value = 12345;
      assert.equal(bustycache.bust(expected, options), expected2);
    });

    it('remove value from filenames', function() {
      assert.equal(bustycache.bust(expected, options, true), expected_rollback);
      assert.equal(bustycache.bust(expected2, options, true), expected_rollback);
    });


  });

  describe('type: parameter', function() {

    var options = getOptions('parameter');
    var file = fs.readFileSync('test/parameter/test.html', 'utf8');
    var expected = fs.readFileSync('test/parameter/test_expected.html', 'utf8');
    var expected2 = fs.readFileSync('test/parameter/test_expected2.html', 'utf8');
    var expected_rollback = fs.readFileSync('test/parameter/test_rollback_expected.html', 'utf8');


    it('add parameter to filenames', function() {
      assert.equal(bustycache.bust(file, options), expected);
    });

    it('add parameter to already prepped filenames', function() {
      options.value = 12345;
      assert.equal(bustycache.bust(expected, options), expected2);
    });

    it('remove parameter from filenames', function() {
      assert.equal(bustycache.bust(expected, options, true), expected_rollback);
      assert.equal(bustycache.bust(expected2, options, true), expected_rollback);
    });

  });

});

