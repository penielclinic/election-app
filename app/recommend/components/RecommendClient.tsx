"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const POSITIONS = ["장로", "안수집사", "권사"] as const;
type Position = (typeof POSITIONS)[number];

const PDF_LINKS: Record<Position, string> = {
  장로: "/forms/장로후보자추천서.pdf",
  안수집사: "/forms/안수집사후보추천서.pdf",
  권사: "/forms/권사후보자추천서.pdf",
};

interface RecommendForm {
  recommend_position: Position | "";
  candidate_name: string;
  candidate_birth_date: string;
  candidate_phone: string;
  recommender_name: string;
  recommender_phone: string;
  recommender_relationship: string;
  recommend_reason: string;
}

const initialForm: RecommendForm = {
  recommend_position: "",
  candidate_name: "",
  candidate_birth_date: "",
  candidate_phone: "",
  recommender_name: "",
  recommender_phone: "",
  recommender_relationship: "",
  recommend_reason: "",
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1">{children}</label>
);

const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  />
);

export default function RecommendClient() {
  const [form, setForm] = useState<RecommendForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof RecommendForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.recommend_position) {
      setError("추천 직분을 선택해주세요.");
      return;
    }
    if (!form.candidate_name.trim()) {
      setError("후보자 이름을 입력해주세요.");
      return;
    }
    if (!form.recommender_name.trim()) {
      setError("추천인 이름을 입력해주세요.");
      return;
    }
    if (!form.recommender_phone.trim()) {
      setError("추천인 연락처를 입력해주세요.");
      return;
    }
    if (!form.recommend_reason.trim()) {
      setError("추천 사유를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: dbError } = await supabase.from("election_recommendations").insert({
      recommend_position: form.recommend_position,
      candidate_name: form.candidate_name.trim(),
      candidate_birth_date: form.candidate_birth_date.trim(),
      candidate_phone: form.candidate_phone.trim(),
      recommender_name: form.recommender_name.trim(),
      recommender_phone: form.recommender_phone.trim(),
      recommender_relationship: form.recommender_relationship.trim(),
      recommend_reason: form.recommend_reason.trim(),
      status: "submitted",
    });

    setLoading(false);

    if (dbError) {
      setError("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">추천서가 제출되었습니다</h2>
          <p className="text-sm text-gray-500 mb-2" style={{ wordBreak: "keep-all" }}>
            <span className="font-semibold text-amber-700">{form.recommend_position}</span>{" "}
            후보자{" "}
            <span className="font-semibold">{form.candidate_name}</span>님에 대한 추천이
            접수되었습니다.
          </p>
          <p className="text-xs text-gray-400 mb-8" style={{ wordBreak: "keep-all" }}>
            선거관리위원회에서 확인 후 연락드리겠습니다.
          </p>
          <Link
            href="/"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <p className="text-sm text-amber-700 font-semibold tracking-widest mb-1">
            해운대순복음교회
          </p>
          <h1 className="text-2xl font-bold text-gray-900">항존직 후보자 추천서</h1>
          <p className="text-xs text-gray-400 mt-1">온라인으로 후보자를 추천하실 수 있습니다.</p>
        </div>

        {/* PDF 다운로드 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-amber-800 mb-2">추천서 양식 다운로드 (오프라인 제출용)</p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((pos) => (
              <a
                key={pos}
                href={PDF_LINKS[pos]}
                download
                className="text-xs text-amber-700 border border-amber-300 bg-white px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap"
              >
                {pos} 추천서 PDF
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* 추천 직분 */}
          <div>
            <Label>추천 직분 *</Label>
            <div className="flex gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => set("recommend_position", pos)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.recommend_position === pos
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-amber-400"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-100 pt-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">후보자 정보</p>
          </div>

          <div>
            <Label>후보자 이름 *</Label>
            <Input
              value={form.candidate_name}
              onChange={(v) => set("candidate_name", v)}
              placeholder="성명"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>생년월일</Label>
              <Input
                value={form.candidate_birth_date}
                onChange={(v) => set("candidate_birth_date", v)}
                placeholder="예: 1970-01-01"
              />
            </div>
            <div>
              <Label>연락처</Label>
              <Input
                value={form.candidate_phone}
                onChange={(v) => set("candidate_phone", v)}
                placeholder="010-0000-0000"
              />
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-100 pt-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">추천인 정보</p>
          </div>

          <div>
            <Label>추천인 이름 *</Label>
            <Input
              value={form.recommender_name}
              onChange={(v) => set("recommender_name", v)}
              placeholder="성명"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>추천인 연락처 *</Label>
              <Input
                value={form.recommender_phone}
                onChange={(v) => set("recommender_phone", v)}
                placeholder="010-0000-0000"
              />
            </div>
            <div>
              <Label>후보자와의 관계</Label>
              <Input
                value={form.recommender_relationship}
                onChange={(v) => set("recommender_relationship", v)}
                placeholder="예: 같은 구역"
              />
            </div>
          </div>

          <div>
            <Label>추천 사유 *</Label>
            <textarea
              value={form.recommend_reason}
              onChange={(e) => set("recommend_reason", e.target.value)}
              placeholder="추천 사유를 자세히 작성해주세요."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-3 text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? "제출 중..." : "추천서 온라인 제출"}
        </button>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 underline">
            메인으로
          </Link>
        </div>
      </div>
    </main>
  );
}
