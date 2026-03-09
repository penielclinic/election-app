"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { calcChecklistScore, calcServiceScore } from "@/lib/scoring";
import type {
  CandidateForm,
  FamilyMember,
  CareerHistory,
  ServiceRecords,
  ServiceType,
  WorshipGrade,
} from "@/lib/types";
import { SERVICE_TYPES, SERVICE_YEARS } from "@/lib/types";
import { printCandidatePDF } from "@/lib/printPDF";

const TOTAL_STEPS = 5;

const emptyFamily = (): FamilyMember => ({
  name: "",
  relationship: "",
  age: "",
  church: "",
  position: "",
});

const emptyCareer = (): CareerHistory => ({
  company: "",
  position: "",
  startYear: "",
  endYear: "",
  notes: "",
});

const initServiceRecords = (): ServiceRecords => {
  const records: ServiceRecords = {};
  for (const year of SERVICE_YEARS) {
    records[year] = {} as Record<ServiceType, boolean>;
    for (const type of SERVICE_TYPES) {
      records[year][type] = false;
    }
  }
  return records;
};

const initialForm: CandidateForm = {
  name: "",
  position: "",
  birthDate: "",
  churchRegisterDate: "",
  baptismDate: "",
  baptismChurch: "",
  officiantPastor: "",
  ordinationDate: "",
  ordinationChurch: "",
  phone: "",
  email: "",
  address: "",
  familyMembers: [emptyFamily()],
  careerHistory: [emptyCareer()],
  worshipSundayMain: "",
  worshipSundayDay: "",
  worshipWednesday: "",
  worshipFriday: "",
  worshipMission: "",
  dawnPrayerWeekly: "",
  tithe: null,
  evangelismCount: "",
  q1SundayWorship: null,
  q2EveningWorship: null,
  q2EveningWorshipReason: "",
  q3WednesdayPrayer: null,
  q3WednesdayPrayerReason: "",
  q4FridayPrayer: null,
  q4FridayPrayerReason: "",
  q5DawnPrayer: null,
  q5DawnPrayerReason: "",
  q6SpecialMeeting: null,
  q7SpiritBaptism: null,
  q7SpiritEvidence: "",
  q8AlcoholResolved: null,
  q9Tithe: null,
  q10Thanksgiving: null,
  q11SeasonalOffering: null,
  q12FamilyFaith: null,
  q13MinistryCooperation: null,
  serviceRecords: initServiceRecords(),
};

