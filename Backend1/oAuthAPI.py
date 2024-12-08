import json
import mongoDB_API
from google.auth.exceptions import RefreshError
from  googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import google_auth_oauthlib.flow
import googleapiclient.discovery

CLIENT_SECRETS_FILE = "credentialsWEB.json"
SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events']
API_SERVICE_NAME = 'calendar'
API_VERSION = 'v3'
CALLBACK_URL = "https://meetup-654cf9211efd.herokuapp.com/credentials"

def google_user_auth_cal(email):
    creds = None
    token = mongoDB_API.get_users_cred([email])[0][1]
    creds = Credentials.from_authorized_user_info(token, SCOPES)
    return creds

def build_google_cal_service_from_token(token, email):
    creds = Credentials.from_authorized_user_info(token, SCOPES)
    service = build('calendar', 'v3', credentials=creds)
    return service

def build_google_cal_service(creds):
    service = build('calendar', 'v3', credentials=creds)
    return service


def credentials_to_dict(credentials):
  return {'token': credentials.token,
          'refresh_token': credentials.refresh_token,
          'token_uri': credentials.token_uri,
          'client_id': credentials.client_id,
          'client_secret': credentials.client_secret,
          'scopes': credentials.scopes}

def get_credentials(user_emails):
    return mongoDB_API.get_users_cred(user_emails)

def get_flow():
    return google_auth_oauthlib.flow.Flow.from_client_secrets_file(
       CLIENT_SECRETS_FILE, scopes=SCOPES)

def dic_to_cred(credentials_dict):
    return Credentials.from_authorized_user_info(credentials_dict, SCOPES)

def is_cred_expierd(cred):
    return cred.expired and cred.refresh_token

# def get_user_email(credentials):
#   user_info_service = get_service(credentials)
#   return user_info_service.userinfo().get('email').execute()

def get_service(credentials):
    return googleapiclient.discovery.build(
        API_SERVICE_NAME, API_VERSION, credentials=credentials)

def refresh_cred(credentials):
    print("I'm here in refresh credentials " + credentials)
    return credentials.refresh(Request())
