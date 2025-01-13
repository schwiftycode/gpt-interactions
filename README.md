# GPT Interactions API Documentation

## Base URL

All Motion API endpoints are prefixed with `/motion`

## Rate Limiting

- Motion endpoints have a specific rate limiter
- All other routes have a general rate limiter

## Authentication

All Motion API endpoints require a workspace ID to be provided as a query parameter.

## Task Endpoints

### Get All Tasks

- **Method:** GET
- **Endpoint:** `/motion/tasks`
- **Query Parameters:**
  - `workspaceId` (required): string - ID of the workspace to fetch tasks from
  - Additional query parameters are passed directly to the Motion API
- **Response:** Array of task objects with pagination metadata
- **Error Codes:** 400 (Missing workspaceId), 500

### Create Task

- **Method:** POST
- **Endpoint:** `/motion/tasks`
- **Query Parameters:**
  - `workspaceId` (required): string - ID of the workspace to create task in
- **Body Parameters:**
  - Any valid task fields supported by the Motion API
- **Response:** Created task object
- **Error Codes:** 400 (Missing workspaceId), 500

### Get Task by ID

- **Method:** GET
- **Endpoint:** `/motion/tasks/:taskId`
- **URL Parameters:**
  - `taskId`: string
- **Query Parameters:**
  - `workspaceId` (required): string - ID of the workspace the task belongs to
- **Response:** Task object
- **Error Codes:** 400 (Missing workspaceId), 404, 500

### Update Task

- **Method:** PATCH
- **Endpoint:** `/motion/tasks/:taskId`
- **URL Parameters:**
  - `taskId`: string
- **Query Parameters:**
  - `workspaceId` (required): string - ID of the workspace the task belongs to
- **Body Parameters:**
  - Any valid task fields that should be updated
- **Response:** Updated task object
- **Error Codes:** 400 (Missing workspaceId), 404, 500

### Delete Task

- **Method:** DELETE
- **Endpoint:** `/motion/tasks/:taskId`
- **URL Parameters:**
  - `taskId`: string
- **Query Parameters:**
  - `workspaceId` (required): string - ID of the workspace the task belongs to
- **Response:** Success message
- **Error Codes:** 400 (Missing workspaceId), 404, 500

## Project Endpoints

### Get All Projects

- **Method:** GET
- **Endpoint:** `/motion/projects`
- **Query Parameters:**
  - `workspaceId` (required): string - ID of the workspace to fetch projects from
- **Response:** Array of project objects
- **Error Codes:** 400 (Missing workspaceId), 500

### Create Project

- **Method:** POST
- **Endpoint:** `/motion/projects`
- **Query Parameters:**
  - `workspaceId` (required): string - ID of the workspace to create project in
- **Body Parameters:**
  - Any valid project fields supported by the Motion API
- **Response:** Created project object
- **Error Codes:** 400 (Missing workspaceId), 500

### Get Project by ID

- **Method:** GET
- **Endpoint:** `/motion/projects/:projectId`
- **URL Parameters:**
  - `projectId`: string
- **Query Parameters:**
  - `workspaceId` (required): string - ID of the workspace the project belongs to
- **Response:** Project object
- **Error Codes:** 400 (Missing workspaceId), 404, 500

## User Endpoints

### Get Current User

- **Method:** GET
- **Endpoint:** `/motion/users/me`
- **Query Parameters:**
  - `workspaceId` (required): string - ID of the workspace to get user info from
- **Response:** Current user object
- **Error Codes:** 400 (Missing workspaceId), 401, 500

## Implementation Notes

- All endpoints proxy requests to the Motion API (https://api.usemotion.com/v1)
- Requests require a valid Motion API key configured via environment variable
- Workspace ID is required for all operations
- Error responses include detailed messages from the Motion API when available
