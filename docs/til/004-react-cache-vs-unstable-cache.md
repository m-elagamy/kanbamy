# TIL-004: `React.cache()` vs `unstable_cache()` in Next.js

- **Date:** 2026-11-16
- **Tags:** `Next.js`, `React`, `Caching`, `Performance`, `Architecture`

> **TL;DR:**  
> **`React.cache()`** = كاش **لطلب واحد فقط (`Per-Request`)**؛ يمنع تكرار نفس الدالة أو استعلام الـ Auth داخل نفس الـ render ثم يُمسح فوراً.  
> **`unstable_cache()`** = كاش **مستمر بين الزيارات (`Cross-Request`)**؛ يحفظ نتائج قاعدة البيانات على السيرفر ويُبطل عبر `tags` أو `revalidate`.

---

## 1. The Context / Problem (المشكلة أو التساؤل)

أثناء تحسين أداء `kanbamy`، ظهر تساؤلان متكرران:
1. لماذا تتكرر استعلامات `resolveWorkspaceOwner()` أو `getAuthenticatedUserId()` أكثر من مرة داخل نفس الطلب (مثلاً في `Layout` و`generateMetadata` و`Page`)؟
2. ما الفرق بين تخزين النتيجة لعمر الطلب الواحد، وتخزين نتائج Postgres بين زيارات المستخدم المختلفة، وأين يُحفظ كل منهما؟

---

## 2. The Core Mental Model (النموذج الذهني المبسط)

- **`React.cache()` = "ورقة ملاحظات في يدك أثناء زيارة واحدة للمطعم":**  
  تكتب فيها رقم الطاولة عشان لو سألك 3 موظفين في نفس الزيارة ما تتصلش بالاستعلامات 3 مرات؛ وبمجرد ما تخرج من الباب، الورقة بتترمي.
- **`unstable_cache()` = "الفريزر في البيت":**  
  تحفظ فيه الأكل بين المشاوير والزيارات المختلفة (لثوانٍ، دقائق، أو حتى إشعار آخر)، ولا ترميه إلا إذا انتهت صلاحيته (`revalidate`) أو قررت تغيّره بملصق (`tags`).

---

## 3. Technical Comparison (مقارنة تقنية مباشرة)

| المعيار التقني | `React.cache()` (من `react`) | `unstable_cache()` (من `next/cache`) |
| :--- | :--- | :--- |
| **العمر (`Lifetime / Scope`)** | **طلب واحد فقط (`Per-Request`)**؛ يموت فور انتهاء إرسال الصفحة. | **مستمر عبر الطلبات (`Cross-Request`)**؛ محفوظ على السيرفر بين الزيارات. |
| **مكان التخزين** | ذاكرة الطلب الحالي أثناء الـ Server Render. | طبقة كاش Next.js على السيرفر (`.next/cache` أو `Vercel Data Cache`). |
| **الهدف الأساسي** | منع التكرار داخل نفس الصفحة (`Deduplication`) وتفادي الـ `Prop Drilling`. | تقليل الضغط على Postgres وحماية الـ Connection Pool. |
| **التحكم والإبطال** | لا يقبل `tags` ولا `revalidate`. | يدعم `tags` (`updateTag` / `revalidateTag`) و`revalidate` (TTL بالثواني). |
| **استخدام `cookies()` / `auth()`** | **مسموح وآمن**؛ لأنه معزول داخل طلب مستخدم واحد. | **ممنوع**؛ يجب تمرير `userId` أو `boardId` كـ parameter من الخارج. |

---

## 4. The Architectural Pattern (كيف نطبقهما معاً)

1. **طبقة الطلب الواحد (`React.cache`)**:  
   تغليف دوال الجلسة والمصادقة مثل `resolveWorkspaceOwner()`، `getAuthenticatedUserId()`، و`getOptionalDashboardUser()`؛ بحيث حتى لو نادتها `DashboardLayout` و`Sidebar` و`generateMetadata` و`Page` في نفس الـ request، تُنفذ **مرة واحدة فقط**.
2. **طبقة البيانات المستمرة (`unstable_cache`)**:  
   تغليف استعلامات Postgres المتكررة مثل `getBoardByIdForUser(userId, boardId)` و`fetchUserBoards(userId)` وربطها بـ tags دقيقة (`userBoardIdTag`، `userBoardsTag`) لتجنب استعلام قاعدة البيانات عند كل Refresh أو تنقل.
3. **الجمع بينهما**:  
   عندما تستدعي `generateMetadata` و`BoardPage` نفس الدالة المخبأة، تحفظ `unstable_cache` النتيجة بين الزيارات، وتمنع `React.cache` فكها أو فحصها مرتين داخل الزيارة الواحدة.

---

## 5. Exceptions & Rules of Thumb (القاعدة والاستثناءات)

1. **لا تضع `cookies()` أو `auth()` داخل `unstable_cache()` أبداً:**  
   لأن `unstable_cache` كاش عابر للطلبات؛ مرّر دائماً `userId` من دالة مصادقة مغلفة بـ `React.cache()`.
2. **لا تخزّن البحث الحر (`Free-text Search`) في `unstable_cache()`:**  
   تخزين كل كلمة متغيرة (`?q=...`) يملأ الكاش بمفاتيح لا تتكرر. استخدم `unstable_cache()` للصفحات الافتراضية فقط (عندما يكون `query` فارغاً).
3. **اختر أداة الإبطال المناسبة:**  
   - استخدم `updateTag()` في Server Actions التي تحتاج رؤية التعديل فوراً (`read-your-own-writes`).
   - استخدم `revalidateTag(tag, "max")` (`stale-while-revalidate`) للبيانات الثانوية مثل ترتيب "آخر زيارة" (`lastVisitedAt`) لتفادي `<Suspense>` flash.
