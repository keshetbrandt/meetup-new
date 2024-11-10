var userProperties = PropertiesService.getUserProperties();

function createThisGroupCard(e,group) {
    
    var groupNames = {
      'Army': ['Keshet Brandt', 'Yuval Rafaeli'],
      'Work colleagues': ['Keshet Brandt', 'Yuval Rafaeli', 'Golan Shmueli'],
      'My family': ['Golan Shmueli']
      };

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

    // Determine the names based on the group
    var gNames = groupNames[group] || [];

    // Determine the description based on the group
    var gd = groupDescriptions[group] || [];

    // Create a headline for group description
    var gDescheadline = CardService.newTextParagraph()
    .setText('<b>Description</b>');

    // Create a headline for groupParticipants
    var gpheadline = CardService.newTextParagraph()
    .setText('<b>Participants</b>');

    // Create a headline for AddingParticipants
    var addheadline = CardService.newTextParagraph()
    .setText('Add participants');

    var currentParticipants = [];
    if (e && e.formInputs.participants) {
    var currentParticipants = e.formInputs.participants;
    }
    var curParticipantsInput = createCurParticipantsTextList(currentParticipants, gNames);

    var currentDescription = [];
    if (e && e.formInputs.Description) {
    var currentDescription = e.formInputs.Description;
    }
    var curDescriptionInput = createCurDescriptionTextList(currentDescription, gd);
    
    var homePageButton = CardService.newTextButton()
        .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
        .setBackgroundColor("#007bff")
        .setText('🏠')
        .setOnClickAction(CardService.newAction()
        .setFunctionName('createHomePageCard'));
    
    // Create a button to schedule the meeting
    var BackButton = CardService.newTextButton()
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor("#009FDC")
        .setText('Back')
        .setOnClickAction(CardService.newAction()
        .setFunctionName('validateAndSubmitForm'));

var editButton = CardService.newTextButton()
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setText('Edit!')
        .setOnClickAction(CardService.newAction()
            .setFunctionName('navigateToEditGroupPage')
            .setParameters({group: group}));

    // Create a CardSection to hold the form components
    var curGroupForm = CardService.newCardSection()
        .addWidget(gDescheadline)
        .addWidget(curDescriptionInput)
        .addWidget(gpheadline)
        .addWidget(curParticipantsInput)
        .addWidget(editButton);
        //.addWidget(createButton('<i>Edit!</i>', 'navigateToEditGroupPage').setTextButtonStyle(CardService.TextButtonStyle.FILLED));

    //Create button
    var cardFooter = CardService.newFixedFooter()
        .setPrimaryButton(BackButton)
        .setSecondaryButton(homePageButton);

    // Create a card for the specific group
    var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle(`<b>${group} details</b>`))
      .addSection(curGroupForm)
    card.setFixedFooter(cardFooter)
    
    return card.build();
  }

  function createCurParticipantsTextList(participantsDefaultOption, gNames) {
    // Ensure participantsDefaultOption is an array
    if (!Array.isArray(participantsDefaultOption)) {
      participantsDefaultOption = [];
    }
  
    // Join the valid names list items with line breaks
    var textList = gNames.join('<br>');
  
    // Create a text paragraph widget with the names list
    var textParagraph = CardService.newTextParagraph()
      .setText(textList);
  
    return textParagraph;
  }

  function createCurDescriptionTextList(createCurDescriptionTextList, gd) {
    // Ensure participantsDefaultOption is an array
    if (!Array.isArray(createCurDescriptionTextList)) {
      createCurDescriptionTextList = [];
    }
  
    // Join the valid names list items with line breaks
    var textList = gd.join('<br>');
  
    // Create a text paragraph widget with the names list
    var textParagraph = CardService.newTextParagraph()
      .setText(textList);
  
    return textParagraph;
  }


function navigateToEditGroupPage(e) {
    var groupForEditName = e.parameters.group;
    var card = createEditGroupCard(e, groupForEditName);
    return CardService.newNavigation().pushCard(card);
}

