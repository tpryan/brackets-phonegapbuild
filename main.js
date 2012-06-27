/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, undef: true, indent: 4, maxerr: 50 */
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

    var PG_PROJECT_ASSOCIATION = "pg.toggleProjectAssociation";   // package-style naming to avoid collisions


    // Local modules
    require('phonegapbuild');
    var phonegapbuild = new PhoneGapBuild();



    function getAssociatedID() {
        var projectPath = ProjectManager.getProjectRoot().fullPath;
        var id = phonegapbuild.getAssociation(projectPath);
        return id;
    }

    function togglePGMenu(force) {
        if (typeof (force) === 'undefined') {
            force = "";
        }


        console.log("TogglePGMenu called");
        var $pgMenu = $('#pg-menu');


        if (force.length > 0) {
            if (force === "open") {
                $pgMenu.css("display", "block");
                console.log("Verdict open");
            } else if (force === "close") {
                $pgMenu.css("display", "none");
                console.log("Verdict close");
            }
        } else {
            if ($pgMenu.css("display") === "block") {
                $pgMenu.css("display", "none");
                console.log("Verdict close");
            } else {
                $pgMenu.css("display", "block");
                console.log("Verdict open");
            }
        }
    }

    function togglePGPanelDisplay(force, height) {
        if (typeof (force) === 'undefined') {
            force = "";
        }

        if (typeof (height) === 'undefined') {
            height = "200px";
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
        $('#pg-interface').css("height", height);
        EditorManager.resizeEditor();
    }

    function handlePGMenuLogin(e) {
        e.preventDefault();
        createPGLoginForm();
        togglePGPanelDisplay("open");
        togglePGMenu("close");
    }


    function getPGList() {
        phonegapbuild.getList();
    }




    function errorHandler(error) {
        console.log("Login Error");
        console.log(error.responseText);
    }


    function setMenuToAssociated() {
        var iconURL = local_require.nameToUrl('assets/pg_icon_idle.png').split('[')[0];
        $("#pg-menu-toggle img").css("background-color", "#85BF71");
        $("#pg-menu-toggle img").attr("src", iconURL);
    }

    function setMenuToIdle() {
        var iconURL = local_require.nameToUrl('assets/pg_icon_idle.png').split('[')[0];
        $("#pg-menu-toggle img").css("background-color", "transparent");
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

    function handlePBRebuildRequested(e) {
        var id = getAssociatedID();
        setMenuToBuilding();
        phonegapbuild.addListener("statusresponse", handlePGStatusResponse);
        phonegapbuild.getProjectStatus(id);
    }

    function handlePGMenuLogout(e) {
        e.preventDefault();
        phonegapbuild.logout();
        $("#pg-menu").empty();
        createLoginMenuItem();
        togglePGMenu("close");
        setMenuToLogout();
    }

    function handlePGMenuRebuild(e) {
        var id = getAssociatedID();
        e.preventDefault();
        togglePGMenu("close");
        phonegapbuild.addListener("rebuildrequested", handlePBRebuildRequested);
        phonegapbuild.rebuild(id);
    }

    function handlePGStatusResponse(e) {
        var project = e.detail;
        var propertyname;

        var subtable = '<table class="condensed-table">';

        for (propertyname in project.status) {
            subtable += '<tr><th>' + propertyname + '</th><td>' + project.status[propertyname] + '</td></tr>';
        }
        subtable += '</table>';

        $("#pg-project-title").text(project.title);
        $("#pg-project-description").text(project.description);
        $("#pg-project-status").html(subtable);

        if (project.complete === true) {
            setMenuToAssociated();
            updateIncompleteCount(0);
        } else {
            setMenuToBuilding();
            updateIncompleteCount(project.incompleteCount);
        }

    }

    function handlePGMenuViewStatus(e) {
        e.preventDefault();
        var id = getAssociatedID();
        console.log("Handling status call");
        togglePGMenu("close");
        createPGStatusView();

        if ($("#pg-interface").css("display") === 'none') {
            console.log("opening panel");
            togglePGPanelDisplay("open", "360px");
        }

        phonegapbuild.addListener("statusresponse", handlePGStatusResponse);
        phonegapbuild.getProjectStatus(id);
    }

    function createViewStatusMenuItem() {
        $("#pg-menu").append('<li id="status-holder"><a id="pg-status" href="">View Status</li>');
        $("#pg-status").click(handlePGMenuViewStatus);
    }

    function removeViewStatusMenuItem() {
        $("#pg-status").remove();
    }

    function createRebuildMenuItem() {
        $("#pg-menu").append('<li id="rebuild-holder"><a id="pg-rebuild" href="">Rebuild</li>');
        $("#pg-rebuild").click(handlePGMenuRebuild);
    }

    function removeRebuildMenuItem() {
        $("#pg-rebuild").remove();
    }

    function createLogoutMenuItem() {
        $("#pg-menu").append('<li id="logout-holder"><a id="pg-logout" href="">Logout</li>');
        $("#pg-logout").click(handlePGMenuLogout);
    }

    function createListMenuItem() {
        $("#pg-menu").prepend('<li id="list-holder"><a id="pg-list" href="">List</li>');
        $("#pg-list").click(handlePGMenuList);
    }

    function createPGContextMenu() {
        var menu = Menus.getContextMenu("project-context-menu");
        menu.addMenuDivider();
        menu.addMenuItem(PG_PROJECT_ASSOCIATION);
        
        console.log(menu);

    }

    function checkAssociation() {

        var id = getAssociatedID();


        if ((typeof (id) === 'undefined') || (id === null)) {
            CommandManager.get(PG_PROJECT_ASSOCIATION).setName("Associate with PhoneGap Build");
            removeRebuildMenuItem();
            removeViewStatusMenuItem();
            setMenuToIdle();
            phonegapbuild.removeListener("statusresponse", handlePGStatusResponse);
            updateIncompleteCount(0);
            phonegapbuild.killTimers();
        } else {
            CommandManager.get(PG_PROJECT_ASSOCIATION).setName("Disassociate with PhoneGap Build");
            createRebuildMenuItem();
            createViewStatusMenuItem();
            phonegapbuild.addListener("statusresponse", handlePGStatusResponse);
            phonegapbuild.getProjectStatus(id);
            setMenuToAssociated();

        }

    }


     
    

    function doAssociate() {
        var $id = $('#projectid').val();
        var projectPath = ProjectManager.getProjectRoot().fullPath;

        phonegapbuild.setAssociation(projectPath, $id);
        //createRebuildMenuItem();
        togglePGPanelDisplay("close");
        checkAssociation();
    }

    function createPGAssociation() {

        var options = "";
        var form = "";
        var i = 0;

        var projectList = phonegapbuild.list;

        for (i = 0; i < projectList.length; i++) {
            options += '<option value=' + projectList[i].id + '>' + projectList[i].title + '</option>';
        }


        form = '<form>' +
            '   <label for="projectid">Project:</label>' +
            '   <select id="projectid">' +
            options +
            '   </select><br />' +
            '   <input id="submit-associate" type="submit" class="btn" name="sumbit" value="Associate" /><br />' +
            '</form>';
        $('#pg-interface-content').empty();
        $('#pg-interface-content').append(form);
        $('#submit-associate').click(function () {doAssociate(); });

    }

    function handlePGAssociate() {
        console.log("So association logic here");
        var projectPath = ProjectManager.getProjectRoot().fullPath;
        var id = phonegapbuild.getAssociation(projectPath);

        if ((typeof (id) === 'undefined') || (id === null)) {
            createPGAssociation();
            togglePGPanelDisplay("open");
        } else {
            phonegapbuild.removeAssociation(projectPath);
            checkAssociation();
        }
    }


    function handlePGLoginSuccess() {
        togglePGPanelDisplay("close");
        $("#login-holder").remove();
        createLogoutMenuItem();
        phonegapbuild.addListener("listloaded", createListMenuItem);
        setMenuToIdle();
        getPGList();
        createPGContextMenu();

    }


    function doLogin() {
        event.preventDefault();
        var $username = $('#username').val();
        var $password = $('#password').val();
        phonegapbuild.addListener("login", handlePGLoginSuccess);
        phonegapbuild.login($username, $password);
    }


    function createPGLoginForm() {
        var form = '<form>' +
                   '    <label for="username">Username:</label>' +
                   '    <input id="username" type="email" name="username" placeholder="Username" /><br />' +
                   '    <label for="password">Password:</label>' +
                   '    <input id="password" type="password" name="password" placeholder="Password" /><br />' +
                   '    <input id="submit-login" type="submit" class="btn" name="sumbit" value="Login!" /><br />' +
                   '</form>';
        $('#pg-interface-content').empty();
        $('#pg-interface-content').append(form);
        $('#submit-login').click(function () {doLogin(); });

    }

    function createPGStatusView() {
        var table = '<table class="table table-bordered">' +
            '<tr><th>Title</th><td id="pg-project-title">Loading <i class="icon-cog status-indicator"></i></td></tr>' +
            '<tr><th>Description</th><td id="pg-project-description">Loading <i class="icon-cog status-indicator"></i></td></tr>' +
            '<tr><th>Project Status</th><td id="pg-project-status">Loading <i class="icon-cog status-indicator"></i></td></tr>' +
            '</table>';
        $('#pg-interface-content').empty();
        $('#pg-interface-content').append(table);

    }



    function handlePGMenu(e) {
        e.preventDefault();
        togglePGMenu();
    }

    function updateIncompleteCount(count){
        var $orig = $('#incomplete-count').text();
        var stringCount = count.toString();

        console.log($orig + " vs " + count);

        if ($orig !== stringCount){
            console.log("Resetting stuff");
            if (count > 0){
                $('#incomplete-count').show();
            }
            else{
                $('#incomplete-count').hide();
            }

            $('#incomplete-count').text(stringCount);
        }
    }



    function createPGInterface() {
        $('.content').append('  <div id="pg-interface" class="bottom-panel">' +
                                    '<div class="toolbar simple-toolbar-layout">' +
                                    '   <div class="title">PhoneGap Build</div>' +
                                    '       <a href="#" class="close">&times;</a>' +
                                    '   </div>' +
                                    '   <div id="pg-interface-content">' +
                                    '   </div>' +
                                '</div>');

        $('#pg-interface input').css("float", "none");

        $('#pg-interface .close').click(function () {
            togglePGPanelDisplay();
        });

        togglePGPanelDisplay("close");

        var iconURL = local_require.nameToUrl('assets/pg_icon_disabled.png').split('[')[0];
        var pgUICode =      '<span class="pg-menu-holder dropdown">' +
                                '<a href="" class="" id="pg-menu-toggle">' +
                                    '<img src="' + iconURL + '" width="24" height="24" />' +
                                    '<span id="incomplete-count"></span>' +
                                '</a>' +
                                '<ul id="pg-menu" class="dropdown-menu">' +
                                '</ul>' +
                            '</span>';
        $('.buttons').append(pgUICode);
        $('#pg-menu-toggle').click(handlePGMenu);

        $('#pg-menu-toggle img').css("margin-bottom", "-8px");
        $('#pg-menu-toggle img').css("border-radius", "8px");

        // There is a probably a better way of doing this then having a bazillion jQuery calls.
        $('#incomplete-count').click(handlePGMenu);
        $('#incomplete-count').css("border-radius", "8px");
        $('#incomplete-count').css("height", "16px");
        $('#incomplete-count').css("width", "16px");
        $('#incomplete-count').css("font-size", "16px");
        $('#incomplete-count').css("color", "#FFF");
        $('#incomplete-count').css("background-color", "#F00");
        $('#incomplete-count').css("text-align", "center");
        $('#incomplete-count').css("position", "relative");
        $('#incomplete-count').css("float", "right");
        $('#incomplete-count').css("margin-top", "-5px");
        $('#incomplete-count').css("margin-left", "-5px");
        $('#incomplete-count').hide();

        var $pgMenu = $('#pg-menu');
        $pgMenu.css("top", "10px");
        $pgMenu.css("right", "10px");
        $pgMenu.css("border-top", "1px solid #CCC");
        createLoginMenuItem();

    }

    function handlePGInitialize(e) {

        if (e.detail.tokenDefined === true) {
            handlePGLoginSuccess();
            checkAssociation();
            console.log("Token was in localstorage");
        } else {
            console.log("Token was NOT in localstorage");

        }
    }

    CommandManager.register("Associate with PhoneGap Build", PG_PROJECT_ASSOCIATION, handlePGAssociate);

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