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
        isBeingEdited() : boolean;
        setEditing(e : boolean) : void;
    }

    export class NoteModel extends bb.Model implements Note {
        title : string;
        body : string;
        editing : boolean;

        constructor(title : string, body : string) {
            super();
            this.setTitle(title);
            this.setBody(body);
            this.setEditing(false);
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

        isBeingEdited() {
            return super.get("editing");
        }

        setEditing(e : boolean) {
            super.set("editing", e);
        }
    }

    export class NoteView extends bb.View<NoteModel> {
        template : string;

        constructor(options) {
            options.tagName = "li";
            options.className = "note";
            super(options);
            this.template = $('#noteTemplate').html();
        }

        render() {
            $(this.el).html(Mustache.render(this.template, this.model.toJSON()));
            return this;
        }
    }

    export class NotesView extends bb.View<NoteModel> {

        initialize() {
            this.render();

            this.listenTo(this.collection, "add remove change reset", this.render);
        }

        render() {
            this.$el.empty();
            this.collection.each( (n : NoteModel, idx : number) => {
                let nv = new NoteView({ model : n });
                nv.render();
                this.$el.append(nv.el);
            });
            return this;
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

        countFiltered() : number {
            return this.notes.length - this.length;
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
            let nonEmptyQueries = queries.filter( (q, i) => q.getText().length > 0 );
            console.log(nonEmptyQueries);
            if (nonEmptyQueries.length == 0) {
                this.reset(this.notes.models);
                return;
            }
            this.reset();
                                   
            this.notes.forEach( (n : NoteModel, idx :number) => {
                if (_.every(nonEmptyQueries,  q => this.matches(q, n))) {
                    this.add(n); // will be ignored if already in
                } 
            });
        }

        // Would be obsolete if not for backbone bug, see above
        private update() {
            this.updateWithQueries(this.queries.models);
        }

        private removeQuery(removed : Queries.QueryModel) {
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
