/// <reference path="../typings/jquery/jquery.d.ts"/>
declare var $: JQueryStatic;
$(() => {
    var plusButton: JQuery = $("<button>+</button>");
    var minusButton: JQuery = $("<button>-</button>");
    $("header").append(plusButton).append(minusButton);
    plusButton.on("click", () => {
        $("ul.notes").append("<li> autonote </li>");
    });
    minusButton.on("click", () => {
        $("ul.notes").children().last().remove();
    });
});
