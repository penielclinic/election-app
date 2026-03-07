-- 항존직 선거 후보자 테이블
create table if not exists election_candidates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- 기본정보
  name text not null,
  position text not null, -- 장로/안수집사/권사
  birth_date text,
  church_register_date text,
  baptism_date text,
  baptism_church text,
  officiant_pastor text,
  ordination_date text,
  ordination_church text,
  phone text,
  email text,
  address text,

  -- 가족사항 (JSON array)
  family_members jsonb default '[]'::jsonb,

  -- 사회경력 (JSON array)
  career_history jsonb default '[]'::jsonb,

  -- 신앙생활 (후보 지원 신청서)
  worship_sunday_main text,
  worship_sunday_day text,
  worship_wednesday text,
  worship_friday text,
  worship_mission text,
  dawn_prayer_weekly text,
  tithe boolean,
  evangelism_count text,

  -- 자기점검표
  q1_sunday_worship integer,
  q2_evening_worship integer,
  q2_evening_worship_reason text,
  q3_wednesday_prayer integer,
  q3_wednesday_prayer_reason text,
  q4_friday_prayer integer,
  q4_friday_prayer_reason text,
  q5_dawn_prayer integer,
  q5_dawn_prayer_reason text,
  q6_special_meeting integer,
  q7_spirit_baptism boolean,
  q7_spirit_evidence text,
  q8_alcohol_resolved boolean,
  q9_tithe integer,
  q10_thanksgiving integer,
  q11_seasonal_offering boolean,
  q12_family_faith boolean,
  q13_ministry_cooperation boolean,
  service_records jsonb default '{}'::jsonb,

  -- 계산된 점수
  checklist_score integer,

  -- 상태
  status text default 'submitted'
);

-- RLS 활성화
alter table election_candidates enable row level security;

-- 누구나 삽입 가능 (후보자 지원)
create policy "Anyone can insert candidates"
  on election_candidates for insert
  with check (true);

-- 읽기는 인증된 사용자만 (관리자)
-- 개발 편의를 위해 일단 누구나 읽기 허용 (프로덕션에서 변경 권장)
create policy "Anyone can read candidates"
  on election_candidates for select
  using (true);

-- 업데이트는 누구나 (관리자 페이지에서 상태 변경)
create policy "Anyone can update candidates"
  on election_candidates for update
  using (true);
