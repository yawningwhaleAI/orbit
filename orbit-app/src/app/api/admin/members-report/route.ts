import { NextRequest, NextResponse } from "next/server";
import { loadMembersReport, maskEmail, fmtDate, memberStatus } from "@/lib/admin-members";

// Self-contained HTML members report (inline CSS), for saving/screenshotting.
//   Invoke-WebRequest -Headers @{Authorization="Bearer <CRON_SECRET>"} -OutFile members.html <host>/api/admin/members-report
// Same data as /admin/members: emails masked, phone numbers never included.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const provided = (req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "").trim();
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { users, coffeesBy, perBuilding, stats } = await loadMembersReport();
  const rows = users
    .map(
      (u, i) => `<tr>
  <td class="n">${i + 1}</td>
  <td><div class="who"><span class="av">${esc(u.name.trim()[0]?.toUpperCase())}</span><div><b>${esc(u.name)}</b><small>${esc(maskEmail(u.email))}</small></div></div></td>
  <td>${esc([u.role, u.company].filter(Boolean).join(" · ") || "—")}</td>
  <td>${esc(u.building?.name ?? "—")}</td>
  <td><span class="pill ${memberStatus(u) === "Active" ? "on" : ""}">${esc(memberStatus(u))}</span></td>
  <td class="mut">${esc(fmtDate(u.createdAt))}</td>
  <td class="r">${u._count.ownerMatches}</td>
  <td class="r">${coffeesBy.get(u.id) || 0}</td>
</tr>`
    )
    .join("\n");

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Orbit members · ${esc(fmtDate(new Date()))}</title>
<style>
:root{--bg:#faf7f2;--card:#fffdf9;--ink:#1c1917;--soft:#57534e;--faint:#8a837c;--line:#ece5dc;--acc:#b45a1f;--tint:#fbeadc}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 -apple-system,Segoe UI,Inter,Roboto,sans-serif}
main{max-width:1060px;margin:0 auto;padding:40px 20px}
.brand{display:flex;align-items:center;gap:8px;font:600 22px Georgia,serif}.brand i{width:22px;height:12px;border:2px solid var(--acc);border-radius:50%;display:inline-block}
.eye{color:var(--acc);font-size:11px;letter-spacing:.18em;font-weight:700;margin:28px 0 6px}
h1{font:400 34px Georgia,serif;margin:0}.sub{color:var(--faint);margin-top:4px}
.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:24px 0 10px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px}.stat small{color:var(--faint);display:block}.stat b{font:400 30px Georgia,serif;color:var(--acc)}
.by{color:var(--soft);margin:6px 0 18px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}
th{font-size:12px;color:var(--faint);font-weight:500;text-align:left;padding:12px 14px;border-bottom:1px solid var(--line)}
td{padding:10px 14px;border-bottom:1px solid var(--line);vertical-align:middle}tr:last-child td{border-bottom:0}
.r{text-align:right}.n,.mut{color:var(--faint)}
.who{display:flex;gap:10px;align-items:center}.who small{display:block;color:var(--faint);font-size:12px}
.av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#e8954a,#a3572a);color:#2a1a10;display:grid;place-items:center;font:600 13px Georgia,serif;flex:none}
.pill{background:#f1ece5;color:var(--soft);border-radius:999px;padding:3px 10px;font-size:11px;font-weight:600}.pill.on{background:var(--tint);color:var(--acc)}
.foot{color:var(--faint);font-size:12px;margin-top:12px}
</style></head><body><main>
<div class="brand"><i></i>Orbit</div>
<div class="eye">MEMBERS</div>
<h1>Orbit members</h1>
<div class="sub">withinorbit.space · Gurugram pilot · as of ${esc(fmtDate(new Date()))}</div>
<div class="stats">${stats.map((s) => `<div class="stat"><small>${esc(s.k)}</small><b>${s.v}</b></div>`).join("")}</div>
${perBuilding.length ? `<div class="by">By building: ${perBuilding.map((b) => `${esc(b.name)} ${b.n}`).join(" · ")}</div>` : ""}
<table><thead><tr><th>#</th><th>Member</th><th>Role · Company</th><th>Building</th><th>Status</th><th>Joined</th><th class="r">Intros</th><th class="r">Coffees</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="foot">Active = signed in themselves · Listed = profile added by the team, not signed in yet · Emails masked; phone numbers not shown.</div>
</main></body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
