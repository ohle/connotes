///<reference path="../typings/backbone/backbone.d.ts"/>
///<reference path="../typings/underscore/underscore.d.ts"/>
///<reference path="../typings/mustache/mustache.d.ts"/>

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

    class QueryView extends bb.View<QueryModel> {
        template : string;

        constructor(options) {
            options.tagName = "li";
            super(options);
        }

        events() : bb.EventsHash {
            return {
                "click a" : this.removeElement
            }
        }

        initialize() {
            this.template = $('#queryTemplate').html();
            Mustache.parse(this.template);
        }

        render() {
            $(this.el).html(Mustache.render(this.template, this.model.toJSON()));
            return this;
        }

        removeElement() {
            this.model.destroy();
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

            // this.listenTo(this.collection, "change", this.render);
            this.listenTo(this.collection, "add", this.render);
            this.listenTo(this.collection, "remove", this.render);

            this.collection.add(new QueryModel(this.searchBar.val()));
        }

        events() : bb.EventsHash {
            return {
                "keyup #query" : this.keyUp,
                "click #remove" : this.empty,
                "click #search" : this.confirmQuery
            }
        }

        render() {
            let completed = this.collection.slice(0, this.collection.length - 1);
            let result = Mustache.render(this.template, completed);
            this.list.html(result);
            _.each(completed, (q : QueryModel, idx : number) => {
                let v = new QueryView({model : q});
                v.render();
                this.list.append(v.el);
            });

            this.searchBar.focus();
            return this;
        }

        private keyUp(event) {
            if (event.keyCode === 13) {
                this.confirmQuery();
            } else {
                this.collection.last().setText(this.searchBar.val());
            }
        }

        private confirmQuery() {
            let text = this.searchBar.val();
            if (text.length == 0) {
                return; // nothing to do
            }
            this.collection.add(new QueryModel("")); // new searchbar query
            this.searchBar.val("");
        }

        private empty() {
            this.collection.reset([new QueryModel("")]);
            this.render();
        }
    }
}
