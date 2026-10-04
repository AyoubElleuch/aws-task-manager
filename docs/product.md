# Product scope

AWS Task Manager is a serverless task manager for individual use. The first version lets a person organize tasks by project and keep their work across sessions.

## Core journey

1. Sign up with email and password, verify the email, choose a unique username and full name, and sign in.
2. Create a project and add tasks with titles.
3. Edit, complete, reopen, or delete tasks; rename or delete projects.
4. Return later and find the same projects and tasks.

## First version

- **Account:** Sign in and out; each person's data is private.
- **Projects:** List, create, rename, and delete projects. Confirm deletion when it will also remove tasks.
- **Tasks:** Add, edit, complete, reopen, and delete tasks. A title is required.
- **Experience:** Work on desktop and mobile, with clear empty states and errors and keyboard access.
- **Delivery:** Deploy on AWS with infrastructure as code and passing CI checks.

## Later

The app may later support collaboration between multiple people, including shared projects, task assignment, and roles. Due dates, priorities, descriptions, reminders, recurring tasks, attachments, and reporting are also outside the first version.
