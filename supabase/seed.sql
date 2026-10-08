-- ============================================================================
-- ARTVERSE — Seed Data for Supabase
-- Populates demo creators, artworks, and opportunities
-- ============================================================================

-- Note: In production, profiles reference auth.users(id). 
-- This script provides standard UUIDs for initial testing/migration.

-- Sample Artists Profiles (Seed)
INSERT INTO public.profiles (id, full_name, username, role, bio, city, country, primary_medium, avatar_url, cover_url)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Ananya Rao', 'ananyarao', 'artist', 'Visual storyteller exploring the convergence of traditional Indian miniature painting, folk textiles, and digital contemporary mythology.', 'Hyderabad', 'India', 'Visual Art', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80'),
  ('a2222222-2222-2222-2222-222222222222', 'Rahul Kumar', 'rahulkumar', 'artist', 'Documenting the soul of old Charminar alleys, historic stepwells, and artisan communities across the Deccan plateau.', 'Hyderabad', 'India', 'Photography', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80'),
  ('a3333333-3333-3333-3333-333333333333', 'Priya Sharma', 'priyasharma', 'artist', 'Merging botanical precision with modern textile motifs. Exploring native Western Ghats biodiversity through gouache and printmaking.', 'Mumbai', 'India', 'Design', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80')
ON CONFLICT (id) DO NOTHING;

-- Sample Artworks (Seed)
INSERT INTO public.artworks (id, artist_id, title, description, medium, category, image_url)
VALUES 
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Echoes of the River Krishna', 'An evocative digital painting capturing the dusk prayers and glowing brass lamps along the Krishna riverbanks.', 'Digital Painting', 'Visual Art', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80'),
  ('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Charminar Twilight Whispers', 'A long-exposure street study capturing the kinetic energy of Hyderabad spice merchants closing their stalls at dusk.', '35mm Street Photography', 'Photography', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80'),
  ('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Overgrown Monsoon Balcony', 'An intimate gouache painting of a vintage South Mumbai balcony during heavy rainfall.', 'Gouache on Archival Paper', 'Design', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

-- Sample Opportunities (Seed)
INSERT INTO public.opportunities (id, title, organization, description, type, location, deadline, application_url, image_url)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'Global Emerging Visual Arts Biennial Grant 2026', 'Artverse Foundation & Lumina Studios', 'Open call for emerging visual and digital artists worldwide. Finalists receive international exhibition exposure and production grant.', 'Grants', 'Global (Online & Milan Showcase)', '2026-10-25T00:00:00Z', 'https://artverse.org/apply/biennial-2026', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=120&q=80'),
  ('c2222222-2222-2222-2222-222222222222', 'Deccan Voices: Hyderabad Street Photography Grant', 'Telangana Heritage & Visual Arts Trust', 'A funded documentary grant empowering photographers to document vanishing folk craft and architectural stepwells.', 'Grants', 'Hyderabad, India', '2026-11-10T00:00:00Z', 'https://artverse.org/apply/deccan-voices', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=120&q=80'),
  ('c3333333-3333-3333-3333-333333333333', 'Kyoto International Residency for Concept Creators', 'Kyoto Media Arts Center', 'An international residency inviting illustrators, animators, and visual storytellers to live and create in Kyoto.', 'Exhibitions', 'Kyoto, Japan', '2026-12-15T00:00:00Z', 'https://artverse.org/apply/kyoto-residency', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=120&q=80')
ON CONFLICT (id) DO NOTHING;
