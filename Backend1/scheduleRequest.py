import datetime as dt
import constants

def set_start_time(timeframe): 
    if (timeframe == 'This week' or timeframe =='This month'):
        start_time = dt.datetime.now()
    elif (timeframe == 'Next week'):
        today = dt.datetime.now().date()
        if (today.weekday() == 6):
            days_until_next_sunday = 7
        else:
            days_until_next_sunday = (6 - today.weekday()) % 7
        start_time = dt.datetime.now() + dt.timedelta(days=days_until_next_sunday)
        start_time = start_time.replace(second=0, microsecond=0)
    elif (timeframe == 'Next month'):
        today = dt.datetime.now().date()
        if today.month == 12:
            next_month = dt.datetime(today.year + 1, 1, 1, tzinfo=None).date()
        else:
            next_month = dt.datetime(today.year, today.month + 1, 1, tzinfo=None).date()
        start_time = dt.datetime.combine(next_month, dt.time.min, tzinfo=None)
        start_time = start_time.replace(second=0, microsecond=0)
    else:
        raise ValueError('Invalid timeframe')
    print ("\n\n\nDefault\nStart time:" + str(start_time) + "\nType: " + str(type(start_time)))
    return start_time

def set_end_time(timeframe):
    current_time = dt.datetime.now()
    if timeframe == 'This week':
        today = dt.datetime.now().date()
        if (today.weekday() == 6):
            days_until_next_sunday = 7
        else:
            days_until_next_sunday = (6 - today.weekday()) % 7
        end_time = current_time + dt.timedelta(days=days_until_next_sunday)
        end_time = end_time.replace(hour=0, minute=0, second=0, microsecond=0) + dt.timedelta(days=1)
    elif timeframe == 'Next week':
        today = dt.datetime.now().date()
        if (today.weekday() == 6):
            days_until_next_sunday = 7
        else:
            days_until_next_sunday = (6 - today.weekday()) % 7
        end_time = current_time + dt.timedelta(days=days_until_next_sunday + 7)
        end_time = end_time.replace(hour=0, minute=0, second=0, microsecond=0) + dt.timedelta(days=1)
    elif timeframe == 'This month':
        today = dt.datetime.now().date()
        next_month = dt.datetime(today.year, today.month + 1, 1, tzinfo=None).date()
        end_time = dt.datetime.combine(next_month, dt.time.min, tzinfo=None)
        end_time = end_time.replace(second=0, microsecond=0)

    elif timeframe == 'Next month':
        today = dt.datetime.now().date()
        if today.month == 12:
            next_month = dt.datetime(today.year + 1, 1, 1, tzinfo=None).date()
        else:
            next_month = dt.datetime(today.year, today.month + 1, 1, tzinfo=None).date()
        start_time = dt.datetime.combine(next_month, dt.time.min, tzinfo=None)
        start_time = start_time.replace(second=0, microsecond=0)
        end_time = start_time.replace(day=1) + dt.timedelta(days=31)
        end_time = end_time.replace(hour=0, minute=0, second=0, microsecond=0)
    return end_time

def test_title(title):
    if (title == ''):
        raise ValueError('Title cannot be empty')
    return True

def test_duration(duration):
    if duration not in constants.Duration_dic:
        raise ValueError('Invalid duration')
    return True

def test_prefferdTime(prefferdTime):
    for slot in prefferdTime:
        if slot not in constants.preffered_timeslots:
            raise ValueError('Invalid prefferdTime')
    return True

class ScheduleRequest:
    def __init__(self, title, participants_emails, duration, when, prefferdTime, description="", location=""):
        if test_title(title):
            self.title = title
        if when in constants.timeframe_slots:
            self.timeframe = when
            self.start_time_frame = set_start_time(when)
            self.end_time_frame = set_end_time(when)
        else:
            raise ValueError('Timeframe must be This week, Next week, This month, or Next month')
        if test_prefferdTime(prefferdTime):
            self.prefferd_time = prefferdTime
            self.prefferd_starting_time = []
            for slot in prefferdTime:
                for time in constants.preffered_timeslots[slot]:
                    self.prefferd_starting_time.append(time)
        if test_duration(duration):
            self.duration = constants.Duration_dic[duration]
        self.participants = participants_emails
        self.description = description
        self.location = location
        self.initiator = participants_emails[0]
        print("request created")

    #only what we need for the main flow
    def to_dict(self):
        return {
            "title": self.title,
            "duration": self.duration,
            "when": self.timeframe,
            "preffered time": self.prefferd_time,
            "participants": self.participants,
            "description": self.description,
            "location": self.location,
            "initiator": self.initiator,
        }
    
    # need to get from the frontend:
    # {
    #     'title': string,
    #     'participants': list of emails (strings),
    #     'description': string,
    #     'location': string,
    #     'duration': '30 min', '60 min', '90 min', '120 min',
    #     'when': 'This week', 'Next week', 'This month', 'Next month',
    #     'preferredTime': list of string from ['morning', 'noon', 'afternoon', 'evening'],
    # }

    def dict_to_request(dict):          
        request = ScheduleRequest(dict["title"], dict["participants"], dict["duration"], dict["when"], dict["preferredTime"], dict["description"], dict["location"])
        return request
    
    def __str__(self):
        return f"Title: {self.title}\nTimeframe: {self.timeframe}\nStart_Time_Frame: {self.start_time_frame}\nEnd_Time_Frame: {self.end_time_frame}\nDuration: {self.duration}\nParticipants: {self.participants}\nPreferred starting time: {self.prefferd_starting_time}\n"

# test= ScheduleRequest("test", ["a", "b"], "60 min", "This week", ["Morning","Afternoon"])
# test1= ScheduleRequest("test", ["a", "b"], "90 min", "This month", ["Morning"])
# print(test.__str__())
# print(test1.__str__())
# print(test.prefferd_starting_time)
# print(type(test.prefferd_starting_time[0]))
