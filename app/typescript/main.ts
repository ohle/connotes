/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="notes.ts"/>
/// <reference path="queries.ts"/>
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

let notes = new Backbone.Collection<n.NoteModel>();
notes.url = "foo"; // bogus for now
notes.fetch();

let filtered = new n.FilteredNotes(qs, notes);
let nv = new n.NotesView({ collection : filtered, el: $('ul.notes') });

$('#addNote').on("click", () => { 
    let newNote = new n.NoteModel("title", "body");
    notes.create(newNote);
});
