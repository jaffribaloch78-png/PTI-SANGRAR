# PTI Sangrar — Official Digital Platform

یہ آپ کی website کا مکمل، حقیقی طور پر کام کرنے والا core ہے — Firebase پر مبنی، آپ کے اپنے مکمل کنٹرول میں۔ نیچے مرحلہ وار سیٹ اپ گائیڈ ہے۔

---

## 1. اس میں کیا شامل ہے (Phase 1 — تیار اور کام کر رہا ہے)

**Public website (اردو / سندھی / English):**
- Home, About, News (list + detail), Gallery, Events, Membership, Volunteer, Complaints, Donate (معلوماتی), Contact, Privacy, Terms, 404
- ہر صفحہ mobile-first، responsive، RTL/LTR سپورٹ کے ساتھ
- Real-time زبان تبدیلی (اردو/سندھی/English)
- SEO: meta tags, Open Graph, structured data (JSON-LD), sitemap.xml, robots.txt
- PWA: manifest.json + real icons (installable)

**Firebase-backed (حقیقی ڈیٹا، کوئی fake content نہیں):**
- News, Gallery, Events — آپ کے Firestore سے خودکار لوڈ ہوتے ہیں (خالی شروع ہوں گے)
- Membership, Volunteer, Complaints, Contact forms — حقیقی طور پر Firestore میں محفوظ ہوتے ہیں
- ہوم پیج پر stats (خبریں/رضاکار/سرگرمیاں/حل شدہ شکایات) — یہ حقیقی گنتی ہے، کوئی خیالی نمبر نہیں

**Admin Panel (`/admin/`):**
- محفوظ Login (حقیقی Firebase Authentication)
- Dashboard (حقیقی counts)
- News manager (Create/Edit/Delete + image upload)
- Gallery manager (upload/delete)
- Submissions viewer (Members/Volunteers/Complaints/Messages) + complaint status update

**Security:**
- کوئی client-side hardcoded password نہیں — اصل Firebase Auth + Firestore admin allowlist
- Public لوگ صرف forms submit کر سکتے ہیں، دوسروں کا ڈیٹا کوئی نہیں پڑھ سکتا
- `firebase/firestore.rules` اور `firebase/storage.rules` — production-ready، deploy کرنے کے لیے تیار

---

## 2. اگلے مرحلے کے لیے (جان بوجھ کر ابھی شامل نہیں)

یہ اس لیے شامل نہیں کیونکہ ان کے لیے آپ کے اپنے accounts/فیصلے درکار ہیں، یا یہ ایک الگ اضافی کام ہے:

| Feature | کیوں ابھی نہیں |
|---|---|
| Online Donations (live payment) | آپ کا اپنا merchant account + ECP سیاسی چندہ ضوابط کی تعمیل درکار |
| Google AdSense / Ad Manager | آپ کا اپنا منظور شدہ AdSense account درکار |
| Video upload/streaming | Firebase Storage میں بڑی video files کے لیے الگ compression pipeline بہتر ہے |
| Editor/Volunteer role tiers, 2FA, audit logs, backups, push notifications | RBAC اور Cloud Functions کا الگ، محتاط setup چاہیے |
| Site-wide search | Firestore میں native full-text search نہیں — Algolia جیسی سروس بہتر رہے گی |
| Cookie consent banner | ابھی کوئی tracking cookie سرے سے set نہیں ہو رہی — Analytics/AdSense شامل کرتے وقت یہ بھی شامل کریں |

---

## 3. Firebase — already connected ✅

`pti-sangrar-community` کی asli keys پہلے سے `js/firebase-config.js` میں لگی ہوئی ہیں۔ آپ کو صرف یہ یقینی بنانا ہے:

1. Firebase Console → Authentication → Sign-in method → **Email/Password** Enabled ہو
2. Firestore Database بن چکا ہو (Production mode)
3. Storage بن چکا ہو
4. سیکشن 4 کے rules deploy ہوں (سب سے عام وجہ جس سے چیزیں کام نہیں کرتیں)

## 4. Security Rules Deploy کریں

**آسان طریقہ (Firebase Console سے):**
- Firestore → Rules ٹیب → `firebase/firestore.rules` کا مکمل content پیسٹ کریں → Publish
- Storage → Rules ٹیب → `firebase/storage.rules` کا مکمل content پیسٹ کریں → Publish

**یا CLI سے (اگر Node.js انسٹال ہے):**
```
npm install -g firebase-tools
firebase login
firebase init firestore storage
firebase deploy --only firestore:rules,storage
```

## 5. Admin اکاؤنٹ — پہلے سے موجود ✅

آپ کا admin پہلے سے سیٹ ہے:
- Authentication میں user موجود ہے
- Firestore → `admins` → Document ID: `TYTSfNeugnOfYibEAas5XIKoxRT2` → field `role: "admin"`

یہ بالکل درست فارمیٹ ہے — کوڈ اب صرف اسی طرح کے documents کو تسلیم کرتا ہے (Document ID = UID اور فیلڈ کا نام لازمی `role`، ویلیو لازمی `"admin"`)۔ نیا admin شامل کرنے کے لیے یہی طریقہ دہرائیں:

1. Firebase Console → Authentication → Users → Add User
2. اس user کی UID کاپی کریں
3. Firestore → `admins` collection → نیا Document → ID میں وہی UID → field `role` = `admin` (بالکل یہی ہجے، چھوٹے حروف میں)

⚠️ صرف وہی لوگ admin بن سکتے ہیں جن کا UID آپ خود اس طرح شامل کریں — کوئی بھی website سے خود admin نہیں بن سکتا۔

