-- 011_story_production_foundation.sql
-- Establishes the reusable production layer for Discover Stories.
-- The existing wiki remains the story knowledge base. These tables add
-- production-specific profiles, cached bundles, art direction and audio runs.

BEGIN;

-- The season-aware key is authoritative. The older two-column key prevents
-- a story from having Episode 1 in more than one season.
ALTER TABLE public.episodes
  DROP CONSTRAINT IF EXISTS episodes_story_id_episode_number_key;

CREATE TABLE IF NOT EXISTS public.story_production_profiles (
  story_id uuid PRIMARY KEY
    REFERENCES public.stories(id) ON DELETE CASCADE,
  visual_style text,
  colour_palette text,
  atmosphere text,
  camera_language text,
  recurring_visual_motifs text,
  visual_exclusions text,
  default_audio_mode text NOT NULL DEFAULT 'single_narrator'
    CHECK (default_audio_mode IN ('single_narrator', 'enhanced_narrator', 'full_cast')),
  release_state text NOT NULL DEFAULT 'development'
    CHECK (release_state IN ('development', 'review', 'coming_soon', 'releasing', 'complete', 'paused')),
  production_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wiki_entry_visual_profiles (
  wiki_entry_id uuid PRIMARY KEY
    REFERENCES public.wiki_entries(id) ON DELETE CASCADE,
  visual_summary text,
  distinguishing_features text,
  clothing_or_materials text,
  colour_palette text,
  lighting_and_atmosphere text,
  scale_and_architecture text,
  fixed_continuity_rules text,
  permitted_evolution text,
  prompt_fragment text,
  approved_reference_asset_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.episode_art_direction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL
    REFERENCES public.episodes(id) ON DELETE CASCADE,
  revision_number integer NOT NULL DEFAULT 1 CHECK (revision_number > 0),
  source_script_hash text NOT NULL,
  chosen_scene text NOT NULL,
  source_evidence text NOT NULL,
  emotional_beat text,
  composition_direction text,
  lighting_and_palette text,
  deliberate_exclusions text,
  production_prompt text,
  concept_status text NOT NULL DEFAULT 'draft'
    CHECK (concept_status IN ('draft', 'ready', 'generated', 'approved', 'rejected')),
  story_fidelity_score numeric(4,2)
    CHECK (story_fidelity_score IS NULL OR story_fidelity_score BETWEEN 0 AND 10),
  visual_consistency_score numeric(4,2)
    CHECK (visual_consistency_score IS NULL OR visual_consistency_score BETWEEN 0 AND 10),
  reviewer_notes text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (episode_id, revision_number)
);

CREATE TABLE IF NOT EXISTS public.episode_art_direction_entries (
  art_direction_id uuid NOT NULL
    REFERENCES public.episode_art_direction(id) ON DELETE CASCADE,
  wiki_entry_id uuid NOT NULL
    REFERENCES public.wiki_entries(id) ON DELETE CASCADE,
  usage_role text NOT NULL
    CHECK (usage_role IN ('character', 'location', 'object', 'motif', 'faction', 'other')),
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (art_direction_id, wiki_entry_id, usage_role)
);

CREATE TABLE IF NOT EXISTS public.production_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL
    REFERENCES public.stories(id) ON DELETE CASCADE,
  episode_id uuid
    REFERENCES public.episodes(id) ON DELETE CASCADE,
  bundle_type text NOT NULL
    CHECK (bundle_type IN ('artwork', 'audio', 'website', 'marketing')),
  source_hash text NOT NULL,
  bundle_content jsonb NOT NULL,
  status text NOT NULL DEFAULT 'current'
    CHECK (status IN ('current', 'stale', 'superseded', 'failed')),
  generated_at timestamptz NOT NULL DEFAULT now(),
  superseded_at timestamptz,
  CHECK (episode_id IS NULL OR bundle_type IN ('artwork', 'audio', 'marketing'))
);

CREATE INDEX IF NOT EXISTS production_bundles_lookup_idx
  ON public.production_bundles (story_id, episode_id, bundle_type, status, generated_at DESC);

