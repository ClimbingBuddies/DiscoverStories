# Episode Artwork Production Specification — Reader Media Addendum

**Addendum · 02 Aug 2026**

This addendum extends the existing episode-artwork production specification. It does not replace the Concept, Refine or Production stages, the evidence requirements, the JPEG storage rule, or the existing episode-artwork asset process.

## Educational Reader visuals

Educational visuals may be historical portraits, historical scenes, experiment reconstructions, educational diagrams or manuscript images. They must still be evidence-backed and reviewed for accessibility and crop safety.

Reader placement is controlled by the media registry and the Tiptap `educationImage` node. The node may store:

- `mediaAssetId` — the approved `public.media_assets` identifier;
- `src` — backward-compatible fallback URL;
- `alt`, `caption` and `credit`;
- `visualRole`;
- `readerPositionKey`;
- `displayMode`.

Approved Reader-visible assets are returned through `public.episode_reader_media`. The Reader resolves `mediaAssetId` first and uses `src` only as a fallback. This permits an approved image to be replaced, repositioned or withdrawn without changing episode text or deploying Vercel.

Supported display modes are `standard`, `wide`, `full_width`, `portrait`, `diagram` and `inline`. The existing episode-artwork workflow remains the source for episode cards, player artwork and episode detail artwork; Reader visuals are an additional placement use.
