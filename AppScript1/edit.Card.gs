var userProperties = PropertiesService.getUserProperties();

function createEditGroupCard(e,group) {
    //Create a headline for Group's name
    var editNameheadline = CardService.newTextParagraph()
    .setText('Name of the group');

    var groupEmails = {
        'Army': ['keshetbrandt00@gmail.com', 'yuvalrafaeli1@gmail.com'],
        'Work colleagues': ['keshetbrandt00@gmail.com', 'yuvalrafaeli1@gmail.com', 'golan.shmueli@gmail.com'],
        'My family': ['golan.shmueli@gmail.com']
        };

    var groupDescriptions = {
      'Army': ['My brothers till death'],
      'Work colleagues': ['If you talk about work, beer is on you'],
      'My family': ['You can\'t choose family (So unfortunate)']
      };  

    // Determine the validEmails based on the group
    var validEmails = groupEmails[group] || [];

    // Determine the description based on the group
    var desc = groupDescriptions[group] || [];
  
    //Create a headline for description
    var editDescheadline = CardService.newTextParagraph()
    .setText('Description');
  
    //Create a headline for participants
    var editParticipantsheadline = CardService.newTextParagraph()
    .setText('Current Patricipants');
  
    // Create a TextInput for group name
    var EditGroupNameInput = CardService.newTextInput()
    .setTitle(group)
    .setFieldName('group_name')
    .setMultiline(false);
    if (e && e.formInputs.group_name){
      EditGroupNameInput.setValue(String(e.formInputs.group_name[0]));
    }
  
    // Create a TextInput for description
    var DescriptionInput = CardService.newTextInput()
      .setTitle(desc)
      .setFieldName('group_desc')
      .setMultiline(true);
    if (e && e.formInputs.group_desc){
      DescriptionInput.setValue(String(e.formInputs.group_desc[0]));
    }
  
    var participantsDefaultOption = []
    if (e && e.formInputs.participants){
      var participantsDefaultOption = e.formInputs.participants;
    }
    var participantsDefaultOption = createcurParticipantsMultiSelect(participantsDefaultOption, validEmails);
  
    //Create a headline for participants
    var editAddParticipantsheadline = CardService.newTextParagraph()
    .setText('Add Patricipants');
    // Create a TextInput for members
    
    var EditMembersInput = CardService.newTextInput()
      .setTitle('Enter Members')
      .setFieldName('Members')
      .setMultiline(true)
    if (e && e.formInputs.Members){
      EditMembersInput.setValue(e.formInputs.Members[0]);
    }
    
    
    var homePageButton = CardService.newTextButton()
    .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
    .setBackgroundColor("#007bff")
    .setText('🏠')
    .setOnClickAction(CardService.newAction()
    .setFunctionName('createHomePageCard'));
  
    // Create a button to schedule the meeting
    var SaveButton = CardService.newTextButton()
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setBackgroundColor("#009FDC")
      .setText('Save!')
      .setOnClickAction(CardService.newAction()
      .setFunctionName('createHomePageCard'));
  
    // Create a CardSection to hold the form components
    var groupForm = CardService.newCardSection()
      .addWidget(editNameheadline)
      .addWidget(EditGroupNameInput)
      .addWidget(editDescheadline)
      .addWidget(DescriptionInput)
      .addWidget(editParticipantsheadline)
      .addWidget(participantsDefaultOption)
      .addWidget(editAddParticipantsheadline)
      .addWidget(EditMembersInput);
  
  
    //Create schedule meeting footer with button
    var cardFooter = CardService.newFixedFooter()
      .setPrimaryButton(SaveButton)
      .setSecondaryButton(homePageButton);
  
    // Create the main Card
    var card = CardService.newCardBuilder()
      .addSection(groupForm)
  
    card.setFixedFooter(cardFooter)
  
    return card.build();
    
  }
  
  
  
  function createcurParticipantsMultiSelect(participantsDefaultOption, validEmails) {
    // Ensure participantsDefaultOption is an array
    if (!Array.isArray(participantsDefaultOption)) {
      participantsDefaultOption = [];
    }
    var user_email = Session.getActiveUser().getEmail();
    // Create the multi-choice input
    var multiChoice = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.CHECK_BOX)
      .setTitle('Uncheck to remove')
      .setFieldName('participants');
  
    // Add items to the multi-choice input
    var validList2 = validEmails.filter(function(email) {
      return email !== user_email;
    });
    validList2.forEach(function(email) {
      multiChoice.addItem(email, email, true);
    });
  
    return multiChoice;
  }



