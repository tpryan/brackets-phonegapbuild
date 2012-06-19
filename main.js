/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

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
    CommandManager.register("List Build Projects", PG_LIST, handlePGList);

    var PG_LOGIN = "PhoneGap.login";
    CommandManager.register("Login", PG_LOGIN, handlePGLogin);

    var PG_LOGOUT = "PhoneGap.logout";
    CommandManager.register("Logout", PG_LOGOUT, handlePGLogout);


    var menu;
    menu = Menus.addMenu("PhoneGap", "tpryan.phonegap.phonegap");
    menu.addMenuItem(PG_LIST);
    console.log("Menu:");
    console.log(menu);




    // Local modules
    require('phonegapbuild');    
    var phonegapbuild = new PhoneGapBuild();
    phonegapbuild.addListener("initialized",  handlePGInitialize);
    phonegapbuild.initialize();
    
    


    // Function to run when the menu item is clicked
    function handlePGList() {
        var list = "";
        for (var i = 0; i < phonegapbuild.list.length; i++){
            list += phonegapbuild.list[i].title + ", ";
        }

        window.alert(list);
    }

    function getPGList(){
        phonegapbuild.getList()
    }

    function handlePGLogin(){
        console.log("show Login Form");
        toggleLoginDisplay();
    }

    function handlePGLogout(){
        phonegapbuild.logout();
        menu.addMenuItem(PG_LOGIN);
        //menu.removeMenuItem(PG_LOGOUT);
    }

    function toggleLoginDisplay(){
      var $pgLogin = $("#pg-login");
        
      if ($pgLogin.css("display") === "none") {
          $pgLogin.show();
      } else {
          $pgLogin.hide();
      }
      EditorManager.resizeEditor();
    }

    function doLogin(){
        event.preventDefault();
        var $username = $('#username').val(); 
        var $password = $('#password').val();
        phonegapbuild.getToken($username, $password); 
    }

    function handlePGInitialize(e){

        $('.content').append('  <div id="pg-login" class="bottom-panel">' + 
                                    '  <div class="toolbar simple-toolbar-layout">' + 
                                    '    <div class="title">PhoneGap Build</div><a href="#" class="close">&times;</a>' +
                                    '  </div>' +
                                    '    <form>' +
                                    '        <label for="username">Username:</label> <input id="username" type="email" name="username" /><br />' +
                                    '        <label for="password">Password:</label> <input id="password" type="password" name="password" /><br />' +
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

        
        EditorManager.resizeEditor();
        console.log(e);
        if (e.detail.tokenDefined == true){
            getPGList();
            console.log("Token was in localstorage");
            menu.addMenuItem(PG_LOGOUT);
        }
        else{
            console.log("Token was NOT in localstorage");
            menu.addMenuItem(PG_LOGIN);
            phonegapbuild.addListener("tokenloaded",  getPGList);

        }
    }

    
});