# Spanish ITS TODO

## 1. Project foundation
- [x] Write a one-paragraph project description for the finals project
- [x] Define the MVP scope: single-user adaptive tutor for Spanish medical terminology
- [ ] Choose the first 3 medical systems for the MVP dataset
- [x] Confirm the stack: React + TypeScript frontend, Express + TypeScript backend
- [x] Set up the base repo structure for client, server, and shared types

## 2. Content and knowledge components
- [x] Review the hospital glossary PDF and choose the first 25-30 terms
- [x] Group selected terms by medical system
- [x] Decide the `termType` values to use consistently (anatomy, symptom, condition, procedure, test, specialist, treatment, general_phrase, other)
- [x] Create the initial Knowledge Component schema
- [x] Convert the first glossary terms into KC seed data
- [x] Record official Spanish terms, backup terms, and other alternate terms for each KC
- [ ] Add source metadata for each KC (document title, page, section)
- [x] Assign an initial difficulty value to each KC

## 3. BKT model
- [x] Define the BKT parameter model (`pInit`, `pLearn`, `pSlip`, `pGuess`)
- [x] Decide the default BKT parameter values for MVP
- [x] Create the learner mastery state model per KC
- [ ] Implement the BKT update function for correct responses
- [ ] Implement the BKT update function for incorrect responses
- [ ] Test the BKT update function with sample terms and sample answers
- [x] Decide mastery bands for the dashboard (weak, developing, strong)

## 4. Practice and scoring
- [x] Define the first practice item types
  - [x] typed English -> Spanish recall
  - [x] multiple choice English -> Spanish
  - [x] official term vs alternate term recognition
- [x] Create the PracticeItem model
- [ ] Decide the scoring policy for official terms vs alternate terms
- [ ] Implement answer normalization (case, whitespace, accent handling)
- [ ] Implement response scoring logic
- [ ] Decide how accepted alternate answers should affect BKT in MVP
- [x] Create a starter practice item set for the initial KCs

## 5. Adaptive loop
- [ ] Implement KC selection logic for the next question
- [ ] Prioritize low-mastery KCs in the selector
- [ ] Add logic to avoid repeating the exact same KC too often
- [ ] Save attempt history after each submission
- [ ] Return feedback, mastery update, and next recommendation after each answer
- [ ] Verify the full adaptive loop end-to-end

## 6. Backend API
- [ ] Create the Express server structure
- [ ] Add shared TypeScript types between client and server
- [ ] Implement `GET /api/kcs`
- [ ] Implement `GET /api/kcs/:id`
- [ ] Implement `GET /api/dashboard`
- [ ] Implement `POST /api/practice/next`
- [ ] Implement `POST /api/practice/submit`
- [ ] Implement `POST /api/tutor/explain`
- [ ] Add error handling and response validation

## 7. Frontend UI
- [ ] Create the main app layout and navigation
- [ ] Build the Learn page
- [ ] Build the Practice page
- [ ] Build the Dashboard page
- [ ] Build a reusable TermCard component
- [ ] Build a reusable PracticeCard component
- [ ] Build a FeedbackPanel component
- [ ] Build a MasteryTable or dashboard summary component
- [ ] Connect the frontend to the backend endpoints

## 8. AI tutor support
- [ ] Add server-side OpenAI API integration
- [ ] Create a prompt for short term explanations
- [ ] Create a prompt for hint generation
- [ ] Create a prompt for example clinical sentences
- [ ] Keep AI output bounded to the selected KC content
- [ ] Decide when the tutor should explain vs hint vs show the answer

## 9. Storage and persistence
- [x] Decide how KC seed data will be stored
- [x] Decide how learner mastery state will be stored
- [x] Decide how attempt history will be stored
- [ ] Seed the initial KC dataset
- [x] Seed default BKT parameters
- [ ] Verify progress persists across app reloads

## 10. Demo and presentation
- [ ] Prepare a short demo flow for class presentation
- [ ] Show the Learn -> Practice -> Dashboard loop in the demo
- [ ] Prepare one example where a missed answer lowers confidence and changes what is asked next
- [ ] Prepare one example where an accepted answer raises mastery
- [ ] Write a short explanation of why this is more than flashcards
- [ ] Write a short explanation of how BKT drives adaptation
- [ ] Prepare screenshots or backup slides in case the live demo fails

## 11. Stretch goals
- [ ] Add category-level summaries by medical system
- [ ] Add more glossary sections after MVP works
- [ ] Add confidence self-rating after each response
- [ ] Add charts of mastery over time
- [ ] Add multi-user support only if the MVP is already complete