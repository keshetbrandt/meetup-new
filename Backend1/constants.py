from datetime import datetime

morning = "Morning"
noon = "Noon"
afternoon = "Afternoon"
evening = "Evening"

timeframe_slots = ['This week', 'Next week', 'This month', 'Next month']

#Starting times for each time slot-
# morning-  08:00-10:30
# noon- 11:00-15:30
# afternoon- 16:00-18:30
# evening- 19:00-21:30
morning_timeslots = [datetime.strptime("08:00", "%H:%M"), datetime.strptime("08:30", "%H:%M"), datetime.strptime("09:00", "%H:%M"), datetime.strptime("09:30", "%H:%M"), datetime.strptime("10:00", "%H:%M"), datetime.strptime("10:30", "%H:%M")]
noon_timeslots = [datetime.strptime("11:00", "%H:%M"), datetime.strptime("11:30", "%H:%M"), datetime.strptime("12:00", "%H:%M"), datetime.strptime("12:30", "%H:%M"), datetime.strptime("13:00", "%H:%M"), datetime.strptime("13:30", "%H:%M"), datetime.strptime("14:00", "%H:%M"), datetime.strptime("14:30", "%H:%M"), datetime.strptime("15:00", "%H:%M"), datetime.strptime("15:30", "%H:%M")]
afternoon_timeslots = [datetime.strptime("16:00", "%H:%M"), datetime.strptime("16:30", "%H:%M"), datetime.strptime("17:00", "%H:%M"), datetime.strptime("17:30", "%H:%M"), datetime.strptime("18:00", "%H:%M"), datetime.strptime("18:30", "%H:%M")]
evening_timeslots = [datetime.strptime("19:00", "%H:%M"), datetime.strptime("19:30", "%H:%M"), datetime.strptime("20:00", "%H:%M"), datetime.strptime("20:30", "%H:%M"), datetime.strptime("21:00", "%H:%M"), datetime.strptime("21:30", "%H:%M")]

preffered_timeslots = {morning: morning_timeslots, noon: noon_timeslots, afternoon: afternoon_timeslots, evening: evening_timeslots}

Duration_dic= { '30 min': 30, '60 min':60 , '90 min':90, '120 min':120}

min_participants_to_meet_precent = 0.7