CREATE TABLE IF NOT EXISTS public.audio_generation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL
    REFERENCES public.stories(id) ON DELETE CASCADE,
  episode_id uuid NOT NULL
    REFERENCES public.episodes(id) ON DELETE CASCADE,
  voice_profile_id uuid
    REFERENCES public.voice_profiles(id) ON DELETE SET NULL,
  provider text NOT NULL,
  provider_voice_id text,
  source_script_hash text NOT NULL,
  production_mode text NOT NULL DEFAULT 'single_narrator'
    CHECK (production_mode IN ('single_narrator', 'enhanced_narrator', 'full_cast')),
  run_status text NOT NULL DEFAULT 'queued'
    CHECK (run_status IN ('queued', 'running', 'completed', 'failed', 'accepted', 'rejected')),
  output_storage_path text,
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  estimated_cost_aud numeric(12,4) CHECK (estimated_cost_aud IS NULL OR estimated_cost_aud >= 0),
  actual_cost_aud numeric(12,4) CHECK (actual_cost_aud IS NULL OR actual_cost_aud >= 0),
  quality_notes text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS audio_generation_runs_episode_idx
  ON public.audio_generation_runs (episode_id, created_at DESC);

-- Extend the existing asset register instead of creating a competing artwork table.
ALTER TABLE public.media_assets
  DROP CONSTRAINT IF EXISTS media_assets_asset_type_check;

ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_asset_type_check
  CHECK (asset_type IN (
    'cover_image',
    'story_banner',
    'episode_image',
    'concept_image',
    'refined_image',
    'character_reference',
    'location_reference',
    'map',
    'diagram',
    'audio_file',
    'audio_master',
    'narration_script',
    'production_report',
    'prompt_archive'
  ));

ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version_number integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_asset_id uuid,
  ADD COLUMN IF NOT EXISTS production_bundle_id uuid,
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_hash text,
  ADD COLUMN IF NOT EXISTS generation_notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.media_assets
  DROP CONSTRAINT IF EXISTS media_assets_lifecycle_status_check;
ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_lifecycle_status_check
  CHECK (lifecycle_status IN ('draft', 'concept', 'refined', 'approved', 'rejected', 'superseded', 'archived'));

ALTER TABLE public.media_assets
  DROP CONSTRAINT IF EXISTS media_assets_version_number_check;
ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_version_number_check
  CHECK (version_number > 0);

ALTER TABLE public.media_assets
  DROP CONSTRAINT IF EXISTS media_assets_parent_asset_id_fkey;
ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_parent_asset_id_fkey
  FOREIGN KEY (parent_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;

ALTER TABLE public.media_assets
  DROP CONSTRAINT IF EXISTS media_assets_production_bundle_id_fkey;
ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_production_bundle_id_fkey
  FOREIGN KEY (production_bundle_id) REFERENCES public.production_bundles(id) ON DELETE SET NULL;

-- The visual profile can point to an approved reusable asset after media_assets exists.
ALTER TABLE public.wiki_entry_visual_profiles
  DROP CONSTRAINT IF EXISTS wiki_entry_visual_profiles_reference_asset_fkey;
ALTER TABLE public.wiki_entry_visual_profiles
  ADD CONSTRAINT wiki_entry_visual_profiles_reference_asset_fkey
  FOREIGN KEY (approved_reference_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;

-- Internal production tables are private by default.
ALTER TABLE public.story_production_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_entry_visual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episode_art_direction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episode_art_direction_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_generation_runs ENABLE ROW LEVEL SECURITY;

DO $policies$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'story_production_profiles',
    'wiki_entry_visual_profiles',
    'episode_art_direction',
    'episode_art_direction_entries',
    'production_bundles',
    'audio_generation_runs'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_admin_all ON public.%I', table_name, table_name);
    EXECUTE format(
      'CREATE POLICY %I_admin_all ON public.%I FOR ALL TO authenticated '
      || 'USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = (SELECT auth.uid()) AND p.is_admin = true)) '
      || 'WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = (SELECT auth.uid()) AND p.is_admin = true))',
      table_name,
      table_name
    );
  END LOOP;
END
$policies$;

COMMIT;
