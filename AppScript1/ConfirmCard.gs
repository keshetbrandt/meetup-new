function createConfirmCard() {
  // Replace the "Meeting scheduled" text with the provided image
  var confirmationImage = CardService.newImage()
    .setImageUrl("https://imgur.com/dDuVAdS.png");

  // Create an image button for navigation, replacing the original button
  var backHomeImageButton = CardService.newImage()
    .setImageUrl("https://imgur.com/2f7jX0A.png")  // Replace with your correct image URL
    .setOnClickAction(CardService.newAction()
    .setFunctionName('createHomePageCard'));

  // Create a card section and add the widgets
  var cardSection = CardService.newCardSection()
    .addWidget(confirmationImage)
    .addWidget(backHomeImageButton);

  // Create the card and add the section
  var card = CardService.newCardBuilder()
    .addSection(cardSection);

  // Return the built card
  return card.build();
}
