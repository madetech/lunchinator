describe("When a user presses an interactive button", function() {

  describe("to signal they are available", function() {

    it("saves the user response", function() {
      GivenAUserWithResponses([])
      WhenSentAButtonResponseOf("TheRestaurant");

      ThenALuncherIsAvailableFor([":pizza:"]);
    })
    
    xit("saves many restaurants", function() {
      GivenAUserWithResponses([])
      WhenSentAButtonResponseOf("TheRestaurant");
      WhenSentAButtonResponseOf("TheOtherFancyerRestaurant");

      ThenALuncherIsAvailableFor([":pizza:", ':TheOtherFancyerRestaurant:']);
    })
    
    xit("responding many times to the same restaurant has no effect", function() {
      GivenAUserWithResponses([])
      WhenSentAButtonResponseOf("TheRestaurant");
      WhenSentAButtonResponseOf("TheRestaurant");
      WhenSentAButtonResponseOf("TheRestaurant");

      ThenALuncherIsAvailableFor([":pizza:"]);
    })

    xit("does not overide exsiting responses", function() {
      GivenAUserWithResponses([":pizza:", ':+1:'])
      WhenSentAButtonResponseOf("TheRestaurant");

      ThenALuncherIsAvailableFor([":pizza:", ':+1:']);
    })

  })
  
  function GivenAUserWithResponses(restaurant_array) {
    //to create user with current emojis 
  }
  function WhenSentAButtonResponseOf(restaurant) {
     // todo generate resonse with factory
     // todo call process message responcs use case
  }
  function ThenALuncherIsAvailableFor(restaurant_array) { 
    // todo check user availabilibty
  }
})