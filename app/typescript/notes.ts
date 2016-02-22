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

        getTitle() : string {
            return super.get("title");
        }

        setTitle(t : string) : NoteModel {
            super.set("title", t);
            return this;
        }

        getBody(): string {
            return super.get("body");
        }

        setBody(b : string) : NoteModel {
            super.set("body", b);
            return this;
        }

        isBeingEdited() {
            return super.get("editing");
        }

        setEditing(e : boolean) {
            super.set("editing", e);
            return this;
        }
    }

    export class FilteredCount extends bb.Model {
        initialize() {
            this.setCount(0);
        }

        getCount() : number {
            return super.get("count");
        }

        setCount(c : number) {
            super.set("count", c);
            return this;
        }
    }

    export class FilteredCountView extends bb.View<FilteredCount> {
        initialize() {
            this.listenTo(this.model, "change", this.render);
        }

        render() {
            let count = this.model.getCount();
            if (count == 0) {
                this.$el.hide();
            } else {
                this.$el.html(count + " notes filtered");
                this.$el.show();
            }
            return this;
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

        initialize() {
            this.listenTo(this.model, "change", this.render);
            this.listenTo(this.model, "remove", this.remove);
        }

        events() {
            return <bb.EventsHash>{
                'click [data-action="edit"]' : () => { this.model.setEditing(true); },
                'click [data-action="delete"]' : () => {
                    if (window.confirm("really delete '" + this.model.getTitle() + "'?")) {
                        this.model.destroy();
                    }
                },
                'click [data-action="done"]' : () => {
                    let title = this.$('.title').val();
                    let body = this.$('.note-body').val();
                    this.model.setTitle(title);
                    this.model.setBody(body);
                    this.model.setEditing(false);
                    this.model.save();
                },
                'click [data-action="cancel"]' : () => {
                    if (window.confirm("Cancel editing?")) {
                        this.model.setEditing(false);
                    }
                }
            }
        }

        render() {
            $(this.el).html(Mustache.render(this.template, this.model.toJSON()));
            if (this.model.isBeingEdited()) {
                if (!this.$('.note-body').is(':focus')) {
                    this.$('.title').focus().select();
                }
            }
            return this;
        }
    }

    export class NotesView extends bb.View<NoteModel> {

        initialize() {
            this.render();

            this.listenTo(this.collection, "reset", this.render);
            this.listenTo(this.collection, "add", this.addNote);
        }

        render() {
            this.$el.empty();
            this.collection.each( (n : NoteModel, idx : number) => {
                this.addNote(n);
            });
            return this;
        }

        addNote(n: NoteModel) {
            let nv = new NoteView({ model : n });
            nv.render();
            this.$el.append(nv.el);
        }
    }

    /**
     * A Collection that acts as a proxy for a Collection<NoteModel>
     * and takes a Collection<QueryModel> to be used for filtering the notes
     */
    export class FilteredNotes extends bb.Collection<NoteModel> {
        queries : bb.Collection<Queries.QueryModel>;
        notes :  bb.Collection<NoteModel>;
        countModel : FilteredCount;

        constructor(queries : bb.Collection<Queries.QueryModel>,
                    notes : bb.Collection<NoteModel>,
                    countModel? : FilteredCount) {
            super(notes.models);
            this.queries = queries;
            this.notes = notes;
            this.countModel = countModel;

            this.listenTo(queries, "change add reset", this.update);
            this.listenTo(queries, "add", () => {
                if (queries.length == 2 && this.length == 0) {
                    let n = new NoteModel()
                            .setTitle(queries.first().getText())
                            .setBody("body")
                    notes.add(n, { at: 0 });
                    n.setEditing(true);
                }
            });
            this.listenTo(notes, "change:editing", this.updateEditing);
            this.listenTo(notes, "change add reset", this.update);
            // remove events have to be handled separately because of
            // backbone Bug #3693 https://github.com/jashkenas/backbone/issues/3693
            this.listenTo(queries, "remove", this.removeQuery);
            this.listenTo(notes, "remove", this.removeNote);
            this.update();
        }

        private updateEditing(n : NoteModel) {
            if (n.isBeingEdited()) {
                this.without(n).forEach( (other, idx) => {
                    other.setEditing(false);
                });
            }
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
            if (nonEmptyQueries.length == 0) {
                // re-add all missing models
                this.add(_.difference(this.notes.models, this.models));
                return;
            }
            // this.reset();
            let filtered = new Array<NoteModel>();
                                   
            this.notes.forEach( (n : NoteModel, idx :number) => {
                if (_.every(nonEmptyQueries,  q => this.matches(q, n))) {
                    filtered.push(n); // will be ignored if already in
                } 
            });
            this.remove(_.difference(this.models, filtered));
            this.add(_.difference(filtered, this.models));
        }

        // Would be obsolete if not for backbone bug, see above
        private update() {
            this.updateWithQueries(this.queries.models);
            this.updateCount();
        }

        private updateCount() {
            if (this.countModel) {
                this.countModel.setCount(this.notes.length - this.length);
            }
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
