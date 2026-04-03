-- CreateTable
CREATE TABLE "VisitorRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "citizenshipNo" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "personToMeet" TEXT NOT NULL,
    "visitDate" DATETIME NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "qrCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "VisitorRequest_requestId_key" ON "VisitorRequest"("requestId");
