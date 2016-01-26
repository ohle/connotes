/// <reference path="../typings/backbone/backbone.d.ts"/>

module Queries {
    export interface IQuery {
        text : string
    }

    export class QueryModel extends Backbone.Model implements IQuery {
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

    export class QueryView extends Backbone.View<QueryModel> {
        private element : JQuery;
    }
}
