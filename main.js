/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, event, PhoneGapBuild */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus          = brackets.getModule("command/Menus"),
        Commands                = brackets.getModule("command/Commands"),
        EditorManager           = brackets.getModule("editor/EditorManager"),
        DocumentManager         = brackets.getModule("document/DocumentManager");


    // First, register a command - a UI-less object associating an id to a handler
    var PG_LIST = "PhoneGap.list";
    var PG_LOGINLOGOUT = "PhoneGap.login-logout";
    var menu;

    // Local modules
    require('phonegapbuild');
    var phonegapbuild = new PhoneGapBuild();

    // Function to run when the menu item is clicked
    function handlePGList() {
        var list = "";
        var i = 0;
        for (i = 0; i < phonegapbuild.list.length; i++) {
            list += phonegapbuild.list[i].title + ", ";
        }

        window.alert(list);
    }

    function toggleLoginDisplay(force) {
        if (typeof (force) === 'undefined') {
            force = "";
        }
        var $pgLogin = $("#pg-login");

        if (force.length > 0) {
            if (force === "open") {
                $pgLogin.show();
            } else if (force === "close") {
                $pgLogin.hide();
            }
        } else {
            if ($pgLogin.css("display") === "none") {
                $pgLogin.show();
            } else {
                $pgLogin.hide();
            }
        }
        EditorManager.resizeEditor();
    }

    function switchToLogout() {
        CommandManager.get(PG_LOGINLOGOUT).setName("Logout");
        toggleLoginDisplay("close");
    }

    function switchToLogin() {
        CommandManager.get(PG_LOGINLOGOUT).setName("Login");
    }

    function getPGList() {
        phonegapbuild.getList();
    }

    function handlePGLogin() {
        toggleLoginDisplay("open");
    }

    function handlePGLogout() {
        phonegapbuild.logout();
        switchToLogin();
    }

    function handleTogglePGLogin() {
        if (phonegapbuild.initialized === true) {
            handlePGLogout();
        } else {
            handlePGLogin();
        }
    }

    function doLogin() {
        event.preventDefault();
        var $username = $('#username').val();
        var $password = $('#password').val();
        phonegapbuild.login($username, $password);
    }

    function handlePGInitialize(e) {

        $('.content').append('  <div id="pg-login" class="bottom-panel">' +
                                    '  <div class="toolbar simple-toolbar-layout">' +
                                    '    <div class="title">PhoneGap Build</div><a href="#" class="close">&times;</a>' +
                                    '  </div>' +
                                    '    <form>' +
                                    '        <label for="username">Username:</label>' +
                                    '        <input id="username" type="email" name="username" placeholder="Username" /><br />' +
                                    '        <label for="password">Password:</label>' +
                                    '        <input id="password" type="password" name="password" placeholder="Password" /><br />' +
                                    '        <input id="loginsubmit" type="submit" class="btn" name="sumbit" value="Login!" /><br />' +
                                    '    </form>' +
                                '</div>');

        $('#pg-login input').css("float", "none");

        $('#pg-login .close').click(function () {
            toggleLoginDisplay();
        });
        $('#loginsubmit').click(function () {
            doLogin();
        });

        toggleLoginDisplay("close");

        console.log(e);
        if (e.detail.tokenDefined === true) {
            getPGList();
            console.log("Token was in localstorage");
            CommandManager.get(PG_LOGINLOGOUT).setName("Logout");
        } else {
            console.log("Token was NOT in localstorage");
        }
    }

    CommandManager.register("List Build Projects", PG_LIST, handlePGList);
    CommandManager.register("Login", PG_LOGINLOGOUT, handleTogglePGLogin);

    menu = Menus.addMenu("PhoneGap", "tpryan.phonegap.phonegap");
    menu.addMenuItem(PG_LOGINLOGOUT);
    menu.addMenuItem(PG_LIST);

    // Adding all of the listeners in one spot. 
    phonegapbuild.addListener("initialized",  handlePGInitialize);
    phonegapbuild.addListener("login",  getPGList);
    phonegapbuild.addListener("login",  switchToLogout);
    phonegapbuild.addListener("logout", switchToLogin);

    phonegapbuild.initialize();

});