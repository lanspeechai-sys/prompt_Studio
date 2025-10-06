/*
  # Add Admin Roles, Categories, and Subscription Plans

  ## Overview
  This migration adds support for admin roles, prompt categories management, and flexible subscription plans.

  ## Changes to Existing Tables
  
  ### 1. `profiles` table updates
  - Add `is_admin` (boolean) - Flag to identify super admin users
  - Add `subscription_plan` (text) - Either 'monthly' or 'yearly'
  - Add `subscription_started_at` (timestamptz) - When subscription began
  - Rename `subscription_expires_at` remains for expiration tracking
  
  ### 2. `prompts` table updates
  - Add `category_id` (uuid) - Foreign key to categories table
  - Keep existing `category` text field for backward compatibility
  
  ## New Tables
  
  ### 1. `categories`
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name
  - `slug` (text) - URL-friendly slug
  - `description` (text) - Category description
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security Updates
  
  ### Row Level Security (RLS)
  - Admin users can manage all data
  - Regular users have read-only access to categories
  - Existing prompt policies remain with admin override
  
  ## Important Notes
  1. First user created will need to be manually set as admin in database
  2. Subscription expiration is calculated based on plan type
  3. Categories provide better organization than text-based categories
*/

-- Add new columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_plan text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_started_at timestamptz;
  END IF;
END $$;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Add category_id to prompts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompts' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE prompts ADD COLUMN category_id uuid REFERENCES categories(id);
  END IF;
END $$;

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Update prompts policies for admin access
DROP POLICY IF EXISTS "Authenticated users can view all prompts" ON prompts;

CREATE POLICY "Authenticated users can view all prompts"
  ON prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert prompts"
  ON prompts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can update prompts"
  ON prompts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete prompts"
  ON prompts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Update profiles policies for admin management
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Studio Photography', 'studio', 'Professional studio photoshoot prompts'),
  ('Outdoor Photography', 'outdoor', 'Natural light and outdoor setting prompts'),
  ('Portrait Photography', 'portrait', 'Classic portrait and headshot prompts'),
  ('Fashion Photography', 'fashion', 'High fashion and editorial prompts'),
  ('Beauty Photography', 'beauty', 'Beauty and makeup focused prompts'),
  ('Editorial Photography', 'editorial', 'Creative editorial style prompts')
ON CONFLICT (name) DO NOTHING;

-- Update existing prompts with category_id based on category text
UPDATE prompts p
SET category_id = c.id
FROM categories c
WHERE p.category = 'studio' AND c.slug = 'studio'
AND p.category_id IS NULL;

UPDATE prompts p
SET category_id = c.id
FROM categories c
WHERE p.category = 'outdoor' AND c.slug = 'outdoor'
AND p.category_id IS NULL;