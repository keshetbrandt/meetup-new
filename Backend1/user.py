from datetime import timedelta, datetime
import mongoDB_API
import pandas as pd

class user:
    def __init__(self, user_email, first_name, last_name, cred, availability):
        self.user_email = user_email
        self.first_name = first_name
        self.last_name = last_name
        self.cred = cred
        self.availability = availability
        self.id = None

    # def __init__(self, user_as_dic):
    #     self.user_email = user_as_dic["email"]
    #     self.first_name = user_as_dic["First_Name"]
    #     self.last_name = user_as_dic["Last_Name"]
    #     self.cred = user_as_dic["cred"]
    #     self.availability = user_as_dic["availability"]
    #     self.id = user_as_dic["_id"]

    def to_dict(self):
        return {"email": self.user_email, "First_Name": self.first_name, "Last_Name": self.last_name, "cred": self.cred, "availability": self.availability}
    
def sign_up(user_email, first_name, last_name, cred,  availability = None):
    if mongoDB_API.check_user(user_email):
        return "Failed! Email address already exists."
    if not availability:
        offset = timedelta(hours=0)
        availability =[
            {"day": "Sunday", "start": datetime.strptime("08:00", "%H:%M") + offset, "end": datetime.strptime("22:00", "%H:%M") + offset, "available": True},
            {"day": "Monday", "start": datetime.strptime("08:00", "%H:%M") + offset, "end": datetime.strptime("22:00", "%H:%M") + offset, "available": True},
            {"day": "Tuesday", "start": datetime.strptime("08:00", "%H:%M") + offset, "end": datetime.strptime("22:00", "%H:%M") + offset, "available": True},
            {"day": "Wednesday", "start": datetime.strptime("08:00", "%H:%M") + offset, "end": datetime.strptime("22:00", "%H:%M") + offset, "available": True},
            {"day": "Thursday", "start": datetime.strptime("08:00", "%H:%M") + offset, "end": datetime.strptime("22:00", "%H:%M") + offset, "available": True},
            {"day": "Friday", "start": datetime.strptime("08:00", "%H:%M") + offset, "end": datetime.strptime("22:00", "%H:%M") + offset, "available": False},
            {"day": "Saturday", "start": datetime.strptime("08:00", "%H:%M") + offset, "end": datetime.strptime("22:00", "%H:%M") + offset, "available": False}
        ]
    new_user = user(user_email, first_name, last_name, cred , availability)
    inserted_object = mongoDB_API.add_user(new_user)
    new_user.id = inserted_object.inserted_id
    print("User has been created!")
    return "Success! The user has been created."

def generate_time_slots(start, end, interval=30):
    """Generate time slots in 30-minute intervals."""
    slots = []
    while start < end:
        slots.append(start)
        start += timedelta(minutes=interval)
    return slots

def get_common_availability(user_emails):
    """Get common availability for a list of users."""
    # Initialize an empty dictionary to store availability by day
    common_availability = {day: [] for day in ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]}
    users_availability = mongoDB_API.get_users_availability(user_emails)
    combined_availabilities = []
    #generating one single availability object
    for day in ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]:
        day_availabilities = [avail for availabilities in users_availability for avail in availabilities if avail['day'] == day]
        
        start = max(avail['start'] for avail in day_availabilities)
        end = min(avail['end'] for avail in day_availabilities)
        available = all(avail['available'] for avail in day_availabilities)
        
        combined_availabilities.append({
            "day": day,
            "start": start,
            "end": end,
            "available": available
            })
    #generating available starting time slots
    for day_avail in combined_availabilities:
        if day_avail["available"]:
            day_slots = generate_time_slots(day_avail["start"], day_avail["end"])
            common_availability[day_avail["day"]] = set(day_slots)

    # Convert sets to sorted lists and create a DataFrame
    for day in common_availability:
        common_availability[day] = sorted(list(common_availability[day]))

    # Convert to a DataFrame
    data = {"Day": [], "Time Slot": []}
    for day, slots in common_availability.items():
        for slot in slots:
            data["Day"].append(day)
            data["Time Slot"].append(slot.strftime("%H:%M"))

    df = pd.DataFrame(data)
    print("genrated common availability df!")
    return df

def get_homepage(email):
    user_as_dic = mongoDB_API.get_user(email)
    user = user(user_as_dic)
    return user

def get_availability(user_email):
    user_as_dic = mongoDB_API.get_user(user_email)
    return user_as_dic["availability"]

def update_availability(user_email, availability):
     return mongoDB_API.update_user_availability(user_email, availability)

# sign_up("rj869903@gmail.com", "Robert", "Jhons", availability = None)
# print(get_common_availability(['yuvalrafaeli1@gmail.com', "js1546186@gmail.com"]))