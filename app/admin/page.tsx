"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SCORE_BREAKDOWN } from "@/lib/scoring";
import { SERVICE_TYPES, SERVICE_YEARS } from "@/lib/types";
import type { ServiceRecords, ServiceType } from "@/lib/types";
import { printCandidatePDF } from "@/lib/printPDF";

const ADMIN_PASSWORD = "20261900";

interface RawCandidate {
  id: string;
  created_at: string;
  name: string;
  position: string;
  birth_date: string;
  church_register_date: string;
  baptism_date: string;
  baptism_church: string;
  officiant_pastor: string;
  ordination_date: string;
  ordination_church: string;
  phone: string;
  email: string;
  address: string;
  family_members: Array<{ name: string; relationship: string; age: string; church: string; position: string }>;
  career_history: Array<{ company: string; position: string; startYear: string; endYear: string; notes: string }>;
  worship_sunday_main: string;
  worship_sunday_day: string;
  worship_wednesday: string;
  worship_friday: string;
  worship_mission: string;
  dawn_prayer_weekly: string;
  tithe: boolean;
  evangelism_count: string;
  q1_sunday_worship: number;
  q2_evening_worship: number;
  q2_evening_worship_reason: string;
  q3_wednesday_prayer: number;
  q3_wednesday_prayer_reason: string;
  q4_friday_prayer: number;
  q4_friday_prayer_reason: string;
  q5_dawn_prayer: number;
  q5_dawn_prayer_reason: string;
  q6_special_meeting: number;
  q7_spirit_baptism: boolean;
  q7_spirit_evidence: string;
  q8_alcohol_resolved: boolean;
  q9_tithe: number;
  q10_thanksgiving: number;
  q11_seasonal_offering: boolean;
  q12_family_faith: boolean;
  q13_ministry_cooperation: boolean;
  service_records: ServiceRecords;
  checklist_score: number;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  submitted: "접수됨",
  reviewed: "검토중",
  approved: "승인",
  rejected: "반려",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  reviewed: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function DetailModal({
  candidate,
  onClose,
  onStatusChange,
}: {
  candidate: RawCandidate;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 border-b border-amber-100 pb-1">
        {title}
      </h3>
      {children}
    </div>
  );

  const Row = ({ label, value }: { label: string; value: string | number | boolean | null | undefined }) => {
    const display =
      value === true ? "예" : value === false ? "아니오" : value == null ? "-" : String(value);
    return (
      <div className="flex gap-2 py-1 text-sm border-b border-gray-50">
        <span className="text-gray-500 w-32 shrink-0 whitespace-nowrap">{label}</span>
        <span className="text-gray-800">{display || "-"}</span>
      </div>
    );
  };

  const scoreItems: [string, number | null, number][] = [
    ["주일 성수", candidate.q1_sunday_worship, 15],
    ["저녁예배", candidate.q2_evening_worship, 10],
    ["수요기도회", candidate.q3_wednesday_prayer, 5],
    ["금요기도회", candidate.q4_friday_prayer, 5],
    ["새벽기도회", candidate.q5_dawn_prayer, 5],
    ["특별모임", candidate.q6_special_meeting, 5],
    ["십일조", candidate.q9_tithe, 15],
    ["감사헌금", candidate.q10_thanksgiving, 10],
    ["절기헌금", candidate.q11_seasonal_offering ? 5 : 0, 5],
    ["가족신앙", candidate.q12_family_faith ? 5 : 0, 5],
    ["목회협력", candidate.q13_ministry_cooperation ? 5 : 0, 5],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              <span className="whitespace-nowrap">{candidate.name}</span>{" "}
              <span className="text-amber-600 text-base font-semibold">{candidate.position}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              접수: {new Date(candidate.created_at).toLocaleString("ko-KR")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[candidate.status]}`}>
              {STATUS_LABELS[candidate.status]}
            </span>
            <button
              onClick={() =>
                printCandidatePDF({
                  name: candidate.name,
                  position: candidate.position,
                  birthDate: candidate.birth_date,
                  churchRegisterDate: candidate.church_register_date,
                  baptismDate: candidate.baptism_date,
                  baptismChurch: candidate.baptism_church,
                  officiantPastor: candidate.officiant_pastor,
                  ordinationDate: candidate.ordination_date,
                  ordinationChurch: candidate.ordination_church,
                  phone: candidate.phone,
                  email: candidate.email,
                  address: candidate.address,
                  familyMembers: candidate.family_members,
                  careerHistory: candidate.career_history,
                  worshipSundayMain: candidate.worship_sunday_main,
                  worshipSundayDay: candidate.worship_sunday_day,
                  worshipWednesday: candidate.worship_wednesday,
                  worshipFriday: candidate.worship_friday,
                  worshipMission: candidate.worship_mission,
                  dawnPrayerWeekly: candidate.dawn_prayer_weekly,
                  tithe: candidate.tithe,
                  evangelismCount: candidate.evangelism_count,
                  q1SundayWorship: candidate.q1_sunday_worship,
                  q2EveningWorship: candidate.q2_evening_worship,
                  q2EveningWorshipReason: candidate.q2_evening_worship_reason,
                  q3WednesdayPrayer: candidate.q3_wednesday_prayer,
                  q3WednesdayPrayerReason: candidate.q3_wednesday_prayer_reason,
                  q4FridayPrayer: candidate.q4_friday_prayer,
                  q4FridayPrayerReason: candidate.q4_friday_prayer_reason,
                  q5DawnPrayer: candidate.q5_dawn_prayer,
                  q5DawnPrayerReason: candidate.q5_dawn_prayer_reason,
                  q6SpecialMeeting: candidate.q6_special_meeting,
                  q7SpiritBaptism: candidate.q7_spirit_baptism,
                  q7SpiritEvidence: candidate.q7_spirit_evidence,
                  q8AlcoholResolved: candidate.q8_alcohol_resolved,
                  q9Tithe: candidate.q9_tithe,
                  q10Thanksgiving: candidate.q10_thanksgiving,
                  q11SeasonalOffering: candidate.q11_seasonal_offering,
                  q12FamilyFaith: candidate.q12_family_faith,
                  q13MinistryCooperation: candidate.q13_ministry_cooperation,
                  serviceRecords: candidate.service_records,
                  checklistScore: candidate.checklist_score,
                  submittedAt: candidate.created_at,
                })
              }
              className="text-xs text-amber-600 border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-50 transition-colors"
            >
              PDF 저장
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
              ×
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* 점수 요약 */}
          <div className="bg-amber-50 rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-amber-800">자기점검표 총점</span>
              <span className="text-2xl font-bold text-amber-700">{candidate.checklist_score}점</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {scoreItems.map(([label, val, max]) => (
                <div key={label} className="bg-white rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500 whitespace-nowrap">{label}</p>
                  <p className="text-sm font-bold text-gray-800">
                    {val ?? 0}<span className="text-xs text-gray-400">/{max}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Section title="기본 정보">
            <Row label="생년월일" value={candidate.birth_date} />
            <Row label="교회 등록일" value={candidate.church_register_date} />
            <Row label="세례(입교)일" value={candidate.baptism_date} />
            <Row label="세례 교회" value={candidate.baptism_church} />
            <Row label="집례 목사" value={candidate.officiant_pastor} />
            <Row label="임직일" value={candidate.ordination_date} />
            <Row label="임직 교회" value={candidate.ordination_church} />
            <Row label="휴대폰" value={candidate.phone} />
            <Row label="이메일" value={candidate.email} />
            <Row label="주소" value={candidate.address} />
          </Section>

          {/* 가족사항 */}
          {candidate.family_members?.length > 0 && (
            <Section title="가족사항">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-1.5 px-2 text-gray-500 font-medium">성명</th>
                      <th className="text-left py-1.5 px-2 text-gray-500 font-medium">관계</th>
                      <th className="text-left py-1.5 px-2 text-gray-500 font-medium">연령</th>
                      <th className="text-left py-1.5 px-2 text-gray-500 font-medium">출석교회</th>
                      <th className="text-left py-1.5 px-2 text-gray-500 font-medium">직분</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidate.family_members.filter((m) => m.name).map((m, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-1.5 px-2 whitespace-nowrap">{m.name}</td>
                        <td className="py-1.5 px-2 whitespace-nowrap">{m.relationship}</td>
                        <td className="py-1.5 px-2 whitespace-nowrap">{m.age}</td>
                        <td className="py-1.5 px-2 whitespace-nowrap">{m.church}</td>
                        <td className="py-1.5 px-2 whitespace-nowrap">{m.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          <Section title="신앙생활 (예배)">
            <Row label="주일 대예배" value={candidate.worship_sunday_main} />
            <Row label="주일 낮예배" value={candidate.worship_sunday_day} />
            <Row label="수요예배" value={candidate.worship_wednesday} />
            <Row label="금요 성령기도회" value={candidate.worship_friday} />
            <Row label="선교회예배" value={candidate.worship_mission} />
            <Row label="새벽기도 (주 회)" value={candidate.dawn_prayer_weekly} />
            <Row label="십일조" value={candidate.tithe} />
            <Row label="새가족 인도 (명)" value={candidate.evangelism_count} />
          </Section>

          <Section title="자기점검표">
            <Row label="성령세례" value={candidate.q7_spirit_baptism} />
            {candidate.q7_spirit_evidence && (
              <Row label="성령세례 증거" value={candidate.q7_spirit_evidence} />
            )}
            <Row label="주초문제 해결" value={candidate.q8_alcohol_resolved} />
            {candidate.q2_evening_worship_reason && (
              <Row label="저녁예배 사유" value={candidate.q2_evening_worship_reason} />
            )}
            {candidate.q3_wednesday_prayer_reason && (
              <Row label="수요기도회 사유" value={candidate.q3_wednesday_prayer_reason} />
            )}
            {candidate.q4_friday_prayer_reason && (
              <Row label="금요기도회 사유" value={candidate.q4_friday_prayer_reason} />
            )}
            {candidate.q5_dawn_prayer_reason && (
              <Row label="새벽기도회 사유" value={candidate.q5_dawn_prayer_reason} />
            )}
          </Section>

          {/* 연도별 봉사 */}
          <Section title="연도별 봉사">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-1.5 pr-2 text-gray-500 font-medium">봉사</th>
                    {SERVICE_YEARS.map((y) => (
                      <th key={y} className="text-center py-1.5 px-2 text-gray-500 font-medium whitespace-nowrap">
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
                        <td key={year} className="text-center py-1.5 px-2">
                          {candidate.service_records?.[year]?.[type as ServiceType] ? (
                            <span className="text-amber-600 font-bold">✓</span>
                          ) : (
                            <span className="text-gray-200">–</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 상태 변경 */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">상태 변경</p>
            <div className="flex gap-2">
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(candidate.id, status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    candidate.status === status
                      ? STATUS_COLORS[status] + " ring-1 ring-offset-1 ring-current"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [candidates, setCandidates] = useState<RawCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<RawCandidate | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("비밀번호가 올바르지 않습니다.");
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("election_candidates")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCandidates(data as RawCandidate[]);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchCandidates();
  }, [authed]);

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("election_candidates").update({ status }).eq("id", id);
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-lg font-bold text-gray-900 mb-1">관리자 로그인</h1>
          <p className="text-xs text-gray-500 mb-6">해운대순복음교회 선거관리위원회</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="비밀번호"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3"
          />
          {pwError && <p className="text-xs text-red-500 mb-2">{pwError}</p>}
          <button
            onClick={login}
            className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-700 transition-colors"
          >
            로그인
          </button>
          <div className="mt-4 text-center">
            <a href="/" className="text-xs text-gray-400 hover:text-gray-600 underline">
              메인으로
            </a>
          </div>
        </div>
      </main>
    );
  }

  const positions = ["all", "장로", "안수집사", "권사"];
  const filtered =
    filter === "all" ? candidates : candidates.filter((c) => c.position === filter);

  const avgScore =
    candidates.length > 0
      ? Math.round(candidates.reduce((s, c) => s + (c.checklist_score || 0), 0) / candidates.length)
      : 0;

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">항존직 선거 관리</h1>
            <p className="text-xs text-gray-500 mt-0.5">해운대순복음교회 선거관리위원회</p>
          </div>
          <button
            onClick={fetchCandidates}
            className="text-xs text-amber-600 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
          >
            새로고침
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">전체 접수</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{candidates.length}명</p>
          </div>
          {["장로", "안수집사", "권사"].map((pos) => (
            <div key={pos} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">{pos}</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {candidates.filter((c) => c.position === pos).length}명
              </p>
            </div>
          ))}
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-4">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setFilter(pos)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === pos
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
              }`}
            >
              {pos === "all" ? "전체" : pos}
            </button>
          ))}
        </div>

        {/* 목록 */}
        {loading ? (
          <div className="text-center py-10 text-gray-400">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">접수된 지원서가 없습니다.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 whitespace-nowrap">{c.name}</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {c.position}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.phone} · {new Date(c.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-amber-600">{c.checklist_score ?? "-"}</p>
                  <p className="text-xs text-gray-400">/ 100점</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          candidate={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </main>
  );
}
