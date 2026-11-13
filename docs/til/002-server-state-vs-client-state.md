# TIL-002: Server State vs. Client State (TanStack Query vs. Zustand / Redux)

- **Date:** 2026-11-14
- **Tags:** `State Management`, `TanStack Query`, `Zustand`, `Redux`, `System Design`

> **TL;DR:**  
> لا تخلط بين بيانات السيرفر والواجهة.  
> **Server State** = بيانات بعيدة، غير تزامنية، تحتاج كاش وتحديث بالخلفية ⬅️ مكانه **`TanStack Query`**.  
> **Client State** = بيانات محلية، تزامنية، تحكم الواجهة والأزرار فوراً في الـ RAM ⬅️ مكانه **`Zustand / Redux`**.

---

## 1. The Core Mental Model (النموذج الذهني المبسط)

* **`Zustand / Redux` = "دولاب / خزانة تخزين":**  
  وعاء تزامني بسيط في الـ RAM. تضع فيه قيمة تظل فيه. لا يفهم شيئاً عن الشبكة، ولا يعرف متى تقدم البيانات، ولا يحدث نفسه تلقائياً.
* **`TanStack Query` = "خدمة شحن ومتابعة ذكية":**  
  محرك كاش غير تزامني. يسافر للسيرفر، يضع وقتاً للكاش، يحدث الداتا بالخلفية عند العودة للتبويب (`Window Focus`)، يمنع تكرار الطلبات (`Deduplication`)، ويمسح البيانات غير المستخدمة (`Garbage Collection`).

---

## 2. Technical Comparison (مقارنة تقنية مباشرة)

| المعيار التقني | `Server State` (حالة السيرفر) | `Client State` (حالة الواجهة) |
| :--- | :--- | :--- |
| **الملكية (`Ownership`)** | ملكية بعيدة ومشتركة (`Shared & Remote`). | ملكية محلية وفردية لتبويب المتصفح الحالي فقط. |
| **التنفيذ (`Execution`)** | **`Asynchronous`** (يعتمد على سرعة الشبكة والـ I/O). | **`Synchronous`** (فوري ومباشر في الـ RAM). |
| **أمثلة من الواقع** | المهام، المستخدمين، المنتجات في قاعدة البيانات. | المودال مفتوح أم مغلق، التبويب النشط، الثيم. |
| **الأداة القياسية** | `TanStack Query`, `RTK Query`, `SWR` | `Zustand`, `Redux`, `useState` |

---

## 3. Why TanStack Query Should NOT Replace Client State Managers

البعض يحاول استخدام `queryClient.setQueryData` لتخزين متغيرات الواجهة والاستغناء عن `Zustand`. هذا يعتبر **`Anti-pattern`** للأسباب التالية:

1. **`Async vs Synchronous Overhead`:**  
   الـ Client State (مثل الكتابة في الحقول أو الـ Drag & Drop بمعدل `60fps`) يحتاج تحديثاً تزامونياً فورياً. تحويله لـ Query يمر عبر Observers ومقارنات هيكلية (`Structural Sharing`) مما يسبب بطئاً وتأخيراً في الاستجابة.
2. **فخ تفريغ الذاكرة (`Garbage Collection Trap - gcTime`):**  
   أي قيمة في كاش TanStack Query لا يستمع إليها مكوّن حالياً يتم حذفها تلقائياً بعد انتهاء الـ `gcTime`، مما يفقدك حالة الـ UI لو غادر المستخدم الصفحة وعاد إليها.
3. **الـ Optimistic Updates ليست Client State:**  
   هي مجرد "توقع مؤقت لبيانات السيرفر أثناء انتقالها في الشبكة"، وليست بديلاً عن حالات الواجهة المحلية المستقلة عن السيرفر.
4. **تعقيد الكود (`Boilerplate & Workarounds`):**  
   لتخزين `boolean` بسيط، ستضطر لتعطيل خصائص المكتبة الأساسية (`enabled: false`, `staleTime: Infinity`, `gcTime: Infinity`).

---

## 4. Official Perspectives (شهادات من صناع المكاتب)

### 💬 Dominik Dorfmeister (TkDodo - المشرف الرئيسي على TanStack Query):
> *"React Query is NOT a local state manager. It is an **async state manager** that handles asynchronous data that is not yours. For synchronous, local-only client state, using React Query is overkill and leads to awkward code. Use the right tool for the job: useState, useReducer, or Zustand for client state, and React Query for server cache."*  
> — *TkDodo Blog #10: "React Query as a State Manager"*

### 💬 Mark Erikson (المشرف الرئيسي على Redux Toolkit):
> *"Over the last couple years, the React community has come to realize that **'data fetching and caching' is really a different set of concerns than 'state management'**. While you can use a state management library like Redux to cache data, the use cases are different enough that it's worth using tools that are purpose-built."*  
> — *Official Redux Toolkit Docs: "RTK Query Overview"*

---

## 5. The Golden Rule (القاعدة الذهبية)
> **"دع `TanStack Query` يدير ما يأتي من السيرفر كـ Async Cache، ودع `Zustand` يدير سلوك الواجهة التزامني في المتصفح. هذا الفصل المعماري يعطيك أعلى أداء، وأبسط كود، وأسهل صيانة."**
