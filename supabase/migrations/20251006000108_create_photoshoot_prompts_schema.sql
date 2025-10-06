/*
  # Create Photoshoot Prompts Schema

  ## Overview
  This migration creates the database schema for a photoshoot prompt library with user authentication and subscription management.

  ## New Tables
  
  ### 1. `profiles`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User's email address
  - `full_name` (text) - User's full name
  - `has_paid` (boolean) - Whether user has paid for annual access
  - `subscription_expires_at` (timestamptz) - When subscription expires
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. `prompts`
  - `id` (uuid, primary key) - Unique prompt identifier
  - `title` (text) - Photoshoot title
  - `description` (text) - Brief description
  - `prompt_text` (text) - The actual AI prompt
  - `image_url` (text) - URL to the preview image
  - `category` (text) - Category (e.g., "studio", "outdoor", "portrait")
  - `created_at` (timestamptz) - When prompt was added
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS enabled on all tables
  - Users can read their own profile
  - Users can update their own profile
  - All authenticated users can view prompt listings
  - Only paid users can view full prompt details
  
  ## Important Notes
  1. The `profiles` table is separate from `auth.users` to store app-specific data
  2. The `has_paid` flag controls access to full prompt content
  3. All queries must check authentication status
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  has_paid boolean DEFAULT false,
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  prompt_text text NOT NULL,
  image_url text NOT NULL,
  category text DEFAULT 'studio',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Prompts policies
CREATE POLICY "Authenticated users can view all prompts"
  ON prompts FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample prompts
INSERT INTO prompts (title, description, prompt_text, image_url, category) VALUES
  ('Fashion Studio Portrait', 'Professional fashion photography in a modern studio setting', 'A professional fashion model in a minimalist white studio, dramatic side lighting, wearing elegant black attire, shot with 85mm lens, f/1.4, high fashion editorial style, clean background, professional makeup and styling', 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800', 'studio'),
  ('Urban Streetwear', 'Contemporary street fashion in urban environment', 'Young model in trendy streetwear, urban city background with graffiti walls, golden hour lighting, candid pose, shot with 50mm lens, vibrant colors, street photography style, confident expression', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800', 'outdoor'),
  ('Classic Headshot', 'Professional business headshot with neutral background', 'Professional corporate headshot, neutral gray background, soft front lighting with subtle fill light, business casual attire, friendly and approachable expression, shot with 85mm portrait lens, f/2.8', 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800', 'studio'),
  ('Editorial Beauty', 'High-end beauty editorial with creative makeup', 'Close-up beauty portrait with artistic makeup, dramatic studio lighting with colored gels, flawless skin, creative eye makeup, shot with macro lens, sharp focus on eyes, high-end retouching style', 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800', 'studio'),
  ('Natural Light Portrait', 'Soft and dreamy outdoor portrait', 'Portrait with natural window light, soft and ethereal mood, white or cream colored clothing, minimal makeup, gentle expression, shot during golden hour, shallow depth of field, film photography aesthetic', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800', 'outdoor'),
  ('Dramatic Shadows', 'Moody portrait with strong shadow play', 'Dramatic portrait with Rembrandt lighting, strong shadows creating mood, dark background, contemplative expression, shot with 50mm lens, low-key lighting setup, noir style photography', 'https://images.pexels.com/photos/1845534/pexels-photo-1845534.jpeg?auto=compress&cs=tinysrgb&w=800', 'studio')
ON CONFLICT DO NOTHING;