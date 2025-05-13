# Identity Matching Client

This is an Angular 19 client for the the [Identity Matching Server RI.](https://github.com/HL7-FAST/identity-matching)

## Foundry

A live demo is hosted by [HL7 FHIR Foundry](https://foundry.hl7.org/products/25085a28-345a-48b9-9b5c-4d3b857b5d5a), where you may also download curated configurations to run yourself.

## Running locally

1. Install [Node.js](https://nodejs.org) (tested with v22)
2. Clone the repository

    ```sh
    git clone https://github.com/HL7-FAST/identity-matching-ui/
    ```

3. Install node-modules:

    ```sh
    npm ci
    ```

4. Run the application

    ```sh
    npm start
    ```

5. The application is now running on <http://localhost:4200>

## Running in Docker

1. Install [Docker](https://docs.docker.com/get-docker/)
2. Clone the repository

    ```sh
    git clone https://github.com/HL7-FAST/identity-matching-ui/
    ```

3. Use Docker Compose or build and run the Docker image

### Using Docker Compose

1. Build and run:

    ```sh
    docker compose up
    ```

    or detached:

    ```sh
    docker compose up -d
    ```

### Building and running Docker image

1. Build the identity-matching-ui image:

    ```sh
    docker build -t identity-matching-ui
    ```

2. Run identity-matching-ui in Docker:

    ```sh
    docker run -p 80:80 identity-matching-ui
    ```

    or detached:

    ```sh
    docker run -dp 80:80 identity-matching-ui
    ```

3. The application is now running on <http://localhost>

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

This built version can then be served using `npm run serve`.

## Clients

This application allows you to connect to different FHIR servers through distinct clients.  These clients are stored in the SQLite database and can be created with different requested scopes and grant types.  By default when running locally the application will attempt to register two clients for use with the default FHIR base server of <http://localhost:8080/fhir> for both authorization code and client credentials flows.

Default clients can be specified by creating client configurations in the `defaultClients` property of the corresponding environment configuration file. Minimal configurations are available in the default and production configurations for reference.

The following properties are available to configure:

| Property | Default Value | Description |
|----------|---------------|-------------|
| `fhirServer` | (required) | The base URL of the FHIR server to connect to. |
| `grantTypes` | (required) | Array of grant type(s) to use for the client. For example: `['client_credentials']` or `['authorization_code']` |
| `clientName` | `Identity Matching Client` | Human readable name of the client. |
| `issuer` | Base app URL (e.g., `http://localhost:4200/`) | Used during client registration for the `iss` and `sub` claims in the UDAP software statement. |
| `contacts` | `['mailto:tester@localhost']` | Array of email addresses for client registration. |
| `logoUri` | `https://build.fhir.org/icon-fhir-16.png` | URL to a logo for the client. |
| `scopes` | `['openid']` or `['system/*read']` | Array of scopes to request for the client. Defaults to `['openid']` when `grantTypes` includes `authorization_code` and `['system/*read']` otherwise. |
| `redirectUris` | Base app URL + `/api/auth/callback` | Array of redirect URIs allowed by the client used during authorization code flow. |
| `certificate` | Generated if not provided | String with an encoded PKCS12/PFX certificate (`MII...`) to use for this client. |
| `certificatePass` | `udap-test` | Plain text password for the certificate. |
| `certGenerationProvider` | `Local` | String set to either `Local` or `FhirLabs`. If a certificate is not provided, this specifies which CA to use when generating a new certificate. `Local` uses the [test FAST CA](https://udap-security.fast.hl7.org/certs/FastCA/) from the [FAST Security Server](https://udap-security.fast.hl7.org/). `FhirLabs` generates a certificate from [FhirLabs UdapEd](https://udaped.fhirlabs.net/). |

## Configuration

There are multiple ways to configure the application.  The application uses [node-config](https://github.com/node-config/node-config) to manage configuration.

The following properties are available to configure:

| Property | Default Value | Description |
|----------|---------------|-------------|
| `env` | `development` | The Node application environment (such as `development` or `production`). |
| `port` | `4200` | Port the web app server listens on. |
| `appUrl` | `http://localhost:4200` | Base URL for the web app. |
| `defaultFhirBaseUrl` | `http://localhost:8080/fhir` | Base FHIR endpoint to use when no client is actively selected. |
| `defaultCertPass` | `udap-test` | Password to use for generated certificates. |
| `authSecret` | `secret_key_that_should_be_changed` | Secret key used for session cookie signing and certificate database password encryption.  A secret can be generated using a command such as `openssl rand -base64 32` |
| `database.url` | `file:db.sqlite` | URL to be used for the SQLite database that stores clients and sessions. |
| `defaultClients` | See above | Array of default client configurations. See details in above clients section. |
| `certGenerationEndpoint` | `https://localhost:5001/api/cert/generate` | Endpoint for certificate generation requests.  This should be an instance of the [FAST Security Server](https://github.com/HL7-FAST/udap) such as the Foundry hosted instance of this endpoint at <https://udap-security.fast.hl7.org/api/cert/generate> |

### Configuration files

Full configuration files are stored in the `config` directory and are evaluated in the order detailed in the documentation here: [File Load Order](https://github.com/node-config/node-config/wiki/Configuration-Files#file-load-order).

If running the application locally, the easiest way to configure the application is to create a `local.json` file in the `config` directory.  This file will override any settings in the default configuration files regardless of the environment.  See the `config/default.json` file for the default settings and how this can be structured.

### Environment variables

Environment variables can also override settings from the configuration files.  A `.env` file can be used to set these variables.  An example of such a file is provided in the root directory in the `.env.example` file.

The environment variables that can be set are:

| Environment Variable | Default Value | Description |
|----------------------|---------------|-------------|
| NODE_ENV | `development` | Node environment variable.  Impacts which configuration file is used. |
| PORT | `4200` | Port the web app server listens on |
| APP_URL | `http://localhost:4200` | Base URL for the web app. |
| DEFAULT_FHIR_BASE_URL | <http://localhost:8080/fhir> | Base FHIR endpoint to use when no client is actively selected |
| DEFAULT_CERT_PASS | `udap-test` | Password to use for generated certificates |
| AUTH_SECRET | `secret_key_that_should_be_changed` |  |
| DATABASE_URL | `file:db.sqlite` | URL to be used for the SQLite database that stores clients and sessions.  See the [Drizzle SQLite libsql documentation](https://orm.drizzle.team/docs/get-started-sqlite#libsql) for more information. |
