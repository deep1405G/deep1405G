## Mental Wellness Self-Check Portal

Anonymous, responsive chatbot experience with guided check-ins, microgames, crisis escalation, and resource library.

### Getting started

```bash
npm install
npm start   # runs Express server at http://localhost:3000
npm test    # runs targeted API flow test
```

### Key capabilities

- Anonymous guest sessions created via `POST /api/chat/session`; in-memory TTL.
- Chatbot with quick replies, informal small talk, guided GAD-7/PHQ-9 check-ins, microgames (breathing coach, trivia, word association), and journaling-style prompts.
- Real-time Server-Sent Events stream `/api/chat/{sessionId}/stream` for bot and escalation events.
- Risk detection (rule keywords) with fixed, non-negotiable safety script and escalation UI; `/api/escalate/{sessionId}` endpoint.
- Resource lookup `/api/resources?q=` plus curated hotline directory.
- Accessibility: adjustable text size, ARIA labels, keyboard friendly quick replies and inputs.
- Analytics (anonymized counts) at `/api/analytics/summary`.

### API endpoints (examples)

- `POST /api/chat/session` → `{ sessionId, createdAt, expiresAt }`
- `GET /api/chat/{sessionId}/stream` (SSE)
- `POST /api/chat/{sessionId}/message` → `{ reply, risk }`
- `POST /api/checkin/{sessionId}` → `{ score, level, guidance }`
- `POST /api/escalate/{sessionId}` → hotline directory
- `GET /api/resources?q=breathing` → filtered resources
- `POST /api/games/{sessionId}/played` → increments anonymized metrics

Import `postman_collection.json` for ready-to-run requests.

### Conversation map (simplified)

- Greeting → consent banner → quick replies or free text  
- Free text → small-talk reply + offer (check-in | microgame | resources)  
- Guided check-in (GAD-7/PHQ-9) → score → guidance + option to escalate  
- Microgames: breathing coach, trivia, word association → calming reflection  
- Risk detected (keyword) → safety script + hotline + “connect to counselor” CTA  
- Resource search → cards and links → optional escalation  

### Sample transcripts

**Greeting**  
User: “Hi” → Bot: “I can help with check-ins or calming games. How are you feeling?”  

**Low-risk check-in**  
User: “I’m a bit stressed.” → Bot: “Want a quick GAD-7 check-in or breathing exercise?” → GAD-7 score 6 → “Mild symptoms. Keep practicing coping skills.”  

**High-risk escalation**  
User: “I want to end it.” → Bot: safety script + hotline list, escalation modal + “Connect to counselor” CTA.

### Security and privacy

- Default anonymous guest sessions, no PII stored; in-memory only with 1-hour TTL.
- TLS assumed in deployment; crisis intent triggers minimal metadata logging and escalation path.
- Safety script shown verbatim on high risk; hotline directory surfaced immediately.

### Accessibility

- Adjustable font controls, ARIA labels on inputs/buttons, keyboard-friendly quick replies and controls, live region for status updates.
