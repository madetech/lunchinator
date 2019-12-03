describe("When a user presses an interactive button", function() {

  describe("to signal they are available", function() {

    it("saves the user responce", function() {
      GivenAUserWithResponses([])
      WhenSentAButtonResponceOf("TheRestaunt");

      ThenALuncherIsAvaliableFor([":pizza:"]);
    })
    
    xit("saves manny restaunts", function() {
      GivenAUserWithResponses([])
      WhenSentAButtonResponceOf("TheRestaunt");
      WhenSentAButtonResponceOf("TheOtherFancyerRestaunt");

      ThenALuncherIsAvaliableFor([":pizza:", ':TheOtherFancyerRestaunt:']);
    })
    
    xit("responing manny times to the same restaunt has no effect", function() {
      GivenAUserWithResponses([])
      WhenSentAButtonResponceOf("TheRestaunt");
      WhenSentAButtonResponceOf("TheRestaunt");
      WhenSentAButtonResponceOf("TheRestaunt");

      ThenALuncherIsAvaliableFor([":pizza:"]);
    })

    xit("does not overide exsiting responces", function() {
      GivenAUserWithResponses([":pizza:", ':+1:'])
      WhenSentAButtonResponceOf("TheRestaunt");

      ThenALuncherIsAvaliableFor([":pizza:", ':+1:']);
    })

  })
  
  function GivenAUserWithResponses(restaunt_array) {
    //to create user with current emojis 
  }
  function WhenSentAButtonResponceOf(restaunt) {
     // tdo generate resonce with factory
     // todo call prodess message responce usecase
  }
  function ThenALuncherIsAvaliableFor(restaunt_array) { 
    // todo check user avalilabty
  }
})