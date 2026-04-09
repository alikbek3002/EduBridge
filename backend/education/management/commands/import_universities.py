import re
from typing import Dict, List, Optional

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

try:
    import pandas as pd
except Exception as e:  # pragma: no cover
    raise CommandError("pandas is required. Install with: pip install pandas") from e

from education.models import University, Major, UniversityMajor


def pick_column(df: "pd.DataFrame", candidates: List[str]) -> Optional[str]:
    cols = {c.lower().strip(): c for c in df.columns}
    for cand in candidates:
        key = cand.lower().strip()
        if key in cols:
            return cols[key]
    # try loose contains match
    for key, orig in cols.items():
        for cand in candidates:
            if cand.lower() in key:
                return orig
    return None


def get_value(row, col):
    if not col:
        return None
    val = row.get(col)
    if pd.isna(val):
        return None
    return val


class Command(BaseCommand):
    help = "Import universities (and majors relations) from Excel/CSV/Google Sheets CSV."

    def add_arguments(self, parser):
        group = parser.add_mutually_exclusive_group(required=True)
        group.add_argument("--excel", dest="excel_path", help="Path to .xlsx file")
        group.add_argument("--csv", dest="csv_path", help="Path to .csv file")
        group.add_argument("--csv-url", dest="csv_url", help="Public CSV URL (Google Sheets: File > Share > Publish, use export?format=csv)")

        parser.add_argument("--sheet", dest="sheet_name", help="Excel sheet name (default: first)")
        parser.add_argument("--encoding", default="utf-8", help="CSV encoding (default: utf-8)")
        parser.add_argument("--limit", type=int, default=None, help="Limit rows to import")
        parser.add_argument("--dry-run", action="store_true", help="Validate without saving")
        parser.add_argument("--majors-col", dest="majors_col", help="Explicit majors column name (comma/semicolon separated)")

    def handle(self, *args, **options):
        excel_path = options.get("excel_path")
        csv_path = options.get("csv_path")
        csv_url = options.get("csv_url")
        sheet_name = options.get("sheet_name")
        encoding = options.get("encoding")
        limit = options.get("limit")
        dry_run = options.get("dry_run")
        majors_col_override = options.get("majors_col")

        # Read dataframe
        try:
            if excel_path:
                df = pd.read_excel(excel_path, sheet_name=sheet_name or 0)
            elif csv_path:
                df = pd.read_csv(csv_path, encoding=encoding)
            elif csv_url:
                df = pd.read_csv(csv_url)
            else:
                raise CommandError("No input provided")
        except Exception as e:
            raise CommandError(f"Failed to read input: {e}")

        if limit:
            df = df.head(limit)

        self.stdout.write(self.style.NOTICE(f"Loaded {len(df)} rows with columns: {list(df.columns)}"))

        # Column mapping (English + Russian variants)
        col_name = pick_column(df, ["name", "университет", "название", "university", "uni name"]) or "name"
        col_country = pick_column(df, ["country", "страна"]) or None
        col_city = pick_column(df, ["city", "город"]) or None
        col_desc = pick_column(df, ["description", "описание", "about"]) or None
        col_site = pick_column(df, ["website", "сайт", "url", "link"]) or None
        col_level = pick_column(df, ["level", "уровень"]) or None
        col_students = pick_column(df, ["students", "student_count", "студентов"]) or None
        # Optional deadline column (submission deadline)
        col_deadline = pick_column(df, [
            "deadline",
            "application deadline",
            "дедлайн",
            "срок подачи",
            "срок подачи документов",
        ]) or None
        col_majors = majors_col_override or pick_column(df, ["majors", "specialties", "направления", "специальности", "faculties", "факультеты"]) or None
        col_lang = pick_column(df, ["language", "язык", "language of instruction"]) or None
        col_requirements = pick_column(df, ["requirements", "требования"]) or None
        col_duration = pick_column(df, ["duration", "duration_years", "продолжительность"]) or None

        created_unis = 0
        updated_unis = 0
        created_majors = 0
        created_links = 0

        actions = []

        with transaction.atomic():
            for _, row in df.iterrows():
                name = str(get_value(row, col_name) or "").strip()
                if not name:
                    continue

                fields = {}
                if col_country: fields["country"] = str(get_value(row, col_country) or "").strip() or "Italy"
                if col_city: fields["city"] = str(get_value(row, col_city) or "").strip() or ""
                if col_desc: fields["description"] = str(get_value(row, col_desc) or "").strip()
                if col_site: fields["website"] = str(get_value(row, col_site) or "").strip()

                def parse_int(v):
                    if v is None: return None
                    try:
                        return int(float(v))
                    except Exception:
                        return None

                def parse_decimal(v):
                    if v is None: return None
                    try:
                        s = str(v).replace(" ", "").replace(",", ".")
                        return float(s)
                    except Exception:
                        return None

                if col_level: fields["level"] = str(get_value(row, col_level) or "").strip()
                if col_students: fields["student_count"] = parse_int(get_value(row, col_students))
                # Parse deadline in flexible formats (YYYY-MM-DD, DD.MM.YYYY, MM/DD/YYYY, etc.)
                if col_deadline:
                    raw_deadline = get_value(row, col_deadline)
                    parsed = None
                    if raw_deadline is not None:
                        try:
                            from datetime import datetime
                            s = str(raw_deadline).strip()
                            # Try ISO first
                            for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
                                try:
                                    parsed = datetime.strptime(s, fmt).date()
                                    break
                                except Exception:
                                    continue
                        except Exception:
                            parsed = None
                    if parsed:
                        fields["deadline"] = parsed

                # Ensure description not empty (required=True in model). Provide default.
                if not fields.get("description"):
                    fields["description"] = ""

                uni, created = University.objects.update_or_create(
                    name=name,
                    defaults=fields,
                )

                if created:
                    created_unis += 1
                    actions.append(f"Created University: {uni.name}")
                else:
                    updated_unis += 1
                    actions.append(f"Updated University: {uni.name}")

                # Parse majors and link
                majors_raw = get_value(row, col_majors) if col_majors else None
                if majors_raw:
                    # split by ; , or / or | newlines
                    parts = re.split(r"[;,/\n\|]", str(majors_raw))
                    for part in parts:
                        mname = part.strip()
                        if not mname:
                            continue
                        major, m_created = Major.objects.get_or_create(name=mname, defaults={"description": "", "category": ""})
                        if m_created:
                            created_majors += 1
                            actions.append(f"Created Major: {major.name}")

                        link_defaults = {
                            "duration_years": parse_int(get_value(row, col_duration)) or 3,
                            "language": str(get_value(row, col_lang) or "English").strip() or "English",
                            "requirements": str(get_value(row, col_requirements) or "").strip(),
                        }
                        _, link_created = UniversityMajor.objects.get_or_create(
                            university=uni,
                            major=major,
                            defaults=link_defaults,
                        )
                        if link_created:
                            created_links += 1
                            actions.append(f"Linked {uni.name} - {major.name}")

            if dry_run:
                transaction.set_rollback(True)

        self.stdout.write(self.style.SUCCESS(
            f"Universities: created {created_unis}, updated {updated_unis}; Majors created {created_majors}; Links created {created_links}"
        ))

        # Print a short summary log (last 20 actions)
        if actions:
            for line in actions[-20:]:
                self.stdout.write(" - " + line)

        if dry_run:
            self.stdout.write(self.style.WARNING("Dry-run complete. No changes were saved."))
