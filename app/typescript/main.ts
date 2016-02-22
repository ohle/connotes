///<reference path="../typings/jquery/jquery.d.ts"/>
///<reference path="notes.ts"/>
///<reference path="queries.ts"/>
///<reference path="backbone.dualStorage.d.ts"/>

import q = Queries;
import n = Notes;

// Temporarily add 404 as offline marker so we can set bogus URLs and have
// localStorage syncing work. Might still use this technique later when no
// backend is selected, e.g.
Backbone.DualStorage.offlineStatusCodes.push(404);

declare var $: JQueryStatic;

let qs = new Backbone.Collection<q.QueryModel>();

let aq = new q.QueriesView({collection : qs, el: $('header')});

class NoteCollection extends Backbone.Collection<n.NoteModel> {
    constructor(url : string) {
        super();
        this.url = url;
    }

    model = n.NoteModel;
}

let notes = new NoteCollection("foo"); // bogus URL for now
notes.fetch();

let cm = new n.FilteredCount();
let filtered = new n.FilteredNotes(qs, notes, cm);
let cv = new n.FilteredCountView({ model: cm, el: $('#filteredCount') });
let nv = new n.NotesView({ collection : filtered, el: $('ul.notes') });

$('#addNote').on("click", () => { 
    let newNote = new n.NoteModel();
    newNote.setTitle("Title").setBody("Body");
    notes.create(newNote);
    newNote.setEditing(true);
});
