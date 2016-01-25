/// <reference path="../typings/backbone/backbone.d.ts"/>

class NoteModel extends Backbone.Model {

    get title() : string {
        return super.get("title");
    }

    get body(): string {
        return super.get("body");
    }
}
