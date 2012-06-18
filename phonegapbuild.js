
var PhoneGapBuild = function() {

	var URL_BASE = "https://build.phonegap.com";
	var URL_TOKEN = URL_BASE + "/token";
	var URL_LIST = URL_BASE + "/api/v1/apps";

	var self = this;

	this.token = "";
	this.list ="List of PhoneGap Build projects."
	this.getToken = getToken; 
	this.getList = getList; 


	function setToken(token){
		self.token = token;
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
      	getList();
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
    }





}	