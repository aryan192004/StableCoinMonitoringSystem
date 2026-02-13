import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderBookData {
  price: number;
  cumulative: number;
}

interface ExchangeData {
  name: string;
  pairs: string[];
  totalDepth: string;
  avgSpread: string;
  status: string;
}

interface DexPoolData {
  pool: string;
  dex: string;
  tvl: string;
  volume24h: string;
  apy: string;
}

interface LiquidityReportData {
  selectedCoin: string;
  selectedExchange: string;
  exchanges: ExchangeData[];
  bidDepth: OrderBookData[];
  askDepth: OrderBookData[];
  dexPools: DexPoolData[];
  timestamp: Date;
}

/**
 * Generate a comprehensive PDF report for liquidity monitoring
 */
export function generateLiquidityReport(data: LiquidityReportData): void {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper function to format depth values
  const formatDepth = (val: number): string => {
    if (val === 0) return '$0';
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}M`;
    if (val >= 100) return `$${Math.round(val)}K`;
    return `$${val.toFixed(1)}K`;
  };

  // ============================================
  // HEADER SECTION
  // ============================================
  doc.setFillColor(37, 99, 235); // Primary blue
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Liquidity Monitoring Report', pageWidth / 2, 20, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Real-time Order Book Depth Analysis', pageWidth / 2, 28, { align: 'center' });

  // Report metadata
  doc.setFontSize(10);
  const dateStr = data.timestamp.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  doc.text(`Generated: ${dateStr}`, pageWidth / 2, 38, { align: 'center' });

  yPosition = 60;

  // ============================================
  // SELECTED MARKET INFO
  // ============================================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Market Selection', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Selected Stablecoin: ${data.selectedCoin}`, 15, yPosition);
  yPosition += 6;
  doc.text(`Selected Exchange: ${data.selectedExchange}`, 15, yPosition);
  yPosition += 12;

  // ============================================
  // EXCHANGE OVERVIEW SECTION
  // ============================================
  checkPageBreak(50);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('Exchange Overview', 15, yPosition);
  yPosition += 2;
  
  // Draw underline
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, 60, yPosition);
  yPosition += 8;

  // Exchange overview table
  const exchangeTableData = data.exchanges.map(exchange => [
    exchange.name,
    exchange.pairs.length.toString(),
    exchange.totalDepth,
    exchange.avgSpread,
    exchange.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Exchange', 'Pairs', 'Total Depth', 'Avg Spread', 'Status']],
    body: exchangeTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { textColor: [22, 163, 74] }, // Green for status
    },
    margin: { left: 15, right: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // ORDER BOOK DEPTH SECTION
  // ============================================
  checkPageBreak(60);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('Order Book Depth Analysis', 15, yPosition);
  yPosition += 2;
  
  doc.setDrawColor(37, 99, 235);
  doc.line(15, yPosition, 75, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${data.selectedCoin} on ${data.selectedExchange}`, 15, yPosition);
  yPosition += 10;

  // Summary statistics
  const totalBidDepth = data.bidDepth.length > 0 
    ? data.bidDepth[data.bidDepth.length - 1].cumulative 
    : 0;
  const totalAskDepth = data.askDepth.length > 0 
    ? data.askDepth[data.askDepth.length - 1].cumulative 
    : 0;
  const spreadBps = data.bidDepth.length > 0 && data.askDepth.length > 0
    ? ((data.askDepth[0].price - data.bidDepth[data.bidDepth.length - 1].price) / data.bidDepth[data.bidDepth.length - 1].price * 10000).toFixed(2)
    : 'N/A';

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Metrics:', 15, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`• Total Bid Depth: ${formatDepth(totalBidDepth)}`, 20, yPosition);
  yPosition += 6;
  doc.text(`• Total Ask Depth: ${formatDepth(totalAskDepth)}`, 20, yPosition);
  yPosition += 6;
  doc.text(`• Spread: ${spreadBps} basis points`, 20, yPosition);
  yPosition += 10;

  // Bid depth table
  checkPageBreak(40);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74); // Green for bids
  doc.text('Bid Depth (Buy Orders)', 15, yPosition);
  yPosition += 6;

  const bidTableData = data.bidDepth
    .slice(-10) // Last 10 entries
    .reverse()
    .map(bid => [
      `$${bid.price.toFixed(4)}`,
      formatDepth(bid.cumulative),
    ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Price Level', 'Cumulative Depth']],
    body: bidTableData,
    theme: 'plain',
    headStyles: {
      fillColor: [220, 252, 231], // Light green
      textColor: [22, 163, 74],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
    },
    margin: { left: 15, right: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Ask depth table
  checkPageBreak(40);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38); // Red for asks
  doc.text('Ask Depth (Sell Orders)', 15, yPosition);
  yPosition += 6;

  const askTableData = data.askDepth
    .slice(0, 10) // First 10 entries
    .map(ask => [
      `$${ask.price.toFixed(4)}`,
      formatDepth(ask.cumulative),
    ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Price Level', 'Cumulative Depth']],
    body: askTableData,
    theme: 'plain',
    headStyles: {
      fillColor: [254, 226, 226], // Light red
      textColor: [220, 38, 38],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
    },
    margin: { left: 15, right: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // DEX LIQUIDITY POOLS SECTION
  // ============================================
  checkPageBreak(60);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('DEX Liquidity Pools', 15, yPosition);
  yPosition += 2;
  
  doc.setDrawColor(37, 99, 235);
  doc.line(15, yPosition, 60, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Decentralized exchange pool tracking', 15, yPosition);
  yPosition += 8;

  // DEX pools table
  const dexTableData = data.dexPools.map(pool => [
    pool.pool,
    pool.dex,
    pool.tvl,
    pool.volume24h,
    pool.apy,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Pool', 'DEX', 'TVL', '24h Volume', 'APY']],
    body: dexTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { textColor: [22, 163, 74] }, // Green for APY
    },
    margin: { left: 15, right: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // FOOTER SECTION
  // ============================================
  checkPageBreak(30);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text('Disclaimer: This report is generated for informational purposes only.', 15, yPosition);
  yPosition += 5;
  doc.text('Data is sourced from live exchange APIs and may be subject to network delays.', 15, yPosition);
  yPosition += 5;
  doc.text('Always verify critical information with official exchange sources.', 15, yPosition);

  // Add page numbers to all pages
  const totalPages = doc.internal.pages.length - 1; // Exclude the first empty page
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 15,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // ============================================
  // SAVE PDF
  // ============================================
  const filename = `liquidity-report-${data.selectedCoin}-${data.selectedExchange}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
