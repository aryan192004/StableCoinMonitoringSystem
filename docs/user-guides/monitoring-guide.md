# User Guide: Monitoring Stablecoins

## Getting Started

### 1. Access the Platform

Navigate to the platform URL:
- Development: http://localhost:3000
- Production: https://stablecoin-monitor.com

### 2. Dashboard Overview

The main dashboard displays all tracked stablecoins with key metrics:

| Column | Description |
|--------|-------------|
| **Name** | Stablecoin name and symbol |
| **Price** | Current USD price |
| **Peg Deviation** | Percentage deviation from $1.00 |
| **24h Volume** | Trading volume in last 24 hours |
| **Market Cap** | Total market capitalization |
| **Risk** | Risk level indicator (Low/Medium/High) |

### 3. Sorting and Filtering

- **Sort**: Click column headers to sort by any metric
- **Filter**: Use the filter dropdown to show only specific types (fiat-backed, crypto-backed, etc.)
- **Search**: Use the search bar to find specific stablecoins

## Understanding Peg Deviation

### What is Peg Deviation?

Peg deviation measures how far a stablecoin's price has moved from its intended $1.00 value.

**Example**:
- Price: $1.003 → Deviation: +0.3%
- Price: $0.997 → Deviation: -0.3%

### Risk Levels

🟢 **Low Risk** (<0.2% deviation)
- Stable peg
- Normal market conditions
- No immediate concerns

🟡 **Medium Risk** (0.2% - 0.5% deviation)
- Minor peg stress
- Monitor closely
- May indicate market volatility

🔴 **High Risk** (>0.5% deviation)
- Significant depeg
- Potential liquidity issues
- Immediate attention required

### Viewing Historical Data

1. Click on a stablecoin to view details
2. Select the **Peg Tracker** tab
3. Choose time period: 1h, 24h, 7d, 30d
4. Hover over the chart to see specific values

## Liquidity Monitoring

### What is Liquidity?

Liquidity measures how easily a stablecoin can be bought or sold without affecting its price.

### Key Metrics

**Order Book Depth**
- **Bids**: Total USD value of buy orders
- **Asks**: Total USD value of sell orders
- Higher values = better liquidity

**Bid-Ask Spread**
- Difference between highest buy and lowest sell price
- Lower spread = better liquidity
- Example: 0.0001 = $0.0001 difference

**Liquidity Score** (0-1)
- Composite score combining all liquidity metrics
- >0.7 = Good liquidity
- 0.3-0.7 = Moderate liquidity
- <0.3 = Low liquidity ⚠️

### Viewing Liquidity Data

1. Navigate to stablecoin details
2. Click **Liquidity** tab
3. View metrics by exchange
4. Compare DEX vs CEX liquidity

## Reserve Transparency

### Understanding Reserves

Stablecoins are backed by various assets. Transparency in reserve composition is crucial for trust.

### Asset Categories

**Cash & Cash Equivalents**
- Bank deposits
- Money market funds

**Treasury Bills**
- Short-term government debt
- Highly liquid and safe

**Commercial Paper**
- Short-term corporate debt
- Higher yield, slightly higher risk

**Crypto-Backed**
- Collateral in crypto assets
- Common for algorithmic stablecoins

**Other Assets**
- Corporate bonds
- Mixed assets

### Transparency Score

- **1.0 (Perfect)**: Full on-chain verification
- **0.8-0.9 (Excellent)**: Regular audits, public reports
- **0.6-0.7 (Good)**: Periodic audits
- **0.4-0.5 (Fair)**: Limited transparency
- **<0.4 (Poor)**: Minimal disclosure

### Viewing Reserve Data

1. Go to stablecoin details
2. Click **Reserves** tab
3. View composition pie chart
4. Check last audit date
5. Review transparency score

## Setting Up Alerts

### Creating an Alert

