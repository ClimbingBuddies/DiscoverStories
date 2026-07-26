-- 012_seed_cartographers_production_knowledge.sql
-- Seeds the reusable production knowledge foundation for The Cartographer's Dream.

BEGIN;

DO $seed$
DECLARE
  v_story_id uuid;
BEGIN
  SELECT id INTO v_story_id
  FROM public.stories
  WHERE slug = 'the-cartographers-dream';

  IF v_story_id IS NULL THEN
    RAISE EXCEPTION 'Story the-cartographers-dream was not found';
  END IF;

  INSERT INTO public.story_wiki_settings
    (story_id, wiki_enabled, wiki_title, wiki_introduction,
     allow_spoiler_toggle, show_locked_placeholders, updated_at)
  VALUES
    (v_story_id, true, 'The Cartographer''s Dream Wiki',
     'Characters, places, artefacts and discoveries from Mara Vey''s exploration of Valewick and its forgotten roads.',
     true, true, now())
  ON CONFLICT (story_id) DO UPDATE SET
    wiki_enabled = EXCLUDED.wiki_enabled,
    wiki_title = EXCLUDED.wiki_title,
    wiki_introduction = EXCLUDED.wiki_introduction,
    allow_spoiler_toggle = EXCLUDED.allow_spoiler_toggle,
    show_locked_placeholders = EXCLUDED.show_locked_placeholders,
    updated_at = now();

  INSERT INTO public.story_production_profiles
    (story_id, visual_style, colour_palette, atmosphere, camera_language,
     recurring_visual_motifs, visual_exclusions, default_audio_mode,
     release_state, production_notes, updated_at)
  VALUES
    (v_story_id,
     'Cinematic painterly fantasy realism with tactile historic materials, expressive faces and clear readable silhouettes.',
     'Warm amber lamplight, rain-dark stone, parchment grey, oxidised bronze, muted teal-blue magical light and restrained silver accents.',
     'Wonder grounded in practical observation; dreams feel uncanny and emotionally intimate rather than abstract or psychedelic.',
     'Human-scale compositions, close or medium cinematic framing for emotional scenes, wider environmental framing when hidden architecture is the subject.',
     'Maps and layered lines, seven-pointed stars, bells without clappers, blue tiles, survey marks, rain, hidden doors, silver or blue dream light.',
     'No modern clothing, no generic wizard imagery, no glowing fantasy effects without episode evidence, no embedded text, logos, watermarks or UI.',
     'single_narrator',
     'development',
     'Episodes 1-10 are the reference artwork batch. Dream states must be visually distinct and important, while Mara remains recognisably grounded in her cartographic work.',
     now())
  ON CONFLICT (story_id) DO UPDATE SET
    visual_style = EXCLUDED.visual_style,
    colour_palette = EXCLUDED.colour_palette,
    atmosphere = EXCLUDED.atmosphere,
    camera_language = EXCLUDED.camera_language,
    recurring_visual_motifs = EXCLUDED.recurring_visual_motifs,
    visual_exclusions = EXCLUDED.visual_exclusions,
    default_audio_mode = EXCLUDED.default_audio_mode,
    release_state = EXCLUDED.release_state,
    production_notes = EXCLUDED.production_notes,
    updated_at = now();

  INSERT INTO public.wiki_entries
    (story_id, entry_type, slug, title, short_description, introduction,
     spoiler_level, is_public, content_status, sort_order, updated_at)
  VALUES
    (v_story_id, 'character', 'mara-vey', 'Mara Vey',
     'A gifted young cartographer whose dreams begin revealing roads and places missing from every official map.',
     'Mara approaches strange discoveries with the habits of a surveyor: measure first, record uncertainty and never confuse a clue with an answer.',
     0, true, 'published', 10, now()),
    (v_story_id, 'character', 'tomas', 'Tomas',
     'An Archive catalogue clerk and Mara''s trusted friend.',
     'Tomas brings humour, practical scepticism and dependable support to Mara''s investigations.',
     0, true, 'published', 20, now()),
    (v_story_id, 'character', 'lio', 'Lio',
     'Mara''s curious apprentice at the Archive of Measures.',
     'Lio is eager, observant and learning that a failed comparison can be as useful as a successful one.',
     0, true, 'published', 30, now()),
    (v_story_id, 'character', 'nella', 'Aunt Nella',
     'Mara''s aunt and the keeper of difficult family memories.',
     'Nella is protective, practical and unwilling to let mystery erase the ordinary life Mara has built.',
     0, true, 'published', 40, now()),
    (v_story_id, 'character', 'jonas-vey', 'Jonas Vey',
     'Mara''s missing father, a brilliant surveyor linked to Valewick''s hidden roads.',
     'Jonas vanished seven years ago after investigating places that appeared through dreams and forgotten routes.',
     2, true, 'published', 50, now()),
    (v_story_id, 'location', 'valewick', 'Valewick',
     'A layered old city whose current streets conceal older roads, tunnels and forgotten districts.',
     'Valewick is mapped, repaired and argued over every day, yet some of its most important places survive only in fragments, dreams and buried alignments.',
     0, true, 'published', 100, now()),
    (v_story_id, 'location', 'archive-of-measures', 'Archive of Measures',
     'The civic institution where Valewick''s public maps are copied, corrected and sealed.',
     'The Archive is Mara''s workplace and the centre of official cartographic knowledge in the city.',
     0, true, 'published', 110, now()),
    (v_story_id, 'location', 'surveyors-rest', 'The Surveyors'' Rest',
     'An old boarding house in East Measure with concealed architecture beneath its northern wall.',
     'The Surveyors'' Rest preserves traces of Jonas''s earlier investigation and an entrance into Valewick''s hidden passages.',
     1, true, 'published', 120, now()),
    (v_story_id, 'location', 'bellmarket-well', 'Bellmarket Well',
     'A sealed historic well beneath Bellmarket marked with moths and seven-pointed stars.',
     'The forgotten waterworks beneath Bellmarket connect old civic infrastructure with something that should remain closed.',
     2, true, 'published', 130, now()),
    (v_story_id, 'artefact', 'the-magical-map', 'The Magical Map',
     'A grey cloth map that changes overnight and reveals routes connected to Mara''s dreams and discoveries.',
     'The map offers clues without explanation, combining present streets, historic layers and hidden places in ways Mara must learn to interpret.',
     1, true, 'published', 200, now()),
    (v_story_id, 'artefact', 'brass-token', 'The Brass Token',
     'A small token marked with a seven-pointed star on one side and a moth-ringed well on the other.',
     'The token is discovered through the map and fits a recess in the sealed Bellmarket well.',
     2, true, 'published', 210, now()),
    (v_story_id, 'concept', 'dream-surveys', 'Dream Surveys',
     'Dreams that preserve measurements, routes and places with unusual accuracy.',
     'Mara treats each dream as evidence to be tested rather than an instruction to be obeyed.',
     0, true, 'published', 300, now()),
    (v_story_id, 'concept', 'hidden-roads', 'Hidden Roads',
     'Routes concealed beneath, beside or between the mapped city.',
     'Some hidden roads are physically buried, some belong to older versions of Valewick and some do not obey ordinary distance or time.',
     1, true, 'published', 310, now())
  ON CONFLICT (story_id, slug) DO UPDATE SET
    entry_type = EXCLUDED.entry_type,
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    introduction = EXCLUDED.introduction,
    spoiler_level = EXCLUDED.spoiler_level,
    is_public = EXCLUDED.is_public,
    content_status = EXCLUDED.content_status,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

  INSERT INTO public.wiki_character_profiles
    (wiki_entry_id, role_in_story, personality, strengths, weaknesses,
     motivations, fears, speech_style, appearance, habits_and_mannerisms,
     moral_boundaries, current_state, character_arc_notes, ai_generation_notes, updated_at)
  SELECT we.id,
    'Protagonist and cartographer',
    'Intelligent, disciplined, compassionate, curious and cautious; emotionally guarded around her father''s disappearance.',
    'Observation, spatial reasoning, patience, ethical judgement and the ability to explain complex maps clearly.',
    'Can overwork, mistrust intuition and use precision to protect herself from grief.',
    'Understand the map, protect people from dangerous discoveries and learn what happened to Jonas without becoming consumed by his path.',
    'Repeating her father''s mistakes, being deceived by hope and allowing hidden places to harm others.',
    'Precise and thoughtful; dry humour; asks questions before accepting assumptions.',
    'Young adult woman with dark brown hair, expressive intelligent features and practical period cartographer clothing suitable for fieldwork and Archive work.',
    'Measures before touching, records alternatives, carries notebook and mapping tools, becomes more precise when frightened.',
    'Will not knowingly endanger others for discovery and resists treating people or their memories as research objects.',
    'Beginning a controlled investigation of a map linked to dreams and her missing father.',
    'Her arc is not blind pursuit. She learns to choose what to reveal, what to protect and when evidence is sufficient to act.',
    'Keep Mara recognisable across all images. Show emotion through face and posture. Her competence and humanity matter more than ornamental fantasy styling.',
    now()
  FROM public.wiki_entries we
  WHERE we.story_id = v_story_id AND we.slug = 'mara-vey'
  ON CONFLICT (wiki_entry_id) DO UPDATE SET
    role_in_story = EXCLUDED.role_in_story,
    personality = EXCLUDED.personality,
    strengths = EXCLUDED.strengths,
    weaknesses = EXCLUDED.weaknesses,
    motivations = EXCLUDED.motivations,
    fears = EXCLUDED.fears,
    speech_style = EXCLUDED.speech_style,
    appearance = EXCLUDED.appearance,
    habits_and_mannerisms = EXCLUDED.habits_and_mannerisms,
    moral_boundaries = EXCLUDED.moral_boundaries,
    current_state = EXCLUDED.current_state,
    character_arc_notes = EXCLUDED.character_arc_notes,
    ai_generation_notes = EXCLUDED.ai_generation_notes,
    updated_at = now();

  INSERT INTO public.wiki_entry_internal
    (wiki_entry_id, ai_context, internal_notes, continuity_rules, future_arc_notes, source_notes, updated_at)
  SELECT we.id,
    CASE we.slug
      WHEN 'mara-vey' THEN 'Mara is the primary viewpoint and production anchor. Her emotional response should be visible even when she is behaving methodically.'
      WHEN 'the-magical-map' THEN 'The map is mysterious and not yet understood. Do not portray it as obedient, sentient or controlled by Mara unless future canon establishes that.'
      WHEN 'dream-surveys' THEN 'Dreams are evidence-bearing but ambiguous. They may preserve routes, history, memory or possibility; the story intentionally withholds a final rule.'
      WHEN 'jonas-vey' THEN 'Jonas must remain emotionally important and uncertain. Early imagery should not confirm whether every dream figure is truly him.'
      ELSE 'Reusable story knowledge for writing and production.'
    END,
    NULL,
    CASE we.slug
      WHEN 'mara-vey' THEN 'Mara records uncertainty and does not leap immediately from magical evidence to certainty.'
      WHEN 'the-magical-map' THEN 'At first the map changes overnight and is strongly associated with dreams. It offers clues rather than explanations.'
      WHEN 'valewick' THEN 'The city has layered history; hidden features should feel embedded in real civic architecture rather than floating fantasy scenery.'
      ELSE NULL
    END,
    NULL,
    'Seeded from the approved first twenty episodes and current production architecture.',
    now()
  FROM public.wiki_entries we
  WHERE we.story_id = v_story_id
    AND we.slug IN ('mara-vey','the-magical-map','dream-surveys','jonas-vey','valewick')
  ON CONFLICT (wiki_entry_id) DO UPDATE SET
    ai_context = EXCLUDED.ai_context,
    internal_notes = EXCLUDED.internal_notes,
    continuity_rules = EXCLUDED.continuity_rules,
    future_arc_notes = EXCLUDED.future_arc_notes,
    source_notes = EXCLUDED.source_notes,
    updated_at = now();

  INSERT INTO public.wiki_entry_visual_profiles
    (wiki_entry_id, visual_summary, distinguishing_features, clothing_or_materials,
     colour_palette, lighting_and_atmosphere, scale_and_architecture,
     fixed_continuity_rules, permitted_evolution, prompt_fragment, updated_at)
  SELECT we.id,
    CASE we.slug
      WHEN 'mara-vey' THEN 'Beautiful young brunette cartographer with an intelligent, expressive face; practical, capable and emotionally readable.'
      WHEN 'the-magical-map' THEN 'Thin grey cloth map with panel folds, stitch holes, shallow vanished-line impressions and precise black, blue or silver markings that appear within the fibres.'
      WHEN 'valewick' THEN 'Dense historic river city of dark stone, brick, steep lanes, civic archives, markets, old waterworks and layers of reused architecture.'
      WHEN 'archive-of-measures' THEN 'Tall civic map archive with timber cabinets, rolled surveys, broad worktables, high shutters and disciplined clerical order.'
      WHEN 'surveyors-rest' THEN 'Old leaning boarding house with warm common rooms, narrow attic, aged plaster and concealed white-stone stairs below.'
      WHEN 'bellmarket-well' THEN 'Circular sealed well beneath historic waterworks, iron cap, moth carvings, blue star tiles and damp ancient masonry.'
    END,
    CASE we.slug
      WHEN 'mara-vey' THEN 'Dark brown hair; expressive eyes; alert posture; usually carries notebook, pencil, compass, measuring cord or map case.'
      WHEN 'the-magical-map' THEN 'Never glossy paper; no decorative title; markings are sparse, precise and mysterious rather than a complete glowing fantasy map.'
      ELSE NULL
    END,
    CASE we.slug
      WHEN 'mara-vey' THEN 'Practical period field coat or Archive clothing in earth tones, durable boots, leather satchel and cartographic tools.'
      WHEN 'the-magical-map' THEN 'Grey woven cloth, black cord, oilcloth wrapping or old survey case when protected.'
      WHEN 'valewick' THEN 'Rain-dark stone, old brick, bronze, timber, blue glazed tiles and parchment-filled interiors.'
      ELSE NULL
    END,
    CASE we.slug
      WHEN 'mara-vey' THEN 'Earth tones, charcoal, warm brown and restrained teal or blue reflections from magical discoveries.'
      WHEN 'the-magical-map' THEN 'Grey cloth, black linework, muted blue, silver and occasional green marks.'
      ELSE 'Warm amber practical light contrasted with cold blue or silver dream light.'
    END,
    CASE we.slug
      WHEN 'mara-vey' THEN 'Natural or lamplit realism; dream light may touch her face but should not transform her into a supernatural figure.'
      ELSE 'Tactile historic atmosphere with cinematic depth; magic appears as restrained environmental evidence.'
    END,
    CASE we.slug
      WHEN 'valewick' THEN 'Human-scale dense city with layered elevations, cellars, buried routes and civic infrastructure.'
      WHEN 'archive-of-measures' THEN 'Large ordered interior, vertical cabinets and long map tables.'
      WHEN 'surveyors-rest' THEN 'Intimate domestic scale above; impossible depth and older white stone below.'
      WHEN 'bellmarket-well' THEN 'Confined circular underground chamber beneath the market.'
      ELSE NULL
    END,
    CASE we.slug
      WHEN 'mara-vey' THEN 'Keep face, dark brown hair, age impression, practical silhouette and core tools consistent.'
      WHEN 'the-magical-map' THEN 'Do not turn it into parchment, a floating hologram or a fully illuminated city plan.'
      ELSE 'Architecture must remain grounded in the established materials and period.'
    END,
    CASE we.slug
      WHEN 'mara-vey' THEN 'Clothing may become wetter, muddier or more worn according to the episode; expression should change with the emotional beat.'
      WHEN 'the-magical-map' THEN 'Visible marks may change according to episode evidence while the cloth identity remains stable.'
      ELSE 'Lighting, weather and damage may change according to the scene.'
    END,
    CASE we.slug
      WHEN 'mara-vey' THEN 'Mara Vey, beautiful young brunette cartographer, intelligent expressive face, practical period field clothing, leather satchel and mapping tools.'
      WHEN 'the-magical-map' THEN 'A thin folded grey cloth map with subtle stitch holes and sparse precise black, muted blue and silver lines embedded in the fibres.'
      WHEN 'valewick' THEN 'Historic layered river city of rain-dark stone, old brick, bronze signs, steep lanes, markets and buried civic architecture.'
      WHEN 'archive-of-measures' THEN 'Grand but practical civic map archive filled with timber cabinets, rolled surveys, long worktables and high shuttered windows.'
      WHEN 'surveyors-rest' THEN 'Old leaning surveyors boarding house with aged plaster, warm lamplight and a concealed stair descending into ancient white stone.'
      WHEN 'bellmarket-well' THEN 'Sealed circular ancient well chamber, iron cap, moth engravings, blue seven-pointed-star tiles and wet stone.'
    END,
    now()
  FROM public.wiki_entries we
  WHERE we.story_id = v_story_id
    AND we.slug IN ('mara-vey','the-magical-map','valewick','archive-of-measures','surveyors-rest','bellmarket-well')
  ON CONFLICT (wiki_entry_id) DO UPDATE SET
    visual_summary = EXCLUDED.visual_summary,
    distinguishing_features = EXCLUDED.distinguishing_features,
    clothing_or_materials = EXCLUDED.clothing_or_materials,
    colour_palette = EXCLUDED.colour_palette,
    lighting_and_atmosphere = EXCLUDED.lighting_and_atmosphere,
    scale_and_architecture = EXCLUDED.scale_and_architecture,
    fixed_continuity_rules = EXCLUDED.fixed_continuity_rules,
    permitted_evolution = EXCLUDED.permitted_evolution,
    prompt_fragment = EXCLUDED.prompt_fragment,
    updated_at = now();

  INSERT INTO public.episode_wiki_entries
    (episode_id, wiki_entry_id, appearance_type, public_notes,
     spoiler_level, is_public, sort_order)
  SELECT e.id, we.id,
    CASE WHEN we.entry_type = 'character' THEN 'appears' ELSE 'featured' END,
    NULL,
    GREATEST(we.spoiler_level, 0),
    true,
    we.sort_order
  FROM public.episodes e
  JOIN public.wiki_entries we ON we.story_id = e.story_id
  WHERE e.story_id = v_story_id
    AND e.season_number = 1
    AND e.episode_number BETWEEN 1 AND 10
    AND (
      we.slug IN ('mara-vey','tomas','lio','nella','valewick','archive-of-measures','dream-surveys','hidden-roads')
      OR (we.slug = 'jonas-vey' AND e.episode_number >= 3)
      OR (we.slug = 'surveyors-rest' AND e.episode_number BETWEEN 2 AND 6)
      OR (we.slug = 'the-magical-map' AND e.episode_number >= 5)
      OR (we.slug = 'brass-token' AND e.episode_number >= 6)
      OR (we.slug = 'bellmarket-well' AND e.episode_number BETWEEN 7 AND 8)
    )
  ON CONFLICT (episode_id, wiki_entry_id) DO UPDATE SET
    appearance_type = EXCLUDED.appearance_type,
    public_notes = EXCLUDED.public_notes,
    spoiler_level = EXCLUDED.spoiler_level,
    is_public = EXCLUDED.is_public,
    sort_order = EXCLUDED.sort_order;
END
$seed$;

COMMIT;

SELECT s.slug,
       count(distinct we.id) AS wiki_entries,
       count(distinct wvp.wiki_entry_id) AS visual_profiles,
       count(distinct ewe.episode_id) AS linked_episodes
FROM public.stories s
LEFT JOIN public.wiki_entries we ON we.story_id = s.id
LEFT JOIN public.wiki_entry_visual_profiles wvp ON wvp.wiki_entry_id = we.id
LEFT JOIN public.episode_wiki_entries ewe ON ewe.wiki_entry_id = we.id
WHERE s.slug = 'the-cartographers-dream'
GROUP BY s.slug;