/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="notes.ts"/>
/// <reference path="queries.ts"/>

import q = Queries;
import n = Notes;

declare var $: JQueryStatic;

let note1 = new n.NoteModel("title", "body");
let note2 = new n.NoteModel("foo", "bar");

let qs = new Backbone.Collection<q.QueryModel>();

let aq = new q.QueriesView({collection : qs, el: $('header')});

let notes = new Backbone.Collection<n.NoteModel>();
notes.add(note1);
notes.add(note2);
note2.setEditing(true);
let filtered = new n.FilteredNotes(qs, notes);
let nv = new n.NotesView({ collection : filtered, el: $('ul.notes') });

$('#addNote').on("click", () => { 
    let newNote = new n.NoteModel("title", "body");
    notes.add(newNote, { at: 0 });
    newNote.setEditing(true);
});

