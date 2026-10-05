# 🔥 GymTrack

A personal, offline-first **workout + nutrition + progress** tracker. Single-page app, no build step, no account: all data is saved on your device.

**Live app:** https://stanish-appalo.github.io/gymtrack/

## Features
- **Overview** dashboard with a charcoal and violet theme, weekly activity charts, muscle heatmap, and rankings by primary exercises or recorded sets. Browse previous weeks and tap a day or muscle for its logged exercises.
- **Workout** plan Mon to Sun with check-off and progressive-overload weight suggestions. New completions preserve muscle tags, prescribed sets, reps, and weight for historical reporting.
- **Swappable days**: tap a day, then tap body parts (Chest, Legs, Abs...) to choose what you train. Pick several and their exercises appear below.
- **Muscles** tab: detailed interactive anatomy with front, back, and combined views, optional labels, and 15 selectable muscle groups. See primary/supporting exercises and training days, or add exercises from the library. The same artwork highlights targets in exercise details and works offline.
- **Exercise library**: 70+ extra exercises with real demo photos + ⭐ recommended picks.
- **Food** tracker: protein & calorie targets that scale with your body weight, a recomp coach, and a big food database (incl. Indian dishes, junk food & restaurant meals).
- **History**: detailed day-by-day log of what you trained and ate.
- **Progress**: body-weight log, BMI, charts, monthly goal, strongest lifts, and Excel (CSV) export.
- Installable as a phone app (Add to Home Screen) and works fully offline.

## Run locally
Just open `index.html` in a browser. (The `assets/` folder must stay next to it.)

## Training statistics
Weeks run Monday to Sunday using device-local dates. Completion counts come from workout history, not the current plan. Muscle rankings count primary targets; supporting targets appear in the muscle detail. Sets reflect the prescribed sets at completion, exclude cardio, and are not individual set tracking. Older records retain their main muscle; missing sets and supporting targets are not guessed. These charts describe logged activity, not muscle recovery or growth.

Run the calculation checks with `node --test tests/insights.test.cjs` (no dependencies required).

## Credits
Exercise photos & instructions from the public-domain [free-exercise-db](https://github.com/yuhonas/free-exercise-db).
