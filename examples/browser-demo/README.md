# Permissio.io Browser Demo

Interactive browser-based demo application for testing and demonstrating the Permissio.io Node.js SDK.

## Features

- **Permission Check**: Test if users have access to perform actions on resources
- **Users Management**: Create, list, and manage users
- **Roles Management**: Create and configure roles with permissions
- **Tenants Management**: Multi-tenancy support with tenant creation
- **Resources Management**: Define resource types with actions
- **Role Assignments**: Assign roles to users within tenants

## Prerequisites

1. Make sure the Permissio.io backend is running (default: `http://localhost:3001`)
2. Have an API key ready (format: `permis_key_xxxxxxxx...`)
3. Know your Project ID and Environment ID

## Getting Started

### 1. Install Dependencies

```bash
# From the browser-demo directory
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

This will open the demo app in your browser at `http://localhost:3000`.

### 3. Configure the SDK

1. Enter your API URL (e.g., `http://localhost:3001`)
2. Enter your API Key
3. Enter your Project ID and Environment ID
4. Click "Initialize SDK"

### 4. Start Testing!

Use the tabs to navigate between different features:

- **Permission Check**: Test authorization decisions
- **Users**: Manage user entities
- **Roles**: Create and configure roles
- **Tenants**: Multi-tenancy management
- **Resources**: Define resource types
- **Role Assignments**: Assign roles to users

## Example Workflow

### 1. Create a Resource Type

```
Resource Key: document
Name: Document
Actions: read, write, delete, share
```

### 2. Create a Role

```
Role Key: editor
Name: Editor
Permissions: document:read, document:write
```

### 3. Create a User

```
User Key: john@example.com
Email: john@example.com
First Name: John
Last Name: Doe
```

### 4. Create a Tenant

```
Tenant Key: acme-corp
Name: Acme Corporation
```

### 5. Assign Role to User

```
User: john@example.com
Role: editor
Tenant: acme-corp
```

### 6. Check Permission

```
User: john@example.com
Action: read
Resource: document
Tenant: acme-corp
```

Expected result: **ALLOWED** ✓

## Console Log

The demo includes a console log at the bottom that shows all SDK operations and their results. This is helpful for debugging and understanding the SDK behavior.

## Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
browser-demo/
├── index.html          # Main HTML file
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── src/
    ├── main.ts         # Main application code
    └── styles.css      # Application styles
```

## Tips

- Use the Console Log to track all operations
- The SDK is initialized with `debug: true` for verbose logging
- All results are displayed in JSON format for easy inspection
- Forms automatically hide after successful operations

## Troubleshooting

### CORS Issues

If you encounter CORS errors, make sure your backend is configured to allow requests from `http://localhost:3000`.

### Connection Errors

Verify that:
1. The backend is running
2. The API URL is correct
3. Your API key is valid
4. Project ID and Environment ID exist

### Permission Denied

If permission checks return "denied" unexpectedly:
1. Verify the user exists
2. Check that roles are properly assigned
3. Ensure the role has the correct permissions
4. Verify tenant context if using multi-tenancy
