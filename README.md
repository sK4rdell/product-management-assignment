# Product Catalog Event System

## Overview

A scalable event-driven system for managing product catalogs with real-time updates. Built using TypeScript, Express.js, PostgreSQL, and Apache Kafka for event streaming.

## Architecture

### Core Components

- **REST API** ([backend/src/index.ts](backend/src/index.ts))

  - Express.js application exposing REST endpoints for product and category management
  - Structured routing with validation middleware
  - Error handling and response standardization

- **Database Layer** ([backend/src/db.ts](backend/src/db.ts))

  - PostgreSQL database for persistent storage
  - Transaction support for data consistency
  - Structured schema with relations between products, categories, and inventory

- **Event System** ([backend/src/events/kafka.ts](backend/src/events/kafka.ts))
  - Kafka for reliable event streaming
  - Schema Registry for maintaining event schema compatibility
  - Event types: product created, updated, deleted

### Key Features

1. **Product Management**

   - CRUD operations for products
   - Inventory tracking
   - Category association
   - Price management
   - Product dimensions and specifications

2. **Category System**

   - Hierarchical product categorization
   - Category metadata management
   - Referential integrity protection

3. **Discount Management**
   - Time-based discount scheduling
   - Percentage-based price reductions
   - Active/upcoming/expired discount tracking

### Data Flow

1. Client makes HTTP request to REST API
2. Request validated through middleware
3. Business logic processed in service layer
4. Database transaction executed
5. Event published to Kafka on successful operation
6. Response returned to client

### Technical Stack

- **Backend**: TypeScript + Express.js
- **Database**: PostgreSQL
- **Event Streaming**: Apache Kafka
- **Schema Registry**: Confluent Schema Registry
- **Testing**: Jest
- **API Validation**: Zod
- **Docker** for containerization

## Getting Started

in `/backend`

```sh
# Start infrastructure
docker-compose up -d

# Install dependencies
yarn install

# Run migrations
yarn run migration:up

# Start development server
yarn dev
```

## API Endpoints

### Products

- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product details
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories

- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/categories/:id` - Get category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Discounts

- `GET /api/products/:id/discounts` - List product discounts
- `POST /api/products/:id/discounts` - Create discount
- `PATCH /api/products/:id/discounts/:discountId` - Update discount
- `DELETE /api/products/:id/discounts/:discountId` - Delete discount

## Testing

```sh
# Run all tests
yarn test
```

## Schema Management

The project uses Avro schemas for event serialization, located in [schemas/](schemas/):

- Product events
- Category events _(not implemented)_
- Discount events _(not implemented)_

## Kafka-UI

Kafka-UI is a web-based tool for managing and monitoring Kafka clusters. It provides an intuitive interface for viewing topics, consumer groups, and messages.

### Accessing Kafka-UI

1. Ensure Kafka and Kafka-UI are running:

   ```sh
   docker-compose up -d
   ```

2. Open your browser and navigate to `http://localhost:8080` to access Kafka-UI.

### Features

- **Topic Management**: Create, delete, and view topics.
- **Consumer Groups**: Monitor consumer group offsets and lag.
- **Message Browsing**: View messages in real-time, filter by key or value.
- **Schema Registry**: View and manage Avro schemas.

## Project Structure

```
backend/
├── src/
│   ├── api/           # REST API endpoints
│   ├── events/        # Kafka event handling
│   ├── middlewares/   # Express middlewares
│   ├── models/        # Data models
│   └── db.ts         # Database configuration
├── migrations/        # Database migrations
├── tests/            # Test suites
└── schemas/          # Avro event schemas
```

This architecture emphasizes:

- Separation of concerns
- Type safety
- Event-driven design
- Scalability
- Testability
- Data consistency
