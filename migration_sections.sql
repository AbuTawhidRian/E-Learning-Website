DO $$ 
BEGIN 
    -- 1. Create the Section table if it somehow didn't complete
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'Section') THEN
        CREATE TABLE "Section" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "subjectId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
        );
        
        ALTER TABLE "Section" ADD CONSTRAINT "Section_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- 2. Update the Material table ONLY if it still has the old subjectId column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Material' AND column_name = 'subjectId') THEN
        TRUNCATE TABLE "Material" CASCADE;
        ALTER TABLE "Material" DROP CONSTRAINT IF EXISTS "Material_subjectId_fkey";
        ALTER TABLE "Material" DROP COLUMN "subjectId";
        ALTER TABLE "Material" ADD COLUMN "sectionId" TEXT NOT NULL;
        ALTER TABLE "Material" ADD CONSTRAINT "Material_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
