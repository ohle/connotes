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

  describe('FilteredNotes', function() {
      var notes = new Backbone.Collection();
      var queries = new Backbone.Collection();

      var fooBar = new Notes.NoteModel('Foo', 'Bar');
      var bazQuux = new Notes.NoteModel('Baz', 'Quux');
      var barFrob = new Notes.NoteModel('Bar', 'Frobnicate');
      var test = new Notes.NoteModel('Test', 'Note');
      notes.add(fooBar);
      notes.add(bazQuux);
      notes.add(barFrob);
      notes.add(test);

      var fn = new Notes.FilteredNotes(queries, notes);

      var setQueries = function(texts) {
          queries.reset(_.map(texts, function(text) {
              return new Queries.QueryModel(text);
          }));
      };

      it('should not filter anything when there are no queries', function() {
          expect(fn.length).to.equal(notes.length);
      });

      it('should match on title and content', function() {
          setQueries(['Bar']);
          expect(fn.length).to.be.equal(2);
          expect(fn.contains(fooBar)).to.be.true;
          expect(fn.contains(barFrob)).to.be.true;
      });

      it('should reset properly', function() {
          setQueries(['Foo']);
          expect(fn.contains(bazQuux)).to.be.false;
          setQueries(['Baz']);
          expect(fn.contains(bazQuux)).to.be.true;
      });

      it('should OR its component queries', function() {
          setQueries(['Baz', 'Frobnicate']);
          expect(fn.length).to.be.equal(2);
          expect(fn.contains(bazQuux)).to.be.true;
          expect(fn.contains(barFrob)).to.be.true;
      });

      it('should preserve the order of the underlying notes', function() {
          setQueries(['Frobnicate', 'Baz']);
          expect(fn.length).to.be.equal(2);
          expect(fn.at(0)).to.be.equal(bazQuux);
          expect(fn.at(1)).to.be.equal(barFrob);
      });

      it('should react to added and removed notes', function() {
          setQueries(['Foo']);
          expect(fn.length).to.be.equal(1);
          var n = new Notes.NoteModel("Test", "Food");
          notes.add(n);
          expect(fn.length).to.be.equal(2);
          expect(fn.contains(n)).to.be.true;
          notes.remove(n);
          expect(fn.contains(n)).to.be.false;
      });

      it('should react to changed notes', function() {
          setQueries(['Foo']);
          expect(fn.contains(fooBar)).to.be.true;
          fooBar.setTitle('Test');
          expect(fn.contains(fooBar)).to.be.false;
          fooBar.setTitle('Foo');
          expect(fn.contains(fooBar)).to.be.true;
      });

      it('should react to removal of queries', function() {
          setQueries(['Foo', 'Bar']);
          expect(fn.length).to.be.equal(2);
          queries.remove(queries.at(1));
          expect(fn.length).to.be.equal(1);
      });
  });
}());
