function setActiveAccount(activeBool) {
    var userProperties = PropertiesService.getUserProperties();
    // Store the property as a boolean string
    userProperties.setProperty('activeAccount', activeBool);
  }


function signInPage(urlLink) {
    // Create a TextParagraph for the welcome message
    var welcomeMessage = CardService.newTextParagraph()
      .setText("<b>First time?</b>\n Click here to sign up for MeetUp")
  
    // Create a button for Sign Up
    var signUpButton = CardService.newTextButton()
      .setText('Sign Up')
      // .setOnClickAction(CardService.newAction()
      // .setFunctionName('SignUpPost'))
      .setOpenLink(CardService.newOpenLink()
        .setUrl(urlLink)); // Replace with your sign-up URL
  
    /*
    // Create a button for Sign In
    var signInButton = CardService.newTextButton()
      .setText('Sign In')
      .setOnClickAction(CardService.newAction()
        .setFunctionName('validateAndSignIn'));
    */
  
    // Create a CardSection to hold the form components
    var signInForm = CardService.newCardSection()
      .addWidget(welcomeMessage)
      .addWidget(signUpButton);
  
    // Create the main Card
    var card = CardService.newCardBuilder()
      .addSection(signInForm)
      .build();
  
    return card;
  }


  function validateAndSignIn(e){  
    email = Session.getActiveUser().getEmail();
    if (checkUser(email) == 'success'){
        setActiveAccount(true);
        return showAvailabilityPage(false);
    } else {
            return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
            .setText("There was an error")).build();
        }
  }
