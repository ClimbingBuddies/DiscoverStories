-- Idempotent Canon fixture used to verify category-specific fields,
-- relationships, references and the multi-image gallery pathway.

update public.story_canon_rules
set rule_text = 'The Dyson swarm primarily captures the white dwarf''s existing radiation. Practical output is limited by stellar luminosity, collector coverage, transmission losses and habitat heat rejection. Any active accretion-assisted generation must keep the star comfortably below the Chandrasekhar mass limit and inside a conservative, continuously monitored operating envelope.',
    rule_category = 'technology-science',
    updated_at = now()
where canon_key = 'white-dwarf-energy-limits';

with target as (
  select r.id as canon_rule_id
  from public.story_canon_rules r
  join public.private_canon_projects p on p.id = r.canon_project_id
  where p.slug = 'life-inside-the-dyson'
    and r.canon_key = 'white-dwarf-energy-limits'
),
values_by_key(field_key, value_json) as (
  values
    ('domain', to_jsonb('Astrophysics and stellar engineering'::text)),
    ('technology_type', to_jsonb('White dwarf power harvesting'::text)),
    ('principle', to_jsonb('Passive luminosity capture with tightly controlled accretion-assisted generation'::text)),
    ('theoretical_limit', to_jsonb('Passive capture is bounded by stellar luminosity; accretion systems must keep mass safely below approximately 1.4 solar masses'::text)),
    ('safe_operating_range', to_jsonb('Collector load remains within radiator capacity; active mass transfer stays inside a conservative monitored envelope'::text)),
    ('primary_risks', '["runaway heat accumulation","swarm infrastructure cascade","uncontrolled accretion","magnetic and radiation exposure"]'::jsonb),
    ('requirements', '["distributed monitoring arrays","high-capacity heat rejection","redundant isolation and shutdown controls","independent mass-flow verification"]'::jsonb),
    ('known_limitations', '["passive output cannot exceed intercepted luminosity","older sectors have lower thermal margins","mass and composition changes alter stellar stability","waste heat limits usable power"]'::jsonb)
)
insert into public.story_canon_rule_field_values (canon_rule_id, field_definition_id, value_json, updated_at)
select t.canon_rule_id, d.id, v.value_json, now()
from target t
cross join values_by_key v
join public.private_canon_field_definitions d
  on d.category_slug = 'technology-science' and d.field_key = v.field_key
on conflict (canon_rule_id, field_definition_id)
do update set value_json = excluded.value_json, updated_at = now();

with target as (
  select r.id as canon_rule_id, r.canon_project_id
  from public.story_canon_rules r
  join public.private_canon_projects p on p.id = r.canon_project_id
  where p.slug = 'life-inside-the-dyson'
    and r.canon_key = 'white-dwarf-energy-limits'
),
refs(reference_type,title,citation,url,description,sort_order) as (
  values
    ('web','White Dwarfs and Planetary Nebulas','Chandra X-ray Observatory, White Dwarfs & Planetary Nebulas','https://chandra.harvard.edu/xray_sources/white_dwarfs.html','Scientific grounding for electron degeneracy pressure, white-dwarf collapse and the Chandrasekhar mass limit.',100),
    ('web','Stellar Evolution: White Dwarfs','Chandra X-ray Observatory Educational Materials, Stellar Evolution','https://chandra.harvard.edu/edu/formal/stellar_ev/story/index7.html','Educational explanation of equilibrium between gravity and electron degeneracy pressure.',110),
    ('web','Stars and Stellar Evolution','European Space Agency, Gaia: Stars','https://sci.esa.int/web/gaia/-/40576-stars','Reference for white-dwarf formation and support by electron degeneracy pressure.',120)
)
insert into public.private_canon_references
(canon_project_id,canon_rule_id,reference_type,title,citation,url,description,review_status,is_public,sort_order,updated_at)
select t.canon_project_id,t.canon_rule_id,r.reference_type,r.title,r.citation,r.url,r.description,'approved',false,r.sort_order,now()
from target t cross join refs r
on conflict (canon_rule_id, reference_type, title)
do update set citation=excluded.citation,url=excluded.url,description=excluded.description,
              review_status=excluded.review_status,is_public=excluded.is_public,
              sort_order=excluded.sort_order,updated_at=now();

with source as (
  select id from public.story_canon_rules where canon_key='white-dwarf-energy-limits'
), targets as (
  select id, canon_key from public.story_canon_rules
  where canon_key in ('dyson-revision-swarm-cities','legacy-a708819e257fdef368aeca3857c626ae','legacy-13cdb3064dac187e185193edb65d30ca')
)
insert into public.private_canon_rule_relationships
(source_canon_rule_id,target_canon_rule_id,relationship_type,description,sort_order)
select s.id,t.id,
  case t.canon_key when 'dyson-revision-swarm-cities' then 'powers'
                   when 'legacy-a708819e257fdef368aeca3857c626ae' then 'enables'
                   else 'part-of' end,
  case t.canon_key when 'dyson-revision-swarm-cities' then 'Provides the energy foundation for the distributed swarm cities.'
                   when 'legacy-a708819e257fdef368aeca3857c626ae' then 'Supplies the artificial sky and habitat-control systems.'
                   else 'Operates within the white-dwarf-centred habitat setting.' end,
  case t.canon_key when 'dyson-revision-swarm-cities' then 10
                   when 'legacy-a708819e257fdef368aeca3857c626ae' then 20
                   else 30 end
from source s cross join targets t
where not exists (
  select 1 from public.private_canon_rule_relationships x
  where x.source_canon_rule_id=s.id and x.target_canon_rule_id=t.id
);
