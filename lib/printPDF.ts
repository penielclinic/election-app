import { SERVICE_TYPES, SERVICE_YEARS } from "./types";
import type { ServiceRecords, ServiceType } from "./types";

export interface PrintCandidate {
  name: string;
  position: string;
  birthDate?: string | null;
  churchRegisterDate?: string | null;
  baptismDate?: string | null;
  baptismChurch?: string | null;
  officiantPastor?: string | null;
  ordinationDate?: string | null;
  ordinationChurch?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  familyMembers?: Array<{ name: string; relationship: string; age: string; church: string; position: string }>;
  careerHistory?: Array<{ company: string; position: string; startYear: string; endYear: string; notes: string }>;
  worshipSundayMain?: string | null;
  worshipSundayDay?: string | null;
  worshipWednesday?: string | null;
  worshipFriday?: string | null;
  worshipMission?: string | null;
  dawnPrayerWeekly?: string | null;
  tithe?: boolean | null;
  evangelismCount?: string | null;
  q1SundayWorship?: number | null;
  q2EveningWorship?: number | null;
  q2EveningWorshipReason?: string | null;
  q3WednesdayPrayer?: number | null;
  q3WednesdayPrayerReason?: string | null;
  q4FridayPrayer?: number | null;
  q4FridayPrayerReason?: string | null;
  q5DawnPrayer?: number | null;
  q5DawnPrayerReason?: string | null;
  q6SpecialMeeting?: number | null;
  q7SpiritBaptism?: boolean | null;
  q7SpiritEvidence?: string | null;
  q8AlcoholResolved?: boolean | null;
  q9Tithe?: number | null;
  q10Thanksgiving?: number | null;
  q11SeasonalOffering?: boolean | null;
  q12FamilyFaith?: boolean | null;
  q13MinistryCooperation?: boolean | null;
  serviceRecords?: ServiceRecords;
  checklistScore?: number | null;
  submittedAt?: string;
}

