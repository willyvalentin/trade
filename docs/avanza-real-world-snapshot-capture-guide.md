# Avanza Real-World Snapshot Capture Guide

## Purpose

This guide explains how to collect Avanza page signals for the Sharp Semi Auto
Execution Agent without storing sensitive data. The goal is selector and state
planning only.

## Hard Rules

- Never include password.
- Never include personnummer.
- Never include account numbers.
- Never include cookies.
- Never include session/localStorage data.
- Never include BankID QR.
- Never include broker secrets.
- Never include raw HTML when text notes are enough.
- Never include full sensitive URLs; use a non-sensitive URL kind instead.

## Screenshot Rules

Screenshots are allowed only after masking personal or sensitive data. Mask all
names, numbers, account identifiers, balances if sensitive, QR codes, and any
login material before sharing or storing.

If unsure, send screenshot with all numbers/names masked.

## Preferred Input

DOM/text notes are preferred over raw HTML. Useful signals are:

- visible text
- labels
- placeholders
- button text
- non-sensitive page title
- non-sensitive URL kind, not full URL if sensitive

## Requested Pages

- logged out login page
- username/password login state
- BankID/MFA/manual-action state
- logged-in home/account overview
- instrument page
- BUY limit ticket
- SELL limit ticket
- order review page
- order confirmation page

## Allowed URL Kinds

Use one of these instead of a full URL when there is any doubt:

- `unknown`
- `avanza`
- `avanza_login`
- `avanza_account`
- `avanza_instrument`
- `avanza_order`
- `avanza_review`
- `avanza_confirmation`

## Safety Boundary

Snapshot intake does not navigate to Avanza, log in, handle credentials, read
cookies, export sessions, fill forms, click, submit orders, bypass BankID, or
write Supabase execution records. BankID/MFA remains manual-action only.

## Sanitized Login-Flow Signal Pack

The sanitized user-provided login-flow material is captured as a fixture/model
signal pack in `docs/avanza-real-world-login-flow-signals.md`.

Recognized safe text cues include `Användarnamn och lösenord`, `Privatkund`,
`Företag`, `Användarnamn`, `Lösenord`, `Logga in`, `Avbryt`,
`Logga in på företagswebben`, `Visa QR-kod`, and
`Öppna BankID på samma enhet`.

These cues are allowed only as sanitized selector/state planning material. They
must not include credential values, password values, personnummer, account
numbers, cookies/session data, BankID QR payloads, or screenshots with
sensitive data.
