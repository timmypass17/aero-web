# Aero

A full-stack cycling platform that allows cyclists to upload, discover, and share cycling routes, as well as create posts about their recent rides.

Routes are visualized on an interactive map using **MapLibre**, while **PostGIS** is used for geospatial storage and queries such as finding cycling routes near a specific location.

## Features

### Cycling Routes

* Upload cycling routes using GPX files
* Store route geometry as geospatial data
* Display routes interactively on a map
* View route distance, duration, elevation gain, and difficulty
* Upload route thumbnail images
* Discover routes near a specific location
* Customize route colors for map visualization

### Ride Posts

* Create posts about recent cycling rides
* Attach an uploaded route or choose an existing nearby route
* Upload GPX data for a ride
* Display ride routes on an interactive map
* Record ride distance, duration, elevation gain, and start/end times
* Customize route visualization
* Share rides with the cycling community

### Authentication

* User registration
* User login and logout
* Session-based authentication
* Protected application routes
* Account-specific route and post operations

### Community Features

* View cycling posts
* Comment on posts
* Like posts
* Share cycling activity with other users

### Route Discovery

* Find routes near a selected location
* Use PostGIS spatial queries to search within a specified radius
* Display nearby routes on the map alongside the user's selected route

## Tech Stack

### Frontend

* **TypeScript**
* **React**
* **Vite**
* **React Router**
* **MapLibre GL JS**

### Backend

* **Java**
* **Spring Boot**
* **Spring Security**
* **Spring Data / JDBC**
* **PostgreSQL**
* **PostGIS**

### Storage

* **PostgreSQL** for application data
* **PostGIS** for geospatial route data and spatial queries
* **Amazon S3** for uploaded images

### Testing

* **JUnit**
* **Mockito**

## Frontend

The frontend is built with **React and TypeScript**.

The application uses React Router for navigation and separates authenticated application pages from public pages.

Map-related functionality is implemented using **MapLibre GL JS**, allowing cycling routes to be displayed directly on an interactive map.

The frontend communicates with the Spring Boot backend through REST API requests.

### Frontend Responsibilities

* Rendering the user interface
* Authentication state and protected routes
* Route creation and upload forms
* Ride post creation
* GPX file handling
* Map rendering and route visualization
* Displaying nearby cycling routes
* Sending API requests to the backend

## Backend

The backend is built using **Java and Spring Boot**.

The backend exposes REST endpoints used by the React frontend and contains the application's business logic.

The backend is organized into separate responsibilities such as:

```text
Controller
    |
    v
Service
    |
    v
Repository
    |
    v
PostgreSQL / PostGIS
```

### Backend Responsibilities

* Authentication and authorization
* User management
* Route creation and retrieval
* GPX processing
* Ride post creation
* Comments and likes
* Business rule validation
* Geospatial route queries
* Database persistence
* Image upload integration with Amazon S3

## Authentication and Security

Aero uses **Spring Security** to protect authenticated functionality.

Authentication is session-based, with the backend maintaining the authenticated user's session.

Protected operations require an authenticated user before allowing actions such as creating routes or posts.

The frontend includes credentials with requests that require the user's authenticated session.

## PostgreSQL and PostGIS

Aero uses **PostgreSQL** as its primary database.

Route geometry is stored using **PostGIS** spatial types, allowing the application to perform geospatial queries directly within the database.

For example, nearby route searches can determine which routes are within a specified radius of a given geographic location.

Conceptually, the route data is stored as:

```text
Cycling Route
     |
     +-- Route metadata
     |
     +-- GPX data
     |
     +-- Route geometry
            |
            v
        PostGIS
```

This allows Aero to support location-based route discovery without having to retrieve every route and calculate distances in the application.

## Route Processing

Cycling routes are uploaded as GPX files.

The backend parses GPX track points and converts them into geographic route geometry.

The processed route can then be used for:

* Map visualization
* Distance calculations
* Elevation calculations
* Duration calculations
* Nearby route searches
* Persistent route storage

The route geometry is stored using the `LINESTRING` geometry type with geographic coordinates.

## MapLibre

**MapLibre GL JS** is used to visualize cycling routes on interactive maps.

The map can display:

* Uploaded cycling routes
* Nearby routes
* Route previews
* Route colors
* Route geometry

Route geometry retrieved from the backend is converted into map data and rendered on the map.

## Amazon S3

Uploaded images, such as route thumbnails, are stored in **Amazon S3** rather than directly in PostgreSQL.

The database stores the information necessary to identify the uploaded object, while the image itself is stored in the S3 bucket.

This separates application data from object storage and avoids storing large image files directly in the relational database.

## Testing

The backend uses **JUnit** and **Mockito** for automated testing.

Tests focus on business logic and backend behavior without requiring every test to communicate with a live database.

### Testing Technologies

* **JUnit** for writing and running tests
* **Mockito** for mocking dependencies

Mockito can be used to isolate service-layer logic from repositories and other external dependencies.

Example testing structure:

```text
Service Test
     |
     +-- Mock Repository
     |
     +-- Execute Service Method
     |
     +-- Verify Result / Behavior
```

## Running the Application

### Prerequisites

Install the following before running Aero:

* Node.js
* npm
* Java
* Maven
* PostgreSQL
* PostGIS
* AWS account with an S3 bucket

### Database Setup

Create a PostgreSQL database and enable the PostGIS extension.

The backend requires database connection configuration for PostgreSQL as well as the appropriate AWS S3 configuration.

Sensitive configuration values should be provided through environment variables or external configuration rather than committed to source control.

### Start the Backend

Navigate to the backend directory and start the Spring Boot application.

```bash
cd backend
mvn spring-boot:run
```

The backend will expose the REST API for the frontend.

### Start the Frontend

Navigate to the frontend directory and install the dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will then connect to the Spring Boot backend.

## Configuration

Aero requires configuration for:

* PostgreSQL connection
* PostgreSQL credentials
* AWS region
* AWS S3 bucket
* AWS credentials
* Backend/frontend connection settings

Do not commit secrets or private credentials to Git.

A recommended approach is to store sensitive configuration in environment variables or a local configuration file that is excluded from version control.

## API Overview

The Spring Boot backend provides REST endpoints for functionality such as:

```text
Authentication
    POST   /auth/signup
    POST   /auth/login
    POST   /auth/logout
    GET    /auth/me

Routes
    POST   /routes
    GET    /routes
    GET    /routes/{id}
    GET    /routes/nearby

Posts
    POST   /posts
    GET    /posts
    GET    /posts/{id}
```

The exact endpoints may change as the application continues to evolve.

## Key Technical Features

### Geospatial Queries

PostGIS allows Aero to perform spatial queries directly within PostgreSQL.

This is used to find routes within a specific radius of a geographic point.

```text
User Location
      |
      v
Longitude + Latitude
      |
      v
PostGIS Spatial Query
      |
      v
Nearby Cycling Routes
```

### GPX Route Processing

GPX files uploaded by users are parsed by the backend to extract route coordinates and other ride information.

The extracted coordinates are converted into geospatial route geometry that can be stored in PostGIS and rendered by MapLibre.

### Image Storage

Images are stored in Amazon S3, while the database maintains the corresponding object information needed by the application.

## Goals

Aero was built to demonstrate full-stack web development using a modern TypeScript/React frontend and Java/Spring backend.

The project focuses on:

* Full-stack application development
* REST API design
* Authentication and authorization
* Relational database design
* Geospatial data and queries
* GPX file processing
* Cloud object storage
* Automated backend testing
* Separation of frontend and backend responsibilities

## License

This project is for educational and development purposes.
