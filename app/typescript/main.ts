/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="notes.ts"/>
/// <reference path="queries.ts"/>

import q = Queries;

declare var $: JQueryStatic;

let note = new NoteModel("title", "body");

let qs = new Backbone.Collection<q.QueryModel>();

let aq = new q.QueriesView({collection : qs, el: $('header')});
