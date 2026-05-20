# Workflow Engine

The funding and reimbursement requests are governed by a state transition model.

## Transition Actions
* **Submit**: A student member submits a request. State enters `pending`.
* **Hold / Under Review**: A treasurer can flag the request as `under_review` when verifying bills or requesting clarification.
* **Approve / Reject**: Only the assigned Faculty Coordinator or Super Admin has the final authority to transition the request to `approved` or `rejected`.
* **Revision**: Request transitioned to `revision_requested`.
