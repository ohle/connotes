/// <reference path="../typings/backbone/backbone.d.ts"/>
/// <reference path="../typings/underscore/underscore.d.ts"/>

import bb = Backbone;

module Queries {
    export interface IQuery {
        text : string
    }

    export class QueryModel extends bb.Model implements IQuery {
        text : string;

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

    export class QueryView extends bb.View<QueryModel> {
        private element : JQuery;

        initialize() {
            this.render();
            this.listenTo(this.model, "change", this.render);
        }

        events() : bb.EventsHash {
            return {
                "click": this.model.destroy
            }
        }

        render() {
            this.$el.html(_.escape(this.model.getText()));
            return this;
        }
    }

    export class ActiveQueriesView extends bb.View<QueryModel> {

        queries : bb.Collection<QueryModel>;
        searchBar : JQuery;
        list : JQuery;
        removeButton : JQuery;

        initialize() {
            this.list = this.$('ul.queries');
            this.searchBar = this.$('#query');
            this.removeButton = this.$('#remove')
            this.listenTo(this.collection, "change", this.render);
            this.collection.add(new QueryModel(this.searchBar.val()));
        }

        events() : bb.EventsHash {
            return {
                "keyup #query" : this.keyUp
            }
        }

        render() {
            alert("Collection changed");
            return this;
        }

        keyUp(event) {
            if (event.keyCode === 13) {
                this.collection.add(new QueryModel(""));
                this.searchBar.val("");
            } else {
                this.collection.last().setText(this.searchBar.val());
            }
        }
    }
}
