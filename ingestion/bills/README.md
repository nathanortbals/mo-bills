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

The scraper automatically downloads comprehensive bill data including co-sponsors, actions, hearings, and PDF documents.

### Scrape Current Session Bills

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py
```

This will scrape all bills from the current legislative session and save to `mo-house-bills-current-R.csv`.

### Scrape Specific Year

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023
```

This will scrape all bills from the 2023 regular session and save to `mo-house-bills-2023-R.csv`.

### Scrape Extraordinary Session

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --session-code E
```

### Custom Output File

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --output my-bills.csv
```

### Test with Limited Bills

To test the scraper with just a few bills:

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --limit 5
```

### Custom PDF Directory

By default, PDFs are saved to `bill_pdfs/`. You can specify a custom directory:

```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --pdf-dir my_pdfs
```

## Command Line Options

- `--year`: Legislative year (omit for current session)
- `--session-code`: Session type - `R` for Regular (default), `E` for Extraordinary
- `--output`: Custom output CSV filename
- `--limit`: Limit number of bills to scrape (useful for testing)
- `--pdf-dir`: Directory to save PDFs (default: `bill_pdfs`)

## Output Format

The script generates a comprehensive CSV file with the following columns:

### Basic Information
- `bill_number`: Bill identifier (e.g., HB1607)
- `bill_url`: URL to the bill's detail page
- `title`: Full bill title
- `description`: Brief description of the bill

### Sponsor Information
- `sponsor`: Primary sponsor name
- `sponsor_url`: URL to sponsor's profile
- `cosponsors`: Semicolon-separated list of co-sponsor names

### Legislative Details
- `lr_number`: Legislative Request number
- `bill_string`: Bill identifier string
- `last_action`: Most recent action taken on the bill
- `proposed_effective_date`: When the bill would take effect
- `calendar_status`: Current calendar status
- `hearing_status`: Next hearing information

### Complete History
- `actions`: Double-pipe-separated list of all bill actions (format: `date | description || date | description`)
- `hearings`: Double-pipe-separated list of hearings (format: `committee | date | time | location || committee | date | time | location`)

### Bill Documents
- `bill_documents`: Double-pipe-separated list of bill document PDFs (format: `type | url || type | url`)
- `downloaded_pdfs`: Semicolon-separated list of local PDF file paths

## Data Sources

- Current session: https://house.mo.gov/billlist.aspx
- Archive sessions: https://archive.house.mo.gov/billlist.aspx?year={year}&code={code}
- Bill details: https://archive.house.mo.gov/BillContent.aspx?bill={bill}&year={year}&code={code}&style=new
- Co-sponsors: https://archive.house.mo.gov/CoSponsors.aspx?bill={bill}&year={year}&code={code}
- Bill actions: https://archive.house.mo.gov/BillActions.aspx?bill={bill}&year={year}&code={code}
- Bill hearings: https://archive.house.mo.gov/BillHearings.aspx?Bill={bill}&year={year}&code={code}

## Example

```bash
# Scrape 2023 regular session with all details and PDFs
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023 --output 2023-regular-session.csv
```

This will create a comprehensive CSV file with all bill data and download bill text PDFs to the `bill_pdfs/` directory.

## Development

To add new dependencies:
```bash
uv add package-name
```

To add development dependencies:
```bash
uv add --dev package-name
```
