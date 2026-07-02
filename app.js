/* =========================================================
   CryptoX — in-memory state (no storage APIs)
========================================================= */
const ME = {
  id: "me",
  name: "Deair",
  handle: "deair_x",
  av: "DX",
  grad: "linear-gradient(135deg,#F5B841,#E4884F)",
  verified: true,
  bio: "Web dev student · builder of engines and empires · $BTC $ETH long-term, degen on weekends.",
  joined: "Mar 2025",
  followersN: 0,
};

/* ===== AUTH UI (backend-agnostic — see auth.js) ===== */
let signedIn = false;

function authTab(t) {
  document
    .getElementById("atSignin")
    .classList.toggle("active", t === "signin");
  document
    .getElementById("atRegister")
    .classList.toggle("active", t === "register");
  document
    .getElementById("atForgot")
    .classList.toggle("active", t === "forgot");
  document.getElementById("signinForm").style.display =
    t === "signin" ? "flex" : "none";
  document.getElementById("registerForm").style.display =
    t === "register" ? "flex" : "none";
  document.getElementById("forgotForm").style.display =
    t === "forgot" ? "flex" : "none";
  document.getElementById("siErr").textContent = "";
  document.getElementById("rgErr").textContent = "";
  document.getElementById("fpErr").textContent = "";
}

async function doSignin(e) {
  e.preventDefault();
  const res = await AuthAPI.signIn(
    document.getElementById("siUser").value,
    document.getElementById("siPass").value,
  );
  if (!res.ok) {
    document.getElementById("siErr").textContent = res.error;
    return false;
  }
  enterApp(res.user);
  return false;
}

async function doRegister(e) {
  e.preventDefault();
  const res = await AuthAPI.register({
    name: document.getElementById("rgName").value,
    handle: document.getElementById("rgHandle").value,
    email: document.getElementById("rgEmail").value,
    password: document.getElementById("rgPass").value,
  });
  if (!res.ok) {
    document.getElementById("rgErr").textContent = res.error;
    return false;
  }
  enterApp(res.user, true);
  return false;
}

async function doForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById("fpEmail").value;
  const password = document.getElementById("fpPass").value;
  const confirm = document.getElementById("fpPassConfirm").value;

  if (password !== confirm) {
    document.getElementById("fpErr").textContent = "Passwords do not match";
    return false;
  }

  const res = await AuthAPI.resetPassword(email, password);
  if (!res.ok) {
    document.getElementById("fpErr").textContent = res.error;
    return false;
  }

  document.getElementById("fpEmail").value = "";
  document.getElementById("fpPass").value = "";
  document.getElementById("fpPassConfirm").value = "";
  showToast('<b class="g">Password reset successful!</b> You can now sign in.');
  authTab("signin");
  return false;
}

function enterApp(user, isNew) {
  ME.name = user.name;
  ME.handle = user.handle;
  ME.av = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  ME.followersN = 0;
  demoBoost = { followers: 0, engagement: 0 };
  signedIn = true;
  localStorage.setItem("cryptox_session", JSON.stringify(user));
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("meCard").innerHTML =
    `<div class="av sm" style="background:${ME.grad}">${ME.av}</div>
     <div class="who"><div>${ME.name}</div><div class="h">@${ME.handle}</div></div>`;
  view = "home";
  tab = "foryou";
  render();
  showToast(
    isNew
      ? '<b class="g">Welcome to CryptoX,</b> @' + ME.handle
      : 'Signed in as <b class="g">@' + ME.handle + "</b>",
  );
}

async function signOut() {
  await AuthAPI.signOut();
  signedIn = false;
  localStorage.removeItem("cryptox_session");
  document.getElementById("authScreen").classList.remove("hidden");
  document.getElementById("siUser").value = "";
  document.getElementById("siPass").value = "";
  authTab("signin");
  showToast("Signed out");
}

/* Restore session from localStorage */
async function restoreSession() {
  const saved = localStorage.getItem("cryptox_session");
  if (saved) {
    try {
      const user = JSON.parse(saved);
      enterApp(user);
    } catch (e) {
      localStorage.removeItem("cryptox_session");
    }
  }
}

