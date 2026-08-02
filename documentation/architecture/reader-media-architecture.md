# Reader media architecture

The Reader uses `public.media_assets` as the single media registry for episode artwork, historical portraits and scenes, experiment reconstructions, educational diagrams and future Studio uploads. Inline educational visuals are stored in Tiptap JSON as `educationImage` nodes.

Each node may contain `mediaAssetId`, `src` (backward-compatible fallback), `alt`, `caption`, `credit`, `visualRole`, `readerPositionKey` and `displayMode`.

Approved Reader-visible records are exposed through `public.episode_reader_media`. The application resolves the asset by ID and falls back to `src` if the record is unavailable. The existing episode-artwork production workflow remains unchanged; this adds a Reader placement layer for inline educational media.

Use Supabase Storage bucket `story-images` for editorial images. GitHub/Vercel remains for fixed application assets and UI graphics.
