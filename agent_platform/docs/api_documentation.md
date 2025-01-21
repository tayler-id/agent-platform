# API Documentation

## Authentication

### Login
`POST /token`

Request body:
```json
{
  "username": "string",
  "password": "string",
  "totp_code": "string" // Optional for 2FA
}
```

Response:
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

### 2FA Endpoints

#### Generate 2FA Secret
`POST /2fa/generate-secret`

Request body:
```json
{
  "username": "string"
}
```

Response:
```json
{
  "secret": "string", // Base32 encoded secret
  "qr_code_url": "string" // URL for QR code generation
}
```

#### Enable 2FA
`POST /2fa/enable`

Request body:
```json
{
  "username": "string",
  "code": "string" // 6-digit TOTP code
}
```

Response:
```json
{
  "message": "string",
  "success": "boolean"
}
```

#### Verify 2FA Code
`POST /2fa/verify`

Request body:
```json
{
  "username": "string",
  "code": "string" // 6-digit TOTP code
}
```

Response:
```json
{
  "valid": "boolean"
}
```

#### Disable 2FA
`POST /2fa/disable`

Request body:
```json
{
  "username": "string"
}
```

Response:
```json
{
  "message": "string",
  "success": "boolean"
}
```

## User Management

### Create User
`POST /users`

Request body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "username": "string",
  "email": "string",
  "id": "string"
}
```

### Update User
`PUT /users/{user_id}`

Request body:
```json
{
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "username": "string",
  "email": "string",
  "id": "string"
}
```

### Delete User
`DELETE /users/{user_id}`

Response:
```json
{
  "message": "string",
  "success": "boolean"
}