/* ===== MONETIZATION ===== */
const FUNDING_SECURED = false; // <-- flip to true when funding lands to launch Creator Payouts
const REQ = { followers: 2000, engagement: 1000000 }; // 2K followers AND 1M total likes+reposts
const PAY_RATE = 5.0; // $ per 1,000 likes earned this month
const BASE_ENGAGEMENT = {
  ora: 4230000,
  sat: 1910000,
  lun: 1140000,
  max: 612000,
  kev: 231000,
  me: 0,
};
let demoBoost = { followers: 0, engagement: 0 }; // demo lever to preview the eligible state
let paidOut = 0;

const USERS = {
  me: ME,
  sat: {
    id: "sat",
    name: "Satoshi's Ghost",
    handle: "satsghost",
    av: "SG",
    grad: "linear-gradient(135deg,#2DD4A7,#1FA6C9)",
    verified: true,
    bio: "On-chain analyst. I read mempools like tarot cards.",
    joined: "Jan 2021",
    followersN: 182000,
  },
  lun: {
    id: "lun",
    name: "Luna Vega",
    handle: "lunavega",
    av: "LV",
    grad: "linear-gradient(135deg,#B26BFF,#FF6BC1)",
    verified: true,
    bio: "DeFi researcher @ Nightshade Capital. Not financial advice, obviously.",
    joined: "Aug 2020",
    followersN: 96000,
  },
  max: {
    id: "max",
    name: "Max Leverage",
    handle: "maxlev100x",
    av: "ML",
    grad: "linear-gradient(135deg,#E4574F,#F5B841)",
    verified: false,
    bio: "Liquidated 14 times. Still here. 100x or nothing.",
    joined: "Nov 2021",
    followersN: 44000,
  },
  ora: {
    id: "ora",
    name: "Oracle Ann",
    handle: "oracle_ann",
    av: "OA",
    grad: "linear-gradient(135deg,#6BA6FF,#2DD4A7)",
    verified: true,
    bio: "Macro + crypto. Former rates trader. Charts don't lie, people do.",
    joined: "Feb 2019",
    followersN: 310000,
  },
  kev: {
    id: "kev",
    name: "Kevin Chainz",
    handle: "kevchainz",
    av: "KC",
    grad: "linear-gradient(135deg,#F5B841,#B26BFF)",
    verified: false,
    bio: "NFT survivor. Now I just stack sats and touch grass.",
    joined: "Jun 2022",
    followersN: 12000,
  },
};

const MARKET = [
  { sym: "BTC", name: "Bitcoin", price: 60168, chg: +2.68 },
  { sym: "ETH", name: "Ethereum", price: 1616.39, chg: +2.8 },
  { sym: "SOL", name: "Solana", price: 77.81, chg: +4.9 },
  { sym: "XRP", name: "XRP", price: 1.055, chg: +1.42 },
  { sym: "DOGE", name: "Dogecoin", price: 0.072437, chg: +1.61 },
  { sym: "AVAX", name: "Avalanche", price: 6.67, chg: +0.66 },
  { sym: "LINK", name: "Chainlink", price: 7.44, chg: +3.41 },
];

const PORTFOLIO = [
  { sym: "BTC", amt: 0.42, color: "#F5B841" },
  { sym: "ETH", amt: 3.1, color: "#6BA6FF" },
  { sym: "SOL", amt: 38, color: "#B26BFF" },
  { sym: "DOGE", amt: 21500, color: "#2DD4A7" },
];

let idc = 100;

