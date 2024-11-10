from google_auth_oauthlib.flow import InstalledAppFlow
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import mongoDB_API
from google.auth.exceptions import RefreshError
from  googleapiclient.discovery import build
CLIENT_SECRETS_FILE = "credentials.json"
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_google_calendar_cred():

    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
    credentials = flow.run_local_server(port=0)

    return credentials_to_dict(credentials)

def credentials_to_dict(credentials):
  return {'token': credentials.token,
          'refresh_token': credentials.refresh_token,
          'token_uri': credentials.token_uri,
          'client_id': credentials.client_id,
          'client_secret': credentials.client_secret,
          'scopes': credentials.scopes}

def get_credentials(user_emails):
    return mongoDB_API.get_users_cred(user_emails)

def dic_to_cred(credentials_dict):
    return Credentials.from_authorized_user_info(credentials_dict, SCOPES)

def is_cred_expierd(cred):
    return cred.expired and cred.refresh_token

def refresh_cred(credentials):
    return credentials.refresh(Request())

def get_service(credentials):
    return build('calendar', 'v3', credentials=credentials)