## 6. Firestore Index (اگر پہلی بار خبریں/سرگرمیاں لوڈ نہ ہوں)

News/Events کی query (`status == "published"` + ترتیب) کے لیے Firestore ایک composite index مانگے گا۔ پہلی بار جب یہ query چلے گی، browser console میں ایک لنک آئے گا — اسے کھول کر "Create Index" پر کلک کر دیں (خودکار ترتیب دے دیتا ہے)۔

## 7. Deploy کریں

### GitHub پر (تجویز کردہ — updates خودکار ہوں گی)

```
cd pti-sangrar
git init
git add .
git commit -m "PTI Sangrar — production build"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
(GitHub پر پہلے ایک خالی repository بنا لیں: github.com → New repository → کوئی README/gitignore شامل نہ کریں)

### Vercel پر

**اگر GitHub سے جوڑنا ہے (اپڈیٹس خودکار):**
1. vercel.com پر اپنے GitHub اکاؤنٹ سے sign in کریں
2. "Add New" → "Project" → اوپر والی repository منتخب کریں → Deploy
3. آئندہ جب بھی GitHub پر `git push` کریں گے، سائٹ خودکار اپڈیٹ ہو جائے گی، لنک نہیں بدلے گا

**یا فوری طور پر (بغیر GitHub کے):**
1. vercel.com/drop کھولیں
2. پورا `pti-sangrar` فولڈر (سب فائلیں) drag کر کے drop کریں
3. Root page کے طور پر `index.html` منتخب کریں → Deploy
4. یاد رہے: اس طریقے سے دوبارہ drop کرنے پر ہر بار نیا لنک بنتا ہے — طویل مدتی استعمال کے لیے GitHub والا طریقہ بہتر ہے

Firebase صرف backend کے طور پر کام کرے گا (Auth/Firestore/Storage)، hosting Vercel ہی رہے گی۔

---

## 8. Folder Structure

```
pti-sangrar/
├── index.html, about.html, news.html, news-detail.html,
│   gallery.html, events.html, membership.html, volunteer.html,
│   complaints.html, donate.html, contact.html, privacy.html,
│   terms.html, 404.html
├── css/style.css
├── js/
│   ├── firebase-config.js   ← اپنی Firebase keys یہاں ڈالیں
│   ├── main.js, news.js, gallery.js, events.js, forms.js,
│   │   stats.js, content.js
├── lang/en.json, ur.json, sd.json
├── admin/
│   ├── index.html (login), dashboard.html, news-manage.html,
│   │   gallery-manage.html, submissions.html
│   ├── css/admin.css
│   └── js/admin-auth.js, admin-news.js, admin-gallery.js,
│       admin-submissions.js
├── firebase/firestore.rules, storage.rules
├── images/icon-192.png, icon-512.png, apple-touch-icon.png
├── manifest.json, sitemap.xml, robots.txt
└── README.md
```

## 9. Firestore Collections کا خلاصہ

| Collection | کون لکھ سکتا ہے | کون پڑھ سکتا ہے |
|---|---|---|
| `news`, `gallery`, `events` | صرف Admin | سب (صرف published) |
| `members`, `volunteers`, `complaints`, `messages` | سب (create فقط) | صرف Admin |
| `admins` | کوئی نہیں (Console سے manual) | خود اپنا UID فقط |
| `settings` | صرف Admin | سب |

---

## 10. مسائل کا فوری حل (Troubleshooting)

| علامت | سب سے عام وجہ | حل |
|---|---|---|
| Login fails ("Invalid email or password") | واقعی غلط email/password، یا Email/Password sign-in method Console میں فعال نہیں | Authentication → Sign-in method میں Email/Password Enable کریں |
| Login کے بعد "not authorized" پیغام | `admins` collection میں اس UID کا document نہیں، یا `role` فیلڈ کا ہجے/ویلیو غلط ہے | Document ID = بالکل UID، field name = `role`, value = `admin` (چھوٹے حروف) |
| Login کے بعد "Firestore denied the admin check" پیغام | `firestore.rules` ابھی deploy نہیں ہوئے | سیکشن 4 دہرائیں — Firestore → Rules → Publish |
| صفحہ بالکل خالی (blank) نظر آئے | اب یہ خود بخود نہیں ہوگا — ہر صفحے پر `error-guard.js` لگا دیا گیا ہے جو غلطی کو اوپر ایک سرخ پٹی میں دکھا دے گا | پٹی میں لکھا پیغام پڑھیں، یا F12 دبا کر browser console چیک کریں |
| کسی صفحے پر 404 | Deploy کرتے وقت کوئی فولڈر/فائل رہ گئی (خاص طور پر `admin/` یا `js/`) | پورا `pti-sangrar` فولڈر دوبارہ مکمل طور پر upload/push کریں |
| "Missing or insufficient permissions" | Firestore/Storage rules deploy نہیں ہوئے، یا آپ login نہیں ہیں | سیکشن 4 دیکھیں؛ forms (membership/volunteer/complaints) کے لیے login کی ضرورت نہیں، مگر admin صفحات کے لیے ضرور ہے |
| JS module نہ چلے (console میں CORS/MIME error) | فائل کو براہ راست ڈبل کلک کر کے `file://` سے کھولا گیا | ہمیشہ Vercel/کسی حقیقی hosting سے ہی کھولیں، لوکل فائل سے نہیں |

---

اگر deploy کے دوران کوئی error آئے (خاص طور پر Firestore rules سے متعلق "Missing or insufficient permissions")، تو سب سے پہلے چیک کریں کہ rules صحیح طریقے سے publish ہوئے ہیں اور آپ کا admin document `admins/` collection میں موجود ہے۔
