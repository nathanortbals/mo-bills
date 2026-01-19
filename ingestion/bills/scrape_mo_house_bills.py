#!/usr/bin/env python3
"""
Scrapes Missouri House of Representatives bills from the official website.
"""

import asyncio
import csv
import re
from pathlib import Path
from typing import List, Dict, Optional
import httpx
from playwright.async_api import async_playwright, Page, Browser


class MoHouseBillScraper:
    """Scraper for Missouri House bills."""

    BASE_URL = "https://house.mo.gov/billlist.aspx"
    ARCHIVE_URL_TEMPLATE = "https://archive.house.mo.gov/billlist.aspx?year={year}&code={code}"

    def __init__(self, year: Optional[int] = None, session_code: str = "R"):
        """
        Initialize the scraper.

        Args:
            year: Legislative year (None for current session)
            session_code: Session code (R for Regular, E for Extraordinary)
        """
        self.year = year
        self.session_code = session_code
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

    async def __aenter__(self):
        """Async context manager entry."""
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

    async def start(self):
        """Start the browser and page."""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=True)
        self.page = await self.browser.new_page()

    async def close(self):
        """Close the browser."""
        if self.browser:
            await self.browser.close()

    def _get_url(self) -> str:
        """Get the appropriate URL based on year."""
        if self.year:
            return self.ARCHIVE_URL_TEMPLATE.format(year=self.year, code=self.session_code)
        return self.BASE_URL

    async def scrape_bills(self) -> List[Dict[str, str]]:
        """
        Scrape all bills from the Missouri House website.

        Returns:
            List of bill dictionaries containing bill information
        """
        if not self.page:
            raise RuntimeError("Browser not started. Use async context manager or call start()")

        url = self._get_url()
        print(f"Navigating to {url}...")

        # Navigate to the page
        await self.page.goto(url, wait_until="networkidle")

        # Wait for the table to load
        await self.page.wait_for_selector('table', timeout=10000)

        print("Extracting bill data...")

        # Extract bill data using JavaScript
        bills = await self.page.evaluate("""
            () => {
                const bills = [];
                const tables = Array.from(document.querySelectorAll('table'));
                const billTable = tables.find(t => t.innerText.includes('HB') || t.innerText.includes('SB'));

                if (!billTable) {
                    return [];
                }

                const rows = Array.from(billTable.querySelectorAll('tr'));
                let currentBill = null;

                for (const row of rows) {
                    const cells = Array.from(row.querySelectorAll('td'));

                    // Skip header rows
                    if (cells.length === 0 || row.querySelector('th')) {
                        continue;
                    }

                    // Check if this is a bill number row (typically has 5 cells)
                    if (cells.length >= 4) {
                        const billNumberCell = cells[0];
                        const billLink = billNumberCell.querySelector('a');

                        if (billLink) {
                            const billNumber = billLink.textContent.trim();
                            const billUrl = billLink.href;

                            // Extract sponsor
                            const sponsorCell = cells[1];
                            const sponsorLink = sponsorCell.querySelector('a');
                            const sponsor = sponsorLink ? sponsorLink.textContent.trim() : sponsorCell.textContent.trim();
                            const sponsorUrl = sponsorLink ? sponsorLink.href : '';

                            currentBill = {
                                bill_number: billNumber,
                                bill_url: billUrl,
                                sponsor: sponsor,
                                sponsor_url: sponsorUrl,
                                description: ''
                            };

                            bills.push(currentBill);
                        }
                    }
                    // Check if this is a description row (typically has 2 cells)
                    else if (cells.length === 2 && currentBill) {
                        const descriptionCell = cells[1];
                        currentBill.description = descriptionCell.textContent.trim();
                    }
                }

                return bills;
            }
        """)

        print(f"Found {len(bills)} bills")
        return bills

    def _get_bill_detail_url(self, bill_number: str) -> str:
        """
        Get the bill detail URL for a specific bill.

        Args:
            bill_number: Bill number (e.g., HB1, HRM1)

        Returns:
            URL to the bill detail page
        """
        if self.year:
            return f"https://archive.house.mo.gov/BillContent.aspx?bill={bill_number}&year={self.year}&code={self.session_code}&style=new"
        return f"https://house.mo.gov/BillContent.aspx?bill={bill_number}&year={self.year}&code={self.session_code}&style=new"

    def _get_cosponsors_url(self, bill_number: str) -> str:
        """
        Get the co-sponsors URL for a specific bill.

        Args:
            bill_number: Bill number (e.g., HB1, HRM1)

        Returns:
            URL to the co-sponsors page
        """
        if self.year:
            return f"https://archive.house.mo.gov/CoSponsors.aspx?bill={bill_number}&year={self.year}&code={self.session_code}"
        return f"https://house.mo.gov/CoSponsors.aspx?bill={bill_number}&year={self.year}&code={self.session_code}"

    def _get_bill_actions_url(self, bill_number: str) -> str:
        """
        Get the bill actions URL for a specific bill.

        Args:
            bill_number: Bill number (e.g., HB1, HRM1)

        Returns:
            URL to the bill actions page
        """
        if self.year:
            return f"https://archive.house.mo.gov/BillActions.aspx?bill={bill_number}&year={self.year}&code={self.session_code}"
        return f"https://house.mo.gov/BillActions.aspx?bill={bill_number}&year={self.year}&code={self.session_code}"

    def _get_bill_hearings_url(self, bill_number: str) -> str:
        """
        Get the bill hearings URL for a specific bill.

        Args:
            bill_number: Bill number (e.g., HB1, HRM1)

        Returns:
            URL to the bill hearings page
        """
        if self.year:
            return f"https://archive.house.mo.gov/BillHearings.aspx?Bill={bill_number}&year={self.year}&code={self.session_code}"
        return f"https://house.mo.gov/BillHearings.aspx?Bill={bill_number}&year={self.year}&code={self.session_code}"

    async def scrape_bill_details(self, bill_number: str) -> Dict[str, str]:
        """
        Scrape detailed information for a specific bill.

        Args:
            bill_number: Bill number (e.g., HB1, HRM1)

        Returns:
            Dictionary containing detailed bill information
        """
        if not self.page:
            raise RuntimeError("Browser not started")

        url = self._get_bill_detail_url(bill_number)
        await self.page.goto(url, wait_until="networkidle")

        # Extract detailed information
        details = await self.page.evaluate("""
            () => {
                const details = {
                    bill_number: '',
                    title: '',
                    sponsor: '',
                    sponsor_url: '',
                    lr_number: '',
                    last_action: '',
                    last_action_date: '',
                    proposed_effective_date: '',
                    bill_string: '',
                    calendar_status: '',
                    hearing_status: '',
                    bill_documents: ''
                };

                // Extract bill number from h1
                const h1 = document.querySelector('h1');
                if (h1) {
                    details.bill_number = h1.textContent.trim();
                }

                // Extract title from main div
                const mainDiv = document.querySelector('main > div');
                if (mainDiv) {
                    const fullText = mainDiv.textContent;
                    const lines = fullText.split('\\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });
                    let foundBill = false;
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i] === details.bill_number || lines[i].indexOf(details.bill_number) >= 0) {
                            foundBill = true;
                        } else if (foundBill) {
                            details.title = lines[i];
                            break;
                        }
                    }
                }

                // Helper function to extract labeled data
                const extractLabeledData = (labelText) => {
                    const elements = Array.from(document.querySelectorAll('main *'));
                    for (let i = 0; i < elements.length; i++) {
                        const el = elements[i];
                        if (el.textContent.trim() === labelText) {
                            const nextEl = elements[i + 1];
                            if (nextEl) {
                                return nextEl.textContent.trim();
                            }
                        }
                    }
                    return '';
                };

                // Extract sponsor
                const sponsorLink = document.querySelector('a[href*="MemberDetails"]');
                if (sponsorLink) {
                    details.sponsor = sponsorLink.textContent.trim();
                    details.sponsor_url = sponsorLink.href;
                }

                // Extract various fields
                details.proposed_effective_date = extractLabeledData('Proposed Effective Date:');
                details.lr_number = extractLabeledData('LR Number:');
                details.last_action = extractLabeledData('Last Action:');
                details.bill_string = extractLabeledData('Bill String:');
                details.hearing_status = extractLabeledData('Next House Hearing:');
                details.calendar_status = extractLabeledData('Calendar:');

                // Extract bill documents
                const billDocuments = document.getElementById('BillDocuments');
                const documentStrings = [];
                if (billDocuments) {
                    const docLinks = Array.from(billDocuments.querySelectorAll('a[href*=".pdf"]'));
                    for (let i = 0; i < docLinks.length; i++) {
                        const link = docLinks[i];
                        const docType = link.textContent.trim();
                        const docUrl = link.href;
                        if (docType && docUrl && docType.indexOf('Roll Call') === -1 && docType.indexOf('Witnesses') === -1) {
                            documentStrings.push(docType + ' | ' + docUrl);
                        }
                    }
                }
                details.bill_documents = documentStrings.join(' || ');

                return details;
            }
        """)

        return details

    async def scrape_cosponsors(self, bill_number: str) -> str:
        """
        Scrape co-sponsors for a specific bill.

        Args:
            bill_number: Bill number (e.g., HB1, HRM1)

        Returns:
            Semicolon-separated string of co-sponsor names
        """
        if not self.page:
            raise RuntimeError("Browser not started")

        url = self._get_cosponsors_url(bill_number)
        await self.page.goto(url, wait_until="networkidle")

        # Extract co-sponsors
        cosponsors = await self.page.evaluate("""
            () => {
                const rows = Array.from(document.querySelectorAll('tr'));
                const cosponsorNames = [];

                for (let i = 0; i < rows.length; i++) {
                    const cells = Array.from(rows[i].querySelectorAll('td'));
                    if (cells.length >= 4) {
                        const name = cells[0].textContent.trim();
                        if (name && name !== 'Member') {
                            cosponsorNames.push(name);
                        }
                    }
                }

                return cosponsorNames.join('; ');
            }
        """)

        return cosponsors

    async def scrape_bill_actions(self, bill_number: str) -> str:
        """
        Scrape bill actions for a specific bill.

        Args:
            bill_number: Bill number (e.g., HB1, HRM1)

        Returns:
            Pipe-separated string of actions (date | description)
        """
        if not self.page:
            raise RuntimeError("Browser not started")

        url = self._get_bill_actions_url(bill_number)
        await self.page.goto(url, wait_until="networkidle")

        # Extract bill actions
        actions = await self.page.evaluate("""
            () => {
                const rows = Array.from(document.querySelectorAll('tr'));
                const actionStrings = [];

                for (let i = 0; i < rows.length; i++) {
                    const cells = Array.from(rows[i].querySelectorAll('td'));
                    if (cells.length >= 3) {
                        const date = cells[0].textContent.trim();
                        const description = cells[2].textContent.trim();

                        if (date && description && date !== 'Date') {
                            actionStrings.push(date + ' | ' + description);
                        }
                    }
                }

                return actionStrings.join(' || ');
            }
        """)

        return actions

    async def scrape_bill_hearings(self, bill_number: str) -> str:
        """
        Scrape bill hearings for a specific bill.

        Args:
            bill_number: Bill number (e.g., HB1, HRM1)

        Returns:
            Pipe-separated string of hearings (committee | date | time | location)
        """
        if not self.page:
            raise RuntimeError("Browser not started")

        url = self._get_bill_hearings_url(bill_number)
        await self.page.goto(url, wait_until="networkidle")

        # Extract bill hearings
        hearings = await self.page.evaluate("""
            () => {
                const table = document.querySelector('table');
                if (!table) return '';

                const rows = Array.from(table.querySelectorAll('tr'));
                const hearingStrings = [];

                let currentCommittee = '';
                let currentDate = '';
                let currentTime = '';
                let currentLocation = '';

                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    const cells = Array.from(row.querySelectorAll('td, th'));

                    if (cells.length === 1 && cells[0].tagName === 'TH') {
                        // This is a committee header row
                        if (currentCommittee && currentDate) {
                            hearingStrings.push(currentCommittee + ' | ' + currentDate + ' | ' + currentTime + ' | ' + currentLocation);
                        }

                        const committeeLink = cells[0].querySelector('a');
                        currentCommittee = committeeLink ? committeeLink.textContent.trim() : cells[0].textContent.trim();
                        currentDate = '';
                        currentTime = '';
                        currentLocation = '';
                    } else if (cells.length === 2) {
                        const label = cells[0].textContent.trim();
                        const value = cells[1].textContent.trim();

                        if (label === 'Date:') {
                            currentDate = value;
                        } else if (label === 'Time:') {
                            currentTime = value;
                        } else if (label === 'Location:') {
                            currentLocation = value;
                        }
                    }
                }

                // Add the last hearing
                if (currentCommittee && currentDate) {
                    hearingStrings.push(currentCommittee + ' | ' + currentDate + ' | ' + currentTime + ' | ' + currentLocation);
                }

                return hearingStrings.join(' || ');
            }
        """)

        return hearings

    async def download_bill_documents(self, bill_number: str, documents_string: str, output_dir: Path) -> List[str]:
        """
        Download bill document PDFs.

        Args:
            bill_number: Bill number (e.g., HB1, HRM1)
            documents_string: Pipe-separated string of documents (type | url)
            output_dir: Directory to save PDFs

        Returns:
            List of downloaded file paths
        """
        if not documents_string:
            return []

        # Parse the documents string
        document_pairs = documents_string.split(' || ')
        downloaded_files = []

        # Create output directory for this bill
        bill_dir = output_dir / bill_number
        bill_dir.mkdir(parents=True, exist_ok=True)

        async with httpx.AsyncClient(timeout=30.0) as client:
            for pair in document_pairs:
                parts = pair.split(' | ')
                if len(parts) != 2:
                    continue

                doc_type = parts[0].strip()
                doc_url = parts[1].strip()

                # Create safe filename
                safe_doc_type = doc_type.replace(' ', '_').replace('/', '_')
                filename = f"{bill_number}_{safe_doc_type}.pdf"
                filepath = bill_dir / filename

                try:
                    print(f"    Downloading {doc_type}...")
                    response = await client.get(doc_url)
                    response.raise_for_status()

                    # Save PDF
                    filepath.write_bytes(response.content)
                    downloaded_files.append(str(filepath))
                    print(f"    Saved to {filepath}")

                except Exception as e:
                    print(f"    Error downloading {doc_type}: {e}")

        return downloaded_files


