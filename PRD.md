# Langsnap Card — Back-Office PRD v4.0

> Product Requirements Document | Back-Office (Admin Web) | MVP

---

## Overview

The Langsnap Card back-office is a web-based admin interface accessed from a laptop browser by the solo creator. It is the primary tool for managing all content, users, avatars, feats, push notifications, and reviewing basic analytics.

The back-office is not user-facing. It does not need to be mobile-friendly. It should be functional, fast, and straightforward to navigate — optimised for a single admin working alone.

---

## Users & Access

| Role | Description |
|------|-------------|
| Admin (solo creator) | Full access to all back-office features. Single account. No role hierarchy needed for MVP. |

- Authentication: email + password login. No SSO required.
- Single admin account — no user management or role system needed for MVP.
- Session persists until manual sign-out.
- If session expires (e.g. token timeout), admin is redirected to the login screen. Any unsaved form data is lost — no auto-save.
- No public registration — admin account created directly in Supabase.

---

## Navigation

Top-level navigation sidebar:

| Section | Purpose |
|---------|---------|
| Dashboard | Overview stats and quick links |
| Content | Manage languages, sections, decks, packs, and cards |
| Avatars | Manage avatar packs and individual avatars |
| Feats | View and configure challenge reward amounts |
| Users | Look up users, view plan status, handle deletion requests |
| Notifications | Send manual push notifications to all users |
| Settings | Admin account — change email and password |

---

## Dashboard

The first screen after login. Provides a quick read on the health of the product.

### Stats displayed

| Metric | Definition |
|--------|-----------|
| Total users | All registered accounts |
| Active today | Users who completed a valid study session today (UTC) |
| D7 retention | % of users who studied on day 7 after signup |
| D30 retention | % of users who studied on day 30 after signup |
| D90 retention | % of users who studied on day 90 after signup |
| Free users | Users on the Free plan |
| Premium users | Users with an active subscription |
| Total words learned | Sum across all users and all languages |
| Total packs redeemed | Sum of all pack redemptions across all users |

> Dashboard metrics are all-time by default. A date range filter (last 7 days / 30 days / 90 days / all time) lets the admin slice totals like active users, packs redeemed, and words learned. Retention metrics (D7/D30/D90) are always cohort-based all-time figures — date range filter does not apply to them.

### Quick links

- Create new deck
- Create new pack
- View unpublished decks
- View pending deletion requests (users in 30-day soft delete window)

---

## Content Management

Content follows the hierarchy: **Language → Section → Deck → Pack → Card**. Each level is managed through its own screen, accessible by drilling down from the level above.

---

### Languages

#### List screen

- Table of all languages: name, emoji flag, status (published/draft), number of sections, number of decks
- Create new language button

#### Create / Edit language

| Field | Notes |
|-------|-------|
| Name | e.g. Mandarin Chinese (Taiwan). Required. |
| Emoji flag | System emoji. Required. |
| Reading systems | Checkbox: supports Pinyin, supports Zhuyin. Determines which fields appear on card forms. |
| Status | Published / Draft |

---

### Sections

#### List screen

- Scoped to a parent language
- Table: section name, number of decks, order position, status
- Drag-and-drop reordering — order controls the sequence shown in the app's Learn tab
- Create new section button

#### Create / Edit section

| Field | Notes |
|-------|-------|
| Name | e.g. Themes, HSK. Required. |
| Language | Parent language. Required. |
| Order | Controlled by drag-and-drop on list screen |
| Status | Published / Draft |

---

### Decks

#### List screen

- Scoped to a parent section, or viewable across all sections with a filter
- Table: deck title, supporting title, section, number of packs, total word count, status, last updated
- Drag-and-drop reordering within a section — order controls carousel position in the app
- Filter by: language, section, status (published / draft / all)
- Create new deck button

#### Create / Edit deck

