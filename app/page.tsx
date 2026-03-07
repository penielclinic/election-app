import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <p className="text-sm text-amber-700 font-semibold tracking-widest mb-2">
            해운대순복음교회
          </p>
          <h1 className="text-2xl font-bold text-gray-900" style={{ wordBreak: "keep-all" }}>
            항존직 선거 공고문
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            장로 · 안수집사 · 권사
          </p>
        </div>

        {/* 공고 내용 */}
        <div className="space-y-5 text-sm text-gray-700">
          <div className="flex gap-3">
            <span className="font-bold text-amber-700 whitespace-nowrap">1.</span>
            <div>
              <span className="font-semibold">투표 일시</span>
              <p className="mt-0.5">2026년 04월 12일 (주일)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="font-bold text-amber-700 whitespace-nowrap">2.</span>
            <div>
              <span className="font-semibold">투표 장소</span>
              <p className="mt-0.5">해운대순복음교회 본당</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="font-bold text-amber-700 whitespace-nowrap">3.</span>
            <div>
              <span className="font-semibold">항존직 입후보 자격요건</span>
              <p className="mt-0.5 text-gray-500">별지 참조</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="font-bold text-amber-700 whitespace-nowrap">4.</span>
            <div>
              <span className="font-semibold">입후보 등록기간</span>
              <p className="mt-0.5 font-semibold text-amber-800">2026년 3월 15일 ~ 3월 29일</p>
              <ul className="mt-1 space-y-0.5 text-gray-600" style={{ wordBreak: "keep-all" }}>
                <li>· 신청인: 본인 및 배우자</li>
                <li>· 구비서류: 입후보자 지원 신청서, 자기점검표</li>
                <li>· 제출처: 사무실 (또는 아래 온라인 접수)</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="font-bold text-amber-700 whitespace-nowrap">5.</span>
            <div>
              <span className="font-semibold">입후보자 선출</span>
              <p className="mt-0.5">전형위원회 (목회협력위)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="font-bold text-amber-700 whitespace-nowrap">6.</span>
            <div>
              <span className="font-semibold">투표</span>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="font-bold text-amber-700 whitespace-nowrap">7.</span>
            <div>
              <span className="font-semibold">선거 결과 공고</span>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="my-6 border-t border-gray-100" />

        <p className="text-center text-sm text-gray-500 mb-6">
          해운대순복음교회 선거관리위원회
        </p>

        {/* 지원 버튼 */}
        <Link
          href="/apply"
          className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          온라인 후보 지원하기
        </Link>

        <p className="text-xs text-center text-gray-400 mt-3" style={{ wordBreak: "keep-all" }}>
          지원 신청서와 자기점검표를 온라인으로 작성하고 제출합니다.
        </p>
      </div>

      <div className="mt-4">
        <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 underline">
          관리자 페이지
        </Link>
      </div>
    </main>
  );
}
