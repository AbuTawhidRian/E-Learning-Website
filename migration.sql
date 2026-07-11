-- 1. Clear out existing subjects to avoid NOT NULL constraint errors when changing the column
TRUNCATE TABLE "Subject" CASCADE;

-- 2. Create the new CoreSubject table
CREATE TABLE "CoreSubject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mainCourseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreSubject_pkey" PRIMARY KEY ("id")
);

-- 3. Link CoreSubject to MainCourse
ALTER TABLE "CoreSubject" ADD CONSTRAINT "CoreSubject_mainCourseId_fkey" FOREIGN KEY ("mainCourseId") REFERENCES "MainCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Unlink Subject from MainCourse
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_mainCourseId_fkey";
ALTER TABLE "Subject" DROP COLUMN "mainCourseId";

-- 5. Link Subject to CoreSubject
ALTER TABLE "Subject" ADD COLUMN "coreSubjectId" TEXT NOT NULL;
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_coreSubjectId_fkey" FOREIGN KEY ("coreSubjectId") REFERENCES "CoreSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
