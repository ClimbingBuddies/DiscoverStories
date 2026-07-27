-- 011_database_driven_story_categories.sql
-- Seed the category catalogue and explicitly assign categories to current stories.
-- Safe to rerun.

begin;

insert into public.genres (slug, name)
values
  ('science-fiction', 'Science Fiction'),
  ('romance', 'Romance'),
  ('fantasy', 'Fantasy'),
  ('education', 'Education'),
  ('biographies', 'Biographies'),
  ('mystery', 'Mystery'),
  ('adventure', 'Adventure'),
  ('drama', 'Drama')
on conflict (slug) do update set name = excluded.name;

insert into public.story_genres (story_id, genre_id)
select s.id, g.id
from (values
  ('ash-and-silver', 'fantasy'),
  ('ash-and-silver', 'adventure'),
  ('ash-and-silver', 'drama'),
  ('echoes-under-the-city', 'mystery'),
  ('echoes-under-the-city', 'adventure'),
  ('life-inside-the-dyson', 'science-fiction'),
  ('life-inside-the-dyson', 'adventure'),
  ('the-cartographers-dream', 'fantasy'),
  ('the-cartographers-dream', 'mystery'),
  ('the-cartographers-dream', 'adventure'),
  ('the-last-radio-signal', 'science-fiction'),
  ('the-last-radio-signal', 'mystery'),
  ('the-last-radio-signal', 'drama'),
  ('the-lighthouse-at-dusk', 'mystery'),
  ('the-lighthouse-at-dusk', 'drama')
) as assignments(story_slug, genre_slug)
join public.stories s on s.slug = assignments.story_slug
join public.genres g on g.slug = assignments.genre_slug
on conflict (story_id, genre_id) do nothing;

commit;