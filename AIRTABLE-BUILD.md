# Build the Sitaron Ki Mehfil base

Give this whole file to Claude Cowork or Dispatch. Base is already there:
**Sitaron Ki Mehfil — `appxxy5cyH5pf9OoS`**

Leave **Sitaron Ka Saavan 2024** alone. The other five tables are defaults with nothing in them: rename and rebuild, or delete and recreate. The names below must match exactly — the Worker writes by field name, so a typo means a silent dropped value.

---

## Table: People
*One row per human, forever. This is the spine, and what a birthday app would read.*

| Field | Type | Notes |
|---|---|---|
| Full name | Single line text | **primary** |
| Phone | Phone number | |
| WhatsApp | Phone number | only when it differs from Phone |
| Date of birth | Date (ISO, YYYY-MM-DD) | |
| Family | Link → Families | |
| Replies | Link → Replies | the back-link creates itself |
| Notes | Long text | |

## Table: Families
*The unit that replies and performs.*

| Field | Type | Notes |
|---|---|---|
| Family name | Single line text | **primary** — theirs, invented |
| People | Link → People | back-link |
| Replies | Link → Replies | back-link |
| Notes | Long text | |

## Table: Events
*Diwali 2026, Holi 2027, and everything after.*

| Field | Type | Notes |
|---|---|---|
| Event name | Single line text | **primary** — e.g. `Diwali 2026` |
| Type | Single select | Diwali · Holi · Saavan · Other |
| Date | Date | |
| Start time | Single line text | e.g. `5pm` |
| Place | Single line text | |
| Host | Single line text | |
| Status | Single select | Planning · Open for RSVP · Closed · Past |
| Replies | Link → Replies | back-link |
| Sponsors | Link → Sponsors | back-link |

**Add one row now:** Event name `Diwali 2026`, Type `Diwali`, Date `2026-11-21`, Start time `5pm`, Place `1370 Adams Road, Bensalem PA 19020`, Host `Archana & Sidharth`, Status `Open for RSVP`. The Worker creates it if missing, but seeding it means the first reply lands complete.

## Table: Replies
*One row per family per event. The join.*

| Field | Type | Notes |
|---|---|---|
| Reply | Single line text | **primary** — Worker writes `Family — Event` |
| Event | Link → Events | |
| Family | Link → Families | |
| People | Link → People | everyone on this reply |
| Coming | Single select | Yes · No |
| Headcount | Number, 0 decimals | |
| Entry song | Single line text | |
| Other performance | Long text | |
| Mark | Single line text | their letter and year, e.g. `T1987` |
| Submitted | Date with time | |
| Notes | Long text | yours, for the back office |

## Table: Sponsors
*Fills from the co-sponsor form.*

| Field | Type | Notes |
|---|---|---|
| Name | Single line text | **primary** |
| Family or business | Single line text | |
| Contact | Single line text | phone or email |
| What they have in mind | Long text | |
| Event | Link → Events | |
| Status | Single select | New · Contacted · Confirmed · Declined |
| Submitted | Date with time | |

---

## Two views worth adding to Replies
- **Coming to Diwali 2026** — filter Event is `Diwali 2026` and Coming is `Yes`, sorted by Submitted.
- **The lineup** — same filter, showing Family, Entry song, Other performance. This is the sheet you work the running order from in the group chat.

## Check it worked
Create one row by hand in Replies linking a Family and the Diwali 2026 Event. If the links take and the back-links appear in Families and Events, the Worker will behave.
