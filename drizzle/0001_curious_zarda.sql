ALTER TABLE `transactions` MODIFY COLUMN `amount` decimal(18,6) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `status` varchar(20) DEFAULT 'SUCCESS';--> statement-breakpoint
ALTER TABLE `transactions` ADD `token_symbol` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `network` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `tx_hash` varchar(80);