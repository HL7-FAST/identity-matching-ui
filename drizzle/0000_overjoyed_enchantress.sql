CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`grantType` text NOT NULL,
	`scopes` text NOT NULL,
	`certificate` text NOT NULL,
	`certificatePass` text,
	`currentToken` text,
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
