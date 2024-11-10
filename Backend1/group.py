import mongoDB_API

class group:
    def __init__(self, group_name,group_description,  users):
        self.group_name = group_name
        self.group_description = group_description
        self.users = users
        self.group_id = None

    def to_dict(self):
        return {"group_name": self.group_name, "group_description": self.group_description, "users": self.users}


def create_group(group_name, group_description, users):
    validation = mongoDB_API.validate_users(users)
    if validation != True:
        return "Failed! The following user does not exist: " + validation
    new_group = group(group_name, group_description, users)
    inserted_object = mongoDB_API.add_group(new_group)
    new_group.group_id = inserted_object.inserted_id
    mongoDB_API.update_user_groups_for_group_creation_or_update(users, new_group.group_id)
    return "Success! The group has been created."  

def add_new_users_for_existing_group(group_id, users):
    validation = mongoDB_API.validate_users(users)
    if validation != True:
        return "Failed! The following user does not exist: " + validation
    mongoDB_API.update_user_groups_for_group_creation_or_update(users, group_id)
    return "Success! The users have been added to the group."

def delete_group(group_id):
    if not mongoDB_API.validate_group(group_id):
        return "Failed! The group does not exist."
    users = mongoDB_API.get_user_emails_from_group_id(group_id)
    delete_users_from_group(group_id, users)
    delete_group(group_id)
    return "Success! The group has been deleted."

def delete_users_from_group(group_id, users):
    if not mongoDB_API.validate_group(group_id):
        return "Failed! The group does not exist."
    validation = mongoDB_API.validate_users(users)
    if validation != True:
        return "Failed! The following user does not exist: " + validation
    delete_users_from_group(group_id, users)
    return "Success! The users have been deleted from the group."

    
