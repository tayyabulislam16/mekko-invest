PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_portfolios` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`total_capital` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'PKR' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_portfolios`("id", "user_id", "name", "total_capital", "currency", "created_at") SELECT "id", "user_id", "name", "total_capital", "currency", "created_at" FROM `portfolios`;--> statement-breakpoint
DROP TABLE `portfolios`;--> statement-breakpoint
ALTER TABLE `__new_portfolios` RENAME TO `portfolios`;--> statement-breakpoint
PRAGMA foreign_keys=ON;