def save_to_csv(bills: List[Dict[str, str]], output_file: Path):
    """
    Save bills to a CSV file.

    Args:
        bills: List of bill dictionaries
        output_file: Path to output CSV file
    """
    if not bills:
        print("No bills to save")
        return

    fieldnames = list(bills[0].keys())

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(bills)

    print(f"Saved {len(bills)} bills to {output_file}")


async def main():
    """Main function to run the scraper."""
    import argparse

    parser = argparse.ArgumentParser(description='Scrape Missouri House bills')
    parser.add_argument('--year', type=int, help='Legislative year (omit for current session)')
    parser.add_argument('--session-code', default='R', choices=['R', 'E'],
                        help='Session code: R=Regular, E=Extraordinary')
    parser.add_argument('--output', type=str,
                        help='Output CSV file (default: mo-house-bills-{year}.csv)')
    parser.add_argument('--detailed', action='store_true',
                        help='Scrape detailed information for each bill (slower)')
    parser.add_argument('--limit', type=int,
                        help='Limit number of bills to scrape (useful for testing)')
    parser.add_argument('--download-pdfs', action='store_true',
                        help='Download bill text PDFs (requires --detailed)')
    parser.add_argument('--pdf-dir', type=str, default='bill_pdfs',
                        help='Directory to save downloaded PDFs (default: bill_pdfs)')

    args = parser.parse_args()

    # Validate arguments
    if args.download_pdfs and not args.detailed:
        parser.error("--download-pdfs requires --detailed flag")

    # Determine output filename
    if args.output:
        output_file = Path(args.output)
    else:
        year_str = str(args.year) if args.year else 'current'
        suffix = '-detailed' if args.detailed else ''
        output_file = Path(f'mo-house-bills-{year_str}-{args.session_code}{suffix}.csv')

    # Run scraper
    async with MoHouseBillScraper(year=args.year, session_code=args.session_code) as scraper:
        bills = await scraper.scrape_bills()

        if not bills:
            print("No bills found!")
            return

        # Limit bills if requested
        if args.limit:
            bills = bills[:args.limit]
            print(f"Limited to first {args.limit} bills")

        # Scrape detailed information if requested
        if args.detailed:
            print(f"Scraping detailed information for {len(bills)} bills...")
            detailed_bills = []

            for i, bill in enumerate(bills, 1):
                bill_number = bill['bill_number']
                print(f"[{i}/{len(bills)}] Scraping details for {bill_number}...")

                try:
                    details = await scraper.scrape_bill_details(bill_number)

                    # Scrape co-sponsors
                    try:
                        cosponsors = await scraper.scrape_cosponsors(bill_number)
                        details['cosponsors'] = cosponsors
                    except Exception as e:
                        print(f"  Warning: Could not scrape co-sponsors for {bill_number}: {e}")
                        details['cosponsors'] = ''

                    # Scrape bill actions
                    try:
                        actions = await scraper.scrape_bill_actions(bill_number)
                        details['actions'] = actions
                    except Exception as e:
                        print(f"  Warning: Could not scrape actions for {bill_number}: {e}")
                        details['actions'] = ''

                    # Scrape bill hearings
                    try:
                        hearings = await scraper.scrape_bill_hearings(bill_number)
                        details['hearings'] = hearings
                    except Exception as e:
                        print(f"  Warning: Could not scrape hearings for {bill_number}: {e}")
                        details['hearings'] = ''

                    # Download PDFs if requested
                    if args.download_pdfs:
                        try:
                            pdf_dir = Path(args.pdf_dir)
                            downloaded = await scraper.download_bill_documents(
                                bill_number,
                                details.get('bill_documents', ''),
                                pdf_dir
                            )
                            details['downloaded_pdfs'] = '; '.join(downloaded)
                        except Exception as e:
                            print(f"  Warning: Could not download PDFs for {bill_number}: {e}")
                            details['downloaded_pdfs'] = ''

                    # Merge basic info with detailed info
                    merged = {**bill, **details}
                    detailed_bills.append(merged)
                except Exception as e:
                    print(f"  Error scraping {bill_number}: {e}")
                    # Keep the basic info even if detailed scraping fails
                    detailed_bills.append(bill)

            bills = detailed_bills

        if bills:
            save_to_csv(bills, output_file)
        else:
            print("No bills to save!")


if __name__ == '__main__':
    asyncio.run(main())
