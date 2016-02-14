///<reference path="../typings/backbone/backbone.d.ts"/>

declare module Backbone {

    class DualStorage {
        static offlineStatusCodes : number[];
    }

}

declare module BBDualStorage {

    class Model extends Backbone.Model {
        hasTempId() : boolean;
    }

    class Collection<TModel extends Model> extends Backbone.Collection<TModel> {
        syncDirty(options : Backbone.ModelSaveOptions) : any[];
        dirtyModels() : Model[];
        syncDestroyed(options : Backbone.ModelDestroyOptions) : any[];
        destroyedModelIds() : [number|string];
        syncDirtyAndDestroyed(options : Backbone.PersistenceOptions) : any[];
    }

    interface BackboneDSStatic {
        getStoreName(collection : Collection<Model>, model?: Model) : string;
    }

}

// Backbone.DualStorage : DualStorage;
