//const serverURL = "https://wombat-exotic-amoeba.ngrok-free.app"
//const serverURL = "https://large-moderately-fawn.ngrok-free.app/"
// const serverURL = "https://rapid-humble-gar.ngrok-free.app"
// const serverURL = "https://amused-wired-sunfish.ngrok-free.app/"
const serverURL =  "https://d18c-46-120-39-219.ngrok-free.app" //yuval

// ### PORTS ###
function checkPortAccessibility() {
  var url = serverURL;
  var headers = {
    'ngrok-skip-browser-warning': '1', // Set any value
    // 'User-Agent': 'Custom User Agent', // Set a custom User-Agent header if needed
  };
  var options = {
    'method': 'get',
    'muteHttpExceptions': true,
    'headers': headers,
  };
  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();

  if (responseCode === 200) {
    Logger.log('Port is accessible.');
    Logger.log(response);
  } else {
    Logger.log('Port is not accessible. Response code: ' + responseCode);
  }
}

function getSignUpHtmlPage() {
  var url = serverURL + '/signupsuccess';
  var headers = {
    'ngrok-skip-browser-warning': '1', // Set any value
    // 'User-Agent': 'Custom User Agent', // Set a custom User-Agent header if needed
  };
  var options = {
    'method': 'get',
    'muteHttpExceptions': true,
    'headers': headers,
  };
  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();

  if (responseCode === 200) {
    Logger.log('Port is accessible.');
    Logger.log(response);
    return response;
  } else {
    Logger.log('Port is not accessible. Response code: ' + responseCode);
  }
}

