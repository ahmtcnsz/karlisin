# Security Specification for Karlısın

## Data Invariants
1. **Waitlist/Newsletter Entries**: Can only be created, not read or updated by the user once submitted. Must match the standard email format and have a valid source.
2. **Contact Requests**: Similar to waitlist, write-only for users.
3. **Portfolio Analyses**: Must belong to the authenticated user. Immutable once created.
4. **User Stats**: Tracking usage. Users can only update their own stats by incrementing the count and setting a current timestamp.
5. **Admins**: Only verifiable via collection lookup.

## The "Dirty Dozen" Payloads

1. **Waitlist Identity Spoofing**: Attempt to set a `uid` field in waitlist entry (entry should not have one, but we block shadow fields).
2. **Newsletter Read Access**: Attempt for a regular user to list all subscribers.
3. **Portfolio Analysis Stealing**: Attempt to read another user's portfolio analysis by ID.
4. **Analysis Identity Poisoning**: Create an analysis with `userId` of another user.
5. **Stat Count Manipulation**: Skip `analysesCount` from 1 to 100 in one update.
6. **Past Analysis Date**: Set `createdAt` to a historical date.
7. **Contact Message Overload**: Sending a 1MB message string.
8. **Admin Collection Injection**: Attempting to write to `/admins/` as a regular user.
9. **Newsletter Status Hijacking**: Attempt to update a subscriber's email.
10. **System Config Tampering**: Attempt to modify `/system_config/broadcast_status`.
11. **ID Poisoning**: Using a 1KB string as an entry ID.
12. **Malformed Email**: Providing `invalid-email` string in the email field.

## The Test Plan
- Run ESLint with `@firebase/eslint-plugin-security-rules`.
- Perform manual audit of rules against the 8 pillars.
