-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `Category` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`name` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL);

CREATE TABLE `Customer` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`name` varchar(191) NOT NULL,
	`phone` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL,
	`active` tinyint NOT NULL DEFAULT 1,
	`groupId` varchar(191),
	`memberRole` enum('ANGGOTA','KETUA') NOT NULL DEFAULT 'ANGGOTA');

CREATE TABLE `Group` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`name` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL);

CREATE TABLE `Permission` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`name` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL);

CREATE TABLE `Product` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`name` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL,
	`categoryId` varchar(191) NOT NULL,
	`stock` int NOT NULL,
	`price` double NOT NULL,
	`active` tinyint NOT NULL DEFAULT 1,
	`barcode` varchar(191));

CREATE TABLE `ProductSale` (
	`saleId` varchar(191) NOT NULL,
	`productId` varchar(191) NOT NULL,
	`quantity` int NOT NULL,
	`total` double NOT NULL,
	PRIMARY KEY(`productId`,`saleId`)
);

CREATE TABLE `Purchase` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL,
	`total` double NOT NULL,
	`supplierId` varchar(191) NOT NULL);

CREATE TABLE `PurchaseItem` (
	`productId` varchar(191) NOT NULL,
	`purchaseId` varchar(191) NOT NULL,
	`quantity` int NOT NULL,
	`purchasePrice` double NOT NULL,
	`total` double NOT NULL,
	PRIMARY KEY(`productId`,`purchaseId`)
);

CREATE TABLE `Role` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`name` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL);

CREATE TABLE `Sale` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL,
	`customerId` varchar(191),
	`total` double NOT NULL,
	`cash` double,
	`change` double,
	`userId` varchar(191) NOT NULL,
	`paymentMethod` enum('TUNAI','KREDIT') NOT NULL DEFAULT 'TUNAI',
	`status` enum('SELESAI','PROSES','BATAL') NOT NULL DEFAULT 'SELESAI',
	`dueDate` datetime(3));

CREATE TABLE `Supplier` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`name` varchar(191) NOT NULL,
	`address` varchar(191),
	`phone` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL,
	`active` tinyint NOT NULL DEFAULT 1);

CREATE TABLE `User` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`username` varchar(191) NOT NULL,
	`password` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL,
	`roleId` varchar(191) NOT NULL,
	`refreshToken` varchar(400));

CREATE TABLE `_PermissionToRole` (
	`A` varchar(191) NOT NULL,
	`B` varchar(191) NOT NULL,
	PRIMARY KEY(`A`,`B`)
);

CREATE UNIQUE INDEX `Category_name_key` ON `Category` (`name`);
CREATE INDEX `groupId` ON `Customer` (`groupId`);
CREATE UNIQUE INDEX `Group_name_key` ON `Group` (`name`);
CREATE INDEX `categoryId` ON `Product` (`categoryId`);
CREATE UNIQUE INDEX `Product_barcode_key` ON `Product` (`barcode`);
CREATE UNIQUE INDEX `Product_name_key` ON `Product` (`name`);
CREATE INDEX `productId` ON `ProductSale` (`productId`);
CREATE INDEX `saleId` ON `ProductSale` (`saleId`);
CREATE INDEX `supplierId` ON `Purchase` (`supplierId`);
CREATE INDEX `productId` ON `PurchaseItem` (`productId`);
CREATE INDEX `purchaseId` ON `PurchaseItem` (`purchaseId`);
CREATE INDEX `customerId` ON `Sale` (`customerId`);
CREATE INDEX `userId` ON `Sale` (`userId`);
CREATE UNIQUE INDEX `Supplier_name_key` ON `Supplier` (`name`);
CREATE INDEX `roleId` ON `User` (`roleId`);
CREATE UNIQUE INDEX `User_refreshToken_key` ON `User` (`refreshToken`);
CREATE UNIQUE INDEX `User_username_key` ON `User` (`username`);
CREATE UNIQUE INDEX `_PermissionToRole_AB_unique` ON `_PermissionToRole` (`A`,`B`);
CREATE INDEX `_PermissionToRole_B_index` ON `_PermissionToRole` (`B`);
*/