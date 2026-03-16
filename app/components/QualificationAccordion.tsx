"use client";

import { useState } from "react";

export default function QualificationAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 font-semibold text-left hover:text-amber-700 transition-colors"
        style={{ wordBreak: "keep-all" }}
      >
        항존직 입후보 자격요건 및 추천서 작성 유의사항
        <span className="text-amber-600 text-xs ml-1 shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="mt-3 space-y-5 text-xs text-gray-700 bg-amber-50 rounded-xl p-4 border border-amber-100"
          style={{ wordBreak: "keep-all" }}
        >
          {/* 장로 */}
          <div>
            <p className="font-bold text-amber-800 mb-1">〈 장로 자격 요건 〉</p>
            <p>
              장로는 해당교회 안수집사·권사로서 각기 무흠히 3년 이상 봉사한 자로 한다.
              (딛 1:5-9, 딤전 3:1-7에 거리낌이 없어야 한다)
            </p>
          </div>

          <div>
            <p className="font-bold text-amber-800 mb-1">〈 장로 후보자 추천서 작성 유의사항 〉</p>
            <ol className="space-y-2 list-decimal list-inside">
              <li>
                장로 후보자의 추천은 장로, 권사, 안수집사, 서리집사가 할 수 있다.
              </li>
              <li>
                추천자는 반드시 공동추천인 2명의 추천을 받아야 하며, 공동추천인은 동일
                부서·교구·구역이 아닌 사람이어야 한다.
                <p className="mt-1 ml-4 text-gray-500">
                  · 장로, 권사, 안수집사, 서리집사가 공동추천인이 될 수 있다.
                </p>
              </li>
              <li>
                교회는 인사위원회(목회협력위)를 개최하고, 후보자 추천서를 참고하여 후보자가
                교회 정관의 장로 자격 기준에 적합한 자인지 여부를 심사한다.
                <p className="mt-1 ml-4 text-gray-500">
                  · 결격사유가 없는 후보자에 대해서는 장로 후보자 추천 동의서를 받는다.
                </p>
              </li>
            </ol>
          </div>

          {/* 안수집사·권사 */}
          <div>
            <p className="font-bold text-amber-800 mb-1">〈 안수집사 및 권사 자격 요건 〉</p>
            <ol className="space-y-2 list-decimal list-inside">
              <li>안수집사 및 권사는 딤전 3:8-13에 거리낌이 없어야 한다.</li>
            </ol>
          </div>

          <div>
            <p className="font-bold text-amber-800 mb-1">
              〈 안수집사 및 권사 후보자 추천서 작성 유의사항 〉
            </p>
            <ol className="space-y-2 list-decimal list-inside">
              <li>
                안수집사 및 권사 후보자 추천은 교회 목자, 선교회장, 권사회장,
                안수집사회장이 할 수 있다.
              </li>
              <li>
                추천자는 반드시 공동추천인 2명의 추천을 받아야 하며, 공동추천인은 동일
                부서·교구·구역이 아닌 사람이어야 한다.
                <p className="mt-1 ml-4 text-gray-500">
                  · 공동추천인은 장로, 권사, 안수집사, 서리집사로 제한한다.
                </p>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
