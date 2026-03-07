import type { CandidateForm, ServiceRecords, ServiceType } from "./types";
import { SERVICE_YEARS } from "./types";

export function calcChecklistScore(form: Partial<CandidateForm>): number {
  let score = 0;

  // Q1 주일성수 (15점)
  if (form.q1SundayWorship != null) score += form.q1SundayWorship;

  // Q2 저녁예배 (10점)
  if (form.q2EveningWorship != null) score += form.q2EveningWorship;

  // Q3 수요기도회 (5점)
  if (form.q3WednesdayPrayer != null) score += form.q3WednesdayPrayer;

  // Q4 금요기도회 (5점)
  if (form.q4FridayPrayer != null) score += form.q4FridayPrayer;

  // Q5 새벽기도 (5점)
  if (form.q5DawnPrayer != null) score += form.q5DawnPrayer;

  // Q6 특별모임 (5점)
  if (form.q6SpecialMeeting != null) score += form.q6SpecialMeeting;

  // Q9 십일조 (15점)
  if (form.q9Tithe != null) score += form.q9Tithe;

  // Q10 감사헌금 (10점)
  if (form.q10Thanksgiving != null) score += form.q10Thanksgiving;

  // Q11 절기헌금 (5점)
  if (form.q11SeasonalOffering === true) score += 5;

  // Q12 가족신앙 (5점)
  if (form.q12FamilyFaith === true) score += 5;

  // Q13 목회협력 (5점)
  if (form.q13MinistryCooperation === true) score += 5;

  // 연도별 봉사 (15점)
  score += calcServiceScore(form.serviceRecords);

  return score;
}

export function calcServiceScore(records?: ServiceRecords): number {
  if (!records) return 0;

  // 각 연도별 봉사 개수 계산
  const yearlyCounts = SERVICE_YEARS.map((year) => {
    const yearRecord = records[year];
    if (!yearRecord) return 0;
    return Object.values(yearRecord).filter(Boolean).length;
  });

  // 활동한 연도만 (참석 기록이 있는 연도)
  const activeCounts = yearlyCounts.filter((_, i) => {
    const year = SERVICE_YEARS[i];
    return records[year] && Object.values(records[year]).some((v) => v);
  });

  if (activeCounts.length === 0) return 0;

  // 매년 기준으로 평균 봉사 개수
  const avgCount =
    yearlyCounts.reduce((a, b) => a + b, 0) / SERVICE_YEARS.length;

  if (avgCount >= 3) return 15;
  if (avgCount >= 2) return 10;
  if (avgCount >= 1) return 5;
  return 0;
}

export const SCORE_BREAKDOWN = {
  q1SundayWorship: { label: "주일 성수", max: 15 },
  q2EveningWorship: { label: "저녁예배", max: 10 },
  q3WednesdayPrayer: { label: "수요기도회", max: 5 },
  q4FridayPrayer: { label: "금요성령기도회", max: 5 },
  q5DawnPrayer: { label: "새벽기도회", max: 5 },
  q6SpecialMeeting: { label: "특별모임", max: 5 },
  q9Tithe: { label: "십일조", max: 15 },
  q10Thanksgiving: { label: "감사헌금", max: 10 },
  q11SeasonalOffering: { label: "절기헌금", max: 5 },
  q12FamilyFaith: { label: "가족 신앙생활", max: 5 },
  q13MinistryCooperation: { label: "목회 협력", max: 5 },
  service: { label: "연도별 봉사", max: 15 },
} as const;
