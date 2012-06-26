/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, event, PhoneGapBuild */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus          = brackets.getModule("command/Menus"),
        Commands                = brackets.getModule("command/Commands"),
        EditorManager           = brackets.getModule("editor/EditorManager"),
        ProjectManager           = brackets.getModule("project/ProjectManager"),
        NativeFileSystem           = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        FileUtils           = brackets.getModule("file/FileUtils"),
        DocumentManager         = brackets.getModule("document/DocumentManager");

    // First, register a command - a UI-less object associating an id to a handler
    var local_require = require;
    var id = ""; //hardcode this value for now.

    // Local modules
    require('phonegapbuild');
    var phonegapbuild = new PhoneGapBuild();

    function togglePGMenu(force) {
        if (typeof (force) === 'undefined') {
            force = "";
        }

        console.log("TogglePGMenu called");
        var $pgMenu = $('#pg-menu');


        if (force.length > 0) {
            if (force === "open") {
                $pgMenu.css("display", "block");
            } else if (force === "close") {
                $pgMenu.css("display", "none");
            }
        } else {
            if ($pgMenu.css("display") === "block") {
                $pgMenu.css("display", "none");
            } else {
                $pgMenu.css("display", "block");
            }
        }
    }

    function toggleLoginDisplay(force) {
        if (typeof (force) === 'undefined') {
            force = "";
        }

        var $pgInterface = $("#pg-interface");

        if (force.length > 0) {
            if (force === "open") {
                $pgInterface.show();
                console.log("Open!");
            } else if (force === "close") {
                $pgInterface.hide();
                console.log("Close!");
            }
        } else {
            if ($pgInterface.css("display") === "none") {
                $pgInterface.show();
            } else {
                $pgInterface.hide();
            }
        }
        EditorManager.resizeEditor();
    }

    function handlePGMenuLogin(e) {
        e.preventDefault();
        toggleLoginDisplay("open");
        togglePGMenu("close");
    }


    function getPGList() {
        phonegapbuild.getList();
    }




    function errorHandler(error) {
        console.log("Login Error");
        console.log(error.responseText);
    }

    function handleRebuild() {
        //phonegapbuild.rebuild(109540);


    }

    function setMenuToActive() {
        var iconURL = local_require.nameToUrl('assets/pg_icon_idle.png').split('[')[0];
        $("#pg-menu-toggle img").css("background-color", "#d7facb");
        $("#pg-menu-toggle img").attr("src", iconURL);
    }

    function setMenuToError() {
        var iconURL = local_require.nameToUrl('assets/pg_icon_idle.png').split('[')[0];
        $("#pg-menu-toggle img").css("background-color", "#ff0000");
        $("#pg-menu-toggle img").attr("src", iconURL);
    }

    function setMenuToBuilding() {
        var iconURL = local_require.nameToUrl('assets/pg_icon_building.png').split('[')[0];
        $("#pg-menu-toggle img").css("background-color", "#fad791");
        $("#pg-menu-toggle img").attr("src", iconURL);
    }

    function setMenuToLogout() {
        var iconURL = local_require.nameToUrl('assets/pg_icon_disabled.png').split('[')[0];
        $("#pg-menu-toggle img").css("background-color", "transparent");
        $("#pg-menu-toggle img").attr("src", iconURL);
    }

    function createLoginMenuItem() {
        $("#pg-menu").prepend('<li id="login-holder"><a id="pg-login" href="">Login</li>');
        $('#pg-login').click(handlePGMenuLogin);
    }


    function handlePGMenuList(e) {
        e.preventDefault();
        togglePGMenu("close");
        var list = "";
        var i = 0;
        for (i = 0; i < phonegapbuild.list.length; i++) {
            list += phonegapbuild.list[i].title + ", ";
        }

        window.alert(list);
    }

    function handlePGMenuLogout(e) {
        e.preventDefault();
        phonegapbuild.logout();
        $("#pg-menu").empty();
        createLoginMenuItem();
        togglePGMenu("close");
        setMenuToLogout();
    }

    function createLogoutMenuItem() {
        $("#pg-menu").append('<li id="logout-holder"><a id="pg-logout" href="">Logout</li>');
        $("#pg-logout").click(handlePGMenuLogout);
    }

    function createListMenuItem() {
        $("#pg-menu").prepend('<li id="list-holder"><a id="pg-list" href="">List</li>');
        $("#pg-list").click(handlePGMenuList);
    }


    function handlePGLoginSuccess() {
        toggleLoginDisplay("close");
        $("#login-holder").remove();
        createLogoutMenuItem();
        phonegapbuild.addListener("listloaded", createListMenuItem);
        setMenuToActive();
        getPGList();

    }


    function doLogin() {
        event.preventDefault();
        var $username = $('#username').val();
        var $password = $('#password').val();
        phonegapbuild.addListener("login", handlePGLoginSuccess);
        phonegapbuild.login($username, $password);
    }

    function handlePGMenu(e) {
        e.preventDefault();
        togglePGMenu();
    }

    function createPGInterface() {
        $('.content').append('  <div id="pg-interface" class="bottom-panel">' +
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
        $('#pg-interface input').css("float", "none");

        $('#pg-interface .close').click(function () {
            toggleLoginDisplay();
        });
        $('#loginsubmit').click(function () {
            doLogin();
        });

        toggleLoginDisplay("close");

        var iconURL = local_require.nameToUrl('assets/pg_icon_disabled.png').split('[')[0];
        var pgUICode =      '<span class="pg-menu-holder dropdown">' +
                                '<a href="" class="" id="pg-menu-toggle">' +
                                    '<img src="' + iconURL + '" width="32" height="32" />' +
                                '</a>' +
                                '<ul id="pg-menu" class="dropdown-menu">' +
                                '</ul>' +
                            '</span>';
        $('.buttons').append(pgUICode);
        $('#pg-menu-toggle').click(handlePGMenu);

        var $pgMenu = $('#pg-menu');
        $pgMenu.css("top", "10px");
        $pgMenu.css("right", "10px");
        $pgMenu.css("border-top", "1px solid #CCC");
        createLoginMenuItem();
    }

    function handlePGInitialize(e) {

        if (e.detail.tokenDefined === true) {
            handlePGLoginSuccess();
            console.log("Token was in localstorage");
        } else {
            console.log("Token was NOT in localstorage");
        }
    }

    createPGInterface();
    phonegapbuild.addListener("initialized", handlePGInitialize);
    phonegapbuild.initialize();


    // close all dropdowns on ESC
    $(window.document).on("keydown", function (e) {
        if (e.keyCode === 27) {
            togglePGMenu("close");
        }
    });


});