function StepIndicator({ step }: { step: number }) {
  const labels = ["기본정보", "가족·경력", "신앙생활", "자기점검표", "확인·제출"];
  return (
    <div className="flex items-center justify-center gap-1 mb-8 flex-wrap">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              i + 1 === step
                ? "bg-amber-600 text-white"
                : i + 1 < step
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <span className="font-bold">{i + 1}</span>
            <span className="whitespace-nowrap">{label}</span>
          </div>
          {i < labels.length - 1 && (
            <div className={`w-4 h-px mx-0.5 ${i + 1 < step ? "bg-amber-300" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 1: 기본정보
// ─────────────────────────────────────────────
function Step1({
  form,
  onChange,
  photoPreview,
  onPhotoChange,
}: {
  form: CandidateForm;
  onChange: (f: Partial<CandidateForm>) => void;
  photoPreview: string;
  onPhotoChange: (file: File) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">기본 정보</h2>

      {/* 사진 + 성명/직분 나란히 */}
      <div className="flex gap-4 items-start">
        {/* 증명사진 박스 */}
        <div className="shrink-0">
          <label className="block text-xs font-medium text-gray-600 mb-1 text-center">증명사진</label>
          <label
            htmlFor="photo-input"
            className="block w-24 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:border-amber-400 transition-colors"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="증명사진" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <span className="text-2xl text-gray-300">+</span>
                <span className="text-xs text-gray-400">사진 첨부</span>
                <span className="text-xs text-gray-300">3×4cm</span>
              </div>
            )}
          </label>
          <input
            id="photo-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPhotoChange(file);
            }}
          />
          {photoPreview && (
            <button
              type="button"
              onClick={() => onPhotoChange(new File([], ""))}
              className="w-full mt-1 text-xs text-gray-400 hover:text-red-400"
            >
              삭제
            </button>
          )}
        </div>

        {/* 성명 + 직분 */}
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              성명 <span className="text-red-500">*</span>
            </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="홍길동"
          />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              지원 직분 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(["장로", "안수집사", "권사"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({ position: p })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    form.position === p
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-amber-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => onChange({ birthDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">교회 등록일</label>
          <input
            type="date"
            value={form.churchRegisterDate}
            onChange={(e) => onChange({ churchRegisterDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">세례(입교)일</label>
          <input
            type="date"
            value={form.baptismDate}
            onChange={(e) => onChange({ baptismDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">세례 교회</label>
          <input
            type="text"
            value={form.baptismChurch}
            onChange={(e) => onChange({ baptismChurch: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">집례 목사</label>
          <input
            type="text"
            value={form.officiantPastor}
            onChange={(e) => onChange({ officiantPastor: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">임직일 (해당자)</label>
          <input
            type="date"
            value={form.ordinationDate}
            onChange={(e) => onChange({ ordinationDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">임직 교회 (해당자)</label>
          <input
            type="text"
            value={form.ordinationChurch}
            onChange={(e) => onChange({ ordinationChurch: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            휴대폰 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="010-0000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 2: 가족사항 & 사회경력
// ─────────────────────────────────────────────
function Step2({
  form,
  onChange,
}: {
  form: CandidateForm;
  onChange: (f: Partial<CandidateForm>) => void;
}) {
  const updateFamily = (i: number, key: keyof FamilyMember, val: string) => {
    const updated = form.familyMembers.map((m, idx) =>
      idx === i ? { ...m, [key]: val } : m
    );
    onChange({ familyMembers: updated });
  };

  const updateCareer = (i: number, key: keyof CareerHistory, val: string) => {
    const updated = form.careerHistory.map((c, idx) =>
      idx === i ? { ...c, [key]: val } : c
    );
    onChange({ careerHistory: updated });
  };

  return (
    <div className="space-y-6">
      {/* 가족사항 */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">가족사항</h2>
        <div className="space-y-3">
          {form.familyMembers.map((m, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">가족 {i + 1}</span>
                {form.familyMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ familyMembers: form.familyMembers.filter((_, idx) => idx !== i) })
                    }
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="성명"
                  value={m.name}
                  onChange={(e) => updateFamily(i, "name", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="text"
                  placeholder="관계"
                  value={m.relationship}
                  onChange={(e) => updateFamily(i, "relationship", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="text"
                  placeholder="연령"
                  value={m.age}
                  onChange={(e) => updateFamily(i, "age", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="text"
                  placeholder="출석교회"
                  value={m.church}
                  onChange={(e) => updateFamily(i, "church", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="text"
                  placeholder="직분"
                  value={m.position}
                  onChange={(e) => updateFamily(i, "position", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm col-span-2 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ familyMembers: [...form.familyMembers, emptyFamily()] })}
            className="w-full border border-dashed border-amber-300 text-amber-600 rounded-lg py-2 text-sm hover:bg-amber-50 transition-colors"
          >
            + 가족 추가
          </button>
        </div>
      </div>

      {/* 사회경력 */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">사회경력</h2>
        <p className="text-xs text-gray-500 mb-3">최근 경력부터 기재</p>
        <div className="space-y-3">
          {form.careerHistory.map((c, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">경력 {i + 1}</span>
                {form.careerHistory.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ careerHistory: form.careerHistory.filter((_, idx) => idx !== i) })
                    }
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="직업(사업장)"
                  value={c.company}
                  onChange={(e) => updateCareer(i, "company", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="text"
                  placeholder="직위"
                  value={c.position}
                  onChange={(e) => updateCareer(i, "position", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="text"
                  placeholder="시작연도"
                  value={c.startYear}
                  onChange={(e) => updateCareer(i, "startYear", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="text"
                  placeholder="종료연도"
                  value={c.endYear}
                  onChange={(e) => updateCareer(i, "endYear", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="text"
                  placeholder="기타"
                  value={c.notes}
                  onChange={(e) => updateCareer(i, "notes", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm col-span-2 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ careerHistory: [...form.careerHistory, emptyCareer()] })}
            className="w-full border border-dashed border-amber-300 text-amber-600 rounded-lg py-2 text-sm hover:bg-amber-50 transition-colors"
          >
            + 경력 추가
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 3: 신앙생활 (후보 지원 신청서 기준)
// ─────────────────────────────────────────────
const WORSHIP_GRADES: { value: WorshipGrade; label: string }[] = [
  { value: "A", label: "A (90%↑)" },
  { value: "B", label: "B (70%↑)" },
  { value: "C", label: "C (50%↑)" },
  { value: "D", label: "D (30%↑)" },
  { value: "E", label: "E (30%↓)" },
];

function GradeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: WorshipGrade;
  onChange: (v: WorshipGrade) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100">
      <span className="text-sm text-gray-700 w-28 shrink-0 whitespace-nowrap">{label}</span>
      <div className="flex gap-1.5 flex-wrap">
        {WORSHIP_GRADES.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => onChange(g.value)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              value === g.value
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-amber-50"
            }`}
          >
            {g.value}
          </button>
        ))}
      </div>
      {value && (
        <span className="text-xs text-gray-400">
          {WORSHIP_GRADES.find((g) => g.value === value)?.label}
        </span>
      )}
    </div>
  );
}

