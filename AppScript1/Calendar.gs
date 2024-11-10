function getUserFirstName(user) {
    var userFirstName = '';
    try {
        var userInfo = People.People.get('people/me', { personFields: 'names' });
        if (userInfo.names && userInfo.names.length > 0) {
            userFirstName = userInfo.names[0].givenName;
        }
    } catch (e) {
        console.error('Error fetching user first name: ' + e);
    }
    return userFirstName;
}

function onHomepage() {
    email = Session.getActiveUser().getEmail();
    var res = checkUser(email);
    if (res == 'success') {
        return createHomePageCard();
    } else {
        return signInPage(res);
    }
}

function createHomePageCard() {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('filledAgenda', "");
    userProperties.setProperty('generatedAgenda', "");
    var user = Session.getActiveUser();
    var userFirstName = getUserFirstName(user);

    var card = CardService.newCardBuilder()
        .addSection(CardService.newCardSection()
            .addWidget(CardService.newTextParagraph()
                .setText('<b>Hello ' + userFirstName + ', Welcome back!</b>')))
        .addSection(CardService.newCardSection()
            .addWidget(CardService.newImage()
                .setImageUrl('https://imgur.com/XyCCquV.png')))
        .addSection(getUpcomingMeeting(Session.getActiveUser()))
        .addSection(CardService.newCardSection()
            .addWidget(CardService.newImage()
                .setImageUrl('https://imgur.com/AuSiv5t.png'))
            .addWidget(CardService.newTextParagraph()
                .setText('<i>Coming soon...</i>')))

        .addSection(CardService.newCardSection()
            .addWidget(createImageButton('https://i.imgur.com/Q1eFZ01.png', 'navigateToSchedulePage'))
            .addWidget(createImageButton('https://imgur.com/TYjUzCM.png', 'availabilityAction')))
        .build();

    return card;
}

function getUpcomingMeeting(user) {
    var calendarId = user.getEmail();
    var now = new Date();
    var twentyFourHoursLater = new Date();
    twentyFourHoursLater.setDate(now.getDate() + 1);

    var events = CalendarApp.getCalendarById(calendarId)
        .getEvents(now, twentyFourHoursLater);

    var section = CardService.newCardSection()
        .addWidget(CardService.newImage()
            .setImageUrl('https://imgur.com/ZPkXG6G.png'))
        .setCollapsible(true)
        .setNumUncollapsibleWidgets(2);

    var userTimeZone = CalendarApp.getDefaultCalendar().getTimeZone();

    for (var i = 0; i < events.length; i++) {
        var upcomingMeeting = events[i];
        var meetingTitle = upcomingMeeting.getTitle();
        var meetingStartTime = upcomingMeeting.getStartTime();
        var meetingEndTime = upcomingMeeting.getEndTime();
        var formattedStartTime = Utilities.formatDate(meetingStartTime, userTimeZone, 'HH:mm');
        var formattedEndTime = Utilities.formatDate(meetingEndTime, userTimeZone, 'HH:mm');

        var meetingText = CardService.newDecoratedText()
            .setText("<i>" + meetingTitle + "</i>")
            .setBottomLabel(formattedStartTime + " - " + formattedEndTime);

        section.addWidget(meetingText);
    }

    if (events.length === 0) {
        section.addWidget(CardService.newDecoratedText()
            .setText('No upcoming meetings.'));
    }
    return section;
}

function createButton(text, actionFunctionName) {
    return CardService.newTextButton()
        .setText('<button class="custom-button">' + text + '</button>')
        .setOnClickAction(CardService.newAction()
            .setFunctionName(actionFunctionName));
}

function createImageButton(imageUrl, actionFunctionName) {
    return CardService.newImage()
        .setImageUrl(imageUrl)
        .setOnClickAction(CardService.newAction()
            .setFunctionName(actionFunctionName));
}

function createSecondaryButton(text, actionFunctionName) {
    return CardService.newTextButton()
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor("#E67C73")
        .setText('<button class="custom-button">' + text + '</button>')
        .setOnClickAction(CardService.newAction()
            .setFunctionName(actionFunctionName));
}

// Function to navigate to the schedule meeting page
function navigateToSchedulePage() {
    var card = createScheduleMeetingCard();
    return CardService.newNavigation()
        .pushCard(card);
}

// Function to navigate to the availability page
function availabilityAction() {
    var avlcard = showAvailabilityPage(true);
    return CardService.newNavigation()
        .pushCard(avlcard);
}

function settingsAction() {
    var prefcard = showAvailabilityPage(true);
    return CardService.newNavigation()
        .pushCard(prefcard);
}
