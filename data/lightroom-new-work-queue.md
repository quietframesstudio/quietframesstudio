# Lightroom: new work waiting to be published

Discovered via the Adobe Lightroom API on 2026-07-02: the synced Lightroom
catalog (`c248bae599dc4456a483be34bc661ee8`) contains **85 frames scanned
May–June 2026** (files ` 3163.tif` through ` 3243.tif`) that post-date
everything currently on the site. Metadata was reachable from the cloud
session, but pixel access (presigned renditions) requires an Adobe for
Creativity entitlement that this session's connector did not have —
see https://developer.adobe.com/adobe-for-creativity/

## How to publish them (either path works)

**Path A — local session on the Mac mini (recommended):**
1. Run Claude Code on the Mac mini.
2. In Lightroom Classic, the frames are the most recent imports
   (file numbers 3163–3243, May 8 – June 2, 2026).
3. Export as JPEG, long edge 2400px, quality ~88, into
   `images/<new-series-id>/`.
4. Ask Claude to: generate thumbs (`images/<series>/thumbs/`, 900px),
   add entries to `gallery-data.json` (photos + series + photoCount,
   evocative titles), and run `node scripts/build-sitemap.js`.

**Path B — grant the Adobe entitlement, re-run in the cloud:**
Enable Lightroom asset access for the Adobe for Creativity connector,
then any Claude session can pull renditions directly and finish the
publish end-to-end.

## Batch inventory (from the API)

Rolls by capture/scan date:
- 2026-05-08 → 05-09: frames 3163–3187 (~15 frames)
- 2026-05-09: frames 3191–3233 (~40 frames, incl. two square-format 3182, 3201)
- 2026-05-10 → 05-17: frames 3234–3243 (vertical frames 3234, 3235, 3239, 3243)
- 2026-06-02: frames 3208, 3241 (later scans)

Total in catalog: 1,223 assets. Everything ≤ frame 3162 predates the
current site content (published through 2026-03-31).