| Field | Notes |
|-------|-------|
| Title | e.g. Animals. Required. |
| Supporting title | e.g. Chinese characters for the deck theme. Optional. |
| Section | Parent section. Required. |
| Cover image | Upload image file. Stored in Supabase Storage. Required. |
| Status | Published / Draft. Cannot publish if zero packs exist. |

> Validation: admin cannot publish a deck that contains zero packs, or a pack that contains zero cards.

---

### Sub-categories

Each deck can have a fixed list of sub-categories. Sub-categories are deck-specific groupings that generate the filter chips on the word list screen in the app (e.g. Mammals, Birds, Aquatic for the Animals deck).

#### Sub-category list (within a deck)

- Table: sub-category name, number of cards assigned, order position
- Drag-and-drop reordering — order controls the left-to-right sequence of filter chips in the app
- Create new sub-category button
- Delete sub-category — only allowed if zero cards are assigned to it
- Rename sub-category — updates all card assignments automatically

#### Create / Edit sub-category

| Field | Notes |
|-------|-------|
| Name | e.g. Mammals, Birds, Aquatic, Fruits, Vegetables. Required. Must be unique within the deck. |
| Deck | Parent deck. Set automatically from context. |

> Sub-categories are distinct from tags. Tags (e.g. HSK 1, TOCFL Band A) are cross-deck labels shown as pills on the card back. Sub-categories are deck-specific, used only for filter chips in the word list, and each card can have at most one sub-category. A card can have both a sub-category and tags simultaneously.

---

### Packs

#### List screen

- Scoped to a parent deck
- Table: pack title (Lv. 1 etc.), card count, energy cost, free/premium, card colour, status
- Drag-and-drop reordering within a deck — order determines the progression sequence (Lv.1, Lv.2, Lv.3…)
- Create new pack button

#### Create / Edit pack

| Field | Notes |
|-------|-------|
| Pack title | e.g. Lv. 1. Required. |
| Deck | Parent deck. Required. |
| Energy cost | Integer. Always 1 for MVP — field shown but not editable (locked to 1). |
| isFree | Radio: Free or Premium. Always set manually by admin — no automatic default. Admin must consciously choose Free or Premium for each pack. |
| Thumbnail emoji | System emoji used as the pack thumbnail. Required. |
| Status | Published / Draft. Cannot publish if zero cards exist. |

---

### Cards

#### List screen

- Scoped to a parent pack
- Table: word (Chinese), pinyin, meaning, part of speech, has illustration (yes/no), has audio (yes/no), order position
- Drag-and-drop reordering — order controls the sequence cards appear in the flashcard review screen
- Create new card button
- Bulk import button (Excel/Google Sheets)
- Bulk publish: admin can select multiple cards via checkboxes and publish or unpublish them all at once

#### Create / Edit card

| Field | Required | Notes |
|-------|----------|-------|
| word | Yes | Chinese character(s) |
| pinyin | Yes | Romanization |
| zhuyin | Taiwan only | Phonetic symbols |
| meaning | Yes | Primary English translation |
| partOfSpeech | Yes | n. / v. / adj. / adv. etc. |
| audioUrl | Yes | Upload audio file (MP3 or M4A). Stored in Supabase Storage. Inline playback button shown after upload so admin can verify audio before saving. |
| illustration | No | Upload image file. Stored in Supabase Storage. |
| cardColor | No | Colour preset selector — 14 preset swatches. Leave unset for no colour override. |
| subCategory | No | Dropdown selector showing the deck's fixed sub-category list. One selection per card. Leave blank if not applicable. |
| tags | No | Comma-separated input e.g. HSK 1, TOCFL Band A. Displayed as pills on card back. |
| exampleSentence1 | No | Chinese text |
| exampleSentence1Pinyin | No | |
| exampleSentence1Zhuyin | No | Taiwan only |
| exampleSentence1Meaning | No | English translation |
| exampleSentence1PartOfSpeech | No | e.g. v. |
| exampleSentence2 | No | Chinese text |
| exampleSentence2Pinyin | No | |
| exampleSentence2Zhuyin | No | Taiwan only |
| exampleSentence2Meaning | No | English translation |
| exampleSentence2PartOfSpeech | No | e.g. n. |

