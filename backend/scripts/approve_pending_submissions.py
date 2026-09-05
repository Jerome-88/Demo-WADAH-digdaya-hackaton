"""Stand-in for the human reviewer that, per PRD section 9, deliberately has
no API endpoint in this MVP — a real reviewer approves a checkpoint by
editing its `submissions` row directly in Supabase Studio (see
sql/schema.sql's `on_submission_approved` trigger, which is what actually
awards XP and inserts the Verified Portfolio entry once `status` flips to
'approved').

That's fine for a live human reviewer, but it means every real-mode
checkpoint submission just sits at 'pending' forever during dev/demo testing
unless someone manually clicks through Supabase Studio each time — this
script does the same row update from the command line instead, so testing
the checkpoint -> approval -> XP/portfolio path doesn't require a Studio
detour every time.

NOT a replacement for real review — this is a dev/demo convenience only,
same spirit as the "Isi contoh cepat (demo)" shortcuts on the frontend.

Usage:
    cd backend
    .venv\\Scripts\\python scripts\\approve_pending_submissions.py                 (all pending, any user)
    .venv\\Scripts\\python scripts\\approve_pending_submissions.py --email a@b.com  (one user only)
"""

import argparse
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

DUMMY_REVIEWER_NOTES = (
    "Hasil kerjanya rapi dan sesuai brief, komunikasinya juga jelas. "
    "Approved — lanjutkan ke unit berikutnya! (catatan dummy dari script dev, bukan reviewer sungguhan)"
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", help="Only approve this user's pending submissions (default: all users)")
    args = parser.parse_args()

    supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

    query = supabase.table("submissions").select("id, user_id, unit_id, revision_count").eq("status", "pending")
    if args.email:
        user = supabase.table("users").select("id").eq("email", args.email).maybe_single().execute()
        if not user or not user.data:
            print(f"No user found with email {args.email}")
            return
        query = query.eq("user_id", user.data["id"])

    pending = query.execute().data or []
    if not pending:
        print("No pending submissions found.")
        return

    for row in pending:
        # Updating (not upserting) — this is what fires the
        # on_submission_approved trigger, exactly like a human editing the
        # row in Supabase Studio would.
        supabase.table("submissions").update({
            "status": "approved",
            "reviewer_notes": DUMMY_REVIEWER_NOTES,
        }).eq("id", row["id"]).execute()
        print(f"Approved submission {row['id']} (unit {row['unit_id']}, user {row['user_id']})")

    print(f"\nDone — approved {len(pending)} submission(s).")


if __name__ == "__main__":
    main()
