# GPT Interactions API Documentation

## Base URL

All Motion API endpoints are prefixed with `/motion`

## Rate Limiting

- Motion endpoints have a specific rate limiter
- All other routes have a general rate limiter

## Health Check

- `GET /` - Check API health status

## Task Endpoints

### Get All Tasks

- **Method:** GET
- **Endpoint:** `/motion/tasks`
- **Response:** Array of task objects
- **Error Codes:** 500

### Create Task

- **Method:** POST
- **Endpoint:** `/motion/tasks`
- **Body Parameters:**
  - `title` (required): string
  - `description` (optional): string
  - `dueDate` (optional): ISO date string
  - `assignees` (optional): array of user IDs
- **Response:** Created task object
- **Error Codes:** 500

### Get Task by ID

- **Method:** GET
- **Endpoint:** `/motion/tasks/:taskId`
- **URL Parameters:**
  - `taskId`: string
- **Response:** Task object
- **Error Codes:** 404, 500

### Update Task

- **Method:** PATCH
- **Endpoint:** `/motion/tasks/:taskId`
- **URL Parameters:**
  - `taskId`: string
- **Body Parameters:**
  - `title` (optional): string
  - `description` (optional): string
  - `status` (optional): string
  - `dueDate` (optional): ISO date string
- **Response:** Updated task object
- **Error Codes:** 404, 500

### Delete Task

- **Method:** DELETE
- **Endpoint:** `/motion/tasks/:taskId`
- **URL Parameters:**
  - `taskId`: string
- **Response:** Success message
- **Error Codes:** 404, 500

### Unassign All Users from Task

- **Method:** DELETE
- **Endpoint:** `/motion/tasks/:taskId/unassign`
- **URL Parameters:**
  - `taskId`: string
- **Response:** Updated task object
- **Error Codes:** 404, 500

## Recurring Task Endpoints

### Get All Recurring Tasks

- **Method:** GET
- **Endpoint:** `/motion/recurring-tasks`
- **Response:** Array of recurring task objects
- **Error Codes:** 500

### Create Recurring Task

- **Method:** POST
- **Endpoint:** `/motion/recurring-tasks`
- **Body Parameters:**
  - `title` (required): string
  - `description` (optional): string
  - `recurrence` (required): object
- **Response:** Created recurring task object
- **Error Codes:** 500

### Delete Recurring Task

- **Method:** DELETE
- **Endpoint:** `/motion/recurring-tasks/:taskId`
- **URL Parameters:**
  - `taskId`: string
- **Response:** Success message
- **Error Codes:** 404, 500

## Comment Endpoints

### Get All Comments

- **Method:** GET
- **Endpoint:** `/motion/comments`
- **Response:** Array of comment objects
- **Error Codes:** 500

### Create Comment

- **Method:** POST
- **Endpoint:** `/motion/comments`
- **Body Parameters:**
  - `content` (required): string
  - `taskId` (required): string
- **Response:** Created comment object
- **Error Codes:** 404, 500

## Project Endpoints

### Get All Projects

- **Method:** GET
- **Endpoint:** `/motion/projects`
- **Response:** Array of project objects
- **Error Codes:** 500

### Get Project by ID

- **Method:** GET
- **Endpoint:** `/motion/projects/:projectId`
- **URL Parameters:**
  - `projectId`: string
- **Response:** Project object
- **Error Codes:** 404, 500

### Create Project

- **Method:** POST
- **Endpoint:** `/motion/projects`
- **Body Parameters:**
  - `name` (required): string
  - `description` (optional): string
- **Response:** Created project object
- **Error Codes:** 500

## User Endpoints

### Get All Users

- **Method:** GET
- **Endpoint:** `/motion/users`
- **Response:** Array of user objects
- **Error Codes:** 500

### Get Current User

- **Method:** GET
- **Endpoint:** `/motion/users/me`
- **Response:** Current user object
- **Error Codes:** 401, 500

## Schedule Endpoints

### Get All Schedules

- **Method:** GET
- **Endpoint:** `/motion/schedules`
- **Response:** Array of schedule objects
- **Error Codes:** 500

## Data Types

### Task Object

```typescript
{
  id: string;
  title: string;
  description?: string;
  status?: string;
  dueDate?: string;
  assignees?: string[];
}
```

### Recurring Task Object

```typescript
{
  id: string;
  title: string;
  description?: string;
  recurrence: object;
}
```

### Comment Object

```typescript
{
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
}
```

### Project Object

```typescript
{
  id: string;
  name: string;
  description?: string;
  status: string;
}
```

### User Object

```typescript
{
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
```

### Schedule Object

```typescript
{
  id: string;
  userId: string;
  availability: object;
  preferences: object;
}
```
