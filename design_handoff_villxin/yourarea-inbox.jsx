/* YourArea — Mail Center (inbox view). Exposes window.YaInbox. */
(function () {
  const { useState } = React;
  const Icon = window.Icon;

  /* demo data — real app: DM backend */
  const REQUESTS = [
    { id: "r1", user: "moth.to.flame", date: "Jul 10 2026", text: "hi!! saw you in grave.bloom's top 8 — do you have the ashfall demo bootleg from the livestream?" },
    { id: "r2", user: "sxlemnity", date: "Jul 09 2026", text: "your comment on the tidewreck thread was so right. can we talk lyrics?" },
  ];
  const MESSAGES = [
    { id: "m1", user: "emberwitch", subject: "re: that bridge", date: "Jul 10 2026 · 11:58 PM", unread: true,
      thread: [
        { from: "you", text: "hey — the hollow sun demo wrecked me. is the bridge in open C?" },
        { from: "emberwitch", text: "RIGHT?? i think it's drop A actually. static.saint tabbed it in the boards" },
        { from: "emberwitch", text: "also villxin liked my comment i am unwell" },
      ] },
    { id: "m2", user: "tidewrecked", subject: "carpool to the first show??", date: "Jul 08 2026 · 6:12 PM", unread: true,
      thread: [
        { from: "tidewrecked", text: "if the ashfall release show happens i'm driving down. 2 seats free. bring blankets" },
      ] },
    { id: "m3", user: "villxin", subject: "welcome to yourarea", date: "Jun 24 2026 · 12:00 AM", unread: false, official: true,
      thread: [
        { from: "villxin", text: "you found it. this place is small on purpose. leave a comment, claim your corner, be kind to each other. — v" },
      ] },
  ];

  function YaInbox() {
    const [folder, setFolder] = useState("inbox");
    const [requests, setRequests] = useState(REQUESTS);
    const [messages, setMessages] = useState(MESSAGES);
    const [openId, setOpenId] = useState(null);
    const [note, setNote] = useState(null);
    const open = messages.find((m) => m.id === openId);

    function decide(id, accepted) {
      const req = requests.find((r) => r.id === id);
      setRequests((rs) => rs.filter((r) => r.id !== id));
      if (accepted) {
        setMessages((ms) => [{ id: "m-" + id, user: req.user, subject: "(new conversation)", date: req.date, unread: true, thread: [{ from: req.user, text: req.text }] }, ...ms]);
        setNote({ k: "ok", t: req.user + " accepted — their message moved to your inbox." });
      } else {
        setNote({ k: "dim", t: "Declined. " + req.user + " isn't notified — the request just quietly expires." });
      }
    }
    function openMsg(m) {
      setOpenId(m.id);
      setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, unread: false } : x)));
    }

    const unread = messages.filter((m) => m.unread).length;
    const folders = [
      { id: "inbox", label: "Inbox", count: unread },
      { id: "requests", label: "Message Requests", count: requests.length },
      { id: "sent", label: "Sent" },
      { id: "trash", label: "Trash" },
    ];

    return (
      <div className="wrap ya__page ya__page--inbox" data-screen-label="YourArea Inbox">
        {/* ---------- folder sidebar ---------- */}
        <div>
          <section className="yabox" style={{ marginBottom: 18 }}>
            <div className="yabox__hd">Mail Center</div>
            <nav className="ya__folders" aria-label="Mail folders">
              {folders.map((f) => (
                <button key={f.id} type="button" className={folder === f.id ? "is-here" : ""} onClick={() => { setFolder(f.id); setOpenId(null); setNote(null); }}>
                  {f.label}{f.count ? <b>{f.count}</b> : null}
                </button>
              ))}
            </nav>
          </section>
          <p className="ya__counter" style={{ textAlign: "left" }}>DMs open by request only.<br />Accepts are revocable — block<br />from any thread, any time.</p>
        </div>

        {/* ---------- main pane ---------- */}
        <div>
          {note && <p className={"ya__note " + note.k} style={{ margin: "0 0 12px" }}>{note.t}</p>}

          {folder === "requests" && (
            <section className="yabox yabox--v">
              <div className="yabox__hd">Message requests ({requests.length})</div>
              {requests.length === 0 && <div className="yabox__bd"><p style={{ fontStyle: "italic", color: "var(--text-faint)" }}>No pending requests. Peace.</p></div>}
              {requests.map((r) => (
                <div className="ya__req" key={r.id}>
                  <div className="who">
                    <span className="av">{r.user[0].toUpperCase()}</span>
                    <div className="nm">{r.user}</div>
                  </div>
                  <div>
                    <div className="when">{r.date} · wants to message you</div>
                    <div className="txt">"{r.text}"</div>
                    <div className="ya__req-row">
                      <button className="btn btn--primary" type="button" onClick={() => decide(r.id, true)}>Accept</button>
                      <button className="btn" type="button" onClick={() => decide(r.id, false)}>Decline</button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {folder === "inbox" && !open && (
            <section className="yabox">
              <div className="yabox__hd">Inbox — {unread} unread</div>
              <table className="ya__mail">
                <tbody>
                  {messages.map((m) => (
                    <tr key={m.id} className={m.unread ? "unread" : ""} onClick={() => openMsg(m)}>
                      <td className="frm">{m.user}{m.official && <span className="ya__official" style={{ marginLeft: 6 }}>Official</span>}</td>
                      <td className="sub"><a href="#inbox" onClick={(e) => e.preventDefault()}>{m.subject}</a></td>
                      <td className="dt">{m.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {folder === "inbox" && open && (
            <section className="yabox">
              <div className="yabox__hd ya__thread-hd">
                <button type="button" className="bk" onClick={() => setOpenId(null)}>← Inbox</button>
                <span>{open.user} — {open.subject}</span>
                <button type="button" className="blk" onClick={() => { setOpenId(null); setMessages((ms) => ms.filter((x) => x.id !== open.id)); setNote({ k: "dim", t: "Access revoked. The thread is closed on both ends — " + open.user + " can't message you again unless you accept a new request." }); }}>Revoke access</button>
              </div>
              <div className="yabox__bd">
                {open.thread.map((t, i) => (
                  <div key={i} className={"ya__bubble" + (t.from === "you" ? " me" : "")}>
                    <div className="when">{t.from === "you" ? "you" : t.from}</div>
                    <div className="txt">{t.text}</div>
                  </div>
                ))}
                <div className="ya__reply">
                  <input type="text" placeholder={"reply to " + open.user + "…"} aria-label="Reply" />
                  <button className="btn btn--primary" type="button">Send</button>
                </div>
                <p className="yadm__hint">Auto-filter is on — flagged words are starred out before delivery.</p>
              </div>
            </section>
          )}

          {(folder === "sent" || folder === "trash") && (
            <section className="yabox">
              <div className="yabox__hd">{folder === "sent" ? "Sent" : "Trash"}</div>
              <div className="yabox__bd"><p style={{ fontStyle: "italic", color: "var(--text-faint)" }}>Nothing here yet.</p></div>
            </section>
          )}
        </div>
      </div>
    );
  }

  window.YaInbox = YaInbox;
})();
