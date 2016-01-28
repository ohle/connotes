/// <reference path="../typings/backbone/backbone.d.ts"/>
/// <reference path="queries.ts"/>

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

    /**
     * A Collection that acts as a proxy for a Collection<NoteModel>
     * and takes a Collection<QueryModel> to be used for filtering the notes
     */
    export class FilteredNotes extends bb.Collection<NoteModel> {
        queries : bb.Collection<Queries.QueryModel>;
        notes :  bb.Collection<NoteModel>;

        constructor(queries : bb.Collection<Queries.QueryModel>,
                    notes : bb.Collection<NoteModel>) {
            super(notes.models);
            this.queries = queries;
            this.notes = notes;
        }
    }
}
