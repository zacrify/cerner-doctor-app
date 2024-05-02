-- CreateTable
CREATE TABLE "Auth" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fhir_endpoint" TEXT NOT NULL,
    "auth_url" TEXT NOT NULL,
    "token_url" TEXT NOT NULL,
    "launch" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "need_patient_banner" BOOLEAN NOT NULL DEFAULT false
);
