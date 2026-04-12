Refocused project idea

Here is the simpler version of your project:

Build a small web-based adaptive tutor for Spanish medical terminology. The tutor uses a medical glossary as its content base, tracks mastery of individual terms with BKT, and selects future practice based on the learner’s estimated knowledge.

That is much clearer.


What the user experience could be

Without BKT
	•	study term
	•	answer question
	•	move on

With BKT
	•	answer question
	•	system updates mastery estimate
	•	system chooses next term based on what you likely need
	•	dashboard shows progress by concept and category

That is the meaningful difference.

Core loop
	1.	Learner answers a terminology question
	2.	System scores it
	3.	BKT updates mastery for that KC
	4.	Tutor selects what to show next
	5.	Dashboard shows learner progress



A. Learn section

This is the instruction part.

Its purpose is to help the learner study and understand a term before or after being tested on it.

What it should do

For one selected term, show:
	•	English term
	•	official Spanish medical term
	•	backup/common alternate term if there is one
	•	category/system
	•	short explanation
	•	optional example sentence
	•	optional note like “formal medical term” vs “common patient wording”

Why this matters

This keeps the app from being only quiz-based.
It gives you a place for:
	•	instruction
	•	explanation
	•	clarification
	•	AI-generated hints or examples

What the AI could do here
	•	explain the difference between official and alternate terms
	•	generate an example clinic sentence
	•	explain a common mistake
	•	maybe give pronunciation guidance



    B. Practice section

This is the assessment and adaptation part.

Its purpose is to:
	•	ask a question
	•	score the answer
	•	update mastery for that term
	•	choose what should come next

This is the most important part of the system.

What it should do
	•	present one practice item at a time
	•	collect the learner’s answer
	•	decide correct / acceptable alternate / incorrect
	•	update the BKT mastery estimate
	•	show immediate feedback
	•	decide the next question

Example question types

You do not need many at first. Start with maybe 2 or 3:
	•	English → Spanish typed recall
	•	multiple choice
	•	identify official term vs alternate term



	spanish-its/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   ├── dashboardApi.ts
│   │   │   ├── kcApi.ts
│   │   │   ├── practiceApi.ts
│   │   │   └── tutorApi.ts
│   │   ├── components/
│   │   │   ├── TermCard.tsx
│   │   │   ├── PracticeCard.tsx
│   │   │   ├── FeedbackPanel.tsx
│   │   │   ├── MasteryTable.tsx
│   │   │   └── CategorySummary.tsx
│   │   ├── pages/
│   │   │   ├── LearnPage.tsx
│   │   │   ├── PracticePage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── hooks/
│   │   │   ├── useDashboard.ts
│   │   │   ├── usePracticeSession.ts
│   │   │   └── useKCs.ts
│   │   ├── utils/
│   │   │   └── formatMastery.ts
│   │   ├── types/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── kcRoutes.ts
│   │   │   ├── practiceRoutes.ts
│   │   │   ├── dashboardRoutes.ts
│   │   │   └── tutorRoutes.ts
│   │   ├── controllers/
│   │   │   ├── kcController.ts
│   │   │   ├── practiceController.ts
│   │   │   ├── dashboardController.ts
│   │   │   └── tutorController.ts
│   │   ├── services/
│   │   │   ├── kcService.ts
│   │   │   ├── practiceService.ts
│   │   │   ├── scoringService.ts
│   │   │   ├── bktService.ts
│   │   │   ├── adaptiveSelectorService.ts
│   │   │   ├── dashboardService.ts
│   │   │   └── openaiTutorService.ts
│   │   ├── data/
│   │   │   ├── seed/
│   │   │   │   ├── knowledgeComponents.json
│   │   │   │   ├── bktParameters.json
│   │   │   │   └── practiceItems.json
│   │   │   └── learner/
│   │   │       ├── learnerState.json
│   │   │       └── attemptHistory.json
│   │   ├── models/
│   │   │   └── persistenceModels.ts
│   │   ├── utils/
│   │   │   ├── normalizeAnswer.ts
│   │   │   └── buildChoices.ts
│   │   ├── config/
│   │   │   └── env.ts
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
│
├── shared/
│   ├── types/
│   │   ├── kc.ts
│   │   ├── bkt.ts
│   │   ├── practice.ts
│   │   ├── dashboard.ts
│   │   └── api.ts
│   └── constants/
│       └── masteryBands.ts
│
├── docs/
│   ├── architecture.md
│   ├── adaptive-loop.md
│   └── glossary-notes.md
│
├── TODO.md
└── README.md