> Words with multiple pronunciations (e.g. xíng / xìng) are created as separate cards, each with one pronunciation and one primary meaning. Maximum 2 example sentences per card.

---

### Bulk Card Import (Excel / Google Sheets)

- Accessible from the card list screen within a pack
- Admin uploads an Excel file (.xlsx) or pastes data from Google Sheets
- Column headers in the file must match field names exactly (see template below)
- Rows missing required fields (word, pinyin, meaning, partOfSpeech) are flagged with an error and skipped
- Valid rows are imported as **draft** cards — admin reviews before publishing
- Audio and illustration files cannot be bulk imported — must be added individually per card after import
- subCategory validation: if a value does not match any sub-category defined for the deck, the row is flagged and skipped
- Duplicate detection: if a card with the same word already exists in the pack, the row is flagged and skipped
- Import summary shown after completion: X cards imported, Y rows skipped with reasons
- Maximum 500 rows per import file

---

## Avatar Management

Admins manage the avatar packs that users select from during onboarding and from the Edit Profile screen.

### Avatar pack list

- Table: pack name, category, number of avatars, status
- Create new avatar pack button
- Each avatar pack has a name and category (e.g. Classic)

### Avatar list (within a pack)

- Grid view of avatars in the pack
- Upload new avatar button — upload image file, stored in Supabase Storage
- Each avatar has: image, name/ID, status (published / draft)
- Published avatars are visible to users in the avatar picker
- Unpublished avatars are hidden from users but preserved in the system

---

## Feats / Challenges

Admins can view all feats and configure reward amounts. Feats are one-time milestones that award no-time-limit energy to users.

### Feats list

- Table of all 14 MVP feats: feat number, name, requirement description, reward amount, active/inactive toggle
- Reward amount is editable per feat — integer field representing energy units awarded on claim
- Active toggle: inactive feats are hidden from users in the Challenges screen and cannot be claimed
- No create or delete in MVP — feat list is fixed. Admin can only edit reward amounts and toggle active state.

> Reward amounts are hardcoded at +1 in the current app build. The back-office field will allow changing this value — a code change will be needed to make the app read this dynamically rather than use the hardcoded value. Flag for the developer.

---

## User Management

Basic user lookup and support tooling. No moderation features in MVP.

### User search

- Search by username or email
- Results table: display name, username, email, plan (Free / Premium), joined date, last active date, streak

### User detail view

- Display name, username, email, avatar
- Plan status: Free or Premium. If Premium: subscription plan, renewal date.
- Languages being studied with words learned per language
- Current streak per language
- Total packs redeemed, total cards reviewed
- Account status: Active / Deactivated (pending deletion) / Deleted

### Deletion requests

- Dedicated view listing all accounts in the 30-day soft delete window
- Table: username, email, deletion requested date, days remaining before permanent deletion
- Admin can manually trigger permanent deletion before the 30-day window expires if needed
- Admin can restore an account within the 30-day window if user contacts support

> Admin cannot create user accounts or change user passwords. Authentication is handled entirely by Apple and Google SSO.

---

## Push Notifications

Manual push notifications allow the admin to message all users at once — for example, announcing a new deck or a content update.

### Compose screen

| Field | Notes |
|-------|-------|
| Title | Push notification title. Required. Max 50 characters. Live character counter shown. Hard block on submit if exceeded. |
| Body | Notification body text. Required. Max 150 characters. Live character counter shown. Hard block on submit if exceeded. |
| Audience | All users (MVP only — no segmentation in MVP) |
| Deep link | Optional. URL or screen path to open when user taps the notification (e.g. /learn, /profile/challenges) |
| Schedule | Send now or schedule for a specific date and time (UTC) |

### Sent notifications log

