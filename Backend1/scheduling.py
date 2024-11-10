import pandas as pd
from datetime import datetime, timedelta
from scheduleRequest import ScheduleRequest
import user
from googleCalendar_API import get_final_availability


# Function to find a meeting slot - takes a ScheduleRequest object and a DataFrame of generated common availabilities from users.
def find_meeting_slot(request):
    start_range = request.start_time_frame.replace(tzinfo=None)
    end_range = request.end_time_frame.replace(tzinfo=None)
    meeting_duration = request.duration
    preferred_times = request.prefferd_starting_time
    common_availabilities = user.get_common_availability(request.participants) #only by users chosen availability
    availabilities = get_final_availability(request.participants, request.start_time_frame, request.end_time_frame, common_availabilities)#with calendar limitations
    availabilities = availabilities[availabilities['free_time_ahead'] >= meeting_duration] #remove the no enough time slots
    print("Start range: ", start_range.strftime('%A'), start_range, "  and end range: ", end_range.strftime('%A'), end_range)
    # Generate potential start times within the date range
    current_date = start_range.date()
    potential_slots = []
    while current_date <= end_range.date():
        for time in preferred_times:
            potential_start = datetime.combine(current_date, time.time())
            if start_range <= potential_start <= end_range:
                potential_slots.append(potential_start)
        current_date += timedelta(days=1)
    # Check each potential slot against availabilities
    potential_slots_set = set(potential_slots)
    common_datetimes = availabilities[availabilities['Datetime'].isin(potential_slots_set)] #only the potential slots
    available_start_datetimes = common_datetimes['Datetime'].tolist() 
    return available_start_datetimes

#######TESTING########

# Example usage:
# Meeting request
# users = ['yuvalrafaeli1@gmail.com', "js1546186@gmail.com"]

# request = ScheduleRequest("test", users, "90 min", "This week", ["Morning"])

# print(request.prefferd_starting_time)
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
# meeting_slot = find_meeting_slot(request)
# print("Meeting slot:")
# print(meeting_slot)
