create table if not exists public.story_quality_assessments (
    id uuid primary key default gen_random_uuid(),
    story_id uuid not null references public.stories(id) on delete cascade,
    season_number integer not null default 1 check (season_number > 0),
    episode_start integer not null check (episode_start > 0),
    episode_end integer not null check (episode_end >= episode_start),
    rubric_version text not null,
    overall_score numeric(5,2) not null check (overall_score between 0 and 100),
    assessment_json jsonb not null default '{}'::jsonb,
    strengths text[] not null default '{}'::text[],
    priority_improvements text[] not null default '{}'::text[],
    evaluator_type text not null default 'ai'
        check (evaluator_type in ('ai', 'human', 'reader_calibrated')),
    status text not null default 'draft'
        check (status in ('draft', 'final', 'superseded')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint story_quality_assessments_batch_unique
        unique (
            story_id,
            season_number,
            episode_start,
            episode_end,
            rubric_version,
            evaluator_type
        )
);

create index if not exists story_quality_assessments_story_idx
    on public.story_quality_assessments
    (story_id, season_number, episode_start, episode_end);

alter table public.story_quality_assessments enable row level security;

revoke all on table public.story_quality_assessments from anon, authenticated;

comment on table public.story_quality_assessments is
'One compact quality assessment per story episode batch and rubric version. Detailed criteria remain in assessment_json until relational analysis is justified.';

comment on column public.story_quality_assessments.assessment_json is
'Rubric category scores, evidence, confidence and review notes as a versioned JSON document.';