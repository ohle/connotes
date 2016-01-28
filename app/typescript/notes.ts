/// <reference path="../typings/backbone/backbone.d.ts"/>

module Notes {
    import bb = Backbone;
    export class NoteModel extends bb.Model {
        title : string;
        body : string;

        constructor(title : string, body : string) {
            super();
            this.setTitle(title);
            this.setBody(body);
        }

        getTitle() : string {
            return super.get("title");
        }

        setTitle(t : string) {
            super.set("title", t);
        }

        getBody(): string {
            return super.get("body");
        }

        setBody(b : string) {
            super.set("body", b);
        }
    }
}