function PostMeeting(title, participants, description,location, duration, when, preferredTime, useremail) {
  /*
  designed to send a POST request to a specified server URL to create or schedule a meeting
  */
  var url = serverURL + '/meeting';
  var headers = {
    'ngrok-skip-browser-warning': '1', // Set any value
    // 'User-Agent': 'Custom User Agent', // Set a custom User-Agent header if needed
    'Content-Type': 'application/json', // Set the content type to JSON
  };
  var requestData = {
    title: title,
    participants: participants,
    description: description,
    location: location,
    duration: duration,
    when: when,
    preferredTime: preferredTime,
    useremail: Session.getActiveUser().getEmail(),
    // usertoken: ScriptApp.getOAuthToken(),
    // timezone: Session.getScriptTimeZone()
    
  };
  var options = {
    'method': 'post',
    'muteHttpExceptions': true,
    'headers': headers,
    'payload': JSON.stringify(requestData) // Convert the request data to JSON
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();
  var responseData = JSON.parse(response.getContentText());
  Logger.log(responseData.message);

  if (responseCode === 200) {
    Logger.log('Port is accessible.');
    Logger.log(response);
    return responseData;
  } else {
    Logger.log('Port is not accessible. Response code: ' + responseCode);
  }
}



function checkUser(email){
  var apiUrl = serverURL + "/homepage?email=" + email; // Replace with the actual URL
  var signUpUrl = serverURL + "/signup?email=" + email;

  try {
    var headers = {
    'ngrok-skip-browser-warning': '1', // Set any value
    // 'User-Agent': 'Custom User Agent', // Set a custom User-Agent header if needed
    'Content-Type': 'application/json', // Set the content type to JSON
  };

    var response = UrlFetchApp.fetch(apiUrl, {
      method: "get",
      'headers': headers,
      muteHttpExceptions: true
    });

    // Check if the GET request was successful (status code 200)
    if (response.getResponseCode() === 200) {
      var responseData = JSON.parse(response.getContentText());
      
      if (responseData.message === 'success'){
        return 'success';
      }
      
      else {
        return signUpUrl;
      }
    } else {
      // Handle the case where the GET request was not successful
      Logger.log("Failed to retrieve working hours. Status code: " + response.getResponseCode());
    }
  } catch (e) {
    // Handle any errors that occur during the GET request
    Logger.log("Error: " + e.toString());
  }
}

function checkSignIn(email) {
  var url = serverURL + '/signin'; // Adjust the endpoint URL

  // Encode the email and password as query parameters
  var queryParams = {
    email: email
  };

  // Build the full URL with query parameters
  url += '?' + Object.keys(queryParams).map(function(key) {
    return key + '=' + encodeURIComponent(queryParams[key]);
  }).join('&');

  var headers = {
    'ngrok-skip-browser-warning': '1',
    // Add any other headers if needed
  };

  var options = {
    'method': 'get',
    'muteHttpExceptions': true,
    'headers': headers,
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();
  var responseData = JSON.parse(response.getContentText());

  if (responseCode === 200) {
    Logger.log('Request successful.');
    Logger.log(responseData);
    // Parse and return the response data (e.g., "success", "wrong password", "unregistered account")
    return responseData;

  } else {
    Logger.log('Request failed. Response code: ' + responseCode);
    // Handle error or return an appropriate value based on your server's response
    return 'Request failed. Response code: ' + responseCode;
  }
}

function getUserPref(email) {
  // Replace with the URL of your Flask API endpoint
  userTimeZone = CalendarApp.getDefaultCalendar().getTimeZone();
  var apiUrl = serverURL + "/preferences?email=" + email + "&tz=" + userTimeZone; // Replace with the actual URL

  try {
    var headers = {
    'ngrok-skip-browser-warning': '1', // Set any value
    // 'User-Agent': 'Custom User Agent', // Set a custom User-Agent header if needed
    'Content-Type': 'application/json', // Set the content type to JSON
  };

    var response = UrlFetchApp.fetch(apiUrl, {
      method: "get",
      'headers': headers,
      muteHttpExceptions: true
    });

    // Check if the GET request was successful (status code 200)
    if (response.getResponseCode() === 200) {
      var responseData = JSON.parse(response.getContentText());
      
      return responseData
      // // Now you can work with the responseData array in your script
      // for (var i = 0; i < responseData.length; i++) {
      //   var workingHourEntry = responseData[i];
      //   // Do something with each workingHourEntry
      //   Logger.log(workingHourEntry);
      
    } else {
      // Handle the case where the GET request was not successful
      Logger.log("Failed to retrieve working hours. Status code: " + response.getResponseCode());
    }
  } catch (e) {
    // Handle any errors that occur during the GET request
    Logger.log("Error: " + e.toString());
  }
}

function updateUserPreferences(preferences) {
  // Replace with the URL of your Flask API endpoint for updating preferences
  var apiUrl = serverURL + "/preferences"; // Replace with the actual URL

  try {
    // Construct the payload for the POST request
    var payload = {
      email: Session.getActiveUser().getEmail(),
      preferences: preferences,
      timezone : CalendarApp.getDefaultCalendar().getTimeZone()
    };

    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    };

    var response = UrlFetchApp.fetch(apiUrl, options)    

    // Check if the POST request was successful (status code 200)
    if (response.getResponseCode() === 200) {
      // Handle the successful update (e.g., show a confirmation message)
      Logger.log("User preferences updated successfully.");
    } else {
      // Handle the case where the POST request was not successful
      Logger.log("Failed to update user preferences. Status code: " + response.getResponseCode());
    }
  } catch (e) {
    // Handle any errors that occur during the POST request
    Logger.log("Error: " + e.toString());
  }
}

function SignUpPost() {
  email = Session.getActiveUser().getEmail();
  var url = serverURL + '/signup?email=' + email; // Adjust the endpoint URL

  var headers = {
    'ngrok-skip-browser-warning': '1',
    // Add any other headers if needed
  };

  var options = {
    'method': 'get',
    'muteHttpExceptions': true,
    'followRedirects': false, // Disable automatic redirection
    'headers': headers,
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();
  var locationHeader = response.getHeaders()['Location'];

  if (responseCode === 302 && locationHeader) {
    // Handle the redirection by capturing the URL in the 'Location' header
    Logger.log('Redirecting to: ' + locationHeader);
    // You can open the URL in a new tab/window using client-side JavaScript
    return locationHeader;
  } else {
    Logger.log('Request failed. Response code: ' + responseCode);
    // Handle error or return an appropriate value based on the response
    return 'Request failed. Response code: ' + responseCode;
  }
}


function postDilemmaSolution(result, myCase) {
  // Replace with the URL of your Flask API endpoint for updating preferences
  var apiUrl = serverURL + "/dilemma"; // Replace with the actual URL

  try {
  //   // Construct the payload for the POST request
    var payload = {
      email: Session.getActiveUser().getEmail(),
      result: result,
      myCase: myCase,
    };

    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    };

    var response = UrlFetchApp.fetch(apiUrl, options);
    return JSON.parse(response);

  } catch (e) {
    // Handle any errors that occur during the POST request
    Logger.log("Error: " + e.toString());
  }
}




function getFinalDilemma(meetingID){
  var apiUrl = serverURL + "/get_final_dilemma?meetingID=" + meetingID;
  try {
    var headers = {
    'ngrok-skip-browser-warning': '1', // Set any value
    'Content-Type': 'application/json', // Set the content type to JSON
    };
    var response = UrlFetchApp.fetch(apiUrl, {
      method: "get",
      'headers': headers,
      muteHttpExceptions: true
    });

    // Check if the GET request was successful (status code 200)
    if (response.getResponseCode() === 200) {
      var responseContent = JSON.parse(response.getContentText());
      
      return responseContent
      
    } else {
      // Handle the case where the GET request was not successful
      Logger.log("Failed to retrieve meeting status. Status code: " + response.getResponseCode());
    }
  } catch (e) {
    // Handle any errors that occur during the GET request
    Logger.log("Error: " + e.toString());
  }
}






function getMeetingStatusFromServer(googleMeetingID, isInitiator){
  var apiUrl = serverURL + "/get_meeting_status?meetingID=" + googleMeetingID +"&initiator=" + String(isInitiator);
  try {
    var headers = {
    'ngrok-skip-browser-warning': '1', // Set any value
    'Content-Type': 'application/json', // Set the content type to JSON
    };
    var response = UrlFetchApp.fetch(apiUrl, {
      method: "get",
      'headers': headers,
      muteHttpExceptions: true
    });

    // Check if the GET request was successful (status code 200)
    if (response.getResponseCode() === 200) {
      var responseContent = JSON.parse(response.getContentText());
      
      return responseContent
      
    } else {
      // Handle the case where the GET request was not successful
      Logger.log("Failed to retrieve meeting status. Status code: " + response.getResponseCode());
    }
  } catch (e) {
    // Handle any errors that occur during the GET request
    Logger.log("Error: " + e.toString());
  }}



//@TODO: AGENDA GENRATOR INTENTION
function sendDataToServer(data) {
  var apiUrl = '******CHANGE THIS *****';
  try {
    var payload = {
      email: Session.getActiveUser().getEmail(),
      data: data
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    };

    var response = UrlFetchApp.fetch(apiUrl, options);
    return JSON.parse(response);
  } catch (e) {
    Logger.log('Error: ' + e.toString());
  }
}
