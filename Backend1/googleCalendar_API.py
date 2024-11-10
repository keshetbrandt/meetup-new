from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import pandas as pd
from datetime import datetime, timedelta, timezone
import oAuthAPI
import user
from scheduleRequest import ScheduleRequest
import json

#returns pandas DF with all users busy times
def get_busy_times(users, start_time, end_time):
    busy_slots = []
    creds = oAuthAPI.get_credentials(users)
    for i in range(len(creds)):
        print("getting busy times for user_email: ", creds[i][0])
        service = build('calendar', 'v3', credentials=creds[i][1])
        start_time_str = start_time.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None).isoformat() + 'Z'
        end_time_str = end_time.replace(tzinfo=None).isoformat() + 'Z'

        events_result = service.events().list(
            calendarId=creds[i][0],
            timeMin=start_time_str,
            timeMax=end_time_str,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])

        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            busy_slots.append({
                'start': datetime.fromisoformat(start.replace('Z', '+00:00')).replace(tzinfo=None),
                'end': datetime.fromisoformat(end.replace('Z', '+00:00')).replace(tzinfo=None)
            })
    return busy_slots

def round_down_to_nearest_30_minutes(dt):
    """Round a datetime down to the nearest 30 minutes."""
    return dt.replace(minute=(dt.minute // 30) * 30, second=0, microsecond=0)

def round_up_to_next_30_minutes(dt):
    """Round a datetime up to the next 30 minutes."""
    if dt.minute % 30 == 0 and dt.second == 0:
        return dt
    elif dt.minute < 30 :
       return dt.replace(minute=30, second=0, microsecond=0)
    else:
        return dt.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)

def generate_busy_time_slots(busy_times):
    slots = []
    
    for busy in busy_times:
        start = round_down_to_nearest_30_minutes(busy['start'])
        end = round_up_to_next_30_minutes(busy['end'])
        # Generate 30-minute slots within the adjusted busy period
        current = start
        while current < end:
            slots.append(current.replace(tzinfo=None))
            current += timedelta(minutes=30)
    
    # Convert list to DataFrame
    busy_slots_df = pd.DataFrame({'Datetime': slots})
    return busy_slots_df


def map_availability_to_dates(start_date, end_date, availability_df):
    # Create a list to hold the results
    availability_dates = []
    
    # Generate all dates within the given range
    current_date = start_date
    while current_date <= end_date:
        # Determine the day of the week for the current date
        day_name = current_date.strftime('%A')
        
        # Filter availability slots for the current day
        daily_availability = availability_df[availability_df['Day'] == day_name]
        
        # Combine date and time slots
        for _, row in daily_availability.iterrows():
            time_slot = row['Time Slot']
            datetime_slot = datetime.combine(current_date, datetime.strptime(time_slot, "%H:%M").time())
            availability_dates.append(datetime_slot)
        
        # Move to the next day
        current_date += timedelta(days=1)
    
    return pd.DataFrame({'Datetime': availability_dates})

# Function to add a free_time_ahead column to the availability DataFrame for each time slot
def add_free_time_ahead_col(availability_df):
        # Initialize the free_time_ahead column with 30
    time_slots = availability_df['Datetime'].tolist()
    final_availability_df = availability_df.assign(free_time_ahead=30)
    slot_duration = 30
    
    for i in range(len(time_slots)-1):
        free_time = 0
        current_index = i
        while (current_index < len(time_slots)-1) and (time_slots[current_index+1] - time_slots[current_index]).seconds // 60 == slot_duration:
            free_time += slot_duration
            current_index += 1
        final_availability_df.at[i, 'free_time_ahead'] = free_time + slot_duration
    return final_availability_df

# Function to get final availability considering multiple users ,their availability and their google calendar busy times
def get_final_availability(users, start_time, end_time, common_availability):
    busy_slots = get_busy_times(users, start_time, end_time)
    availability_df = map_availability_to_dates(start_time, end_time, common_availability)
    busy_df = generate_busy_time_slots(busy_slots)
    # Get the set of busy times
    busy_times = set(busy_df['Datetime'])
    
    # Remove busy times from available times
    final_available_df = availability_df[~availability_df['Datetime'].isin(busy_times)]
    final_available_df.reset_index(drop=True, inplace=True)
    return add_free_time_ahead_col(final_available_df)

#######TESTING#######

# Example usage:
# common_availability = pd.DataFrame({
#     'Day': ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
#     'Time Slot': ["08:00", "08:00", "08:00", "08:00", "08:00", "08:00", "08:00"]
# })

# start_range = datetime.now()
# end_range = datetime.now() + timedelta(days=10)  
# users = ['yuvalrafaeli1@gmail.com', "js1546186@gmail.com"]



# user1 = user.user("mail.com", "fisrt", "last", "token", [
#             {"day": "Sunday", "start": datetime.strptime("08:00", "%H:%M"), "end": datetime.strptime("10:00", "%H:%M"), "available": True},
#             {"day": "Monday", "start": datetime.strptime("08:00", "%H:%M"), "end": datetime.strptime("10:00", "%H:%M"), "available": True},
#             {"day": "Tuesday", "start": datetime.strptime("08:00", "%H:%M"), "end": datetime.strptime("19:00", "%H:%M"), "available": True},
#             {"day": "Wednesday", "start": datetime.strptime("08:00", "%H:%M"), "end": datetime.strptime("10:00", "%H:%M"), "available": True},
#             {"day": "Thursday", "start": datetime.strptime("08:00", "%H:%M"), "end": datetime.strptime("10:00", "%H:%M"), "available": True},
#             {"day": "Friday", "start": datetime.strptime("08:00", "%H:%M"), "end": datetime.strptime("22:00", "%H:%M"), "available": False},
#             {"day": "Saturday", "start": datetime.strptime("08:00", "%H:%M"), "end": datetime.strptime("22:00", "%H:%M"), "available": False}
#         ]
                  
#                   )
# user2 = user.user("mail.com", "fisrt", "last", "token", [
#             {"day": "Sunday", "start": datetime.strptime("10:00", "%H:%M"), "end": datetime.strptime("22:00", "%H:%M"), "available": True},
#             {"day": "Monday", "start": datetime.strptime("10:00", "%H:%M"), "end": datetime.strptime("22:00", "%H:%M"), "available": True},
#             {"day": "Tuesday", "start": datetime.strptime("10:00", "%H:%M"), "end": datetime.strptime("22:00", "%H:%M"), "available": True},
#             {"day": "Wednesday", "start": datetime.strptime("10:00", "%H:%M"), "end": datetime.strptime("22:00", "%H:%M"), "available": True},
#             {"day": "Thursday", "start": datetime.strptime("10:00", "%H:%M"), "end": datetime.strptime("22:00", "%H:%M"), "available": True},
#             {"day": "Friday", "start": datetime.strptime("08:00", "%H:%M"), "end": datetime.strptime("22:00", "%H:%M"), "available": False},
#             {"day": "Saturday", "start": datetime.strptime("08:00", "%H:%M"), "end": datetime.strptime("22:00", "%H:%M"), "available": False}
#         ]
                  
#                   )
# availabilities = user.get_common_availability([user1, user2])
# print("availabilities are: ", availabilities)
# users = ['yuvalrafaeli1@gmail.com', "js1546186@gmail.com"]

# request = ScheduleRequest("test", users, "90 min", "This week", ["Morning"])
# common_availability = user.get_common_availability(users)
# print("common availability: " , common_availability)
# print("mapping to dates: ", map_availability_to_dates(request.start_time_frame, request.end_time_frame, common_availability))
# print("final availability: ", get_final_availability(users, request.start_time_frame, request.end_time_frame, common_availability) )
# print("final availability: ", get_final_availability(users, request.start_time_frame, request.end_time_frame, common_availability) )


# print(get_final_availability(users, start_range, end_range, user.get_common_availability(users)))
# Authenticate and get credentials

# Get final availability
# final_availability_df = get_final_availability(user_email, start_range, end_range, common_availability, credentials)
# print(final_availability_df)

