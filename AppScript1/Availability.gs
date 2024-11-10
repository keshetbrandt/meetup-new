function showAvailabilityPage(dbGet) {
    var card = CardService.newCardBuilder()
      .setName("Preferences");

    // Add the image as the first section
    card.addSection(CardService.newCardSection()
      .addWidget(CardService.newImage()
        .setImageUrl("https://imgur.com/Slq1IoE.png")));

    // Define the options for the working hours dropdowns
    var workingHourOptions = [
      '06:00 AM','06:30 AM','07:00 AM','07:30 AM','08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM',
      '00:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM','05:30 PM','06:00 PM','06:30 PM','07:00 PM','07:30 PM','08:00 PM','08:30 PM','09:00 PM','09:30 PM','10:00 PM',
    ];
  
    var userProperties = PropertiesService.getUserProperties();
    if (dbGet){
      // Get preferences from DB
      var prefResponse = getUserPref(Session.getActiveUser().getEmail());
      // Save preferences in property service
      userProperties.setProperty('userPref', JSON.stringify(prefResponse));
    } else { 
      // Use preferences from property service
      var prefResponse = JSON.parse(userProperties.getProperty('userPref'));
    }
  
    // Loop through days and add widgets for each day, including two dropdowns side by side
    for (var i = 0; i < 7; i++) {
      var day = prefResponse[i].day;
  
      var dayLabel = CardService.newKeyValue()
        .setContent("<b>" + day + "</b>")
        .setMultiline(true);
  
      toggleText = prefResponse[i].available ? 'Working' : 'Not Working';
      toggleBool = prefResponse[i].available ? true : false;
      var toggleSwitchAction = CardService.newAction()
        .setFunctionName('handleToggleWorkDay')
        .setParameters({ index: String(i) });
  
      var workCheckBox = CardService.newSwitch()
        .setControlType(CardService.SwitchControlType.SWITCH)
        .setFieldName('Working day')
        .setOnChangeAction(toggleSwitchAction)
        .setSelected(toggleBool);
  
      var switchWidget = CardService.newDecoratedText()
        .setText(toggleText)
        .setSwitchControl(workCheckBox);
  
      var section = CardService.newCardSection()
          .addWidget(dayLabel)
          .addWidget(switchWidget);
  
      if (prefResponse[i].available){  // Create dropdowns
  
        // Create the first dropdown for working hours
        var dropdown1 = CardService.newSelectionInput()
          .setType(CardService.SelectionInputType.DROPDOWN)
          .setTitle("Starting Hour")
          .setFieldName(day + '_1');
  
        // Add the predefined options to the first dropdown
        for (var j = 1; j < workingHourOptions.length; j++) {
          var option = workingHourOptions[j];
          dropdown1.addItem(option, option, option === prefResponse[i].start);
          Logger.log(prefResponse[i].start);
        }
  
        // Create the second dropdown for working hours
        var dropdown2 = CardService.newSelectionInput()
          .setType(CardService.SelectionInputType.DROPDOWN)
          .setTitle("Ending Hour")
          .setFieldName(day + '_2');
  
        // Add the predefined options to the second dropdown
        for (var k = 1; k < workingHourOptions.length; k++) {
          var option = workingHourOptions[k];
          dropdown2.addItem(option, option, option === prefResponse[i].end);
        }
  
        section.addWidget(dropdown1)
              .addWidget(dropdown2);
      }
  
      card.addSection(section);
    }
  
    var saveChangesButton = CardService.newImage()
    .setImageUrl("https://imgur.com/1ZHNTR4.png")
    .setOnClickAction(CardService.newAction().setFunctionName('handleSavePreferences'));

    // Add the save changes button at the end of the page
    card.addSection(CardService.newCardSection()
      .addWidget(saveChangesButton));
  
    return card.build();
}

function handleToggleWorkDay(e) {
    index = e.parameters.index;
  
    var userProperties = PropertiesService.getUserProperties();
    var userPref = JSON.parse(userProperties.getProperty('userPref'));
    
    userPref[index].available = !userPref[index].available;
    userProperties.setProperty('userPref', JSON.stringify(userPref));
    validateAndSaveProperty(userPref, e.formInput);
    return showAvailabilityPage(false);
}

function validateAndSaveProperty(userPref, formInput) {
    for (var i = 0; i < userPref.length; i++) {
      var day = userPref[i].day;
      var formInputStart = formInput[day + '_1'];
      var formInputEnd = formInput[day + '_2'];

      // Create Date objects for the time strings
      var startTime = new Date('1970/01/01 ' + formInputStart);
      var endTime = new Date('1970/01/01 ' + formInputEnd);

      if ((startTime >= endTime)){
        return CardService.newActionResponseBuilder()
          .setNotification(CardService.newNotification()
          .setText('Start hour on ' + day + ' must be earlier than end hour.'))
            .build(); 
      }
      
      if (formInput.hasOwnProperty(day + '_1')) {
        var formInputStart = formInput[day + '_1'];
        var userPrefStart = userPref[i].start;
        if (formInputStart !== userPrefStart) {
          userPref[i].start = formInputStart;
        }
        if (userPref[i].available && userPref[i].start === 'Not working') {
          return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
            .setText('Start hour on ' + userPref[i].day + " must be a valid hour"))
              .build(); 
        }
      }
      if (formInput.hasOwnProperty(day + '_2')) {
        var formInputEnd = formInput[day + '_2'];
        var userPrefEnd = userPref[i].end; 
        if (formInputEnd !== userPrefEnd) {
          userPref[i].end = formInputEnd;         
        }
        if (userPref[i].available && userPref[i].end === 'Not working') {
          return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
            .setText('End hour on ' + userPref[i].day + " must be a valid hour"))
              .build(); 
        }
      }
    }
  
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('userPref', JSON.stringify(userPref));
  
    return undefined;
}

function handleSavePreferences(e) {
    var formInput = e.formInput;
  
    var userProperties = PropertiesService.getUserProperties();
    var userPref = JSON.parse(userProperties.getProperty('userPref'));
  
    invalidNotification = validateAndSaveProperty(userPref, formInput);
  
    if (invalidNotification) {
      return invalidNotification;
    }
  
    var userPref = JSON.parse(userProperties.getProperty('userPref'));
  
    updateUserPreferences(userPref);
  
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText('Changes saved'))
        .setNavigation(CardService.newNavigation()
        .updateCard(createHomePageCard())) 
        .build();
}