let posts = [
  mkPost(
    "ora",
    "Fed pause + ETF inflows hitting 3-week highs. This is the setup $BTC bulls have been waiting for since March. Watching 108K as the breakout level. #macro",
    "bull",
    482,
    2100,
    "2h",
    [
      { u: "sat", t: "On-chain confirms — exchange reserves at 5-year lows." },
      { u: "max", t: "Already 40x long. See you at 120K or at the food bank." },
    ],
  ),
  mkPost(
    "sat",
    "Whale alert: 12,400 $ETH just moved off Coinbase into a fresh cold wallet. Someone big is accumulating quietly while retail argues about memecoins.",
    "bull",
    291,
    1400,
    "3h",
    [{ u: "lun", t: "Third large outflow this week. Pattern is forming." }],
  ),
  mkPost(
    "max",
    "$SOL down 2% and my group chat is acting like it's 2022 again. Zoom out. It's up 190% on the year. Weak hands feed strong portfolios.",
    "bull",
    167,
    893,
    "5h",
    [],
  ),
  mkPost(
    "lun",
    "Unpopular opinion: 90% of new DeFi protocols are just 2021 forks with better landing pages. Audit the tokenomics before you ape. $AVAX ecosystem is one of the few actually shipping. #DeFi",
    "bear",
    203,
    977,
    "6h",
    [{ u: "kev", t: "The landing pages ARE better though, credit where due." }],
  ),
  mkPost(
    "kev",
    "Reminder that if you bought $DOGE at any point and simply held through the pain, you're up huge today. +8% and the memes are flowing again.",
    "bull",
    521,
    3300,
    "8h",
    [],
  ),
  mkPost(
    "ora",
    "Risk management thread: never put more than 5% in a single alt, always take profit in tranches, and if a token's main utility is \"community\" — that's the exit sign. #riskmanagement",
    "bear",
    734,
    4100,
    "12h",
    [{ u: "me", t: "Saving this. The tranche tip already saved me once." }],
  ),
  mkPost(
    "sat",
    "$LINK quietly signing enterprise deals while nobody watches the chart. Fundamentals eventually get priced in. They always do.",
    "bull",
    148,
    655,
    "1d",
    [],
  ),
];

let notifications = [
  {
    icon: "♥",
    color: "#E4574F",
    text: "<b>Luna Vega</b> liked your comment on Oracle Ann's risk thread",
    time: "1h",
  },
  {
    icon: "⇄",
    color: "#2DD4A7",
    text: "<b>Kevin Chainz</b> reposted your take on $BTC accumulation",
    time: "4h",
  },
  {
    icon: "▲",
    color: "#F5B841",
    text: "Price alert: <b>$DOGE</b> crossed +8% in 24h",
    time: "6h",
  },
];

let watchlist = ["BTC", "ETH", "DOGE"];
let following = { ora: true, sat: true };
let view = "home";
let tab = "foryou";
let searchQ = "";
let openComments = {};
let profileUser = null;

function mkPost(u, text, sent, likes, reposts, time, comments) {
  return {
    id: "p" + idc++,
    u,
    text,
    sent,
    likes,
    reposts,
    time,
    comments: comments || [],
    liked: false,
    reposted: false,
  };
}

/* ============ MONETIZATION HELPERS ============ */
function engagementOf(id) {
  const own = posts
    .filter((p) => p.u === id)
    .reduce((s, p) => s + p.likes + p.reposts, 0);
  const boost = id === "me" ? demoBoost.engagement : 0;
  return (BASE_ENGAGEMENT[id] || 0) + own + boost;
}
function followersOf(id) {
  return (USERS[id].followersN || 0) + (id === "me" ? demoBoost.followers : 0);
}
function meetsRequirements(id) {
  return followersOf(id) >= REQ.followers && engagementOf(id) >= REQ.engagement;
}
function isMonetized(id) {
  return FUNDING_SECURED && meetsRequirements(id);
}
function monthEarnings(id) {
  if (!isMonetized(id)) return 0;
  // this month's earnable likes ≈ 6% of lifetime engagement (demo model)
  return ((engagementOf(id) * 0.06) / 1000) * PAY_RATE;
}

/* ============ RENDER HELPERS ============ */
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function rich(t) {
  return esc(t)
    .replace(
      /\$([A-Za-z]{2,6})\b/g,
      '<b class="cashtag" onclick="event.stopPropagation();tagSearch(\'$$$1\')">$$$1</b>',
    )
    .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
}
function avEl(u, cls) {
  const usr = USERS[u];
  return `<div class="av ${cls || ""}" style="background:${usr.grad}">${usr.av}</div>`;
}
function fmtN(n) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : n;
}
function fmtP(p) {
  return p >= 1000
    ? p.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : p.toFixed(p < 1 ? 4 : 2);
}

