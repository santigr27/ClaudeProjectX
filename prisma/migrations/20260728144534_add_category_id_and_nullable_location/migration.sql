-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "propertyType" DROP NOT NULL,
ALTER COLUMN "areaSqm" DROP NOT NULL,
ALTER COLUMN "bedrooms" SET DEFAULT 0,
ALTER COLUMN "bathrooms" SET DEFAULT 0,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "locality" DROP NOT NULL,
ALTER COLUMN "neighborhood" DROP NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Property_categoryId_idx" ON "Property"("categoryId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: every existing real-estate row gets its matching Category via
-- the nativeValue bridge, so `category` becomes the universal "type" concept
-- read by the UI (see property.repository.ts) instead of only new rows
-- having it set. No-op if Category is still empty at migration time (e.g. a
-- fresh database that hasn't run the seed yet) — the seed's own upsert loop
-- covers that case going forward.
UPDATE "Property" p
SET "categoryId" = c.id
FROM "Category" c
WHERE c."nativeValue" = p."propertyType"::text
  AND p."categoryId" IS NULL;
