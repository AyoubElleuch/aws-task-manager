# Product scope

AWS Task Manager is a small app for organizing your own work. Each user has their own projects, and there is no sharing between users yet.

The structure is: projects -> milestones -> tasks.

## Using the app

1. Sign up with your email and password, then confirm your email with the code.
2. Sign in and open the projects page.
3. Create a project and open it to add milestones.
4. View the tasks inside each milestone. Click a milestone or task name to rename it.
5. Come back later and load your saved data again.

You can also rename or delete projects. Project deletion has a confirmation dialog and removes the project's milestones and tasks. Deleting a milestone also removes its tasks.

## What is available

- Accounts: sign up, email confirmation, sign in, sign out, and password reset.
- Projects: list, create, open, rename, and delete.
- Milestones: list, create, rename, and delete inside a project.
- Tasks: list, rename, and delete inside a milestone.
- Task creation through the API. There is no creation form in the app yet.
- Saved data in DynamoDB, with project ownership checks in the API.

## Still to do

- Add a task creation form.
- Add task completion and reopening.
- Improve task loading and error messages. Task errors currently go to the browser console.
- Improve keyboard access for inline editing and check the layout on mobile.

## Maybe later

Shared projects, task assignments, due dates, priorities, and reminders could be added later. For now, I'm keeping the app focused on individual use.
