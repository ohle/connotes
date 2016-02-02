/// <reference path="../typings/backbone/backbone.d.ts"/>
/// <reference path="../typings/mustache/mustache.d.ts"/>

module Util {
    import bb = Backbone;

    export class TemplatedView<TModel extends bb.Model> extends bb.View<TModel> {

        template : string;

        constructor(options) {
            console.log("in TV constructor");
            super(options);
            let templateId = this.$el.attr('id') + 'Template';
            this.template = $('#' + templateId).html();
            console.log(templateID);
            console.log(this.template);
        }

        render() {
            $(this.el).html(Mustache.render(this.template, this.model.toJSON()));
            return this;
        }
    }
}
