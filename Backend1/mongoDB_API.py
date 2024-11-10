from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from oAuthAPI import is_cred_expierd, refresh_cred, credentials_to_dict, dic_to_cred

def conenct_to_db():
    # URI for the MongoDB Atlas cluster
    uri = "mongodb+srv://yuvalrafaeli1:rLIIbPNoU6ZvZjwa@workshopdb.turshf9.mongodb.net/?appName=workshopDB"
    # Create a new client and connect to the server
    client = MongoClient(uri)
    print("Connected to MongoDB")
    return client

def close__db_connection(client):
    client.close()
    print("Closed MongoDB connection")

def add_user(user):
    db = conenct_to_db().Workshop
    collection = db.Users
    result = collection.insert_one(user.to_dict())
    print("Added user:", result.inserted_id)
    return result

def add_group(group):
    db = conenct_to_db().Workshop
    collection = db.Groups
    result = collection.insert_one(group.to_dict())
    print("Added group:", result.inserted_id)
    return result

def check_user(user_email):
    db = conenct_to_db().Workshop
    collection = db.Users
    user = collection.find_one({"email": user_email})
    if user:
        print("User exists:", user_email)
        return True
    else:
        print("User does not exist:", user_email)
        return False

def validate_users(users_by_email):
    print("Validating users")
    db = conenct_to_db().Workshop
    collection = db.Users
    for user_email in users_by_email:
        user = collection.find_one({"email": user_email})
        if not user:
            print("User does not exist:", user_email)
            return user_email
    print("All users are valid")
    return True

def validate_group(group_id):
    db = conenct_to_db().Workshop
    collection = db.Groups
    group = collection.find_one({"_id": group_id})
    if group:
        print("Group exists:", group_id)
        return True
    else:
        print("Group does not exist:", group_id)
        return False

def update_user_groups_for_group_creation_or_update(users_by_email, group_id):
    db = conenct_to_db().Workshop
    collection = db.Users
    for user_email in users_by_email:
        collection.update_one({"email": user_email}, {"$push": {"groups": group_id}})
        print("Updated user:", user_email, "with group:", group_id)

def delete_users_from_group(group_id, users_by_email):
    db = conenct_to_db().Workshop
    collection = db.Users
    for user_email in users_by_email:
        collection.update_one({"email": user_email}, {"$pull": {"groups": group_id}})
        print("Deleted user:", user_email, "from group:", group_id)

def delete_group(group_id):
    db = conenct_to_db().Workshop
    collection = db.Groups
    collection.delete_one({"_id": group_id})
    print("Deleted group:", group_id)

def get_groups_from_user_email(user_email): #returns an array with touples of group name and id for a specific user
    group_touples = []
    db = conenct_to_db().Workshop
    users_collection = db.Users
    groups_collection = db.Groups
    groups = users_collection.find_one({"email": user_email}).get("groups")
    for group_id in groups:
        group = groups_collection.find_one({"_id": group_id})
        group_touples.append((group.get("group_name"), group_id))
    print("Retrieved groups for user:", user_email)
    return group_touples

def get_users_names_from_group_id(group_id): #returns an array with user full names from a specific group
    users_full_names = []
    db = conenct_to_db().Workshop
    users_collection = db.Users
    groups_collection = db.Groups
    group = groups_collection.find_one({"_id": group_id})
    users_email_array = group.get("users")
    for user_email in users_email_array:
        user = users_collection.find_one({"email": user_email})
        users_full_names.append(user.get("first_name") + " " + user.get("last_name"))
    print("Retrieved user names from group:", group_id)
    return users_full_names

def get_user_emails_from_group_id(group_id): #returns an array with user emails from a specific group
    db = conenct_to_db().Workshop
    groups_collection = db.Groups
    group = groups_collection.find_one({"_id": group_id})
    user_emails = group.get("users")
    print("Retrieved user emails from group:", group_id)
    return user_emails

def get_users_cred(user_emails): #returns an array with touples of user email and user credentials
    db = conenct_to_db().Workshop
    collection = db.Users
    res = []
    for email in user_emails:
        user = collection.find_one({"email": email})
        user_creds = dic_to_cred(user.get("cred"))
        if is_cred_expierd(user_creds):
            print("Refreshing token for user:", email)
            refresh_cred(user_creds)
            collection.update_one({"email": email}, {"$set": {"cred": credentials_to_dict(user_creds)}})
        res.append((email, user_creds))
    print("Retrieved token for users")
    return res

def update_user_cred(user_email, cred):
    db = conenct_to_db().Workshop
    collection = db.Users
    collection.update_one({"email": user_email}, {"$set": {"cred": cred}})
    print("Updated token for user:", user_email)

def get_users_availability(user_emails):
    db = conenct_to_db().Workshop
    collection = db.Users
    availabilities = []
    for user in user_emails:
        user = collection.find_one({"email": user})
        availabilities.append(user.get("availability"))
    print("Retrieved availability for users:", user_emails)
    return availabilities

def update_user_availability(user_email, availability):
    db = conenct_to_db().Workshop
    collection = db.Users
    collection.update_one({"email": user_email}, {"$set": {"availability": availability}})
    print("Updated availability for user:", user_email)
    return True

def get_user(user_email):
    db = conenct_to_db().Workshop
    collection = db.Users
    user = collection.find_one({"email": user_email})
    print("Retrieved user:", user_email)
    return user