/* ============ POST CARD ============ */
function postHTML(p) {
  const u = USERS[p.u];
  const sent = p.sent
    ? `<span class="sent-tag ${p.sent}">${p.sent === "bull" ? "▲ BULLISH" : "▼ BEARISH"}</span>`
    : "";
  const rp = p.reposted ? `<div class="repost-label">⇄ You reposted</div>` : "";
  const cOpen = openComments[p.id];
  const commentsHTML = cOpen
    ? `
    <div class="comments" onclick="event.stopPropagation()">
      ${p.comments
        .map(
          (c) => `
        <div class="comment">${avEl(c.u, "sm")}
          <div class="c-body"><div class="c-top">${USERS[c.u].name}<span>@${USERS[c.u].handle}</span></div>${rich(c.t)}</div>
        </div>`,
        )
        .join("")}
      <div class="comment-box">
        <input id="ci-${p.id}" placeholder="Add your take…" onkeydown="if(event.key==='Enter')addComment('${p.id}')">
        <button onclick="addComment('${p.id}')">Reply</button>
      </div>
    </div>`
    : "";
  return `
  <article class="post" onclick="toggleComments('${p.id}')">
    ${avEl(p.u)}
    <div class="post-body">
      ${rp}
      <div class="post-top">
        <span class="name" onclick="event.stopPropagation();openProfile('${p.u}')">${u.name}</span>
        ${u.verified ? '<span class="verify">◆</span>' : ""}
        ${isMonetized(p.u) ? '<span class="money-badge" title="Monetized creator">$</span>' : ""}
        <span class="handle">@${u.handle}</span>
        <span class="time">· ${p.time}</span>
        ${sent}
      </div>
      <div class="post-text">${rich(p.text)}</div>
      <div class="actions" onclick="event.stopPropagation()">
        <button class="act c" onclick="toggleComments('${p.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z"/></svg>${p.comments.length || ""}
        </button>
        <button class="act r ${p.reposted ? "on" : ""}" onclick="doRepost('${p.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>${fmtN(p.reposts)}
        </button>
        <button class="act l ${p.liked ? "on" : ""}" onclick="doLike('${p.id}')">
          <svg viewBox="0 0 24 24" fill="${p.liked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4 1-4.5 2.5C10.9 4 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/></svg>${fmtN(p.likes)}
        </button>
        <button class="act" onclick="showToast('Link copied to clipboard')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>
        </button>
      </div>
      ${commentsHTML}
    </div>
  </article>`;
}

/* ============ VIEWS ============ */
function composerHTML() {
  return `
  <div class="composer">
    ${avEl("me")}
    <div style="flex:1">
      <textarea id="compose" placeholder="What's your call today? Use $TICKER to tag coins…" oninput="onCompose()" maxlength="400"></textarea>
      <div class="comp-tools">
        <div class="sentiment">
          <button class="sent-btn bull" id="sbBull" onclick="pickSent('bull')">▲ BULL</button>
          <button class="sent-btn bear" id="sbBear" onclick="pickSent('bear')">▼ BEAR</button>
        </div>
        <span class="char-count" id="cc">0 / 280</span>
        <button class="send" id="sendBtn" disabled onclick="publish()">Post</button>
      </div>
    </div>
  </div>`;
}
let composeSent = null;

function visiblePosts() {
  let list = posts;
  if (searchQ) {
    const q = searchQ.toLowerCase();
    list = list.filter(
      (p) =>
        p.text.toLowerCase().includes(q) ||
        USERS[p.u].name.toLowerCase().includes(q) ||
        ("@" + USERS[p.u].handle).toLowerCase().includes(q),
    );
  }
  if (view === "home" && tab === "following")
    list = list.filter((p) => following[p.u] || p.u === "me");
  if (view === "home" && tab === "bullish")
    list = list.filter((p) => p.sent === "bull");
  if (view === "home" && tab === "bearish")
    list = list.filter((p) => p.sent === "bear");
  return list;
}

