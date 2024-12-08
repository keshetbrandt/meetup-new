import event as ev
import datetime as dt
import pandas as pd
from scheduling import find_meeting_slot
import scheduleRequest as sr
import constants
import itertools
from oAuthAPI import get_service, get_credentials
from scheduleRequest import set_start_time, set_end_time

# The format of the JSON object that the function returns:
#         {
#             'request':{
#                   "title": string,
#                   "when": This week, Next week, This month, or Next month as a string,
#                   "start_time_frame": datetime object,
#                   "end_time_frame": datetime object,
#                   "duration": int,
#                   "preferred_starting_time": list of string from ['morning', 'noon', 'afternoon', 'evening'],
#                   "participants":list of emails (strings),
#                   },
#             'available_slots': all available slots for the original request, formatted as a list of datatime objects,
#             'message': 'success' if there are available slots for the original request, 'dilemma' id there is availabel sillema option,
#                        '{email} is not registered. Please ask them to sign up!' if one of the participants is not registered
#             'duration reduced': {
#                     'new duration': new duration in minutes,
#                     'available_slots': all available slots with the new duration, formatted as datatime objects
#                 },
#             'participants reduced': {
#                     'without': all participants that were removed from the original request,formatted as a list of emails (strings)
#                     'new participants': new participants, formatted as a list of emails (strings),
#                     'available_slots': all available slots with the new participants, formatted as a list of datatime objects
#                 },
#             'timeframe expanded': {
#                     'new timeframe': new timeframe, as a string,
#                     'available_slots': all available slots with the new timeframe, formatted as a list of datatime objects
#                 }
#         }

def full_flow(request):
    print("Im in full flow")
    available_slots_for_request = find_meeting_slot(request)
    print("I finished available_slots_for_request")
    data_dic = {
            'request': request.to_dict(),
            'message' : '',
            'available_slots': [[slot, slot.strftime("%H:%M") , (slot+ dt.timedelta(minutes=request.duration)).strftime("%H:%M")] for slot in available_slots_for_request],
            'duration reduced': {},
            'participants reduced': {},
            'timeframe expanded': {}
        }
    if available_slots_for_request:
        data_dic['message'] = 'success'
    else:
        print("No available slots for the original request, calculating alternatives")
        original_duration = request.duration
        original_participants = request.participants
        original_start_time_frame = request.start_time_frame
        original_end_time_frame = request.end_time_frame
        #Reduce duration
        for duration in range(request.duration - 30, 0, -30):
            print("trying reducing the duration to: ", duration)
            request.duration = duration
            available_slots_for_request = find_meeting_slot(request)
            if available_slots_for_request:
                data_dic['duration reduced'] = {
                    'new duration': duration,
                    'available_slots': [[slot, slot.strftime("%H:%M") , (slot+ dt.timedelta(minutes=request.duration)).strftime("%H:%M")] for slot in available_slots_for_request],
                }
                data_dic['message'] = 'dilemma'
                request.duration = original_duration
                break
        
        #Expand timeframe
        current_prefferd_time = constants.timeframe_slots.index(request.timeframe)
        next_possible_times = constants.timeframe_slots[current_prefferd_time +1:]
        for timeframe in next_possible_times:
            print("trying expanding the timeframe to: ", timeframe)
            request.start_time_frame = set_start_time(timeframe)
            request.end_time_frame = set_end_time(timeframe)
            available_slots_for_request = find_meeting_slot(request)
            if available_slots_for_request:
                data_dic['timeframe expanded'] = {
                    'new timeframe': timeframe,
                    'available_slots': [[slot, slot.strftime("%H:%M") , (slot+ dt.timedelta(minutes=request.duration)).strftime("%H:%M")] for slot in available_slots_for_request],
                }
                data_dic['message'] = 'dilemma'
                request.start_time_frame = original_start_time_frame
                request.end_time_frame = original_end_time_frame
                break
        
        #Reduce participants
        if len(request.participants) > 2:
            initiator = request.participants[0]
            subgroups = [[initiator] + list(comb) for comb in itertools.combinations(request.participants[1:], len(request.participants) - 2)]
            for subgroup in subgroups:
                print("trying schedule without: ",list(set(original_participants) - set(subgroup))) 
                request.participants = subgroup
                available_slots_for_request = find_meeting_slot(request)
                if available_slots_for_request:
                    data_dic['participants reduced'] = {
                        'without': list(set(original_participants) - set(subgroup)),
                        'new participants': subgroup,
                        'available_slots': [[slot, slot.strftime("%H:%M") , (slot+ dt.timedelta(minutes=request.duration)).strftime("%H:%M")] for slot in available_slots_for_request],
                    }
                    data_dic['message'] = 'dilemma'
                    request.participants = original_participants
                    break
    return data_dic



# The format of the JSON object that this function should recive:
#         {
#             'request': the request as a dictionary,
#             'start': as a string "hh:mm",
#             'date': as a string "dd-mm-yyyy",
#         }
def data_to_event(data):
    starting_time = data['available_slots'][0][0]
    ending_time = starting_time + dt.timedelta(minutes= int(data['request']['duration']))
    event = ev.Event(data['request']['title'], starting_time, ending_time, 'Asia/Jerusalem', data['request']['participants'],"", data['request']['description'], data['request']['location'], data['request']['participants'][0])
    return event

def update_result_by_dilemma(result, dillema):
    if dillema == 'participants reduced':
        result['request']['participants'] = result[dillema]['new participants']
    elif dillema == 'timeframe expanded':
        result['request']['timeframe'] = result[dillema]['new timeframe']
    elif dillema == 'duration reduced':
        result['request']['duration'] = result[dillema]['new duration']
    result['available_slots'] = result[dillema]['available_slots']
    for triple in result['available_slots']:
        to_date = pd.Timestamp(dt.datetime.strptime(triple[0], "%a, %d %b %Y %H:%M:%S %Z"))
        triple[0] = to_date
    print(type(result['available_slots'][0][0]))
    print(type(result['available_slots']))##Todo check if it returns the correct type.
    result['message'] = 'success'
    return result

def schedule_meeting(event):
    google_formated_event = ev.event_to_google_event(event)
    print("google_formated_event: ", google_formated_event)    
    #schedule the event for each participant
    creds = get_credentials([event.initiator])
    service = get_service(creds[0][1])
    schdule_try = service.events().insert(calendarId='primary', body=google_formated_event).execute()
    print(f"Event created: {schdule_try.get('htmlLink')}")



#########TESTING#########

# users = ['yuvalrafaeli1@gmail.com', "js1546186@gmail.com"]

# request = sr.ScheduleRequest("test", users, "90 min", "This week", ["Morning"],"desc", "loc")

# res = full_flow(request)
# print(res)
# json = {
#     'request': request.to_dict(),
#     'start': "10:00",
#     'date': "22-06-2024"
# }
# schedule_meeting(json)