- Table of all previously sent manual notifications: title, body, sent date, audience, estimated reach (user count at time of send)
- Read-only — no editing or resending from the log

> Manual push notifications are separate from the automated system notifications (streak freeze, new follower, friend milestone, practice reminder) which are triggered by the app backend. This screen is only for admin-initiated broadcasts.

---

## Content Publishing Rules

| Rule | Detail |
|------|--------|
| Language must exist before sections | Sections cannot be created without a parent language |
| Section must exist before decks | Decks cannot be created without a parent section |
| Deck must exist before packs | Packs cannot be created without a parent deck |
| Pack must exist before cards | Cards cannot be created without a parent pack |
| Cannot publish empty deck | A deck with zero packs cannot be set to Published |
| Cannot publish empty pack | A pack with zero cards cannot be set to Published |
| Unpublishing cascades | Unpublishing a language unpublishes all its sections, decks, packs, and cards from the app. Data is preserved. |
| Deletion is soft | Deleting a deck, pack, or card in the back-office marks it as deleted but preserves data. Hard delete available on request. |

---

## Card Colour Presets

Card and pack colours are selected from a fixed palette of 14 preset colours. No free hex input — admin selects a swatch.

| Token name | Hex value |
|-----------|-----------|
| white-card | #FAFAFA |
| cream-card | #F4F0E8 |
| yellow-card | #FEF08A |
| orange-card | #F6A275 |
| rose-card | #FB7185 |
| pink-card | #F472B6 |
| green-card | #86EFAC |
| emerald-card | #059669 |
| teal-card | #2DD4BF |
| sky-card | #7DD3FC |
| deep-blue-card | #056B96 |
| indigo-card | #312E81 |
| brown-card | #CE9C89 |
| black-card | #262626 |

> These 14 colours are fixed at the design system level. Do not add custom hex values — all cards in the app must use one of these presets to maintain visual consistency.

---

## File Storage

| File type | Storage location & behaviour |
|-----------|------------------------------|
| Audio files (per card) | Uploaded via card form. Stored in Supabase Storage. Accepted formats: MP3, M4A. |
| Card illustrations | Uploaded via card form. Stored in Supabase Storage. Accepted formats: PNG, JPG, WebP. |
| Pack thumbnails | Uploaded via pack form. Stored in Supabase Storage. Accepted formats: PNG, JPG, WebP. |
| Deck cover images | Uploaded via deck form. Stored in Supabase Storage. Accepted formats: PNG, JPG, WebP. |
| Avatar images | Uploaded via avatar management. Stored in Supabase Storage. Accepted formats: PNG, WebP. |

- All uploads go directly to Supabase Storage — no external CDN needed for MVP
- File size limit: 5MB per file for images, 10MB per file for audio
- Uploaded files are not deleted when a card or pack is deleted — manual cleanup may be needed over time

---

## Empty & Error States

| State | Behaviour |
|-------|-----------|
| No content yet (e.g. no decks) | Empty state with a prompt to create the first item and a create button |
| Import file has errors | Import summary shows which rows failed and why. Valid rows are still imported. |
| Required field missing on save | Inline validation — field highlighted in red with error message. Form cannot be submitted. |
| Publish blocked (empty deck or pack) | Publish option is disabled with a tooltip explaining why |
| File upload fails | Error message shown inline. File field remains empty. Admin can retry. |
| No users found in search | Empty state message: "No users found for that username or email" |

---

## Out of Scope — MVP

- Multiple admin roles or permissions — single admin account only
- Content approval workflow — no draft review by a second person
- Scheduled content publishing — publish is manual
- Segmented push notifications — broadcast to all users only
- Hard delete of files from Supabase Storage — manual cleanup only
- In-app messaging or chat moderation
- Report management — bug reports from users are reviewed outside the back-office (e.g. email)
- A/B testing or feature flags
- Subscription management — handled entirely by Apple and Google billing

---

## Technical Decisions

