# Book Review API

A RESTful API for a Book Review System built with Node.js, Express, and MongoDB.

## Features

- User authentication using JWT
- CRUD operations for books
- Review and rating system
- Search functionality
- Pagination support
- Input validation

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Express Validator for input validation
- Bcrypt for password hashing


## Environment Variables

Create a `.env` file in the root directory with the following variables:

env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```


## Setup Instructions

1. Clone the repository
2. Install dependencies:
   
   cd Backend
   npm install
   
3. Create `.env` file with required environment variables
4. Start the server:
  
   npm run dev  
  
USE Postman

## API Endpoints

### Authentication

#### Register a new user
note: you can customize you port using .env
POST http://localhost:3000
                           /api/auth/signup
Content-Type: application/json

{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
}


#### Login
http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}


### Books

#### Create a new book (Authenticated)
Note: for token you can copy from postman under success: true there will a optio of token just copy the token
http
POST /api/books
Authorization: Bearer <your_token>
Content-Type: application/json

{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Classic Fiction",
    "description": "A story of decadence and excess...",
    "publishedYear": 1925
}


#### Get all books (with pagination)
http
GET /api/books?page=1&limit=10
```

#### Get book by ID (with reviews)
http
GET /api/books/:id


#### Search books
http
GET /api/books/search?q=Gatsby


### Reviews

#### Add a review (Authenticated)
http
POST /api/reviews/:bookId
Authorization: Bearer <your_token>
Content-Type: application/json

{
    "rating": 5,
    "comment": "An excellent read!"
}


#### Update a review (Authenticated)
http
PUT /api/reviews/:id
Authorization: Bearer <your_token>
Content-Type: application/json

{
    "rating": 4,
    "comment": "Updated review content"
}


#### Delete a review (Authenticated)

DELETE /api/reviews/:id
Authorization: Bearer <your_token>


## Pagination

Most endpoints that return lists support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Example:
http
GET /api/books?page=2&limit=20


## Error Handling

The API returns consistent error responses:

json
{
    "success": false,
    "message": "Error message here",
    "error": "Detailed error information (in development)"
}


## Design Decisions

1. **Authentication**
   - JWT used for stateless authentication
   - Tokens expire in 24 hours
   - Passwords are hashed using bcrypt

2. **Database**
   - MongoDB chosen for flexibility and scalability
   - Indexes on frequently queried fields
   - Compound index on user and book for reviews (one review per user per book)

3. **Search**
   - Case-insensitive search on title and author
   - Partial matching supported
   - Results are paginated

4. **Reviews**
   - Users can only review a book once
   - Users can only edit/delete their own reviews
   - Average rating and review count updated automatically

## Testing in Postman

1. Import the collection into Postman
2. Create an environment and set:
   - `baseUrl`: `http://localhost:3000`
   - `token`: (after login/signup)

3. Test flow:
   - Register a user
   - Login to get token
   - Create a book
   - Add a review
   - Search for books
   - Update/delete review

## Database Schema

### User Model
javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}
```

### Book Model
javascript
{
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  description: { type: String, required: true },
  publishedYear: { type: Number },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
}


### Review Model
javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  book: { type: ObjectId, ref: 'Book', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}

