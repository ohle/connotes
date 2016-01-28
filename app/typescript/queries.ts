/// <reference path="../typings/backbone/backbone.d.ts"/>
/// <reference path="../typings/underscore/underscore.d.ts"/>
/// <reference path="../typings/mustache/mustache.d.ts"/>

module Queries {
    import bb = Backbone;
    export interface Query {
        getText() : string;
        setText(t :string);
    }

    export class QueryModel extends bb.Model implements Query {
        initialize(text : string) {
            this.setText(text);
        }

        getText() : string {
            return super.get("text");
        }

        setText(t : string) {
            super.set("text", t);
        }

    }

    export class QueriesView extends bb.View<QueryModel> {

        queries : bb.Collection<QueryModel>;
        searchBar : JQuery;
        list : JQuery;
        removeButton : JQuery;
        template : string;

        initialize() {
            this.list = this.$('ul.queries');
            this.searchBar = this.$('#query');
            this.removeButton = this.$('#remove');
            this.template = this.$('#queriesTemplate').html();

            Mustache.parse(this.template);

            this.listenTo(this.collection, "change", this.render);
            this.listenTo(this.collection, "add", this.render);
            this.listenTo(this.collection, "remove", this.render);

            this.collection.add(new QueryModel(this.searchBar.val()));
        }

        events() : bb.EventsHash {
            return {
                "keyup #query" : this.keyUp,
                "click #remove" : this.empty
            }
        }

        render() {
            let result : string = Mustache.render(
                this.template, { queries : this.collection
                                               .slice(0, this.collection.length - 1)
                                               .map(q => q.toJSON())
            });
            this.list.html(result);

            return this;
        }

        private keyUp(event) {
            if (event.keyCode === 13) {
                this.collection.add(new QueryModel(""));
                this.searchBar.val("");
            } else {
                this.collection.last().setText(this.searchBar.val());
            }
        }

        private empty() {
            this.collection.reset();
            this.render();
        }
    }
}
