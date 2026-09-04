-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "linkedinId" TEXT,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "gender" TEXT,
    "industry" TEXT,
    "jobTitle" TEXT,
    "jobTitleRole" TEXT,
    "jobCompanyName" TEXT,
    "jobCompanyIndustry" TEXT,
    "locationName" TEXT,
    "locationCountry" TEXT,
    "locationRegion" TEXT,
    "summary" TEXT,
    "skills" JSONB,
    "interests" JSONB,
    "inferredYearsExperience" DOUBLE PRECISION,
    "inferredSalaryMin" INTEGER,
    "inferredSalaryMax" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_linkedinId_key" ON "Profile"("linkedinId");

-- CreateIndex
CREATE INDEX "Profile_industry_idx" ON "Profile"("industry");

-- CreateIndex
CREATE INDEX "Profile_jobTitle_idx" ON "Profile"("jobTitle");

-- CreateIndex
CREATE INDEX "Profile_jobCompanyName_idx" ON "Profile"("jobCompanyName");

-- CreateIndex
CREATE INDEX "Profile_locationCountry_idx" ON "Profile"("locationCountry");

-- CreateIndex
CREATE INDEX "Profile_gender_idx" ON "Profile"("gender");

-- CreateIndex
CREATE INDEX "Profile_jobTitleRole_idx" ON "Profile"("jobTitleRole");