1. Click **Alerts** in navigation
2. Click **Create New Alert**
3. Fill in alert details:
   - **Stablecoin**: Select coin to monitor
   - **Alert Type**: Choose what to monitor
   - **Threshold**: Set trigger value
   - **Channels**: Email, Telegram, Push

### Alert Types

**Peg Deviation Alert**
- Triggers when price deviates by X%
- Example: Alert when deviation > 0.5%

**Liquidity Drop Alert**
- Triggers when liquidity falls by X%
- Example: Alert on 20% liquidity decrease

**Volume Spike Alert**
- Triggers on unusual volume
- Example: Alert when volume increases 50%

**Market Cap Change**
- Triggers on significant cap changes
- Example: Alert on 10% cap decrease

### Alert Channels

**Email**
- Instant email notifications
- Includes alert details and links

**Telegram**
- Real-time bot notifications
- Quick access to dashboard

**Web Push**
- Browser notifications
- Works when app is open

### Managing Alerts

- **Enable/Disable**: Toggle alerts on/off
- **Edit**: Modify thresholds or channels
- **Delete**: Remove alerts
- **Alert History**: View past triggers

## Risk Indicators

### How Risk is Calculated

The platform uses a rule-based scoring system:

| Factor | Weight | Description |
|--------|--------|-------------|
| Peg Deviation | 30% | Price stability |
| Liquidity | 25% | Market depth |
| Volume Volatility | 20% | Trading patterns |
| Reserve Transparency | 25% | Asset backing |

### Overall Risk Score (0-1)

- **0.0-0.3**: 🟢 Low Risk
- **0.3-0.7**: 🟡 Medium Risk
- **0.7-1.0**: 🔴 High Risk

### Interpreting Risk Scores

**Low Risk (Green)**
- Stable peg (<0.2% deviation)
- Good liquidity
- Transparent reserves
- Normal volume patterns

**Medium Risk (Yellow)**
- Minor peg fluctuations (0.2-0.5%)
- Adequate liquidity
- Moderate transparency
- Some volume volatility

**High Risk (Red)**
- Significant depeg (>0.5%)
- Low liquidity
- Poor transparency
- Unusual volume patterns

### Risk Warnings

The system displays warnings for:
- ⚠️ Sustained depeg (>1 hour)
- ⚠️ Liquidity below threshold
- ⚠️ Volume spike detected
- ⚠️ Reserve audit overdue

## Best Practices

### For Traders

1. **Monitor Multiple Metrics**
   - Don't rely on price alone
   - Check liquidity before large trades
   - Review reserve composition

2. **Set Conservative Alerts**
   - Alert at 0.3% deviation
   - Monitor liquidity changes
   - Track volume anomalies

3. **Use Historical Data**
   - Review past depeg events
   - Analyze recovery patterns
   - Identify recurring issues

### For Investors

1. **Due Diligence**
   - Review transparency scores
   - Check audit dates
   - Understand reserve composition

2. **Diversification**
   - Don't rely on single stablecoin
   - Mix backing types (fiat, crypto)
   - Consider risk scores

3. **Regular Monitoring**
   - Check dashboard daily
   - Review risk trends
   - Stay informed on audits

### For Exchanges

1. **Listing Decisions**
   - Evaluate risk scores
   - Require transparency
   - Monitor liquidity

2. **Risk Management**
   - Set trading limits
   - Monitor depegs
   - Prepare contingencies

## Troubleshooting

### Data Not Updating

- Check internet connection
- Refresh the page
- Clear browser cache
- Contact support if persistent

### Alerts Not Working

- Verify alert is enabled
- Check notification settings
- Confirm email/Telegram setup
- Test alert with low threshold

### Chart Issues

- Try different browser
- Disable ad blockers
- Check console for errors
- Report bug if persistent

## Support

Need help?

- **Documentation**: docs.stablecoin-monitor.com
- **Email**: support@stablecoin-monitor.com
- **Discord**: discord.gg/stablecoin-monitor
- **GitHub**: github.com/stablecoin-monitor/issues