function esc(v: unknown): string {
  if (v === null || v === undefined || v === "") return "-";
  if (v === true) return "예";
  if (v === false) return "아니오";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function row(label: string, value: unknown, suffix = ""): string {
  return `<div class="row"><span class="label">${label}</span><span class="value">${esc(value)}${suffix}</span></div>`;
}

export function printCandidatePDF(data: PrintCandidate): void {
  const scoreItems: [string, number | null | undefined, number][] = [
    ["주일 성수", data.q1SundayWorship, 15],
    ["저녁예배", data.q2EveningWorship, 10],
    ["수요기도회", data.q3WednesdayPrayer, 5],
    ["금요기도회", data.q4FridayPrayer, 5],
    ["새벽기도회", data.q5DawnPrayer, 5],
    ["특별모임", data.q6SpecialMeeting, 5],
    ["십일조", data.q9Tithe, 15],
    ["감사헌금", data.q10Thanksgiving, 10],
    ["절기헌금", data.q11SeasonalOffering ? 5 : 0, 5],
    ["가족신앙", data.q12FamilyFaith ? 5 : 0, 5],
    ["목회협력", data.q13MinistryCooperation ? 5 : 0, 5],
  ];

  const familyRows = (data.familyMembers ?? [])
    .filter((m) => m.name)
    .map(
      (m) =>
        `<tr><td>${esc(m.name)}</td><td>${esc(m.relationship)}</td><td>${esc(m.age)}</td><td>${esc(m.church)}</td><td>${esc(m.position)}</td></tr>`
    )
    .join("");

  const careerRows = (data.careerHistory ?? [])
    .filter((c) => c.company)
    .map(
      (c) =>
        `<tr><td>${esc(c.company)}</td><td>${esc(c.position)}</td><td>${esc(c.startYear)}</td><td>${esc(c.endYear)}</td><td>${esc(c.notes)}</td></tr>`
    )
    .join("");

  const serviceRows = SERVICE_TYPES.map((type) => {
    const cells = SERVICE_YEARS.map((year) => {
      const checked = data.serviceRecords?.[year]?.[type as ServiceType];
      return `<td style="text-align:center">${checked ? "✓" : ""}</td>`;
    }).join("");
    return `<tr><td>${esc(type)}</td>${cells}</tr>`;
  }).join("");

  const scoreGrid = scoreItems
    .map(
      ([label, val, max]) =>
        `<div class="score-item"><div class="score-label">${label}</div><div class="score-val">${val ?? 0}<span class="score-max">/${max}</span></div></div>`
    )
    .join("");

  const reasonNote = (reason?: string | null) =>
    reason ? ` <span class="reason">(${esc(reason)})</span>` : "";

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>항존직 후보 지원서 - ${esc(data.name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Malgun Gothic', '맑은 고딕', AppleGothic, sans-serif;
      font-size: 10.5pt;
      color: #111;
      background: #fff;
      padding: 18mm 20mm;
    }
    h1 { font-size: 17pt; text-align: center; letter-spacing: 2px; margin-bottom: 4px; }
    .org { font-size: 9pt; color: #777; text-align: center; margin-bottom: 20px; }
    .section { margin-bottom: 14px; }
    .section-title {
      font-size: 9.5pt; font-weight: bold;
      background: #fdf3e0; padding: 4px 8px;
      border-left: 3px solid #b45309;
      margin-bottom: 6px;
    }
    .row { display: flex; padding: 3px 0; border-bottom: 0.5px solid #eee; }
    .label { width: 100px; color: #555; flex-shrink: 0; font-size: 9.5pt; }
    .value { flex: 1; font-size: 9.5pt; word-break: keep-all; }
    .reason { color: #666; font-size: 8.5pt; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 4px; }
    th { background: #f5f5f5; padding: 4px 6px; text-align: center; border: 0.5px solid #ccc; font-size: 8.5pt; }
    td { padding: 4px 6px; border: 0.5px solid #e0e0e0; font-size: 9pt; }
    .score-box {
      border: 1.5px solid #b45309; border-radius: 6px;
      padding: 10px 14px; margin-bottom: 14px;
    }
    .score-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .score-title { font-size: 10pt; font-weight: bold; color: #78350f; }
    .score-big { font-size: 22pt; font-weight: bold; color: #b45309; }
    .score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; }
    .score-item { border: 0.5px solid #e0e0e0; padding: 4px; text-align: center; border-radius: 3px; }
    .score-label { font-size: 7.5pt; color: #666; }
    .score-val { font-size: 9.5pt; font-weight: bold; }
    .score-max { font-size: 8pt; color: #999; font-weight: normal; }
    .footer { font-size: 8pt; color: #aaa; text-align: right; margin-top: 14px; }
    @media print {
      body { padding: 12mm 15mm; }
      @page { margin: 8mm; size: A4; }
    }
  </style>
</head>
<body>
  <h1>항존직 후보 지원서</h1>
  <p class="org">해운대순복음교회 선거관리위원회${data.submittedAt ? " &nbsp;|&nbsp; 접수: " + new Date(data.submittedAt).toLocaleString("ko-KR") : ""}</p>

  <div class="section">
    <div class="section-title">기본 정보</div>
    ${row("성명", data.name)}
    ${row("지원 직분", data.position)}
    ${row("생년월일", data.birthDate)}
    ${row("교회 등록일", data.churchRegisterDate)}
    ${row("세례(입교)일", data.baptismDate)}
    ${row("세례 교회", data.baptismChurch)}
    ${row("집례 목사", data.officiantPastor)}
    ${row("임직일", data.ordinationDate)}
    ${row("임직 교회", data.ordinationChurch)}
    ${row("휴대폰", data.phone)}
    ${row("이메일", data.email)}
    ${row("주소", data.address)}
  </div>

  ${familyRows ? `
  <div class="section">
    <div class="section-title">가족사항</div>
    <table>
      <thead><tr><th>성명</th><th>관계</th><th>연령</th><th>출석교회</th><th>직분</th></tr></thead>
      <tbody>${familyRows}</tbody>
    </table>
  </div>` : ""}

  ${careerRows ? `
  <div class="section">
    <div class="section-title">사회경력</div>
    <table>
      <thead><tr><th>직업(사업장)</th><th>직위</th><th>시작연도</th><th>종료연도</th><th>기타</th></tr></thead>
      <tbody>${careerRows}</tbody>
    </table>
  </div>` : ""}

  <div class="section">
    <div class="section-title">신앙생활 (예배)</div>
    ${row("주일 대예배", data.worshipSundayMain)}
    ${row("주일 낮예배", data.worshipSundayDay)}
    ${row("수요예배", data.worshipWednesday)}
    ${row("금요 성령기도회", data.worshipFriday)}
    ${row("선교회예배", data.worshipMission)}
    ${row("새벽기도 (주 회)", data.dawnPrayerWeekly)}
    ${row("십일조", data.tithe)}
    ${row("새가족 인도", data.evangelismCount, "명")}
  </div>

  <div class="score-box">
    <div class="score-header">
      <span class="score-title">자기점검표 총점</span>
      <span class="score-big">${data.checklistScore ?? 0}점</span>
    </div>
    <div class="score-grid">${scoreGrid}</div>
  </div>

  <div class="section">
    <div class="section-title">자기점검표 상세</div>
    <div class="row"><span class="label">1. 주일 성수</span><span class="value">${esc(data.q1SundayWorship)}점</span></div>
    <div class="row"><span class="label">2. 저녁예배</span><span class="value">${esc(data.q2EveningWorship)}점${reasonNote(data.q2EveningWorshipReason)}</span></div>
    <div class="row"><span class="label">3. 수요기도회</span><span class="value">${esc(data.q3WednesdayPrayer)}점${reasonNote(data.q3WednesdayPrayerReason)}</span></div>
    <div class="row"><span class="label">4. 금요기도회</span><span class="value">${esc(data.q4FridayPrayer)}점${reasonNote(data.q4FridayPrayerReason)}</span></div>
    <div class="row"><span class="label">5. 새벽기도회</span><span class="value">${esc(data.q5DawnPrayer)}점${reasonNote(data.q5DawnPrayerReason)}</span></div>
    <div class="row"><span class="label">6. 특별모임</span><span class="value">${esc(data.q6SpecialMeeting)}점</span></div>
    <div class="row"><span class="label">7. 성령세례</span><span class="value">${esc(data.q7SpiritBaptism)}${data.q7SpiritEvidence ? " - " + esc(data.q7SpiritEvidence) : ""}</span></div>
    <div class="row"><span class="label">8. 주초문제</span><span class="value">${esc(data.q8AlcoholResolved)}</span></div>
    <div class="row"><span class="label">9. 십일조</span><span class="value">${esc(data.q9Tithe)}점</span></div>
    <div class="row"><span class="label">10. 감사헌금</span><span class="value">${esc(data.q10Thanksgiving)}점</span></div>
    <div class="row"><span class="label">11. 절기헌금</span><span class="value">${esc(data.q11SeasonalOffering)}</span></div>
    <div class="row"><span class="label">12. 가족신앙</span><span class="value">${esc(data.q12FamilyFaith)}</span></div>
    <div class="row"><span class="label">13. 목회협력</span><span class="value">${esc(data.q13MinistryCooperation)}</span></div>
  </div>

  ${serviceRows ? `
  <div class="section">
    <div class="section-title">연도별 봉사</div>
    <table>
      <thead>
        <tr>
          <th style="text-align:left">봉사</th>
          ${SERVICE_YEARS.map((y) => `<th>${y}</th>`).join("")}
        </tr>
      </thead>
      <tbody>${serviceRows}</tbody>
    </table>
  </div>` : ""}

  <p class="footer">출력일: ${new Date().toLocaleString("ko-KR")}</p>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) {
    alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