function render() {
  const col = document.getElementById("feedCol");
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.toggle("active", b.dataset.view === view));

  if (view === "home" || view === "explore") {
    const title = view === "home" ? "Home" : "Explore";
    const tabs =
      view === "home"
        ? `
      <div class="tabs">
        <button class="tab ${tab === "foryou" ? "active" : ""}" onclick="setTab('foryou')">For You</button>
        <button class="tab ${tab === "following" ? "active" : ""}" onclick="setTab('following')">Following</button>
        <button class="tab ${tab === "bullish" ? "active" : ""}" onclick="setTab('bullish')">▲ Bullish</button>
        <button class="tab ${tab === "bearish" ? "active" : ""}" onclick="setTab('bearish')">▼ Bearish</button>
      </div>`
        : `<div style="height:8px"></div>`;
    const list = visiblePosts();
    col.innerHTML = `
      <div class="feed-head"><h1>${title}${searchQ ? ` — results for "${esc(searchQ)}"` : ""}</h1>${tabs}</div>
      ${view === "home" ? composerHTML() : ""}
      ${list.length ? list.map(postHTML).join("") : `<div class="empty"><b>Nothing here yet.</b><br>Try a different filter or search term.</div>`}`;
  } else if (view === "earnings") {
    if (!FUNDING_SECURED) {
      const f0 = followersOf("me"),
        e0 = engagementOf("me");
      col.innerHTML = `
        <div class="feed-head"><h1>Creator Payouts</h1><div style="height:8px"></div></div>
        <div style="padding:20px">
          <div class="earn-status">
            <b>Coming soon.</b> Creator Payouts launches once CryptoX secures funding.
            Requirements are locked in now, so build your audience early — accounts that qualify at launch are paid from day one.
          </div>
          <div class="req-card">
            <div class="req-top"><span>Followers (requirement at launch)</span><span class="mono">${f0.toLocaleString()} / ${REQ.followers.toLocaleString()}</span></div>
            <div class="prog"><div style="width:${Math.min(100, (f0 / REQ.followers) * 100)}%;background:var(--gold)"></div></div>
          </div>
          <div class="req-card">
            <div class="req-top"><span>Total likes + reposts, all posts (requirement at launch)</span><span class="mono">${e0.toLocaleString()} / ${REQ.engagement.toLocaleString()}</span></div>
            <div class="prog"><div style="width:${Math.min(100, (e0 / REQ.engagement) * 100)}%;background:var(--gold)"></div></div>
          </div>
          <div style="color:var(--dim);font-size:13px;margin-top:14px;line-height:1.6">
            Payout rate at launch: <b style="color:var(--text)">$${PAY_RATE.toFixed(2)} per 1,000 likes</b>.
            No payouts, badges, or balances are active until funding is secured.
          </div>
        </div>`;
      renderRail();
      return;
    }
    const f = followersOf("me"),
      e = engagementOf("me");
    const fPct = Math.min(100, (f / REQ.followers) * 100);
    const ePct = Math.min(100, (e / REQ.engagement) * 100);
    const eligible = isMonetized("me");
    const earned = monthEarnings("me");
    const balance = Math.max(0, earned - paidOut);
    col.innerHTML = `
      <div class="feed-head"><h1>Creator Payouts</h1><div style="height:8px"></div></div>
      <div style="padding:20px">
        <div class="earn-status ${eligible ? "ok" : ""}">
          ${
            eligible
              ? "<b>You're monetized.</b> Your posts now earn $" +
                PAY_RATE.toFixed(2) +
                " per 1,000 likes."
              : "<b>Not eligible yet.</b> Meet both requirements below to start earning on every post."
          }
        </div>

        <div class="req-card">
          <div class="req-top"><span>Followers</span><span class="mono">${f.toLocaleString()} / ${REQ.followers.toLocaleString()}</span></div>
          <div class="prog"><div style="width:${fPct}%;background:${fPct >= 100 ? "var(--bull)" : "var(--gold)"}"></div></div>
        </div>
        <div class="req-card">
          <div class="req-top"><span>Total likes + reposts (all posts)</span><span class="mono">${e.toLocaleString()} / ${REQ.engagement.toLocaleString()}</span></div>
          <div class="prog"><div style="width:${ePct}%;background:${ePct >= 100 ? "var(--bull)" : "var(--gold)"}"></div></div>
        </div>

        ${
          eligible
            ? `
        <div class="earn-balance">
          <div><div class="eb-label">This month</div><div class="eb-num mono">$${earned.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div></div>
          <div><div class="eb-label">Available balance</div><div class="eb-num mono">$${balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div></div>
          <button class="post-btn" style="margin:0" ${balance <= 0 ? "disabled" : ""} onclick="requestPayout()">Request payout</button>
        </div>`
            : `
        <button class="post-btn" style="margin-top:6px;width:auto;padding:12px 22px" onclick="simulateGrowth()">Demo: simulate a viral month</button>
        <div style="color:var(--dim);font-size:12.5px;margin-top:8px">Demo button adds followers and engagement so you can preview the monetized state.</div>`
        }

        <h3 style="margin:26px 0 6px;font-size:15px">Monetized creators on CryptoX</h3>
        ${Object.values(USERS)
          .filter((u) => u.id !== "me" && isMonetized(u.id))
          .map(
            (u) => `
          <div class="who-row">
            ${avEl(u.id, "sm")}
            <div class="w-info"><div>${u.name} <span class="money-badge">$</span></div>
            <div class="wh mono">${followersOf(u.id).toLocaleString()} followers · ${(engagementOf(u.id) / 1e6).toFixed(1)}M engagement · earns ~$${Math.round(monthEarnings(u.id)).toLocaleString()}/mo</div></div>
          </div>`,
          )
          .join("")}
      </div>`;
  } else if (view === "notifications") {
    col.innerHTML = `
      <div class="feed-head"><h1>Alerts</h1><div style="height:8px"></div></div>
      ${notifications
        .map(
          (n) => `
        <div class="post" style="cursor:default">
          <div class="av" style="background:var(--panel2);color:${n.color};font-size:18px">${n.icon}</div>
          <div class="post-body"><div class="post-text" style="margin-top:8px">${n.text} <span style="color:var(--dim);font-size:13px">· ${n.time}</span></div></div>
        </div>`,
        )
        .join("")}`;
    document.getElementById("alertBadge").style.display = "none";
  } else if (view === "watchlist") {
    const rows = MARKET.filter((m) => watchlist.includes(m.sym));
    col.innerHTML = `
      <div class="feed-head"><h1>Watchlist</h1><div style="height:8px"></div></div>
      <div style="padding:10px 20px">
        ${MARKET.map((m) => {
          const onList = watchlist.includes(m.sym);
          return `<div class="mkt-row" style="font-size:14px;padding:13px 0">
            <div><div class="msym">$${m.sym}</div><div class="mname">${m.name}</div></div>
            <div class="mkt-right">
              <div>$${fmtP(m.price)}</div>
              <div class="${m.chg >= 0 ? "up" : "down"}" style="font-size:11.5px">${m.chg >= 0 ? "+" : ""}${m.chg.toFixed(2)}%</div>
            </div>
            <button class="follow-btn ${onList ? "on" : ""}" style="margin-left:16px" onclick="toggleWatch('${m.sym}')">${onList ? "Watching" : "+ Watch"}</button>
          </div>`;
        }).join("")}
      </div>`;
  } else if (view === "profile" && profileUser) {
    const u = USERS[profileUser];
    const mine = posts.filter((p) => p.u === profileUser);
    const isMe = profileUser === "me";
    const fBtn = isMe
      ? ""
      : `<button class="follow-btn ${following[u.id] ? "on" : ""}" style="margin-left:auto" onclick="toggleFollow('${u.id}');openProfile('${u.id}')">${following[u.id] ? "Following" : "Follow"}</button>`;
    col.innerHTML = `
      <div class="profile-head">
        <button class="back" onclick="setView('home')">← Back to feed</button>
        <div class="profile-row">
          <div class="av lg" style="background:${u.grad}">${u.av}</div>
          <div><h2>${u.name} ${u.verified ? '<span class="verify">◆</span>' : ""}</h2><div class="ph">@${u.handle}</div></div>
          ${fBtn}
        </div>
        <div class="profile-bio">${rich(u.bio)}</div>
        <div class="profile-stats">
          <span><b>${mine.length}</b> posts</span>
          <span><b>${u.followersN || "—"}</b> followers</span>
          <span>Joined <b>${u.joined}</b></span>
        </div>
      </div>
      ${mine.length ? mine.map(postHTML).join("") : `<div class="empty"><b>No posts yet.</b><br>${isMe ? "Share your first call from the Home feed." : ""}</div>`}`;
  }

  renderRail();
}

/* ============ RAIL ============ */
function renderRail() {
  document.getElementById("mktList").innerHTML = MARKET.slice(0, 5)
    .map(
      (m) => `
    <div class="mkt-row" onclick="tagSearch('$${m.sym}')">
      <div><div class="msym">$${m.sym}</div><div class="mname">${m.name}</div></div>
      <div class="mkt-right"><div>$${fmtP(m.price)}</div>
      <div class="${m.chg >= 0 ? "up" : "down"}" style="font-size:11px">${m.chg >= 0 ? "+" : ""}${m.chg.toFixed(2)}%</div></div>
    </div>`,
    )
    .join("");

  const tags = {};
  posts.forEach((p) => {
    (p.text.match(/\$[A-Za-z]{2,6}\b/g) || []).forEach((t) => {
      t = t.toUpperCase();
      tags[t] = (tags[t] || 0) + 1 + Math.floor(p.likes / 50);
    });
  });
  const top = Object.entries(tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  document.getElementById("trendList").innerHTML = top
    .map(
      ([t, c], i) => `
    <div class="trend-row" onclick="tagSearch('${t}')">
      <div class="t-tag">${t}</div>
      <div class="t-meta">#${i + 1} trending · ${c * 137} posts</div>
    </div>`,
    )
    .join("");

  const vals = PORTFOLIO.map((h) => {
    const m = MARKET.find((x) => x.sym === h.sym);
    return { ...h, val: h.amt * (m ? m.price : 0) };
  });
  const total = vals.reduce((s, v) => s + v.val, 0);
  const wChg =
    vals.reduce((s, v) => {
      const m = MARKET.find((x) => x.sym === v.sym);
      return s + (m ? m.chg * v.val : 0);
    }, 0) / total;
  document.getElementById("pfTotal").textContent =
    "$" + total.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const pc = document.getElementById("pfChange");
  pc.textContent = (wChg >= 0 ? "▲ +" : "▼ ") + wChg.toFixed(2) + "% today";
  pc.className = "pf-change mono " + (wChg >= 0 ? "up" : "down");
  document.getElementById("pfBar").innerHTML = vals
    .map(
      (v) =>
        `<div style="width:${(v.val / total) * 100}%;background:${v.color}"></div>`,
    )
    .join("");
  document.getElementById("pfLegend").innerHTML = vals
    .map(
      (v) =>
        `<span><i style="background:${v.color}"></i>${v.sym} ${((v.val / total) * 100).toFixed(0)}%</span>`,
    )
    .join("");

  document.getElementById("whoList").innerHTML = Object.values(USERS)
    .filter((u) => u.id !== "me")
    .slice(0, 4)
    .map(
      (u) => `
    <div class="who-row">
      ${avEl(u.id, "sm")}
      <div class="w-info"><div>${u.name} ${u.verified ? '<span class="verify">◆</span>' : ""}</div><div class="wh">@${u.handle}</div></div>
      <button class="follow-btn ${following[u.id] ? "on" : ""}" onclick="toggleFollow('${u.id}')">${following[u.id] ? "Following" : "Follow"}</button>
    </div>`,
    )
    .join("");
}

/* ============ TICKER TAPE ============ */
function renderTape() {
  const items = [...MARKET, ...MARKET]
    .map(
      (m) => `
    <span class="tape-item"><span class="sym">$${m.sym}</span>
    <span>$${fmtP(m.price)}</span>
    <span class="${m.chg >= 0 ? "up" : "down"}">${m.chg >= 0 ? "▲" : "▼"} ${Math.abs(m.chg).toFixed(2)}%</span></span>`,
    )
    .join("");
  document.getElementById("tape").innerHTML = items;
}

/* Simulated live prices */
setInterval(() => {
  MARKET.forEach((m) => {
    const drift = (Math.random() - 0.5) * 0.004;
    m.price = Math.max(0.0001, m.price * (1 + drift));
    m.chg += drift * 100;
  });
  renderTape();
  renderRail();
  if (view === "watchlist") render();
}, 4000);

/* ============ ACTIONS ============ */
function setView(v) {
  view = v;
  searchQ = "";
  document.getElementById("searchBox").value = "";
  render();
  document.getElementById("feedCol").scrollTop = 0;
}
function setTab(t) {
  tab = t;
  render();
}
function openProfile(id) {
  profileUser = id;
  view = "profile";
  render();
  document.getElementById("feedCol").scrollTop = 0;
}
function tagSearch(t) {
  searchQ = t;
  view = "explore";
  document.getElementById("searchBox").value = t;
  render();
}
function onSearch(v) {
  searchQ = v.trim();
  if (view !== "home" && view !== "explore") view = "explore";
  render();
}

function doLike(id) {
  const p = posts.find((x) => x.id === id);
  p.liked = !p.liked;
  p.likes += p.liked ? 1 : -1;
  render();
}
function doRepost(id) {
  const p = posts.find((x) => x.id === id);
  p.reposted = !p.reposted;
  p.reposts += p.reposted ? 1 : -1;
  showToast(p.reposted ? "Reposted to your followers" : "Repost removed");
  render();
}
function toggleComments(id) {
  openComments[id] = !openComments[id];
  render();
}
function addComment(id) {
  const inp = document.getElementById("ci-" + id);
  const t = inp.value.trim();
  if (!t) return;
  posts.find((x) => x.id === id).comments.push({ u: "me", t });
  render();
  openComments[id] = true;
  render();
}
function toggleFollow(id) {
  following[id] = !following[id];
  showToast(
    following[id]
      ? `Now following <b class="g">@${USERS[id].handle}</b>`
      : `Unfollowed @${USERS[id].handle}`,
  );
  render();
}
function toggleWatch(sym) {
  const i = watchlist.indexOf(sym);
  if (i > -1) {
    watchlist.splice(i, 1);
    showToast(`$${sym} removed from watchlist`);
  } else {
    watchlist.push(sym);
    showToast(`<b class="g">$${sym}</b> added to watchlist`);
  }
  render();
}

/* Monetization actions */
function simulateGrowth() {
  if (!FUNDING_SECURED) {
    showToast("Payouts are locked until funding is secured");
    return;
  }
  demoBoost.followers += 700 + Math.floor(Math.random() * 600);
  demoBoost.engagement += 320000 + Math.floor(Math.random() * 260000);
  showToast('<b class="g">Viral month simulated.</b> Stats updated');
  render();
}
function requestPayout() {
  if (!FUNDING_SECURED) {
    showToast("Payouts are locked until funding is secured");
    return;
  }
  const bal = Math.max(0, monthEarnings("me") - paidOut);
  paidOut += bal;
  showToast(
    '<b class="g">$' +
      bal.toLocaleString("en-US", { maximumFractionDigits: 2 }) +
      "</b> payout requested — arrives in 3–5 days",
  );
  render();
}

/* Composer */
function focusComposer() {
  setView("home");
  setTimeout(() => document.getElementById("compose")?.focus(), 50);
}
function pickSent(s) {
  composeSent = composeSent === s ? null : s;
  document
    .getElementById("sbBull")
    .classList.toggle("on", composeSent === "bull");
  document
    .getElementById("sbBear")
    .classList.toggle("on", composeSent === "bear");
}
function onCompose() {
  const ta = document.getElementById("compose");
  const n = ta.value.length;
  const cc = document.getElementById("cc");
  cc.textContent = n + " / 280";
  cc.classList.toggle("over", n > 280);
  document.getElementById("sendBtn").disabled = n === 0 || n > 280;
  ta.style.height = "auto";
  ta.style.height = ta.scrollHeight + "px";
}
function publish() {
  const ta = document.getElementById("compose");
  const t = ta.value.trim();
  if (!t) return;
  posts.unshift(mkPost("me", t, composeSent, 0, 0, "now", []));
  composeSent = null;
  tab = "foryou";
  render();
  showToast('<b class="g">Posted.</b> Your call is live');
}

/* Toast */
let toastT;
function showToast(html) {
  const t = document.getElementById("toast");
  t.innerHTML = html;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 2400);
}

/* Init */
renderTape();
render(); // pre-render behind the auth screen so entry is instant
restoreSession();
