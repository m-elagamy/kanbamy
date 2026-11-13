# TIL-003: Browser Idle Scheduling with requestIdleCallback

- **Date:** 2026-11-14
- **Tags:** `Browser APIs`, `Performance`, `Event Loop`, `Web Vitals`

> **TL;DR:**  
> `requestIdleCallback` هو `Browser API` يسمح بتشغيل المهام ذات الأولوية المنخفضة في "أوقات فراغ المتصفح" فقط (`Idle Periods`)، مما يحمي الـ `Main Thread` من الانسداد ويضمن بقاء تفاعل المستخدم ناعماً بدون تقطيع (`Zero Frame Drops`).

---

## 1. The Core Concept (المفهوم الجوهري)

في شاشات الـ `60fps`، المتصفح يحتاج 16.6ms لرسم كل إطار (`Frame Budget`).  
إذا أنهى المتصفح رسم الإطار في 6ms فقط، يتبقى لديه 10ms إضافية فارغة تُسمى **`Idle Period`**.

* **بدون `requestIdleCallback`:** لو شغلت كوداً ثقيلاً عادياً، سيستهلك المعالج وقت تفاعل المستخدم مسبباً تأخيراً في الاستجابة (`Input Lag / High INP`).
* **مع `requestIdleCallback`:** يخبر المتصفح بتنفيذ المهمة فقط أثناء أوقات الفراغ هذه، ومع إعطاء وقت أقصى (`Timeout`) لضمان التنفيذ في النهاية.

---

## 2. Basic Syntax & How It Works (الكود وآلية العمل)

```ts
const handle = window.requestIdleCallback(
  (deadline) => {
    // deadline.timeRemaining() يعطيك الميلي ثواني المتبقية قبل أن ينشغل المتصفح
    while (deadline.timeRemaining() > 0 && tasksQueue.length > 0) {
      processNextNonUrgentTask();
    }
  },
  { timeout: 2000 }, // مهلة إجبارية: نفذ المهمة بعد ثانيتين حتى لو لم يتفرغ المتصفح
);

// للإلغاء إذا لم تعد بحاجة إليها:
window.cancelIdleCallback(handle);
```

---

## 3. Best Use Cases (متى نستخدمه؟)

1. **التحميل المسبق للمكونات الثقيلة (`Idle Prefetching`):**
   - تحميل كود نافذة البحث أو تفاصيل المهمة مسبقاً في وقت فراغ المستخدم، لتفتح فوراً عند الضغط.
2. **إرسال التحليلات والسجلات (`Analytics & Logging`):**
   - تجميع وإرسال إحصائيات التفاعل للسيرفر دون تعطيل حركة المستخدم.
3. **العمليات الخلفية غير الحرجة (`Background Cleanups`):**
   - حفظ مسودة في `localStorage` أو تنظيف بيانات مؤقتة.

---

## 4. What NOT to do (محاذير مهمة)

* ❌ **لا تعدل الـ DOM مباشرة داخله (`DOM Mutations`):** تعديل الـ DOM في وقت الـ Idle يجبر المتصفح على إعادة حساب المقاسات (`Layout Thrashing`) قبل بداية الإطار القادم، مما يفسد الأداء.
* ❌ **لا تستخدمه للمهام ذات الأولوية العالية:** أي شيء ينتظره المستخدم في اللحظة الحالية مكانه الطبيعي هو الـ Event Listener المباشر أو `requestAnimationFrame`.

---

## 5. The Golden Rule (القاعدة الذهبية)

> **"استخدم `requestAnimationFrame` لما يراه المستخدم الآن على الشاشة (حركة ورسم)، واستخدم `requestIdleCallback` لما يحتاجه التطبيق لاحقاً في الخلفية (كاش وتحليلات دون تعطيل الـ Main Thread)."**
