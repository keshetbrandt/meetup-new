function createDilemmaCard(meetingID, optionsData) {
    /*
    Assuming this format
    {
            'request':{
                "title": string,
                "when": This week, Next week, This month, or Next month as a string,
                "start_time_frame": datetime object,
                "end_time_frame": datetime object,
                "duration": int,
                "preferred_starting_time": list of string from ['morning', 'noon', 'afternoon', 'evening'],
                "participants":list of emails (strings),
                },
            'available_slots': all available slots for the original request, formatted as a list of datatime objects,
            'duration reduced': {
                    'new duration': new duration in minutes,
                    'available_slots': all available slots with the new duration, formatted as datatime objects
                },
            'participants reduced': {
                    'without': all participants that were removed from the original request,formatted as a list of emails (strings)
                    'new participants': new participants, formatted as a list of emails (strings),
                    'available_slots': all available slots with the new participants, formatted as a list of datatime objects
                },
            'timeframe expanded': {
                    'new timeframe': new timeframe, as a string,
                    'available_slots': all available slots with the new timeframe, formatted as a list of datatime objects
                }
        }
    
    */
    
    var cardFooter = CardService.newFixedFooter()
        .setPrimaryButton(createHomepageButton());
  
    var card = CardService.newCardBuilder()
      .setName("Meeting Options")
      .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
      .setText("<b>I couldn't find a free spot for everyone, but here are some options that might work:</b>")))
      
      var durationReducedSlotsLength = optionsData['duration reduced'].available_slots.length
      if (durationReducedSlotsLength > 0){
        card.addSection(createDurationMeetingOptionsSection(optionsData['duration reduced'], meetingID))
      }

      var participantsreducedSlotsLength = optionsData['participants reduced'].available_slots.length
      if (participantsreducedSlotsLength > 0){
        card.addSection(createEssentialsMeetingOptionsSection(optionsData['participants reduced'], meetingID))
      }

      var timeframeexpandedSlotsLength = optionsData['timeframe expanded'].available_slots.length
      if (timeframeexpandedSlotsLength > 0){
        card.addSection(createTimeFrameMeetingOptionsSection(optionsData['timeframe expanded'], meetingID))
      }
      
      card.addSection(createCancelButtonSection())
      card.setFixedFooter(cardFooter)
  
    return card.build();
  }

  function createDurationMeetingOptionsSection(durationOptionsData, meetingID) {
    var calendar = CalendarApp.getDefaultCalendar();
    var userTimeZone = calendar.getTimeZone();
    
    var duration = durationOptionsData['new duration'];
    var section = CardService.newCardSection()
    .setHeader('<b>New meeting duration will be ' + duration + " min</b>")
    .setCollapsible(true)
    .setNumUncollapsibleWidgets(1)
  
    for (var i = 0; i < durationOptionsData.available_slots.length; i++) {
    // var duration = durationOptionsData[0].duration_cut;
      var dateDict = dateInUserTimeZone(durationOptionsData.available_slots[i],userTimeZone);
      var day =  dateDict.day;
      var date = dateDict.date;
      var hour = timeInUserTimeZone(durationOptionsData.available_slots[i],userTimeZone);
  
      var handleDurationClick = CardService.newAction()
          .setFunctionName('sendChosenOption')
          .setParameters({'option':'duration', 'id': meetingID});
  
      var durationScheduleButton = CardService.newTextButton()
          .setText('Schedule')
          .setDisabled(false)
          .setBackgroundColor("#3F704D")
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setOnClickAction(handleDurationClick);
  
      var durationOption = CardService.newDecoratedText()
          .setText(day + ", " + hour)
          .setTopLabel("<b>"+date+"</b>")
          .setButton(durationScheduleButton);
    
      section.addWidget(durationOption)
    }
  
    return section;
  }

  function createTimeFrameMeetingOptionsSection(timeFrameOptionsData,meetingID) {
    var calendar = CalendarApp.getDefaultCalendar();
    var userTimeZone = calendar.getTimeZone();
    
    var extension = timeFrameOptionsData['new timeframe'];
    var section = CardService.newCardSection()
    .setHeader('<b>Extend the time frame in a ' + extension + "</b>")
    .setCollapsible(true)
    .setNumUncollapsibleWidgets(1)
  
    for (var i = 0; i < timeFrameOptionsData.available_slots.length; i++) {
      // var extension = timeFrameOptionsData[i].time_extend
      var dateDict = dateInUserTimeZone(timeFrameOptionsData.available_slots[i],userTimeZone);
      var day =  dateDict.day;
      var date = dateDict.date;
      var hour = timeInUserTimeZone(timeFrameOptionsData.available_slots[i],userTimeZone);
  
      var handleTimeFrameClick = CardService.newAction()
          .setFunctionName('sendChosenOption')
          .setParameters({'option': 'timeframe1','id':meetingID});
  
      var timeFrameScheduleButton = CardService.newTextButton()
          .setText('Schedule')
          .setDisabled(false)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor("#3F704D")
          .setOnClickAction(handleTimeFrameClick);
  
      var timeFrameOption = CardService.newDecoratedText()
          .setText(day + ", " + hour)
          .setTopLabel("<b>"+date+"</b>")
          .setButton(timeFrameScheduleButton);
    
      section.addWidget(timeFrameOption)
    }
    return section;
  }

  function createEssentialsMeetingOptionsSection(essentialsOptionsData, meetingID) {
    var calendar = CalendarApp.getDefaultCalendar();
    var userTimeZone = calendar.getTimeZone();
    
    var section = CardService.newCardSection()
      .setHeader("<b>Exclude some of the participants</b>")
      .setCollapsible(true)
      .setNumUncollapsibleWidgets(1);
      
    var unavailableFirstNames = [];

    for (var j = 0; j < essentialsOptionsData['without'].length; j++) {
        var unavailableEmail = essentialsOptionsData['without'][j];
        var firstName = unavailableEmail.split('@')[0];
        unavailableFirstNames.push(firstName);
    }

    for (var i = 0; i < essentialsOptionsData.available_slots.length; i++) {
      var dateDict = dateInUserTimeZone(essentialsOptionsData.available_slots[i],userTimeZone);
      var day =  dateDict.day;
      var date = dateDict.date;
      var hour = timeInUserTimeZone(essentialsOptionsData.available_slots[i],userTimeZone);
  
      var handleEssentialsClick = CardService.newAction()
        .setFunctionName('sendChosenOption')
        .setParameters({ 'option': 'essentials' + (i + 1), 'id': meetingID });
  
      var essentialsScheduleButton = CardService.newTextButton()
        .setText('Schedule')
        .setDisabled(false)
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor('#3F704D')
        .setOnClickAction(handleEssentialsClick);
  
      var essentialsOption = CardService.newDecoratedText()
        .setText(day + ', ' + hour)
        .setTopLabel('<b>' + date + '</b>')
        .setBottomLabel('Without: ' + unavailableFirstNames.join(', '))
        .setWrapText(true)
        .setButton(essentialsScheduleButton);
  
      section.addWidget(essentialsOption);
    }
    return section;
  }


  function createCancelButtonSection() {
    var action = CardService.newAction()
     .setFunctionName("onHomepage");
   
   var cancelButton = CardService.newTextButton()
     .setText("Cancel Meeting Schedule")
     .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
     .setBackgroundColor('#FF6666')
     .setOnClickAction(action);
 
   var section = CardService.newCardSection()
     .addWidget(cancelButton);
 
   return section;
 }

 function sendChosenOption(e){
    var option = e.parameters.option; // Get the option parameter passed from the clicked button
    var meetingId = e.parameters.id
  
    meetingDetails = postDilemmaSolution(option, meetingId);
  
    if (meetingDetails.message === "scheduled"){
      return CardService.newNavigation()
        .pushCard(createConfirmationCard(meetingDetails.data,true)); // WE NEED TO ADD NON LIVA USERS INFO HERE
    }
    else{
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification()
        .setText("An error has occured"))
        .build();
    }
  }
