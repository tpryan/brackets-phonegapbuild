
var PhoneGapBuild = function() {

	var URL_BASE = "https://build.phonegap.com";
	var URL_TOKEN = URL_BASE + "/token";
	var URL_LIST = URL_BASE + "/api/v1/apps";

	
  this._listeners = {};

	this.token = "";
	this.list ="List of PhoneGap Build projects."
  this.initialized = false;
	this.getToken = getToken; 
	this.getList = getList;
  this.addListener = addListener;
  this.initialize = initialize;
  this.logout = logout;    

  var self = this;

  function initialize(){
    var token = localStorage.getItem("token");
    var tokenDefined = false;

    if (token != ""){
      tokenDefined = true;
      setToken(token);
      self.initialized = true;
    }

    var myEvent = new CustomEvent("initialized", {
      detail: {
        tokenDefined: tokenDefined
      }
    });
    fire(myEvent);

  }

	function setToken(token){
		self.token = token;
    localStorage.setItem('token', token);
    console.log("Token set to: " + token);
		console.log(this);
	}

	function setList(list){
		self.list = list;
	}

	function getToken(username,password){
		console.log(this);
		$.ajax({
          url: URL_TOKEN,
          type:"post",
          error: errorHandler,
          context: PhoneGapBuild,
          success: handleTokenSuccess,
          username: username,
          password: password,   
          cache:false,
          crossDomain:true
        });
	}

	function handleTokenSuccess(response, status, jqXHR){
    console.log("Token Retreived");
    console.log(response);
    setToken(response.token);

    var myEvent = new CustomEvent("tokenloaded", {
      detail: {
        token: response.token
      }
    });
    fire(myEvent);
  }

  function logout(){
    console.log("Logout");
    setToken("");
    self.tokenDefined = false;
    self.initialized = false;
    this.initialized = false;
    self.list = [];

    var myEvent = new CustomEvent("logout", {});
    fire(myEvent);
  }


  function errorHandler(error){
    console.log("Login Error");
    console.log(error.responseText);
  }

  function getList(){
  	$.ajax({
        url: URL_LIST + "?auth_token=" + this.token,
        success: handleListSuccess,
        dataType: 'jsonp', 
        type:"get",
        error: errorHandler,
        cache:false,
        crossDomain:true
      });
  }

  function handleListSuccess(response, status, jqXHR){
    console.log("List Retreived");
    console.log(response.apps);
    setList(response.apps);

    var myEvent = new CustomEvent("listloaded", {
      detail: {
        list: response.apps
      }
    });
    fire(myEvent);
  }


  function addListener(type, listener){
        if (typeof this._listeners[type] == "undefined"){
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    }

    function fire(event){
        if (typeof event == "string"){
            event = { type: event };
        }
        if (!event.target){
            event.target = self;
        }

        if (!event.type){  //falsy
            throw new Error("Event object missing 'type' property.");
        }

        if (self._listeners[event.type] instanceof Array){
            var listeners = self._listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                listeners[i].call(self, event);
            }
        }
    }

    function removeListener(type, listener){
        if (this._listeners[type] instanceof Array){
            var listeners = this._listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    }

    




}	