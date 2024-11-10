function dateInUserTimeZone(utcTimestampString, userTimeZone) {
    // Returns a dict with date and day in user's time zone
  
    // Parse the UTC timestamp string into a JavaScript Date object.
    var utcTimestamp = new Date(utcTimestampString);
  
    // Set the time zone for the user's calendar (or any other time zone you want to use).
    var timeZone = userTimeZone || 'America/New_York'; // Default to New York time if userTimeZone is not provided.
  
    // Convert the UTC timestamp to the user's time zone.
    var userTimeZoneDate = Utilities.formatDate(utcTimestamp, timeZone, 'yyyy-MM-dd');
    var userTimeZoneDay = Utilities.formatDate(utcTimestamp, timeZone, 'EEEE'); // 'EEEE' gives the full name of the day
    
    return {
      'date': userTimeZoneDate,
      'day': userTimeZoneDay
    };
  }
  
  // Example usage
  function testDateInUserTimeZone() {
    var utcTimestampString = '2024-08-05T14:00:00Z'; // Example UTC timestamp
    var userTimeZone = 'America/Los_Angeles'; // Example user time zone
  
    var result = dateInUserTimeZone(utcTimestampString, userTimeZone);
    Logger.log('Date: ' + result.date); // Outputs the date in the specified time zone
    Logger.log('Day: ' + result.day); // Outputs the day of the week in the specified time zone
  }
  
  
  function timeInUserTimeZone(utcTimestamp, userTimeZone) {
    // Parse the UTC timestamp string into a JavaScript Date object.
    
    // Set the time zone for the user's calendar (or any other time zone you want to use).
    
    // Convert the UTC timestamp to the user's time zone.
    var userTimeZonestamp = Utilities.formatDate(utcTimestamp, userTimeZone, 'HH:mm');
    
    return userTimeZonestamp;
  }
  
