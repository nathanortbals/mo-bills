# Missouri House Bill Scraper

This Python Playwright script scrapes House bills from the Missouri House of Representatives website.

## Installation

This project uses [UV](https://github.com/astral-sh/uv) for fast, reliable dependency management.

1. Install UV (if not already installed):
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Install project dependencies:
```bash
uv sync
```

3. Install Playwright browsers:
```bash
uv run playwright install chromium
```

## Usage

### Scrape Current Session Bills

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py
```

This will scrape bills from the current legislative session and save to `mo-house-bills-current-R.csv`.

### Scrape Specific Year

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023
```

This will scrape bills from the 2023 regular session and save to `mo-house-bills-2023-R.csv`.

### Scrape Extraordinary Session

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --session-code E
```

### Custom Output File

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --output my-bills.csv
```

### Scrape Detailed Information

By default, the script only scrapes the bill list. To get detailed information for each bill (slower):

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --detailed
```

### Test with Limited Bills

To test the scraper with just a few bills:

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --detailed --limit 5
```

### Download Bill Text PDFs

To download the actual bill text PDFs:

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --detailed --download-pdfs
```

This will save PDFs to the `bill_pdfs/` directory, organized by bill number. You can specify a custom directory:

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --detailed --download-pdfs --pdf-dir my_pdfs
```

## Command Line Options

- `--year`: Legislative year (omit for current session)
- `--session-code`: Session type - `R` for Regular (default), `E` for Extraordinary
- `--output`: Custom output CSV filename
- `--detailed`: Scrape detailed information for each bill (visits each bill's page)
- `--limit`: Limit number of bills to scrape (useful for testing)
- `--download-pdfs`: Download bill text PDFs (requires `--detailed`)
- `--pdf-dir`: Directory to save PDFs (default: `bill_pdfs`)

## Output Format

### Basic Mode (default)

The script generates a CSV file with the following columns:

- `bill_number`: Bill identifier (e.g., HB1607)
- `bill_url`: URL to the bill's detail page
- `sponsor`: Primary sponsor name
- `sponsor_url`: URL to sponsor's profile
- `description`: Brief description of the bill

### Detailed Mode (--detailed flag)

When using `--detailed`, additional columns are included:

- `title`: Full bill title
- `lr_number`: Legislative Request number
- `last_action`: Most recent action taken on the bill
- `proposed_effective_date`: When the bill would take effect
- `bill_string`: Bill identifier string
- `calendar_status`: Current calendar status
- `hearing_status`: Next hearing information
- `cosponsors`: Semicolon-separated list of co-sponsor names
- `actions`: Double-pipe-separated list of all bill actions (format: `date | description || date | description`)
- `hearings`: Double-pipe-separated list of hearings (format: `committee | date | time | location || committee | date | time | location`)
- `bill_documents`: Double-pipe-separated list of bill document PDFs (format: `type | url || type | url`)
- `downloaded_pdfs`: Semicolon-separated list of local PDF file paths (only when using `--download-pdfs`)

## Data Sources

- Current session: https://house.mo.gov/billlist.aspx
- Archive sessions: https://archive.house.mo.gov/billlist.aspx?year={year}&code={code}
- Bill details: https://archive.house.mo.gov/BillContent.aspx?bill={bill}&year={year}&code={code}&style=new
- Co-sponsors: https://archive.house.mo.gov/CoSponsors.aspx?bill={bill}&year={year}&code={code}
- Bill actions: https://archive.house.mo.gov/BillActions.aspx?bill={bill}&year={year}&code={code}
- Bill hearings: https://archive.house.mo.gov/BillHearings.aspx?Bill={bill}&year={year}&code={code}

## Example

```bash
# Scrape 2023 regular session
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --output 2023-regular-session.csv
```

This will create a CSV file similar to the existing `2022-regular-session.csv` in the repository root.

## Development

To add new dependencies:
```bash
uv add package-name
```

To add development dependencies:
```bash
uv add --dev package-name
```
