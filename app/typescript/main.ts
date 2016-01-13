/// <reference path="../typings/jquery/jquery.d.ts"/>
declare var $: JQueryStatic;

class Greeter {
   constructor(public greeting : string) { }
   greet() {
       window.alert(this.greeting);
   }
};

var greeter = new Greeter("Boo!");
greeter.greet();

// testing typescriptized jquery
var foo : JQuery = $('body');
console.log(foo.html());
alert(foo.html());
