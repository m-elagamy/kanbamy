# TIL-001: Component Lifecycle Coupling & The Singleton Overlay Pattern

- **Date:** 2026-11-14
- **Tags:** `React`, `Architecture`, `Component Lifecycle`, `UX`

> **TL;DR:**  
> لا تضع الـ Modals/Sheets داخل عناصر القوائم (`List Items`). إذا تغيّر مكان الكارت أو تم حذفه فسيحدث له `Unmount` فوري ويدمر الـ Modal المفتوح.  
> **القاعدة:** اجعل الكروت للأزرار فقط (`Triggers`)، واجعل الـ Overlay واحداً في قمة الشجرة (`Singleton at Top Level`).

---

## 1. The Problem (المشكلة)
في شاشة الـ Kanban Board، عند فتح نافذة تفاصيل المهمة (`TaskDetailSheet`) وتغيير العمود الخاص بها (مثلاً من "To Do" إلى "In Progress"):
الـ Sheet كان يُقفل ويفتح فجأة، أو يختفي تماماً مع وميض واهتزاز في الواجهة (`Flicker / Unintended Re-render`).

---

## 2. The Root Cause (السبب الجذري)
* **الموضع القديم:** كان `<TaskDetailSheet>` يُعرض داخل كل بطاقة `<TaskCard>` على حدة (`Colocated inside Child`).
* **آلية الفشل:** 
  1. عند تغيير العمود، دالة `moveTaskBetweenColumns` تنقل المهمة للعمود الجديد.
  2. في مرحلة الـ `Reconciliation`، يكتشف `React` أن الكارت أُزيل من شجرة العمود القديم، فيقوم بعمل **`Unmount`** فوري له.
  3. ولأن الـ Sheet كان يعيش كابن مباشر داخل الكارت، دُمّر فوراً مع موت أبيه (`Component Lifecycle Coupling`).

---

## 3. The Architectural Fix (الحل المعماري)
1. **`Lifting State Up`:**
   نقلنا معرف المهمة المفتوحة (`selectedTaskId`) إلى المتجر المركزي (`useTaskStore`). الكروت أصبحت فقط تستدعي:
   ```ts
   setSelectedTaskId(task.id);
   ```
2. **`Singleton Overlay Pattern`:**
   أزلنا الـ 50 نافذة من داخل الكروت، ووضعنا نسخة وحيدة فقط في قمة البورد (`BoardLayout`):
   ```tsx
   {selectedTask && (
     <TaskDetailSheet
       task={selectedTask}
       columnId={selectedTask.columnId}
       open={Boolean(selectedTaskId)}
       onOpenChange={handleDetailOpenChange}
     />
   )}
   ```
   **النتيجة:** مهما تحرك الكارت بين الأعمدة، الـ Sheet مستقر في مكانه بالأعلى دون أي وميض.

---

## 4. The Mental Model & Rules of Thumb (الأصل والاستثناء)

### 🏛️ الأصل الافتراضي الثابت (`The Default Rule`):
> **"الكروت للأزرار فقط، والنوافذ في الأعلى."**  
> أي شاشة تفاصيل رئيسية أو نافذة تعديل مكانها الطبيعي دائماً كـ `Singleton` على مستوى الصفحة/الـ Layout.

### ⏱️ اختبار الـ 3 ثواني للحسم (`The 3-Second Test`):
اسأل نفسك قبل كتابة الكود:
> **"هل العنصر ده لو فتح الشاشة، ممكن يتحرك أو يتفلتر أو يتم حذفه وهي لسه مفتوحة؟ وهل هحتاج أفتح نفس الشاشة من رابط أو سيرش؟"**
* **نعم ⬅️ ارفعها للأعلى فوراً (`Top-level Singleton Overlay`).**
* **لا ⬅️ اتركها مكانها داخل المكون (`Colocate`).**

### ⚖️ متى نكسر القاعدة؟ (الاستثناء المقبول):
* **`Ephemeral Dialogs` (نوافذ التأكيد السريعة):** مثل `AlertConfirmation` ("هل أنت متأكد من الحذف؟")، لأن العنصر سيُحذف على أي حال ولن يتحرك أثناء فتحها.
* **`Tooltips / HoverCards` الخفيفة:** المرتبطة بموضع مؤشر الماوس محلياً.
