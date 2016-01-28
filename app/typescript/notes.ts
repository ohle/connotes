/// <reference path="../typings/backbone/backbone.d.ts"/>
/// <reference path="../typings/underscore/underscore.d.ts"/>
/// <reference path="queries.ts"/>

module Notes {
    import bb = Backbone;
    declare var _ : UnderscoreStatic;

    export interface Note {
        getTitle() : string;
        setTitle(t : string) : void;
        getBody() : string;
        setBody(b : string) : void;
    }

    export class NoteModel extends bb.Model implements Note {
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

            this.listenTo(queries, "change add reset", this.update);
            this.listenTo(notes, "change add reset", this.update);
            // remove events have to be handled separately because of
            // backbone Bug #3693 https://github.com/jashkenas/backbone/issues/3693
            this.listenTo(queries, "remove", this.removeQuery);
            this.listenTo(notes, "remove", this.removeNote);
            this.update();
        }

        // Just rebuild the filtered list on every change to the notes or
        // queries. Could be optimized by keeping a cache of filtered lists for
        // each query and responding to add/remove/changed events of both
        // queries and notes individually, but since the notes rarely update and
        // there will probably never be many queries, this should be good
        // enough (there will be O(N_notes * N_queries) filter operations on
        // every keypress, as opposed to O(N_notes) for the fine-grained
        // solution).
        private updateWithQueries(queries : Queries.QueryModel[]) {
            if (queries.length == 0) {
                this.reset(this.notes.models);
                return;
            }
            this.notes.forEach( (n : NoteModel, idx :number) => {
                if (_.any(queries,  (q, i) => this.matches(q, n) )) {
                    this.add(n); // will be ignored if already in
                } else {
                    this.remove(n);
                }
            });
        }

        // Would be obsolete if not for backbone bug, see above
        private update() {
            this.updateWithQueries(this.queries.models);
        }

        private removeQuery(removed : Queries.QueryModel) {
            console.log(this.queries.filter(q => q != removed));
            this.updateWithQueries(this.queries.filter(q => q != removed));
        }
        
        private removeNote(n : NoteModel) {
            this.remove(n);
        }

        private matches(q : Queries.Query, n : Note) : boolean {
            let s = q.getText();
            return n.getTitle().indexOf(s) >= 0 || n.getBody().indexOf(s) >= 0;
        }
    }
}
