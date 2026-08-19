CREATE TABLE `booking_recipients` (
	`booking_id` integer NOT NULL,
	`employee_id` text NOT NULL,
	PRIMARY KEY(`booking_id`, `employee_id`)
);
