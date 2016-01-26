(function () {
  'use strict';

  describe('QueryModel', function() {
      var m = new Queries.QueryModel('test');
      it('should store a query', function() {
          expect(m.getText()).to.be.equal('test');
      });
      it('should allow setting the text', function() {
          m.setText('foo');
          expect(m.getText()).to.be.equal('foo');
      });
  })

  describe('QueryView', function() {
      var m = new Queries.QueryModel('test');
      var e = $('<div>');
      var v = new Queries.QueryView({model: m, el: e});
      it('should set the element html to the query text', function() {
          expect(e.html()).to.equal(m.getText());
      });
      it('should update the html when the query text changes', function() {
          m.setText('foo');
          expect(e.html()).to.equal(m.getText());
      });

  });
}());
