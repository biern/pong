YUI.add("client", function (Y) {
  Y.namespace("Pong").Client = Y.Base.create(
    "Client", Y.Base, [],
    {
      initializer: function(){
	alert("Witam i o zdrowie pytam");
      }
    },
    {

    }
  );
    
  Y.log("module loaded", "debug", "client");
}, "0", { requires:[] });