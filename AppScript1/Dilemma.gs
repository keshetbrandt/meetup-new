function createDilemmaCard(optionsData) {
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

    var card = CardService.newCardBuilder()
      .setName("Meeting Options")
      .addSection(CardService.newCardSection()
        .addWidget(CardService.newTextParagraph()
          .setText("<b>I couldn't find a free spot for everyone, but here are some options that might work:</b>")));
      
    if (Object.keys(optionsData['duration reduced']).length !== 0) {
      card.addSection(createDurationMeetingOptionsSection(optionsData, optionsData['duration reduced'], 'duration reduced'));
    }

    if (Object.keys(optionsData['participants reduced']).length !== 0) {
      card.addSection(createEssentialsMeetingOptionsSection(optionsData, optionsData['participants reduced'], 'participants reduced'));
    }

    if (Object.keys(optionsData['timeframe expanded']).length !== 0) {
      card.addSection(createTimeFrameMeetingOptionsSection(optionsData, optionsData['timeframe expanded'], 'timeframe expanded'));
    }

    card.addSection(createCancelButtonSection());
    
    // Add the new image button at the bottom of the page
    var backToHomeImage = CardService.newImage()
        .setImageUrl("https://imgur.com/5zpzzQZ.png")
        .setOnClickAction(CardService.newAction().setFunctionName('createHomePageCard'));
    

    return card.build();
}

function createDurationMeetingOptionsSection(optionsData, durationOptionsData, myCase) {
    var calendar = CalendarApp.getDefaultCalendar();
    var userTimeZone = calendar.getTimeZone();

    var duration = durationOptionsData['new duration'];
    var section = CardService.newCardSection()
      .setHeader('<b>Shorten the meeting duration to ' + duration + " min</b>")
      .setCollapsible(true)
      .setNumUncollapsibleWidgets(1);

    var dateDict = dateInUserTimeZone(durationOptionsData['available_slots'][0][0], userTimeZone);
    var day = dateDict.day;
    var date = dateDict.date;
    var hour = durationOptionsData['available_slots'][0][1];

    var handleDurationClick = CardService.newAction()
      .setFunctionName('sendChosenOption')
      .setParameters({ 'result': JSON.stringify(optionsData), 'myCase': myCase });

    var durationScheduleButton = CardService.newTextButton()
      .setText('Schedule')
      .setDisabled(false)
      .setBackgroundColor("#3F704D")
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setOnClickAction(handleDurationClick);

    var durationOption = CardService.newDecoratedText()
      .setText(day + ", " + hour)
      .setTopLabel("<b>" + date + "</b>")
      .setButton(durationScheduleButton);

    section.addWidget(durationOption);

    return section;
}

function createTimeFrameMeetingOptionsSection(optionsData, timeFrameOptionsData, myCase) {
    var calendar = CalendarApp.getDefaultCalendar();
    var userTimeZone = calendar.getTimeZone();

    var extension = timeFrameOptionsData['new timeframe'];
    var section = CardService.newCardSection()
      .setHeader('<b>Extend the time frame to ' + extension + "</b>")
      .setCollapsible(true)
      .setNumUncollapsibleWidgets(1);

    var dateDict = dateInUserTimeZone(timeFrameOptionsData['available_slots'][0][0], userTimeZone);
    var day = dateDict.day;
    var date = dateDict.date;
    var hour = timeFrameOptionsData['available_slots'][0][1];

    var handleTimeFrameClick = CardService.newAction()
      .setFunctionName('sendChosenOption')
      .setParameters({ 'result': JSON.stringify(optionsData), 'myCase': myCase });

    var timeFrameScheduleButton = CardService.newTextButton()
      .setText('Schedule')
      .setDisabled(false)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setBackgroundColor("#3F704D")
      .setOnClickAction(handleTimeFrameClick);

    var timeFrameOption = CardService.newDecoratedText()
      .setText(day + ", " + hour)
      .setTopLabel("<b>" + date + "</b>")
      .setButton(timeFrameScheduleButton);

    section.addWidget(timeFrameOption);
    return section;
}

function createEssentialsMeetingOptionsSection(optionsData, essentialsOptionsData, myCase) {
    var calendar = CalendarApp.getDefaultCalendar();
    var userTimeZone = calendar.getTimeZone();

    var section = CardService.newCardSection()
      .setHeader("<b>Exclude some of the participants:</b>")
      .setCollapsible(true)
      .setNumUncollapsibleWidgets(1);

    var unavailableFirstNames = [];

    for (var j = 0; j < essentialsOptionsData['without'].length; j++) {
        var unavailableEmail = essentialsOptionsData['without'][j];
        var firstName = unavailableEmail.split('@')[0];
        unavailableFirstNames.push(firstName);
    }

    var dateDict = dateInUserTimeZone(essentialsOptionsData['available_slots'][0][0], userTimeZone);
    var day = dateDict.day;
    var date = dateDict.date;
    var hour = essentialsOptionsData['available_slots'][0][1];

    var handleEssentialsClick = CardService.newAction()
      .setFunctionName('sendChosenOption')
      .setParameters({ 'result': JSON.stringify(optionsData), 'myCase': myCase });

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
    return section;
}

function createCancelButtonSection() {
    var cancelButtonImage = CardService.newImage()
        .setImageUrl("https://imgur.com/GkV7h0p.png")
        .setOnClickAction(CardService.newAction().setFunctionName("onHomepage"));

    var section = CardService.newCardSection()
        .addWidget(cancelButtonImage);

    return section;
}

function sendChosenOption(e) {
    var myCase = e.parameters.myCase;
    var result = e.parameters.result;

    meetingDetails = postDilemmaSolution(result, myCase);

    if (meetingDetails.message === "success") {
        return CardService.newNavigation()
            .pushCard(createConfirmationCard(meetingDetails, true));
    } else {
        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText("An error has occurred"))
            .build();
    }
}
