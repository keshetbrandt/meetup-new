# **MeetUp**

MeetUp is a meeting scheduling application designed to simplify group availability management, conflict resolution, and meeting confirmation. It integrates **Google Apps Script** for the frontend and **Flask with MongoDB** for backend processing, providing an efficient system for scheduling group meetings while integrating seamlessly with **Google Calendar**.

---

## **Table of Contents**
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Security](#security)
- [Scalability and Performance](#scalability-and-performance)


---

## **Features**
- **Group Scheduling**: Manage group availability, propose meeting times, and automatically resolve conflicts.
- **Google Calendar Integration**: Automatically schedules meetings and synchronizes them with Google Calendar.
- **Time Zone Handling**: Supports scheduling across multiple time zones.
- **OAuth2 Authentication**: Secure login via Google, ensuring user data privacy and protection.
- **Real-Time Conflict Resolution**: Quickly finds optimal meeting times based on participant availability.
- **Flexible Notifications**: Confirms meetings and sends reminders via calendar notifications.

---

## **Technologies Used**
- **Frontend**: Google Apps Script (JavaScript)
- **Backend**: Flask (Python), MongoDB, Google Calendar API
- **Authentication**: OAuth2 for secure access to Google Calendar
- **Database**: MongoDB (NoSQL) for storing user, group, and meeting data

---

## **Installation**

---

## **Usage**

### **Scheduling a Meeting**
1. **Scheduling a Meeting**: choose participants and preffered time frame for the meeting
2. **Set Availability**: Users enter their available time slots.
3. **Resolve Conflicts**: The system automatically suggests the best meeting times.
4. **Confirm the Meeting**: The final meeting time is confirmed and synced to Google Calendar.

---

## **Security**
- **OAuth2 Authentication**: Secure login and authorization via Google services.
- **Token Security**: Access tokens are securely stored and rotated for enhanced protection.
- **HTTPS Encryption**: All communication between the app and external APIs is encrypted to prevent data leaks.
- **Granular Permissions**: The app requests only the necessary permissions to access the Google Calendar, ensuring privacy.

---

## **Scalability and Performance**
- **MongoDB** allows horizontal scaling to handle increasing data loads as users and meetings grow.
- **Asynchronous API Requests** ensure that the app remains responsive even during peak usage.
- **Optimized Scheduling Algorithm** runs in **O(n log n)** time complexity, ensuring efficient performance even with large groups.