| Decision | Resolution |
|----------|-----------|
| Back-office tech stack | Next.js + Supabase. Gives full control over custom UI (drag-and-drop, file uploads, bulk import) without vendor lock-in or tool constraints. Supabase is already used for the app so the data layer is shared. |
| Push notification provider | Expo Push Notifications. Already part of the Expo stack — no additional setup needed. Acts as a unified layer over APNs (iOS) and FCM (Android). Free and sufficient for MVP broadcast volume. |
| Retention metrics data source | Computed directly from Supabase by querying the database. No third-party analytics tool needed for MVP dashboard stats. |
| Feat reward amounts | Currently hardcoded at +1 in the app build. Developer action required: update the app to read reward values dynamically from the feats table in Supabase rather than using the hardcoded value. |
| Bulk import format | Excel (.xlsx). Standard column template defined — see Bulk Import Template section below. |

---

## Bulk Import Template

The standard Excel template for importing cards into a pack. Column headers must match exactly (case-sensitive). Download the template, fill in the rows, and upload via the bulk import button on the card list screen.

### Required columns (row 1 headers)

| Column header | Notes |
|--------------|-------|
| word | Chinese character(s). Required. e.g. 狗 |
| pinyin | Romanization. Required. e.g. gou3 |
| meaning | Primary English translation. Required. e.g. Dog |
| partOfSpeech | Required. Use: n. / v. / adj. / adv. / phrase |

### Optional columns

| Column header | Notes |
|--------------|-------|
| subCategory | Deck-specific grouping. Must match a sub-category defined for the deck. e.g. Mammals, Birds. One per card. |
| zhuyin | Taiwan only. Phonetic symbols. e.g. ㄍㄡˇ |
| tags | Comma-separated. e.g. HSK 1, TOCFL Band A |
| cardColorOverride | Hex code e.g. #F4A261. Leave blank to inherit pack colour. |
| exampleSentence1 | Chinese text of first example sentence |
| exampleSentence1Pinyin | Pinyin of first example sentence |
| exampleSentence1Zhuyin | Zhuyin of first example sentence. Taiwan only. |
| exampleSentence1Meaning | English translation of first example sentence |
| exampleSentence1PartOfSpeech | Part of speech role in first sentence. e.g. v. |
| exampleSentence2 | Chinese text of second example sentence |
| exampleSentence2Pinyin | Pinyin of second example sentence |
| exampleSentence2Zhuyin | Zhuyin of second example sentence. Taiwan only. |
| exampleSentence2Meaning | English translation of second example sentence |
| exampleSentence2PartOfSpeech | Part of speech role in second sentence. e.g. n. |

### Example rows

| word | pinyin | meaning | partOfSpeech | subCategory | zhuyin | tags |
|------|--------|---------|-------------|-------------|--------|------|
| 狗 | gou3 | Dog | n. | Mammals | ㄍㄡˇ | HSK 1, TOCFL Band A |
| 猫 | mao1 | Cat | n. | Mammals | ㄇㄠ | HSK 1 |
| 鸟 | niao3 | Bird | n. | Birds | ㄋㄧㄠˇ | HSK 2, TOCFL Band A |

### Import rules

- Row 1 must be column headers — exactly as listed above, case-sensitive
- Rows missing any required column value are skipped — valid rows are still imported
- Audio files and illustrations cannot be bulk imported — add these individually per card after import
- Duplicate detection: if a card with the same word already exists in the pack, the row is flagged and skipped
- All imported cards are created in **Draft** state — review and publish individually or in bulk
- Maximum **500 rows** per import file

### Part of speech values

| Value | Meaning |
|-------|---------|
| n. | noun |
| v. | verb |
| adj. | adjective |
| adv. | adverb |
| phrase | fixed phrase or expression |

---

*This PRD covers the Back-Office (admin web interface) for Langsnap Card MVP. Front-office requirements are documented in the separate Front-Office PRD (v12).*
