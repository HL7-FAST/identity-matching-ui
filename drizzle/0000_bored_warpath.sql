CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`fhirBaseUrl` text NOT NULL,
	`clientId` text NOT NULL,
	`grantTypes` text NOT NULL,
	`scopesRequested` text NOT NULL,
	`scopesGranted` text NOT NULL,
	`redirectUris` text,
	`authorizationEndpoint` text,
	`userinfoEndpoint` text,
	`tokenEndpoint` text NOT NULL,
	`revocationEndpoint` text,
	`certificate` text NOT NULL,
	`certificatePass` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`lastUsedAt` text
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` text PRIMARY KEY NOT NULL,
	`expired` text NOT NULL,
	`sess` text NOT NULL
);
