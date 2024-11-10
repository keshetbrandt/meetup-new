var userProperties = PropertiesService.getUserProperties();

// Function to create a card for scheduling a meeting
function createScheduleMeetingCard(e, generatedAgenda = "") {
    // Create a headline for Title
    var titleheadline = CardService.newTextParagraph().setText('Title for the meeting');

    // Create a headline for participants
    var participantsheadline = CardService.newTextParagraph().setText('Participants (split by comma)');

    // Create a headline for description
    var descriptionheadline = CardService.newTextParagraph().setText('Description');

    // Create a headline for When
    var whenheadline = CardService.newTextParagraph().setText('When?');

    // Create a headline for Duration
    var durationheadline = CardService.newTextParagraph().setText('Duration');

    // Create a headline for location
    var locationheadline = CardService.newTextParagraph().setText('Location');

    // Create a headline for preferred time
    var preferredtimeheadline = CardService.newTextParagraph().setText('Preferred time');

    // Create a TextInput for participants
    var participantsInput = CardService.newTextInput()
        .setTitle('Enter participants')
        .setFieldName('participants')
        .setMultiline(true);
    if (e && e.formInputs.participants) {
        participantsInput.setValue(e.formInputs.participants[0]);
    }

    // Create input field for title
    var titleInput = CardService.newTextInput()
        .setTitle('Enter title')
        .setFieldName('title')
        .setMultiline(true);
    if (e && e.formInputs.title) {
        titleInput.setValue(String(e.formInputs.title[0]));
    }

    // Create input field for duration
    var durationDefaultOption = "30 min";
    if (e && e.formInputs.duration) {
        var durationDefaultOption = e.formInputs.duration;
    }
    var durationInput = createDurationDropdown(durationDefaultOption);

    // Create input field for when
    var timeFrameDefaultOption = 'This week';
    if (e && e.formInputs.timeframe) {
        timeFrameDefaultOption = e.formInputs.timeframe;
    }
    var timeframeInput = createTimeframeDropdown(timeFrameDefaultOption);

    // Create input field for preferred time
    var preferredtimeDefaultOption = 'Choose preferred time from list';
    if (e && e.formInputs.preferredtime) {
        preferredtimeDefaultOption = e.formInputs.preferredtime;
    }
    var preferredtimeInput = createpreferredtimeMultiChoice(preferredtimeDefaultOption);

    // Create a TextInput for description
    var descriptionInput = CardService.newTextInput()
        .setTitle('Enter description')
        .setFieldName('description')
        .setMultiline(true);
    if (e && e.formInputs.description) {
        descriptionInput.setValue(e.formInputs.description[0]);
    }

    // Create a TextInput for location
    var locationInput = CardService.newTextInput()
        .setTitle('Enter location')
        .setFieldName('location')
        .setMultiline(true);
    if (e && e.formInputs.location) {
        locationInput.setValue(e.formInputs.location[0]);
    }

    // Create a CardSection to hold the form components
    var meetingForm = CardService.newCardSection()
        .addWidget(titleheadline)
        .addWidget(titleInput)
        .addWidget(descriptionheadline)
        .addWidget(descriptionInput)
        .addWidget(participantsheadline)
        .addWidget(participantsInput)
        .addWidget(whenheadline)
        .addWidget(timeframeInput)
        .addWidget(durationheadline)
        .addWidget(durationInput)
        .addWidget(locationheadline)
        .addWidget(locationInput)
        .addWidget(preferredtimeheadline)
        .addWidget(preferredtimeInput);

    // Create an image button at the bottom of the card
    var findTimeButtonImage = CardService.newImage()
        .setImageUrl("https://imgur.com/uflj0Gz.png")
        .setOnClickAction(CardService.newAction().setFunctionName('validateAndSubmitForm')); // Use the link from the "Find time!" button

    // Create the main Card
    var card = CardService.newCardBuilder()
        .addSection(meetingForm)
        .addSection(CardService.newCardSection().addWidget(findTimeButtonImage));

    return card.build();
}

