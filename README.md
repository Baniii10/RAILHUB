# RAILHUB

RAILHUB is a JavaScript Next.js railway travel simulation backed by Supabase. It is an academic project and is not an official KAI service.

## Local development

1. Install dependencies with `npm install`.
2. Configure `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_WHATSAPP_NUMBER`. The current demo payment flow does not need payment gateway keys.
3. In the Supabase SQL Editor, run the supplied data package's `supabase_schema.sql`, then its `seed.sql`.
4. Run `supabase\migrations\202610310001_search_train_schedules.sql` after the base schema and seed. The migration exposes a restricted public search RPC and computes class seat availability from database records.
5. Run `supabase\migrations\202610310002_secure_passenger_booking.sql` to create missing passenger profiles on signup, enable seat selection, atomic passenger booking, ticket issuance, and booking ownership policies.
6. Run `supabase\migrations\202610310003_staff_operations.sql` to configure staff journey assignments, ticket validation, and operational status updates.
7. Run `supabase\migrations\202610310004_passenger_services.sql` to enable the fictional onboard menu, passenger food orders, and assistance/lost-item reports.
8. Run `supabase\migrations\202610310005_simulated_schedule_calendar.sql` to add daily Gambir–Solo Balapan sample schedules via Yogyakarta for the next 90 days.
9. Run `supabase\migrations\202610310006_fix_simulated_schedule_times.sql` to set the simulated service to 07:00–16:00 Jakarta time.
10. Run `supabase\migrations\202610310007_expand_simulated_schedule_calendar.sql` to add daily services for all other seeded routes over the same 90-day period.
11. Run `supabase\migrations\202611010001_ensure_40_seats_per_carriage.sql` to ensure each carriage has 40 seats.
12. Run `supabase\migrations\202611010002_manage_paid_bookings.sql` to enable ticket rescheduling and cancellation rules.
13. Run `supabase\migrations\202611010003_food_order_checkout.sql` to record the selected simulated food-order payment method.
14. Run `supabase\migrations\202611010004_ticket_payment_method.sql` to let passengers select and record a ticket payment method.
15. Run `supabase\migrations\202611010006_enable_simulated_payments.sql` to enable demo ticket and food payments.
16. Run `supabase\migrations\202611010007_expand_station_catalog.sql` to enable up to 50 active, verified intercity stations from the supplied data package and add simulated connecting schedules using its five train records.
17. Run `supabase\migrations\202611020001_staff_passenger_journey_flow.sql` to enforce valid journey-status transitions for staff/admin updates; passenger ticket details then show the shared status history.
18. Run `supabase\migrations\20261104192451_role_station_access.sql` to configure gate/conductor access and station-scoped ticket validation.
19. Run `supabase\migrations\20261105061114_remove_midtrans_and_harden_roles.sql` to remove obsolete gateway objects from databases that previously enabled them.
20. Run `supabase\migrations\20261105193000_reschedule_cancel_2hours.sql` to set the real-time reschedule and cancellation cutoff to 2 hours before departure.
21. Start the app with `npm run dev`.

The Supabase URL and anonymous key are public client configuration; never put a service-role key in the browser or in `.env.local` variables prefixed with `NEXT_PUBLIC_`.

## Current functionality

- Public home page with a station/date/passenger search; authenticated passengers see their own travel dashboard.
- Station choices loaded from active, bookable Supabase station records.
- Search results loaded by the `search_train_schedules` database function, with class filtering and price, duration, and departure sorting.
- Daily simulated schedules for all seeded routes over the next 90 days; these are not official operator timetables.
- A catalog capped at 50 active, verified intercity stations from `stations_java.csv`; simulated hub connections use the five train records supplied in `sample_trains.csv`. These added connections, distances, times, and fares are demonstrations, not official routes or schedules.
- Passenger seat selection, fictional passenger details, atomic booking, simulated demo payment, and private QR tickets.
- Passenger dashboard with RLS-protected booking and payment summaries; open a ticket to order onboard food and drinks.
- E-boarding passes unlock two hours before departure. Paid tickets can be rescheduled or cancelled up to 2 hours before departure; rescheduling charges 20% of a positive fare difference, and cancellation records a 20% fee and 80% simulated refund. No real money is processed.
- Admin database overview and staff assignment; staff dashboard with assigned-journey status updates and one-time ticket validation.
- Passenger food ordering and journey reports connected to the assigned staff service desk.
- Food orders use a menu-selection step followed by a simulated payment confirmation; no real payment gateway is contacted.
- Ticket checkout lets passengers select QRIS, e-wallet, or bank transfer as a demo method. The app marks the simulated payment as successful and issues tickets; no real money is processed.

## Create an admin account

The project does not seed demo users in Supabase Auth. Register an account in the app, then sign in to the Supabase Dashboard as the project owner and run this in the SQL Editor, replacing the email with the registered account:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE lower(email) = lower('your-account@example.com');
```

Confirm that the query updated one row. Then sign out and back in to RAILHUB and open `/dashboard/admin`. Never expose a service-role key or grant admin role through the public registration form.

Apply the migrations above in order before using the application. The checkout is simulation-only and does not process real money. Seed data and sample accounts are development-only.

## Validation

Run `npm run lint` and `npm run build` before submitting changes.

---

The remaining sections below are the original Next.js starter references.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
