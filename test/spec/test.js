/* globals Queries */
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
  });

  describe('ActiveQueriesView', function() {
      var qs = new Backbone.Collection();
      var element = $('<div>');
      var list = $('<ul>').addClass('queries');
      var searchBar = $('<input>').val('dummy').attr('id', 'query');
      var removeButton = $('<a>').attr('id', 'remove');
      var template = $('<script>').attr('type', 'x-tmpl-mustache')
                                  .attr('id', 'queriesTemplate');
      var testQuery = new Queries.QueryModel('test');
      template.html('{{#queries}}<li>{#text}</li>{{/queries}}');
      element.append(list);
      element.append(searchBar);
      element.append(removeButton);
      element.append(template);
      var aq = new Queries.QueriesView({collection: qs, el: element});

      it('should add all confirmed queries to the list', function() {
          expect(list.children().length).to.equal(0);
          qs.add(new Queries.QueryModel('test'));
          expect(list.children().length).to.equal(1);
          qs.add(testQuery);
          expect(list.children().length).to.equal(2);
      });
      it('should remove deleted queries', function() {
          qs.remove(testQuery);
          expect(list.children().length).to.equal(1);
      });
      it('should not add bogus entries', function() {
          testQuery.setText('foo');
          expect(list.children().length).to.equal(1);
      });
  });
}());