// Function to create a dropdown menu for the duration
function createDurationDropdown(durationDefaultOption) {
    var dropdown = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setFieldName('duration')
        .addItem('30 Min', '30 min', durationDefaultOption == '30 min')
        .addItem('60 Min', '60 min', durationDefaultOption == '60 min')
        .addItem('90 Min', '90 min', durationDefaultOption == '90 min')
        .addItem('120 Min', '120 min', durationDefaultOption == '120 min');

    return dropdown;
}

// Function to create a dropdown menu for the timeframe
function createTimeframeDropdown(timeFrameDefaultOption) {
    var dropdown = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setTitle('Default time frames')
        .setFieldName('timeframe')
        .addItem('This Week', 'This week', timeFrameDefaultOption == 'This week')
        .addItem('Next Week', 'Next week', timeFrameDefaultOption == 'Next week')
        .addItem('This month', 'This month', timeFrameDefaultOption == 'This month')
        .addItem('Next month', 'Next month', timeFrameDefaultOption == 'Next month');

    return dropdown;
}

function createpreferredtimeMultiChoice(preferredtimeDefaultOption) {
    var multiChoice = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setTitle('Choose time frame(s) from list')
        .setFieldName('preferredtime')
        .addItem('Morning (8 AM - 11 AM)', 'Morning', preferredtimeDefaultOption.includes('Morning'))
        .addItem('Noon (11 AM - 4 PM)', 'Noon', preferredtimeDefaultOption.includes('Noon'))
        .addItem('Afternoon (4 PM - 7 PM)', 'Afternoon', preferredtimeDefaultOption.includes('Afternoon'))
        .addItem('Evening (7 PM - 10 PM)', 'Evening', preferredtimeDefaultOption.includes('Evening'));

    return multiChoice;
}

function validateAndSubmitForm(e) {
    var formInput = e.formInput;

    // Check title is not empty
    var title = formInput.title;
    if (!title || title.trim() === '') {
        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText("Meeting title cannot be empty"))
            .build();
    }

    try {
        var when = formInput.timeframe[0];
    } catch (error) {
        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText("You must select a time frame for the meeting"))
            .build();
    }

    // Check if participants are valid email
    var participants = formInput.participants;
    if (participants) {
        participants = participants.split(',');
        for (var i = 0; i < participants.length; i++) {
            if (!isValidEmail(participants[i].trim())) {
                return CardService.newActionResponseBuilder()
                    .setNotification(CardService.newNotification()
                        .setText(participants[i] + " is not a valid email"))
                    .build();
            }
        }
    }

    // Check if duration was selected
    var duration = formInput.duration;
    if (!duration) {
        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText("You must select duration for the meeting"))
            .build();
    }

    // If all validations pass, you can submit the form
    return scheduleMeetingButtonClick(e);
}

function scheduleMeetingButtonClick(e) {
    var formResponse = e.formInputs;

    // Extract form data
    var title = formResponse.title[0];
    var participants = formResponse.participants ? formResponse.participants[0] : "";
    var description = formResponse.description ? formResponse.description[0] : "";
    var location = formResponse.location ? formResponse.location[0] : "";
    var duration = formResponse.duration[0];
    var when = formResponse.timeframe[0];
    var preferredTime = formResponse.preferredtime ? formResponse.preferredtime : [];
    for (var i = 0; i < participants.length; i++) {
        participants[i] = participants[i].toLowerCase();
    }

    var useremail = Session.getActiveUser().getEmail();

    receivedData = PostMeeting(title, participants, description, location, duration, when, preferredTime, useremail);

    if (receivedData.message === "success") { // Return a confirmation card
        var confirmationCard = createConfirmationCard(receivedData);

        return CardService.newNavigation()
            .pushCard(confirmationCard);
    }
    if (receivedData.message === "dilemma") {
        var dilemmaCard = createDilemmaCard(receivedData);

        return CardService.newNavigation()
            .pushCard(dilemmaCard);
    }

    if (receivedData.message === "") {
        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText('An error has occurred'))
            .build();
    } else {
        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText(receivedData.message))
            .build();
    }
}

// Function to validate an email address using a regular expression
function isValidEmail(email) {
    var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
}
