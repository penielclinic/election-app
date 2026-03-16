export type Position = "장로" | "안수집사" | "권사" | "서리집사";
export type WorshipGrade = "A" | "B" | "C" | "D" | "E" | "";

export interface FamilyMember {
  name: string;
  relationship: string;
  age: string;
  church: string;
  position: string;
}

export interface CareerHistory {
  company: string;
  position: string;
  startYear: string;
  endYear: string;
  notes: string;
}

export type ServiceType =
  | "교사"
  | "찬양대"
  | "주차안내"
  | "주방봉사"
  | "차량봉사"
  | "예배안내"
  | "새가족"
  | "순장"
  | "위원회 활동"
  | "중보기도"
  | "기타봉사";

export const SERVICE_TYPES: ServiceType[] = [
  "교사",
  "찬양대",
  "주차안내",
  "주방봉사",
  "차량봉사",
  "예배안내",
  "새가족",
  "순장",
  "위원회 활동",
  "중보기도",
  "기타봉사",
];

export const SERVICE_YEARS = [2021, 2022, 2023, 2024, 2025];

// { 2021: { "교사": true, "찬양대": false, ... }, ... }
export type ServiceRecords = Record<number, Record<ServiceType, boolean>>;

export interface CandidateForm {
  // Step 1: 기본정보
  name: string;
  position: Position | "";
  birthDate: string;
  churchRegisterDate: string;
  baptismDate: string;
  baptismChurch: string;
  officiantPastor: string;
  ordinationDate: string;
  ordinationChurch: string;
  phone: string;
  email: string;
  address: string;

  // Step 2: 가족사항 & 사회경력
  familyMembers: FamilyMember[];
  careerHistory: CareerHistory[];

  // Step 3: 신앙생활 (후보 지원 신청서)
  worshipSundayMain: WorshipGrade;
  worshipSundayDay: WorshipGrade;
  worshipWednesday: WorshipGrade;
  worshipFriday: WorshipGrade;
  worshipMission: WorshipGrade;
  dawnPrayerWeekly: string;
  tithe: boolean | null;
  evangelismCount: string;

  // Step 4: 자기점검표
  q1SundayWorship: number | null; // 15점
  q2EveningWorship: number | null; // 10점
  q2EveningWorshipReason: string;
  q3WednesdayPrayer: number | null; // 5점
  q3WednesdayPrayerReason: string;
  q4FridayPrayer: number | null; // 5점
  q4FridayPrayerReason: string;
  q5DawnPrayer: number | null; // 5점
  q5DawnPrayerReason: string;
  q6SpecialMeeting: number | null; // 5점
  q7SpiritBaptism: boolean | null;
  q7SpiritEvidence: string;
  q8AlcoholResolved: boolean | null;
  q9Tithe: number | null; // 15점
  q10Thanksgiving: number | null; // 10점
  q11SeasonalOffering: boolean | null; // 5점
  q12FamilyFaith: boolean | null; // 5점
  q13MinistryCooperation: boolean | null; // 5점
  serviceRecords: ServiceRecords;
}

export interface Candidate extends CandidateForm {
  id: string;
  createdAt: string;
  checklistScore: number | null;
  status: "submitted" | "reviewed" | "approved" | "rejected";
}
