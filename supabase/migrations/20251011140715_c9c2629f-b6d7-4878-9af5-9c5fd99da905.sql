-- Modify the plan_type enum to reflect the correct plan names
-- Step 1: Remove the default temporarily
ALTER TABLE user_plans ALTER COLUMN plan DROP DEFAULT;

-- Step 2: Add the new enum values to existing type
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'bdi_inicial';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'bdi_plus';

-- Step 3: Create a new enum type with only the values we want
CREATE TYPE plan_type_new AS ENUM ('cliente', 'bdi_inicial', 'bdi_plus');

-- Step 4: Update the user_plans table to use the new enum
ALTER TABLE user_plans 
  ALTER COLUMN plan TYPE plan_type_new 
  USING (
    CASE 
      WHEN plan::text = 'premium' THEN 'bdi_plus'::plan_type_new
      WHEN plan::text = 'enterprise' THEN 'bdi_inicial'::plan_type_new
      ELSE plan::text::plan_type_new
    END
  );

-- Step 5: Drop the old enum and rename the new one
DROP TYPE plan_type;
ALTER TYPE plan_type_new RENAME TO plan_type;

-- Step 6: Restore the default value
ALTER TABLE user_plans ALTER COLUMN plan SET DEFAULT 'cliente'::plan_type;