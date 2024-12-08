from flask import Flask, request, jsonify, render_template, redirect, url_for, session
import os
import user
import json
from datetime import timedelta, datetime
from main_flow import full_flow, schedule_meeting, data_to_event, update_result_by_dilemma
import mongoDB_API
import pandas as pd
import scheduleRequest as sr
from oAuthAPI import get_flow, credentials_to_dict
import google_auth_oauthlib.flow

CLIENT_SECRETS_FILE = "credentialsWEB.json"
SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events']
API_SERVICE_NAME = 'calendar'
API_VERSION = 'v3'
CALLBACK_URL = "https://meetup-654cf9211efd.herokuapp.com/callback"


app = Flask(__name__)
# Build random secret key
app.secret_key = os.urandom(24)    

@app.route('/preferences', methods=['GET', 'POST'])
def availability():
    email = request.args.get('email')
    # email = request.form["email"].lower()

    if request.method == 'POST':

        # availability = []
        # for day in ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]:
        #     start = datetime.strptime(request.form[f"{day}_start"], "%H:%M")
        #     end = datetime.strptime(request.form[f"{day}_end"], "%H:%M")
        #     available = request.form[f"{day}_available"]
        #     availability.append({
        #         "day": day,
        #         "start": start,
        #         "end": end,
        #         "available": available
        #     })
        
        # user.update_availability(email, availability)
        # return f"Updated availability for {email}"
    
        data = request.get_json()
        email = data["email"]
        availability = data["preferences"]
        for day in availability:
                time_format = "%I:%M %p"
                day['start'] = datetime.strptime(day['start'], time_format)
                day['end'] = datetime.strptime(day['end'], time_format)
        updated = user.update_availability(email, availability)

        return jsonify(updated)
    else:
        # return render_template('availability.html')
        availability = user.get_availability(email)
        for day in availability:
            day['start'] = day['start'].strftime("%I:%M %p")
            day['end'] = day['end'].strftime("%I:%M %p")

        return availability


@app.route('/meeting', methods=['GET', 'POST'])
def meeting_request():
    if request.method == 'POST':
        data = request.get_json()
        title = data["title"]
        when = data["when"]
        duration = data["duration"]
        preferred_starting_time = data["preferredTime"]
        location = data["location"]
        description = data["description"]
        participants = data["participants"].strip().split(",")
        participants = [data["useremail"]] + participants
       
        user_validation = mongoDB_API.validate_users(participants)
        if user_validation != True:
            return jsonify({"message": user_validation +  " is not registered. Please ask them to sign up!"})
        
        request_format = sr.ScheduleRequest(title, participants, duration, when, preferred_starting_time, description, location)
        print("Generated request: ", request_format.to_dict()) 
        result = full_flow(request_format)
        if result["message"] == "success":
            print("Found time! scheduling meeting on: " , result['available_slots'][0])
            schedule_meeting(data_to_event(result))
        return jsonify(result)
    else:
        return render_template('request.html')
    
@app.route('/dilemma', methods=['GET', 'POST'])
def schedule():
    if request.method == 'POST':
        data = request.get_json()
        result = json.loads(data.get('result'))
        dilemma = data.get('myCase')
        print("data recived after dillema: ", dilemma)
        new_result = update_result_by_dilemma(result, dilemma)
        chosen_slot = new_result[dilemma]['available_slots'][0][0]
        returned_message = {
            'message': "success",
            'title': result['request']['title'],
            'date': chosen_slot.strftime('%Y-%m-%d'),
            'day': chosen_slot.strftime('%A'),
            'start_hour': result[dilemma]['available_slots'][0][1],
            'end_hour': result[dilemma]['available_slots'][0][2],
        }
        schedule_meeting(data_to_event(new_result))
        return jsonify(returned_message)
    
    else:
        return render_template('login.html')




@app.route('/homepage', methods=['GET', 'POST'])
def homepage():
    print("on homepage")
    email = request.args.get('email')
    if request.method == 'GET':
        user_validation = mongoDB_API.validate_users([email])
        if user_validation != True:
            return jsonify({"message": 'user not found'})
        else:
            return  jsonify({"message": 'success'})
        
@app.route('/signup', methods=['GET', 'POST'])
# def signup():
#     print("on signup")
#     email = request.args.get('email')
#     if request.method == 'GET':
#         print("on get")
#         user_validation = mongoDB_API.validate_users([email])
#         if user_validation != True:
#             return authorize(email)
#         else:
#             return  jsonify({"message": 'success'})

def signup():
    print("on signup")
    email = request.args.get('email')
    # Create flow instance to manage the OAuth 2.0 Authorization Grant Flow steps.
    flow = get_flow()
    # The URI created here must exactly match one of the authorized redirect URIs
    # for the OAuth 2.0 client, which you configured in the API Console. If this
    # value doesn't match an authorized URI, you will get a 'redirect_uri_mismatch'
    # error.
    flow.redirect_uri = CALLBACK_URL
    authorization_url, state = flow.authorization_url(
        # Enable offline access so that you can refresh an access token without
        # re-prompting the user for permission. Recommended for web server apps.
        access_type='offline',
        approval_prompt='force',
        # Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes='true')

    # Store the state so the callback can verify the auth server response.
    session['state'] = state
    session['email'] = email
    # return jsonify({"message": 'created', "url": authorization_url})
    return redirect(authorization_url)

@app.route('/callback')
def callback():
    # Specify the state when creating the flow in the callback so that it can
    # verified in the authorization server response.

    print ("in callback")
    state = request.args.get('state')
    # email = request.args.get('email')
    # state = session['state']
    # print("email: ", email)
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)

    flow.redirect_uri =CALLBACK_URL

    # Use the authorization server's response to fetch the OAuth 2.0 tokens.
    authorization_response = request.url
    print("before flow.fetch_token")
    
    flow.fetch_token(authorization_response=authorization_response)
    
    # Store credentials in the session.
    # ACTION ITEM: In a production app, you likely want to save these
    #              credentials in a persistent database instead.
    credentials = flow.credentials
    session['credentials'] = credentials_to_dict(credentials)
    user.sign_up(session['email'] ,'Name', 'Last Name', credentials_to_dict(credentials))
    return('<!DOCTYPE html>'+
            '<html>'+
            '<head>'+
                '<title>Sign Up Successful</title>'+
                '<style>'+
                    'body {'+
                        'font-family: Arial, sans-serif;'+
                        'text-align: center;'+
                        'padding: 50px;'+
                    '} '+
                    'h1 {'+
                        'color: #2986cc;' +
                    '}'+
                    'p {'+
                        'font-size: 18px;' +
                        'margin-top: 20px;' +
                    '}'+
                    'a {' +
                      'text-decoration: none;' +
                        'color: #2986cc;' +
                    '}'+
                '</style>' +
            '</head>'+
            '<body>'+
                '<h1>Sign Up Successful</h1>'+
                '<p><a href="https://calendar.google.com/" target="_blank">Click here</a> to go back to Google Calendar, or refresh your Google Calendar tab.</p>'+
                '<p>Make sure you update your availability once logged in!</p>'+
            '</body>'+
            '</html>'
)

# @app.route('/signup', methods=['GET', 'POST'])
# def signup():
#     if request.method == 'POST':
#         email = request.get_json()["email"]
#         first_name = request.get_json()["first_name"]
#         last_name = request.get_json()["last_name"]
#         availability = request.get_json()["availability"]   
#         return jsonify(sign_up(email, first_name, last_name, availability))
#     else:
#         return render_template('signup.html')
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)


