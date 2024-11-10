function createConfirmationCard(meetUpData, caseDilemma = false) {
    var calendar;
    try {
        // Attempt to get the default calendar
        calendar = CalendarApp.getDefaultCalendar();
    } catch (e) {
        // Try getting the calendar by user's email as a fallback
        var userEmail = Session.getActiveUser().getEmail();
        calendar = CalendarApp.getCalendarById(userEmail);
    }

    if (!calendar) {
        throw new Error('Unable to access calendar.');
    }

    var userTimeZone = "Asia/Jerusalem";

    if (!caseDilemma) { 
        var availableSlots = meetUpData.available_slots;
        var dateDict = dateInUserTimeZone(availableSlots[0][0], userTimeZone);
        var title = meetUpData.request.title;
        var date = dateDict.date;
        var day = dateDict.day;
        var start_hour = availableSlots[0][1];
        var end_hour = availableSlots[0][2];
    } else {
        var date = meetUpData.date;
        var day = meetUpData.day;
        var start_hour = meetUpData.start_hour;
        var end_hour = meetUpData.end_hour;
        var title = meetUpData.title;
    }

    var updatedFinalDilemmaSection = CardService.newCardSection()
        .addWidget(CardService.newTextParagraph()
            .setText('<b>The changes have been made</b>'))
        .addWidget(CardService.newKeyValue()
            .setContent('Here are the final details!'));

    var confirmationImage = CardService.newImage()
        .setImageUrl("https://imgur.com/dDuVAdS.png");

    var confirmationSection = CardService.newCardSection()
        .addWidget(confirmationImage)
        .addWidget(CardService.newKeyValue()
            .setContent('Meeting Title: ' + title))
        .addWidget(CardService.newKeyValue()
            .setContent('Date: ' + date))
        .addWidget(CardService.newKeyValue()
            .setContent('Day: ' + day))
        .addWidget(CardService.newKeyValue()
            .setContent('Hour: ' + start_hour + ' - ' + end_hour));

    var backHomeImageButton = CardService.newImage()
        .setImageUrl("https://imgur.com/5zpzzQZ.png")
        .setOnClickAction(CardService.newAction()
            .setFunctionName('createHomePageCard'));

    if (caseDilemma) {
        return CardService.newCardBuilder()
            .addSection(updatedFinalDilemmaSection)
            .addSection(confirmationSection)
            .addSection(CardService.newCardSection().addWidget(backHomeImageButton))  // Add the button as the last section
            .build();
    } else {
        return CardService.newCardBuilder()
            .addSection(confirmationSection)
            .addSection(CardService.newCardSection().addWidget(backHomeImageButton))  // Add the button as the last section
            .build();
    }
}
