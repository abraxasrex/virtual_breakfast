//var chai = require('chai');
var assert = chai.assert;
var should = chai.should();
var expect = chai.expect;

describe('Enemies removed from scene', function(){
  it('should happen when enemy array is empty', function(){
    if(gameTracker.enemies.length === 0 && !!scene){
      scene.children.forEach(function(child){
        child.geometry.type.should.not.equal('SphereGeometry');
      });
      scene[x].geometry.type == 'SphereGeometry';
    }
  });

});