function Step3({
  form,
  onChange,
}: {
  form: CandidateForm;
  onChange: (f: Partial<CandidateForm>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">신앙생활</h2>
        <p className="text-xs text-gray-500" style={{ wordBreak: "keep-all" }}>
          평가기간: 예배·헌금은 직전월 3년간 / 전도는 최근 10년간
        </p>
      </div>

      {/* 예배 참석률 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">예배 참석률</h3>
        <GradeSelect
          label="주일 대예배"
          value={form.worshipSundayMain}
          onChange={(v) => onChange({ worshipSundayMain: v })}
        />
        <GradeSelect
          label="주일 낮예배"
          value={form.worshipSundayDay}
          onChange={(v) => onChange({ worshipSundayDay: v })}
        />
        <GradeSelect
          label="수요예배"
          value={form.worshipWednesday}
          onChange={(v) => onChange({ worshipWednesday: v })}
        />
        <GradeSelect
          label="금요 성령기도회"
          value={form.worshipFriday}
          onChange={(v) => onChange({ worshipFriday: v })}
        />
        <GradeSelect
          label="선교회예배"
          value={form.worshipMission}
          onChange={(v) => onChange({ worshipMission: v })}
        />
      </div>

      {/* 기도 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">기도</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 whitespace-nowrap">새벽기도 (주 회)</span>
          <input
            type="number"
            min={0}
            max={7}
            value={form.dawnPrayerWeekly}
            onChange={(e) => onChange({ dawnPrayerWeekly: e.target.value })}
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-amber-400"
            placeholder="회"
          />
        </div>
      </div>

      {/* 헌금 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">헌금</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 whitespace-nowrap">십일조 (배우자 대체 가능)</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ tithe: true })}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                form.tithe === true
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:border-amber-400"
              }`}
            >
              예
            </button>
            <button
              type="button"
              onClick={() => onChange({ tithe: false })}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                form.tithe === false
                  ? "bg-gray-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:border-amber-400"
              }`}
            >
              아니오
            </button>
          </div>
        </div>
      </div>

      {/* 전도 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">전도</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 whitespace-nowrap">새가족 인도 (타교회 포함)</span>
          <input
            type="number"
            min={0}
            value={form.evangelismCount}
            onChange={(e) => onChange({ evangelismCount: e.target.value })}
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-amber-400"
            placeholder="명"
          />
          <span className="text-sm text-gray-500">명</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 4: 자기점검표
// ─────────────────────────────────────────────
function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: number }[];
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-amber-600"
          />
          <span className="text-sm text-gray-700" style={{ wordBreak: "keep-all" }}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function YesNoGroup({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-3 mt-1">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="radio"
          checked={value === true}
          onChange={() => onChange(true)}
          className="accent-amber-600"
        />
        <span className="text-sm text-gray-700">예</span>
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="radio"
          checked={value === false}
          onChange={() => onChange(false)}
          className="accent-amber-600"
        />
        <span className="text-sm text-gray-700">아니오</span>
      </label>
    </div>
  );
}

const ABSENCE_REASONS_EVENING = ["직장", "사업", "건강", "가정", "휴식부족", "사회활동", "무관심"];
const ABSENCE_REASONS_COMMON = ["직장", "사업", "건강", "가정", "사회활동", "무관심"];
const ABSENCE_REASONS_DAWN = ["직장", "사업", "건강", "가정", "사회활동", "수면부족", "무관심"];

function AbsenceReasonSelect({
  reasons,
  value,
  onChange,
}: {
  reasons: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const selected = value ? value.split(",") : [];
  const toggle = (r: string) => {
    const next = selected.includes(r) ? selected.filter((s) => s !== r) : [...selected, r];
    onChange(next.join(","));
  };
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {reasons.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => toggle(r)}
          className={`px-2 py-0.5 rounded text-xs transition-colors ${
            selected.includes(r)
              ? "bg-gray-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function Step4({
  form,
  onChange,
}: {
  form: CandidateForm;
  onChange: (f: Partial<CandidateForm>) => void;
}) {
  const score = calcChecklistScore(form);

  const toggleService = (year: number, type: ServiceType) => {
    const updated: ServiceRecords = {
      ...form.serviceRecords,
      [year]: {
        ...form.serviceRecords[year],
        [type]: !form.serviceRecords[year]?.[type],
      },
    };
    onChange({ serviceRecords: updated });
  };

  const qBox = (content: React.ReactNode) => (
    <div className="bg-gray-50 rounded-xl p-4">{content}</div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-800">자기점검표</h2>
        <div className="bg-amber-600 text-white px-3 py-1.5 rounded-full text-sm font-bold">
          {score} / 100점
        </div>
      </div>
      <p className="text-xs text-gray-500 -mt-2" style={{ wordBreak: "keep-all" }}>
        최근 5년간의 신앙의 모습을 솔직하게 기록하십시오.
      </p>

      {/* Q1 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">1. 주일 성수 <span className="text-amber-600">(15점)</span></p>
          <RadioGroup
            value={form.q1SundayWorship}
            onChange={(v) => onChange({ q1SundayWorship: v })}
            options={[
              { label: "① 매주 참석 (15점)", value: 15 },
              { label: "② 매월 3회 이상 (10점)", value: 10 },
              { label: "③ 매월 2회 이상 (5점)", value: 5 },
              { label: "④ 매월 1회 이상 (0점)", value: 0 },
            ]}
          />
        </>
      )}

      {/* Q2 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">2. 저녁예배 연간 참석 횟수 <span className="text-amber-600">(10점)</span></p>
          <RadioGroup
            value={form.q2EveningWorship}
            onChange={(v) => onChange({ q2EveningWorship: v })}
            options={[
              { label: "① 40번 이상 (10점)", value: 10 },
              { label: "② 30번 이상 (8점)", value: 8 },
              { label: "③ 20번 이상 (6점)", value: 6 },
              { label: "④ 10번 이상 (3점)", value: 3 },
              { label: "⑤ 참석 못함 (0점)", value: 0 },
            ]}
          />
          {form.q2EveningWorship !== null && form.q2EveningWorship < 10 && (
            <>
              <p className="text-xs text-gray-500 mt-2">사유 선택</p>
              <AbsenceReasonSelect
                reasons={ABSENCE_REASONS_EVENING}
                value={form.q2EveningWorshipReason}
                onChange={(v) => onChange({ q2EveningWorshipReason: v })}
              />
            </>
          )}
        </>
      )}

      {/* Q3 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">3. 수요기도회 연간 참석 횟수 <span className="text-amber-600">(5점)</span></p>
          <RadioGroup
            value={form.q3WednesdayPrayer}
            onChange={(v) => onChange({ q3WednesdayPrayer: v })}
            options={[
              { label: "① 40번 이상 (5점)", value: 5 },
              { label: "② 30번 이상 (4점)", value: 4 },
              { label: "③ 20번 이상 (3점)", value: 3 },
              { label: "④ 10번 이상 (2점)", value: 2 },
              { label: "⑤ 참석 못함 (0점)", value: 0 },
            ]}
          />
          {form.q3WednesdayPrayer !== null && form.q3WednesdayPrayer < 5 && (
            <>
              <p className="text-xs text-gray-500 mt-2">사유 선택</p>
              <AbsenceReasonSelect
                reasons={ABSENCE_REASONS_COMMON}
                value={form.q3WednesdayPrayerReason}
                onChange={(v) => onChange({ q3WednesdayPrayerReason: v })}
              />
            </>
          )}
        </>
      )}

      {/* Q4 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">4. 금요성령기도회 연간 참석 횟수 <span className="text-amber-600">(5점)</span></p>
          <RadioGroup
            value={form.q4FridayPrayer}
            onChange={(v) => onChange({ q4FridayPrayer: v })}
            options={[
              { label: "① 40번 이상 (5점)", value: 5 },
              { label: "② 30번 이상 (4점)", value: 4 },
              { label: "③ 20번 이상 (3점)", value: 3 },
              { label: "④ 10번 이상 (2점)", value: 2 },
              { label: "⑤ 참석 못함 (0점)", value: 0 },
            ]}
          />
          {form.q4FridayPrayer !== null && form.q4FridayPrayer < 5 && (
            <>
              <p className="text-xs text-gray-500 mt-2">사유 선택</p>
              <AbsenceReasonSelect
                reasons={ABSENCE_REASONS_DAWN}
                value={form.q4FridayPrayerReason}
                onChange={(v) => onChange({ q4FridayPrayerReason: v })}
              />
            </>
          )}
        </>
      )}

      {/* Q5 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">5. 새벽기도회 한 달 참석 횟수 <span className="text-amber-600">(5점)</span></p>
          <RadioGroup
            value={form.q5DawnPrayer}
            onChange={(v) => onChange({ q5DawnPrayer: v })}
            options={[
              { label: "① 15일 이상 (5점)", value: 5 },
              { label: "② 10일 이상 (4점)", value: 4 },
              { label: "③ 5일 이상 (3점)", value: 3 },
              { label: "④ 1일 이상 (2점)", value: 2 },
              { label: "⑤ 참석 못함 (0점)", value: 0 },
            ]}
          />
          {form.q5DawnPrayer !== null && form.q5DawnPrayer < 5 && (
            <>
              <p className="text-xs text-gray-500 mt-2">사유 선택</p>
              <AbsenceReasonSelect
                reasons={ABSENCE_REASONS_DAWN}
                value={form.q5DawnPrayerReason}
                onChange={(v) => onChange({ q5DawnPrayerReason: v })}
              />
            </>
          )}
        </>
      )}

      {/* Q6 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800" style={{ wordBreak: "keep-all" }}>
            6. 특별모임 참석 <span className="text-xs font-normal text-gray-500">(고난주간 저녁집회, 말씀사경회, 특별새벽기도회, 특별행사)</span>{" "}
            <span className="text-amber-600">(5점)</span>
          </p>
          <RadioGroup
            value={form.q6SpecialMeeting}
            onChange={(v) => onChange({ q6SpecialMeeting: v })}
            options={[
              { label: "① 4가지 (5점)", value: 5 },
              { label: "② 3가지 (4점)", value: 4 },
              { label: "③ 2가지 (3점)", value: 3 },
              { label: "④ 1가지 (2점)", value: 2 },
            ]}
          />
        </>
      )}

      {/* Q7 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">7. 성령세례를 받으셨습니까?</p>
          <YesNoGroup
            value={form.q7SpiritBaptism}
            onChange={(v) => onChange({ q7SpiritBaptism: v })}
          />
          {form.q7SpiritBaptism && (
            <input
              type="text"
              placeholder="증거를 기록해 주세요"
              value={form.q7SpiritEvidence}
              onChange={(e) => onChange({ q7SpiritEvidence: e.target.value })}
              className="mt-2 w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          )}
        </>
      )}

      {/* Q8 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">8. 주초문제가 해결되셨습니까?</p>
          <YesNoGroup
            value={form.q8AlcoholResolved}
            onChange={(v) => onChange({ q8AlcoholResolved: v })}
          />
        </>
      )}

      {/* Q9 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">9. 온전한 십일조 <span className="text-amber-600">(15점)</span></p>
          <RadioGroup
            value={form.q9Tithe}
            onChange={(v) => onChange({ q9Tithe: v })}
            options={[
              { label: "① 5년 이상 (15점)", value: 15 },
              { label: "② 4년 이상 (10점)", value: 10 },
              { label: "③ 3년 이상 (5점)", value: 5 },
              { label: "④ 2년 이상 (4점)", value: 4 },
            ]}
          />
        </>
      )}

      {/* Q10 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">10. 온전한 감사헌금 <span className="text-amber-600">(10점)</span></p>
          <RadioGroup
            value={form.q10Thanksgiving}
            onChange={(v) => onChange({ q10Thanksgiving: v })}
            options={[
              { label: "① 5년 이상 (10점)", value: 10 },
              { label: "② 4년 이상 (8점)", value: 8 },
              { label: "③ 3년 이상 (6점)", value: 6 },
              { label: "④ 2년 이상 (4점)", value: 4 },
            ]}
          />
        </>
      )}

      {/* Q11 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">11. 절기 헌금 <span className="text-amber-600">(5점)</span></p>
          <YesNoGroup
            value={form.q11SeasonalOffering}
            onChange={(v) => onChange({ q11SeasonalOffering: v })}
          />
        </>
      )}

      {/* Q12 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">12. 가족 모두가 신앙생활을 하고 있는가? <span className="text-amber-600">(5점)</span></p>
          <YesNoGroup
            value={form.q12FamilyFaith}
            onChange={(v) => onChange({ q12FamilyFaith: v })}
          />
        </>
      )}

      {/* Q13 */}
      {qBox(
        <>
          <p className="text-sm font-semibold text-gray-800">13. 목회에 협력을 잘하고 있는가? <span className="text-amber-600">(5점)</span></p>
          <YesNoGroup
            value={form.q13MinistryCooperation}
            onChange={(v) => onChange({ q13MinistryCooperation: v })}
          />
        </>
      )}

      {/* 연도별 봉사 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-gray-800">
            연도별 봉사 내용 <span className="text-amber-600">(15점)</span>
          </p>
          <span className="text-xs text-gray-500">
            봉사점수: {calcServiceScore(form.serviceRecords)}점
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3" style={{ wordBreak: "keep-all" }}>
          매년 3개↑ (15점) / 2개↑ (10점) / 1개↑ (5점)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left py-1.5 pr-2 text-gray-600 font-medium whitespace-nowrap">봉사</th>
                {SERVICE_YEARS.map((y) => (
                  <th key={y} className="text-center py-1.5 px-1 text-gray-600 font-medium whitespace-nowrap">
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SERVICE_TYPES.map((type) => (
                <tr key={type} className="border-t border-gray-100">
                  <td className="py-1.5 pr-2 text-gray-700 whitespace-nowrap">{type}</td>
                  {SERVICE_YEARS.map((year) => (
                    <td key={year} className="text-center py-1.5 px-1">
                      <input
                        type="checkbox"
                        checked={!!form.serviceRecords[year]?.[type]}
                        onChange={() => toggleService(year, type)}
                        className="accent-amber-600 w-4 h-4"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 5: 확인 & 제출
// ─────────────────────────────────────────────
function Step5({
  form,
  score,
}: {
  form: CandidateForm;
  score: number;
}) {
  const Row = ({ label, value }: { label: string; value: string }) =>
    value ? (
      <div className="flex gap-2 py-1.5 border-b border-gray-100 text-sm">
        <span className="text-gray-500 w-28 shrink-0 whitespace-nowrap">{label}</span>
        <span className="text-gray-800">{value}</span>
      </div>
    ) : null;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-800">최종 확인</h2>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">자기점검표 총점</p>
        <p className="text-3xl font-bold text-amber-700">{score}점</p>
        <p className="text-xs text-amber-600 mt-1">/ 100점 만점</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">기본 정보</h3>
        <Row label="성명" value={form.name} />
        <Row label="직분" value={form.position} />
        <Row label="생년월일" value={form.birthDate} />
        <Row label="교회등록일" value={form.churchRegisterDate} />
        <Row label="휴대폰" value={form.phone} />
        <Row label="이메일" value={form.email} />
        <Row label="주소" value={form.address} />
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600" style={{ wordBreak: "keep-all" }}>
        <p className="font-semibold text-gray-800 mb-2">제출 전 확인사항</p>
        <ul className="space-y-1 list-disc list-inside text-xs">
          <li>모든 항목을 신앙의 양심에 따라 솔직하게 작성하였습니다.</li>
          <li>제출 후에는 수정이 어렵습니다. 내용을 다시 확인해 주세요.</li>
          <li>제출된 내용은 전형위원회 자료로 활용됩니다.</li>
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APPLY PAGE
// ─────────────────────────────────────────────
export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CandidateForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 300;
        const ratio = Math.min(maxW / img.width, 1);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = URL.createObjectURL(file);
    });

  const handlePhotoChange = async (file: File) => {
    if (!file.name) {
      setPhotoFile(null);
      setPhotoPreview("");
      setPhotoUrl("");
      return;
    }
    setPhotoFile(file);
    const compressed = await compressImage(file);
    setPhotoPreview(compressed);
    setPhotoUrl(compressed);
  };

  const onChange = (partial: Partial<CandidateForm>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const score = calcChecklistScore(form);

  const validateStep = (): string => {
    if (step === 1) {
      if (!form.name.trim()) return "성명을 입력해 주세요.";
      if (!form.position) return "지원 직분을 선택해 주세요.";
      if (!form.phone.trim()) return "휴대폰 번호를 입력해 주세요.";
    }
    return "";
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const { error: dbError } = await supabase.from("election_candidates").insert({
        name: form.name,
        position: form.position,
        birth_date: form.birthDate || null,
        church_register_date: form.churchRegisterDate || null,
        baptism_date: form.baptismDate || null,
        baptism_church: form.baptismChurch || null,
        officiant_pastor: form.officiantPastor || null,
        ordination_date: form.ordinationDate || null,
        ordination_church: form.ordinationChurch || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        family_members: form.familyMembers,
        career_history: form.careerHistory,
        worship_sunday_main: form.worshipSundayMain || null,
        worship_sunday_day: form.worshipSundayDay || null,
        worship_wednesday: form.worshipWednesday || null,
        worship_friday: form.worshipFriday || null,
        worship_mission: form.worshipMission || null,
        dawn_prayer_weekly: form.dawnPrayerWeekly || null,
        tithe: form.tithe,
        evangelism_count: form.evangelismCount || null,
        q1_sunday_worship: form.q1SundayWorship,
        q2_evening_worship: form.q2EveningWorship,
        q2_evening_worship_reason: form.q2EveningWorshipReason || null,
        q3_wednesday_prayer: form.q3WednesdayPrayer,
        q3_wednesday_prayer_reason: form.q3WednesdayPrayerReason || null,
        q4_friday_prayer: form.q4FridayPrayer,
        q4_friday_prayer_reason: form.q4FridayPrayerReason || null,
        q5_dawn_prayer: form.q5DawnPrayer,
        q5_dawn_prayer_reason: form.q5DawnPrayerReason || null,
        q6_special_meeting: form.q6SpecialMeeting,
        q7_spirit_baptism: form.q7SpiritBaptism,
        q7_spirit_evidence: form.q7SpiritEvidence || null,
        q8_alcohol_resolved: form.q8AlcoholResolved,
        q9_tithe: form.q9Tithe,
        q10_thanksgiving: form.q10Thanksgiving,
        q11_seasonal_offering: form.q11SeasonalOffering,
        q12_family_faith: form.q12FamilyFaith,
        q13_ministry_cooperation: form.q13MinistryCooperation,
        service_records: form.serviceRecords,
        checklist_score: score,
        status: "submitted",
        ...(photoUrl ? { photo_url: photoUrl } : {}),
      });

      if (dbError) throw dbError;
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">지원서가 제출되었습니다</h1>
          <p className="text-sm text-gray-500 mb-2" style={{ wordBreak: "keep-all" }}>
            {form.name}님의 항존직 후보 지원서가 정상적으로 접수되었습니다.
          </p>
          <p className="text-2xl font-bold text-amber-600 mb-6">자기점검표 총점: {score}점</p>
          <button
            onClick={() =>
              printCandidatePDF({
                name: form.name,
                position: form.position,
                birthDate: form.birthDate,
                churchRegisterDate: form.churchRegisterDate,
                baptismDate: form.baptismDate,
                baptismChurch: form.baptismChurch,
                officiantPastor: form.officiantPastor,
                ordinationDate: form.ordinationDate,
                ordinationChurch: form.ordinationChurch,
                phone: form.phone,
                email: form.email,
                address: form.address,
                familyMembers: form.familyMembers,
                careerHistory: form.careerHistory,
                worshipSundayMain: form.worshipSundayMain,
                worshipSundayDay: form.worshipSundayDay,
                worshipWednesday: form.worshipWednesday,
                worshipFriday: form.worshipFriday,
                worshipMission: form.worshipMission,
                dawnPrayerWeekly: form.dawnPrayerWeekly,
                tithe: form.tithe,
                evangelismCount: form.evangelismCount,
                q1SundayWorship: form.q1SundayWorship,
                q2EveningWorship: form.q2EveningWorship,
                q2EveningWorshipReason: form.q2EveningWorshipReason,
                q3WednesdayPrayer: form.q3WednesdayPrayer,
                q3WednesdayPrayerReason: form.q3WednesdayPrayerReason,
                q4FridayPrayer: form.q4FridayPrayer,
                q4FridayPrayerReason: form.q4FridayPrayerReason,
                q5DawnPrayer: form.q5DawnPrayer,
                q5DawnPrayerReason: form.q5DawnPrayerReason,
                q6SpecialMeeting: form.q6SpecialMeeting,
                q7SpiritBaptism: form.q7SpiritBaptism,
                q7SpiritEvidence: form.q7SpiritEvidence,
                q8AlcoholResolved: form.q8AlcoholResolved,
                q9Tithe: form.q9Tithe,
                q10Thanksgiving: form.q10Thanksgiving,
                q11SeasonalOffering: form.q11SeasonalOffering,
                q12FamilyFaith: form.q12FamilyFaith,
                q13MinistryCooperation: form.q13MinistryCooperation,
                serviceRecords: form.serviceRecords,
                checklistScore: score,
                photoUrl: photoUrl || undefined,
              })
            }
            className="w-full mb-3 py-3 rounded-xl border border-amber-500 text-amber-700 font-semibold hover:bg-amber-50 transition-colors"
          >
            지원서 PDF 저장
          </button>
          <a href="/" className="block w-full text-center bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors">
            처음으로 돌아가기
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 py-8">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <p className="text-xs text-amber-700 font-semibold tracking-widest">해운대순복음교회</p>
          <h1 className="text-xl font-bold text-gray-900 mt-1">항존직 후보 지원</h1>
        </div>

        <StepIndicator step={step} />

        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          {step === 1 && <Step1 form={form} onChange={onChange} photoPreview={photoPreview} onPhotoChange={handlePhotoChange} />}
          {step === 2 && <Step2 form={form} onChange={onChange} />}
          {step === 3 && <Step3 form={form} onChange={onChange} />}
          {step === 4 && <Step4 form={form} onChange={onChange} />}
          {step === 5 && <Step5 form={form} score={score} />}

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              이전
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition-colors"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "제출 중..." : "최종 제출"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
