/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus          = brackets.getModule("command/Menus");

    // Local modules
    require('phonegapbuild');    
    var phonegapbuild = new PhoneGapBuild();
    //hardcode for now.  Eventually, we'll save the token in local storage. 
    phonegapbuild.getToken("", "");   

    
    // Function to run when the menu item is clicked
    function handlePGList() {
        var list = "";
        for (var i = 0; i < phonegapbuild.list.length; i++){
            list += phonegapbuild.list[i].title + ", ";
        }


        window.alert(list);
    }
    
    
    // First, register a command - a UI-less object associating an id to a handler
    var PG_LIST = "PhoneGap.list";
    CommandManager.register("List Build Projects", PG_LIST, handlePGList);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu;
    menu = Menus.addMenu("PhoneGap", "tpryan.phonegap.phonegap");
    menu.addMenuItem(PG_LIST);
    
});