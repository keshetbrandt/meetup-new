function createHomepageButton() {
  var action = CardService.newAction()
    .setFunctionName('onHomepage');

  return CardService.newTextButton()
    .setText('Go to Home Page 🏠')
    .setBackgroundColor("#039BE5")
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(action);
}

function createDeleteNotificationButton(notificationID, userNotificationList) {
  var action = CardService.newAction()
    .setFunctionName('deleteNotification')
    .setParameters({
      Notification_ID: notificationID,
      Notification_List: JSON.stringify(userNotificationList)
    });

  return CardService.newTextButton()
    .setText('Got It 👍')
    .setBackgroundColor("#33B679")
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(action);
}

function createKeepMeetingButton(notificationID, userNotificationList) {
  var action = CardService.newAction()
      .setFunctionName('updateMeetingStatusAndClearFromNotifications')
      .setParameters({
        Notification_ID: notificationID,
        Notification_List: JSON.stringify(userNotificationList),
        CTA: 'Keep'
    });

  return CardService.newTextButton()
    .setText('Keep Meeting 👍')
    .setBackgroundColor("#33B679")
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(action);
}

function createCancelMeetingButton(notificationID, userNotificationList) {
  var action = CardService.newAction()
      .setFunctionName('updateMeetingStatusAndClearFromNotifications')
      .setParameters({
        Notification_ID: notificationID,
        Notification_List: JSON.stringify(userNotificationList),
        CTA: 'Cancel'
    });

  return CardService.newTextButton()
    .setText('Cancel Meeting ❌')
    .setBackgroundColor("#E67C73")
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(action);
}


function createGenerateAgendaButton(notification, userNotificationList) {
  var action = CardService.newAction()
      .setFunctionName('generateAgendaFunction')
      .setParameters({
        Notification: JSON.stringify(notification),
        Notification_List: JSON.stringify(userNotificationList)
      });

  return CardService.newTextButton()
    .setText('Generate Agenda ✨')
    .setBackgroundColor("#0B8043")
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(action);
}


// formatting the date to hour and date for easier use
function formatScheduledTime (scheduledTime){
  var notificationScheduledTime = new Date(scheduledTime);
  var formattedScheduledTime = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(notificationScheduledTime);
  var formattedHour = notificationScheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    formattedDate: formattedScheduledTime,
    formattedHour: formattedHour
  };
}


