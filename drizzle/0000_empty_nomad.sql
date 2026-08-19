CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` integer NOT NULL,
	`date` text NOT NULL,
	`start` real NOT NULL,
	`end` real NOT NULL,
	`employee_id` text NOT NULL,
	`created_by` text NOT NULL,
	`guest_visit` integer DEFAULT false NOT NULL,
	`guest_message` text,
	`notification_status` text DEFAULT 'not_required' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`phone` text NOT NULL,
	`location` text DEFAULT 'IT Office' NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`alias` text NOT NULL,
	`department` text NOT NULL,
	`role` text DEFAULT 'employee' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `employees_email_unique` ON `employees` (`email`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text DEFAULT 'Main Office' NOT NULL,
	`display_label` text DEFAULT 'Available to book' NOT NULL,
	`room_phone` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`reason` text,
	`access` text DEFAULT 'all' NOT NULL,
	`allowed_employee_id` text,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_name_unique` ON `rooms` (`name`);