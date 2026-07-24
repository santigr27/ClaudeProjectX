-- CreateTable
CREATE TABLE "ListingAttributeValue" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "attributeDefinitionId" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "ListingAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingAttributeValue_listingId_idx" ON "ListingAttributeValue"("listingId");

-- CreateIndex
CREATE INDEX "ListingAttributeValue_attributeDefinitionId_idx" ON "ListingAttributeValue"("attributeDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingAttributeValue_listingId_attributeDefinitionId_key" ON "ListingAttributeValue"("listingId", "attributeDefinitionId");

-- AddForeignKey
ALTER TABLE "ListingAttributeValue" ADD CONSTRAINT "ListingAttributeValue_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAttributeValue" ADD CONSTRAINT "ListingAttributeValue_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
