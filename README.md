# Locstream Backend

Locstream Backend is a scalable server-side application built with [NestJS](https://nestjs.com/) and TypeScript. It provides core APIs and real-time features for location streaming, user management, authentication, and asset handling. The backend is designed for extensibility and security, leveraging PostgreSQL, TypeORM, JWT authentication, and WebSockets.

## Features

- User authentication and authorization (JWT)
- Admin and privileged user roles
- Asset management (CRUD)
- Real-time location sharing via WebSockets
- PostgreSQL database integration (TypeORM)
- Cloudinary integration for asset storage
- Modular architecture for easy feature extension
- Centralized exception handling and validation

## Technologies Used

- [NestJS](https://nestjs.com/) (TypeScript)
- [TypeORM](https://typeorm.io/) (PostgreSQL)
- [Socket.IO](https://socket.io/) (WebSockets)
- [Cloudinary](https://cloudinary.com/) (Asset storage)
- [JWT](https://jwt.io/) (Authentication)
- [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) (Code quality)
- [Jest](https://jestjs.io/) (Testing)

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/bilalmbaka/locstream.git
cd locstream/locstream-backend
npm install
```

### Compilation & Running

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

### Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Deployment

Build the project for production:

```bash
npm run build
```

Deploy using your preferred cloud provider or containerization platform. For more details, see [NestJS deployment docs](https://docs.nestjs.com/deployment).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request. For major changes, open an issue first to discuss what you would like to change.

## License

This project is open source and may be cloned, used, and modified by anyone for any purpose. No restrictions are imposed on usage or modification.
