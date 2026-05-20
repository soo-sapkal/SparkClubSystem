# AI Architecture

SparkClub features a central AI backend wrapper integrated with the Anthropic Claude API.

## Workflow
1. Client sends chat query.
2. Express route fetches financial context (current year income, expenses, category-wise utilization, pending requests).
3. Context is formatted into a **System Prompt** dynamically.
4. Payload is submitted to Claude (`claude-sonnet-4-20250514`).
5. Reply is returned and logged in `ai_conversations` table for auditing and tracking.
