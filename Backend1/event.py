import datetime
from datetime import datetime as dt
import pandas as pd

class Event:
    def __init__(self,title,  start_time, end_time, time_zone, participants, event_id=None, description=None, location=None, initiator=None):
        self.title = title
        self.start_time = start_time #store in the following format '.strftime('%Y-%m-%dT%H:%M:%S')'
        self.end_time = end_time #store in the following format '.strftime('%Y-%m-%dT%H:%M:%S')'
        self.time_zone = time_zone #store in the following format 'Asia/Jerusalem'
        self.participants = participants
        self.event_id = event_id
        self.initiator = initiator
        self.description = description
        self.location = location

    def __str__(self):
        return f"Title: {self.title}\n" \
               f"Start Time: {self.start_time}\n" \
               f"End Time: {self.end_time}\n" \
               f"Time Zone: {self.time_zone}\n" \
               f"Participants: {', '.join(self.participants)}\n" \
               f"event_id: {self.event_id}"\
               f"Initiator: {self.initiator}\n"\
               f"Description: {self.description}\n"\
               f"Location: {self.location}\n"        
    
    def to_dict(self):
        return {
            "title": self.title,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "time_zone": self.time_zone,
            "participants": self.participants,
            "event_id": self.event_id,
            "initiator": self.initiator,
            "description": self.description,
            "location": self.location
        }

    def event_to_client_json(self):
        start_time = dt.fromisoformat(self.start_time)
        end_time = dt.fromisoformat(self.end_time)
        limited_data = {
                "title": self.title,
                "day": start_time.strftime("%A"),
                "start_hour": start_time,
                "end_hour": end_time,
                "date": self.start_time.date(),
                "participants": self.participants,
                "description": self.description,
                "location": self.location,
                }
        return limited_data    
      
def dict_to_event(dict):
  return Event(dict["title"], dict["start_time"], dict["end_time"], dict["time_zone"],  dict["participants"], dict["event_id"], dict["description"], dict["location"])

#Takes event and converts it to google event 
def event_to_google_event(event):
    event_google = {
        'summary': event.title,
        'description': event.description,
        'start': {
            'dateTime': event.start_time.isoformat(),
            'timeZone': event.time_zone,
        },
        'end': {
            'dateTime': event.end_time.isoformat(),
            'timeZone': event.time_zone,
        },
        'attendees': [{'email': email} for email in event.participants],
        'location': event.location,
    }
    return event_google

def req_to_event(request, start_time):
    start = start_time
    end = start + datetime.timedelta(minutes=request.duration)
    start, end = str(start.isoformat()), str(end.isoformat())
    event = Event(request.title, start,end, "", request.participants, "", request.description, request.location, request.participants[0])
    return event

def google_event_to_event(google_event):

    event_id = google_event['id']
    start_time = google_event['start'].get('dateTime', google_event['start'].get('date'))
    end_time = google_event['end'].get('dateTime', google_event['end'].get('date'))
    time_zone = google_event['start'].get('timeZone')
    title = google_event.get('summary')
    description = google_event.get('description')
    location = google_event.get('location')
    # Extracting the initiator (assuming the email is stored in the 'organizer' field)
    # event_organizer = google_event.get('organizer', {}).get('email')
    # initiator = event_organizer if event_organizer else 'Unknown'
    # Extracting participants (assuming the emails are stored in the 'attendees' field)
    participants = [attendee.get('email') for attendee in google_event.get('attendees', [])]

    event = Event(title, start_time, end_time, time_zone, participants, event_id, description, location)

    return event


